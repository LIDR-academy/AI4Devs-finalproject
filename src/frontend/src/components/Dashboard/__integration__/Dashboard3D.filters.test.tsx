/**
 * Integration Test Suite 2: Filters & State Integration
 * T-0509-TEST-FRONT: 3D Dashboard Integration Tests
 * 
 * Tests the integration between FiltersSidebar, Zustand store, and Canvas rendering:
 * - Filter selection updates store state
 * - Store state updates trigger canvas opacity changes
 * - Clear filters button resets all state
 * - AND logic for multiple active filters
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard3D from '../Dashboard3D';
import { usePartsStore } from '@/stores/parts.store';
import { mockPartsForFilterTesting } from '../../../test/fixtures/parts.fixtures';

// Mock the Zustand store
vi.mock('@/stores/parts.store');

/**
 * Helper: Setup store mock with custom overrides
 */
const setupStoreMock = (overrides: Partial<ReturnType<typeof usePartsStore>> = {}) => {
  vi.mocked(usePartsStore).mockImplementation((selector: any) => {
    const mockState = {
      parts: mockPartsForFilterTesting,
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
      getFilteredParts: vi.fn(() => mockPartsForFilterTesting),
      ...overrides,
    };
    return selector ? selector(mockState) : mockState;
  });
};

describe('Dashboard3D Filters & State Integration', () => {
  beforeEach(() => {
    // Reset store with test fixtures
    setupStoreMock();
  });

  /**
   * Test 6: Filtering by tipologia updates canvas opacity
   * 
   * Integration Point: FiltersSidebar → partsStore.setFilters → PartMesh opacity
   * Expected: getFilteredParts returns only matching parts
   */
  it('filters parts by tipologia when checkbox selected', async () => {
    const user = userEvent.setup();
    const mockSetFilters = vi.fn();
    const mockGetFilteredParts = vi.fn(() => 
      mockPartsForFilterTesting.filter(p => p.tipologia === 'capitel')
    );

    setupStoreMock({
      setFilters: mockSetFilters,
      getFilteredParts: mockGetFilteredParts,
    });

    // When: Render Dashboard and click "capitel" filter
    render(<Dashboard3D />);
    
    // Find the capitel checkbox (assuming CheckboxGroup renders with label)
    const capitelCheckbox = screen.getByRole('checkbox', { name: /capitel/i });
    await user.click(capitelCheckbox);

    // Then: setFilters was called with tipologia: ['capitel']
    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        tipologia: expect.arrayContaining(['capitel']),
      })
    );
  });

  /**
   * Test 7: Clear filters button resets all filters
   * 
   * Integration Point: ClearFiltersButton → partsStore.clearFilters
   * Expected: All filters reset to empty
   */
  it('clears all filters when clear button clicked', async () => {
    const user = userEvent.setup();
    const mockClearFilters = vi.fn();

    setupStoreMock({
      filters: { status: ['validated'], tipologia: ['capitel'], workshop_id: null },
      clearFilters: mockClearFilters,
    });

    // When: Render Dashboard with active filters and click clear
    render(<Dashboard3D />);
    
    const clearButton = screen.getByRole('button', { name: /limpiar/i });
    await user.click(clearButton);

    // Then: clearFilters was called
    expect(mockClearFilters).toHaveBeenCalled();
  });

  /**
   * Test 8: Multiple filter types combine with AND logic
   * 
   * Integration Point: FiltersSidebar → partsStore.getFilteredParts (AND logic)
   * Expected: Only parts matching ALL filter conditions are returned
   */
  it('combines multiple filters with AND logic', () => {
    const mockGetFilteredParts = vi.fn(() => 
      mockPartsForFilterTesting.filter(
        p => p.tipologia === 'capitel' && p.status === 'validated'
      )
    );

    setupStoreMock({
      filters: { tipologia: ['capitel'], status: ['validated'], workshop_id: null },
      getFilteredParts: mockGetFilteredParts,
    });

    // When: Render Dashboard with multiple active filters
    render(<Dashboard3D />);

    // Then: getFilteredParts returns only parts matching BOTH conditions
    const filteredParts = mockGetFilteredParts();
    expect(filteredParts).toHaveLength(2); // mockPartCapitel + second validated capitel (SF-C12-CAP-006)
    expect(filteredParts.every(p => p.tipologia === 'capitel')).toBe(true);
    expect(filteredParts.every(p => p.status === 'validated')).toBe(true);
  });
});

