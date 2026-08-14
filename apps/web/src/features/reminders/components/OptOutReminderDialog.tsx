'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useReminderOptOut } from '../hooks/useReminderMutations';
import type { EligibleReminderItem } from '../types/reminders.types';
import { mapRemindersError } from '../utils/mapRemindersError';

type OptOutReminderDialogProps = {
  target: Pick<EligibleReminderItem, 'vehicleId' | 'licensePlate'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function OptOutReminderDialog({
  target,
  open,
  onOpenChange,
  onSuccess,
}: OptOutReminderDialogProps) {
  const { mutateAsync, isPending, error, reset } = useReminderOptOut();

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
      await mutateAsync(target.vehicleId);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error via mutation state
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="No volver a recordar"
    >
      {target && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Marcar <strong>{target.licensePlate}</strong> como «No volver a
            recordar»? El vehículo dejará de aparecer en la lista de elegibles.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {mapRemindersError(error)}
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
              onClick={() => void handleConfirm()}
              disabled={isPending}
            >
              {isPending ? 'Excluyendo...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
