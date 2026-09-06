'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { VisitTimeline } from '@/features/history/components/VisitTimeline';
import { useVehicleHistory } from '@/features/history/hooks/useVehicleHistory';
import {
  DeleteVehicleDialog,
  VehicleDetailHeader,
} from '@/features/vehicles';
import { useVehicle } from '@/features/vehicles/hooks/useVehicle';
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

  useEffect(() => {
    if (isHistoryLoading || typeof window === 'undefined') {
      return;
    }

    if (window.location.hash === '#historial') {
      document.getElementById('historial')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isHistoryLoading, history]);

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
      <VisitTimeline
        visits={history?.visits ?? []}
        vehicleId={vehicleId}
        currentOwnerNationalId={vehicle.currentOwner?.nationalId ?? null}
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
