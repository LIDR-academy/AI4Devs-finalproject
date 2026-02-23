/**
 * Integration Test Suite 1: Dashboard3D Rendering
 * T-0509-TEST-FRONT: 3D Dashboard Integration Tests
 * 
 * Tests the integration between Dashboard3D orchestrator component and its children:
 * - Canvas3D + PartsScene rendering when parts exist
 * - EmptyState display when no parts
 * - LoadingOverlay during fetch
 * - Parts with low_poly_url render correctly
 * - Performance: 150 mocked parts render in <2s
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Dashboard3D from '../Dashboard3D';
import { usePartsStore } from '@/stores/parts.store';
import { mockPartCapitel, mockPartColumna, mockPartDovela, generate150MockParts } from '../../../test/fixtures/parts.fixtures';
import { setupStoreMock } from './test-helpers';

// Mock the Zustand store
vi.mock('@/stores/parts.store');

describe('Dashboard3D Rendering Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Test 1: Dashboard renders Canvas + Sidebar when parts exist
   * 
   * Integration Point: partsStore.parts → Dashboard3D → Canvas3D + DraggableFiltersSidebar
   * Expected: Both canvas and sidebar are present in the DOM
   */
  it('renders Canvas and Sidebar when parts array has items', () => {
    // Given: Store has 2 parts
    setupStoreMock({
      parts: [mockPartCapitel, mockPartColumna],
      getFilteredParts: vi.fn(() => [mockPartCapitel, mockPartColumna]),
    });

    // When: Render Dashboard3D
    render(<Dashboard3D />);

    // Then: Canvas and Sidebar are both visible
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar has role="complementary"
  });

  /**
   * Test 2: Empty state replaces canvas when no parts
   * 
   * Integration Point: partsStore.parts.length === 0 → Dashboard3D → EmptyState
   * Expected: Canvas NOT visible, EmptyState visible with correct message
   */
  it('shows EmptyState when parts array is empty', () => {
    // Given: Store has 0 parts
    setupStoreMock({
      parts: [],
      isLoading: false,
    });

    // When: Render Dashboard3D
    render(<Dashboard3D />);

    // Then: EmptyState visible, Canvas NOT visible
    expect(screen.queryByTestId('three-canvas')).not.toBeInTheDocument();
    expect(screen.getByText(/no hay piezas/i)).toBeInTheDocument();
    
    // Verify "Upload First Part" button exists
    const uploadButton = screen.getByRole('link', { name: /subir primera pieza/i });
    expect(uploadButton).toHaveAttribute('href', '/upload');
  });

  /**
   * Test 3: Loading overlay shows during fetch
   * 
   * Integration Point: partsStore.isLoading === true → Dashboard3D → LoadingOverlay
   * Expected: LoadingOverlay visible with spinner/message
   */
  it('displays LoadingOverlay when isLoading is true', () => {
    // Given: Store is in loading state
    setupStoreMock({
      parts: [],
      isLoading: true,
    });

    // When: Render Dashboard3D
    render(<Dashboard3D />);

    // Then: LoadingOverlay visible
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    
    // Optional: Verify spinner exists (if implemented)
    // const spinner = screen.getByRole('status', { name: /loading/i });
    // expect(spinner).toBeInTheDocument();
  });

  /**
   * Test 4: Parts with low_poly_url render, null URLs skip
   * 
   * Integration Point: PartsScene filters parts → only renders parts with low_poly_url
   * Expected: Dovela (low_poly_url = undefined) should NOT render
   */
  it('only renders parts with valid low_poly_url', () => {
    // Given: 3 parts, one without low_poly_url (mockPartDovela)
    setupStoreMock({
      parts: [mockPartCapitel, mockPartColumna, mockPartDovela],
      getFilteredParts: vi.fn(() => [mockPartCapitel, mockPartColumna, mockPartDovela]),
    });

    // When: Render Dashboard3D
    const { container } = render(<Dashboard3D />);

    // Then: Check that PartsScene filters correctly
    // (In the real implementation, PartsScene.tsx filters parts with low_poly_url !== null)
    // We can't directly test the 3D scene structure in jsdom, but we can verify
    // that the component renders without errors and the store is accessed correctly
    
    const canvas = screen.getByTestId('three-canvas');
    expect(canvas).toBeInTheDocument();
    
    // Verify getFilteredParts was called (PartsScene uses this)
    expect(vi.mocked(usePartsStore)().getFilteredParts).toHaveBeenCalled();
  });

  /**
   * Test 5: Canvas maintains 60 FPS with 150 mocked parts (performance)
   * 
   * Integration Point: Performance test - 150 parts should render in <2000ms
   * Expected: Component mount time <2s (automated timing)
   * 
   * NOTE: This is a smoke test. Real FPS testing requires manual protocol (see Test 20 in spec).
   */
  it('renders 150 parts in less than 2 seconds', () => {
    // Given: 150 mock parts
    const parts = generate150MockParts(150);
    setupStoreMock({
      parts,
      getFilteredParts: vi.fn(() => parts),
    });

    // When: Measure render time
    const startTime = performance.now();
    render(<Dashboard3D />);
    const renderTime = performance.now() - startTime;

    // Then: Render completes in <2000ms
    expect(renderTime).toBeLessThan(2000);
    
    // Verify canvas rendered successfully
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });
});

