"use client";

import { useEffect, useRef } from "react";
import { Copy, Download, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";

type RegistrationSuccessDialogProps = {
  email: string;
  apiKey: string;
  onCopy: () => Promise<void>;
  onDownload: () => void;
  onContinue: () => void;
};

export function RegistrationSuccessDialog({
  email,
  apiKey,
  onCopy,
  onDownload,
  onContinue,
}: RegistrationSuccessDialogProps) {
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div
        aria-labelledby="registration-success-title"
        aria-describedby="registration-success-description"
        aria-modal="true"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl md:p-8"
        role="dialog"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Registration complete</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900" id="registration-success-title">
              Your API key is ready
            </h2>
            <p className="mt-2 text-sm text-slate-600" id="registration-success-description">
              This key is shown once for <span className="font-medium text-slate-900">{email}</span>. Copy or download it now before you continue.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">API key</p>
          <code className="mt-3 block overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-sm text-emerald-300">{apiKey}</code>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="gap-2" onClick={() => void onCopy()} type="button" variant="ghost">
              <Copy className="h-4 w-4" />
              Copy key
            </Button>
            <Button className="gap-2" onClick={onDownload} type="button" variant="ghost">
              <Download className="h-4 w-4" />
              Download .txt
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Save this key securely.</p>
          <p className="mt-2">
            Do not store it in browser storage such as <span className="font-semibold">localStorage</span> or <span className="font-semibold">sessionStorage</span>.
            If long-term persistence is required, use server-side or OS-level secure storage.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onContinue} ref={continueButtonRef} type="button">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}