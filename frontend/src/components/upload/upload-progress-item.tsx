"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, ExternalLink, RefreshCw, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/file-validation";
import { cn } from "@/lib/utils";
import type { UploadEntry } from "@/types/upload";

type UploadProgressItemProps = {
  entry: UploadEntry;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
};

const STATUS_LABELS: Record<UploadEntry["status"], string> = {
  queued: "Queued",
  uploading: "Uploading",
  processing: "Processing",
  done: "Done",
  error: "Error",
  cancelled: "Cancelled",
};

const STATUS_TONES: Record<UploadEntry["status"], string> = {
  queued: "bg-slate-100 text-slate-700",
  uploading: "bg-sky-100 text-sky-700",
  processing: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-200 text-slate-700",
};

function fallbackCopy(text: string) {
  const element = document.createElement("textarea");
  element.value = text;
  element.setAttribute("readonly", "true");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  document.body.appendChild(element);
  element.select();
  document.execCommand("copy");
  document.body.removeChild(element);
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  fallbackCopy(text);
}

export function UploadProgressItem({ entry, onCancel, onRemove, onRetry }: UploadProgressItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const previewUrl = useMemo(() => {
    if (!entry.file.type.startsWith("image/")) {
      return null;
    }

    return URL.createObjectURL(entry.file);
  }, [entry.file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCopy = async () => {
    if (!entry.cid) {
      return;
    }

    try {
      await copyToClipboard(entry.cid);
      toast.success("CID copied to clipboard");
    } catch {
      toast.error("Unable to copy the CID");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={entry.file.name} className="h-14 w-14 rounded-xl object-cover" src={previewUrl} />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
            {entry.file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{entry.file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(entry.file.size)}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_TONES[entry.status])}>
              {STATUS_LABELS[entry.status]}
            </span>
          </div>

          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(entry.progress, 100)}%` }} />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>{entry.serverMessage ?? `${Math.round(entry.progress)}% complete`}</span>
            {entry.uploadedAt ? <span>{new Date(entry.uploadedAt).toLocaleString()}</span> : null}
          </div>

          {entry.error ? <p className="mt-3 text-sm text-rose-700">{entry.error}</p> : null}

          {entry.cid && entry.status === "done" ? (
            <div className="mt-3">
              <Button className="gap-2" onClick={() => setShowDetails((previous) => !previous)} type="button" variant="ghost">
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showDetails ? "Hide details" : "Show details"}
              </Button>
              {showDetails ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">CID ready</p>
                  <code className="mt-2 block overflow-x-auto rounded bg-slate-900 px-2 py-1 text-emerald-300">{entry.cid}</code>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={() => void handleCopy()} type="button" variant="ghost">
                      <Copy className="h-4 w-4" />
                      Copy CID
                    </Button>
                    <a className="inline-flex" href={`https://ipfs.io/ipfs/${entry.cid}`} rel="noreferrer noopener" target="_blank">
                      <Button className="gap-2" type="button" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                        View on IPFS
                      </Button>
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {(entry.status === "queued" || entry.status === "uploading") && (
              <Button className="gap-2" onClick={() => onCancel(entry.id)} type="button" variant="ghost">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
            {(entry.status === "error" || entry.status === "cancelled") && (
              <Button className="gap-2" onClick={() => onRetry(entry.id)} type="button" variant="ghost">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
            {(entry.status === "error" || entry.status === "done") && (
              <Button className="gap-2" onClick={() => onRemove(entry.id)} type="button" variant="ghost">
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}