'use client';

import { useEffect } from 'react';

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  requireNotes?: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  confirmLabel: string;
  cancelLabel: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ActionModal({
  isOpen,
  title,
  description,
  requireNotes = false,
  notes,
  onNotesChange,
  confirmLabel,
  cancelLabel,
  isSubmitting = false,
  onConfirm,
  onClose,
}: ActionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
        aria-describedby="action-modal-description"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h3 id="action-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {description && (
          <p id="action-modal-description" className="mt-2 text-sm text-slate-600">
            {description}
          </p>
        )}
        {!description ? (
          <p id="action-modal-description" className="sr-only">
            {title}
          </p>
        ) : null}

        <textarea
          aria-describedby="action-modal-description"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={requireNotes ? 'Notas requeridas' : 'Notas opcionales'}
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          rows={4}
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            data-testid="action-modal-cancel"
            onClick={onClose}
            className="w-full rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-testid="action-modal-confirm"
            disabled={isSubmitting || (requireNotes && !notes.trim())}
            onClick={onConfirm}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
