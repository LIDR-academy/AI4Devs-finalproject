/**
 * TemplateAnalyzePage - Main page component for PDF template analysis
 */

import { ArrowLeft, Download, FileUp, RefreshCw, Save } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploadZone from "../../components/FileUploadZone/FileUploadZone";
import TemplateFieldTable from "../../components/TemplateFieldTable/TemplateFieldTable";
import TemplateSaveModal from "../../components/TemplateSaveModal/TemplateSaveModal";
import type { VersionUploadFormData } from "../../components/VersionUploadModal";
import VersionUploadModal from "../../components/VersionUploadModal/VersionUploadModal";
import { useAnalyzePageState, useResponsiveBreakpoints } from "../../hooks/usePDFAnalysis";
import { templatesService } from "../../services/templates.service";
import type { TemplateAnalyzePageProps } from "../../types/pdfAnalysis";
import type { TemplateNameItem } from "../../types/templates.types";

/**
 * Progress bar component for upload progress
 */
interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${progress}%`}
      />
    </div>
  );
};

/**
 * Status indicator component for different upload states
 */
interface StatusIndicatorProps {
  uploadState: string;
  error: string | null;
  progress: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ uploadState, error, progress }) => {
  const getStatusContent = () => {
    switch (uploadState) {
      case "uploading":
        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Uploading PDF...</span>
            </div>
            <ProgressBar progress={progress} className="w-64" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
        );
      
      case "processing":
        return (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analyzing PDF structure...</span>
          </div>
        );
      
      case "success":
        // Don't show duplicate "Analysis Complete!" message
        // The FileUploadZone already shows a nice success indicator
        return null;
      
      case "error":
        return (
          <div className="text-red-600 dark:text-red-400">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Analysis Failed</span>
            </div>
            {error && (
              <p className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <div
      className="flex justify-center py-4"
      role="status"
      aria-live="polite"
      aria-label="Upload status"
    >
      {content}
    </div>
  );
};

/**
 * Action buttons component for different states
 */
interface ActionButtonsProps {
  uploadState: string;
  onAnalyzeAnother: () => void;
  onExportResults: () => void;
  onSaveTemplate: () => void;
  onSaveVersion: () => void;
  onRetry: () => void;
  onChooseDifferentFile: () => void;
  hasResults: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  uploadState,
  onAnalyzeAnother,
  onExportResults,
  onSaveTemplate,
  onSaveVersion,
  onRetry,
  onChooseDifferentFile,
  hasResults,
}) => {
  if (uploadState === "success" && hasResults) {
    return (
      <div className="flex flex-col gap-4 mt-6">
        {/* Primary Actions Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onSaveTemplate}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            data-testid="save-new-template-button"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Nuevo Template</span>
          </button>
          <button
            onClick={onSaveVersion}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            data-testid="save-new-version-button"
          >
            <FileUp className="h-4 w-4" />
            <span>Guardar Nueva Versión</span>
          </button>
        </div>
        
        {/* Secondary Actions Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onExportResults}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </button>
          <button
            onClick={onAnalyzeAnother}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Analyze Another File</span>
          </button>
        </div>
      </div>
    );
  }

  if (uploadState === "error") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
        <button
          onClick={onRetry}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
        <button
          onClick={onChooseDifferentFile}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Choose Different File</span>
        </button>
      </div>
    );
  }

  return null;
};

/**
 * Main TemplateAnalyzePage component
 */
const TemplateAnalyzePage: React.FC<TemplateAnalyzePageProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  
  const {
    state,
    handleFileSelect,
    handleAnalyze,
    handleReset,
    handleOpenSaveModal,
    handleCloseSaveModal,
    handleSaveTemplate,
  } = useAnalyzePageState();
  const breakpoints = useResponsiveBreakpoints();

  // Version upload modal state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionUploadError, setVersionUploadError] = useState<string | null>(null);
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);

  const {
    uploadState,
    selectedFile,
    analysisResults,
    metadata,
    error,
    progress,
    showSaveModal,
    isSaving,
    saveError,
  } = state;

  // Determine responsive padding
  const containerPadding = breakpoints.mobile ? "px-4" : breakpoints.tablet ? "px-6" : "px-8";
  const maxWidth = breakpoints.mobile ? "max-w-full" : "max-w-6xl";

  // Wrap handleSaveTemplate to add navigation after success
  const handleSaveTemplateWithNavigation = useCallback(
    async (data: { name: string; version: string; sepe_url?: string; comment?: string }) => {
      await handleSaveTemplate(data, (versionId: number) => {
        // Navigate to success page after successful save
        navigate(`/templates/created/${versionId}`);
      });
    },
    [handleSaveTemplate, navigate]
  );

  // Export results to JSON
  const handleExportResults = useCallback(() => {
    if (!analysisResults || !metadata) return;

    const exportData = {
      fileName: selectedFile?.name || "unknown.pdf",
      analysisDate: new Date().toISOString(),
      metadata,
      fields: analysisResults,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedFile?.name?.replace('.pdf', '') || 'template'}-analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [analysisResults, metadata, selectedFile]);

  // Handle retry action
  const handleRetry = useCallback(() => {
    if (selectedFile) {
      handleAnalyze();
    }
  }, [selectedFile, handleAnalyze]);

  // Handle choose different file action
  const handleChooseDifferentFile = useCallback(() => {
    handleReset();
  }, [handleReset]);

  // Handle version modal open/close
  const handleOpenVersionModal = useCallback(() => {
    setShowVersionModal(true);
    setVersionUploadError(null);
  }, []);

  const handleCloseVersionModal = useCallback(() => {
    if (!isUploadingVersion) {
      setShowVersionModal(false);
      setVersionUploadError(null);
    }
  }, [isUploadingVersion]);

  // Fetch template names for version modal selector
  const fetchTemplateNames = useCallback(async (search?: string): Promise<TemplateNameItem[]> => {
    try {
      const response = await templatesService.getTemplateNames(search);
      return response.items;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to load templates'
      );
    }
  }, []);

  // Handle version upload submission
  const handleSaveVersion = useCallback(
    async (data: VersionUploadFormData) => {
      if (!selectedFile) return;

      setIsUploadingVersion(true);
      setVersionUploadError(null);

      try {
        const response = await templatesService.ingestTemplateVersion({
          template_id: data.template_id,
          version: data.version,
          change_summary: data.change_summary || undefined,
          sepe_url: data.sepe_url || undefined,
          file: selectedFile,
        });

        // Navigate to version detail page on success
        navigate(`/templates/versions/${response.version_id}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload version';
        setVersionUploadError(errorMessage);
      } finally {
        setIsUploadingVersion(false);
      }
    },
    [selectedFile, navigate]
  );

  const showResults = uploadState === "success" && analysisResults && analysisResults.length > 0;
  const isProcessing = uploadState === "uploading" || uploadState === "processing";

  return (
    <div
      className={`template-analyze-page min-h-screen bg-gray-50 dark:bg-gray-900 ${containerPadding} py-8 ${className}`}
      data-testid="template-analyze-page"
    >
      <div className={`mx-auto ${maxWidth}`}>
        <main role="main" aria-label="PDF Template Analysis">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              PDF Template Analyzer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload a PDF form to analyze its structure and extract form field information.
              Get detailed insights about field types, locations, and available options.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              uploadState={uploadState}
              selectedFile={selectedFile}
              error={error}
              progress={progress}
              disabled={isProcessing}
              data-testid="file-upload-zone"
            />
          </div>

          {/* Status Indicator */}
          <StatusIndicator
            uploadState={uploadState}
            error={error}
            progress={progress}
          />

          {/* Action Buttons */}
          <ActionButtons
            uploadState={uploadState}
            onAnalyzeAnother={handleReset}
            onExportResults={handleExportResults}
            onSaveTemplate={handleOpenSaveModal}
            onSaveVersion={handleOpenVersionModal}
            onRetry={handleRetry}
            onChooseDifferentFile={handleChooseDifferentFile}
            hasResults={!!analysisResults && analysisResults.length > 0}
          />

          {/* Results Section */}
          {showResults && (
            <div className="mt-12">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Analysis Results
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    File: <span className="font-medium">{selectedFile?.name}</span>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 mb-6" />
              </div>

              <TemplateFieldTable
                fields={analysisResults}
                metadata={metadata!}
                loading={false}
                data-testid="template-field-table"
              />
            </div>
          )}

          {/* Empty Results Message */}
          {uploadState === "success" && (!analysisResults || analysisResults.length === 0) && (
            <div className="mt-12 text-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  No Form Fields Found
                </h3>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  The uploaded PDF doesn't contain any analyzable form fields. 
                  Please try uploading a PDF form with interactive elements.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                >
                  Try Another File
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {uploadState === "error" && error && (
            <div className="mt-8" role="alert">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Analysis Error
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Template Save Modal */}
      {selectedFile && (
        <TemplateSaveModal
          isOpen={showSaveModal}
          onClose={handleCloseSaveModal}
          onSave={handleSaveTemplateWithNavigation}
          file={selectedFile}
          isLoading={isSaving}
          error={saveError}
        />
      )}

      {/* Version Upload Modal */}
      {selectedFile && (
        <VersionUploadModal
          isOpen={showVersionModal}
          onClose={handleCloseVersionModal}
          onSave={handleSaveVersion}
          file={selectedFile}
          isLoading={isUploadingVersion}
          error={versionUploadError}
          fetchTemplateNames={fetchTemplateNames}
        />
      )}
    </div>
  );
};

export default TemplateAnalyzePage;
