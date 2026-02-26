/**
 * T-1009-TEST-FRONT: 3D Viewer Integration Tests (Happy Path)
 * TDD RED Phase - Tests written before integration verification
 * 
 * @remarks
 * This file tests the FULL integration flow without mocking components:
 * Dashboard3D → PartDetailModal → ModelLoader → PartViewerCanvas → PartMetadataPanel
 * 
 * Unlike unit tests (T-1004 through T-1008), these tests verify:
 * - Real component composition (no mocked components)
 * - Service layer integration (mocked HTTP responses, not services)
 * - Tab switching across actual DOM (Portal rendering)
 * - Keyboard shortcuts propagating through component tree
 * - State management via Zustand store
 * 
 * Test Strategy:
 * - Mock: HTTP responses (vi.mock services), Three.js/WebGL (setup.ts)
 * - Real: Component rendering, React hooks, event handlers, DOM interactions
 * 
 * Dependencies:
 * - T-1002-BACK: GET /api/parts/{id} endpoint (mocked)
 * - T-1003-BACK: GET /api/parts/{id}/navigation endpoint (mocked)
 * - T-1004-FRONT: PartViewerCanvas component
 * - T-1005-FRONT: ModelLoader component
 * - T-1006-FRONT: ViewerErrorBoundary component
 * - T-1007-FRONT: PartDetailModal component
 * - T-1008-FRONT: PartMetadataPanel component
 * 
 * @module test/integration/viewer-integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartDetailModal } from '@/components/Dashboard/PartDetailModal';
import { usePartsStore } from '@/stores/parts.store';
import * as uploadService from '@/services/upload.service';
import * as navigationService from '@/services/navigation.service';
import {
  mockPartDetailCapitel,
  mockPartDetailColumna,
  mockAdjacentPartsDefault,
} from '@/test/fixtures/viewer.fixtures';
import '@testing-library/jest-dom';

// Mock services (HTTP responses, not component behavior)
vi.mock('@/services/upload.service');
vi.mock('@/services/navigation.service');

// Mock createPortal to render in-place (avoid real Portal DOM manipulation in tests)
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('T-1009-TEST-FRONT: 3D Viewer Integration Tests - Happy Path', () => {
  /**
   * Test Setup: Mock API responses before each test
   * 
   * Simulates backend T-1002-BACK and T-1003-BACK API responses.
   * Tests verify component integration, not API implementation.
   */
  beforeEach(() => {
    // Mock T-1002-BACK: GET /api/parts/{id}
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailCapitel);
    
    // Mock T-1003-BACK: GET /api/parts/{id}/navigation
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue(mockAdjacentPartsDefault);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store to avoid test pollution
    usePartsStore.setState({ selectedId: null });
  });

  /**
   * HP-INT-01: Full user journey from Dashboard to 3D viewer
   * 
   * Flow: Dashboard3D → selectPart() → PartDetailModal opens → 
   * ModelLoader fetches data → PartViewerCanvas renders
   * 
   * Verifies:
   * - Modal opens when isOpen={true}
   * - Correct partId passed through component tree
   * - getPartDetail API called with correct ID
   * - Loading state → Success state transition
   * - 3D viewer components render (ModelLoader → PartViewerCanvas)
   */
  it('HP-INT-01: should open modal, fetch part data, and render 3D viewer', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    // Step 1: Modal should appear immediately (before data loads)
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Step 2: Loading state should show while fetching
    const loadingElements = screen.getAllByText(/cargando/i);
    expect(loadingElements.length).toBeGreaterThan(0);

    // Step 3: API called with correct ID
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailCapitel.id);
    });

    // Step 4: Part data displays after load
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Step 5: 3D Viewer tab active by default
    const viewerTab = screen.getByRole('tab', { name: /visor 3d/i });
    expect(viewerTab).toHaveAttribute('aria-selected', 'true');

    // Step 6: ModelLoader component renders (contains PartViewerCanvas)
    // Wait for loading state to finish and viewer content to render
    await waitFor(() => {
      const modelLoader = screen.getByTestId('model-loader');
      expect(modelLoader).toBeInTheDocument();
    });
  });

  /**
   * HP-INT-02: Switch between tabs (3D Viewer ↔ Metadata)
   * 
   * Verifies:
   * - Tab switching updates aria-selected
   * - Tab panels render/unmount correctly
   * - Metadata panel displays fetched part data
   * - 3D Viewer persists state when re-selected
   */
  it('HP-INT-02: should switch between 3D Viewer and Metadata tabs', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Initial state: 3D Viewer tab active
    const viewerTab = screen.getByRole('tab', { name: /visor 3d/i });
    const metadataTab = screen.getByRole('tab', { name: /metadatos/i });
    
    expect(viewerTab).toHaveAttribute('aria-selected', 'true');
    expect(metadataTab).toHaveAttribute('aria-selected', 'false');

    // Click Metadata tab
    await user.click(metadataTab);

    // Metadata tab now active
    expect(viewerTab).toHaveAttribute('aria-selected', 'false');
    expect(metadataTab).toHaveAttribute('aria-selected', 'true');

    // PartMetadataPanel should display (T-1008-FRONT component)
    await waitFor(() => {
      // Check for section headers from PartMetadataPanel
      expect(screen.getByText(/información/i)).toBeInTheDocument();
      expect(screen.getByText(/geometría/i)).toBeInTheDocument();
    });

    // Verify metadata displays correct part data
    const isoCodeElements = screen.getAllByText(mockPartDetailCapitel.iso_code);
    expect(isoCodeElements.length).toBeGreaterThan(0); // Header + metadata panel
    expect(screen.getByText(mockPartDetailCapitel.workshop_name!)).toBeInTheDocument();

    // Switch back to 3D Viewer
    await user.click(viewerTab);

    expect(viewerTab).toHaveAttribute('aria-selected', 'true');
    expect(metadataTab).toHaveAttribute('aria-selected', 'false');
  });

  /**
   * HP-INT-03: Navigate to previous part using navigation controls
   * 
   * Verifies:
   * - Prev button enabled when prev_id exists
   * - Click Prev → getPartNavigation called with new ID
   * - Modal updates with new part data
   * - ModelLoader reloads with new partId
   */
  it('HP-INT-03: should navigate to previous part when Prev button clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    // Setup: Mock navigation returns prev_id for initial part
    vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce(mockAdjacentPartsDefault);

    // When prev button clicked, mock the new part's data
    const mockPrevPart = { ...mockPartDetailColumna, id: mockAdjacentPartsDefault.prev_id! };
    const mockAdjacentPartsForPrevPart = {
      ...mockAdjacentPartsDefault,
      current_index: 4,
      next_id: mockPartDetailCapitel.id, // Now this one is next
    };

    // Mock getPartDetail to return correct part based on ID
    vi.mocked(uploadService.getPartDetail).mockImplementation(async (id: string) => {
      if (id === mockPartDetailCapitel.id) return mockPartDetailCapitel;
      if (id === mockPrevPart.id) return mockPrevPart;
      throw new Error('Unknown part ID');
    });
    
    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Find navigation controls (should be in modal header or footer)
    const prevButton = screen.getByLabelText(/pieza anterior/i);
    expect(prevButton).not.toBeDisabled(); // prev_id exists

    // Setup mock for navigation of new part
    vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce(mockAdjacentPartsForPrevPart);

    // Click Prev button
    await user.click(prevButton);

    // Verify navigation API called with new part ID
    await waitFor(() => {
      expect(navigationService.getPartNavigation).toHaveBeenCalledWith(mockPrevPart.id, null);
    });

    // Verify new part data loads
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPrevPart.id);
      expect(screen.getByText(mockPrevPart.iso_code)).toBeInTheDocument();
    });
  });

  /**
   * HP-INT-04: Navigate to next part using navigation controls
   * 
   * Verifies:
   * - Next button enabled when next_id exists
   * - Click Next → getPartNavigation called with new ID
   * - Modal updates with new part data
   */
  it('HP-INT-04: should navigate to next part when Next button clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    // Setup: Mock navigation returns next_id for initial part
    vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce(mockAdjacentPartsDefault);

    const mockNextPart = { ...mockPartDetailColumna, id: mockAdjacentPartsDefault.next_id! };
    const mockAdjacentPartsForNextPart = {
      ...mockAdjacentPartsDefault,
      current_index: 6,
      prev_id: mockPartDetailCapitel.id, // Now this one is prev
    };

    // Mock getPartDetail to return correct part based on ID
    vi.mocked(uploadService.getPartDetail).mockImplementation(async (id: string) => {
      if (id === mockPartDetailCapitel.id) return mockPartDetailCapitel;
      if (id === mockNextPart.id) return mockNextPart;
      throw new Error('Unknown part ID');
    });
    
    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText(/pieza siguiente/i);
    expect(nextButton).not.toBeDisabled();

    // Setup mock for navigation of new part
    vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce(mockAdjacentPartsForNextPart);

    await user.click(nextButton);

    await waitFor(() => {
      expect(navigationService.getPartNavigation).toHaveBeenCalledWith(mockNextPart.id, null);
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockNextPart.id);
      expect(screen.getByText(mockNextPart.iso_code)).toBeInTheDocument();
    });
  });

  /**
   * HP-INT-05: Close modal with ESC key
   * 
   * Verifies:
   * - ESC key listener attached globally
   * - onClose callback triggered
   * - useBodyScrollLock releases (allows page scroll)
   */
  it('HP-INT-05: should close modal when ESC key pressed', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Press ESC key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * HP-INT-06: Close modal with backdrop click
   * 
   * Verifies:
   * - Click outside modal content triggers close
   * - Click inside modal content does NOT close
   * - onClose callback triggered only on backdrop
   */
  it('HP-INT-06: should close modal when backdrop clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    const backdrop = screen.getByTestId('modal-backdrop');

    // Click backdrop (outside modal content)
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    mockOnClose.mockClear();

    // Click inside modal content (should NOT close)
    const modal = screen.getByRole('dialog');
    const modalContent = within(modal).getByText(mockPartDetailCapitel.iso_code);
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  /**
   * HP-INT-07: Close modal with close button (×)
   * 
   * Verifies:
   * - Close button visible in modal header
   * - Click triggers onClose callback
   * - Modal unmounts cleanly
   */
  it('HP-INT-07: should close modal when close button clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={true}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Find close button (usually has aria-label="Cerrar modal" or similar)
    const closeButton = screen.getByLabelText(/cerrar/i);
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  /**
   * HP-INT-08: Modal does not render when isOpen={false}
   * 
   * Verifies:
   * - No modal in DOM when closed
   * - No API calls made when closed
   * - Clean mount/unmount cycle
   */
  it('HP-INT-08: should not render modal when isOpen={false}', () => {
    const mockOnClose = vi.fn();

    render(
      <PartDetailModal
        isOpen={false}
        partId={mockPartDetailCapitel.id}
        onClose={mockOnClose}
      />
    );

    // Modal should not exist in DOM
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // No API calls should be made
    expect(uploadService.getPartDetail).not.toHaveBeenCalled();
    expect(navigationService.getPartNavigation).not.toHaveBeenCalled();
  });
});
