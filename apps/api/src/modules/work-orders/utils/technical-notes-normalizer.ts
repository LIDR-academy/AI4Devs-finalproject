import { Prisma } from '@prisma/client';
import { UpdateTaskTechnicalNotesDto } from '../dto/update-task-technical-notes.dto';
import { UpdateVisitNotesDto } from '../dto/update-visit-notes.dto';

export const MAX_TECHNICAL_FIELD_LENGTH = 5000;

export function normalizeTechnicalField(value?: string | null): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
}

export function buildTaskTechnicalNotesUpdate(
  dto: UpdateTaskTechnicalNotesDto,
): Prisma.WorkOrderTaskUpdateInput {
  const data: Prisma.WorkOrderTaskUpdateInput = {};

  if (dto.diagnosis !== undefined) {
    data.diagnosis = normalizeTechnicalField(dto.diagnosis);
  }
  if (dto.repairPerformed !== undefined) {
    data.repairPerformed = normalizeTechnicalField(dto.repairPerformed);
  }
  if (dto.partsUsed !== undefined) {
    data.partsUsed = normalizeTechnicalField(dto.partsUsed);
  }
  if (dto.additionalNotes !== undefined) {
    data.additionalNotes = normalizeTechnicalField(dto.additionalNotes);
  }

  return data;
}

export function buildVisitNotesUpdate(
  dto: UpdateVisitNotesDto,
): Prisma.WorkOrderUpdateInput {
  const data: Prisma.WorkOrderUpdateInput = {};

  if (dto.visitDiagnosis !== undefined) {
    data.visitDiagnosis = normalizeTechnicalField(dto.visitDiagnosis);
  }
  if (dto.visitRepairSummary !== undefined) {
    data.visitRepairSummary = normalizeTechnicalField(dto.visitRepairSummary);
  }
  if (dto.visitPartsUsed !== undefined) {
    data.visitPartsUsed = normalizeTechnicalField(dto.visitPartsUsed);
  }
  if (dto.visitAdditionalNotes !== undefined) {
    data.visitAdditionalNotes = normalizeTechnicalField(dto.visitAdditionalNotes);
  }

  return data;
}
