/**
 * T-1009-TEST-FRONT: 3D Viewer Integration Tests - Edge Cases
 * 
 * Tests edge cases for the 3D viewer modal integration:
 * - Processing state (low_poly_url null) → BBoxProxy fallback
 * - Missing bbox → Default FALLBACK_BBOX
 * - Validation errors → Red badge display
 * - First part in list → Prev button disabled
 * - Last part in list → Next button disabled
 * 
 * Pattern: MSW mocking (services mocked, components real), userEvent interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Component under test
import { PartDetailModal } from '@/components/Dashboard/PartDetailModal';

// Services (mocked)
import * as uploadService from '@/services/upload.service';
import * as navigationService from '@/services/navigation.service';

// Fixtures
import {
  mockPartDetailProcessing,
  mockPartDetailInvalidated,
  mockPartDetailCapitel,
  mockAdjacentPartsFirst,
  mockAdjacentPartsLast,
} from '../fixtures/viewer.fixtures';

// Store
import { usePartsStore } from '@/stores/parts.store';

// Mock Portal (avoids nested document.body during rendering)
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock Services
vi.mock('@/services/upload.service');
vi.mock('@/services/navigation.service');

describe('T-1009-TEST-FRONT: 3D Viewer Integration Tests - Edge Cases', () => {
  const mockOnClose = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnClose.mockClear();
    vi.clearAllMocks();
    
    // Reset store
    usePartsStore.setState({ selectedId: null });
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * EC-INT-01: Processing State (low_poly_url null) → BBoxProxy Fallback
   * 
   * GIVEN: User opens modal for a part with in_processing status
   * AND: low_poly_url is null (file not yet generated)
   * WHEN: Modal opens and fetches part data
   * THEN: 3D viewer should render BBoxProxy component (wireframe bounding box)
   * AND: No GLB model loader should be invoked
   * AND: Canvas should still display successfully
   */
  it('EC-INT-01: should render BBoxProxy when part is in processing state with null low_poly_url', async () => {
    // Arrange: Mock backend returning processing part
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailProcessing);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailProcessing.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailProcessing.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailProcessing.iso_code)).toBeInTheDocument();
    });

    // Assert: BBoxProxy should render (not ModelLoader)
    // NOTE: In real implementation, BBoxProxy renders a <mesh> with WireframeGeometry
    // Here we verify by checking that ModelLoader test-id is NOT present
    const modelLoader = screen.queryByTestId('model-loader');
    expect(modelLoader).not.toBeInTheDocument();

    // Assert: Canvas still renders (even with BBoxProxy)
    const canvas = screen.getByTestId('part-viewer-canvas');
    expect(canvas).toBeInTheDocument();
  });

  /**
   * EC-INT-02: Missing bbox → Default FALLBACK_BBOX
   * 
   * GIVEN: User opens modal for a part with null bbox
   * WHEN: Modal opens and ModelLoader tries to compute camera distance
   * THEN: System should use FALLBACK_BBOX from constants
   * AND: No crash or error boundary triggered
   * AND: Camera should position correctly with fallback dimensions
   */
  it('EC-INT-02: should use FALLBACK_BBOX when part.bbox is null', async () => {
    // Arrange: Create part with null bbox
    const partWithNullBbox = {
      ...mockPartDetailCapitel,
      bbox: null,
    };

    vi.mocked(uploadService.getPartDetail).mockResolvedValue(partWithNullBbox);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={partWithNullBbox.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(partWithNullBbox.id);
    });

    // Assert: Part code displayed (modal rendered successfully)
    await waitFor(() => {
      expect(screen.getByText(partWithNullBbox.iso_code)).toBeInTheDocument();
    });

    // Assert: No error boundary triggered (no "Algo salió mal" message)
    expect(screen.queryByText(/algo salió mal/i)).not.toBeInTheDocument();

    // Assert: ModelLoader still renders (uses fallback bbox internally)
    await waitFor(() => {
      const modelLoader = screen.getByTestId('model-loader');
      expect(modelLoader).toBeInTheDocument();
    }, { timeout: 5000 });

    // Assert: Canvas renders
    await waitFor(() => {
      const canvas = screen.getByTestId('part-viewer-canvas');
      expect(canvas).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  /**
   * EC-INT-03: Validation Errors → Red Badge Display
   * 
   * GIVEN: User opens modal for a part with validation_report containing errors
   * WHEN: Modal opens and displays "Validación" tab
   * THEN: Validation tab should show a red badge indicator
   * AND: When user clicks Validación tab, errors should be displayed
   * AND: Metadata tab should not show badge (only Validación tab)
   */
  it('EC-INT-03: should display red badge on Validación tab when part has validation errors', async () => {
    // Arrange: Mock backend returning part with validation errors
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailInvalidated);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailInvalidated.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailInvalidated.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailInvalidated.iso_code)).toBeInTheDocument();
    });

    // Assert: Validación tab exists
    const validacionTab = screen.getByRole('tab', { name: /validación/i });
    expect(validacionTab).toBeInTheDocument();

    // Assert: Red badge is visible on Validación tab (visual indicator for errors)
    // NOTE: Real implementation uses a red dot or number badge
    // Here we check for specific test-id or styling
    const validacionBadge = screen.queryByTestId('validation-error-badge');
    expect(validacionBadge).toBeInTheDocument();

    // Act: Click Validación tab
    await user.click(validacionTab);

    // Assert: Validation errors displayed
    await waitFor(() => {
      expect(screen.getByText(/errores de validación/i)).toBeInTheDocument();
    });

    // Assert: At least one error item visible
    const errorList = screen.getByTestId('validation-errors-list');
    expect(errorList).toBeInTheDocument();
  });

  /**
   * EC-INT-04: First Part in List → Prev Button Disabled
   * 
   * GIVEN: User opens modal for the first part in the filtered list
   * WHEN: Modal renders with navigation controls
   * THEN: "Pieza anterior" button should be disabled (no previous part exists)
   * AND: "Pieza siguiente" button should be enabled
   * AND: Position indicator shows "Pieza 1 de N"
   */
  it('EC-INT-04: should disable Prev button when viewing first part in list', async () => {
    // Arrange: Mock backend returning first part navigation
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailCapitel);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue(mockAdjacentPartsFirst);

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailCapitel.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailCapitel.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Assert: Position indicator shows "Pieza 1 de X"
    const positionIndicator = screen.getByLabelText(/posición en lista filtrada/i);
    expect(positionIndicator).toHaveTextContent('Pieza 1 de');

    // Assert: Prev button is disabled
    const prevButton = screen.getByLabelText(/pieza anterior/i);
    expect(prevButton).toBeDisabled();

    // Assert: Next button is enabled
    const nextButton = screen.getByLabelText(/pieza siguiente/i);
    expect(nextButton).not.toBeDisabled();
  });

  /**
   * EC-INT-05: Last Part in List → Next Button Disabled
   * 
   * GIVEN: User opens modal for the last part in the filtered list
   * WHEN: Modal renders with navigation controls
   * THEN: "Pieza siguiente" button should be disabled (no next part exists)
   * AND: "Pieza anterior" button should be enabled
   * AND: Position indicator shows "Pieza N de N"
   */
  it('EC-INT-05: should disable Next button when viewing last part in list', async () => {
    // Arrange: Mock backend returning last part navigation
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailCapitel);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue(mockAdjacentPartsLast);

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailCapitel.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailCapitel.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Assert: Position indicator shows "Pieza 20 de 20"
    const positionIndicator = screen.getByLabelText(/posición en lista filtrada/i);
    expect(positionIndicator).toHaveTextContent('Pieza 20 de 20');

    // Assert: Next button is disabled
    const nextButton = screen.getByLabelText(/pieza siguiente/i);
    expect(nextButton).toBeDisabled();

    // Assert: Prev button is enabled
    const prevButton = screen.getByLabelText(/pieza anterior/i);
    expect(prevButton).not.toBeDisabled();
  });
});
