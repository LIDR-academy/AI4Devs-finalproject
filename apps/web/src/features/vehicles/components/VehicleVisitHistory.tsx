import type { VehicleVisit } from '../types/vehicle.types';
import { formatCrc } from '../utils/formatCurrency';
import { VehicleVisitTechnicalDetails } from './VehicleVisitTechnicalDetails';

interface VehicleVisitHistoryProps {
  visits: VehicleVisit[];
  isLoading?: boolean;
}

function formatVisitDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function VehicleVisitHistory({
  visits,
  isLoading = false,
}: VehicleVisitHistoryProps) {
  return (
    <section
      id="historial"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        Historial de visitas
      </h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Cargando historial...</p>
      ) : visits.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          Este vehículo aún no tiene visitas registradas
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visits.map((visit) => (
            <li
              key={visit.workOrderId}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  {formatVisitDate(visit.checkedInAt)}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {visit.status}
                </span>
              </div>
              <p className="mt-2">{visit.entryReason}</p>
              <p className="mt-1 text-slate-600">
                Propietario en visita:{' '}
                {visit.ownerAtVisit
                  ? `${visit.ownerAtVisit.fullName} (${visit.ownerAtVisit.nationalId})`
                  : 'Sin propietario'}
              </p>
              {visit.broughtByName && (
                <p className="mt-1 text-slate-600">
                  Traído por: {visit.broughtByName}
                </p>
              )}
              {visit.totalAmount !== null && (
                <p className="mt-1 font-medium text-slate-900">
                  Total: {formatCrc(visit.totalAmount)}
                </p>
              )}
              <VehicleVisitTechnicalDetails visit={visit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
