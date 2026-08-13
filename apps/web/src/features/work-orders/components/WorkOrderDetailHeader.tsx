'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { WorkOrderDetail } from '../types/work-order.types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatMileage } from '../utils/formatMileage';
import { UpdateMileageDialog } from './UpdateMileageDialog';
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge';

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrderDetail;
  onMileageUpdated?: () => void;
  onLinkOwner?: () => void;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

function canEditMileage(
  status: WorkOrderDetail['status'],
  role: string | undefined,
): boolean {
  if (status === 'ENTREGADA') {
    return role === 'ADMIN';
  }

  return (
    status === 'EN_PROCESO' ||
    status === 'LISTA_PARA_ENTREGA' ||
    status === 'OWNER_CONTACTED'
  );
}

function formatAssignedMechanic(workOrder: WorkOrderDetail): string {
  if (workOrder.assignedMechanic) {
    const { fullName, role } = workOrder.assignedMechanic;
    return role === 'ADMIN' ? `${fullName} (Admin)` : fullName;
  }

  if (workOrder.assignedMechanicId) {
    return 'Mecánico asignado';
  }

  return 'Sin asignar';
}

export function WorkOrderDetailHeader({
  workOrder,
  onMileageUpdated,
  onLinkOwner,
}: WorkOrderDetailHeaderProps) {
  const { user } = useAuth();
  const [mileageDialogOpen, setMileageDialogOpen] = useState(false);

  const assignedMechanicName = formatAssignedMechanic(workOrder);
  const showMileageEdit = canEditMileage(workOrder.status, user?.role);
  const canLinkOwner = workOrder.ownerClientId == null;

  return (
    <>
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
              {workOrder.owner
                ? `Propietario: ${workOrder.owner.fullName} (${workOrder.owner.nationalId})`
                : 'Sin propietario'}
            </p>
            {workOrder.broughtByName && (
              <p className="text-sm text-slate-600">
                Traído por: {workOrder.broughtByName}
                {workOrder.broughtByPhone ? (
                  <>
                    {' '}
                    (
                    <a
                      href={`tel:${workOrder.broughtByPhone}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {workOrder.broughtByPhone}
                    </a>
                    )
                  </>
                ) : null}
              </p>
            )}
            {canLinkOwner && onLinkOwner && (
              <Button
                type="button"
                variant="secondary"
                className="mt-1"
                onClick={onLinkOwner}
              >
                Asociar propietario
              </Button>
            )}
            <p className="text-sm text-slate-600">
              Mecánico asignado: {assignedMechanicName}
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
              Kilometraje: {formatMileage(workOrder.mileage)}
            </p>
            {showMileageEdit && (
              <Button
                type="button"
                variant="secondary"
                className="mt-1"
                onClick={() => setMileageDialogOpen(true)}
              >
                {workOrder.mileage === null ? 'Registrar kilometraje' : 'Editar kilometraje'}
              </Button>
            )}
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

      <UpdateMileageDialog
        workOrderId={workOrder.id}
        vehicleId={workOrder.vehicleId}
        currentMileage={workOrder.mileage}
        open={mileageDialogOpen}
        onOpenChange={setMileageDialogOpen}
        onSuccess={() => onMileageUpdated?.()}
      />
    </>
  );
}
