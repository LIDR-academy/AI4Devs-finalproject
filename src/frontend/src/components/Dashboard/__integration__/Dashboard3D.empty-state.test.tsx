/**
 * Integration Test Suite 4: Empty & Error States Integration
 * T-0509-TEST-FRONT: 3D Dashboard Integration Tests
 * 
 * Tests edge cases and error handling integration:
 * - Error message displays when store.error is set
 * - "Upload First Part" button visible in empty state
 * - Empty state disappears when parts load
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Dashboard3D from '../Dashboard3D';
import { usePartsStore } from '@/stores/parts.store';
import { mockPartCapitel } from '../../../test/fixtures/parts.fixtures';
import { setupStoreMock } from './test-helpers';

// Mock the Zustand store
vi.mock('@/stores/parts.store');

describe('Dashboard3D Empty & Error States Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Test 16: Error message displays when store.error set
   * 
   * Integration Point: partsStore.error → Dashboard3D → Error banner
   * Expected: Error message visible to user
   */
  it('displays error message when store.error is set', () => {
    const errorMessage = 'Failed to load parts from server';

    // Given: Store has error
    setupStoreMock({
      error: errorMessage,
    });

    // When: Render Dashboard
    render(<Dashboard3D />);

    // Then: Error message visible
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Optional: Verify error has appropriate ARIA role
    // const errorBanner = screen.getByRole('alert');
    // expect(errorBanner).toHaveTextContent(errorMessage);
  });

  /**
   * Test 17: "Upload First Part" button visible in empty state
   * 
   * Integration Point: parts.length === 0 → EmptyState → Upload button
   * Expected: Button with correct href and accessible label
   */
  it('shows "Upload First Part" button in empty state', () => {
    // Given: Empty parts array
    setupStoreMock({
      parts: [],
      isLoading: false,
    });

    // When: Render Dashboard
    render(<Dashboard3D />);

    // Then: Empty state message visible
    expect(screen.getByText(/no hay piezas/i)).toBeInTheDocument();

    // And: Upload button present with correct link
    const uploadButton = screen.getByRole('link', { name: /subir primera pieza/i });
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveAttribute('href', '/upload');
  });

  /**
   * Test 18: Empty state disappears immediately when parts load
   * 
   * Integration Point: parts.length 0 → 1 → EmptyState → Canvas
   * Expected: EmptyState unmounts, Canvas mounts seamlessly
   */
  it('transitions from empty state to canvas when parts load', () => {
    // Given: Initially empty
    const mockSetParts = vi.fn();
    setupStoreMock({
      parts: [],
      setParts: mockSetParts,
    });

    const { rerender } = render(<Dashboard3D />);

    // Verify empty state visible
    expect(screen.getByText(/no hay piezas/i)).toBeInTheDocument();
    expect(screen.queryByTestId('three-canvas')).not.toBeInTheDocument();

    // When: Parts load
    setupStoreMock({
      parts: [mockPartCapitel],
      getFilteredParts: vi.fn(() => [mockPartCapitel]),
    });

    rerender(<Dashboard3D />);

    // Then: Empty state gone, Canvas visible
    expect(screen.queryByText(/no hay piezas/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });
});

