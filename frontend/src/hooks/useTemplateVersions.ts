/**
 * Custom Hook for Template Versions Management
 *
 * Manages state and data fetching for template versions with:
 * - Lazy loading (only fetches when templateId is provided)
 * - Pagination with page and pageSize controls
 * - Sorting by version_number, created_at, or page_count
 * - Loading and error states
 * - Manual refetch capability
 * - Reset/clear functionality
 *
 * Designed for use in modal dialogs where versions are loaded on-demand.
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { useCallback, useEffect, useState } from 'react';
import { templatesService } from '../services/templates.service';
import type {
  PaginationState,
  SortConfig,
  TemplateVersion,
} from '../types/templates.types';

/**
 * Return type for useTemplateVersions hook
 */
export interface UseTemplateVersionsReturn {
  // Data
  versions: TemplateVersion[];
  total: number;
  isLoading: boolean;
  error: string | null;
  templateId: number | null;

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

  // Actions
  fetchVersions: (templateId: number) => void;
  refetch: () => void;
  clearVersions: () => void;
}

/**
 * Custom hook for managing template versions with lazy loading
 *
 * This hook does NOT fetch data on mount. It waits for fetchVersions() to be
 * called with a templateId. This is ideal for modal dialogs.
 *
 * @returns Template versions data, state, and control functions
 *
 * @example
 * ```typescript
 * function VersionHistoryModal({ templateId, isOpen, onClose }) {
 *   const {
 *     versions,
 *     isLoading,
 *     error,
 *     currentPage,
 *     totalPages,
 *     setPage,
 *     handleSort,
 *     fetchVersions,
 *     clearVersions,
 *   } = useTemplateVersions();
 *
 *   useEffect(() => {
 *     if (isOpen && templateId) {
 *       fetchVersions(templateId);
 *     } else {
 *       clearVersions();
 *     }
 *   }, [isOpen, templateId]);
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <Modal isOpen={isOpen} onClose={onClose}>
 *       <VersionsTable versions={versions} onSort={handleSort} />
 *       <Pagination
 *         currentPage={currentPage}
 *         totalPages={totalPages}
 *         onPageChange={setPage}
 *       />
 *     </Modal>
 *   );
 * }
 * ```
 */
export const useTemplateVersions = (): UseTemplateVersionsReturn => {
  // Data state
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<number | null>(null);

  // Filter state
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 20,
    offset: 0,
  });
  const [sort, setSort] = useState<SortConfig>({
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  /**
   * Fetch versions from API with current filters
   */
  const fetchData = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await templatesService.getTemplateVersions(id, {
          limit: pagination.limit,
          offset: pagination.offset,
          sort_by: sort.sort_by,
          sort_order: sort.sort_order,
        });

        setVersions(response.items);
        setTotal(response.total);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch template versions';
        setError(errorMessage);
        setVersions([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit, pagination.offset, sort.sort_by, sort.sort_order]
  );

  /**
   * Fetch versions when filters change (only if templateId is set)
   */
  useEffect(() => {
    if (templateId !== null) {
      fetchData(templateId);
    }
  }, [templateId, fetchData]);

  /**
   * Calculate current page number (1-indexed)
   */
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  /**
   * Calculate total number of pages
   */
  const totalPages = Math.ceil(total / pagination.limit);

  /**
   * Initiate fetching versions for a template
   */
  const fetchVersions = useCallback((id: number) => {
    setTemplateId(id);
    setPagination({
      limit: 20,
      offset: 0,
    });
  }, []);

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
   * Manually refetch versions (only if templateId is set)
   */
  const refetch = useCallback(() => {
    if (templateId !== null) {
      fetchData(templateId);
    }
  }, [templateId, fetchData]);

  /**
   * Clear all state (useful when closing modal)
   */
  const clearVersions = useCallback(() => {
    setVersions([]);
    setTotal(0);
    setTemplateId(null);
    setError(null);
    setPagination({
      limit: 20,
      offset: 0,
    });
    setSort({
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  }, []);

  return {
    // Data
    versions,
    total,
    isLoading,
    error,
    templateId,

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

    // Actions
    fetchVersions,
    refetch,
    clearVersions,
  };
};

