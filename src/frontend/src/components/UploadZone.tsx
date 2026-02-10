import { useCallback, useState } from 'react';
import { useDropzone, type DropEvent, type FileError } from 'react-dropzone';
import type { UploadZoneProps, FileRejection, FileRejectionError, FileRejectionErrorCode } from '../types/upload';
import {
  UPLOAD_ZONE_DEFAULTS,
  ERROR_MESSAGES,
  CLASS_NAMES,
  STYLES,
  formatSizeInMB,
  buildDropzoneStyles,
} from './UploadZone.constants';

/**
 * UploadZone Component
 * 
 * Drag-and-drop file upload zone with validation for Rhino .3dm files.
 * Uses react-dropzone for enhanced UX with visual feedback.
 * 
 * @component
 * @example
 * ```tsx
 * <UploadZone
 *   onFilesAccepted={(files) => console.log('Accepted:', files)}
 *   onFilesRejected={(rejections) => console.log('Rejected:', rejections)}
 *   maxFileSize={500 * 1024 * 1024}
 *   acceptedExtensions={['.3dm']}
 * />
 * ```
 */
export function UploadZone({
  onFilesAccepted,
  onFilesRejected,
  maxFileSize = UPLOAD_ZONE_DEFAULTS.MAX_FILE_SIZE,
  acceptedMimeTypes = UPLOAD_ZONE_DEFAULTS.ACCEPTED_MIME_TYPES,
  acceptedExtensions = UPLOAD_ZONE_DEFAULTS.ACCEPTED_EXTENSIONS,
  multiple = false,
  disabled = false,
  className = '',
}: UploadZoneProps) {
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Custom file validator to check file extension
   * react-dropzone's built-in accept only checks MIME types,
   * but MIME detection can be unreliable for .3dm files
   */
  const fileValidator = useCallback(
    (file: File): FileError | null => {
      // Defensive check for file properties
      if (!file || !file.name) {
        return {
          code: 'file-invalid-type' as FileRejectionErrorCode,
          message: ERROR_MESSAGES.INVALID_FILE_OBJECT,
        };
      }

      // Extract file extension
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      // Check if extension is in accepted list
      if (!acceptedExtensions.includes(fileExtension)) {
        return {
          code: 'file-invalid-type' as FileRejectionErrorCode,
          message: ERROR_MESSAGES.INVALID_FILE_TYPE(acceptedExtensions),
        };
      }

      return null; // File is valid
    },
    [acceptedExtensions]
  );

  /**
   * Handle file drop/selection
   */
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[], event: DropEvent) => {
      // Clear previous error messages when new files are dropped
      setErrorMessage('');

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }

      // Handle rejected files
      if (fileRejections.length > 0) {
        // Map react-dropzone rejections to our FileRejection interface
        const mappedRejections: FileRejection[] = fileRejections.map((rejection) => ({
          file: rejection.file,
          errors: rejection.errors.map((error: any) => ({
            code: error.code as FileRejectionErrorCode,
            message: error.message,
          })),
        }));

        // Build error message for UI display
        const firstRejection = mappedRejections[0];
        const firstError = firstRejection.errors[0];
        
        if (firstError.code === 'file-too-large') {
          setErrorMessage(ERROR_MESSAGES.FILE_TOO_LARGE(formatSizeInMB(maxFileSize)));
        } else if (firstError.code === 'file-invalid-type') {
          setErrorMessage(ERROR_MESSAGES.INVALID_FILE_TYPE(acceptedExtensions));
        } else if (firstError.code === 'too-many-files') {
          setErrorMessage(ERROR_MESSAGES.TOO_MANY_FILES);
        } else {
          setErrorMessage(firstError.message);
        }

        // Call rejection callback if provided
        if (onFilesRejected) {
          onFilesRejected(mappedRejections);
        }
      }
    },
    [onFilesAccepted, onFilesRejected, maxFileSize, acceptedExtensions]
  );

  /**
   * Configure react-dropzone
   */
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: acceptedMimeTypes.reduce((acc, mimeType) => {
      acc[mimeType] = acceptedExtensions;
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple,
    disabled,
    validator: fileValidator,
  });

  /**
   * Build CSS classes
   */
  const rootClasses = [
    CLASS_NAMES.DROPZONE,
    isDragActive && CLASS_NAMES.ACTIVE,
    disabled && CLASS_NAMES.DISABLED,
    errorMessage && CLASS_NAMES.ERROR,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={CLASS_NAMES.CONTAINER}>
      <div
        {...getRootProps()}
        className={rootClasses}
        data-testid="upload-dropzone"
        style={buildDropzoneStyles(isDragActive, !!errorMessage, disabled)}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <p style={STYLES.dragText}>
            Drop the file here...
          </p>
        ) : (
          <div>
            <p style={STYLES.instructionText.primary}>
              Drag & drop your .3dm file here, or click to select
            </p>
            <p style={STYLES.instructionText.secondary}>
              Maximum file size: {formatSizeInMB(maxFileSize)}MB
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          className={CLASS_NAMES.ERROR_MESSAGE}
          data-testid="upload-error-message"
          style={STYLES.errorContainer}
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
