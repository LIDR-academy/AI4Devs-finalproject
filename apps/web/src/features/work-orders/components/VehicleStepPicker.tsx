'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import {
  VehicleSearchBar,
  VehicleSearchHint,
} from '@/features/vehicles';
import { useVehicleSearch } from '@/features/vehicles/hooks/useVehicleSearch';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';

interface VehicleStepPickerProps {
  onSelect: (vehicle: Vehicle) => void;
  showPrefillError?: boolean;
}

export function VehicleStepPicker({
  onSelect,
  showPrefillError = false,
}: VehicleStepPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const hasQuery = searchQuery.trim().length >= 2;
  const { data, isFetching, isLoading } = useVehicleSearch(searchQuery);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">Paso 1 de 2 — Selecciona el vehículo</p>

      {showPrefillError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          No se encontró el vehículo indicado. Busca otro vehículo para continuar.
        </div>
      )}

      <VehicleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={hasQuery && (isFetching || isLoading)}
      />
      <VehicleSearchHint query={searchQuery} />

      {hasQuery && (isFetching || isLoading) && (
        <LoadingSpinner label="Buscando vehículos..." />
      )}

      {hasQuery && !isFetching && !isLoading && (
        <div aria-live="polite" className="space-y-4">
          {(data?.total ?? 0) > 0 && (
            <p className="text-sm text-slate-600">
              {data?.total === 1
                ? '1 vehículo encontrado'
                : `${data?.total} vehículos encontrados`}
            </p>
          )}

          {data?.items.length === 0 ? (
            <EmptyState
              title="No se encontraron vehículos"
              description="Registra un vehículo nuevo para continuar con la orden de trabajo."
              action={
                <Link href="/vehicles/new">
                  <Button>Registrar vehículo</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {data?.items.map((vehicle) => (
                <li
                  key={vehicle.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {vehicle.licensePlate}
                      </p>
                      <p className="text-sm text-slate-600">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </p>
                      <p className="text-sm text-slate-600">
                        Propietario:{' '}
                        {vehicle.currentOwner
                          ? vehicle.currentOwner.fullName
                          : 'Sin propietario'}
                      </p>
                    </div>
                    <Button type="button" onClick={() => onSelect(vehicle)}>
                      Seleccionar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
