'use client';

import React from 'react';
import { Button } from '@/components/shared/ui';

interface CancellationModalProps {
  isOpen: boolean;
  policy: string;
  refundAmountEur: number | null | undefined;
  isCancelling: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancellationModal({
  isOpen,
  policy,
  refundAmountEur,
  isCancelling,
  error,
  onConfirm,
  onClose,
}: CancellationModalProps) {
  if (!isOpen) {
    return null;
  }

  const willRefund = (refundAmountEur ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      data-testid="cancellation-modal"
    >
      <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl">
        <h2 id="cancel-modal-title" className="font-serif text-lg text-ink">
          Cancel this booking?
        </h2>

        <p className="mt-3 text-sm text-taupe">{policy}</p>

        <div className="mt-4 rounded-card bg-canvas p-3 text-sm">
          {willRefund ? (
            <p className="text-ink">
              You will be refunded{' '}
              <span className="font-bold" data-testid="refund-amount">
                €{(refundAmountEur ?? 0).toFixed(2)}
              </span>
              .
            </p>
          ) : (
            <p className="text-ink" data-testid="refund-amount">
              This cancellation is within 48 hours of check-in, so you will receive{' '}
              <span className="font-bold">no refund</span>.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-terracotta" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isCancelling}
            data-testid="dismiss-cancel-button"
          >
            Keep booking
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isCancelling}
            data-testid="confirm-cancel-button"
          >
            {isCancelling ? 'Cancelling…' : 'Confirm cancellation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
