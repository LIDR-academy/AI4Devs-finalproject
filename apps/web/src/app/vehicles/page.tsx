'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import {
  VehicleSearchBar,
  VehicleSearchHint,
  VehicleSearchResults,
} from '@/features/vehicles';
import { useVehicleSearch } from '@/features/vehicles/hooks/useVehicleSearch';

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isFetching, isLoading } = useVehicleSearch(searchQuery);
  const hasQuery = searchQuery.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vehículos</h1>
          <p className="mt-1 text-sm text-slate-600">
            Busca un vehículo por placa antes de registrar uno nuevo.
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button>Nuevo vehículo</Button>
        </Link>
      </div>

      <VehicleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        isLoading={hasQuery && (isFetching || isLoading)}
      />
      <VehicleSearchHint query={searchQuery} />

      <VehicleSearchResults
        items={data?.items ?? []}
        isLoading={hasQuery && (isFetching || isLoading)}
        hasQuery={hasQuery}
        total={data?.total}
      />
    </div>
  );
}
