import { WorkOrderStatus } from '@prisma/client';

export class DeliverWorkOrderResponseDto {
  workOrderId!: string;
  status!: WorkOrderStatus;
  deliveredAt!: Date;
  mileage!: number | null;
}
