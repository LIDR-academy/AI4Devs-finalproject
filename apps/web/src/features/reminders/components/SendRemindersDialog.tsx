'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useSendReminders } from '../hooks/useReminderMutations';
import type {
  EligibleReminderItem,
  SendRemindersResponse,
} from '../types/reminders.types';
import { mapReminderEmailStatusLabel } from '../utils/mapReminderEmailStatus';
import { mapRemindersError } from '../utils/mapRemindersError';

type SendRemindersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: EligibleReminderItem[];
  onCompleted: (response: SendRemindersResponse) => void;
};

type DialogStep = 'confirm' | 'summary';

export function SendRemindersDialog({
  open,
  onOpenChange,
  selectedItems,
  onCompleted,
}: SendRemindersDialogProps) {
  const { mutateAsync, isPending, error, reset } = useSendReminders();
  const [step, setStep] = useState<DialogStep>('confirm');
  const [summary, setSummary] = useState<SendRemindersResponse | null>(null);

  useEffect(() => {
    if (!open) {
      reset();
      setStep('confirm');
      setSummary(null);
    }
  }, [open, reset]);

  const withoutEmail = selectedItems.filter((item) => !item.canEmail).length;

  const handleConfirm = async () => {
    reset();
    try {
      const response = await mutateAsync(
        selectedItems.map((item) => item.vehicleId),
      );
      setSummary(response);
      setStep('summary');
      onCompleted(response);
    } catch {
      // Error via mutation state
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        step === 'confirm'
          ? 'Enviar recordatorios'
          : 'Resultado del envío'
      }
      className="max-w-xl"
    >
      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Se intentará enviar recordatorio a{' '}
            <strong>{selectedItems.length}</strong> vehículo(s).{' '}
            <strong>{withoutEmail}</strong> sin correo se omitirán
            automáticamente.
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
              onClick={() => void handleConfirm()}
              disabled={isPending || selectedItems.length === 0}
            >
              {isPending ? 'Enviando...' : 'Enviar recordatorios'}
            </Button>
          </div>
        </div>
      )}

      {step === 'summary' && summary && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Enviados: <strong>{summary.summary.sent}</strong> · Omitidos:{' '}
            <strong>{summary.summary.skipped}</strong> · Con error:{' '}
            <strong>{summary.summary.failed}</strong>
          </p>

          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">
                    Placa
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.results.map((row) => (
                  <tr key={row.vehicleId}>
                    <td className="px-3 py-2 text-slate-800">
                      {row.licensePlate}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {mapReminderEmailStatusLabel(row.emailStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
