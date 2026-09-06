import { WorkOrderStatus } from '@prisma/client';
import { WorkOrderTaskResponseDto } from './work-order-detail-response.dto';

export class UpdateTaskWorkOrderSummaryDto {
  id!: string;
  status!: WorkOrderStatus;
  totalAmount!: number;
  updatedAt!: Date;
}

export class UpdateTaskResponseDto {
  task!: WorkOrderTaskResponseDto;
  workOrder!: UpdateTaskWorkOrderSummaryDto;
}
