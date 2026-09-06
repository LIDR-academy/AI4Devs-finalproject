import Link from 'next/link';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import type { Vehicle } from '../types/vehicle.types';
import { VehicleResultCard } from './VehicleResultCard';

interface VehicleSearchResultsProps {
  items: Vehicle[];
  isLoading: boolean;
  hasQuery: boolean;
  total?: number;
}

export function VehicleSearchResults({
  items,
  isLoading,
  hasQuery,
  total = 0,
}: VehicleSearchResultsProps) {
  if (!hasQuery) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner label="Buscando vehículos..." />;
  }

  return (
    <div aria-live="polite" className="space-y-4">
      {total > 0 && (
        <p className="text-sm text-slate-600">
          {total === 1
            ? '1 vehículo encontrado'
            : `${total} vehículos encontrados`}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No se encontraron vehículos"
          description="Prueba con otra placa o registra un vehículo nuevo."
          action={
            <Link href="/vehicles/new">
              <Button>Crear nuevo vehículo</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((vehicle) => (
            <VehicleResultCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
