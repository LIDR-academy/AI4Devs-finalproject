import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MaintenanceReminderEmailService } from '../notifications/maintenance-reminder-email.service';
import { ACTIVE_WORK_ORDER_STATUSES } from '../work-orders/constants/work-order-status';
import {
  DEFAULT_ELIGIBLE_LIMIT,
  resolveReminderInactiveDays,
} from './constants/reminder-inactive-days';
import { EligibleReminderItemDto } from './dto/eligible-reminder-item.dto';
import { EligibleRemindersQueryDto } from './dto/eligible-reminders-query.dto';
import { EligibleRemindersResponseDto } from './dto/eligible-reminders-response.dto';
import {
  OptedOutRemindersResponseDto,
  ReminderOptResponseDto,
} from './dto/opted-out-reminders-response.dto';
import { SendRemindersDto } from './dto/send-reminders.dto';
import {
  ReminderBatchEmailStatus,
  SendReminderResultItemDto,
  SendRemindersResponseDto,
} from './dto/send-reminders-response.dto';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class RemindersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly maintenanceReminderEmailService: MaintenanceReminderEmailService,
  ) {}

  async listEligible(
    query: EligibleRemindersQueryDto,
  ): Promise<EligibleRemindersResponseDto> {
    const limit = query.limit ?? DEFAULT_ELIGIBLE_LIMIT;
    const offset = query.offset ?? 0;
    const thresholdDays = resolveReminderInactiveDays(
      this.configService.get<string>('REMINDER_INACTIVE_DAYS'),
      query.days,
    );

    const allItems = await this.collectEligibleItems(thresholdDays, query.q);
    const total = allItems.length;
    const items = allItems.slice(offset, offset + limit);

    return { items, total, limit, offset, thresholdDays };
  }

  async listOptedOut(): Promise<OptedOutRemindersResponseDto> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { excludeFromReminders: true },
      orderBy: [{ excludedAt: 'desc' }, { id: 'asc' }],
      include: {
        excludedBy: { select: { id: true, fullName: true } },
        ownerships: {
          where: { validTo: null },
          take: 1,
          include: { client: { select: { fullName: true } } },
        },
      },
    });

    const items = vehicles.map((vehicle) => {
      const owner = vehicle.ownerships[0]?.client ?? null;
      return {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        ownerName: owner?.fullName ?? null,
        excludedAt: vehicle.excludedAt,
        excludedBy: vehicle.excludedBy
          ? {
              id: vehicle.excludedBy.id,
              fullName: vehicle.excludedBy.fullName,
            }
          : null,
      };
    });

    return { items, total: items.length };
  }

  async optOut(
    vehicleId: string,
    actorUserId: string,
  ): Promise<ReminderOptResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, excludeFromReminders: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (!vehicle.excludeFromReminders) {
      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          excludeFromReminders: true,
          excludedAt: new Date(),
          excludedById: actorUserId,
        },
      });
    }

    return { vehicleId, excludeFromReminders: true };
  }

  async optIn(vehicleId: string): Promise<ReminderOptResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        excludeFromReminders: false,
        excludedAt: null,
        excludedById: null,
      },
    });

    return { vehicleId, excludeFromReminders: false };
  }

  async sendReminders(
    dto: SendRemindersDto,
    actor: { userId: string; email: string },
  ): Promise<SendRemindersResponseDto> {
    if (!dto.vehicleIds || dto.vehicleIds.length === 0) {
      throw new BadRequestException('vehicleIds must not be empty');
    }

    const uniqueIds = Array.from(new Set(dto.vehicleIds));
    const thresholdDays = resolveReminderInactiveDays(
      this.configService.get<string>('REMINDER_INACTIVE_DAYS'),
    );
    const results: SendReminderResultItemDto[] = [];

    for (const vehicleId of uniqueIds) {
      const eligible = await this.findEligibleItemById(
        vehicleId,
        thresholdDays,
      );

      if (!eligible) {
        const plate = await this.lookupPlate(vehicleId);
        results.push({
          vehicleId,
          licensePlate: plate ?? vehicleId,
          emailStatus: 'skipped_not_eligible',
          warning: 'Vehicle is not eligible for a reminder',
        });
        continue;
      }

      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { brand: true, model: true, year: true, licensePlate: true },
      });
      if (!vehicle) {
        results.push({
          vehicleId,
          licensePlate: eligible.licensePlate,
          emailStatus: 'skipped_not_eligible',
          warning: 'Vehicle is not eligible for a reminder',
        });
        continue;
      }

      const sendResult = await this.maintenanceReminderEmailService.send({
        ownerFullName: eligible.ownerName,
        ownerEmail: eligible.ownerEmail,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        daysSinceVisit: eligible.daysSinceVisit,
        actorEmail: actor.email,
      });

      const emailStatus: ReminderBatchEmailStatus = sendResult.emailStatus;
      const warning = sendResult.warning;

      if (emailStatus === 'sent') {
        await this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: { lastReminderSentAt: new Date() },
        });
      }

      results.push({
        vehicleId,
        licensePlate: eligible.licensePlate,
        emailStatus,
        warning,
      });
    }

    return {
      results,
      summary: this.buildSummary(results, uniqueIds.length),
    };
  }

  private async collectEligibleItems(
    thresholdDays: number,
    q?: string,
  ): Promise<EligibleReminderItemDto[]> {
    const cutoff = new Date(Date.now() - thresholdDays * MS_PER_DAY);

    const lastDeliveries = await this.prisma.workOrder.groupBy({
      by: ['vehicleId'],
      where: {
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt: { not: null },
      },
      _max: { deliveredAt: true },
    });

    const staleDeliveries = lastDeliveries.filter(
      (row) =>
        row._max.deliveredAt !== null && row._max.deliveredAt <= cutoff,
    );

    if (staleDeliveries.length === 0) {
      return [];
    }

    const candidateIds = staleDeliveries.map((row) => row.vehicleId);
    const lastVisitByVehicle = new Map(
      staleDeliveries.map((row) => [
        row.vehicleId,
        row._max.deliveredAt as Date,
      ]),
    );

    const activeWorkOrders = await this.prisma.workOrder.findMany({
      where: {
        vehicleId: { in: candidateIds },
        status: { in: ACTIVE_WORK_ORDER_STATUSES },
      },
      select: { vehicleId: true },
      distinct: ['vehicleId'],
    });
    const activeVehicleIds = new Set(
      activeWorkOrders.map((row) => row.vehicleId),
    );

    const eligibleCandidateIds = candidateIds.filter(
      (id) => !activeVehicleIds.has(id),
    );

    if (eligibleCandidateIds.length === 0) {
      return [];
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        id: { in: eligibleCandidateIds },
        excludeFromReminders: false,
      },
      include: {
        ownerships: {
          where: { validTo: null },
          take: 1,
          include: {
            client: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    const now = Date.now();
    const search = q?.trim().toLowerCase();

    const items: EligibleReminderItemDto[] = [];
    for (const vehicle of vehicles) {
      const ownership = vehicle.ownerships[0];
      if (!ownership?.client) {
        continue;
      }

      const client = ownership.client;
      if (
        search &&
        !vehicle.licensePlate.toLowerCase().includes(search) &&
        !client.fullName.toLowerCase().includes(search)
      ) {
        continue;
      }

      const lastVisitAt = lastVisitByVehicle.get(vehicle.id);
      if (!lastVisitAt) {
        continue;
      }

      const ownerEmail = client.email?.trim() ? client.email.trim() : null;
      items.push({
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        ownerName: client.fullName,
        ownerEmail,
        ownerClientId: client.id,
        lastVisitAt,
        daysSinceVisit: Math.floor(
          (now - lastVisitAt.getTime()) / MS_PER_DAY,
        ),
        lastReminderSentAt: vehicle.lastReminderSentAt,
        canEmail: Boolean(ownerEmail),
      });
    }

    items.sort((a, b) => {
      const byVisit = a.lastVisitAt.getTime() - b.lastVisitAt.getTime();
      if (byVisit !== 0) {
        return byVisit;
      }
      return a.vehicleId.localeCompare(b.vehicleId);
    });

    return items;
  }

  private async findEligibleItemById(
    vehicleId: string,
    thresholdDays: number,
  ): Promise<EligibleReminderItemDto | null> {
    const items = await this.collectEligibleItems(thresholdDays);
    return items.find((item) => item.vehicleId === vehicleId) ?? null;
  }

  private async lookupPlate(vehicleId: string): Promise<string | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { licensePlate: true },
    });
    return vehicle?.licensePlate ?? null;
  }

  private buildSummary(
    results: SendReminderResultItemDto[],
    requested: number,
  ) {
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    for (const result of results) {
      if (result.emailStatus === 'sent') {
        sent += 1;
      } else if (result.emailStatus === 'failed') {
        failed += 1;
      } else {
        skipped += 1;
      }
    }
    return { requested, sent, skipped, failed };
  }

}
