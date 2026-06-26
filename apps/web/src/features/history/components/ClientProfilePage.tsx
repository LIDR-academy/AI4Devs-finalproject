'use client';

import Link from 'next/link';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useClientProfile } from '../hooks/useClientProfile';
import { mapHistoryError } from '../utils/mapHistoryError';
import { ClientProfileHeader } from './ClientProfileHeader';
import { ClientVehiclesList } from './ClientVehiclesList';

interface ClientProfilePageProps {
  clientId: string;
}

export function ClientProfilePage({ clientId }: ClientProfilePageProps) {
  const { data, isLoading, isError, error } = useClientProfile(clientId);

  if (isLoading) {
    return <LoadingSpinner label="Cargando cliente..." />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Cliente</h1>
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {mapHistoryError(error, 'client')}
        </p>
        <Link
          href="/clients"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Volver a clientes
      </Link>

      <ClientProfileHeader client={data} />
      <ClientVehiclesList vehicles={data.vehicles} />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/clients/${clientId}/edit`}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Editar cliente
        </Link>
        <Link
          href={`/vehicles/new?clientId=${clientId}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Registrar vehículo
        </Link>
      </div>
    </div>
  );
}
