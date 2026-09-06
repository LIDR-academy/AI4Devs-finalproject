'use client';

import Link from 'next/link';
import type { InProgressWorkOrderItem } from '../types/work-order.types';
import { getInProgressPartyLabel } from '../utils/inProgressPartyLabel';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';

type InProgressWorkOrderRowProps = {
  item: InProgressWorkOrderItem;
  showMechanic?: boolean;
};

export function InProgressWorkOrderRow({
  item,
  showMechanic = true,
}: InProgressWorkOrderRowProps) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
        {item.vehicle.licensePlate}
      </td>
      <td className="px-4 py-3 text-slate-700">
        {item.vehicle.brand} {item.vehicle.model}
      </td>
      <td className="px-4 py-3 text-slate-700">{getInProgressPartyLabel(item)}</td>
      <td className="px-4 py-3">
        <WorkOrderStatusBadge status={item.status} />
      </td>
      {showMechanic && (
        <td className="px-4 py-3 text-slate-700">
          {item.assignedMechanic?.fullName ?? 'Sin asignar'}
        </td>
      )}
      <td className="px-4 py-3 text-right">
        <Link
          href={`/work-orders/${item.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
