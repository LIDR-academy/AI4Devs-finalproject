'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ApiError } from '@/shared/lib/apiError';
import { useMarkDelivered } from '../hooks/useMarkDelivered';
import { mapDeliveryError } from '../utils/mapDeliveryError';
import type { DeliveryReadyItem } from '../types/delivery.types';

interface MarkDeliveredDialogProps {
  target: Pick<DeliveryReadyItem, 'workOrderId' | 'licensePlate'> | null;
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
      title="Confirmar entrega"
    >
      {target && (
        <p className="mb-4 text-sm text-slate-600">
          ¿Confirmar retiro del vehículo {target.licensePlate}?
        </p>
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
          {isPending ? 'Confirmando...' : 'Confirmar'}
        </Button>
      </div>
    </Modal>
  );
}
