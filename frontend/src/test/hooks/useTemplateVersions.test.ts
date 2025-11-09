/**
 * Unit Tests for useTemplateVersions Hook
 *
 * Tests the custom hook for fetching and managing template versions with:
 * - Lazy loading (only fetch when templateId is provided)
 * - Pagination state management
 * - Sorting configuration
 * - Loading and error states
 * - Data fetching and refetching
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplateVersions } from '../../hooks/useTemplateVersions';
import { templatesService } from '../../services/templates.service';
import type { TemplateVersionListResponse } from '../../types/templates.types';

// Mock the templates service
vi.mock('../../services/templates.service', () => ({
  templatesService: {
    getTemplateVersions: vi.fn(),
  },
}));

describe('useTemplateVersions', () => {
  const mockVersionsResponse: TemplateVersionListResponse = {
    items: [
      {
        id: 1,
        template_id: 1,
        version_number: '1.0',
        file_path: '/uploads/template_v1.0.pdf',
        file_size_bytes: 2621440,
        checksum: 'abc123',
        page_count: 5,
        title: 'Template Title',
        author: 'John Doe',
        subject: 'Test Template',
        creation_date: '2025-10-01T10:00:00Z',
        modification_date: '2025-10-15T10:00:00Z',
        created_at: '2025-10-01T10:00:00Z',
        is_current: true,
      },
      {
        id: 2,
        template_id: 1,
        version_number: '0.9',
        file_path: '/uploads/template_v0.9.pdf',
        file_size_bytes: 2097152,
        checksum: 'def456',
        page_count: 4,
        title: 'Template Title',
        author: 'Jane Smith',
        subject: 'Test Template',
        creation_date: '2025-09-15T10:00:00Z',
        modification_date: '2025-09-20T10:00:00Z',
        created_at: '2025-09-15T10:00:00Z',
        is_current: false,
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
      const { result } = renderHook(() => useTemplateVersions());

      expect(result.current.versions).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.templateId).toBeNull();
    });

    it('should not fetch versions without templateId', () => {
      renderHook(() => useTemplateVersions());

      expect(templatesService.getTemplateVersions).not.toHaveBeenCalled();
    });
  });

  describe('Lazy Loading', () => {
    it('should fetch versions when templateId is set', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.fetchVersions(1);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getTemplateVersions).toHaveBeenCalledTimes(1);
      expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(1, {
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      expect(result.current.versions).toEqual(mockVersionsResponse.items);
      expect(result.current.total).toBe(mockVersionsResponse.total);
      expect(result.current.templateId).toBe(1);
    });

    it('should reset state when clearing templateId', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      // Fetch versions
      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.versions.length).toBeGreaterThan(0);
      });

      // Clear
      act(() => {
        result.current.clearVersions();
      });

      expect(result.current.versions).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.templateId).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch versions');
      vi.mocked(templatesService.getTemplateVersions).mockRejectedValue(
        error
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch versions');
      expect(result.current.versions).toEqual([]);
    });

    it('should refetch versions when calling refetch', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getTemplateVersions).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledTimes(
          2
        );
      });
    });

    it('should not refetch if no templateId is set', () => {
      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.refetch();
      });

      expect(templatesService.getTemplateVersions).not.toHaveBeenCalled();
    });

    it('should fetch new template versions when templateId changes', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      // Fetch for template 1
      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );

      // Fetch for template 2
      act(() => {
        result.current.fetchVersions(2);
      });

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(
          2,
          expect.any(Object)
        );
      });

      expect(result.current.templateId).toBe(2);
    });
  });

  describe('Pagination', () => {
    it('should handle page change', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPage(2);
      });

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 20,
            sort_by: 'created_at',
            sort_order: 'desc',
          }
        );
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should handle page size change', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPageSize(50);
      });

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(
          1,
          {
            limit: 50,
            offset: 0,
            sort_by: 'created_at',
            sort_order: 'desc',
          }
        );
      });

      expect(result.current.pagination.limit).toBe(50);
    });

    it('should calculate total pages correctly', async () => {
      const responseWith100Items: TemplateVersionListResponse = {
        ...mockVersionsResponse,
        total: 100,
      };
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        responseWith100Items
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalPages).toBe(5); // 100 items / 20 per page
    });
  });

  describe('Sorting', () => {
    it('should handle sort configuration change', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setSort({
          sort_by: 'version_number',
          sort_order: 'asc',
        });
      });

      await waitFor(() => {
        expect(templatesService.getTemplateVersions).toHaveBeenCalledWith(
          1,
          {
            limit: 20,
            offset: 0,
            sort_by: 'version_number',
            sort_order: 'asc',
          }
        );
      });

      expect(result.current.sort).toEqual({
        sort_by: 'version_number',
        sort_order: 'asc',
      });
    });

    it('should toggle sort order for same field', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        mockVersionsResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First sort by version_number ascending
      act(() => {
        result.current.handleSort('version_number');
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          sort_by: 'version_number',
          sort_order: 'asc',
        });
      });

      // Sort by version_number again, should toggle to descending
      act(() => {
        result.current.handleSort('version_number');
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          sort_by: 'version_number',
          sort_order: 'desc',
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during fetch', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockVersionsResponse), 100);
          })
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set loading to false after error', async () => {
      vi.mocked(templatesService.getTemplateVersions).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Empty States', () => {
    it('should handle empty versions list', async () => {
      const emptyResponse: TemplateVersionListResponse = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };
      vi.mocked(templatesService.getTemplateVersions).mockResolvedValue(
        emptyResponse
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.versions).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful refetch', async () => {
      const error = new Error('Network error');
      vi.mocked(templatesService.getTemplateVersions).mockRejectedValueOnce(
        error
      );

      const { result } = renderHook(() => useTemplateVersions());

      act(() => {
        result.current.fetchVersions(1);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Mock successful response for refetch
      vi.mocked(
        templatesService.getTemplateVersions
      ).mockResolvedValueOnce(mockVersionsResponse);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.versions).toEqual(mockVersionsResponse.items);
      });
    });
  });
});

