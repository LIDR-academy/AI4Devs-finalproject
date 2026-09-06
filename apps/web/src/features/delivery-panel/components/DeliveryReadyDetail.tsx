'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { WorkOrderStatusBadge } from '@/features/work-orders/components/WorkOrderStatusBadge';
import type { WorkOrderStatus } from '@/features/work-orders/types/work-order.types';
import { formatCurrency } from '@/features/work-orders/utils/formatCurrency';
import { formatMileage } from '@/features/work-orders/utils/formatMileage';
import { useDeliveryReadyDetail } from '../hooks/useDeliveryReadyDetail';
import { mapDeliveryError } from '../utils/mapDeliveryError';
import type { DeliverTarget } from '../types/delivery.types';
import { OwnerPhoneCell } from './OwnerPhoneCell';
import { DeliveryTaskBreakdown } from './DeliveryTaskBreakdown';

interface DeliveryReadyDetailProps {
  workOrderId: string;
  licensePlate: string;
  onMarkContacted: () => void;
  onMarkDelivered: (target: DeliverTarget) => void;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function DeliveryReadyDetail({
  workOrderId,
  licensePlate,
  onMarkContacted,
  onMarkDelivered,
}: DeliveryReadyDetailProps) {
  const { data, isLoading, isError, error } = useDeliveryReadyDetail(workOrderId);

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <LoadingSpinner label="Cargando detalle..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 py-4">
        <p role="alert" className="text-sm text-red-700">
          {mapDeliveryError(error)}
        </p>
      </div>
    );
  }

  const isPendingContact = data.status === 'LISTA_PARA_ENTREGA';
  const isContacted = data.status === 'OWNER_CONTACTED';
  const hasOwner = data.owner != null && data.ownerName != null;

  return (
    <div className="space-y-5 px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <WorkOrderStatusBadge status={data.status as WorkOrderStatus} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Vehículo
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {data.vehicle.licensePlate} — {data.vehicle.brand}{' '}
            {data.vehicle.model} {data.vehicle.year}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Propietario
          </h3>
          {hasOwner && data.owner ? (
            <>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {data.owner.fullName}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Teléfono:{' '}
                <OwnerPhoneCell
                  phone={data.owner.phone}
                  phoneDisplay={data.ownerPhoneDisplay}
                />
              </p>
              {data.owner.email && (
                <p className="mt-1 text-sm text-slate-600">
                  Correo:{' '}
                  <a
                    href={`mailto:${data.owner.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {data.owner.email}
                  </a>
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-900">
              Sin propietario
            </p>
          )}
          {data.broughtByName && (
            <p className="mt-2 text-sm text-slate-700">
              Traído por: {data.broughtByName}
              {data.broughtByPhone ? (
                <>
                  {' '}
                  (
                  <a
                    href={`tel:${data.broughtByPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {data.broughtByPhone}
                  </a>
                  )
                </>
              ) : null}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ingreso
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            {formatDate(data.checkedInAt)} ({data.elapsedLabel})
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Motivo / Kilometraje
          </h3>
          <p className="mt-1 text-sm text-slate-700">{data.entryReason}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatMileage(data.mileage)}
          </p>
        </div>
      </div>

      {isContacted && data.ownerContactedAt && (
        <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
          <p>
            Contactado el {formatDate(data.ownerContactedAt)}
            {data.ownerContactedBy
              ? ` por ${data.ownerContactedBy.fullName}`
              : ''}
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Desglose de tareas
        </h3>
        <DeliveryTaskBreakdown tasks={data.tasks} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-slate-900">
          Total a cobrar: {formatCurrency(data.totalAmount)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/work-orders/${data.workOrderId}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ver OT completa
          </Link>
          {isPendingContact && hasOwner && (
            <Button type="button" variant="secondary" onClick={onMarkContacted}>
              Marcar propietario contactado
            </Button>
          )}
          <Button
            type="button"
            onClick={() =>
              onMarkDelivered({
                workOrderId: data.workOrderId,
                vehicleId: data.vehicleId,
                licensePlate,
                mileage: data.mileage,
              })
            }
          >
            Marcar como entregada
          </Button>
        </div>
      </div>
    </div>
  );
}
