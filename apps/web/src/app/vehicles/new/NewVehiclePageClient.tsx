'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useClient } from '@/features/clients/hooks/useClient';
import { VehicleForm } from '@/features/vehicles';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export function NewVehiclePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') ?? '';
  const {
    data: client,
    isLoading,
    isError,
  } = useClient(clientId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo vehículo</h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra un vehículo y asígnalo a un propietario existente.
        </p>
      </div>

      {clientId && isLoading && <LoadingSpinner label="Cargando cliente..." />}

      {clientId && isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>No se encontró el cliente indicado.</p>
          <Link
            href="/clients"
            className="mt-2 inline-block font-medium text-red-900 underline"
          >
            Ir a clientes
          </Link>
        </div>
      )}

      {(!clientId || client) && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <VehicleForm
            readOnlyClient={client ?? null}
            onCancel={() => router.push('/vehicles')}
          />
        </div>
      )}

      <Link
        href="/vehicles"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Cancelar y volver a búsqueda
      </Link>
    </div>
  );
}
