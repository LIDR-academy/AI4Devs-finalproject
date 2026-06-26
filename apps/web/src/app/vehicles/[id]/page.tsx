'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  DeleteVehicleDialog,
  VehicleDetailHeader,
  VehicleVisitHistory,
} from '@/features/vehicles';
import { useVehicle } from '@/features/vehicles/hooks/useVehicle';
import { useVehicleHistory } from '@/features/vehicles/hooks/useVehicleHistory';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const vehicleId = params.id;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: vehicle,
    isLoading: isVehicleLoading,
    isError: isVehicleError,
  } = useVehicle(vehicleId);

  const {
    data: history,
    isLoading: isHistoryLoading,
  } = useVehicleHistory(vehicleId);

  if (isVehicleLoading) {
    return <LoadingSpinner label="Cargando vehículo..." />;
  }

  if (isVehicleError || !vehicle) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Vehículo</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>No se encontró el vehículo solicitado.</p>
          <Link
            href="/vehicles"
            className="mt-2 inline-block font-medium text-red-900 underline"
          >
            Volver a búsqueda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/vehicles"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Volver a vehículos
      </Link>

      <VehicleDetailHeader
        vehicle={vehicle}
        onDelete={() => setDeleteOpen(true)}
      />
      <VehicleVisitHistory
        visits={history?.visits ?? []}
        isLoading={isHistoryLoading}
      />
      <DeleteVehicleDialog
        vehicle={vehicle}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
