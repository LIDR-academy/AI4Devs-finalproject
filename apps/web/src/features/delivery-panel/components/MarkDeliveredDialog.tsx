'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/apiError';
import { useVehicleHistory } from '@/features/history/hooks/useVehicleHistory';
import {
  getPreviousVisitMileage,
  isMileageDecrease,
  lowerMileageConfirmMessage,
  resolveMileageBaseline,
} from '@/features/work-orders/utils/mileageDecrease';
import { useMarkDelivered } from '../hooks/useMarkDelivered';
import { mapDeliveryError } from '../utils/mapDeliveryError';
import type { DeliverTarget } from '../types/delivery.types';

interface MarkDeliveredDialogProps {
  target: DeliverTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onConflict: () => void;
}

export function MarkDeliveredDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
  onConflict,
}: MarkDeliveredDialogProps) {
  const { mutateAsync, isPending, error, reset } = useMarkDelivered();
  const [mileageInput, setMileageInput] = useState('');
  const [pendingMileage, setPendingMileage] = useState<number | undefined>();
  const [confirmLowerOpen, setConfirmLowerOpen] = useState(false);
  const { data: history } = useVehicleHistory(
    open && target?.vehicleId ? target.vehicleId : '',
  );

  const baseline = useMemo(() => {
    if (!target) {
      return null;
    }

    const previous = getPreviousVisitMileage(
      history?.visits ?? [],
      target.workOrderId,
    );
    return resolveMileageBaseline(previous, target.mileage);
  }, [history?.visits, target]);

  useEffect(() => {
    if (!open) {
      reset();
      setMileageInput('');
      setPendingMileage(undefined);
      setConfirmLowerOpen(false);
    }
  }, [open, reset]);

  const showMileageReminder = target?.mileage === null;

  const deliver = async (mileage?: number) => {
    if (!target) {
      return;
    }

    reset();

    try {
      await mutateAsync({
        workOrderId: target.workOrderId,
        mileage,
      });
      setConfirmLowerOpen(false);
      setPendingMileage(undefined);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        onConflict();
      }
      setConfirmLowerOpen(false);
    }
  };

  const handleConfirm = async () => {
    if (!target) {
      return;
    }

    let mileage: number | undefined;
    if (mileageInput.trim() !== '') {
      const parsed = Number.parseInt(mileageInput, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        mileage = parsed;
      }
    }

    if (
      mileage !== undefined &&
      isMileageDecrease(mileage, baseline) &&
      baseline !== null
    ) {
      setPendingMileage(mileage);
      setConfirmLowerOpen(true);
      return;
    }

    await deliver(mileage);
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Confirmar entrega"
      >
        {target && (
          <p className="mb-4 text-sm text-slate-600">
            ¿Confirmar retiro del vehículo {target.licensePlate}?
          </p>
        )}

        {showMileageReminder && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">Kilometraje no registrado</p>
            <p className="mt-1">
              Puedes agregarlo ahora o entregar sin kilometraje.
            </p>
            {baseline !== null && (
              <p className="mt-1 text-amber-800">
                Último registrado: {baseline.toLocaleString('es-CR')} km
              </p>
            )}
            <div className="mt-3 space-y-1">
              <label
                htmlFor="deliver-mileage"
                className="block text-sm font-medium text-amber-950"
              >
                Kilometraje (opcional)
              </label>
              <input
                id="deliver-mileage"
                type="number"
                min={0}
                value={mileageInput}
                onChange={(event) => setMileageInput(event.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-slate-900 outline-none ring-amber-500 focus:ring-2"
                disabled={isPending}
              />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {mapDeliveryError(error)}
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
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isPending}
          >
            {isPending
              ? 'Confirmando...'
              : showMileageReminder && mileageInput.trim() === ''
                ? 'Entregar sin kilometraje'
                : 'Confirmar'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={confirmLowerOpen}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmLowerOpen(false);
            setPendingMileage(undefined);
          }
        }}
        title="Kilometraje menor al anterior"
      >
        {pendingMileage !== undefined && baseline !== null && (
          <p className="mb-4 text-sm text-amber-900">
            {lowerMileageConfirmMessage(pendingMileage, baseline)}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setConfirmLowerOpen(false);
              setPendingMileage(undefined);
            }}
            disabled={isPending}
          >
            Revisar
          </Button>
          <Button
            type="button"
            onClick={() => {
              void deliver(pendingMileage);
            }}
            disabled={isPending}
          >
            {isPending ? 'Confirmando...' : 'Sí, entregar igual'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
