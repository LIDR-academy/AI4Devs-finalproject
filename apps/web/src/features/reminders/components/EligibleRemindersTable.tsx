'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/Button';
import type { EligibleReminderItem } from '../types/reminders.types';
import { formatReminderDate } from '../utils/formatReminderDate';

type EligibleRemindersTableProps = {
  items: EligibleReminderItem[];
  selectedIds: Set<string>;
  onToggleRow: (vehicleId: string) => void;
  onToggleAllVisible: () => void;
  onOptOut: (item: EligibleReminderItem) => void;
};

export function EligibleRemindersTable({
  items,
  selectedIds,
  onToggleRow,
  onToggleAllVisible,
  onOptOut,
}: EligibleRemindersTableProps) {
  const allVisibleSelected =
    items.length > 0 && items.every((item) => selectedIds.has(item.vehicleId));
  const someVisibleSelected =
    items.some((item) => selectedIds.has(item.vehicleId)) &&
    !allVisibleSelected;
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Selección de la lista visible
      </p>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left">
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAllVisible}
                aria-label="Seleccionar todos los visibles"
                className="h-4 w-4 rounded border-slate-300"
              />
            </th>
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
              Correo
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Última visita
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Días sin visita
            </th>
            <th className="px-4 py-2 text-left font-medium text-slate-700">
              Último recordatorio
            </th>
            <th className="px-4 py-2 text-right font-medium text-slate-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {items.map((item) => (
            <tr key={item.vehicleId} className="hover:bg-slate-50">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.vehicleId)}
                  onChange={() => onToggleRow(item.vehicleId)}
                  aria-label={`Seleccionar ${item.licensePlate}`}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </td>
              <td className="px-4 py-2 font-medium text-slate-900">
                <Link
                  href={`/vehicles/${item.vehicleId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {item.licensePlate}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-700">{item.vehicleLabel}</td>
              <td className="px-4 py-2 text-slate-700">{item.ownerName}</td>
              <td className="px-4 py-2 text-slate-700">
                {item.canEmail ? (
                  item.ownerEmail
                ) : (
                  <span className="text-amber-700">Sin correo</span>
                )}
              </td>
              <td className="px-4 py-2 text-slate-700">
                {formatReminderDate(item.lastVisitAt)}
              </td>
              <td className="px-4 py-2 text-slate-700">{item.daysSinceVisit}</td>
              <td className="px-4 py-2 text-slate-700">
                {formatReminderDate(item.lastReminderSentAt)}
              </td>
              <td className="px-4 py-2 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-700 hover:bg-red-50"
                  onClick={() => onOptOut(item)}
                >
                  No volver a recordar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
