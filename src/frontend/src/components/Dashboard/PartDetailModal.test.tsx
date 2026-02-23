/**
 * PartDetailModal Component Tests
 * T-0508-FRONT: Part selection and modal integration
 * 
 * @module PartDetailModal.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartDetailModal } from './PartDetailModal';
import type { PartCanvasItem } from '@/types/parts';

// Mock part data for testing
const mockPart: PartCanvasItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  iso_code: 'SF-C12-M-001',
  status: 'validated',
  tipologia: 'capitel',
  low_poly_url: 'https://storage.example.com/low-poly.glb' as any,
  bbox: {
    min: [0, 0, 0],
    max: [1, 1, 1],
  },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Principal',
};

describe('PartDetailModal - T-0508-FRONT', () => {
  describe('Happy Path', () => {
    it('HP-SEL-3: Modal opens when isOpen={true}', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Modal should be visible in the document
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('HP-SEL-4: Modal displays correct part data', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Should display part iso_code
      expect(screen.getByText('SF-C12-M-001')).toBeInTheDocument();
      
      // Should display status
      expect(screen.getByText(/validated/i)).toBeInTheDocument();
      
      // Should display tipologia
      expect(screen.getByText(/capitel/i)).toBeInTheDocument();
      
      // Should display workshop name
      expect(screen.getByText('Taller Principal')).toBeInTheDocument();
    });

    it('HP-SEL-5: Close button calls onClose()', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Find and click close button
      const closeButton = screen.getByLabelText(/cerrar/i);
      fireEvent.click(closeButton);
      
      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('HP-SEL-6: Modal does not render when isOpen={false}', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={false}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Modal should not be in the document
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('EC-SEL-1: ESC key calls onClose()', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Simulate ESC key press
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('EC-SEL-2: Legacy Esc key (IE/Edge) calls onClose()', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Simulate legacy Esc key press
      fireEvent.keyDown(window, { key: 'Esc', code: 'Escape' });
      
      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('EC-SEL-3: Backdrop click calls onClose()', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Find and click backdrop (modal container outside content)
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      
      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('EC-SEL-4: Part with workshop_name=null displays "Sin asignar"', () => {
      const mockOnClose = vi.fn();
      const partWithoutWorkshop: PartCanvasItem = {
        ...mockPart,
        workshop_name: null,
      };
      
      render(
        <PartDetailModal
          isOpen={true}
          part={partWithoutWorkshop}
          onClose={mockOnClose}
        />
      );
      
      // Should display fallback text
      expect(screen.getByText(/sin asignar/i)).toBeInTheDocument();
    });
  });

  describe('Security/Errors', () => {
    it('SE-SEL-1: part=null renders gracefully without crashing', () => {
      const mockOnClose = vi.fn();
      
      // Should not throw error
      expect(() => {
        render(
          <PartDetailModal
            isOpen={true}
            part={null}
            onClose={mockOnClose}
          />
        );
      }).not.toThrow();
      
      // Modal should still render (empty state)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('SE-SEL-2: Multiple rapid clicks on close button only call onClose once', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      
      // Simulate rapid clicks
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      // onClose should be called only once (debounced or protected)
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('SE-SEL-3: ESC key when modal closed does not call onClose', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={false}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      // Simulate ESC key press
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      // onClose should NOT be called
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('INT-SEL-1: Modal integrates with Zustand store clearSelection', () => {
      // This test verifies the contract between modal and store
      // In real scenario, onClose triggers clearSelection() which updates selectedId
      
      const mockClearSelection = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockClearSelection}
        />
      );
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      fireEvent.click(closeButton);
      
      // Verify onClose (which is clearSelection in Dashboard3D) was called
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('A11Y-SEL-1: Modal has role="dialog"', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('A11Y-SEL-2: Close button has aria-label', () => {
      const mockOnClose = vi.fn();
      
      render(
        <PartDetailModal
          isOpen={true}
          part={mockPart}
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByLabelText(/cerrar/i);
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });
});
