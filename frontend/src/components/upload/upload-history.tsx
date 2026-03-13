"use client";

import { Copy, ExternalLink, History, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFileSize } from "@/lib/file-validation";
import type { UploadHistoryEntry } from "@/types/upload";

type UploadHistoryProps = {
  history: UploadHistoryEntry[];
  onClear: () => void;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

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

export function UploadHistory({ history, onClear }: UploadHistoryProps) {
  const handleCopy = async (cid: string) => {
    try {
      await copyToClipboard(cid);
      toast.success("CID copied to clipboard");
    } catch {
      toast.error("Unable to copy the CID");
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upload History</h2>
            <p className="text-sm text-slate-600">Current browser session only.</p>
          </div>
        </div>
        <Button className="gap-2" disabled={history.length === 0} onClick={onClear} type="button" variant="ghost">
          <Trash2 className="h-4 w-4" />
          Clear history
        </Button>
      </div>

      {history.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No uploads yet this session.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between" key={entry.id}>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{entry.filename}</p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(entry.size)} · {new Date(entry.uploadedAt).toLocaleString()}
                </p>
                <code className="mt-2 block overflow-x-auto rounded bg-slate-900 px-2 py-1 text-xs text-emerald-300">{entry.cid}</code>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" onClick={() => void handleCopy(entry.cid)} type="button" variant="ghost">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <a className="inline-flex" href={`https://ipfs.io/ipfs/${entry.cid}`} rel="noreferrer noopener" target="_blank">
                  <Button className="gap-2" type="button" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}