/**
 * FileUploadZone - Drag and drop file upload component for PDF analysis
 */

import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDragAndDrop, useFocusManagement } from "../../hooks/usePDFAnalysis";
import {
  formatFileSize,
  isDragAndDropSupported,
  validatePDFFile,
} from "../../services/pdfAnalysisService";
import type {
  FileUploadZoneProps
} from "../../types/pdfAnalysis";

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  onAnalyze,
  selectedFile,
  uploadState,
  error,
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const { dragState, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, resetDragState } = useDragAndDrop();
  const { handleKeyDown } = useFocusManagement();
  const [isDragSupported] = useState(isDragAndDropSupported());

  // Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validation = validatePDFFile(file);

      if (validation.isValid) {
        onFileSelect(file);
      } else {
        // Let parent handle validation errors through error prop
      }

      // Reset input value to allow selecting the same file again
      event.target.value = "";
    },
    [onFileSelect]
  );

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (disabled || uploadState === "uploading" || uploadState === "processing") {
      return;
    }
    fileInputRef.current?.click();
  }, [disabled, uploadState]);

  // Handle button click (prevents event propagation to parent div)
  const handleButtonClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent double-opening of file dialog
    handleClick();
  }, [handleClick]);

  // Handle file drop
  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const droppedEvent = handleDrop(event);
      
      if (disabled || uploadState === "uploading" || uploadState === "processing") {
        return;
      }

      const files = droppedEvent.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0]; // Only handle first file
      const validation = validatePDFFile(file);

      if (validation.isValid) {
        onFileSelect(file);
      } else {
        // Let parent handle validation errors
      }
    },
    [handleDrop, disabled, uploadState, onFileSelect]
  );

  // Handle keyboard navigation
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(
        event,
        () => handleClick(), // Enter
        () => selectedFile && onFileSelect(null) // Escape to clear
      );
    },
    [handleKeyDown, handleClick, selectedFile, onFileSelect]
  );

  // Handle remove file
  const handleRemoveFile = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onFileSelect(null);
    },
    [onFileSelect]
  );

  // Handle analyze button click
  const handleAnalyzeClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault(); // Prevent any default behavior
      
      // Prevent multiple clicks while uploading/processing
      if (uploadState === "uploading" || uploadState === "processing") {
        console.warn('[FileUploadZone] Analyze already in progress, ignoring click');
        return;
      }
      
      onAnalyze();
    },
    [onAnalyze, uploadState]
  );

  // Handle retry after error
  const handleRetry = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault(); // Prevent any default behavior
      
      // Prevent multiple clicks while uploading/processing
      if (uploadState === "uploading" || uploadState === "processing") {
        console.warn('[FileUploadZone] Retry already in progress, ignoring click');
        return;
      }
      
      onAnalyze();
    },
    [onAnalyze, uploadState]
  );

  // Reset drag state on disabled change
  useEffect(() => {
    if (disabled) {
      resetDragState();
    }
  }, [disabled, resetDragState]);

  // Determine current state classes
  const getStateClasses = () => {
    const baseClasses = [
      "relative",
      "border-2",
      "border-dashed",
      "rounded-lg",
      "transition-all",
      "duration-200",
      "ease-in-out",
      "p-4",
      "sm:p-6",
      "lg:p-8",
    ];

    if (disabled) {
      baseClasses.push(
        "opacity-50",
        "cursor-not-allowed",
        "border-gray-300",
        "bg-gray-50"
      );
    } else if (error && uploadState === "error") {
      baseClasses.push(
        "border-red-500",
        "bg-red-50",
        "dark:bg-red-900/20",
        "dark:border-red-400"
      );
    } else if (uploadState === "success") {
      baseClasses.push(
        "border-green-500",
        "bg-green-50",
        "dark:bg-green-900/20",
        "dark:border-green-400",
        "cursor-default" // Not clickable when analysis is complete
      );
    } else if (dragState.isDragOver && !disabled) {
      baseClasses.push(
        "border-blue-500",
        "bg-blue-50",
        "dark:bg-blue-900/20",
        "dark:border-blue-400"
      );
    } else {
      baseClasses.push(
        "border-gray-300",
        "bg-gray-50",
        "hover:border-gray-400",
        "hover:bg-gray-100",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:hover:border-gray-500",
        "dark:hover:bg-gray-700",
        "cursor-pointer"
      );
    }

    return baseClasses.join(" ");
  };

  // Render upload state content
  const renderUploadStateContent = () => {
    // During uploading/processing, still show file info but with loading state
    if ((uploadState === "uploading" || uploadState === "processing") && selectedFile) {
      return (
        <div className="text-center">
          <Loader2
            data-testid="loader-icon"
            className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-3"
          />
          <FileText
            data-testid="file-text-icon"
            className="mx-auto h-8 w-8 text-blue-500 mb-2"
          />
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uploadState === "uploading" ? "Uploading..." : "Analyzing PDF..."}
          </p>
          <div className="mt-4 flex justify-center space-x-3">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={true}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md opacity-50 cursor-not-allowed"
            >
              Analyze PDF
            </button>
          </div>
        </div>
      );
    }

    switch (uploadState) {
      case "uploading":
        return (
          <div className="text-center">
            <Loader2
              data-testid="loader-icon"
              className="mx-auto h-12 w-12 text-blue-500 animate-spin"
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Uploading...
            </p>
          </div>
        );

      case "processing":
        return (
          <div className="text-center">
            <Loader2
              data-testid="loader-icon"
              className="mx-auto h-12 w-12 text-blue-500 animate-spin"
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Analyzing PDF...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle
              data-testid="check-circle-icon"
              className="mx-auto h-12 w-12 text-green-500"
            />
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Analysis Complete!
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <AlertCircle
              data-testid="alert-circle-icon"
              className="mx-auto h-12 w-12 text-red-500"
            />
            <div
              role="alert"
              className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-md"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            {selectedFile && (
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        );

      default:
        return renderIdleContent();
    }
  };

  // Render idle state content
  const renderIdleContent = () => {
    if (selectedFile) {
      return (
        <div className="text-center">
          <FileText
            data-testid="file-text-icon"
            className="mx-auto h-12 w-12 text-blue-500"
          />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <div className="mt-4 flex justify-center space-x-3">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={disabled || uploadState === "uploading" || uploadState === "processing"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Analyze PDF
            </button>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              aria-label="Remove file"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <X data-testid="x-icon" className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <Upload
          data-testid="upload-icon"
          className="mx-auto h-12 w-12 text-gray-400"
        />
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Drag and drop your PDF file here
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            or click to browse
          </p>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled}
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
          >
            Choose File
          </button>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">
            Maximum file size: 10MB • PDF files only
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`file-upload-zone ${className}`}>
      <div
        ref={uploadZoneRef}
        data-testid="file-upload-zone"
        role={uploadState === "success" ? "status" : "button"}
        tabIndex={disabled || uploadState === "success" ? -1 : 0}
        aria-label={
          uploadState === "success"
            ? "Analysis completed successfully"
            : selectedFile
            ? `Selected file: ${selectedFile.name}. Press Enter to analyze, Escape to remove.`
            : "Upload PDF file. Drag and drop or click to browse."
        }
        aria-describedby="upload-instructions"
        aria-disabled={disabled || uploadState === "uploading" || uploadState === "processing" || uploadState === "success"}
        className={`${getStateClasses()} ${className}`}
        onClick={uploadState === "success" ? undefined : handleClick}
        onDragEnter={disabled || uploadState === "success" ? undefined : handleDragEnter}
        onDragLeave={disabled || uploadState === "success" ? undefined : handleDragLeave}
        onDragOver={disabled || uploadState === "success" ? undefined : handleDragOver}
        onDrop={disabled || uploadState === "success" ? undefined : handleFileDrop}
        onKeyDown={disabled || uploadState === "success" ? undefined : handleKeyPress}
      >
        {renderUploadStateContent()}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          data-testid="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="sr-only"
          aria-hidden="true"
        />

        {/* Screen reader instructions */}
        <div id="upload-instructions" className="sr-only">
          Upload a PDF file up to 10MB in size. You can drag and drop the file
          onto this area or click to open a file browser. Only PDF files are
          accepted.
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
