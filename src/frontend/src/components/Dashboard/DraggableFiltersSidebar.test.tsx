/**
 * Test suite for DraggableFiltersSidebar component
 * T-0504-FRONT: Dockable and draggable sidebar
 * 
 * TDD-RED Phase: Tests will fail because component doesn't exist yet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import DraggableFiltersSidebar from './DraggableFiltersSidebar';
import type { DockPosition } from './Dashboard3D.types';

describe('DraggableFiltersSidebar Component', () => {
  const mockOnDockChange = vi.fn();
  const mockOnPositionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
  });

  describe('Happy Path - Docking Positions', () => {
    it('should render sidebar docked to right by default', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Sidebar Content</div>
        </DraggableFiltersSidebar>
      );

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('docked-right');
      expect(sidebar).toHaveStyle({ right: '0' });
    });

    it('should render sidebar docked to left', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="left"
          onDockChange={mockOnDockChange}
        >
          <div>Sidebar Content</div>
        </DraggableFiltersSidebar>
      );

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('docked-left');
      expect(sidebar).toHaveStyle({ left: '0' });
    });

    it('should render sidebar in floating mode at specified position', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: 100, y: 200 }}
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Sidebar Content</div>
        </DraggableFiltersSidebar>
      );

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('floating');
      expect(sidebar).toHaveStyle({ left: '100px', top: '200px' });
    });
  });

  describe('Happy Path - Drag Handle', () => {
    it('should render drag handle at top of sidebar', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('role', 'button');
    });

    it('should show 6-dot grip icon in drag handle', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      const gripIcon = dragHandle.querySelector('svg');
      expect(gripIcon).toBeInTheDocument();
    });
  });

  describe('Draggable Behavior - Mouse Events', () => {
    it('should call onPositionChange when dragging in floating mode', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: 100, y: 100 }}
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      
      // Simulate drag start
      fireEvent.mouseDown(dragHandle, { clientX: 100, clientY: 100 });
      
      // Simulate drag move
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      
      // Simulate drag end
      fireEvent.mouseUp(document);

      expect(mockOnPositionChange).toHaveBeenCalled();
    });

    it('should snap to left dock when dragged near left edge', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: 200, y: 100 }}
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      
      // Drag to left edge (within snap threshold)
      fireEvent.mouseDown(dragHandle, { clientX: 200, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 30, clientY: 100 }); // Within SNAP_THRESHOLD
      fireEvent.mouseUp(document);

      expect(mockOnDockChange).toHaveBeenCalledWith('left');
    });

    it('should snap to right dock when dragged near right edge', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: 200, y: 100 }}
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      
      // Drag to right edge (within snap threshold)
      fireEvent.mouseDown(dragHandle, { clientX: 200, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 990, clientY: 100 }); // Within SNAP_THRESHOLD from right
      fireEvent.mouseUp(document);

      expect(mockOnDockChange).toHaveBeenCalledWith('right');
    });
  });

  describe('Draggable Behavior - Double Click', () => {
    it('should cycle dock positions on double-click (left → right → floating)', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <DraggableFiltersSidebar
          dockPosition="left"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const dragHandle = screen.getByLabelText(/Arrastrar panel/i);
      
      // Double-click to cycle
      await user.dblClick(dragHandle);
      
      expect(mockOnDockChange).toHaveBeenCalledWith('right');
      
      // Rerender with new dock position
      rerender(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );
      
      // Double-click again
      await user.dblClick(dragHandle);
      
      expect(mockOnDockChange).toHaveBeenCalledWith('floating');
    });
  });

  describe('Dock Position Icons', () => {
    it('should render pin-left icon button', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const pinLeftBtn = screen.getByLabelText(/Anclar panel a la izquierda/i);
      expect(pinLeftBtn).toBeInTheDocument();
    });

    it('should render pin-right icon button', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="left"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const pinRightBtn = screen.getByLabelText(/Anclar panel a la derecha/i);
      expect(pinRightBtn).toBeInTheDocument();
    });

    it('should render float icon button', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="left"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const floatBtn = screen.getByLabelText(/Dejar panel flotante/i);
      expect(floatBtn).toBeInTheDocument();
    });

    it('should call onDockChange when pin-left clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <DraggableFiltersSidebar
          dockPosition="right"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const pinLeftBtn = screen.getByLabelText(/Anclar panel a la izquierda/i);
      await user.click(pinLeftBtn);

      expect(mockOnDockChange).toHaveBeenCalledWith('left');
    });
  });

  describe('Edge Cases - Viewport Bounds', () => {
    it('should clamp position to viewport bounds (left edge)', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: -50, y: 100 }} // Outside left bound
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const sidebar = screen.getByRole('complementary');
      // Position should be clamped to 0
      expect(sidebar).toHaveStyle({ left: '0px' });
    });

    it('should clamp position to viewport bounds (top edge)', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="floating"
          floatingPosition={{ x: 100, y: -50 }} // Outside top bound
          onDockChange={mockOnDockChange}
          onPositionChange={mockOnPositionChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      const sidebar = screen.getByRole('complementary');
      // Position should be clamped to 0
      expect(sidebar).toHaveStyle({ top: '0px' });
    });
  });

  describe('Edge Cases - localStorage Persistence', () => {
    it('should save dock position to localStorage on change', () => {
      render(
        <DraggableFiltersSidebar
          dockPosition="left"
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      // Trigger dock change
      const pinRightBtn = screen.getByLabelText(/Anclar panel a la derecha/i);
      fireEvent.click(pinRightBtn);

      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'dashboard-sidebar-dock',
        'right'
      );
    });

    it('should restore dock position from localStorage on mount', () => {
      Storage.prototype.getItem = vi.fn(() => 'left');

      render(
        <DraggableFiltersSidebar
          dockPosition="right" // Initial prop
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      expect(Storage.prototype.getItem).toHaveBeenCalledWith('dashboard-sidebar-dock');
      // Should call onDockChange with stored value
      expect(mockOnDockChange).toHaveBeenCalledWith('left');
    });
  });

  describe('Security - Input Sanitization', () => {
    it('should only accept valid dockPosition values', () => {
      // TypeScript should prevent this, but test runtime behavior
      const invalidPosition = 'invalid' as DockPosition;
      
      render(
        <DraggableFiltersSidebar
          dockPosition={invalidPosition}
          onDockChange={mockOnDockChange}
        >
          <div>Content</div>
        </DraggableFiltersSidebar>
      );

      // Should default to 'right' for invalid values
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('docked-right');
    });
  });
});
