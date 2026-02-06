/**
 * FileUploader Component - T-003-FRONT
 * Handles .3dm file upload with validation and progress tracking
 * 
 * @example
 * ```tsx
 * <FileUploader
 *   onUploadComplete={(fileId) => console.log('Uploaded:', fileId)}
 *   onUploadError={(error) => console.error('Error:', error)}
 *   onProgress={(progress) => setProgress(progress.percentage)}
 * />
 * ```
 */

import { useState } from 'react';
import type { 
  FileUploaderProps, 
  UploadState, 
} from '../types/upload';
import { uploadFile } from '../services/upload.service';

/**
 * Default maximum file size: 500MB
 */
const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Default accepted file extensions
 */
const DEFAULT_ACCEPTED_EXTENSIONS = ['.3dm'];

/**
 * Error messages for validation failures
 */
const ERROR_MESSAGES = {
  INVALID_TYPE: (extensions: string[]) => 
    `Invalid file type. Only ${extensions.join(', ')} files are accepted.`,
  FILE_TOO_LARGE: (maxSizeMB: number) => 
    `File size exceeds maximum allowed size of ${maxSizeMB}MB.`,
} as const;

export function FileUploader({
  onUploadComplete,
  onUploadError,
  onProgress,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
}: FileUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  /**
   * Validates a file against extension and size constraints
   * @param file - The file to validate
   * @returns Validation result with error message if invalid
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validate file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!acceptedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_TYPE(acceptedExtensions),
      };
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE(maxFileSize / (1024 * 1024)),
      };
    }

    return { valid: true };
  };

  /**
   * Handles file selection from input element
   * Validates and initiates upload if valid
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadState('error');
      onUploadError?.({
        message: validation.error!,
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    await handleUpload(file);
  };

  /**
   * Orchestrates the upload process using the upload service
   * Updates component state and invokes callbacks
   */
  const handleUpload = async (file: File) => {
    try {
      setUploadState('requesting-url');

      // Use upload service for API communication
      const fileId = await uploadFile(file, onProgress);

      // Upload successful
      setUploadState('success');
      onUploadComplete?.(fileId);
    } catch (error) {
      setUploadState('error');
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.({
        message: errorMessage,
        code: 'UPLOAD_ERROR',
        details: error,
      });
    }
  };

  /**
   * Returns user-friendly message for current upload state
   */
  const getStateMessage = () => {
    switch (uploadState) {
      case 'requesting-url':
        return 'Preparing upload...';
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return null;
    }
  };

  const isUploading = uploadState === 'uploading' || uploadState === 'requesting-url';

  return (
    <div className="file-uploader">
      <div className="upload-zone">
        <label htmlFor="file-input" className="upload-label">
          Choose a file to upload or drag and drop
        </label>
        <input
          id="file-input"
          data-testid="file-input"
          type="file"
          accept={acceptedExtensions.join(',')}
          onChange={handleFileSelect}
          disabled={isUploading}
          aria-label="Upload file"
          aria-busy={isUploading}
          aria-describedby={uploadState !== 'idle' ? 'upload-status' : undefined}
        />
      </div>

      {uploadState !== 'idle' && (
        <div 
          id="upload-status" 
          className="upload-status"
          role="status"
          aria-live="polite"
        >
          <p>{getStateMessage()}</p>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
