'use client';

import Link from 'next/link';
import type { WorkOrderDetail } from '../types/work-order.types';
import { formatCurrency } from '../utils/formatCurrency';
import { useMechanics } from '../hooks/useMechanics';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrderDetail;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function WorkOrderDetailHeader({
  workOrder,
}: WorkOrderDetailHeaderProps) {
  const { data: mechanics = [] } = useMechanics();

  const assignedMechanicName = workOrder.assignedMechanicId
    ? mechanics.find((mechanic) => mechanic.id === workOrder.assignedMechanicId)
        ?.fullName ?? 'Mecánico asignado'
    : 'Sin asignar';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-wide text-slate-900">
            {workOrder.vehicle.licensePlate}
          </h1>
          <p className="text-base text-slate-700">
            {workOrder.vehicle.brand} {workOrder.vehicle.model}
          </p>
          <p className="text-sm text-slate-600">
            Propietario: {workOrder.owner.fullName} ({workOrder.owner.nationalId})
          </p>
          <p className="text-sm text-slate-600">
            Mecánico: {assignedMechanicName}
          </p>
          <WorkOrderStatusBadge status={workOrder.status} />
        </div>

        <div className="space-y-2 text-right">
          <p className="text-sm text-slate-500">Monto total</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatCurrency(workOrder.totalAmount)}
          </p>
          <p className="text-sm text-slate-600">
            Ingreso: {formatDate(workOrder.checkedInAt)}
          </p>
          <p className="text-sm text-slate-600">
            Kilometraje: {workOrder.mileage.toLocaleString('es-CR')} km
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Motivo de ingreso</p>
        <p className="mt-1">{workOrder.entryReason}</p>
      </div>

      <div className="mt-4">
        <Link
          href={`/vehicles/${workOrder.vehicleId}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver vehículo
        </Link>
      </div>
    </section>
  );
}
