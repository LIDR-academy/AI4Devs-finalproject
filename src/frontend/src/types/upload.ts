/**
 * TypeScript interfaces for File Upload functionality
 * Aligned with backend T-002-BACK endpoints
 */

/**
 * Request payload for obtaining a presigned URL from backend
 */
export interface PresignedUrlRequest {
  filename: string;
  size: number;
  checksum?: string;
}

/**
 * Response from backend containing the presigned URL
 * Matches the response from POST /api/upload/url (T-002-BACK)
 */
export interface PresignedUrlResponse {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

/**
 * Upload progress event for UI feedback
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload state for managing UI state machine
 */
export type UploadState = 
  | 'idle'
  | 'requesting-url'
  | 'uploading'
  | 'success'
  | 'error';

/**
 * Upload error details
 */
export interface UploadError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Props for FileUploader component
 */
export interface FileUploaderProps {
  /**
   * Callback invoked when upload completes successfully
   * @param fileKey - The S3 key of the uploaded file
   */
  onUploadComplete?: (fileKey: string) => void;

  /**
   * Callback invoked when upload fails
   * @param error - Error details
   */
  onUploadError?: (error: UploadError) => void;

  /**
   * Callback for progress updates
   * @param progress - Current upload progress
   */
  onProgress?: (progress: UploadProgress) => void;

  /**
   * Maximum file size in bytes (default: 500MB)
   */
  maxFileSize?: number;

  /**
   * Accepted file extensions (default: ['.3dm'])
   */
  acceptedExtensions?: string[];
}
