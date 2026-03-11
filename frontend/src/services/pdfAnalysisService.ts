/**
 * PDF Analysis Service - API integration utilities for template analysis
 */

import type {
  AnalysisResponse,
  ErrorResponse,
  FileValidationResult,
  ProgressCallback
} from "../types/pdfAnalysis";
import { AnalysisError, DEFAULT_ANALYZER_CONFIG } from "../types/pdfAnalysis";

/**
 * Validates a PDF file for upload
 * @param file - File to validate
 * @returns Validation result with isValid flag and optional error message
 */
export const validatePDFFile = (file: File): FileValidationResult => {
  // Check file extension first - must have .pdf extension
  const hasValidExtension = file.name.toLowerCase().endsWith(".pdf");
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Please select a PDF file (.pdf extension required).",
    };
  }

  // Check MIME type as secondary validation
  const hasValidMimeType = file.type === "application/pdf";
  
  if (!hasValidMimeType) {
    // Allow files with PDF extension even if MIME type is not set correctly
    // This handles cases where the browser doesn't detect PDF MIME type properly
    console.warn(`File has .pdf extension but MIME type is: ${file.type}`);
  }

  // Check file size (10MB limit)
  const maxSize = DEFAULT_ANALYZER_CONFIG.maxFileSize;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(
        1
      )}MB) exceeds 10MB limit.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "Selected file is empty. Please choose a valid PDF file.",
    };
  }

  return { isValid: true };
};

/**
 * Handles API response and converts errors to AnalysisError
 * @param response - Fetch Response object
 * @returns Parsed AnalysisResponse
 * @throws AnalysisError for error responses
 */
export const handleResponse = async (
  response: Response
): Promise<AnalysisResponse> => {
  if (response.ok) {
    return response.json();
  }

  const errorData: ErrorResponse = await response.json().catch(() => ({
    status: "error" as const,
    error: "unknown_error",
    message: "Unknown error occurred",
    timestamp: new Date().toISOString(),
  }));

  throw new AnalysisError(errorData.message, response.status, errorData.error);
};

/**
 * Gets authorization headers with JWT token if available
 * @returns Headers object with Authorization header
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};

/**
 * Analyzes a PDF template using the backend API
 * @param file - PDF file to analyze
 * @returns Promise resolving to analysis results
 * @throws AnalysisError for various error conditions
 */
export const analyzePDFTemplate = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(DEFAULT_ANALYZER_CONFIG.apiEndpoint, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(response);
};

/**
 * Uploads file with progress tracking using XMLHttpRequest
 * @param file - PDF file to upload
 * @param onProgress - Callback for progress updates (0-100)
 * @returns Promise resolving to analysis results
 * @throws AnalysisError for upload or processing errors
 */
export const uploadWithProgress = async (
  file: File,
  onProgress: ProgressCallback
): Promise<AnalysisResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    // Handle successful response
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: AnalysisResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new AnalysisError("Invalid response format"));
        }
      } else {
        // Try to parse error response
        try {
          const errorResponse: ErrorResponse = JSON.parse(xhr.responseText);
          reject(
            new AnalysisError(errorResponse.message, xhr.status, errorResponse.error)
          );
        } catch {
          reject(
            new AnalysisError(`Upload failed: ${xhr.statusText}`, xhr.status)
          );
        }
      }
    });

    // Handle network errors
    xhr.addEventListener("error", () => {
      reject(new AnalysisError("Network error occurred"));
    });

    // Handle timeout
    xhr.addEventListener("timeout", () => {
      reject(new AnalysisError("Request timeout. Please try again."));
    });

    // Configure and send request
    xhr.open("POST", DEFAULT_ANALYZER_CONFIG.apiEndpoint);
    xhr.timeout = DEFAULT_ANALYZER_CONFIG.timeout;
    
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
};

/**
 * Converts various error types to user-friendly messages
 * @param error - Error object of unknown type
 * @returns User-friendly error message
 */
export const handleAnalysisError = (error: unknown): string => {
  if (error instanceof AnalysisError) {
    // Handle authentication errors
    if (error.statusCode === 401) {
      return "Not authenticated. Please log in and try again.";
    }
    if (error.statusCode === 403) {
      return "Access forbidden. You don't have permission to analyze templates.";
    }

    switch (error.errorCode) {
      case "invalid_file_format":
        return "Please upload a valid PDF file.";
      case "file_too_large":
        return "File size exceeds 10MB limit. Please choose a smaller file.";
      case "no_form_fields":
        return "No form fields found in this PDF. Please upload a form-enabled PDF.";
      case "processing_error":
        return "Error processing PDF. Please try again or use a different file.";
      case "timeout":
        return "Request timeout. Please check your connection and try again.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return "An unexpected error occurred. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
};

/**
 * Retries an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxAttempts - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise resolving to operation result
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = DEFAULT_ANALYZER_CONFIG.retryAttempts,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry for certain error types
      if (error instanceof AnalysisError) {
        const nonRetryableErrors = [
          "invalid_file_format",
          "file_too_large",
          "no_form_fields",
        ];
        if (nonRetryableErrors.includes(error.errorCode || "")) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Analyzes PDF with retry logic and progress tracking
 * @param file - PDF file to analyze
 * @param onProgress - Progress callback
 * @param maxRetries - Maximum retry attempts
 * @returns Promise resolving to analysis results
 */
export const analyzePDFWithRetry = async (
  file: File,
  onProgress: ProgressCallback,
  maxRetries: number = DEFAULT_ANALYZER_CONFIG.retryAttempts
): Promise<AnalysisResponse> => {
  // Validate file first
  const validation = validatePDFFile(file);
  if (!validation.isValid) {
    throw new AnalysisError(validation.error!, 400, "invalid_file_format");
  }

  // Use retry logic with progress tracking
  return retryWithBackoff(
    () => uploadWithProgress(file, onProgress),
    maxRetries
  );
};

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Checks if browser supports drag and drop
 * @returns True if drag and drop is supported
 */
export const isDragAndDropSupported = (): boolean => {
  return (
    "draggable" in document.createElement("div") &&
    "ondragstart" in document.createElement("div") &&
    "ondrop" in document.createElement("div")
  );
};

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Creates a utility function for handling file drops
 * @param onFileSelect - Callback for file selection
 * @param onError - Callback for validation errors
 * @returns Drop event handler
 */
export const createDropHandler = (
  onFileSelect: (file: File) => void,
  onError: (error: string) => void
) => {
  return (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      onError("No files were dropped.");
      return;
    }

    if (files.length > 1) {
      onError("Please drop only one file at a time.");
      return;
    }

    const file = files[0];
    const validation = validatePDFFile(file);

    if (!validation.isValid) {
      onError(validation.error!);
      return;
    }

    onFileSelect(file);
  };
};
