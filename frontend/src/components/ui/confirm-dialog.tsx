"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div
        aria-describedby="confirm-dialog-description"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-slate-900" id="confirm-dialog-title">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600" id="confirm-dialog-description">
          {description}
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button onClick={onCancel} type="button" variant="ghost">
            {cancelLabel}
          </Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onConfirm} ref={confirmRef} type="button">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
