/**
 * ComparisonsPage - List all saved comparisons
 *
 * Displays a paginated, searchable, and sortable table of all saved template
 * version comparisons. Users can view comparison history and navigate to
 * detailed results.
 *
 * Features:
 * - Paginated table with customizable page size
 * - Search by template name
 * - Sort by date or modification percentage
 * - Empty state for no comparisons
 * - Loading skeleton
 * - Responsive design
 *
 * @author AI4Devs
 * @date 2025-10-27
 */

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../../components/ui';
import { comparisonsService } from '../../services/comparisons.service';
import { templatesService } from '../../services/templates.service';
import type { ComparisonSummary, ListComparisonsParams } from '../../types/comparison.types';

/**
 * Sort field options
 */
type SortField = 'created_at' | 'modification_percentage' | 'fields_added' | 'fields_removed' | 'fields_modified';

/**
 * Sort order options
 */
type SortOrder = 'asc' | 'desc';

/**
 * ComparisonsPage Component
 */
const ComparisonsPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [comparisons, setComparisons] = useState<ComparisonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [comparisonToDelete, setComparisonToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /**
   * Debounce search term
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Fetch comparisons
   */
  const fetchComparisons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: ListComparisonsParams = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await comparisonsService.listComparisons(params);

      setComparisons(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparisons');
      console.error('Error fetching comparisons:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, debouncedSearch]);

  /**
   * Fetch on mount and when dependencies change
   */
  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  /**
   * Handle sort change
   */
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc order
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to first page
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle row click
   */
  const handleRowClick = (comparisonId: number) => {
    navigate(`/comparisons/results/${comparisonId}`);
  };

  /**
   * Handle delete button click - open confirmation modal
   */
  const handleDeleteClick = (comparisonId: number, comparisonName: string) => {
    setComparisonToDelete({ id: comparisonId, name: comparisonName });
    setDeleteModalOpen(true);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  /**
   * Handle delete confirmation - perform actual deletion
   */
  const handleDeleteConfirm = async () => {
    if (!comparisonToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await templatesService.deleteComparison(comparisonToDelete.id);
      
      // Show success message
      setDeleteSuccess(`Comparison deleted successfully`);
      
      // Close modal
      setDeleteModalOpen(false);
      setComparisonToDelete(null);
      
      // Refresh comparisons list
      await fetchComparisons();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setDeleteSuccess(null), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete comparison';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle closing delete confirmation modal
   */
  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setComparisonToDelete(null);
      setDeleteError(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Render sort icon
   */
  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" aria-hidden="true" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-4 h-4" aria-hidden="true" />
    );
  };

  /**
   * Render loading skeleton
   */
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Search className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No comparisons found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {debouncedSearch
          ? `No comparisons match "${debouncedSearch}". Try a different search term.`
          : 'No saved comparisons yet. Create your first comparison to get started.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/comparisons/create')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        <span>Create Comparison</span>
      </button>
    </div>
  );

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Comparisons
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchComparisons()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saved Comparisons
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View and manage all saved template version comparisons
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/comparisons/create')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>New Comparison</span>
        </button>
      </div>

      {/* Success notification */}
      {deleteSuccess && (
        <div
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          role="alert"
        >
          <p className="text-green-800 dark:text-green-200">{deleteSuccess}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Search comparisons
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by template name..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:w-48">
            <label htmlFor="sort-by" className="sr-only">
              Sort by
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortField);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="created_at">Date Created</option>
              <option value="modification_percentage">Modification %</option>
              <option value="fields_added">Fields Added</option>
              <option value="fields_removed">Fields Removed</option>
              <option value="fields_modified">Fields Modified</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              setPage(1);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </span>
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {!isLoading && comparisons.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} comparisons
        </div>
      )}

      {/* Comparisons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            {renderSkeleton()}
          </div>
        ) : comparisons.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Source Version
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Target Version
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSortChange('modification_percentage')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Modification %</span>
                      {renderSortIcon('modification_percentage')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Changes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSortChange('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date Saved</span>
                      {renderSortIcon('created_at')}
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {comparisons.map((comparison) => (
                  <tr
                    key={comparison.id}
                    onClick={() => handleRowClick(comparison.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {comparison.source_template_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        v{comparison.source_version_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {comparison.target_template_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        v{comparison.target_version_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-16">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {comparison.modification_percentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex-1 ml-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${Math.min(comparison.modification_percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 text-sm">
                        {comparison.fields_added > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            +{comparison.fields_added}
                          </span>
                        )}
                        {comparison.fields_removed > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            -{comparison.fields_removed}
                          </span>
                        )}
                        {comparison.fields_modified > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            ~{comparison.fields_modified}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comparison.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(comparison.id);
                          }}
                          className="inline-flex items-center gap-1 p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20 rounded transition-colors"
                          aria-label={`View comparison ${comparison.id}`}
                          title="View comparison"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(
                              comparison.id,
                              `${comparison.source_template_name} v${comparison.source_version_number} → ${comparison.target_template_name} v${comparison.target_version_number}`
                            );
                          }}
                          className="inline-flex items-center gap-1 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
                          aria-label={`Delete comparison ${comparison.id}`}
                          title="Delete comparison"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-gray-700 dark:text-gray-300">
              Show:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Comparación"
        message={`¿Estás seguro de que deseas eliminar esta comparación?`}
        details="Esta acción eliminará permanentemente la comparación y todos sus datos asociados. Las plantillas comparadas no serán eliminadas."
        isLoading={isDeleting}
      />

      {/* Delete Error Modal (shown inside delete modal) */}
      {deleteError && deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Error al eliminar
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{deleteError}</p>
            <button
              onClick={() => setDeleteError(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonsPage;
