'use client';

import Link from 'next/link';
import { WorkOrderStatusBadge } from '@/features/work-orders/components/WorkOrderStatusBadge';
import { formatCurrency } from '@/features/work-orders/utils/formatCurrency';
import { formatMileage } from '@/features/work-orders/utils/formatMileage';
import type { WorkOrderStatus } from '@/features/work-orders/types/work-order.types';
import type { VehicleVisit } from '../types/history.types';
import { VisitTasksList } from './VisitTasksList';
import { VisitTechnicalNotesReadOnly } from './VisitTechnicalNotesReadOnly';

interface VisitCardProps {
  visit: VehicleVisit;
  currentOwnerNationalId: string | null;
  expanded: boolean;
  onToggle: () => void;
}

function formatVisitDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function VisitCard({
  visit,
  currentOwnerNationalId,
  expanded,
  onToggle,
}: VisitCardProps) {
  const ownerDiffers =
    Boolean(visit.ownerAtVisit) &&
    Boolean(currentOwnerNationalId) &&
    visit.ownerAtVisit!.nationalId !== currentOwnerNationalId;
  const isInProgress = visit.status === 'EN_PROCESO';

  return (
    <article className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            {formatVisitDate(visit.checkedInAt)}
          </p>
          <p className="text-sm text-slate-600">{visit.entryReason}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WorkOrderStatusBadge status={visit.status as WorkOrderStatus} />
          <span className="font-semibold text-slate-900">
            {formatCurrency(visit.totalAmount)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Propietario en la visita
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {visit.ownerAtVisit
                  ? `${visit.ownerAtVisit.fullName} (${visit.ownerAtVisit.nationalId})`
                  : 'Sin propietario'}
              </p>
              {visit.broughtByName && (
                <p className="mt-1 text-sm text-slate-700">
                  Traído por: {visit.broughtByName}
                  {visit.broughtByPhone ? ` (${visit.broughtByPhone})` : ''}
                </p>
              )}
              {ownerDiffers && (
                <p className="mt-2 text-xs text-amber-700">
                  Propietario al momento de la visita (puede diferir del
                  propietario actual)
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Kilometraje
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {formatMileage(visit.mileage)}
              </p>
              {visit.deliveredAt && (
                <p className="mt-2 text-sm text-slate-600">
                  Entregado: {formatVisitDate(visit.deliveredAt)}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">Tareas</h4>
            <VisitTasksList tasks={visit.tasks} workOrderId={visit.workOrderId} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              Notas técnicas
            </h4>
            <VisitTechnicalNotesReadOnly
              visitNotes={visit.visitNotes}
              workOrderId={visit.workOrderId}
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-3">
            {isInProgress ? (
              <Link
                href={`/work-orders/${visit.workOrderId}`}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continuar OT
              </Link>
            ) : (
              <Link
                href={`/work-orders/${visit.workOrderId}`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Ver OT
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
