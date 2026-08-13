'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useVehicleHistory } from '@/features/history/hooks/useVehicleHistory';
import { mapWorkOrdersError } from '../utils/mapWorkOrdersError';
import {
  getPreviousVisitMileage,
  isMileageDecrease,
  lowerMileageConfirmMessage,
  resolveMileageBaseline,
} from '../utils/mileageDecrease';
import { useUpdateMileage } from '../hooks/useUpdateMileage';

interface UpdateMileageDialogProps {
  workOrderId: string;
  vehicleId: string;
  currentMileage: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UpdateMileageDialog({
  workOrderId,
  vehicleId,
  currentMileage,
  open,
  onOpenChange,
  onSuccess,
}: UpdateMileageDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [pendingMileage, setPendingMileage] = useState<number | null>(null);
  const [confirmLowerOpen, setConfirmLowerOpen] = useState(false);
  const { mutateAsync, isPending, error, reset } = useUpdateMileage(workOrderId);
  const { data: history } = useVehicleHistory(open ? vehicleId : '');

  const baseline = useMemo(() => {
    const previous = getPreviousVisitMileage(history?.visits ?? [], workOrderId);
    return resolveMileageBaseline(previous, currentMileage);
  }, [history?.visits, workOrderId, currentMileage]);

  useEffect(() => {
    if (open) {
      setInputValue(
        currentMileage === null || currentMileage === undefined
          ? ''
          : String(currentMileage),
      );
      setPendingMileage(null);
      setConfirmLowerOpen(false);
      reset();
    }
  }, [open, currentMileage, reset]);

  const saveMileage = async (mileage: number | null) => {
    try {
      await mutateAsync(mileage);
      setConfirmLowerOpen(false);
      setPendingMileage(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      // Error shown via mutation state
    }
  };

  const handleSubmit = async () => {
    reset();

    let mileage: number | null;
    if (inputValue.trim() === '') {
      mileage = null;
    } else {
      const parsed = Number.parseInt(inputValue, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        return;
      }
      mileage = parsed;
    }

    if (isMileageDecrease(mileage, baseline) && mileage !== null && baseline !== null) {
      setPendingMileage(mileage);
      setConfirmLowerOpen(true);
      return;
    }

    await saveMileage(mileage);
  };

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange} title="Kilometraje">
        <p className="mb-4 text-sm text-slate-600">
          Registra o actualiza el kilometraje de la visita. Puedes dejarlo vacío
          si aún no está disponible.
        </p>

        {baseline !== null && (
          <p className="mb-3 text-sm text-slate-500">
            Último valor de referencia: {baseline.toLocaleString('es-CR')} km
          </p>
        )}

        <div className="mb-4 space-y-1">
          <label htmlFor="mileage-edit" className="block text-sm font-medium text-slate-700">
            Kilometraje
          </label>
          <input
            id="mileage-edit"
            type="number"
            min={0}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2"
            disabled={isPending}
          />
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-700">
            {mapWorkOrdersError(error)}
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
              void handleSubmit();
            }}
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={confirmLowerOpen}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmLowerOpen(false);
            setPendingMileage(null);
          }
        }}
        title="Kilometraje menor al anterior"
      >
        {pendingMileage !== null && baseline !== null && (
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
              setPendingMileage(null);
            }}
            disabled={isPending}
          >
            Revisar
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (pendingMileage !== null) {
                void saveMileage(pendingMileage);
              }
            }}
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Sí, guardar igual'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
