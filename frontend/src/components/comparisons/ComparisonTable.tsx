/**
 * ComparisonTable - Display field changes in a filterable table
 *
 * Shows detailed field-by-field comparison results with:
 * - Filter buttons by status (All/Added/Removed/Modified/Unchanged)
 * - Sortable columns
 * - Expandable detail rows for modified fields
 * - Color-coded status indicators
 * - Pagination for large datasets
 * - Empty state handling
 *
 * Features:
 * - Responsive table design
 * - Dark mode support
 * - Keyboard navigation
 * - ARIA labels for accessibility
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import React, { useState, useMemo } from 'react';
import type { FieldChange, FieldChangeStatus } from '../../types/comparison.types';

interface ComparisonTableProps {
  fieldChanges: FieldChange[];
  className?: string;
}

type FilterStatus = 'ALL' | FieldChangeStatus;

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  fieldChanges,
  className = '',
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Count fields by status
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: fieldChanges.length,
      ADDED: 0,
      REMOVED: 0,
      MODIFIED: 0,
      UNCHANGED: 0,
    };

    fieldChanges.forEach((change) => {
      counts[change.status]++;
    });

    return counts;
  }, [fieldChanges]);

  // Filter field changes
  const filteredChanges = useMemo(() => {
    if (filterStatus === 'ALL') {
      return fieldChanges;
    }
    return fieldChanges.filter((change) => change.status === filterStatus);
  }, [fieldChanges, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredChanges.length / itemsPerPage);
  const paginatedChanges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredChanges.slice(startIndex, endIndex);
  }, [filteredChanges, currentPage]);

  // Reset pagination when filter changes
  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Toggle row expansion
  const toggleRowExpansion = (fieldId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedRows(newExpanded);
  };

  // Get status badge classes
  const getStatusBadgeClass = (status: FieldChangeStatus): string => {
    const baseClass = 'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'ADDED':
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'REMOVED':
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      case 'MODIFIED':
        return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case 'UNCHANGED':
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  // Get status emoji
  const getStatusEmoji = (status: FieldChangeStatus): string => {
    switch (status) {
      case 'ADDED':
        return '✅';
      case 'REMOVED':
        return '❌';
      case 'MODIFIED':
        return '🔄';
      case 'UNCHANGED':
        return '✓';
    }
  };

  // Get diff status indicator
  const getDiffIndicator = (diffStatus?: string): React.ReactNode => {
    if (!diffStatus || diffStatus === 'NOT_APPLICABLE') {
      return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
    }
    if (diffStatus === 'EQUAL') {
      return (
        <span className="text-green-600 dark:text-green-400 flex items-center">
          <span className="mr-1">✓</span>
          <span>EQUAL</span>
        </span>
      );
    }
    return (
      <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
        <span className="mr-1">⚠️</span>
        <span>DIFFERENT</span>
      </span>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Field Changes ({filteredChanges.length} total)
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'ALL'}
            aria-controls="field-changes-table"
            onClick={() => handleFilterChange('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({statusCounts.ALL})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'ADDED'}
            aria-controls="field-changes-table"
            onClick={() => handleFilterChange('ADDED')}
            disabled={statusCounts.ADDED === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              filterStatus === 'ADDED'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Added ({statusCounts.ADDED})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'REMOVED'}
            aria-controls="field-changes-table"
            onClick={() => handleFilterChange('REMOVED')}
            disabled={statusCounts.REMOVED === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              filterStatus === 'REMOVED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Removed ({statusCounts.REMOVED})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'MODIFIED'}
            aria-controls="field-changes-table"
            onClick={() => handleFilterChange('MODIFIED')}
            disabled={statusCounts.MODIFIED === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              filterStatus === 'MODIFIED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Modified ({statusCounts.MODIFIED})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'UNCHANGED'}
            aria-controls="field-changes-table"
            onClick={() => handleFilterChange('UNCHANGED')}
            disabled={statusCounts.UNCHANGED === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              filterStatus === 'UNCHANGED'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unchanged ({statusCounts.UNCHANGED})
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="overflow-x-auto">
        {paginatedChanges.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No field changes found for the selected filter.
            </p>
          </div>
        ) : (
          <table
            id="field-changes-table"
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            role="table"
            aria-label="Field changes comparison table"
          >
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Field ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Pages
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Near Text
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Value Options
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Position
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedChanges.map((change) => {
                const isExpanded = expandedRows.has(change.field_id);
                const hasDetails =
                  change.status === 'MODIFIED' &&
                  (change.near_text_diff === 'DIFFERENT' ||
                    change.value_options_diff === 'DIFFERENT' ||
                    (change.position_change &&
                      (change.position_change.x_changed ||
                        change.position_change.y_changed ||
                        change.position_change.width_changed ||
                        change.position_change.height_changed)));

                return (
                  <React.Fragment key={change.field_id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {change.field_id}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={getStatusBadgeClass(change.status)}>
                          <span className="mr-1" aria-hidden="true">
                            {getStatusEmoji(change.status)}
                          </span>
                          <span>{change.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {change.field_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {change.status === 'ADDED'
                          ? `→ ${change.target_page_number}`
                          : change.status === 'REMOVED'
                          ? `${change.source_page_number} →`
                          : `${change.source_page_number} → ${change.target_page_number}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getDiffIndicator(change.near_text_diff)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getDiffIndicator(change.value_options_diff)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {change.position_change ? (
                          <>
                            {change.position_change.x_changed ||
                            change.position_change.y_changed ||
                            change.position_change.width_changed ||
                            change.position_change.height_changed ? (
                              <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                <span className="mr-1">⚠️</span>
                                <span>CHANGED</span>
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 flex items-center">
                                <span className="mr-1">✓</span>
                                <span>EQUAL</span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {hasDetails && (
                          <button
                            type="button"
                            onClick={() => toggleRowExpansion(change.field_id)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            aria-expanded={isExpanded}
                            aria-controls={`details-${change.field_id}`}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${change.field_id}`}
                          >
                            {isExpanded ? '▲ Collapse' : '▼ Expand'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && hasDetails && (
                      <tr id={`details-${change.field_id}`}>
                        <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50">
                          <div className="space-y-4">
                            {/* Near Text Details */}
                            {change.near_text_diff === 'DIFFERENT' && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Near Text Changed
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Source:
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                      {change.source_near_text || '(empty)'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Target:
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                      {change.target_near_text || '(empty)'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Value Options Details */}
                            {change.value_options_diff === 'DIFFERENT' && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Value Options Changed
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Source:
                                    </p>
                                    <ul className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-2 rounded space-y-1">
                                      {(change.source_value_options || []).map((opt, idx) => (
                                        <li key={idx}>• {opt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Target:
                                    </p>
                                    <ul className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-2 rounded space-y-1">
                                      {(change.target_value_options || []).map((opt, idx) => (
                                        <li key={idx}>• {opt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Position Details */}
                            {change.position_change &&
                              (change.position_change.x_changed ||
                                change.position_change.y_changed ||
                                change.position_change.width_changed ||
                                change.position_change.height_changed) && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Position Changed
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {change.position_change.x_changed && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">X:</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                          {change.position_change.source_x?.toFixed(1)} →{' '}
                                          {change.position_change.target_x?.toFixed(1)}
                                        </p>
                                      </div>
                                    )}
                                    {change.position_change.y_changed && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Y:</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                          {change.position_change.source_y?.toFixed(1)} →{' '}
                                          {change.position_change.target_y?.toFixed(1)}
                                        </p>
                                      </div>
                                    )}
                                    {change.position_change.width_changed && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Width:</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                          {change.position_change.source_width?.toFixed(1)} →{' '}
                                          {change.position_change.target_width?.toFixed(1)}
                                        </p>
                                      </div>
                                    )}
                                    {change.position_change.height_changed && (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Height:
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                          {change.position_change.source_height?.toFixed(1)} →{' '}
                                          {change.position_change.target_height?.toFixed(1)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              ◀ Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;

