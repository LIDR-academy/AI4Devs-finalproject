import { useCallback, useState } from 'react';
import { useDropzone, type DropEvent, type FileError } from 'react-dropzone';
import type { UploadZoneProps, FileRejection, FileRejectionError, FileRejectionErrorCode } from '../types/upload';

const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
const DEFAULT_ACCEPTED_MIME_TYPES = ['application/x-rhino', 'application/octet-stream'];
const DEFAULT_ACCEPTED_EXTENSIONS = ['.3dm'];

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
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedMimeTypes = DEFAULT_ACCEPTED_MIME_TYPES,
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
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
          message: 'Invalid file object.',
        };
      }

      // Extract file extension
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      // Check if extension is in accepted list
      if (!acceptedExtensions.includes(fileExtension)) {
        return {
          code: 'file-invalid-type' as FileRejectionErrorCode,
          message: `Invalid file type. Only ${acceptedExtensions.join(', ')} files are accepted.`,
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
          const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
          setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        } else if (firstError.code === 'file-invalid-type') {
          setErrorMessage(`Invalid file type. Only ${acceptedExtensions.join(', ')} files are accepted.`);
        } else if (firstError.code === 'too-many-files') {
          setErrorMessage('Only one file can be uploaded at a time.');
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
    'upload-zone',
    isDragActive && 'upload-zone--active',
    disabled && 'upload-zone--disabled',
    errorMessage && 'upload-zone--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="upload-zone-container">
      <div
        {...getRootProps()}
        className={rootClasses}
        data-testid="upload-dropzone"
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f8ff' : errorMessage ? '#fff5f5' : '#fafafa',
          borderColor: isDragActive ? '#4299e1' : errorMessage ? '#fc8181' : '#ccc',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <p style={{ margin: 0, color: '#4299e1', fontWeight: 500 }}>
            Drop the file here...
          </p>
        ) : (
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2d3748' }}>
              Drag & drop your .3dm file here, or click to select
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
              Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          className="upload-zone-error"
          data-testid="upload-error-message"
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            backgroundColor: '#fed7d7',
            border: '1px solid #fc8181',
            borderRadius: '6px',
            color: '#c53030',
            fontSize: '14px',
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
