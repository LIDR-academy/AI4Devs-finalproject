/**
 * UploadZone Component Constants
 * 
 * Centralized configuration and messages for the UploadZone component.
 * Following the project pattern of extracting magic strings and numbers.
 */

import type { CSSProperties } from 'react';

/**
 * Default validation constraints
 */
export const UPLOAD_ZONE_DEFAULTS = {
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB in bytes
  ACCEPTED_MIME_TYPES: ['application/x-rhino', 'application/octet-stream'],
  ACCEPTED_EXTENSIONS: ['.3dm'],
} as const;

/**
 * Error messages for file validation failures
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSizeMB: number) => 
    `File is too large. Maximum size is ${maxSizeMB}MB.`,
  INVALID_FILE_TYPE: (extensions: string[]) => 
    `Invalid file type. Only ${extensions.join(', ')} files are accepted.`,
  TOO_MANY_FILES: 'Only one file can be uploaded at a time.',
  INVALID_FILE_OBJECT: 'Invalid file object.',
} as const;

/**
 * CSS class names for component states
 */
export const CLASS_NAMES = {
  CONTAINER: 'upload-zone-container',
  DROPZONE: 'upload-zone',
  ACTIVE: 'upload-zone--active',
  DISABLED: 'upload-zone--disabled',
  ERROR: 'upload-zone--error',
  ERROR_MESSAGE: 'upload-zone-error',
} as const;

/**
 * Inline styles for the dropzone component
 * TODO: Consider moving to CSS modules or styled-components in future iterations
 */
export const STYLES = {
  dropzone: {
    base: {
      border: '2px dashed #ccc',
      borderRadius: '8px',
      padding: '40px 20px',
      textAlign: 'center' as const,
      transition: 'all 0.2s ease-in-out',
    },
    idle: {
      backgroundColor: '#fafafa',
      borderColor: '#ccc',
      cursor: 'pointer' as const,
      opacity: 1,
    },
    active: {
      backgroundColor: '#f0f8ff',
      borderColor: '#4299e1',
    },
    error: {
      backgroundColor: '#fff5f5',
      borderColor: '#fc8181',
    },
    disabled: {
      cursor: 'not-allowed' as const,
      opacity: 0.5,
    },
  },
  dragText: {
    margin: 0,
    color: '#4299e1',
    fontWeight: 500,
  },
  instructionText: {
    primary: {
      margin: '0 0 8px 0',
      fontSize: '16px',
      color: '#2d3748',
    },
    secondary: {
      margin: 0,
      fontSize: '14px',
      color: '#718096',
    },
  },
  errorContainer: {
    marginTop: '12px',
    padding: '12px 16px',
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '6px',
    color: '#c53030',
    fontSize: '14px',
  },
} as const;

/**
 * Helper function to format file size in MB
 * @param bytes - File size in bytes
 * @returns Formatted size in MB (rounded)
 */
export function formatSizeInMB(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

/**
 * Helper function to build dropzone styles based on current state
 * @param isDragActive - Whether a file is being dragged over the dropzone
 * @param hasError - Whether there's a validation error
 * @param isDisabled - Whether the dropzone is disabled
 * @returns Combined style object
 */
export function buildDropzoneStyles(
  isDragActive: boolean,
  hasError: boolean,
  isDisabled: boolean
): CSSProperties {
  return {
    ...STYLES.dropzone.base,
    ...(isDragActive && STYLES.dropzone.active),
    ...(hasError && !isDragActive && STYLES.dropzone.error),
    ...(isDisabled ? STYLES.dropzone.disabled : STYLES.dropzone.idle),
  };
}
