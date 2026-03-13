"use client";

import { useState } from "react";
import { ShieldCheck, TimerReset, Upload } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Dropzone } from "@/components/upload/dropzone";
import { UploadHistory } from "@/components/upload/upload-history";
import { UploadQueue } from "@/components/upload/upload-queue";
import { Card } from "@/components/ui/card";
import { MAX_CONCURRENT_FILES, MAX_FILE_SIZE_BYTES, formatFileSize } from "@/lib/file-validation";
import { useUpload } from "@/hooks/use-upload";

export default function UploadPage() {
  const [selectionErrors, setSelectionErrors] = useState<string[]>([]);
  const { entries, history, enqueue, cancel, retry, clearHistory, activeUploads } = useUpload();

  const completedCount = entries.filter((entry) => entry.status === "done").length;

  const handleAcceptedFiles = (files: File[]) => {
    const validationErrors = enqueue(files);
    setSelectionErrors(validationErrors);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Upload Files</h1>
            <p className="mt-1 text-sm text-slate-600">
              Add files to the IPFS gateway with client-side validation, live progress, and instant CID access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">Active uploads: {activeUploads}</span>
            <span className="rounded-full bg-white px-3 py-2 shadow-sm">Completed this session: {completedCount}</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Ready to upload</h2>
                <p className="text-sm text-slate-600">
                  Files are selected in the browser, sent through a secure Next.js proxy, and then uploaded to the backend with your server-held session.
                </p>
              </div>
            </div>
            <Dropzone
              errors={selectionErrors}
              onFilesAccepted={handleAcceptedFiles}
              onFilesRejected={setSelectionErrors}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Constraints</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-medium text-slate-900">Allowed types</p>
                  <p>JPEG, PNG, WEBP, GIF, PDF, TXT, JSON, MP4, WEBM.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TimerReset className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-medium text-slate-900">Batch limit</p>
                  <p>
                    Up to {MAX_CONCURRENT_FILES} files per selection, {formatFileSize(MAX_FILE_SIZE_BYTES)} maximum each.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <UploadQueue entries={entries} onCancel={cancel} onRetry={retry} />
        <UploadHistory history={history} onClear={clearHistory} />
      </div>
    </ProtectedRoute>
  );
}
