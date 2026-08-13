import Link from 'next/link';
import { WorkOrderStatusBadge } from '@/features/work-orders/components/WorkOrderStatusBadge';
import type { WorkOrderStatus } from '@/features/work-orders/types/work-order.types';
import type { ClientVehicleSummary } from '../types/history.types';

interface ClientVehicleCardProps {
  vehicle: ClientVehicleSummary;
}

function formatVisitDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function ClientVehicleCard({ vehicle }: ClientVehicleCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {vehicle.licensePlate}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {vehicle.lastVisitAt ? (
            <>
              Última visita: {formatVisitDate(vehicle.lastVisitAt)}
              {vehicle.lastVisitStatus && (
                <span className="ml-2 inline-flex align-middle">
                  <WorkOrderStatusBadge
                    status={vehicle.lastVisitStatus as WorkOrderStatus}
                  />
                </span>
              )}
            </>
          ) : (
            <span className="italic text-slate-400">Sin visitas registradas</span>
          )}
        </p>
      </div>
      <Link
        href={`/vehicles/${vehicle.id}#historial`}
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Ver historial
      </Link>
    </article>
  );
}
