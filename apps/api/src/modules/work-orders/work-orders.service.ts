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
import {
  ACTIVE_WORK_ORDER_STATUSES,
  MILEAGE_EDITABLE_PRE_DELIVERY_STATUSES,
} from './constants/work-order-status';
import { ActiveWorkOrderResponseDto } from './dto/active-work-order-response.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
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

      const activeOwnership = vehicle.ownerships[0];
      if (!activeOwnership) {
        throw new BadRequestException('Vehicle has no active owner');
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
          ownerClientId: activeOwnership.clientId,
          entryReason: dto.entryReason.trim(),
          mileage: dto.mileage ?? null,
          assignedMechanicId: dto.assignedMechanicId ?? null,
          createdById,
          status: WorkOrderStatus.EN_PROCESO,
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
