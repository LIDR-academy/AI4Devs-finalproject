/**
 * Unit Tests for useTemplateFields Hook
 *
 * Tests the custom hook for fetching and managing template fields with:
 * - Lazy loading (only fetch when templateId is provided)
 * - Support for both current version and specific version fields
 * - Pagination state management
 * - Search/filtering by field_id or near_text
 * - Page number filtering
 * - Loading and error states
 * - Data fetching and refetching
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplateFields } from '../../hooks/useTemplateFields';
import { templatesService } from '../../services/templates.service';
import type { TemplateFieldListResponse } from '../../types/templates.types';

// Mock the templates service
vi.mock('../../services/templates.service', () => ({
  templatesService: {
    getCurrentVersionFields: vi.fn(),
    getVersionFields: vi.fn(),
  },
}));

describe('useTemplateFields', () => {
  const mockFieldsResponse: TemplateFieldListResponse = {
    items: [
      {
        id: 1,
        template_version_id: 1,
        field_id: 'field_name',
        field_type: 'text',
        near_text: 'Name:',
        page_number: 1,
        field_page_order: 1,
        position: {
          x: 100,
          y: 200,
          width: 150,
          height: 20,
        },
        created_at: '2025-10-01T10:00:00Z',
      },
      {
        id: 2,
        template_version_id: 1,
        field_id: 'field_email',
        field_type: 'text',
        near_text: 'Email:',
        page_number: 1,
        field_page_order: 2,
        position: {
          x: 100,
          y: 230,
          width: 150,
          height: 20,
        },
        created_at: '2025-10-01T10:00:00Z',
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
    version_info: {
      version_id: 1,
      version_number: '1.0',
      field_count: 2,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTemplateFields());

      expect(result.current.fields).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.templateId).toBeNull();
      expect(result.current.versionId).toBeNull();
      expect(result.current.versionInfo).toBeNull();
    });

    it('should not fetch fields without templateId', () => {
      renderHook(() => useTemplateFields());

      expect(
        templatesService.getCurrentVersionFields
      ).not.toHaveBeenCalled();
      expect(templatesService.getVersionFields).not.toHaveBeenCalled();
    });
  });

  describe('Lazy Loading - Current Version', () => {
    it('should fetch current version fields when templateId is set', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(
        templatesService.getCurrentVersionFields
      ).toHaveBeenCalledTimes(1);
      expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
        1,
        {
          limit: 20,
          offset: 0,
        }
      );
      expect(result.current.fields).toEqual(mockFieldsResponse.items);
      expect(result.current.total).toBe(mockFieldsResponse.total);
      expect(result.current.versionInfo).toEqual(mockFieldsResponse.version_info);
      expect(result.current.templateId).toBe(1);
      expect(result.current.versionId).toBeNull();
    });
  });

  describe('Lazy Loading - Specific Version', () => {
    it('should fetch specific version fields when templateId and versionId are set', async () => {
      vi.mocked(templatesService.getVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchVersionFields(1, 5);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getVersionFields).toHaveBeenCalledTimes(1);
      expect(templatesService.getVersionFields).toHaveBeenCalledWith(1, 5, {
        limit: 20,
        offset: 0,
      });
      expect(result.current.fields).toEqual(mockFieldsResponse.items);
      expect(result.current.templateId).toBe(1);
      expect(result.current.versionId).toBe(5);
    });
  });

  describe('State Reset', () => {
    it('should reset state when clearing fields', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      // Fetch fields
      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.fields.length).toBeGreaterThan(0);
      });

      // Clear
      act(() => {
        result.current.clearFields();
      });

      expect(result.current.fields).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.templateId).toBeNull();
      expect(result.current.versionId).toBeNull();
      expect(result.current.versionInfo).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch fields');
      vi.mocked(templatesService.getCurrentVersionFields).mockRejectedValue(
        error
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch fields');
      expect(result.current.fields).toEqual([]);
    });

    it('should refetch fields when calling refetch', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(
        templatesService.getCurrentVersionFields
      ).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(
          templatesService.getCurrentVersionFields
        ).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch if no templateId is set', () => {
      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.refetch();
      });

      expect(
        templatesService.getCurrentVersionFields
      ).not.toHaveBeenCalled();
      expect(templatesService.getVersionFields).not.toHaveBeenCalled();
    });

    it('should switch between current and specific version', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );
      vi.mocked(templatesService.getVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      // Fetch current version
      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(
        templatesService.getCurrentVersionFields
      ).toHaveBeenCalledTimes(1);
      expect(result.current.versionId).toBeNull();

      // Fetch specific version
      act(() => {
        result.current.fetchVersionFields(1, 5);
      });

      await waitFor(() => {
        expect(templatesService.getVersionFields).toHaveBeenCalledTimes(1);
      });

      expect(result.current.versionId).toBe(5);
    });
  });

  describe('Pagination', () => {
    it('should handle page change', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPage(2);
      });

      await waitFor(() => {
        expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 20,
          }
        );
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should handle page size change', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPageSize(50);
      });

      await waitFor(() => {
        expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
          1,
          {
            limit: 50,
            offset: 0,
          }
        );
      });

      expect(result.current.pagination.limit).toBe(50);
    });

    it('should calculate total pages correctly', async () => {
      const responseWith100Items: TemplateFieldListResponse = {
        ...mockFieldsResponse,
        total: 100,
      };
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        responseWith100Items
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalPages).toBe(5); // 100 items / 20 per page
    });
  });

  describe('Search and Filters', () => {
    it('should handle search query change', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearch('email');
      });

      await waitFor(() => {
        expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 0,
            search: 'email',
          }
        );
      });

      expect(result.current.search).toBe('email');
    });

    it('should handle page number filter', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPageNumber(3);
      });

      await waitFor(() => {
        expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 0,
            page_number: 3,
          }
        );
      });

      expect(result.current.pageNumber).toBe(3);
    });

    it('should clear page number filter', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPageNumber(3);
      });

      await waitFor(() => {
        expect(result.current.pageNumber).toBe(3);
      });

      act(() => {
        result.current.clearPageNumber();
      });

      await waitFor(() => {
        expect(templatesService.getCurrentVersionFields).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 0,
          }
        );
      });

      expect(result.current.pageNumber).toBeNull();
    });

    it('should reset to page 1 when changing search or filters', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to page 2
      act(() => {
        result.current.setPage(2);
      });

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2);
      });

      // Change search, should reset to page 1
      act(() => {
        result.current.setSearch('test');
      });

      await waitFor(() => {
        expect(result.current.currentPage).toBe(1);
      });
    });

    it('should debounce search queries', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        mockFieldsResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount =
        vi.mocked(templatesService.getCurrentVersionFields).mock.calls.length;

      // Rapidly change search query multiple times
      act(() => {
        result.current.setSearch('e');
      });
      act(() => {
        result.current.setSearch('em');
      });
      act(() => {
        result.current.setSearch('ema');
      });
      act(() => {
        result.current.setSearch('emai');
      });

      // Should only trigger one additional fetch after debounce delay
      await waitFor(
        () => {
          const currentCallCount =
            vi.mocked(templatesService.getCurrentVersionFields).mock.calls
              .length;
          expect(currentCallCount).toBe(initialCallCount + 1);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during fetch', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockFieldsResponse), 100);
          })
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set loading to false after error', async () => {
      vi.mocked(templatesService.getCurrentVersionFields).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Empty States', () => {
    it('should handle empty fields list', async () => {
      const emptyResponse: TemplateFieldListResponse = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
        version_info: {
          version_id: 1,
          version_number: '1.0',
          page_count: 5,
        },
      };
      vi.mocked(templatesService.getCurrentVersionFields).mockResolvedValue(
        emptyResponse
      );

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.fields).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful refetch', async () => {
      const error = new Error('Network error');
      vi.mocked(
        templatesService.getCurrentVersionFields
      ).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useTemplateFields());

      act(() => {
        result.current.fetchCurrentVersionFields(1);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Mock successful response for refetch
      vi.mocked(
        templatesService.getCurrentVersionFields
      ).mockResolvedValueOnce(mockFieldsResponse);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.fields).toEqual(mockFieldsResponse.items);
      });
    });
  });
});

