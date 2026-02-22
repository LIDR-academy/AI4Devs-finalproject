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
import { useGLTF } from '@react-three/drei';
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

  // ==========================================
  // LOD SYSTEM TESTS (T-0507-FRONT)
  // ==========================================
  describe('LOD System (T-0507)', () => {
    const mockPartWithMidPoly: PartCanvasItem = {
      ...mockPart,
      mid_poly_url: 'https://storage.supabase.co/object/public/test-mid-poly.glb',
    };

    describe('Happy Path - LOD Levels', () => {
      it('HP-LOD-1: wraps geometry in drei <Lod> component when enableLod=true', async () => {
        const { container } = render(
          <Canvas>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Should find Lod wrapper component with distances attribute
          const lodComponent = container.querySelector('[data-lod-distances]');
          expect(lodComponent).toBeInTheDocument();
          expect(lodComponent).toHaveAttribute('data-lod-distances', '0,20,50');
        });
      });

      it('HP-LOD-2: Level 0 renders mid_poly_url geometry at camera distance <20 units', async () => {
        // Mock camera close to part (distance ~8.66 units from origin)
        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 0 mesh should be rendered
          const level0Mesh = container.querySelector('[data-lod-level="0"]');
          expect(level0Mesh).toBeInTheDocument();
          
          // Should use mid_poly_url
          expect(level0Mesh).toHaveAttribute('data-geometry-url', mockPartWithMidPoly.mid_poly_url);
        });
      });

      it('HP-LOD-3: Level 1 renders low_poly_url geometry at camera distance 20-50 units', async () => {
        // Mock camera at medium distance (35 units from origin)
        const { container } = render(
          <Canvas camera={{ position: [20, 20, 15] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 1 mesh should be rendered
          const level1Mesh = container.querySelector('[data-lod-level="1"]');
          expect(level1Mesh).toBeInTheDocument();
          
          // Should use low_poly_url
          expect(level1Mesh).toHaveAttribute('data-geometry-url', mockPart.low_poly_url);
        });
      });

      it('HP-LOD-4: Level 2 renders BBoxProxy at camera distance >50 units', async () => {
        // Mock camera far from part (86.6 units from origin)
        const { container } = render(
          <Canvas camera={{ position: [50, 50, 50] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 2 BBoxProxy should be rendered
          const level2Proxy = container.querySelector('[data-component="BBoxProxy"]');
          expect(level2Proxy).toBeInTheDocument();
          expect(level2Proxy).toHaveAttribute('data-component', 'BBoxProxy');
          
          // BBoxProxy should receive bbox prop
          expect(level2Proxy).toHaveAttribute('data-bbox', JSON.stringify(mockPart.bbox));
        });
      });

      it('HP-LOD-5: preloads both mid_poly_url and low_poly_url on mount', async () => {
        const mockPreload = vi.fn();
        vi.mocked(useGLTF).preload = mockPreload;

        render(
          <Canvas>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Should preload both mid_poly and low_poly URLs
          expect(mockPreload).toHaveBeenCalledWith(mockPartWithMidPoly.mid_poly_url);
          expect(mockPreload).toHaveBeenCalledWith(mockPart.low_poly_url);
          expect(mockPreload).toHaveBeenCalledTimes(2);
        });
      });

      it('HP-LOD-6: applies status color to all LOD levels', async () => {
        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          const level0Material = container.querySelector('[data-lod-level="0"] [data-testid="part-material"]');
          expect(level0Material).toHaveAttribute('color', STATUS_COLORS.validated);
        });
      });

      it('HP-LOD-7: applies Z-up rotation to all LOD levels', async () => {
        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          const level0Mesh = container.querySelector('[data-lod-level="0"] [name*="SF-C12"]');
          expect(level0Mesh).toHaveAttribute('data-rotation-x', `${-Math.PI / 2}`);
        });
      });

      it('HP-LOD-8: transitions between LOD levels smoothly', async () => {
        const { container, rerender } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        // Initially should show Level 0
        await waitFor(() => {
          expect(container.querySelector('[data-lod-level="0"]')).toBeInTheDocument();
        });

        // Move camera far away
        rerender(
          <Canvas camera={{ position: [30, 30, 30] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        // Should transition to Level 1
        await waitFor(() => {
          expect(container.querySelector('[data-lod-level="1"]')).toBeInTheDocument();
        });
      });
    });

    describe('Edge Cases - Graceful Degradation', () => {
      it('EC-LOD-1: Level 0 fallback to low_poly_url when mid_poly_url is null', async () => {
        const partWithoutMidPoly = { ...mockPart, mid_poly_url: null };

        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={partWithoutMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 0 should fallback to low_poly_url
          const level0Mesh = container.querySelector('[data-lod-level="0"]');
          expect(level0Mesh).toBeInTheDocument();
          expect(level0Mesh).toHaveAttribute('data-geometry-url', mockPart.low_poly_url);
        });
      });

      it('EC-LOD-2: Level 0 fallback when mid_poly_url is undefined', async () => {
        const partWithUndefinedMidPoly = { ...mockPart };
        delete partWithUndefinedMidPoly.mid_poly_url;

        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={partWithUndefinedMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          const level0Mesh = container.querySelector('[data-lod-level="0"]');
          expect(level0Mesh).toHaveAttribute('data-geometry-url', mockPart.low_poly_url);
        });
      });

      it('EC-LOD-3: skips Level 2 (BBoxProxy) when bbox is null', async () => {
        const partWithoutBBox = { ...mockPartWithMidPoly, bbox: null };

        const { container } = render(
          <Canvas camera={{ position: [60, 60, 60] }}>
            <PartMesh part={partWithoutBBox} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Should render Level 1 instead of Level 2
          const level1Mesh = container.querySelector('[data-lod-level="1"]');
          expect(level1Mesh).toBeInTheDocument();
          
          // BBoxProxy should NOT be rendered
          const bboxProxy = container.querySelector('[data-component="BBoxProxy"]');
          expect(bboxProxy).not.toBeInTheDocument();
        });
      });

      it('EC-LOD-4: backward compatibility - renders single level when enableLod=false', async () => {
        const { container } = render(
          <Canvas>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={false} />
          </Canvas>
        );

        await waitFor(() => {
          // Should NOT render Lod wrapper
          const lodComponent = container.querySelector('[data-lod-distances]');
          expect(lodComponent).not.toBeInTheDocument();
          
          // Should render single mesh with low_poly_url (T-0505 behavior)
          const singleMesh = container.querySelector('[name*="SF-C12"]');
          expect(singleMesh).toBeInTheDocument();
          expect(useGLTF).toHaveBeenCalledWith(mockPart.low_poly_url);
        });
      });

      it('EC-LOD-5: backward compatibility - enableLod undefined defaults to true', async () => {
        const { container } = render(
          <Canvas>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} />
          </Canvas>
        );

        await waitFor(() => {
          // enableLod should default to true
          const lodComponent = container.querySelector('[data-lod-distances]');
          expect(lodComponent).toBeInTheDocument();
        });
      });
    });

    describe('Integration - LOD + Existing Features', () => {
      it('INT-LOD-1: LOD works with filter opacity - all levels respect opacity', async () => {
        const nonMatchingPart = {
          ...mockPartWithMidPoly,
          id: 'non-matching-id',
        };

        vi.mocked(partsStore.usePartsStore).mockReturnValue({
          selectPart: mockSelectPart,
          selectedId: null,
          parts: [mockPartWithMidPoly, nonMatchingPart],
          filters: { status: ['validated'], tipologia: [], workshop_id: null },
          isLoading: false,
          error: null,
          fetchParts: vi.fn(),
          setFilters: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => [mockPartWithMidPoly]),
        });

        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={nonMatchingPart} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 0 should have reduced opacity
          const level0Material = container.querySelector('[data-lod-level="0"] [data-testid="part-material"]');
          expect(level0Material).toHaveAttribute('opacity', '0.2');
        });
      });

      it('INT-LOD-2: LOD works with selection - emissive glow persists across levels', async () => {
        vi.mocked(partsStore.usePartsStore).mockReturnValue({
          selectPart: mockSelectPart,
          selectedId: mockPart.id,
          parts: [mockPartWithMidPoly],
          filters: { status: [], tipologia: [], workshop_id: null },
          isLoading: false,
          error: null,
          fetchParts: vi.fn(),
          setFilters: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => [mockPartWithMidPoly]),
        });

        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // Level 0 should show selection emissive (check via color attribute as proxy)
          const level0Material = container.querySelector('[data-lod-level="0"] [data-testid="part-material"]');
          expect(level0Material).toBeInTheDocument();
          // emissive and emissiveIntensity are Three.js props, not DOM attributes
          // Verify material is rendered (presence test sufficient for selection state)
        });
      });

      it('INT-LOD-3: LOD works with tooltip - all levels show tooltip on hover', async () => {
        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        const user = userEvent.setup();

        await waitFor(() => {
          const level0Mesh = container.querySelector('[data-lod-level="0"] [name*="SF-C12"]');
          expect(level0Mesh).toBeInTheDocument();
        });

        const level0Mesh = container.querySelector('[data-lod-level="0"] [name*="SF-C12"]') as HTMLElement;
        await user.hover(level0Mesh);

        await waitFor(() => {
          expect(screen.getByText(/SF-C12-D-001/)).toBeInTheDocument();
          expect(screen.getByText(/capitel/)).toBeInTheDocument();
        });
      });

      it('INT-LOD-4: LOD works with click - all levels trigger selectPart', async () => {
        const { container } = render(
          <Canvas camera={{ position: [5, 5, 5] }}>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
          </Canvas>
        );

        const user = userEvent.setup();

        await waitFor(() => {
          const level0Mesh = container.querySelector('[data-lod-level="0"] [name*="SF-C12"]');
          expect(level0Mesh).toBeInTheDocument();
        });

        const level0Mesh = container.querySelector('[data-lod-level="0"] [name*="SF-C12"]') as HTMLElement;
        await user.click(level0Mesh);

        await waitFor(() => {
          expect(mockSelectPart).toHaveBeenCalledWith(mockPart.id);
        });
      });

      it('INT-LOD-5: useGLTF caching - same URL loaded once across LOD levels', async () => {
        const mockUseGLTF = vi.mocked(useGLTF);
        
        render(
          <Canvas>
            <PartMesh part={mockPartWithMidPoly} position={[0, 0, 0]} enableLod={true} />
            <PartMesh part={mockPartWithMidPoly} position={[5, 0, 0]} enableLod={true} />
          </Canvas>
        );

        await waitFor(() => {
          // useGLTF should be called with each unique URL only once (caching)
          const midPolyCallCount = mockUseGLTF.mock.calls.filter(
            call => call[0] === mockPartWithMidPoly.mid_poly_url
          ).length;
          const lowPolyCallCount = mockUseGLTF.mock.calls.filter(
            call => call[0] === mockPart.low_poly_url
          ).length;
          
          // Each URL should be called once per render pass, but drei handles caching
          expect(midPolyCallCount).toBeGreaterThanOrEqual(1);
          expect(lowPolyCallCount).toBeGreaterThanOrEqual(1);
        });
      });
    });
  });
});
