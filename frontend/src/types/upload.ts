export type UploadStatus = "queued" | "uploading" | "processing" | "done" | "error" | "cancelled";

export type UploadEntry = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  cid?: string;
  error?: string;
  taskId?: string;
  uploadedAt?: string;
  serverMessage?: string;
};

export type UploadHistoryEntry = {
  id: string;
  filename: string;
  cid: string;
  size: number;
  uploadedAt: string;
};

export type UploadRoutePayload = {
  mode: "direct" | "async";
  cid?: string;
  originalFilename?: string;
  size?: number;
  uploadedAt?: string;
  pinned?: boolean;
  taskId?: string;
  statusUrl?: string;
};

export type UploadStatusPayload = {
  taskId: string;
  phase: "pending" | "in_progress" | "done";
  progress: number;
  message?: string;
  result?: {
    cid: string;
    originalFilename: string;
    size: number;
    uploadedAt?: string;
  };
};