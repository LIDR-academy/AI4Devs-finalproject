'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import { useVehicle } from '@/features/vehicles/hooks/useVehicle';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useActiveWorkOrder } from '../hooks/useActiveWorkOrder';
import { ActiveWorkOrderBanner } from './ActiveWorkOrderBanner';
import { VehicleStepPicker } from './VehicleStepPicker';
import { WorkOrderCreateForm } from './WorkOrderCreateForm';

interface WorkOrderCreateWizardProps {
  prefillVehicleId?: string | null;
}

export function WorkOrderCreateWizard({
  prefillVehicleId = null,
}: WorkOrderCreateWizardProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [skipPrefill, setSkipPrefill] = useState(false);

  const shouldLoadPrefill =
    !skipPrefill && !!prefillVehicleId && !selectedVehicle;

  const {
    data: prefilledVehicle,
    isLoading: isPrefillLoading,
    isError: isPrefillError,
  } = useVehicle(shouldLoadPrefill ? prefillVehicleId! : '');

  useEffect(() => {
    if (prefilledVehicle && !selectedVehicle) {
      setSelectedVehicle(prefilledVehicle);
    }
  }, [prefilledVehicle, selectedVehicle]);

  const vehicle = selectedVehicle;
  const vehicleId = vehicle?.id ?? null;

  const { data: activeData, isLoading: isActiveLoading } =
    useActiveWorkOrder(vehicleId);
  const activeWorkOrder = activeData?.activeWorkOrder ?? null;

  const handleSelectVehicle = useCallback((nextVehicle: Vehicle) => {
    setSelectedVehicle(nextVehicle);
    setSkipPrefill(true);
  }, []);

  const handleChangeVehicle = useCallback(() => {
    setSelectedVehicle(null);
    setSkipPrefill(true);
  }, []);

  if (!vehicle) {
    if (shouldLoadPrefill && isPrefillLoading) {
      return <LoadingSpinner label="Cargando vehículo..." />;
    }

    return (
      <VehicleStepPicker
        onSelect={handleSelectVehicle}
        showPrefillError={shouldLoadPrefill && isPrefillError}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">Paso 2 de 2 — Datos de la orden</p>

      {isActiveLoading ? (
        <LoadingSpinner label="Verificando órdenes activas..." />
      ) : (
        activeWorkOrder && <ActiveWorkOrderBanner activeWorkOrder={activeWorkOrder} />
      )}

      <WorkOrderCreateForm
        vehicle={vehicle}
        onChangeVehicle={handleChangeVehicle}
        blockedByActiveWorkOrder={!!activeWorkOrder}
      />
    </div>
  );
}
