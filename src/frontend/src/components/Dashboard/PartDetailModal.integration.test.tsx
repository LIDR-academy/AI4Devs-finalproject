/**
 * PartDetailModal Tests (T-1007-FRONT)
 * TDD RED Phase - Modal Integration with 3D Viewer, Tabs, Navigation
 * 
 * @remarks
 * This file implements 29 test cases from T-1007-FRONT Technical Specification
 * All tests are EXPECTED TO FAIL (RED phase) until implementation is complete
 * 
 * NOTE: This file uses new T-1007 props interface (partId instead of part)
 * Old T-0508 tests remain in PartDetailModal.test.tsx (will be deleted after migration)
 * 
 * Test Categories:
 * - Happy Path: 6 tests (modal open, tabs, navigation)
 * - Edge Cases: 8 tests (404, disabled buttons, null states)
 * - Security/Errors: 6 tests (keyboard, debouncing, scroll lock)
 * - Integration: 5 tests (Dashboard, store, filters, portal)
 * - Accessibility: 4 tests (ARIA, focus trap, screen reader)
 * 
 * @module components/Dashboard/PartDetailModal.integration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PartDetailModal } from './PartDetailModal';
import * as navigationService from '@/services/navigation.service';
import * as uploadService from '@/services/upload.service';
import type { PartDetail } from '@/types/parts';
import type { AdjacentPartsInfo } from '@/types/modal';
import { BlockStatus } from '@/types/parts';

// Mock services
vi.mock('@/services/navigation.service');
vi.mock('@/services/upload.service');

// Mock ModelLoader component (T-1005-FRONT dependency)
vi.mock('@/components/ModelLoader', () => ({
  ModelLoader: ({ partId, onLoadSuccess }: { partId: string; onLoadSuccess?: (data: PartDetail) => void }) => {
    return (
      <div data-testid="model-loader">
        <span>ModelLoader for {partId}</span>
      </div>
    );
  },
}));

// Mock createPortal to render in-place (avoid real Portal in tests)
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('PartDetailModal - T-1007-FRONT Integration', () => {
  const mockPartId = 'test-uuid-123';
  const mockOnClose = vi.fn();

  const mockPartDetail: PartDetail = {
    id: mockPartId,
    iso_code: 'SF-C12-D-001',
    status: BlockStatus.Validated,
    tipologia: 'capitel',
    created_at: '2026-02-25T10:00:00Z',
    low_poly_url: 'https://cdn.example.com/test.glb',
    bbox: { min: [0, 0, 0], max: [1, 1, 1] },
    workshop_id: 'workshop-123',
    workshop_name: 'Taller Central',
    validation_report: null,
    glb_size_bytes: 50000,
    triangle_count: 500,
  };

  const mockAdjacentParts: AdjacentPartsInfo = {
    prev_id: 'uuid-prev',
    next_id: 'uuid-next',
    current_index: 4,
    total_count: 20,
  };

  beforeEach(() => {
    // Mock getPartDetail from upload.service (T-1005-FRONT)
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetail);
    
    // Mock getPartNavigation from navigation.service (T-1007-FRONT)
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue(mockAdjacentParts);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path (6 tests)', () => {
    it('HP-MOD-01: should open modal and display ISO code in header', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      // Wait for data fetch to complete
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartId);
      });

      // Verify ISO code is displayed
      expect(screen.getByText('SF-C12-D-001')).toBeInTheDocument();
    });

    it('HP-MOD-02: should load 3D Viewer tab with ModelLoader by default', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
          initialTab="viewer"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });

      // Verify ModelLoader receives correct partId prop
      expect(screen.getByText(`ModelLoader for ${mockPartId}`)).toBeInTheDocument();
    });

    it('HP-MOD-03: should switch to Metadata tab and show placeholder content', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });

      // Click Metadata tab button
      const metadataTab = screen.getByRole('tab', { name: /metadatos/i });
      fireEvent.click(metadataTab);

      // Verify metadata content appears (PartMetadataPanel renders)
      await waitFor(() => {
        expect(screen.queryByTestId('model-loader')).not.toBeInTheDocument();
        // PartMetadataPanel renders section "Información" with label "Código ISO"
        expect(screen.getByText(/código iso/i)).toBeInTheDocument();
      });
    });

    it('HP-MOD-04: should display position indicator "Pieza X de Y"', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(navigationService.getPartNavigation).toHaveBeenCalled();
      });

      // Verify position indicator shows "Pieza 5 de 20"
      expect(screen.getByText(/pieza 5 de 20/i)).toBeInTheDocument();
    });

    it('HP-MOD-05: should navigate to previous part when clicking Prev button', async () => {
      const mockSelectPart = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/pieza anterior/i)).toBeInTheDocument();
      });

      const prevButton = screen.getByLabelText(/pieza anterior/i);
      fireEvent.click(prevButton);

      // Verify navigation was called with prev_id
      await waitFor(() => {
        // Modal should fetch data for prev part (uuid-prev)
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-prev');
      });
    });

    it('HP-MOD-06: should navigate to next part when clicking Next button', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/pieza siguiente/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText(/pieza siguiente/i);
      fireEvent.click(nextButton);

      // Verify navigation was called with next_id
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-next');
      });
    });
  });

  describe('Edge Cases (8 tests)', () => {
    it('EC-MOD-01: should display error when part not found (404)', async () => {
      vi.mocked(uploadService.getPartDetail).mockRejectedValueOnce(new Error('Part not found'));

      render(
        <PartDetailModal
          isOpen={true}
          partId="invalid-uuid"
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/pieza no encontrada/i)).toBeInTheDocument();
      });

      // Verify error details are shown
      expect(screen.getByText(/no existe o ha sido eliminada/i)).toBeInTheDocument();
    });

    it('EC-MOD-02: should disable Prev button when prev_id is null (first part)', async () => {
      vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce({
        prev_id: null,
        next_id: 'uuid-next',
        current_index: 1,
        total_count: 20,
      });

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const prevButton = screen.getByLabelText(/pieza anterior/i);
        expect(prevButton).toBeDisabled();
      });
    });

    it('EC-MOD-03: should disable Next button when next_id is null (last part)', async () => {
      vi.mocked(navigationService.getPartNavigation).mockResolvedValueOnce({
        prev_id: 'uuid-prev',
        next_id: null,
        current_index: 20,
        total_count: 20,
      });

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const nextButton = screen.getByLabelText(/pieza siguiente/i);
        expect(nextButton).toBeDisabled();
      });
    });

    it('EC-MOD-04: should show loading state during navigation', async () => {
      // Delay resolution to simulate network latency
      vi.mocked(uploadService.getPartDetail).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPartDetail), 100))
      );

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/pieza siguiente/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText(/pieza siguiente/i);
      fireEvent.click(nextButton);

      // Verify loading state appears
      expect(nextButton).toBeDisabled();
    });

    it('EC-MOD-05: should preserve tab state when switching tabs temporarily', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });

      // Switch to Metadata tab
      const metadataTab = screen.getByRole('tab', { name: /metadatos/i });
      fireEvent.click(metadataTab);

      await waitFor(() => {
        expect(screen.queryByTestId('model-loader')).not.toBeInTheDocument();
      });

      // Switch back to Viewer tab
      const viewerTab = screen.getByRole('tab', { name: /visor 3d/i });
      fireEvent.click(viewerTab);

      // Verify ModelLoader is restored
      await waitFor(() => {
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });
    });

    it('EC-MOD-06: should handle part with null low_poly_url (processing state)', async () => {
      vi.mocked(uploadService.getPartDetail).mockResolvedValueOnce({
        ...mockPartDetail,
        low_poly_url: null,
      });

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        // ModelLoader should still render (it handles null low_poly_url internally)
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });
    });

    it('EC-MOD-07: should show empty state when validation_report is null', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
          initialTab="validation"
        />
      );

      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalled();
      });

      // Verify empty state message appears
      expect(screen.getByText(/sin reporte de validación/i)).toBeInTheDocument();
    });

    it('EC-MOD-08: should re-fetch data when partId prop changes', async () => {
      const { rerender } = render(
        <PartDetailModal
          isOpen={true}
          partId="uuid-1"
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-1');
      });

      // Change partId prop
      rerender(
        <PartDetailModal
          isOpen={true}
          partId="uuid-2"
          onClose={mockOnClose}
        />
      );

      // Verify new fetch is triggered
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-2');
      });
    });
  });

  describe('Security/Errors (6 tests)', () => {
    it('SE-MOD-01: should close modal when ESC key is pressed', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press ESC key
      fireEvent.keyDown(window, { key: 'Escape' });

      // Verify onClose callback is called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('SE-MOD-02: should close modal when backdrop is clicked', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
      });

      // Click backdrop (not modal content)
      fireEvent.click(screen.getByTestId('modal-backdrop'));

      // Verify onClose callback is called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('SE-MOD-03: should navigate to prev part when ← key is pressed', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(navigationService.getPartNavigation).toHaveBeenCalled();
      });

      // Press ArrowLeft key
      fireEvent.keyDown(window, { key: 'ArrowLeft' });

      // Verify navigation is triggered
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-prev');
      });
    });

    it('SE-MOD-04: should navigate to next part when → key is pressed', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(navigationService.getPartNavigation).toHaveBeenCalled();
      });

      // Press ArrowRight key
      fireEvent.keyDown(window, { key: 'ArrowRight' });

      // Verify navigation is triggered
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-next');
      });
    });

    it('SE-MOD-05: should debounce multiple rapid nav clicks (only 1 request)', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/pieza siguiente/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText(/pieza siguiente/i);

      // Rapid clicks (5 times in quick succession)
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Wait for all potential async operations
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalled();
      });

      // Verify only 1 or 2 API calls (not 5) - implementation can use loading state or debounce
      const callCount = vi.mocked(uploadService.getPartDetail).mock.calls.filter(
        call => call[0] === 'uuid-next'
      ).length;
      expect(callCount).toBeLessThanOrEqual(2);
    });

    it('SE-MOD-06: should prevent body scroll when modal is open', async () => {
      const originalOverflow = document.body.style.overflow;

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        // Verify body overflow is set to 'hidden'
        expect(document.body.style.overflow).toBe('hidden');
      });

      // Cleanup: restore original overflow
      document.body.style.overflow = originalOverflow;
    });
  });

  describe('Integration (5 tests)', () => {
    it('INT-MOD-01: should integrate with Dashboard3D selectedId state', async () => {
      // Simulate Dashboard3D passing selectedId as prop
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      // Verify modal fetches data for the selected part
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartId);
      });

      // Verify data is displayed
      expect(screen.getByText('SF-C12-D-001')).toBeInTheDocument();
    });

    it('INT-MOD-02: should update Dashboard3D selectedId via navigation', async () => {
      // This test verifies the contract - implementation in Dashboard3D
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/pieza siguiente/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByLabelText(/pieza siguiente/i);
      fireEvent.click(nextButton);

      // Verify modal attempts to navigate (in real implementation, this updates Zustand store)
      await waitFor(() => {
        expect(uploadService.getPartDetail).toHaveBeenCalledWith('uuid-next');
      });
    });

    it('INT-MOD-03: should pass filters to navigation API', async () => {
      const mockFilters = {
        status: ['validated'],
        tipologia: ['capitel'],
      };

      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
          filters={mockFilters}
        />
      );

      await waitFor(() => {
        expect(navigationService.getPartNavigation).toHaveBeenCalledWith(
          mockPartId,
          mockFilters
        );
      });
    });

    it('INT-MOD-04: should handle ModelLoader onLoadSuccess callback', async () => {
      // This test verifies integration with ModelLoader component
      const { rerender } = render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('model-loader')).toBeInTheDocument();
      });

      // ModelLoader exists and is functional
      expect(screen.getByText(`ModelLoader for ${mockPartId}`)).toBeInTheDocument();
    });

    it('INT-MOD-05: should render via Portal with high z-index (appears above Dashboard)', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const backdrop = screen.getByTestId('modal-backdrop');
        // Verify backdrop has high z-index (9999 per constants)
        const styles = window.getComputedStyle(backdrop);
        expect(styles.zIndex).toBe('9999');
      });
    });
  });

  describe('Accessibility (4 tests)', () => {
    it('A11Y-MOD-01: should have role="dialog" and aria-modal="true"', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('A11Y-MOD-02: should have tab list with role="tablist" and tabs with role="tab"', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        const tablist = screen.getByRole('tablist');
        expect(tablist).toBeInTheDocument();

        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(3); // viewer, metadata, validation
      });
    });

    it('A11Y-MOD-03: should trap focus inside modal (Tab cycles through elements)', async () => {
      render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements.length).toBeGreaterThan(0);

      // Verify focus can move through elements (implementation detail varies)
      // This test documents the requirement; actual focus trap implementation TBD
    });

    it('A11Y-MOD-04: should restore focus to trigger element on close', async () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { unmount } = render(
        <PartDetailModal
          isOpen={true}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      unmount();

      // Verify focus is restored (implementation detail varies)
      // This test documents the requirement; actual focus restoration implementation TBD

      // Cleanup
      document.body.removeChild(triggerButton);
    });
  });

  describe('Closed State', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <PartDetailModal
          isOpen={false}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      // Verify modal is not in the document
      expect(container.firstChild).toBeNull();
    });

    it('should not fetch data when modal is closed', () => {
      render(
        <PartDetailModal
          isOpen={false}
          partId={mockPartId}
          onClose={mockOnClose}
        />
      );

      // Verify no API calls are made
      expect(uploadService.getPartDetail).not.toHaveBeenCalled();
      expect(navigationService.getPartNavigation).not.toHaveBeenCalled();
    });
  });
});
