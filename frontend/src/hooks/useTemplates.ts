/**
 * Custom Hook for Templates List Management
 *
 * Manages state and data fetching for the templates list with:
 * - Automatic data fetching on mount
 * - Pagination with page and pageSize controls
 * - Sorting by various fields (name, version, size, updated_at, etc.)
 * - Search/filtering with debounced query
 * - Loading and error states
 * - Manual refetch capability
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { useCallback, useEffect, useState } from 'react';
import { templatesService } from '../services/templates.service';
import type {
    PaginationState,
    SortConfig,
    Template,
} from '../types/templates.types';

/**
 * Return type for useTemplates hook
 */
export interface UseTemplatesReturn {
  // Data
  templates: Template[];
  total: number;
  isLoading: boolean;
  error: string | null;

  // Pagination
  pagination: PaginationState;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Sorting
  sort: SortConfig;
  setSort: (sort: SortConfig) => void;
  handleSort: (field: string) => void;

  // Search
  search: string;
  setSearch: (search: string) => void;

  // Actions
  refetch: () => void;
}

/**
 * Custom hook for managing templates list with pagination, sorting, and search
 *
 * @returns Templates data, state, and control functions
 *
 * @example
 * ```typescript
 * function TemplatesPage() {
 *   const {
 *     templates,
 *     isLoading,
 *     error,
 *     currentPage,
 *     totalPages,
 *     setPage,
 *     handleSort,
 *     setSearch,
 *   } = useTemplates();
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       <SearchBar onSearch={setSearch} />
 *       <TemplatesTable
 *         templates={templates}
 *         onSort={handleSort}
 *       />
 *       <Pagination
 *         currentPage={currentPage}
 *         totalPages={totalPages}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useTemplates = (): UseTemplatesReturn => {
  // Data state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 20,
    offset: 0,
  });
  const [sort, setSort] = useState<SortConfig>({
    sort_by: 'updated_at',
    sort_order: 'desc',
  });
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /**
   * Fetch templates from API with current filters
   */
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await templatesService.getTemplates({
        limit: pagination.limit,
        offset: pagination.offset,
        sort_by: sort.sort_by,
        sort_order: sort.sort_order,
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      setTemplates(response.items);
      setTotal(response.total);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(errorMessage);
      setTemplates([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.limit,
    pagination.offset,
    sort.sort_by,
    sort.sort_order,
    debouncedSearch,
  ]);

  /**
   * Debounce search query to avoid excessive API calls
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Fetch templates when filters change
   */
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  /**
   * Calculate current page number (1-indexed)
   */
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  /**
   * Calculate total number of pages
   */
  const totalPages = Math.ceil(total / pagination.limit);

  /**
   * Set the current page (1-indexed)
   */
  const setPage = useCallback(
    (page: number) => {
      const newOffset = (page - 1) * pagination.limit;
      setPagination((prev) => ({
        ...prev,
        offset: newOffset,
      }));
    },
    [pagination.limit]
  );

  /**
   * Set the page size and reset to first page
   */
  const setPageSize = useCallback((size: number) => {
    setPagination({
      limit: size,
      offset: 0,
    });
  }, []);

  /**
   * Handle sort field toggle
   * Toggles between asc/desc for same field, resets to asc for new field
   */
  const handleSort = useCallback(
    (field: string) => {
      setSort((prev) => {
        if (prev.sort_by === field) {
          // Toggle order for same field
          return {
            sort_by: field,
            sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
          };
        } else {
          // New field, start with ascending
          return {
            sort_by: field,
            sort_order: 'asc',
          };
        }
      });
    },
    []
  );

  /**
   * Set search query and reset to first page
   */
  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }));
  }, []);

  /**
   * Manually refetch templates
   */
  const refetch = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    // Data
    templates,
    total,
    isLoading,
    error,

    // Pagination
    pagination,
    currentPage,
    totalPages,
    setPage,
    setPageSize,

    // Sorting
    sort,
    setSort,
    handleSort,

    // Search
    search,
    setSearch,

    // Actions
    refetch,
  };
};

