import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Client,
  Prisma,
  Vehicle,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderTask,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateTotalAmount } from '../work-orders/utils/work-order-totals';
import { DeliverWorkOrderResponseDto } from './dto/deliver-work-order-response.dto';
import { DeliveryReadyDetailDto } from './dto/delivery-ready-detail.dto';
import { DeliveryReadyItemDto } from './dto/delivery-ready-item.dto';
import { DeliveryReadyListResponseDto } from './dto/delivery-ready-list-response.dto';
import { DeliveryReadyQueryDto } from './dto/delivery-ready-query.dto';
import { formatElapsedLabel } from './utils/elapsed-label';
import { formatPhoneDisplay } from './utils/owner-phone-display';

type ReadyWorkOrder = WorkOrder & {
  vehicle: Vehicle;
  ownerClient: Client;
  tasks: WorkOrderTask[];
};

const READY_INCLUDE = {
  vehicle: true,
  ownerClient: true,
  tasks: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
} satisfies Prisma.WorkOrderInclude;

// V2 D1: PATCH /api/delivery/ready/:workOrderId/mark-contacted
// Transitions LISTA_PARA_ENTREGA → OWNER_CONTACTED
// Sets ownerContactedAt, ownerContactedById

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async listReady(
    query: DeliveryReadyQueryDto,
  ): Promise<DeliveryReadyListResponseDto> {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { status: WorkOrderStatus.LISTA_PARA_ENTREGA },
      include: READY_INCLUDE,
      orderBy: { checkedInAt: 'asc' },
    });

    const items = this.sortItems(
      workOrders.map((workOrder) => this.toReadyItem(workOrder)),
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

    if (!workOrder || workOrder.status !== WorkOrderStatus.LISTA_PARA_ENTREGA) {
      throw new NotFoundException('Work order is not ready for delivery');
    }

    return this.toReadyDetail(workOrder);
  }

  async markDelivered(
    workOrderId: string,
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

    if (workOrder.status !== WorkOrderStatus.LISTA_PARA_ENTREGA) {
      throw new ConflictException('Work order is not ready for delivery');
    }

    const deliveredAt = new Date();

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt,
      },
      select: {
        id: true,
        status: true,
        deliveredAt: true,
      },
    });

    return {
      workOrderId: updated.id,
      status: updated.status,
      deliveredAt: updated.deliveredAt!,
    };
  }

  private toReadyItem(workOrder: ReadyWorkOrder): DeliveryReadyItemDto {
    return {
      workOrderId: workOrder.id,
      licensePlate: workOrder.vehicle.licensePlate,
      vehicleLabel: `${workOrder.vehicle.brand} ${workOrder.vehicle.model} ${workOrder.vehicle.year}`,
      ownerName: workOrder.ownerClient.fullName,
      ownerPhone: workOrder.ownerClient.phone,
      ownerPhoneDisplay: formatPhoneDisplay(workOrder.ownerClient.phone),
      ownerEmail: workOrder.ownerClient.email,
      totalAmount: calculateTotalAmount(workOrder.tasks),
      checkedInAt: workOrder.checkedInAt,
      elapsedLabel: formatElapsedLabel(workOrder.checkedInAt),
    };
  }

  private toReadyDetail(workOrder: ReadyWorkOrder): DeliveryReadyDetailDto {
    const item = this.toReadyItem(workOrder);

    return {
      ...item,
      status: workOrder.status,
      entryReason: workOrder.entryReason,
      mileage: workOrder.mileage,
      vehicle: {
        licensePlate: workOrder.vehicle.licensePlate,
        brand: workOrder.vehicle.brand,
        model: workOrder.vehicle.model,
        year: workOrder.vehicle.year,
      },
      owner: {
        fullName: workOrder.ownerClient.fullName,
        nationalId: workOrder.ownerClient.nationalId,
        phone: workOrder.ownerClient.phone,
        email: workOrder.ownerClient.email,
      },
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
