'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WorkOrderCreateWizard } from '@/features/work-orders';

export function NewWorkOrderPageClient() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Nueva orden de trabajo
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra el ingreso del vehículo con al menos una tarea inicial.
        </p>
      </div>

      <WorkOrderCreateWizard prefillVehicleId={vehicleId} />

      <Link
        href="/vehicles"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Cancelar y volver a vehículos
      </Link>
    </div>
  );
}
