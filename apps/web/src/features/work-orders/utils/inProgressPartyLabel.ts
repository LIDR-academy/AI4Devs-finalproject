import type { InProgressWorkOrderItem } from '../types/work-order.types';

export function getInProgressPartyLabel(item: InProgressWorkOrderItem): string {
  if (item.owner?.fullName) {
    return item.owner.fullName;
  }
  if (item.broughtByName) {
    return `Traído por ${item.broughtByName}`;
  }
  return 'Sin propietario';
}
