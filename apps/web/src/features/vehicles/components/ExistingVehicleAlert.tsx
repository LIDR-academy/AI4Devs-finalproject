import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { ExistingVehicleSummary } from '../types/vehicle.types';

interface ExistingVehicleAlertProps {
  vehicle: ExistingVehicleSummary;
}

export function ExistingVehicleAlert({ vehicle }: ExistingVehicleAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-300 bg-amber-50 p-4"
    >
      <p className="text-sm font-medium text-amber-900">
        Ya existe un vehículo con esta placa
      </p>
      <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{vehicle.licensePlate}</p>
        <p>
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/vehicles/${vehicle.id}`}>
          <Button>Ver ficha</Button>
        </Link>
        <Link href="/vehicles">
          <Button variant="secondary">Volver a búsqueda</Button>
        </Link>
      </div>
    </div>
  );
}
