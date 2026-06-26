import type { VehicleVisit, VisitNotes } from '../types/history.types';

export const EMPTY_VISIT_NOTES: VisitNotes = {
  visitDiagnosis: null,
  visitRepairSummary: null,
  visitPartsUsed: null,
  visitAdditionalNotes: null,
};

export function normalizeHistoryVisit(
  visit: Partial<VehicleVisit> & Pick<VehicleVisit, 'workOrderId' | 'checkedInAt' | 'status' | 'entryReason' | 'ownerAtVisit'>,
): VehicleVisit {
  return {
    workOrderId: visit.workOrderId,
    checkedInAt: visit.checkedInAt,
    deliveredAt: visit.deliveredAt ?? null,
    status: visit.status,
    statusLabel: visit.statusLabel ?? visit.status,
    entryReason: visit.entryReason,
    mileage: visit.mileage ?? 0,
    totalAmount: visit.totalAmount ?? 0,
    ownerAtVisit: {
      id: visit.ownerAtVisit.id ?? '',
      fullName: visit.ownerAtVisit.fullName,
      nationalId: visit.ownerAtVisit.nationalId,
    },
    visitNotes: visit.visitNotes ?? EMPTY_VISIT_NOTES,
    tasks: (visit.tasks ?? []).map((task) => ({
      id: task.id ?? '',
      description: task.description,
      status: task.status,
      cost: task.cost ?? null,
      costNotes: task.costNotes ?? null,
      diagnosis: task.diagnosis ?? null,
      repairPerformed: task.repairPerformed ?? null,
      partsUsed: task.partsUsed ?? null,
      additionalNotes: task.additionalNotes ?? null,
    })),
  };
}
