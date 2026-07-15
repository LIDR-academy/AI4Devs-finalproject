import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Client,
  Prisma,
  User,
  Vehicle,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderTask,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateTotalAmount } from '../work-orders/utils/work-order-totals';
import { DeliverWorkOrderDto } from './dto/deliver-work-order.dto';
import { DeliverWorkOrderResponseDto } from './dto/deliver-work-order-response.dto';
import { DeliveryReadyDetailDto } from './dto/delivery-ready-detail.dto';
import { DeliveryReadyItemDto } from './dto/delivery-ready-item.dto';
import { DeliveryReadyListResponseDto } from './dto/delivery-ready-list-response.dto';
import { DeliveryReadyQueryDto } from './dto/delivery-ready-query.dto';
import { MarkContactedResponseDto } from './dto/mark-contacted-response.dto';
import { formatElapsedLabel } from './utils/elapsed-label';
import { formatPhoneDisplay } from './utils/owner-phone-display';

const DELIVERY_PANEL_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.LISTA_PARA_ENTREGA,
  WorkOrderStatus.OWNER_CONTACTED,
];

type ReadyWorkOrder = WorkOrder & {
  vehicle: Vehicle;
  ownerClient: Client | null;
  tasks: WorkOrderTask[];
  ownerContactedBy: Pick<User, 'id' | 'fullName'> | null;
};

const READY_INCLUDE = {
  vehicle: true,
  ownerClient: true,
  ownerContactedBy: {
    select: { id: true, fullName: true },
  },
  tasks: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
} satisfies Prisma.WorkOrderInclude;

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async listReady(
    query: DeliveryReadyQueryDto,
  ): Promise<DeliveryReadyListResponseDto> {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { status: { in: DELIVERY_PANEL_STATUSES } },
      include: READY_INCLUDE,
      orderBy: { checkedInAt: 'asc' },
    });

    const items = this.sortItems(
      workOrders.map((workOrder) =>
        this.toReadyItem(workOrder as ReadyWorkOrder),
      ),
      query,
    );

    return {
      items,
      total: items.length,
    };
  }

  async getReadyDetail(workOrderId: string): Promise<DeliveryReadyDetailDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: READY_INCLUDE,
    });

    if (
      !workOrder ||
      !DELIVERY_PANEL_STATUSES.includes(workOrder.status)
    ) {
      throw new NotFoundException('Work order is not ready for delivery');
    }

    return this.toReadyDetail(workOrder as ReadyWorkOrder);
  }

  async markContacted(
    workOrderId: string,
    actorUserId: string,
  ): Promise<MarkContactedResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.ownerClientId === null) {
      throw new ConflictException('Work order has no owner to contact');
    }

    if (workOrder.status === WorkOrderStatus.OWNER_CONTACTED) {
      throw new ConflictException('Owner already contacted');
    }

    if (workOrder.status !== WorkOrderStatus.LISTA_PARA_ENTREGA) {
      throw new ConflictException('Work order is not ready for contact');
    }

    const ownerContactedAt = new Date();

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.OWNER_CONTACTED,
        ownerContactedAt,
        ownerContactedById: actorUserId,
      },
      include: {
        ownerContactedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return {
      workOrderId: updated.id,
      status: updated.status,
      ownerContactedAt: updated.ownerContactedAt!,
      ownerContactedBy: {
        id: updated.ownerContactedBy!.id,
        fullName: updated.ownerContactedBy!.fullName,
      },
    };
  }

  async markDelivered(
    workOrderId: string,
    dto: DeliverWorkOrderDto = {},
  ): Promise<DeliverWorkOrderResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status === WorkOrderStatus.ENTREGADA) {
      throw new ConflictException('Work order is already delivered');
    }

    if (!DELIVERY_PANEL_STATUSES.includes(workOrder.status)) {
      throw new ConflictException('Work order is not ready for delivery');
    }

    const deliveredAt = new Date();
    const updateData: {
      status: WorkOrderStatus;
      deliveredAt: Date;
      mileage?: number;
    } = {
      status: WorkOrderStatus.ENTREGADA,
      deliveredAt,
    };

    if (dto.mileage !== undefined) {
      updateData.mileage = dto.mileage;
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: updateData,
      select: {
        id: true,
        status: true,
        deliveredAt: true,
        mileage: true,
      },
    });

    return {
      workOrderId: updated.id,
      status: updated.status,
      deliveredAt: updated.deliveredAt!,
      mileage: updated.mileage,
    };
  }

  private toReadyItem(workOrder: ReadyWorkOrder): DeliveryReadyItemDto {
    return {
      workOrderId: workOrder.id,
      licensePlate: workOrder.vehicle.licensePlate,
      vehicleLabel: `${workOrder.vehicle.brand} ${workOrder.vehicle.model} ${workOrder.vehicle.year}`,
      ownerName: workOrder.ownerClient?.fullName ?? null,
      ownerPhone: workOrder.ownerClient?.phone ?? null,
      ownerPhoneDisplay: formatPhoneDisplay(workOrder.ownerClient?.phone ?? null),
      ownerEmail: workOrder.ownerClient?.email ?? null,
      broughtByName: workOrder.broughtByName,
      broughtByPhone: workOrder.broughtByPhone,
      totalAmount: calculateTotalAmount(workOrder.tasks),
      checkedInAt: workOrder.checkedInAt,
      elapsedLabel: formatElapsedLabel(workOrder.checkedInAt),
      status: workOrder.status,
      ownerContactedAt: workOrder.ownerContactedAt,
      ownerContactedBy: workOrder.ownerContactedBy
        ? {
            id: workOrder.ownerContactedBy.id,
            fullName: workOrder.ownerContactedBy.fullName,
          }
        : null,
    };
  }

  private toReadyDetail(workOrder: ReadyWorkOrder): DeliveryReadyDetailDto {
    const item = this.toReadyItem(workOrder);

    return {
      ...item,
      status: workOrder.status,
      entryReason: workOrder.entryReason,
      mileage: workOrder.mileage,
      vehicleId: workOrder.vehicleId,
      vehicle: {
        licensePlate: workOrder.vehicle.licensePlate,
        brand: workOrder.vehicle.brand,
        model: workOrder.vehicle.model,
        year: workOrder.vehicle.year,
      },
      owner: workOrder.ownerClient
        ? {
            fullName: workOrder.ownerClient.fullName,
            nationalId: workOrder.ownerClient.nationalId,
            phone: workOrder.ownerClient.phone,
            email: workOrder.ownerClient.email,
          }
        : null,
      tasks: workOrder.tasks.map((task) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        cost: task.cost !== null ? Number(task.cost) : null,
        costNotes: task.costNotes,
      })),
    };
  }

  private sortItems(
    items: DeliveryReadyItemDto[],
    query: DeliveryReadyQueryDto,
  ): DeliveryReadyItemDto[] {
    const sort = query.sort ?? 'checkedInAt';
    const order = query.order ?? 'asc';
    const factor = order === 'asc' ? 1 : -1;

    return [...items].sort((left, right) => {
      if (sort === 'totalAmount') {
        return (left.totalAmount - right.totalAmount) * factor;
      }

      return (
        (left.checkedInAt.getTime() - right.checkedInAt.getTime()) * factor
      );
    });
  }
}
