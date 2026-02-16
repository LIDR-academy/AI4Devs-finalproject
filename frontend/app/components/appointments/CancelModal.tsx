'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCancelAppointment } from '@/hooks/useAppointments';

interface CancelModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CancelModal({
  appointmentId,
  isOpen,
  onClose,
}: CancelModalProps) {
  const t = useTranslations('appointmentsManagement');
  const [reason, setReason] = useState('');
  const cancelMutation = useCancelAppointment();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onConfirm = async () => {
    await cancelMutation.mutateAsync({
      appointmentId,
      cancellationReason: reason.trim() || undefined,
    });
    setReason('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      data-testid="cancel-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        aria-describedby="cancel-modal-description"
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
      >
        <h3 id="cancel-modal-title" className="text-lg font-semibold text-gray-900 mb-2">
          {t('cancelTitle')}
        </h3>
        <p id="cancel-modal-description" className="text-sm text-gray-600 mb-3">
          {t('cancelConfirm')}
        </p>
        <textarea
          data-testid="cancel-reason"
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder={t('cancelReasonPlaceholder')}
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">{reason.length}/500</p>

        {cancelMutation.isError && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
            {(cancelMutation.error as Error).message}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            data-testid="cancel-close"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
            disabled={cancelMutation.isPending}
          >
            {t('close')}
          </button>
          <button
            type="button"
            data-testid="cancel-confirm"
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
            onClick={onConfirm}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? t('processing') : t('cancelAction')}
          </button>
        </div>
      </div>
    </div>
  );
}
