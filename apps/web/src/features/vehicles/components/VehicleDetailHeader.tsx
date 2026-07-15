'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import { useActiveWorkOrder } from '@/features/work-orders/hooks/useActiveWorkOrder';
import type { Vehicle } from '../types/vehicle.types';

interface VehicleDetailHeaderProps {
  vehicle: Vehicle;
  onDelete?: () => void;
}

export function VehicleDetailHeader({
  vehicle,
  onDelete,
}: VehicleDetailHeaderProps) {
  const { data: activeData } = useActiveWorkOrder(vehicle.id);
  const activeWorkOrder = activeData?.activeWorkOrder ?? null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-wide text-slate-900">
            {vehicle.licensePlate}
          </h1>
          <p className="text-base text-slate-700">
            {vehicle.brand} {vehicle.model} · {vehicle.year}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-medium">Color:</span>{' '}
            {vehicle.color ?? 'Sin color'}
          </p>
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Propietario actual</p>
            {vehicle.currentOwner ? (
              <>
                <p className="mt-1">{vehicle.currentOwner.fullName}</p>
                <p>Identificación: {vehicle.currentOwner.nationalId}</p>
              </>
            ) : (
              <p className="mt-1">Sin propietario</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vehicles/${vehicle.id}/edit`}>
            <Button variant="secondary">Editar vehículo</Button>
          </Link>
          {onDelete && (
            <Button type="button" variant="danger" onClick={onDelete}>
              Eliminar vehículo
            </Button>
          )}
          {activeWorkOrder ? (
            <Link href={`/work-orders/${activeWorkOrder.id}`}>
              <Button>Ver orden activa</Button>
            </Link>
          ) : (
            <Link href={`/work-orders/new?vehicleId=${vehicle.id}`}>
              <Button>Nueva orden de trabajo</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
