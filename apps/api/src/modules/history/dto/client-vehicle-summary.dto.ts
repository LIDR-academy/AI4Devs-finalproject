import { WorkOrderStatus } from '@prisma/client';

export class ClientVehicleSummaryDto {
  id!: string;
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
  lastVisitAt!: Date | null;
  lastVisitStatus!: WorkOrderStatus | null;
}
