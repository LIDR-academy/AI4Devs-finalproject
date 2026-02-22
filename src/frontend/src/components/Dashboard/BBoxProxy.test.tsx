/**
 * BBoxProxy Component Tests
 * 
 * T-0507-FRONT: LOD System - BBox Wireframe Proxy Tests
 * 
 * Phase: RED (tests written before implementation)
 * Expected: ALL 9 tests FAIL with ImportError (module './BBoxProxy' not found)
 * 
 * @module BBoxProxy.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BBoxProxy } from './BBoxProxy';
import type { BoundingBox } from '@/types/parts';

describe('BBoxProxy', () => {
  // Test data
  const mockBBox: BoundingBox = {
    min: [-1.5, -1.2, 0.0],
    max: [1.5, 1.2, 3.4],
  };
  
  const mockColor = '#3B82F6'; // STATUS_COLORS.validated

  describe('Happy Path - Rendering', () => {
    it('HP-BBOX-1: renders boxGeometry with correct dimensions from bbox', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} />);
      
      // Calculate expected dimensions
      const width = mockBBox.max[0] - mockBBox.min[0];   // 3.0
      const height = mockBBox.max[1] - mockBBox.min[1];  // 2.4
      const depth = mockBBox.max[2] - mockBBox.min[2];   // 3.4
      
      // Should render a mesh with boxGeometry
      const mesh = screen.getByTestId('bbox-mesh');
      expect(mesh).toBeDefined();
      
      // Geometry dimensions should match bbox
      const geometry = mesh.querySelector('boxGeometry');
      expect(geometry).toBeDefined();
      expect(geometry?.getAttribute('args')).toContain(width.toString());
      expect(geometry?.getAttribute('args')).toContain(height.toString());
      expect(geometry?.getAttribute('args')).toContain(depth.toString());
    });

    it('HP-BBOX-2: applies color prop to meshBasicMaterial', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} />);
      
      const material = screen.getByTestId('bbox-material');
      expect(material.getAttribute('color')).toBe(mockColor);
    });

    it('HP-BBOX-3: applies default opacity 0.3 when opacity prop not provided', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} />);
      
      const material = screen.getByTestId('bbox-material');
      expect(material.getAttribute('opacity')).toBe('0.3');
      expect(material.getAttribute('transparent')).toBe('true');
    });

    it('HP-BBOX-4: applies custom opacity when opacity prop provided', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} opacity={0.5} />);
      
      const material = screen.getByTestId('bbox-material');
      expect(material.getAttribute('opacity')).toBe('0.5');
    });

    it('HP-BBOX-5: renders as wireframe by default', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} />);
      
      const material = screen.getByTestId('bbox-material');
      expect(material.getAttribute('wireframe')).toBe('true');
    });

    it('HP-BBOX-6: respects wireframe=false prop', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} wireframe={false} />);
      
      const material = screen.getByTestId('bbox-material');
      expect(material.getAttribute('wireframe')).toBe('false');
    });
  });

  describe('Edge Cases', () => {
    it('EC-BBOX-1: centers box geometry at bbox center point', () => {
      render(<BBoxProxy bbox={mockBBox} color={mockColor} />);
      
      // Calculate expected center
      const centerX = (mockBBox.min[0] + mockBBox.max[0]) / 2;  // 0.0
      const centerY = (mockBBox.min[1] + mockBBox.max[1]) / 2;  // 0.0
      const centerZ = (mockBBox.min[2] + mockBBox.max[2]) / 2;  // 1.7
      
      const mesh = screen.getByTestId('bbox-mesh');
      const position = mesh.getAttribute('position');
      
      expect(position).toContain(centerX.toString());
      expect(position).toContain(centerY.toString());
      expect(position).toContain(centerZ.toString());
    });

    it('EC-BBOX-2: handles zero-sized bbox dimensions gracefully', () => {
      const flatBBox: BoundingBox = {
        min: [0, 0, 0],
        max: [0, 0, 0], // Zero volume
      };
      
      // Should not crash, render 0-sized box
      render(<BBoxProxy bbox={flatBBox} color={mockColor} />);
      
      const mesh = screen.getByTestId('bbox-mesh');
      expect(mesh).toBeDefined();
    });

    it('EC-BBOX-3: handles negative bbox coordinates', () => {
      const negativeBBox: BoundingBox = {
        min: [-5, -10, -2],
        max: [-2, -5, 1],
      };
      
      // Should handle negative coordinates correctly
      render(<BBoxProxy bbox={negativeBBox} color={mockColor} />);
      
      const mesh = screen.getByTestId('bbox-mesh');
      expect(mesh).toBeDefined();
      
      // Width should be positive even with negative coords
      const width = negativeBBox.max[0] - negativeBBox.min[0];  // 3
      expect(width).toBeGreaterThan(0);
    });
  });
});
