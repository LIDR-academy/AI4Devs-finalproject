'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInProgressWorkOrders } from '../hooks/useInProgressWorkOrders';
import { InProgressWorkOrderRow } from './InProgressWorkOrderRow';

const PAGE_SIZE = 20;

export function InProgressWorkOrdersPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError, refetch, isFetching } =
    useInProgressWorkOrders({ limit: PAGE_SIZE, offset });

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Órdenes de trabajo en curso
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Visitas activas del taller (en proceso, lista para entrega o
            propietario contactado).
          </p>
        </div>
        <Link
          href="/work-orders/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva OT
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {isLoading && (
          <p className="text-sm text-slate-600">Cargando órdenes…</p>
        )}

        {isError && (
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Placa
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Vehículo
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Propietario
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Mecánico
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">
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
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Mostrando {from}–{to} de {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canPrev || isFetching}
                  onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={!canNext || isFetching}
                  onClick={() => setOffset((value) => value + PAGE_SIZE)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
