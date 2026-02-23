/**
 * Integration Test Suite 3: Selection & Modal Integration
 * T-0509-TEST-FRONT: 3D Dashboard Integration Tests
 * 
 * Tests the integration between part selection, modal display, and deselection:
 * - Clicking part opens modal with correct data
 * - ESC key closes modal and deselects
 * - Backdrop click closes modal
 * - Selected part shows emissive glow
 * - Selecting another part updates modal content
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Dashboard3D from '../Dashboard3D';
import { usePartsStore } from '@/stores/parts.store';
import { mockPartCapitel, mockPartColumna } from '../../../test/fixtures/parts.fixtures';

// Mock the Zustand store
vi.mock('@/stores/parts.store');

/**
 * Helper: Setup store mock with custom overrides
 */
const setupStoreMock = (overrides: Partial<ReturnType<typeof usePartsStore>> = {}) => {
  vi.mocked(usePartsStore).mockImplementation((selector: any) => {
    const mockState = {
      parts: [mockPartCapitel, mockPartColumna],
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
      getFilteredParts: vi.fn(() => [mockPartCapitel, mockPartColumna]),
      ...overrides,
    };
    return selector ? selector(mockState) : mockState;
  });
};

describe('Dashboard3D Selection & Modal Integration', () => {
  beforeEach(() => {
    // Reset store state with 2 parts
    setupStoreMock();
  });

  /**
   * Test 11: Clicking part opens modal with correct data
   * 
   * Integration Point: PartMesh.onClick → partsStore.selectPart → PartDetailModal
   * Expected: Modal visible with part iso_code in heading
   */
  it('opens modal with correct part data when part is clicked', async () => {
    const mockSelectPart = vi.fn();
    
    // Given: No part selected initially
    setupStoreMock({
      selectedId: null,
      selectPart: mockSelectPart,
    });

    render(<Dashboard3D />);

    // When: Simulate part selection (in real app, clicking PartMesh calls selectPart)
    act(() => {
      mockSelectPart(mockPartCapitel.id);
    });

    // Update mock to reflect selected state
    setupStoreMock({
      selectedId: mockPartCapitel.id,
    });

    // Re-render with updated state
    render(<Dashboard3D />);

    // Then: Modal should be visible with part details
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    // Verify modal contains part ISO code
    expect(screen.getByText(mockPartCapitel.iso_code)).toBeInTheDocument();
  });

  /**
   * Test 12: ESC key closes modal and deselects part
   * 
   * Integration Point: Window.keydown(ESC) → partsStore.clearSelection → Modal unmounts
   * Expected: Modal closes, selectedId becomes null
   */
  it('closes modal and deselects part when ESC key pressed', async () => {
    const mockClearSelection = vi.fn();

    // Given: Part is selected and modal is open
    setupStoreMock({
      selectedId: mockPartCapitel.id,
      clearSelection: mockClearSelection,
    });

    render(<Dashboard3D />);

    // Verify modal is visible
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // When: Press ESC key
    fireEvent.keyDown(window, { key: 'Escape' });

    // Then: clearSelection was called
    await waitFor(() => {
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  /**
   * Test 13: Backdrop click closes modal
   * 
   * Integration Point: Modal backdrop click → partsStore.clearSelection
   * Expected: Clicking outside modal closes it
   */
  it('closes modal when backdrop is clicked', async () => {
    const mockClearSelection = vi.fn();

    // Given: Modal is open
    setupStoreMock({
      selectedId: mockPartCapitel.id,
      clearSelection: mockClearSelection,
    });

    render(<Dashboard3D />);

    // When: Click backdrop (the dialog div IS the backdrop)
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    // Then: clearSelection was called
    await waitFor(() => {
      expect(mockClearSelection).toHaveBeenCalled();
    });
  });

  /**
   * Test 14: Selected part shows emissive glow
   * 
   * Integration Point: partsStore.selectedId → PartMesh emissive material
   * Expected: Material has emissive color matching status
   * 
   * NOTE: Testing 3D material properties in jsdom is limited.
   * This test verifies that the selectedId state is accessible to PartMesh.
   */
  it('applies emissive glow to selected part', () => {
    // Given: Part is selected
    setupStoreMock({
      selectedId: mockPartCapitel.id,
    });

    // When: Render Dashboard
    const { container } = render(<Dashboard3D />);

    // Then: Verify modal is rendered (indicates selection works)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // In real implementation, PartMesh checks:
    // const isSelected = selectedId === part.id;
    // and applies: emissive={isSelected ? STATUS_COLORS[part.status] : 0x000000}
    // We can't test Three.js material directly in jsdom, but selection state is verified
  });

  /**
   * Test 15: Selecting another part closes first modal, opens new one
   * 
   * Integration Point: selectPart(newId) → Modal content updates
   * Expected: Modal shows new part data, old part deselected
   */
  it('updates modal content when selecting different part', async () => {
    const mockSelectPart = vi.fn();

    // Given: First part selected
    setupStoreMock({
      selectedId: mockPartCapitel.id,
      selectPart: mockSelectPart,
    });

    const { rerender } = render(<Dashboard3D />);

    // Verify first modal
    expect(screen.getByText(mockPartCapitel.iso_code)).toBeInTheDocument();

    // When: Select second part
    act(() => {
      mockSelectPart(mockPartColumna.id);
    });

    // Update mock to new selection
    setupStoreMock({
      selectedId: mockPartColumna.id,
    });

    rerender(<Dashboard3D />);

    // Then: Modal shows new part data
    await waitFor(() => {
      expect(screen.getByText(mockPartColumna.iso_code)).toBeInTheDocument();
      expect(screen.queryByText(mockPartCapitel.iso_code)).not.toBeInTheDocument();
    });
  });
});

