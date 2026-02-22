/**
 * T-0505-FRONT: PartMesh Component Tests
 * 
 * TDD-RED Phase: Tests describing expected behavior
 * All tests should FAIL with ModuleNotFoundError until GREEN phase
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas } from '@react-three/fiber';
import { PartMesh } from './PartMesh';
import { PartCanvasItem, BlockStatus } from '@/types/parts';
import { STATUS_COLORS } from '@/constants/dashboard3d.constants';
import * as partsStore from '@/stores/parts.store';

// Mock usePartsStore
const mockSelectPart = vi.fn();
vi.mock('@/stores/parts.store', () => ({
  usePartsStore: vi.fn(() => ({
    selectPart: mockSelectPart,
    selectedId: null,
  })),
}));

// Mock data fixtures
const mockPart: PartCanvasItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  iso_code: 'SF-C12-D-001',
  status: 'validated' as BlockStatus,
  tipologia: 'capitel',
  low_poly_url: 'https://storage.supabase.co/bucket/test-part.glb',
  bbox: {
    min: [0, 0, 0],
    max: [1, 1, 1],
  },
  workshop_id: 'workshop-123',
  workshop_name: 'Taller Granollers',
};

describe('PartMesh Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - GLB Loading', () => {
    it('loads GLB geometry with useGLTF hook', async () => {
      const position: [number, number, number] = [0, 0, 0];

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={position} />
        </Canvas>
      );

      await waitFor(() => {
        // Should render a group with part ISO code in name
        const partGroup = container.querySelector(`[name="part-${mockPart.iso_code}"]`);
        expect(partGroup).toBeInTheDocument();
      });
    });

    it('applies position to part group', async () => {
      const position: [number, number, number] = [10, 5, 15];

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={position} />
        </Canvas>
      );

      await waitFor(() => {
        const partGroup = container.querySelector(`[name="part-${mockPart.iso_code}"]`);
        expect(partGroup).toHaveAttribute('position', '10,5,15');
      });
    });
  });

  describe('Happy Path - Z-up Rotation', () => {
    it('applies Z-up rotation transform (scene.rotation.x = -Math.PI / 2)', async () => {
      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        // Check that primitive has rotation applied
        // In real implementation, scene.rotation.x = -Math.PI / 2
        const primitive = container.querySelector('primitive');
        expect(primitive).toBeInTheDocument();
        
        // Scene rotation should be applied to fix Rhino Z-up to Three.js Y-up
        const rotationX = -Math.PI / 2;
        expect(primitive).toHaveAttribute('data-rotation-x', String(rotationX));
      });
    });
  });

  describe('Happy Path - Status Colors', () => {
    it('applies correct color based on part status', async () => {
      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        const expectedColor = STATUS_COLORS[mockPart.status];
        
        expect(material).toHaveAttribute('color', expectedColor);
      });
    });

    it('applies different colors for different statuses', async () => {
      const statuses: BlockStatus[] = ['validated', 'in_fabrication', 'completed'];
      
      for (const status of statuses) {
        const part = { ...mockPart, status };
        const { container } = render(
          <Canvas>
            <PartMesh part={part} position={[0, 0, 0]} />
          </Canvas>
        );

        await waitFor(() => {
          const material = container.querySelector('[data-testid="part-material"]');
          const expectedColor = STATUS_COLORS[status];
          expect(material).toHaveAttribute('color', expectedColor);
        });
      }
    });
  });

  describe('Happy Path - Tooltip on Hover', () => {
    it('shows Html tooltip on hover with part details', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      // Find the clickable mesh
      const primitive = container.querySelector('primitive');
      expect(primitive).toBeInTheDocument();

      // Hover over the mesh
      await user.hover(primitive!);

      await waitFor(() => {
        // Tooltip should appear with part details
        expect(screen.getByText(mockPart.iso_code)).toBeInTheDocument();
        expect(screen.getByText(mockPart.tipologia)).toBeInTheDocument();
        
        if (mockPart.workshop_name) {
          expect(screen.getByText(mockPart.workshop_name)).toBeInTheDocument();
        }
      });
    });

    it('hides tooltip when not hovering', async () => {
      const user = userEvent.setup();
      
      render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      // Initially, tooltip should not be visible
      expect(screen.queryByText(mockPart.iso_code)).not.toBeInTheDocument();
    });

    it('changes cursor to pointer on hover', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      const primitive = container.querySelector('primitive');
      
      // Hover over mesh
      await user.hover(primitive!);

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('pointer');
      });

      // Un-hover
      await user.unhover(primitive!);

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('auto');
      });
    });
  });

  describe('Happy Path - Click Interaction', () => {
    it('triggers selectPart() on click', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      const primitive = container.querySelector('primitive');
      
      await user.click(primitive!);

      await waitFor(() => {
        expect(mockSelectPart).toHaveBeenCalledWith(mockPart.id);
      });
    });
  });

  describe('Happy Path - Selection State', () => {
    it('applies emissive glow when part is selected', async () => {
      // Mock usePartsStore to return this part as selected
      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: mockPart.id,
        parts: [],
        filters: {},
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        
        // Selected parts should have emissive glow
        expect(material).toHaveAttribute('emissive', STATUS_COLORS[mockPart.status]);
        expect(material).toHaveAttribute('emissiveintensity', '0.4');
        expect(material).toHaveAttribute('opacity', '1.0');
      });
    });

    it('does not apply emissive glow when part is not selected', async () => {
      // Mock usePartsStore to return null selected (no selection)
      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [],
        filters: {},
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        
        // Non-selected parts should not glow
        expect(material).toHaveAttribute('emissive', '#000000');
        expect(material).toHaveAttribute('emissiveintensity', '0');
        expect(material).toHaveAttribute('opacity', '0.8');
      });
    });
  });

  describe('T-0506-FRONT: Filter-based Opacity (Fade-out)', () => {
    it('should apply full opacity (1.0) when part matches filters', async () => {
      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [mockPart],
        filters: { status: [], tipologia: [], workshop_id: null },
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [mockPart]), // Part matches filters
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        expect(material).toHaveAttribute('opacity', '1.0');
      });
    });

    it('should apply reduced opacity (0.2) when part does not match filters', async () => {
      const anotherPart: PartCanvasItem = {
        ...mockPart,
        id: 'another-id',
        tipologia: 'columna',
      };

      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [mockPart, anotherPart],
        filters: { status: [], tipologia: ['capitel'], workshop_id: null },
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [mockPart]), // Only mockPart matches
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={anotherPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        expect(material).toHaveAttribute('opacity', '0.2');
      });
    });

    it('should use MATCH_OPACITY constant for matching parts', async () => {
      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [mockPart],
        filters: { status: [], tipologia: [], workshop_id: null },
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [mockPart]),
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        // Should use FILTER_VISUAL_FEEDBACK.MATCH_OPACITY (1.0)
        expect(material).toHaveAttribute('opacity', '1.0');
      });
    });

    it('should use NON_MATCH_OPACITY constant for non-matching parts', async () => {
      const nonMatchingPart: PartCanvasItem = {
        ...mockPart,
        id: 'non-matching-id',
      };

      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [mockPart, nonMatchingPart],
        filters: { status: ['validated'], tipologia: [], workshop_id: null },
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [mockPart]), // Only mockPart matches
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={nonMatchingPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        // Should use FILTER_VISUAL_FEEDBACK.NON_MATCH_OPACITY (0.2)
        expect(material).toHaveAttribute('opacity', '0.2');
      });
    });

    it('should show all parts with full opacity when no filters applied', async () => {
      vi.mocked(partsStore.usePartsStore).mockReturnValue({
        selectPart: mockSelectPart,
        selectedId: null,
        parts: [mockPart],
        filters: { status: [], tipologia: [], workshop_id: null },
        isLoading: false,
        error: null,
        fetchParts: vi.fn(),
        setFilters: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [mockPart]), // All parts match when no filters
      });

      const { container } = render(
        <Canvas>
          <PartMesh part={mockPart} position={[0, 0, 0]} />
        </Canvas>
      );

      await waitFor(() => {
        const material = container.querySelector('[data-testid="part-material"]');
        expect(material).toHaveAttribute('opacity', '1.0');
      });
    });
  });
});
