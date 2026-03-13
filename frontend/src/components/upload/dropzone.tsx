"use client";

import { UploadCloud } from "lucide-react";
import { useDropzone, type FileRejection } from "react-dropzone";

import { DROPZONE_ACCEPT, MAX_CONCURRENT_FILES, MAX_FILE_SIZE_BYTES, formatFileSize } from "@/lib/file-validation";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  disabled?: boolean;
  errors?: string[];
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected: (messages: string[]) => void;
};

function mapRejectionToMessage(rejection: FileRejection) {
  return rejection.errors.map((error) => {
    if (error.code === "file-too-large") {
      return `${rejection.file.name} exceeds the ${formatFileSize(MAX_FILE_SIZE_BYTES)} upload limit.`;
    }

    if (error.code === "file-invalid-type") {
      return `${rejection.file.name} does not match the supported file types.`;
    }

    if (error.code === "too-many-files") {
      return `You can upload up to ${MAX_CONCURRENT_FILES} files at a time.`;
    }

    return `${rejection.file.name}: ${error.message}`;
  });
}

export function Dropzone({ disabled = false, errors = [], onFilesAccepted, onFilesRejected }: DropzoneProps) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: DROPZONE_ACCEPT,
    disabled,
    maxFiles: MAX_CONCURRENT_FILES,
    maxSize: MAX_FILE_SIZE_BYTES,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }

      if (rejectedFiles.length > 0) {
        onFilesRejected(rejectedFiles.flatMap(mapRejectionToMessage));
      }
    },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-3xl border border-dashed px-6 py-10 text-center transition",
          isDragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input {...getInputProps({ "aria-label": "Upload files", "data-testid": "upload-file-input" })} />
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
          <div className="rounded-full bg-emerald-100 p-4 text-emerald-700">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {isDragActive ? "Drop files to start the upload queue" : "Drag files here or click to browse"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Up to {MAX_CONCURRENT_FILES} files per batch, maximum {formatFileSize(MAX_FILE_SIZE_BYTES)} each.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1">JPG / PNG / WEBP / GIF</span>
            <span className="rounded-full bg-white px-3 py-1">PDF / TXT / JSON</span>
            <span className="rounded-full bg-white px-3 py-1">MP4 / WEBM</span>
          </div>
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Selection issues</p>
          <ul className="mt-2 space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}