'use client';

import Link from 'next/link';
import { useEligibleReminders } from '../hooks/useEligibleReminders';

type RemindersDashboardWidgetProps = {
  limit?: number;
};

export function RemindersDashboardWidget({
  limit = 5,
}: RemindersDashboardWidgetProps) {
  const { data, isLoading, isError, refetch, isFetching } =
    useEligibleReminders({ limit, offset: 0 });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Recordatorios</h2>
        {data && data.total > 0 && (
          <Link
            href="/admin/reminders"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ver más
          </Link>
        )}
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-600">Cargando recordatorios…</p>
      )}

      {isError && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-red-700" role="alert">
            No se pudieron cargar los recordatorios.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !isError && data && data.total === 0 && (
        <p className="mt-4 text-sm text-slate-600">
          No hay vehículos pendientes de recordatorio.
        </p>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Placa
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Vehículo
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Días sin visita
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Correo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((item) => (
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
                    {item.daysSinceVisit}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {item.canEmail ? (
                      item.ownerEmail
                    ) : (
                      <span className="text-amber-700">Sin correo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.total > limit && (
            <p className="mt-3 text-xs text-slate-500">
              Mostrando {data.items.length} de {data.total}. Usa Ver más para el
              listado completo.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
