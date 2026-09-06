'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/apiError';
import { useMarkContacted } from '../hooks/useMarkContacted';
import { mapDeliveryError } from '../utils/mapDeliveryError';
import type { DeliveryReadyItem } from '../types/delivery.types';

interface MarkContactedDialogProps {
  target: DeliveryReadyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onConflict: () => void;
}

export function MarkContactedDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
  onConflict,
}: MarkContactedDialogProps) {
  const { mutateAsync, isPending, error, reset } = useMarkContacted();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleConfirm = async () => {
    if (!target) {
      return;
    }

    reset();
    try {
      await mutateAsync(target.workOrderId);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        onConflict();
      }
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Marcar propietario contactado"
    >
      {target && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Confirmas que ya contactaste al propietario de{' '}
            <strong>{target.licensePlate}</strong>?
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
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
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? 'Guardando...' : 'Confirmar contacto'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
