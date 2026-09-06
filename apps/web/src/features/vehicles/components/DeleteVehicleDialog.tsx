'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useDeleteVehicle } from '../hooks/useDeleteVehicle';
import type { Vehicle } from '../types/vehicle.types';
import { mapVehiclesError } from '../utils/mapVehiclesError';

interface DeleteVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: DeleteVehicleDialogProps) {
  const router = useRouter();
  const { mutateAsync, isPending, error, reset } = useDeleteVehicle();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleConfirm = async () => {
    if (!vehicle) {
      return;
    }

    reset();
    try {
      await mutateAsync(vehicle.id);
      onOpenChange(false);
      router.push('/vehicles');
    } catch {
      // Error surfaced via mutation state
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar vehículo"
    >
      {vehicle && (
        <p className="mb-4 text-sm text-slate-600">
          ¿Eliminar {vehicle.licensePlate} ({vehicle.brand} {vehicle.model})?
          Esta acción no se puede deshacer.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {mapVehiclesError(error)}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            void handleConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? 'Eliminando...' : 'Eliminar vehículo'}
        </Button>
      </div>
    </Modal>
  );
}
