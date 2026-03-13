"use client";

import { Card } from "@/components/ui/card";
import type { UploadEntry } from "@/types/upload";

import { UploadProgressItem } from "./upload-progress-item";

type UploadQueueProps = {
  entries: UploadEntry[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
};

export function UploadQueue({ entries, onCancel, onRetry }: UploadQueueProps) {
  const activeCount = entries.filter((entry) => entry.status === "uploading" || entry.status === "processing").length;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload Queue</h2>
          <p className="text-sm text-slate-600">Track each file from selection through CID generation.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Active {activeCount} / {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          No files in the queue yet. Select files above to start uploading.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <UploadProgressItem entry={entry} key={entry.id} onCancel={onCancel} onRetry={onRetry} />
          ))}
        </div>
      )}
    </Card>
  );
}