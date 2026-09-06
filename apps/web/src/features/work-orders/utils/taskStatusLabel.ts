import type { WorkOrderTaskStatus } from '../types/work-order.types';

const TASK_STATUS_LABELS: Record<WorkOrderTaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
};

export function getTaskStatusLabel(status: WorkOrderTaskStatus): string {
  return TASK_STATUS_LABELS[status];
}
