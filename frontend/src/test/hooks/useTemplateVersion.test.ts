/**
 * Unit Tests for useTemplateVersion Hook
 *
 * Tests the custom hook for fetching and managing a single template version with:
 * - Data fetching by version ID
 * - Loading and error states
 * - Manual refetch capability
 * - Handling of undefined versionId
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplateVersion } from '../../hooks/useTemplateVersion';
import { templatesService } from '../../services/templates.service';
import type { TemplateVersionDetail } from '../../types/templates.types';

// Mock the templates service
vi.mock('../../services/templates.service', () => ({
  templatesService: {
    getVersionById: vi.fn(),
  },
}));

describe('useTemplateVersion', () => {
  const mockVersionDetail: TemplateVersionDetail = {
    // Version information
    id: 1,
    version_number: '1.0',
    change_summary: 'Initial version',
    is_current: true,
    created_at: '2025-10-26T10:00:00Z',
    // File information
    file_path: '/app/uploads/test-template.pdf',
    file_size_bytes: 2621440,
    field_count: 48,
    sepe_url: 'https://www.sepe.es/templates/test',
    // PDF metadata
    title: 'Test Template',
    author: 'SEPE',
    subject: 'Test Subject',
    creation_date: '2024-10-15T08:00:00Z',
    modification_date: '2024-10-20T14:30:00Z',
    page_count: 5,
    // Associated template
    template: {
      id: 10,
      name: 'Test Template Name',
      current_version: '1.0',
      comment: 'Test comment',
      uploaded_by: 5,
      created_at: '2025-10-26T09:45:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null data and not loading', () => {
    const { result } = renderHook(() => useTemplateVersion(undefined));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch version data on mount when versionId is provided', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockVersionDetail);
    expect(result.current.error).toBeNull();
    expect(templatesService.getVersionById).toHaveBeenCalledWith(1);
    expect(templatesService.getVersionById).toHaveBeenCalledTimes(1);
  });

  it('should not fetch data when versionId is undefined', async () => {
    const { result } = renderHook(() => useTemplateVersion(undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(templatesService.getVersionById).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Version not found';
    vi.mocked(templatesService.getVersionById).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useTemplateVersion(999));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for error state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(templatesService.getVersionById).toHaveBeenCalledWith(999);
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(templatesService.getVersionById).mockRejectedValue(
      'String error'
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to fetch version details');
  });

  it('should refetch data when versionId changes', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result, rerender } = renderHook(
      ({ versionId }) => useTemplateVersion(versionId),
      { initialProps: { versionId: 1 } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockVersionDetail);
    expect(templatesService.getVersionById).toHaveBeenCalledWith(1);

    // Change versionId
    const newVersionDetail = { ...mockVersionDetail, id: 2, version_number: '2.0' };
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      newVersionDetail
    );

    rerender({ versionId: 2 });

    await waitFor(() => {
      expect(result.current.data).toEqual(newVersionDetail);
    });

    expect(templatesService.getVersionById).toHaveBeenCalledWith(2);
    expect(templatesService.getVersionById).toHaveBeenCalledTimes(2);
  });

  it('should clear data when versionId changes to undefined', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result, rerender } = renderHook(
      ({ versionId }) => useTemplateVersion(versionId),
      { initialProps: { versionId: 1 as number | undefined } }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockVersionDetail);
    });

    // Change to undefined
    rerender({ versionId: undefined });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should allow manual refetch', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(templatesService.getVersionById).toHaveBeenCalledTimes(1);

    // Manual refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(templatesService.getVersionById).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(mockVersionDetail);
  });

  it('should clear error on successful refetch', async () => {
    // First call fails
    vi.mocked(templatesService.getVersionById).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Refetch succeeds
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockVersionDetail);
    });
  });

  it('should maintain loading state during refetch', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start refetch
    let refetchPromise: Promise<void>;
    await act(async () => {
      refetchPromise = result.current.refetch();
      // Check loading state immediately
      await Promise.resolve(); // Let microtasks run
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      await refetchPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should return correctly typed data', async () => {
    vi.mocked(templatesService.getVersionById).mockResolvedValue(
      mockVersionDetail
    );

    const { result } = renderHook(() => useTemplateVersion(1));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockVersionDetail);
    });

    // Type assertions - these would fail compilation if types are wrong
    if (result.current.data) {
      const versionNumber: string = result.current.data.version_number;
      const templateName: string = result.current.data.template.name;
      const fieldCount: number = result.current.data.field_count;

      expect(versionNumber).toBe('1.0');
      expect(templateName).toBe('Test Template Name');
      expect(fieldCount).toBe(48);
    }
  });
});

