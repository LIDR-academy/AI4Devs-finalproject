'use client';

import Link from 'next/link';
import { useInProgressWorkOrders } from '../hooks/useInProgressWorkOrders';
import { InProgressWorkOrderRow } from './InProgressWorkOrderRow';

type InProgressWorkOrdersWidgetProps = {
  limit?: number;
};

export function InProgressWorkOrdersWidget({
  limit = 5,
}: InProgressWorkOrdersWidgetProps) {
  const { data, isLoading, isError, refetch, isFetching } =
    useInProgressWorkOrders({ limit, offset: 0 });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Órdenes en curso
        </h2>
        {data && data.total > 0 && (
          <Link
            href="/work-orders/in-progress"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ver todas
          </Link>
        )}
      </div>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-600">Cargando órdenes…</p>
      )}

      {isError && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-red-700" role="alert">
            No se pudieron cargar las órdenes.
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
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-600">No hay órdenes en curso.</p>
          <Link
            href="/work-orders/new"
            className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Nueva OT
          </Link>
        </div>
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
                  Propietario
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Estado
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Mecánico
                </th>
                <th className="px-4 py-2 text-right font-medium text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((item) => (
                <InProgressWorkOrderRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
          {data.total > limit && (
            <p className="mt-3 text-xs text-slate-500">
              Mostrando {data.items.length} de {data.total}. Usa Ver todas para
              el listado completo.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
