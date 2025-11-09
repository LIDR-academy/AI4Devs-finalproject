/**
 * Unit Tests for useTemplates Hook
 *
 * Tests the custom hook for fetching and managing template list with:
 * - Pagination state management
 * - Sorting configuration
 * - Search/filtering
 * - Loading and error states
 * - Data fetching and refetching
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplates } from '../../hooks/useTemplates';
import { templatesService } from '../../services/templates.service';
import type { TemplateListResponse } from '../../types/templates.types';

// Mock the templates service
vi.mock('../../services/templates.service', () => ({
  templatesService: {
    getTemplates: vi.fn(),
  },
}));

describe('useTemplates', () => {
  const mockTemplatesResponse: TemplateListResponse = {
    items: [
      {
        id: 1,
        name: 'Template A',
        version: '1.0',
        file_path: '/uploads/template_a.pdf',
        file_size_bytes: 2621440,
        field_count: 15,
        sepe_url: null,
        uploaded_by: null,
        updated_at: '2025-10-20T10:00:00Z',
        created_at: '2025-10-01T10:00:00Z',
      },
      {
        id: 2,
        name: 'Template B',
        version: '2.1',
        file_path: '/uploads/template_b.pdf',
        file_size_bytes: 3984588,
        field_count: 22,
        sepe_url: null,
        uploaded_by: null,
        updated_at: '2025-10-22T14:30:00Z',
        created_at: '2025-10-05T14:30:00Z',
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      expect(result.current.templates).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        limit: 20,
        offset: 0,
      });
      expect(result.current.sort).toEqual({
        sort_by: 'updated_at',
        sort_order: 'desc',
      });
      expect(result.current.search).toBe('');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch templates on mount', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getTemplates).toHaveBeenCalledTimes(1);
      expect(templatesService.getTemplates).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        sort_by: 'updated_at',
        sort_order: 'desc',
      });
      expect(result.current.templates).toEqual(mockTemplatesResponse.items);
      expect(result.current.total).toBe(mockTemplatesResponse.total);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch templates');
      vi.mocked(templatesService.getTemplates).mockRejectedValue(error);

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch templates');
      expect(result.current.templates).toEqual([]);
    });

    it('should refetch templates when calling refetch', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getTemplates).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page change', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPage(2);
      });

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledWith({
          limit: 20,
          offset: 20,
          sort_by: 'updated_at',
          sort_order: 'desc',
        });
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should handle page size change', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPageSize(50);
      });

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledWith({
          limit: 50,
          offset: 0,
          sort_by: 'updated_at',
          sort_order: 'desc',
        });
      });

      expect(result.current.pagination.limit).toBe(50);
    });

    it('should calculate total pages correctly', async () => {
      const responseWith100Items: TemplateListResponse = {
        ...mockTemplatesResponse,
        total: 100,
      };
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        responseWith100Items
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalPages).toBe(5); // 100 items / 20 per page
    });

    it('should reset to page 1 when changing page size', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to page 3
      act(() => {
        result.current.setPage(3);
      });

      await waitFor(() => {
        expect(result.current.currentPage).toBe(3);
      });

      // Change page size, should reset to page 1
      act(() => {
        result.current.setPageSize(50);
      });

      await waitFor(() => {
        expect(result.current.currentPage).toBe(1);
      });
    });
  });

  describe('Sorting', () => {
    it('should handle sort configuration change', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSort({
          sort_by: 'name',
          sort_order: 'asc',
        });
      });

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledWith({
          limit: 20,
          offset: 0,
          sort_by: 'name',
          sort_order: 'asc',
        });
      });

      expect(result.current.sort).toEqual({
        sort_by: 'name',
        sort_order: 'asc',
      });
    });

    it('should toggle sort order for same field', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First sort by name ascending
      act(() => {
        result.current.handleSort('name');
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          sort_by: 'name',
          sort_order: 'asc',
        });
      });

      // Sort by name again, should toggle to descending
      act(() => {
        result.current.handleSort('name');
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          sort_by: 'name',
          sort_order: 'desc',
        });
      });
    });

    it('should reset to ascending when sorting by different field', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Sort by name
      act(() => {
        result.current.handleSort('name');
      });

      await waitFor(() => {
        expect(result.current.sort.sort_by).toBe('name');
      });

      // Sort by different field, should start with ascending
      act(() => {
        result.current.handleSort('current_version');
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          sort_by: 'current_version',
          sort_order: 'asc',
        });
      });
    });
  });

  describe('Search', () => {
    it('should handle search query change', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSearch('Template A');
      });

      await waitFor(() => {
        expect(templatesService.getTemplates).toHaveBeenCalledWith({
          limit: 20,
          offset: 0,
          sort_by: 'updated_at',
          sort_order: 'desc',
          search: 'Template A',
        });
      });

      expect(result.current.search).toBe('Template A');
    });

    it('should reset to page 1 when searching', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

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

      // Search, should reset to page 1
      act(() => {
        result.current.setSearch('Test');
      });

      await waitFor(() => {
        expect(result.current.currentPage).toBe(1);
      });
    });

    it('should debounce search queries', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount =
        vi.mocked(templatesService.getTemplates).mock.calls.length;

      // Rapidly change search query multiple times
      act(() => {
        result.current.setSearch('T');
      });
      act(() => {
        result.current.setSearch('Te');
      });
      act(() => {
        result.current.setSearch('Tem');
      });
      act(() => {
        result.current.setSearch('Temp');
      });

      // Should only trigger one additional fetch after debounce delay
      await waitFor(
        () => {
          const currentCallCount =
            vi.mocked(templatesService.getTemplates).mock.calls.length;
          expect(currentCallCount).toBe(initialCallCount + 1);
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during fetch', async () => {
      vi.mocked(templatesService.getTemplates).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockTemplatesResponse), 100);
          })
      );

      const { result } = renderHook(() => useTemplates());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        mockTemplatesResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toEqual(mockTemplatesResponse.items);
    });

    it('should set loading to false after error', async () => {
      vi.mocked(templatesService.getTemplates).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Empty States', () => {
    it('should handle empty template list', async () => {
      const emptyResponse: TemplateListResponse = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };
      vi.mocked(templatesService.getTemplates).mockResolvedValue(
        emptyResponse
      );

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.templates).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful refetch', async () => {
      const error = new Error('Network error');
      vi.mocked(templatesService.getTemplates).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useTemplates());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Mock successful response for refetch
      vi.mocked(templatesService.getTemplates).mockResolvedValueOnce(
        mockTemplatesResponse
      );

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.templates).toEqual(mockTemplatesResponse.items);
      });
    });
  });
});

