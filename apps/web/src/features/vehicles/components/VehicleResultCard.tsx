import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import type { Vehicle } from '../types/vehicle.types';

interface VehicleResultCardProps {
  vehicle: Vehicle;
}

export function VehicleResultCard({ vehicle }: VehicleResultCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">
          {vehicle.licensePlate}
        </h3>
        <p className="text-sm text-slate-600">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium">Propietario:</span>{' '}
          {vehicle.currentOwner?.fullName ?? 'Sin propietario'}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/vehicles/${vehicle.id}`}>
          <Button type="button" variant="secondary">
            Ver ficha
          </Button>
        </Link>
        <Link href={`/vehicles/${vehicle.id}/edit`}>
          <Button type="button">Editar vehículo</Button>
        </Link>
      </div>
    </article>
  );
}
