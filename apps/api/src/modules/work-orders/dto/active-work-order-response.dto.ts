import { WorkOrderStatus } from '@prisma/client';

export class ActiveWorkOrderSummaryDto {
  id!: string;
  status!: WorkOrderStatus;
  checkedInAt!: Date;
}

export class ActiveWorkOrderResponseDto {
  activeWorkOrder!: ActiveWorkOrderSummaryDto | null;
}
