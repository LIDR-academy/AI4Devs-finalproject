import type { WorkOrderTaskStatus } from '../types/work-order.types';
import { getTaskStatusLabel } from '../utils/taskStatusLabel';

interface TaskStatusBadgeProps {
  status: WorkOrderTaskStatus;
}

const STATUS_CLASSES: Record<WorkOrderTaskStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {getTaskStatusLabel(status)}
    </span>
  );
}
