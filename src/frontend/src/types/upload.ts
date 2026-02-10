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
  file_id: string;
  filename: string;
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

/**
 * Props for UploadZone component (T-001-FRONT)
 * Drag & Drop zone using react-dropzone
 */
export interface UploadZoneProps {
  /**
   * Callback invoked when files are accepted (pass validation)
   * @param files - Array of accepted File objects
   */
  onFilesAccepted: (files: File[]) => void;

  /**
   * Callback invoked when files are rejected (fail validation)
   * @param rejections - Array of file rejection details
   */
  onFilesRejected?: (rejections: FileRejection[]) => void;

  /**
   * Maximum file size in bytes (default: 500MB)
   */
  maxFileSize?: number;

  /**
   * Accepted MIME types (default: ['application/x-rhino'])
   */
  acceptedMimeTypes?: string[];

  /**
   * Accepted file extensions (default: ['.3dm'])
   */
  acceptedExtensions?: string[];

  /**
   * Allow multiple files (default: false)
   */
  multiple?: boolean;

  /**
   * Disabled state (default: false)
   */
  disabled?: boolean;

  /**
   * Custom class name for styling
   */
  className?: string;
}

/**
 * File rejection from react-dropzone
 */
export interface FileRejection {
  file: File;
  errors: FileRejectionError[];
}

/**
 * Error details for rejected file
 */
export interface FileRejectionError {
  code: FileRejectionErrorCode;
  message: string;
}

/**
 * Error codes for file validation failures
 */
export type FileRejectionErrorCode =
  | 'file-too-large'
  | 'file-invalid-type'
  | 'too-many-files';
