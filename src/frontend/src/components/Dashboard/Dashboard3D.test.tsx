/**
 * Test suite for Dashboard3D component
 * T-0504-FRONT: Dashboard 3D Canvas Layout with Dockable Sidebar
 * 
 * TDD-RED Phase: These tests MUST fail because components don't exist yet
 * Expected error: Cannot find module './Dashboard3D' or similar
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard3D from './Dashboard3D';
import { usePartsStore } from '@/stores/parts.store';

// Mock Zustand store
vi.mock('@/stores/parts.store');

/**
 * Helper: Create mock part for testing
 */
const createMockPart = (id: string = '123') => ({
  id,
  iso_code: `TEST-${id}`,
  status: 'validated' as const,
  tipologia: 'capitel' as const,
  low_poly_url: 'https://example.com/part.glb',
  bbox: { min: [0, 0, 0], max: [1, 1, 1] },
  workshop_id: null,
  workshop_name: null,
});

describe('Dashboard3D Component', () => {
  beforeEach(() => {
    // Reset mock store state before each test with parts to render Canvas
    vi.mocked(usePartsStore).mockImplementation((selector: any) => {
      const mockState = {
        parts: [createMockPart()],
        isLoading: false,
        error: null,
        filters: { status: [], tipologia: [], workshop_id: null },
        selectedId: null,
        setParts: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        setFilters: vi.fn(),
        selectPart: vi.fn(),
        clearSelection: vi.fn(),
        clearFilters: vi.fn(),
        getFilteredParts: vi.fn(() => [createMockPart()]),
      };
      return selector ? selector(mockState) : mockState;
    });
  });

  describe('Happy Path - Rendering', () => {
    it('should render Dashboard3D with Canvas and Sidebar visible', () => {
      render(<Dashboard3D />);
      
      // Canvas should be present (mocked by setup.ts)
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
      
      // Sidebar should be present
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render Canvas3D with Grid component', () => {
      render(<Dashboard3D />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
      
      // Grid should be rendered inside Canvas (via drei mock)
      // Check that Grid props are passed correctly
      expect(canvas).toHaveAttribute('data-has-grid', 'true');
    });

    it('should render OrbitControls within Canvas', () => {
      render(<Dashboard3D />);
      
      const canvas = screen.getByTestId('canvas');
      // OrbitControls should be present (mocked)
      expect(canvas).toHaveAttribute('data-has-controls', 'true');
    });

    it('should position camera at default [50, 50, 50]', () => {
      render(<Dashboard3D />);
      
      const canvas = screen.getByTestId('canvas');
      // Camera position should match CAMERA_CONFIG defaults
      expect(canvas).toHaveAttribute('data-camera-position', '50,50,50');
    });

    it('should render lights (ambient + directional)', () => {
      render(<Dashboard3D />);
      
      const canvas = screen.getByTestId('canvas');
      // Lights should be configured
      expect(canvas).toHaveAttribute('data-has-lights', 'true');
    });

    it('should render GizmoViewcube in bottom-right corner', () => {
      render(<Dashboard3D />);
      
      const canvas = screen.getByTestId('canvas');
      // Gizmo should be present
      expect(canvas).toHaveAttribute('data-has-gizmo', 'true');
    });
  });

  describe('Edge Cases - Empty State', () => {
    it('should show EmptyState when parts.length === 0', () => {
      vi.mocked(usePartsStore).mockImplementation((selector: any) => {
        const mockState = {
          parts: [],
          isLoading: false,
          error: null,
          filters: { status: [], tipologia: [], workshop_id: null },
          selectedId: null,
          setParts: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          setFilters: vi.fn(),
          selectPart: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => []),
        };
        return selector ? selector(mockState) : mockState;
      });

      render(<Dashboard3D />);
      
      expect(screen.getByText(/No hay piezas cargadas/i)).toBeInTheDocument();
    });

    it('should hide EmptyState when parts.length > 0', () => {
      vi.mocked(usePartsStore).mockImplementation((selector: any) => {
        const mockState = {
          parts: [createMockPart()],
          isLoading: false,
          error: null,
          filters: { status: [], tipologia: [], workshop_id: null },
          selectedId: null,
          setParts: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          setFilters: vi.fn(),
          selectPart: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => [createMockPart()]),
        };
        return selector ? selector(mockState) : mockState;
      });

      render(<Dashboard3D />);
      
      expect(screen.queryByText(/No hay piezas cargadas/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases - Loading State', () => {
    it('should show LoadingOverlay when isLoading === true', () => {
      vi.mocked(usePartsStore).mockImplementation((selector: any) => {
        const mockState = {
          parts: [],
          isLoading: true,
          error: null,
          filters: { status: [], tipologia: [], workshop_id: null },
          selectedId: null,
          setParts: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          setFilters: vi.fn(),
          selectPart: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => []),
        };
        return selector ? selector(mockState) : mockState;
      });

      render(<Dashboard3D />);
      
      expect(screen.getByText(/Cargando piezas/i)).toBeInTheDocument();
    });

    it('should hide LoadingOverlay when isLoading === false', () => {
      render(<Dashboard3D />);
      
      expect(screen.queryByText(/Cargando piezas/i)).not.toBeInTheDocument();
    });
  });

  describe('Sidebar - Placeholder Content', () => {
    it('should render FiltersSidebar with part count', () => {
      vi.mocked(usePartsStore).mockImplementation((selector: any) => {
        const mockState = {
          parts: [createMockPart('1'), createMockPart('2')],
          isLoading: false,
          error: null,
          filters: { status: [], tipologia: [], workshop_id: null },
          selectedId: null,
          setParts: vi.fn(),
          setLoading: vi.fn(),
          setError: vi.fn(),
          setFilters: vi.fn(),
          selectPart: vi.fn(),
          clearSelection: vi.fn(),
          clearFilters: vi.fn(),
          getFilteredParts: vi.fn(() => [createMockPart('1'), createMockPart('2')]),
        };
        return selector ? selector(mockState) : mockState;
      });

      render(<Dashboard3D />);
      
      // Should show total count (from FiltersSidebar)
      expect(screen.getByText(/Mostrando 2 de 2/i)).toBeInTheDocument();
    });
  });

  describe('Security - Stats Panel', () => {
    it('should show Stats panel when import.meta.env.DEV === true', () => {
      // In test environment, DEV should be true
      render(<Dashboard3D showStats={true} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toHaveAttribute('data-has-stats', 'true');
    });

    it('should NOT show Stats panel in production', () => {
      render(<Dashboard3D showStats={false} />);
      
      const canvas = screen.getByTestId('canvas');
      expect(canvas).not.toHaveAttribute('data-has-stats', 'true');
    });
  });
});
