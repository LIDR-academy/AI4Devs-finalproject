/**
 * Custom Hook for Template Fields Management
 *
 * Manages state and data fetching for template AcroForm fields with:
 * - Lazy loading (only fetches when templateId is provided)
 * - Support for both current version and specific version fields
 * - Pagination with page and pageSize controls
 * - Search by field_id or near_text (debounced)
 * - Filter by page_number within the PDF
 * - Loading and error states
 * - Manual refetch capability
 * - Reset/clear functionality
 *
 * Designed for use in modal dialogs where fields are loaded on-demand.
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { useCallback, useEffect, useState } from 'react';
import { templatesService } from '../services/templates.service';
import type {
  PaginationState,
  TemplateField,
  VersionInfo,
} from '../types/templates.types';

/**
 * Return type for useTemplateFields hook
 */
export interface UseTemplateFieldsReturn {
  // Data
  fields: TemplateField[];
  total: number;
  isLoading: boolean;
  error: string | null;
  templateId: number | null;
  versionId: number | null;
  versionInfo: VersionInfo | null;

  // Pagination
  pagination: PaginationState;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filters
  search: string;
  setSearch: (search: string) => void;
  pageNumber: number | null;
  setPageNumber: (page: number | null) => void;
  clearPageNumber: () => void;

  // Actions
  fetchCurrentVersionFields: (templateId: number) => void;
  fetchVersionFields: (templateId: number, versionId: number) => void;
  refetch: () => void;
  clearFields: () => void;
}

/**
 * Custom hook for managing template fields with lazy loading and search
 *
 * This hook does NOT fetch data on mount. It waits for fetchCurrentVersionFields()
 * or fetchVersionFields() to be called. This is ideal for modal dialogs.
 *
 * @returns Template fields data, state, and control functions
 *
 * @example
 * ```typescript
 * function TemplateFieldsModal({ templateId, versionId, isOpen, onClose }) {
 *   const {
 *     fields,
 *     isLoading,
 *     error,
 *     versionInfo,
 *     currentPage,
 *     totalPages,
 *     setPage,
 *     search,
 *     setSearch,
 *     pageNumber,
 *     setPageNumber,
 *     fetchCurrentVersionFields,
 *     fetchVersionFields,
 *     clearFields,
 *   } = useTemplateFields();
 *
 *   useEffect(() => {
 *     if (isOpen && templateId) {
 *       if (versionId) {
 *         fetchVersionFields(templateId, versionId);
 *       } else {
 *         fetchCurrentVersionFields(templateId);
 *       }
 *     } else {
 *       clearFields();
 *     }
 *   }, [isOpen, templateId, versionId]);
 *
 *   return (
 *     <Modal isOpen={isOpen} onClose={onClose}>
 *       <SearchBar value={search} onChange={setSearch} />
 *       <PageFilter value={pageNumber} onChange={setPageNumber} />
 *       <FieldsTable fields={fields} />
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
export const useTemplateFields = (): UseTemplateFieldsReturn => {
  // Data state
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [versionId, setVersionId] = useState<number | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  // Filter state
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 20,
    offset: 0,
  });
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumberState] = useState<number | null>(null);

  /**
   * Fetch fields from API with current filters
   */
  const fetchData = useCallback(
    async (tId: number, vId: number | null) => {
      setIsLoading(true);
      setError(null);

      try {
        const filters = {
          limit: pagination.limit,
          offset: pagination.offset,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(pageNumber && { page_number: pageNumber }),
        };

        const response =
          vId !== null
            ? await templatesService.getVersionFields(tId, vId, filters)
            : await templatesService.getCurrentVersionFields(tId, filters);

        setFields(response.items);
        setTotal(response.total);
        setVersionInfo(response.version_info);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch fields';
        setError(errorMessage);
        setFields([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [
      pagination.limit,
      pagination.offset,
      debouncedSearch,
      pageNumber,
    ]
  );

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
   * Fetch fields when filters change (only if templateId is set)
   */
  useEffect(() => {
    if (templateId !== null) {
      fetchData(templateId, versionId);
    }
  }, [templateId, versionId, fetchData]);

  /**
   * Calculate current page number (1-indexed)
   */
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  /**
   * Calculate total number of pages
   */
  const totalPages = Math.ceil(total / pagination.limit);

  /**
   * Initiate fetching current version fields for a template
   */
  const fetchCurrentVersionFields = useCallback((id: number) => {
    setTemplateId(id);
    setVersionId(null);
    setPagination({
      limit: 20,
      offset: 0,
    });
    setSearchState('');
    setDebouncedSearch('');
    setPageNumberState(null);
  }, []);

  /**
   * Initiate fetching specific version fields for a template
   */
  const fetchVersionFields = useCallback((tId: number, vId: number) => {
    setTemplateId(tId);
    setVersionId(vId);
    setPagination({
      limit: 20,
      offset: 0,
    });
    setSearchState('');
    setDebouncedSearch('');
    setPageNumberState(null);
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
   * Set page number filter and reset to first page
   */
  const setPageNumber = useCallback((page: number | null) => {
    setPageNumberState(page);
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }));
  }, []);

  /**
   * Clear page number filter
   */
  const clearPageNumber = useCallback(() => {
    setPageNumberState(null);
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }));
  }, []);

  /**
   * Manually refetch fields (only if templateId is set)
   */
  const refetch = useCallback(() => {
    if (templateId !== null) {
      fetchData(templateId, versionId);
    }
  }, [templateId, versionId, fetchData]);

  /**
   * Clear all state (useful when closing modal)
   */
  const clearFields = useCallback(() => {
    setFields([]);
    setTotal(0);
    setTemplateId(null);
    setVersionId(null);
    setVersionInfo(null);
    setError(null);
    setPagination({
      limit: 20,
      offset: 0,
    });
    setSearchState('');
    setDebouncedSearch('');
    setPageNumberState(null);
  }, []);

  return {
    // Data
    fields,
    total,
    isLoading,
    error,
    templateId,
    versionId,
    versionInfo,

    // Pagination
    pagination,
    currentPage,
    totalPages,
    setPage,
    setPageSize,

    // Filters
    search,
    setSearch,
    pageNumber,
    setPageNumber,
    clearPageNumber,

    // Actions
    fetchCurrentVersionFields,
    fetchVersionFields,
    refetch,
    clearFields,
  };
};

