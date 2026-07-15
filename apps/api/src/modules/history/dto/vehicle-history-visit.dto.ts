import { WorkOrderStatus, WorkOrderTaskStatus } from '@prisma/client';

export class OwnerAtVisitDto {
  id!: string;
  fullName!: string;
  nationalId!: string;
}

export class VisitNotesDto {
  visitDiagnosis!: string | null;
  visitRepairSummary!: string | null;
  visitPartsUsed!: string | null;
  visitAdditionalNotes!: string | null;
}

export class HistoryTaskDto {
  id!: string;
  description!: string;
  status!: WorkOrderTaskStatus;
  cost!: number | null;
  costNotes!: string | null;
  diagnosis!: string | null;
  repairPerformed!: string | null;
  partsUsed!: string | null;
  additionalNotes!: string | null;
}

export class VehicleHistoryVisitDto {
  workOrderId!: string;
  checkedInAt!: Date;
  deliveredAt!: Date | null;
  status!: WorkOrderStatus;
  statusLabel!: string;
  entryReason!: string;
  mileage!: number | null;
  totalAmount!: number;
  ownerAtVisit!: OwnerAtVisitDto | null;
  broughtByName!: string | null;
  broughtByPhone!: string | null;
  visitNotes!: VisitNotesDto;
  tasks!: HistoryTaskDto[];
}
