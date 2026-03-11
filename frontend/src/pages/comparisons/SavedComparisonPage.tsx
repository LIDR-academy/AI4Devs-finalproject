/**
 * SavedComparisonPage - Display a saved comparison from the database
 *
 * Fetches and displays a previously saved template version comparison
 * by ID. Reuses existing visualization components for consistency.
 *
 * Features:
 * - Fetches comparison data from API on mount
 * - Page header with breadcrumb navigation
 * - Source/Target version info and save date
 * - Reuses GlobalMetricsCard for metrics
 * - Reuses ComparisonTable for field changes
 * - Loading skeleton while fetching
 * - 404 error handling for missing comparisons
 * - Responsive design with dark mode support
 *
 * @author AI4Devs
 * @date 2025-10-27
 */

import { ArrowLeft, Calendar, Home } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ComparisonTable, GlobalMetricsCard } from '../../components/comparisons';
import { comparisonsService } from '../../services/comparisons.service';
import type { ComparisonResult } from '../../types/comparison.types';

/**
 * SavedComparisonPage Component
 */
const SavedComparisonPage: React.FC = () => {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const navigate = useNavigate();

  // State
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch comparison data on mount
   */
  useEffect(() => {
    const fetchComparison = async () => {
      if (!comparisonId) {
        setError('No comparison ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await comparisonsService.getComparison(Number(comparisonId));
        setComparison(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load comparison');
        }
        console.error('Error fetching comparison:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparison();
  }, [comparisonId]);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Render loading skeleton
   */
  const renderSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-96" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      </div>

      {/* Metrics Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Render 404 error
   */
  const render404 = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-4">
          <span className="text-3xl" role="img" aria-label="Warning">
            ⚠️
          </span>
        </div>
        <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
          Comparison Not Found
        </h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-6">
          {error || 'The comparison you are looking for does not exist or may have been deleted.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => navigate('/comparisons')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>View All Comparisons</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/comparisons/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <span>New Comparison</span>
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Render generic error
   */
  const renderError = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Comparison
        </h2>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/comparisons')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go to Comparisons List
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return renderSkeleton();
  }

  // Error state - 404
  if (error && (error.includes('not found') || error.includes('404'))) {
    return render404();
  }

  // Error state - Other errors
  if (error || !comparison) {
    return renderError();
  }

  // Success state - Render comparison
  const { global_metrics, field_changes, analyzed_at } = comparison;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/comparisons"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Comparisons
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 dark:text-white font-medium">Detail</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Saved Comparison
            </h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="font-medium">Source:</span>
                <span>
                  {global_metrics.source_template_name} (v{global_metrics.source_version_number})
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="font-medium">Target:</span>
                <span>
                  {global_metrics.target_template_name} (v{global_metrics.target_version_number})
                </span>
              </div>
              {analyzed_at && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Analyzed: {formatDate(analyzed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/comparisons')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/comparisons/create', {
                  state: {
                    sourceVersionId: global_metrics.source_version_id,
                    targetVersionId: global_metrics.target_version_id,
                  },
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span>Analyze Again</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Metrics Card */}
      <GlobalMetricsCard metrics={global_metrics} />

      {/* Field Changes Table */}
      <ComparisonTable fieldChanges={field_changes} />

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/comparisons/create')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          New Comparison
        </button>
        <button
          type="button"
          onClick={() => navigate('/comparisons')}
          className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
        >
          View All Comparisons
        </button>
      </div>
    </div>
  );
};

export default SavedComparisonPage;

