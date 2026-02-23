/**
 * T-0505-FRONT: PartsScene Component Tests
 * 
 * TDD-RED Phase: Tests describing expected behavior
 * All tests should FAIL with ModuleNotFoundError until GREEN phase
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { PartsScene } from './PartsScene';
import { PartCanvasItem, BlockStatus } from '@/types/parts';

// Mock data fixtures
const mockPartWithGeometry: PartCanvasItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  iso_code: 'SF-C12-D-001',
  status: 'validated' as BlockStatus,
  tipologia: 'capitel',
  low_poly_url: 'https://storage.supabase.co/bucket/test-part-1.glb',
  bbox: {
    min: [0, 0, 0],
    max: [1, 1, 1],
  },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
};

const mockPartWithoutGeometry: PartCanvasItem = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  iso_code: 'SF-C12-D-002',
  status: 'uploaded' as BlockStatus,
  tipologia: 'columna',
  low_poly_url: null, // No geometry processed yet
  bbox: null,
  workshop_id: null,
  workshop_name: null,
};

describe('PartsScene Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - Rendering', () => {
    it('renders all parts with valid low_poly_url', async () => {
      const parts: PartCanvasItem[] = [
        mockPartWithGeometry,
        { ...mockPartWithGeometry, id: 'part-2', iso_code: 'SF-C12-D-003' },
      ];

      const { container } = render(
        <Canvas>
          <PartsScene parts={parts} />
        </Canvas>
      );

      await waitFor(() => {
        // Should render a group containing all parts
        const partsGroup = container.querySelector('group[name="parts-scene"]');
        expect(partsGroup).toBeInTheDocument();

        // Should render 2 PartMesh components (both have low_poly_url)
        // Note: Each PartMesh with LOD renders 3 elements with name="part-" (mid-poly, low-poly, and parent group)
        // So we need to count only the parent groups by checking for position attribute
        const partGroups = container.querySelectorAll('group[name^="part-"][position]');
        expect(partGroups).toHaveLength(2);
      });
    });

    it('applies positions from usePartsSpatialLayout hook', async () => {
      const parts: PartCanvasItem[] = [mockPartWithGeometry];

      const { container } = render(
        <Canvas>
          <PartsScene parts={parts} />
        </Canvas>
      );

      await waitFor(() => {
        // Check that part has position attribute (from usePartsSpatialLayout)
        const partGroup = container.querySelector('[name^="part-"]');
        expect(partGroup).toHaveAttribute('position');
      });
    });
  });

  describe('Edge Cases', () => {
    it('skips parts without low_poly_url', async () => {
      const parts: PartCanvasItem[] = [
        mockPartWithGeometry,      // Has geometry
        mockPartWithoutGeometry,   // Missing geometry
        { ...mockPartWithGeometry, id: 'part-3', iso_code: 'SF-C12-D-004' },
      ];

      const { container } = render(
        <Canvas>
          <PartsScene parts={parts} />
        </Canvas>
      );

      await waitFor(() => {
        // Should only render 2 parts (skipping the one without low_poly_url)
        // Note: Each PartMesh with LOD renders 3 elements with name="part-" (mid-poly, low-poly, and parent group)
        // So we need to count only the parent groups by checking for position attribute
        const partGroups = container.querySelectorAll('group[name^="part-"][position]');
        expect(partGroups).toHaveLength(2);
      });
    });

    it('renders empty scene when parts array is empty', () => {
      const { container } = render(
        <Canvas>
          <PartsScene parts={[]} />
        </Canvas>
      );

      const partsGroup = container.querySelector('group[name="parts-scene"]');
      expect(partsGroup).toBeInTheDocument();
      
      // Group should be empty (no child elements)
      const partMeshes = container.querySelectorAll('[name^="part-"]');
      expect(partMeshes).toHaveLength(0);
    });
  });

  describe('Integration - Performance Logging', () => {
    it('logs performance metrics on render', async () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const parts: PartCanvasItem[] = [
        mockPartWithGeometry,
        mockPartWithoutGeometry,
      ];

      render(
        <Canvas>
          <PartsScene parts={parts} />
        </Canvas>
      );

      await waitFor(() => {
        // Should log total parts and parts with geometry
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('Rendering PartsScene'),
          expect.objectContaining({
            total: 2,
            withGeometry: 1,
            layoutType: 'grid_10x10',
          })
        );
      });

      consoleInfoSpy.mockRestore();
    });
  });
});
