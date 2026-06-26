import type { WorkOrderTaskStatus } from '../types/work-order.types';

export function getAllowedNextStatuses(
  current: WorkOrderTaskStatus,
): WorkOrderTaskStatus[] {
  switch (current) {
    case 'PENDING':
      return ['IN_PROGRESS', 'COMPLETED'];
    case 'IN_PROGRESS':
      return ['COMPLETED'];
    case 'COMPLETED':
      return [];
    default:
      return [];
  }
}
