import { UserRole, WorkOrderStatus, WorkOrderTaskStatus } from '@prisma/client';

export class WorkOrderTaskResponseDto {
  id!: string;
  description!: string;
  status!: WorkOrderTaskStatus;
  cost!: number | null;
  costNotes!: string | null;
  diagnosis!: string | null;
  repairPerformed!: string | null;
  partsUsed!: string | null;
  additionalNotes!: string | null;
  sortOrder!: number;
  completedAt!: Date | null;
}

export class WorkOrderVehicleSummaryDto {
  licensePlate!: string;
  brand!: string;
  model!: string;
}

export class WorkOrderOwnerSummaryDto {
  fullName!: string;
  nationalId!: string;
}

export class AssignedMechanicSummaryDto {
  id!: string;
  fullName!: string;
  role!: UserRole;
}

export class WorkOrderDetailResponseDto {
  id!: string;
  vehicleId!: string;
  ownerClientId!: string | null;
  status!: WorkOrderStatus;
  entryReason!: string;
  mileage!: number | null;
  assignedMechanicId!: string | null;
  assignedMechanic!: AssignedMechanicSummaryDto | null;
  checkedInAt!: Date;
  updatedAt!: Date;
  createdById!: string;
  totalAmount!: number;
  visitDiagnosis!: string | null;
  visitRepairSummary!: string | null;
  visitPartsUsed!: string | null;
  visitAdditionalNotes!: string | null;
  broughtByName!: string | null;
  broughtByPhone!: string | null;
  intakeMode!: 'OWNER' | 'THIRD_PARTY';
  tasks!: WorkOrderTaskResponseDto[];
  vehicle!: WorkOrderVehicleSummaryDto;
  owner!: WorkOrderOwnerSummaryDto | null;
}
