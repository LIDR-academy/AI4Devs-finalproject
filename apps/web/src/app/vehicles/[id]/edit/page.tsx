'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VehicleEditForm } from '@/features/vehicles';

export default function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Editar vehículo</h1>
        <p className="mt-1 text-sm text-slate-600">
          Corrige los datos del vehículo. El propietario no se puede cambiar aquí.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <VehicleEditForm
          vehicleId={params.id}
          onCancel={() => router.push(`/vehicles/${params.id}`)}
        />
      </div>

      <Link
        href={`/vehicles/${params.id}`}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Cancelar y volver a la ficha
      </Link>
    </div>
  );
}
