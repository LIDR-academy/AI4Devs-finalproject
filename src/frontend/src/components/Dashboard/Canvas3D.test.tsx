/**
 * Test suite for Canvas3D component
 * T-0504-FRONT: Three.js Canvas wrapper
 * T-0508-FRONT: Selection handlers (ESC key, background click)
 * 
 * TDD-RED Phase: Tests will fail because Canvas3D doesn't exist yet
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Canvas3D from './Canvas3D';
import { CAMERA_CONFIG, GRID_CONFIG, CONTROLS_CONFIG } from './Dashboard3D.constants';

// Mock the parts store for all tests (T-0508-FRONT)
const mockClearSelection = vi.fn();

vi.mock('@/stores/parts.store', () => ({
  usePartsStore: vi.fn((selector) => {
    const mockState = {
      clearSelection: mockClearSelection,
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

describe('Canvas3D Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockClearSelection.mockClear();
  });

  describe('Happy Path - Canvas Configuration', () => {
    it('should render Canvas with correct camera defaults', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Verify camera configuration
      const cameraPos = CAMERA_CONFIG.POSITION.join(',');
      expect(canvas).toHaveAttribute('data-camera-position', cameraPos);
      expect(canvas).toHaveAttribute('data-camera-fov', String(CAMERA_CONFIG.FOV));
    });

    it('should render Grid with 100x100 cells', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-grid', 'true');
      expect(canvas).toHaveAttribute('data-grid-size', GRID_CONFIG.SIZE.join('x'));
    });

    it('should render OrbitControls with damping enabled', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-controls', 'true');
      expect(canvas).toHaveAttribute('data-controls-damping', String(CONTROLS_CONFIG.ENABLE_DAMPING));
    });

    it('should configure shadows on Canvas', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-shadows', 'true');
    });

    it('should set DPR to adaptive [1, 2]', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-dpr', '1,2');
    });
  });

  describe('Happy Path - Lighting Setup', () => {
    it('should render ambient light with correct intensity', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-lights', 'true');
      expect(canvas).toHaveAttribute('data-ambient-intensity', '0.4');
    });

    it('should render directional light with shadows', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-directional-intensity', '1');
      expect(canvas).toHaveAttribute('data-directional-shadows', 'true');
    });
  });

  describe('Happy Path - Scene Helpers', () => {
    it('should render GizmoHelper in bottom-right', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-gizmo', 'true');
      expect(canvas).toHaveAttribute('data-gizmo-alignment', 'bottom-right');
    });

    it('should render Stats when showStats is true', () => {
      render(<Canvas3D showStats={true} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-stats', 'true');
    });

    it('should NOT render Stats when showStats is false', () => {
      render(<Canvas3D showStats={false} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).not.toHaveAttribute('data-has-stats');
    });
  });

  describe('Edge Cases - Custom Camera Config', () => {
    it('should accept custom camera position', () => {
      const customPosition: [number, number, number] = [100, 100, 100];
      
      render(<Canvas3D cameraConfig={{ position: customPosition }} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-camera-position', customPosition.join(','));
    });

    it('should accept custom camera FOV', () => {
      render(<Canvas3D cameraConfig={{ fov: 75 }} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-camera-fov', '75');
    });
  });

  describe('Security - OrbitControls Constraints', () => {
    it('should prevent camera rotation below ground (maxPolarAngle)', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      const maxAngle = Math.PI / 2;
      expect(canvas).toHaveAttribute('data-controls-max-polar-angle', String(maxAngle));
    });

    it('should limit zoom distance (minDistance, maxDistance)', () => {
      render(<Canvas3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-controls-min-distance', '10');
      expect(canvas).toHaveAttribute('data-controls-max-distance', '500');
    });
  });

  // T-0508-FRONT: Part Selection & Modal Integration
  describe('Selection Handlers (T-0508-FRONT)', () => {
    it('EC-SEL-2-CANVAS: Background click calls clearSelection()', () => {
      render(<Canvas3D />);
      
      // Find the actual Canvas element (mocked as three-canvas)
      const threeCanvas = screen.getByTestId('three-canvas');
      
      // Simulate onPointerMissed event (clicking canvas background)
      fireEvent.click(threeCanvas);
      
      // clearSelection should be called
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('EC-SEL-1-CANVAS: ESC key calls clearSelection() when canvas mounted', () => {
      render(<Canvas3D />);
      
      // Simulate ESC key press on window
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      // clearSelection should be called
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('EC-SEL-1-CANVAS-LEGACY: Legacy Esc key (IE/Edge) calls clearSelection()', () => {
      render(<Canvas3D />);
      
      // Simulate legacy Esc key press on window
      fireEvent.keyDown(window, { key: 'Esc', code: 'Escape' });
      
      // clearSelection should be called
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('CLEANUP: ESC listener is removed when Canvas3D unmounts', () => {
      const { unmount } = render(<Canvas3D />);
      
      // Unmount component
      unmount();
      
      // Simulate ESC key press after unmount
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      // clearSelection should NOT be called (listener removed)
      expect(mockClearSelection).not.toHaveBeenCalled();
    });
  });
});
