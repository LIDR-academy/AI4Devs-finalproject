/**
 * TableFilters Component
 *
 * Provides filtering controls for the templates table with:
 * - Search input for template names
 * - Clear button when search has value
 * - Responsive design for mobile and desktop
 * - Keyboard accessible
 *
 * Note: Search debouncing is handled by the parent hook (useTemplates)
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { Search, X } from 'lucide-react';
import React from 'react';

/**
 * Props for TableFilters component
 */
export interface TableFiltersProps {
  /** Current search value */
  search: string;
  /** Callback when search value changes */
  onSearchChange: (search: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableFilters component for searching and filtering templates
 *
 * @example
 * ```tsx
 * <TableFilters
 *   search={searchQuery}
 *   onSearchChange={(value) => setSearchQuery(value)}
 * />
 * ```
 */
const TableFilters: React.FC<TableFiltersProps> = ({
  search,
  onSearchChange,
  className = '',
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div
      className={`table-filters flex flex-col sm:flex-row gap-4 ${className}`}
    >
      {/* Search input */}
      <div className="relative flex-1">
        <label htmlFor="search-templates" className="sr-only">
          Search
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className="text-gray-400 dark:text-gray-500"
            size={20}
            aria-hidden="true"
          />
        </div>
        <input
          id="search-templates"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search templates..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={handleClearSearch}
            type="button"
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TableFilters;

