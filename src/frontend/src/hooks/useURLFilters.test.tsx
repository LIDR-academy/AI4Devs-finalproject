/**
 * T-0506-FRONT: useURLFilters Hook Tests
 * 
 * TDD RED Phase: Tests for URL params synchronization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useURLFilters } from './useURLFilters';
import { usePartsStore } from '@/stores/parts.store';

// Mock the store
vi.mock('@/stores/parts.store', () => ({
  usePartsStore: vi.fn(),
}));

describe('useURLFilters', () => {
  const mockSetFilters = vi.fn();
  let originalLocation: Location;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Save original location
    originalLocation = window.location;
    
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      search: '',
    } as any;

    // Setup default store mock
    (usePartsStore as any).mockReturnValue({
      filters: { status: [], tipologia: [], workshop_id: null },
      setFilters: mockSetFilters,
    });
  });

  afterEach(() => {
    // Restore original location
    window.location = originalLocation;
  });

  describe('URL → Store synchronization (on mount)', () => {
    it('should read status filter from URL on mount', () => {
      window.location.search = '?status=validated';

      renderHook(() => useURLFilters());

      expect(mockSetFilters).toHaveBeenCalledWith({
        status: ['validated'],
        tipologia: [],
        workshop_id: null,
      });
    });

    it('should read multiple statuses from comma-separated URL param', () => {
      window.location.search = '?status=validated,uploaded';

      renderHook(() => useURLFilters());

      expect(mockSetFilters).toHaveBeenCalledWith({
        status: ['validated', 'uploaded'],
        tipologia: [],
        workshop_id: null,
      });
    });

    it('should read tipologia filter from URL', () => {
      window.location.search = '?tipologia=capitel';

      renderHook(() => useURLFilters());

      expect(mockSetFilters).toHaveBeenCalledWith({
        status: [],
        tipologia: ['capitel'],
        workshop_id: null,
      });
    });

    it('should read workshop_id filter from URL', () => {
      window.location.search = '?workshop_id=workshop-123';

      renderHook(() => useURLFilters());

      expect(mockSetFilters).toHaveBeenCalledWith({
        status: [],
        tipologia: [],
        workshop_id: 'workshop-123',
      });
    });

    it('should read combined filters from URL', () => {
      window.location.search = '?status=validated&tipologia=capitel&workshop_id=workshop-123';

      renderHook(() => useURLFilters());

      expect(mockSetFilters).toHaveBeenCalledWith({
        status: ['validated'],
        tipologia: ['capitel'],
        workshop_id: 'workshop-123',
      });
    });

    it('should not call setFilters if URL has no params', () => {
      window.location.search = '';

      renderHook(() => useURLFilters());

      // Should be called once with empty filters
      expect(mockSetFilters).toHaveBeenCalledWith({
        status: [],
        tipologia: [],
        workshop_id: null,
      });
    });
  });

  describe('Store → URL synchronization (reactive)', () => {
    it('should update URL when filters change in store', async () => {
      const mockReplaceState = vi.fn();
      window.history.replaceState = mockReplaceState;

      (usePartsStore as any).mockReturnValue({
        filters: { status: ['validated'], tipologia: [], workshop_id: null },
        setFilters: mockSetFilters,
      });

      renderHook(() => useURLFilters());

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          {},
          '',
          expect.stringContaining('status=validated')
        );
      });
    });

    it('should encode multiple values with commas', async () => {
      const mockReplaceState = vi.fn();
      window.history.replaceState = mockReplaceState;

      (usePartsStore as any).mockReturnValue({
        filters: { status: ['validated', 'uploaded'], tipologia: [], workshop_id: null },
        setFilters: mockSetFilters,
      });

      renderHook(() => useURLFilters());

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          {},
          '',
          expect.stringContaining('status=validated,uploaded')
        );
      });
    });

    it('should clear URL params when filters are empty', async () => {
      const mockReplaceState = vi.fn();
      window.history.replaceState = mockReplaceState;

      (usePartsStore as any).mockReturnValue({
        filters: { status: [], tipologia: [], workshop_id: null },
        setFilters: mockSetFilters,
      });

      renderHook(() => useURLFilters());

      await waitFor(() => {
        // When all filters empty, URL should be clean (just '?' or '')
        expect(mockReplaceState).toHaveBeenCalledWith(
          {},
          '',
          expect.not.stringContaining('status=')
        );
      });
    });
  });
});
