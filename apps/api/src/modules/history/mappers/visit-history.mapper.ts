import { Client, WorkOrder, WorkOrderTask } from '@prisma/client';
import { calculateTotalAmount } from '../../work-orders/utils/work-order-totals';
import {
  HistoryTaskDto,
  VehicleHistoryVisitDto,
} from '../dto/vehicle-history-visit.dto';
import { toStatusLabel } from './work-order-status-label';

export type WorkOrderWithHistoryIncludes = WorkOrder & {
  ownerClient: Client | null;
  tasks: WorkOrderTask[];
};

export function mapHistoryTask(task: WorkOrderTask): HistoryTaskDto {
  return {
    id: task.id,
    description: task.description,
    status: task.status,
    cost: task.cost !== null ? Number(task.cost) : null,
    costNotes: task.costNotes,
    diagnosis: task.diagnosis,
    repairPerformed: task.repairPerformed,
    partsUsed: task.partsUsed,
    additionalNotes: task.additionalNotes,
  };
}

export function mapWorkOrderToVisit(
  workOrder: WorkOrderWithHistoryIncludes,
): VehicleHistoryVisitDto {
  return {
    workOrderId: workOrder.id,
    checkedInAt: workOrder.checkedInAt,
    deliveredAt: workOrder.deliveredAt,
    status: workOrder.status,
    statusLabel: toStatusLabel(workOrder.status),
    entryReason: workOrder.entryReason,
    mileage: workOrder.mileage,
    totalAmount: calculateTotalAmount(workOrder.tasks),
    ownerAtVisit: workOrder.ownerClient
      ? {
          id: workOrder.ownerClient.id,
          fullName: workOrder.ownerClient.fullName,
          nationalId: workOrder.ownerClient.nationalId,
        }
      : null,
    broughtByName: workOrder.broughtByName,
    broughtByPhone: workOrder.broughtByPhone,
    visitNotes: {
      visitDiagnosis: workOrder.visitDiagnosis,
      visitRepairSummary: workOrder.visitRepairSummary,
      visitPartsUsed: workOrder.visitPartsUsed,
      visitAdditionalNotes: workOrder.visitAdditionalNotes,
    },
    tasks: workOrder.tasks.map(mapHistoryTask),
  };
}
