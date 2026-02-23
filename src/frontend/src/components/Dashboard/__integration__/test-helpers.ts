/**
 * Integration Test Helpers
 * T-0509-TEST-FRONT: Shared utilities for Dashboard 3D integration tests
 * 
 * @module test-helpers
 */

import { vi } from 'vitest';
import { usePartsStore } from '@/stores/parts.store';

/**
 * Setup Zustand store mock with selector support
 * 
 * @remarks
 * Canvas3D.tsx uses selector-based store access:
 * `const clearSelection = usePartsStore((state) => state.clearSelection)`
 * 
 * This requires mocks to support function calls via mockImplementation,
 * not just object returns via mockReturnValue.
 * 
 * @param overrides - Partial store state to override defaults
 * 
 * @example
 * ```typescript
 * setupStoreMock({ parts: [mockPartCapitel], isLoading: false });
 * render(<Dashboard3D />);
 * ```
 */
export const setupStoreMock = (overrides: Partial<ReturnType<typeof usePartsStore>> = {}) => {
  vi.mocked(usePartsStore).mockImplementation((selector: any) => {
    const mockState = {
      parts: [],
      isLoading: false,
      error: null,
      filters: { status: [], tipologia: [], workshop_id: null },
      selectedId: null,
      setParts: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setFilters: vi.fn(),
      selectPart: vi.fn(),
      clearSelection: vi.fn(),
      clearFilters: vi.fn(),
      getFilteredParts: vi.fn(() => []),
      ...overrides,
    };
    return selector ? selector(mockState) : mockState;
  });
};
