/**
 * GlobalMetricsCard - Display global comparison metrics
 *
 * Shows high-level statistics about template version differences:
 * - Page count comparison with change indicator
 * - Field count comparison with change indicator
 * - Change statistics (added/removed/modified/unchanged)
 * - Modification percentage with progress bar
 * - Version metadata (version numbers, dates)
 * - Timeline visualization
 *
 * Features:
 * - Responsive grid layout
 * - Dark mode support
 * - Accessible with ARIA labels
 * - Visual indicators for changes
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import React from 'react';
import type { GlobalMetrics } from '../../types/comparison.types';

interface GlobalMetricsCardProps {
  metrics: GlobalMetrics;
  className?: string;
}

const GlobalMetricsCard: React.FC<GlobalMetricsCardProps> = ({
  metrics,
  className = '',
}) => {
  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate time difference
  const getTimeDifference = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Same day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;

    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    if (diffMonths === 1) {
      return remainingDays > 0 ? `1 month, ${remainingDays} days` : '1 month';
    }

    return remainingDays > 0
      ? `${diffMonths} months, ${remainingDays} days`
      : `${diffMonths} months`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Comparison Results
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
          {metrics.source_version_number} → {metrics.target_version_number}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Page Count Card */}
          <div
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            role="region"
            aria-label="Page count comparison"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Page Count
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.source_page_count} → {metrics.target_page_count}
            </p>
            {metrics.page_count_changed ? (
              <p
                className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 flex items-center"
                role="status"
              >
                <span className="mr-1" aria-label="Warning">⚠️</span>
                <span>Changed</span>
              </p>
            ) : (
              <p
                className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center"
                role="status"
              >
                <span className="mr-1" aria-label="Success">✓</span>
                <span>Unchanged</span>
              </p>
            )}
          </div>

          {/* Field Count Card */}
          <div
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            role="region"
            aria-label="Field count comparison"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Field Count
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.source_field_count} → {metrics.target_field_count}
            </p>
            {metrics.field_count_changed ? (
              <p
                className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 flex items-center"
                role="status"
              >
                <span className="mr-1" aria-label="Warning">⚠️</span>
                <span>Changed</span>
              </p>
            ) : (
              <p
                className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center"
                role="status"
              >
                <span className="mr-1" aria-label="Success">✓</span>
                <span>Unchanged</span>
              </p>
            )}
          </div>

          {/* Changes Summary Card */}
          <div
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            role="region"
            aria-label="Change statistics"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Changes
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <span className="mr-1" aria-label="Added">✅</span>
                <span>{metrics.fields_added} Added</span>
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <span className="mr-1" aria-label="Removed">❌</span>
                <span>{metrics.fields_removed} Removed</span>
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <span className="mr-1" aria-label="Modified">🔄</span>
                <span>{metrics.fields_modified} Modified</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="mr-1" aria-label="Unchanged">✓</span>
                <span>{metrics.fields_unchanged} Unchanged</span>
              </p>
            </div>
          </div>

          {/* Modification Percentage Card */}
          <div
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            role="region"
            aria-label="Modification percentage"
          >
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Modified
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.modification_percentage.toFixed(2)}%
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(metrics.modification_percentage, 100)}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={metrics.modification_percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${metrics.modification_percentage.toFixed(2)}% modified`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Version Timeline */}
        <div
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          role="region"
          aria-label="Version timeline"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Version Timeline
          </h3>
          <div className="flex items-center justify-between">
            {/* Source Version */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Source
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {metrics.source_version_number}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {formatDate(metrics.source_created_at)}
              </p>
            </div>

            {/* Timeline Arrow */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="flex items-center w-full">
                <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600" />
                <span className="mx-2 text-gray-400 dark:text-gray-500" aria-hidden="true">
                  →
                </span>
                <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>

            {/* Target Version */}
            <div className="flex-1 text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Target
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {metrics.target_version_number}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {formatDate(metrics.target_created_at)}
              </p>
            </div>
          </div>

          {/* Time Difference */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Time span:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {getTimeDifference(
                  metrics.source_created_at,
                  metrics.target_created_at
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMetricsCard;

