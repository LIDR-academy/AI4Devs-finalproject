'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { OptedOutReminderItem } from '../types/reminders.types';
import { formatReminderDateTime } from '../utils/formatReminderDate';

type OptedOutRemindersTableProps = {
  items: OptedOutReminderItem[];
  onOptIn: (vehicleId: string) => void;
  isOptInPending: boolean;
  pendingVehicleId: string | null;
};

export function OptedOutRemindersTable({
  items,
  onOptIn,
  isOptInPending,
  pendingVehicleId,
}: OptedOutRemindersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Placa
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Modelo
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Propietario
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Excluido el
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Excluido por
            </th>
            <th className="px-4 py-2 text-right font-medium text-slate-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {items.map((item) => {
            const pending =
              isOptInPending && pendingVehicleId === item.vehicleId;
            return (
              <tr key={item.vehicleId} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900">
                  <Link
                    href={`/vehicles/${item.vehicleId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {item.licensePlate}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {item.vehicleLabel}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {item.ownerName ?? '—'}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {formatReminderDateTime(item.excludedAt)}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {item.excludedBy?.fullName ?? '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isOptInPending}
                    onClick={() => onOptIn(item.vehicleId)}
                  >
                    {pending ? 'Reactivando...' : 'Reactivar'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
