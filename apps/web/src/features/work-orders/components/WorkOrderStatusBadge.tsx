import type { WorkOrderStatus } from '../types/work-order.types';
import { getWorkOrderStatusLabel } from '../utils/workOrderStatusLabel';

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
}

const STATUS_CLASSES: Record<WorkOrderStatus, string> = {
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  LISTA_PARA_ENTREGA: 'bg-amber-100 text-amber-800',
  OWNER_CONTACTED: 'bg-purple-100 text-purple-800',
  ENTREGADA: 'bg-green-100 text-green-800',
};

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {getWorkOrderStatusLabel(status)}
    </span>
  );
}
