/**
 * Template Created Success Page
 * 
 * Displays success message and detailed information after successfully
 * ingesting a new template. Shows template metadata, version details,
 * and provides actions to download PDF, view template, or upload another.
 * 
 * Features:
 * - Fetches version details using useTemplateVersion hook
 * - Loading, error, and success states
 * - Download PDF functionality
 * - Navigation to template details or upload another
 * - Responsive design with mobile support
 * - Dark mode support
 * - Accessibility features (ARIA labels, keyboard navigation)
 * 
 * @author AI4Devs
 * @date 2025-10-26
 */

import { CheckCircle, Download, Eye, FileText, Upload } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTemplateVersion } from '../../hooks/useTemplateVersion';
import { templatesService } from '../../services/templates.service';
import { downloadBlob } from '../../utils/file-download';
import { formatDate, formatFileSize } from '../../utils/formatters';

/**
 * Info card component for displaying metadata
 */
interface InfoCardProps {
  label: string;
  value: string | number | null;
  icon?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon }) => {
  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      {icon && (
        <div className="flex-shrink-0 mt-0.5 text-gray-600 dark:text-gray-400">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </dt>
        <dd className="text-base font-semibold text-gray-900 dark:text-gray-100 break-words">
          {value || '—'}
        </dd>
      </div>
    </div>
  );
};

/**
 * Main TemplateCreatedPage component
 */
const TemplateCreatedPage: React.FC = () => {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  // Fetch version details
  const { data: versionDetail, isLoading, error, refetch } = useTemplateVersion(
    versionId ? Number(versionId) : undefined
  );

  /**
   * Handle PDF download
   */
  const handleDownloadPDF = async () => {
    if (!versionDetail?.id) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const { blob, filename } = await templatesService.downloadTemplateVersion(
        versionDetail.id
      );
      downloadBlob(blob, filename);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download PDF';
      setDownloadError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Navigate to template details
   */
  const handleViewTemplate = () => {
    if (versionDetail?.template.id) {
      navigate(`/templates/${versionDetail.template.id}`);
    }
  };

  /**
   * Navigate to analyze page for another upload
   */
  const handleUploadAnother = () => {
    navigate('/analyze');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                Loading template details...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !versionDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 text-red-500 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Template Not Found
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'The requested template version could not be found.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => refetch()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/templates')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  View All Templates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Template Created Successfully!
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Your template has been analyzed and saved to the system.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Download PDF template"
              >
                <Download className="w-5 h-5" />
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
              
              <button
                onClick={handleViewTemplate}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="View template details"
              >
                <Eye className="w-5 h-5" />
                <span>View Template</span>
              </button>
              
              <button
                onClick={handleUploadAnother}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Upload another template"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Another</span>
              </button>
            </div>

            {/* Download Error */}
            {downloadError && (
              <div
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                role="alert"
              >
                <p className="text-sm text-red-800 dark:text-red-200">
                  {downloadError}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Template Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Template Information</span>
          </h2>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Template Name"
              value={versionDetail.template.name}
            />
            <InfoCard
              label="Version"
              value={versionDetail.version_number}
            />
            <InfoCard
              label="File Size"
              value={formatFileSize(versionDetail.file_size_bytes)}
            />
            <InfoCard
              label="Field Count"
              value={versionDetail.field_count}
            />
            <InfoCard
              label="Page Count"
              value={versionDetail.page_count}
            />
            <InfoCard
              label="Created Date"
              value={formatDate(versionDetail.created_at)}
            />
          </dl>
        </div>

        {/* PDF Metadata */}
        {(versionDetail.title ||
          versionDetail.author ||
          versionDetail.subject) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              PDF Metadata
            </h2>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versionDetail.title && (
                <InfoCard label="Title" value={versionDetail.title} />
              )}
              {versionDetail.author && (
                <InfoCard label="Author" value={versionDetail.author} />
              )}
              {versionDetail.subject && (
                <InfoCard label="Subject" value={versionDetail.subject} />
              )}
              {versionDetail.creation_date && (
                <InfoCard
                  label="PDF Creation Date"
                  value={formatDate(versionDetail.creation_date)}
                />
              )}
              {versionDetail.modification_date && (
                <InfoCard
                  label="PDF Modified Date"
                  value={formatDate(versionDetail.modification_date)}
                />
              )}
            </dl>
          </div>
        )}

        {/* Additional Details */}
        {(versionDetail.change_summary ||
          versionDetail.template.comment ||
          versionDetail.sepe_url) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Additional Details
            </h2>
            
            <dl className="space-y-4">
              {versionDetail.change_summary && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Change Summary
                  </dt>
                  <dd className="text-base text-gray-900 dark:text-gray-100">
                    {versionDetail.change_summary}
                  </dd>
                </div>
              )}
              {versionDetail.template.comment && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Comment
                  </dt>
                  <dd className="text-base text-gray-900 dark:text-gray-100">
                    {versionDetail.template.comment}
                  </dd>
                </div>
              )}
              {versionDetail.sepe_url && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    SEPE URL
                  </dt>
                  <dd>
                    <a
                      href={versionDetail.sepe_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline break-all"
                    >
                      {versionDetail.sepe_url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCreatedPage;
