export interface FileInfo {
  id?: number;
  cid: string;
  original_filename: string;
  safe_filename?: string;
  size: number;
  pinned: boolean;
  uploaded_at: string;
  content_type?: string;
}

export interface UploadTaskStatus {
  status: "pending" | "in_progress" | "completed" | "failed";
  task_id: string;
  progress: number;
}
