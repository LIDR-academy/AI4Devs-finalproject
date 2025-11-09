/**
 * TablePagination Component
 *
 * Provides pagination controls for the templates table with:
 * - Page navigation (first, previous, next, last)
 * - Page size selection (20, 50, 100 items per page)
 * - Display of current page and items range
 * - Keyboard accessible and responsive
 *
 * Features:
 * - Disabled states for boundary conditions
 * - ARIA labels for accessibility
 * - Visual feedback for current state
 * - Clean, modern styling with Tailwind CSS
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';

/**
 * Props for TablePagination component
 */
export interface TablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page size */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TablePagination component for navigating through paginated data
 *
 * @example
 * ```tsx
 * <TablePagination
 *   currentPage={2}
 *   totalPages={10}
 *   pageSize={20}
 *   totalItems={200}
 *   onPageChange={(page) => setPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 * ```
 */
const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  // Calculate items range for current page
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  };

  // Check if buttons should be disabled
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div
      className={`table-pagination flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Items info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="whitespace-nowrap">
          Showing {startItem}-{endItem} of {totalItems}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="whitespace-nowrap">
            Items per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Items per page"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(1)}
          disabled={isFirstPage || totalPages === 0}
          aria-label="First page"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage || totalPages === 0}
          aria-label="Previous page"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage || totalPages === 0}
          aria-label="Next page"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage || totalPages === 0}
          aria-label="Last page"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;

