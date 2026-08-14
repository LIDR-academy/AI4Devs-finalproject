import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UserRole,
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkOrderIntakeMode } from './constants/intake-mode';
import {
  ACTIVE_WORK_ORDER_STATUSES,
  MILEAGE_EDITABLE_PRE_DELIVERY_STATUSES,
} from './constants/work-order-status';
import { ActiveWorkOrderResponseDto } from './dto/active-work-order-response.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { InProgressWorkOrdersQueryDto } from './dto/in-progress-work-orders-query.dto';
import { InProgressWorkOrdersResponseDto } from './dto/in-progress-work-orders-response.dto';
import { LinkWorkOrderOwnerDto } from './dto/link-work-order-owner.dto';
import { LinkWorkOrderOwnerResponseDto } from './dto/link-work-order-owner-response.dto';
import { MechanicSummaryDto } from './dto/mechanic-summary.dto';
import {
  UpdateWorkOrderMileageDto,
  UpdateWorkOrderMileageResponseDto,
} from './dto/update-work-order-mileage.dto';
import { WorkOrderDetailResponseDto } from './dto/work-order-detail-response.dto';
import {
  toWorkOrderDetailResponse,
  WORK_ORDER_DETAIL_INCLUDE,
  WorkOrderWithRelations,
} from './mappers/work-order.mapper';
import { assignableMechanicWhere } from './utils/assignable-mechanic';
import {
  deriveIntakeMode,
  normalizeBroughtByName,
  normalizeBroughtByPhone,
} from './utils/intake-mode';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

