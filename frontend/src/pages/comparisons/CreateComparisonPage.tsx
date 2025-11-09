/**
 * CreateComparisonPage - Template version comparison creation interface
 *
 * Allows users to select two template versions and initiate a comparison analysis.
 * Features:
 * - Cascading template and version selectors for source and target
 * - Version metadata preview (field count, page count, dates)
 * - Validation to prevent comparing identical versions
 * - Loading states and error handling
 * - Navigation to comparison results on success
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { templatesService } from '../../services/templates.service';
import type { ComparisonResult } from '../../types/comparison.types';
import type {
  TemplateNameItem,
  TemplateVersion,
} from '../../types/templates.types';

/**
 * Selection state for source or target version
 */
interface VersionSelection {
  templateId: number | null;
  templateName: string;
  versionId: number | null;
  versionDetail: TemplateVersion | null;
}

const CreateComparisonPage: React.FC = () => {
  const navigate = useNavigate();

  // Template names for dropdowns
  const [templateNames, setTemplateNames] = useState<TemplateNameItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Source version selection
  const [sourceSelection, setSourceSelection] = useState<VersionSelection>({
    templateId: null,
    templateName: '',
    versionId: null,
    versionDetail: null,
  });
  const [sourceVersions, setSourceVersions] = useState<TemplateVersion[]>([]);
  const [loadingSourceVersions, setLoadingSourceVersions] = useState(false);

  // Target version selection
  const [targetSelection, setTargetSelection] = useState<VersionSelection>({
    templateId: null,
    templateName: '',
    versionId: null,
    versionDetail: null,
  });
  const [targetVersions, setTargetVersions] = useState<TemplateVersion[]>([]);
  const [loadingTargetVersions, setLoadingTargetVersions] = useState(false);

  // Comparison execution
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // Load template names on mount
  useEffect(() => {
    const loadTemplateNames = async () => {
      try {
        setLoadingTemplates(true);
        setTemplatesError(null);
        // Use the main templates endpoint to get all templates
        const response = await templatesService.getTemplates({
          limit: 100,
          offset: 0,
          sort_by: 'name',
          sort_order: 'asc',
        });
        // Map the full template objects to the simplified TemplateName format
        const names = (response.items || []).map(template => ({
          id: template.id,
          name: template.name,
          current_version: template.current_version || 'N/A',
        }));
        setTemplateNames(names);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load templates';
        setTemplatesError(errorMsg);
        setTemplateNames([]); // Ensure array on error
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplateNames();
  }, []);

  // Load versions when source template changes
  useEffect(() => {
    if (!sourceSelection.templateId) {
      setSourceVersions([]);
      return;
    }

    const loadSourceVersions = async () => {
      try {
        setLoadingSourceVersions(true);
        const response = await templatesService.getTemplateVersions(
          sourceSelection.templateId!,
          { limit: 100, offset: 0, sort_by: 'created_at', sort_order: 'desc' }
        );
        setSourceVersions(response.items || []);
      } catch (error) {
        console.error('Failed to load source versions:', error);
        setSourceVersions([]);
      } finally {
        setLoadingSourceVersions(false);
      }
    };

    loadSourceVersions();
  }, [sourceSelection.templateId]);

  // Load versions when target template changes
  useEffect(() => {
    if (!targetSelection.templateId) {
      setTargetVersions([]);
      return;
    }

    const loadTargetVersions = async () => {
      try {
        setLoadingTargetVersions(true);
        const response = await templatesService.getTemplateVersions(
          targetSelection.templateId!,
          { limit: 100, offset: 0, sort_by: 'created_at', sort_order: 'desc' }
        );
        setTargetVersions(response.items || []);
      } catch (error) {
        console.error('Failed to load target versions:', error);
        setTargetVersions([]);
      } finally {
        setLoadingTargetVersions(false);
      }
    };

    loadTargetVersions();
  }, [targetSelection.templateId]);

  // Handle source template selection
  const handleSourceTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value ? parseInt(e.target.value, 10) : null;
    const template = templateNames.find(t => t.id === templateId);

    setSourceSelection({
      templateId,
      templateName: template?.name || '',
      versionId: null,
      versionDetail: null,
    });
  }, [templateNames]);

  // Handle source version selection
  const handleSourceVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const versionId = e.target.value ? parseInt(e.target.value, 10) : null;
    const version = sourceVersions.find(v => v.id === versionId);

    setSourceSelection(prev => ({
      ...prev,
      versionId,
      versionDetail: version || null,
    }));
  }, [sourceVersions]);

  // Handle target template selection
  const handleTargetTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value ? parseInt(e.target.value, 10) : null;
    const template = templateNames.find(t => t.id === templateId);

    setTargetSelection({
      templateId,
      templateName: template?.name || '',
      versionId: null,
      versionDetail: null,
    });
  }, [templateNames]);

  // Handle target version selection
  const handleTargetVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const versionId = e.target.value ? parseInt(e.target.value, 10) : null;
    const version = targetVersions.find(v => v.id === versionId);

    setTargetSelection(prev => ({
      ...prev,
      versionId,
      versionDetail: version || null,
    }));
  }, [targetVersions]);

  // Execute comparison
  const handleExecuteComparison = useCallback(async () => {
    if (!sourceSelection.versionId || !targetSelection.versionId) {
      return;
    }

    try {
      setIsComparing(true);
      setComparisonError(null);

      const result: ComparisonResult = await templatesService.analyzeComparison({
        source_version_id: sourceSelection.versionId,
        target_version_id: targetSelection.versionId,
      });

      // Navigate to results page with comparison data
      navigate('/comparisons/results', { state: { comparisonResult: result } });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to execute comparison';
      setComparisonError(errorMsg);
    } finally {
      setIsComparing(false);
    }
  }, [sourceSelection.versionId, targetSelection.versionId, navigate]);

  // Validation checks
  const isSameVersion = sourceSelection.versionId === targetSelection.versionId &&
                        sourceSelection.versionId !== null;
  const canCompare = sourceSelection.versionId !== null &&
                     targetSelection.versionId !== null &&
                     !isSameVersion;

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compare Template Versions
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Select two template versions to compare and analyze the differences
        </p>
      </div>

      {/* Templates Loading/Error */}
      {loadingTemplates && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <LoadingSpinner size="lg" />
          <p className="text-center text-gray-600 dark:text-gray-300 mt-4">
            Loading templates...
          </p>
        </div>
      )}

      {templatesError && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          role="alert"
        >
          <p className="text-red-800 dark:text-red-200">
            {templatesError}
          </p>
        </div>
      )}

      {/* Selection Form */}
      {!loadingTemplates && !templatesError && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Version Selection */}
            <div className="space-y-4 border-r border-gray-200 dark:border-gray-700 pr-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Source Version
              </h2>

              {/* Source Template Selector */}
              <div>
                <label
                  htmlFor="source-template"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Template
                </label>
                <select
                  id="source-template"
                  value={sourceSelection.templateId || ''}
                  onChange={handleSourceTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Select source template"
                >
                  <option value="">Select a template...</option>
                  {(templateNames || []).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Version Selector */}
              <div>
                <label
                  htmlFor="source-version"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Version
                </label>
                <select
                  id="source-version"
                  value={sourceSelection.versionId || ''}
                  onChange={handleSourceVersionChange}
                  disabled={!sourceSelection.templateId || loadingSourceVersions}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Select source version"
                >
                  <option value="">Select a version...</option>
                  {(sourceVersions || []).map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.version_number}
                      {version.is_current && ' (Current)'}
                    </option>
                  ))}
                </select>
                {loadingSourceVersions && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Loading versions...
                  </p>
                )}
              </div>

              {/* Source Version Details */}
              {sourceSelection.versionDetail && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📄</span>
                    <span>Version: {sourceSelection.versionDetail.version_number}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📅</span>
                    <span>Created: {formatDate(sourceSelection.versionDetail.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📊</span>
                    <span>
                      {sourceSelection.versionDetail.field_count} fields,{' '}
                      {sourceSelection.versionDetail.page_count} pages
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Target Version Selection */}
            <div className="space-y-4 pl-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Target Version
              </h2>

              {/* Target Template Selector */}
              <div>
                <label
                  htmlFor="target-template"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Template
                </label>
                <select
                  id="target-template"
                  value={targetSelection.templateId || ''}
                  onChange={handleTargetTemplateChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  aria-label="Select target template"
                >
                  <option value="">Select a template...</option>
                  {(templateNames || []).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Version Selector */}
              <div>
                <label
                  htmlFor="target-version"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Version
                </label>
                <select
                  id="target-version"
                  value={targetSelection.versionId || ''}
                  onChange={handleTargetVersionChange}
                  disabled={!targetSelection.templateId || loadingTargetVersions}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Select target version"
                >
                  <option value="">Select a version...</option>
                  {(targetVersions || []).map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.version_number}
                      {version.is_current && ' (Current)'}
                    </option>
                  ))}
                </select>
                {loadingTargetVersions && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Loading versions...
                  </p>
                )}
              </div>

              {/* Target Version Details */}
              {targetSelection.versionDetail && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📄</span>
                    <span>Version: {targetSelection.versionDetail.version_number}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📅</span>
                    <span>Created: {formatDate(targetSelection.versionDetail.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📊</span>
                    <span>
                      {targetSelection.versionDetail.field_count} fields,{' '}
                      {targetSelection.versionDetail.page_count} pages
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Warning */}
          {isSameVersion && (
            <div
              className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
              role="alert"
            >
              <p className="text-yellow-800 dark:text-yellow-200 flex items-center">
                <span className="mr-2">⚠️</span>
                <span>Versions are identical. Nothing to compare.</span>
              </p>
            </div>
          )}

          {/* Comparison Error */}
          {comparisonError && (
            <div
              className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              role="alert"
            >
              <p className="text-red-800 dark:text-red-200">
                {comparisonError}
              </p>
            </div>
          )}

          {/* Execute Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleExecuteComparison}
              disabled={!canCompare || isComparing}
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Execute comparison"
            >
              {isComparing ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Analyzing...
                </span>
              ) : (
                'Execute Comparison'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateComparisonPage;
