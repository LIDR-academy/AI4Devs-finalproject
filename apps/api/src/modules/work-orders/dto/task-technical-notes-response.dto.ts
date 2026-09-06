import { WorkOrderStatus, WorkOrderTaskStatus } from '@prisma/client';

export class TaskTechnicalNotesResponseDto {
  id!: string;
  description!: string;
  status!: WorkOrderTaskStatus;
  diagnosis!: string | null;
  repairPerformed!: string | null;
  partsUsed!: string | null;
  additionalNotes!: string | null;
}

export class VisitNotesResponseDto {
  id!: string;
  status!: WorkOrderStatus;
  visitDiagnosis!: string | null;
  visitRepairSummary!: string | null;
  visitPartsUsed!: string | null;
  visitAdditionalNotes!: string | null;
}