const ACTIVE_OWNERSHIP_INCLUDE = {
  ownerships: {
    where: { validTo: null },
    take: 1,
  },
} as const;

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveMechanics(): Promise<MechanicSummaryDto[]> {
    const mechanics = await this.prisma.user.findMany({
      where: assignableMechanicWhere(),
      select: {
        id: true,
        fullName: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return mechanics;
  }

  async findActiveByVehicle(
    vehicleId: string,
  ): Promise<ActiveWorkOrderResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const activeWorkOrder = await this.prisma.workOrder.findFirst({
      where: {
        vehicleId,
        status: { in: ACTIVE_WORK_ORDER_STATUSES },
      },
      select: {
        id: true,
        status: true,
        checkedInAt: true,
      },
    });

    return { activeWorkOrder };
  }

  async findInProgress(
    user: AuthenticatedUser,
    query: InProgressWorkOrdersQueryDto,
  ): Promise<InProgressWorkOrdersResponseDto> {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const where = {
      status: { in: ACTIVE_WORK_ORDER_STATUSES },
      ...(user.role === UserRole.MECHANIC
        ? { assignedMechanicId: user.userId }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        select: {
          id: true,
          status: true,
          entryReason: true,
          checkedInAt: true,
          updatedAt: true,
          broughtByName: true,
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              brand: true,
              model: true,
            },
          },
          ownerClient: {
            select: {
              fullName: true,
              nationalId: true,
            },
          },
          assignedMechanic: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        status: row.status,
        entryReason: row.entryReason,
        checkedInAt: row.checkedInAt,
        updatedAt: row.updatedAt,
        vehicle: {
          id: row.vehicle.id,
          licensePlate: row.vehicle.licensePlate,
          brand: row.vehicle.brand,
          model: row.vehicle.model,
        },
        owner: row.ownerClient
          ? {
              fullName: row.ownerClient.fullName,
              nationalId: row.ownerClient.nationalId,
            }
          : null,
        broughtByName: row.broughtByName,
        intakeMode: deriveIntakeMode(row.broughtByName),
        assignedMechanic: row.assignedMechanic
          ? {
              id: row.assignedMechanic.id,
              fullName: row.assignedMechanic.fullName,
              role: row.assignedMechanic.role,
            }
          : null,
      })),
      total,
      limit,
      offset,
    };
  }

  async findById(id: string): Promise<WorkOrderDetailResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: WORK_ORDER_DETAIL_INCLUDE,
    });

    if (!workOrder) {
      throw new NotFoundException('Not Found');
    }

    return toWorkOrderDetailResponse(workOrder as WorkOrderWithRelations);
  }

  async create(
    dto: CreateWorkOrderDto,
    createdById: string,
  ): Promise<WorkOrderDetailResponseDto> {
    const workOrderId = await this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: dto.vehicleId },
        include: ACTIVE_OWNERSHIP_INCLUDE,
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      const mode = dto.intakeMode ?? WorkOrderIntakeMode.OWNER;
      const broughtByName = normalizeBroughtByName(dto.broughtByName);
      const broughtByPhone = normalizeBroughtByPhone(dto.broughtByPhone);

      let ownerClientId: string | null = null;
      let persistedBroughtByName: string | null = null;
      let persistedBroughtByPhone: string | null = null;

      if (mode === WorkOrderIntakeMode.THIRD_PARTY) {
        if (!broughtByName || broughtByName.length < 2) {
          throw new BadRequestException(
            'broughtByName is required for THIRD_PARTY intake',
          );
        }
        ownerClientId = null;
        persistedBroughtByName = broughtByName;
        persistedBroughtByPhone = broughtByPhone;
      } else {
        if (broughtByName !== null || broughtByPhone !== null) {
          throw new BadRequestException(
            'broughtBy fields are only valid for THIRD_PARTY intake',
          );
        }

        const activeOwnership = vehicle.ownerships[0];
        if (!activeOwnership) {
          throw new BadRequestException('Vehicle has no active owner');
        }
        ownerClientId = activeOwnership.clientId;
      }

      const existingActive = await tx.workOrder.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          status: { in: ACTIVE_WORK_ORDER_STATUSES },
        },
      });

      if (existingActive) {
        this.throwActiveWorkOrderConflict(existingActive.id);
      }

      if (dto.assignedMechanicId) {
        const mechanic = await tx.user.findFirst({
          where: {
            id: dto.assignedMechanicId,
            ...assignableMechanicWhere(),
          },
        });

        if (!mechanic) {
          throw new BadRequestException('Invalid assigned mechanic');
        }
      }

      const workOrder = await tx.workOrder.create({
        data: {
          vehicleId: dto.vehicleId,
          ownerClientId,
          entryReason: dto.entryReason.trim(),
          mileage: dto.mileage ?? null,
          assignedMechanicId: dto.assignedMechanicId ?? null,
          createdById,
          status: WorkOrderStatus.EN_PROCESO,
          broughtByName: persistedBroughtByName,
          broughtByPhone: persistedBroughtByPhone,
        },
      });

      await tx.workOrderTask.createMany({
        data: dto.initialTasks.map((task, index) => ({
          workOrderId: workOrder.id,
          description: task.description.trim(),
          status: WorkOrderTaskStatus.PENDING,
          sortOrder: index,
        })),
      });

      return workOrder.id;
    });

    return this.findById(workOrderId);
  }

  async linkOwner(
    workOrderId: string,
    dto: LinkWorkOrderOwnerDto,
  ): Promise<LinkWorkOrderOwnerResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        select: {
          id: true,
          vehicleId: true,
          ownerClientId: true,
          broughtByName: true,
          broughtByPhone: true,
        },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      if (workOrder.ownerClientId !== null) {
        throw new ConflictException('Owner already linked');
      }

      const client = await tx.client.findUnique({
        where: { id: dto.clientId },
        select: { id: true, fullName: true, nationalId: true },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      const activeOwnership = await tx.vehicleOwnership.findFirst({
        where: {
          vehicleId: workOrder.vehicleId,
          validTo: null,
        },
        select: { clientId: true },
      });

      let vehicleOwnerUnchanged = false;

      if (!activeOwnership) {
        await tx.vehicleOwnership.create({
          data: {
            vehicleId: workOrder.vehicleId,
            clientId: client.id,
            validFrom: new Date(),
            validTo: null,
          },
        });
      } else if (activeOwnership.clientId !== client.id) {
        vehicleOwnerUnchanged = true;
      }

      const updated = await tx.workOrder.update({
        where: { id: workOrderId },
        data: { ownerClientId: client.id },
        select: {
          id: true,
          ownerClientId: true,
          broughtByName: true,
          broughtByPhone: true,
          updatedAt: true,
        },
      });

      return {
        id: updated.id,
        ownerClientId: updated.ownerClientId!,
        owner: {
          fullName: client.fullName,
          nationalId: client.nationalId,
        },
        broughtByName: updated.broughtByName,
        broughtByPhone: updated.broughtByPhone,
        vehicleOwnerUnchanged,
        updatedAt: updated.updatedAt,
      };
    });
  }

  async updateMileage(
    id: string,
    dto: UpdateWorkOrderMileageDto,
    actor: { userId: string; role: UserRole },
  ): Promise<UpdateWorkOrderMileageResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!workOrder) {
      throw new NotFoundException('Not Found');
    }

    if (workOrder.status === WorkOrderStatus.ENTREGADA) {
      if (actor.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Only administrators can update mileage on delivered work orders',
        );
      }
    } else if (
      !MILEAGE_EDITABLE_PRE_DELIVERY_STATUSES.includes(workOrder.status)
    ) {
      throw new BadRequestException(
        'Work order mileage cannot be updated in its current status',
      );
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { mileage: dto.mileage },
      select: {
        id: true,
        mileage: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  private throwActiveWorkOrderConflict(activeWorkOrderId: string): never {
    throw new ConflictException({
      message: 'Vehicle already has an active work order',
      error: 'Conflict',
      activeWorkOrderId,
    });
  }
}
