import { z } from 'zod';

const noteField = z
  .string()
  .max(5000, 'Máximo 5000 caracteres');

export const taskTechnicalNotesSchema = z.object({
  diagnosis: noteField,
  repairPerformed: noteField,
  partsUsed: noteField,
  additionalNotes: noteField,
});

export const visitNotesSchema = z.object({
  visitDiagnosis: noteField,
  visitRepairSummary: noteField,
  visitPartsUsed: noteField,
  visitAdditionalNotes: noteField,
});

export type TaskTechnicalNotesFormValues = z.infer<
  typeof taskTechnicalNotesSchema
>;

export type VisitNotesFormValues = z.infer<typeof visitNotesSchema>;

export function normalizeNoteValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function toTaskTechnicalNotesRequest(
  values: TaskTechnicalNotesFormValues,
): {
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
} {
  return {
    diagnosis: normalizeNoteValue(values.diagnosis),
    repairPerformed: normalizeNoteValue(values.repairPerformed),
    partsUsed: normalizeNoteValue(values.partsUsed),
    additionalNotes: normalizeNoteValue(values.additionalNotes),
  };
}

export function toVisitNotesRequest(values: VisitNotesFormValues): {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
} {
  return {
    visitDiagnosis: normalizeNoteValue(values.visitDiagnosis),
    visitRepairSummary: normalizeNoteValue(values.visitRepairSummary),
    visitPartsUsed: normalizeNoteValue(values.visitPartsUsed),
    visitAdditionalNotes: normalizeNoteValue(values.visitAdditionalNotes),
  };
}

export function taskToFormValues(task: {
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}): TaskTechnicalNotesFormValues {
  return {
    diagnosis: task.diagnosis ?? '',
    repairPerformed: task.repairPerformed ?? '',
    partsUsed: task.partsUsed ?? '',
    additionalNotes: task.additionalNotes ?? '',
  };
}

export function workOrderToVisitFormValues(
  workOrder: {
    visitDiagnosis?: string | null;
    visitRepairSummary?: string | null;
    visitPartsUsed?: string | null;
    visitAdditionalNotes?: string | null;
  },
): VisitNotesFormValues {
  return {
    visitDiagnosis: workOrder.visitDiagnosis ?? '',
    visitRepairSummary: workOrder.visitRepairSummary ?? '',
    visitPartsUsed: workOrder.visitPartsUsed ?? '',
    visitAdditionalNotes: workOrder.visitAdditionalNotes ?? '',
  };
}
