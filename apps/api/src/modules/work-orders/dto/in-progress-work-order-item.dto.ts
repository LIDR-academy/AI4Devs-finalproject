import { UserRole, WorkOrderStatus } from '@prisma/client';
import { WorkOrderIntakeMode } from '../constants/intake-mode';

export class InProgressWorkOrderVehicleDto {
  id!: string;
  licensePlate!: string;
  brand!: string;
  model!: string;
}

export class InProgressWorkOrderOwnerDto {
  fullName!: string;
  nationalId!: string;
}

export class InProgressWorkOrderMechanicDto {
  id!: string;
  fullName!: string;
  role!: UserRole;
}

export class InProgressWorkOrderItemDto {
  id!: string;
  status!: WorkOrderStatus;
  entryReason!: string;
  checkedInAt!: Date;
  updatedAt!: Date;
  vehicle!: InProgressWorkOrderVehicleDto;
  owner!: InProgressWorkOrderOwnerDto | null;
  broughtByName!: string | null;
  intakeMode!: WorkOrderIntakeMode;
  assignedMechanic!: InProgressWorkOrderMechanicDto | null;
}
