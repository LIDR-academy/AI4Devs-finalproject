/**
 * ComparisonResultsPage - Display template comparison results
 *
 * Shows the results of a template version comparison analysis including:
 * - Global metrics (page/field counts, modification percentage)
 * - Field changes table (added, removed, modified, unchanged fields)
 *
 * This is a placeholder component that will be enhanced with full UI in later tasks.
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ComparisonTable, GlobalMetricsCard, SaveComparisonButton } from '../../components/comparisons';
import type { ComparisonResult } from '../../types/comparison.types';

const ComparisonResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const comparisonResult = location.state?.comparisonResult as ComparisonResult | undefined;

  // Redirect if no comparison result provided
  if (!comparisonResult) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            No Comparison Data
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            No comparison results available. Please create a comparison first.
          </p>
          <button
            type="button"
            onClick={() => navigate('/comparisons/create')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Comparison
          </button>
        </div>
      </div>
    );
  }

  const { global_metrics, field_changes } = comparisonResult;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Comparison Results
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Detailed analysis of template version differences
        </p>
      </div>

      {/* Global Metrics Card */}
      <GlobalMetricsCard metrics={global_metrics} />

      {/* Save Comparison Button */}
      <SaveComparisonButton
        comparisonResult={comparisonResult}
        onSaveSuccess={(comparisonId) => {
          console.log('Comparison saved with ID:', comparisonId);
        }}
      />

      {/* Field Changes Table */}
      <ComparisonTable fieldChanges={field_changes} />

      {/* Action Buttons */}
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

export default ComparisonResultsPage;

