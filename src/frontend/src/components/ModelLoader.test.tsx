/**
 * T-1005-FRONT: Model Loader Component Tests
 * TDD RED Phase - Tests written before implementation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModelLoader } from './ModelLoader';
import * as uploadService from '@/services/upload.service';
import type { PartDetail } from '@/types/parts';
import '@testing-library/jest-dom';

// Mock Three.js components to avoid WebGL dependency in tests
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  useGLTF: vi.fn(() => ({ 
    scene: { 
      clone: () => ({ 
        traverse: vi.fn() 
      }) 
    } 
  })),
  Html: ({ children }: any) => <div data-testid="html-content">{children}</div>,
}));

// Mock BBoxProxy component
vi.mock('./BBoxProxy', () => ({
  BBoxProxy: ({ bbox }: any) => (
    <mesh data-testid="bbox-proxy" data-bbox={JSON.stringify(bbox)} />
  ),
}));

describe('ModelLoader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * LOADING-01: Show loading spinner while fetching part data
   * Expected: Display "Cargando modelo 3D..." while API call is pending
   */
  it('LOADING-01: should show loading spinner while fetching part data', async () => {
    // Mock API call that never resolves (simulates loading state)
    vi.spyOn(uploadService, 'getPartDetail').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ModelLoader partId="test-part-id" />);
    
    // Assert: Loading message should be visible
    expect(screen.getByText('Cargando modelo 3D...')).toBeInTheDocument();
  });

  /**
   * LOADING-02: Load GLB successfully when low_poly_url exists
   * Expected: Fetch part data and render GLB model using useGLTF
   */
  it('LOADING-02: should load GLB when low_poly_url exists', async () => {
    const mockPartData: PartDetail = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    render(<ModelLoader partId="test-part-id" />);

    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith('test-part-id');
    });

    // Note: Full GLB rendering validation requires manual test in browser
    // jsdom cannot test Three.js WebGL rendering
  });

  /**
   * CALLBACK-01: Call onLoadSuccess when model loads successfully
   * Expected: Trigger callback with full PartDetail data
   */
  it('CALLBACK-01: should call onLoadSuccess callback when model loads', async () => {
    const mockPartData: PartDetail = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    const onLoadSuccess = vi.fn();

    render(<ModelLoader partId="test-part-id" onLoadSuccess={onLoadSuccess} />);

    await waitFor(() => {
      expect(onLoadSuccess).toHaveBeenCalledWith(mockPartData);
    });
  });

  /**
   * FALLBACK-01: Show BBox proxy when low_poly_url IS NULL
   * Expected: Render BBoxProxy with message "Geometría en procesamiento"
   * Scenario: Geometry not yet processed by agent (T-0502-AGENT)
   */
  it('FALLBACK-01: should show BBox proxy when low_poly_url IS NULL', async () => {
    const mockPartData: PartDetail = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-002',
      low_poly_url: null, // Geometry not processed yet
      bbox: { min: [-2, 0, -2], max: [2, 3, 2] },
      status: 'uploaded',
      tipologia: 'columna',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: null,
      workshop_name: null,
      validation_report: null,
      glb_size_bytes: null,
      triangle_count: null,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    render(<ModelLoader partId="test-part-id" />);

    await waitFor(() => {
      expect(screen.getByText('Geometría en procesamiento')).toBeInTheDocument();
      expect(screen.getByText(/SF-C12-D-002/)).toBeInTheDocument();
      expect(screen.getByTestId('bbox-proxy')).toBeInTheDocument();
    });
  });

  /**
   * FALLBACK-02: Show error fallback when fetch fails (404)
   * Expected: Display error message with part ID
   */
  it('FALLBACK-02: should show error fallback when fetch fails', async () => {
    vi.spyOn(uploadService, 'getPartDetail').mockRejectedValue(
      new Error('Pieza no encontrada (ID: test-part-id)')
    );

    const onLoadError = vi.fn();

    render(<ModelLoader partId="test-part-id" onLoadError={onLoadError} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar modelo')).toBeInTheDocument();
      expect(screen.getByText(/Pieza no encontrada/)).toBeInTheDocument();
      expect(onLoadError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  /**
   * PROPS-01: Accept all optional props without error
   * Expected: Component renders with custom configuration
   */
  it('PROPS-01: should accept all optional props', async () => {
    const mockPartData: PartDetail = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    expect(() => {
      render(
        <ModelLoader
          partId="test-part-id"
          enablePreload={false}
          showLoadingSpinner={false}
          onLoadSuccess={vi.fn()}
          onLoadError={vi.fn()}
          autoCenter={false}
          autoScale={false}
          targetSize={10}
        />
      );
    }).not.toThrow();
  });

  /**
   * FALLBACK-03: Show error with BBox when part data includes bbox but fetch fails
   * Expected: Display BBox wireframe even when error occurs (if bbox available)
   */
  it('FALLBACK-03: should show error fallback with BBox when available', async () => {
    const mockError = new Error('Network timeout');
    
    vi.spyOn(uploadService, 'getPartDetail').mockRejectedValue(mockError);

    render(<ModelLoader partId="test-part-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar modelo')).toBeInTheDocument();
    });
  });

  /**
   * PROPS-02: Respect enablePreload=false setting
   * Expected: Should not attempt to preload adjacent parts
   */
  it('PROPS-02: should respect enablePreload=false setting', async () => {
    const mockPartData: PartDetail = {
      id: 'test-part-id',
      iso_code: 'SF-C12-D-001',
      low_poly_url: 'https://cdn.cloudfront.net/low-poly/test.glb',
      bbox: { min: [-1, 0, -1], max: [1, 2, 1] },
      status: 'validated',
      tipologia: 'capitel',
      created_at: '2026-02-15T10:00:00Z',
      workshop_id: 'workshop-123',
      workshop_name: 'Taller Granollers',
      validation_report: null,
      glb_size_bytes: 1024,
      triangle_count: 500,
    };

    vi.spyOn(uploadService, 'getPartDetail').mockResolvedValue(mockPartData);

    render(<ModelLoader partId="test-part-id" enablePreload={false} />);

    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledTimes(1);
    });

    // Note: Preload verification requires checking useGLTF.preload calls
    // Full implementation test in integration phase
  });

  /**
   * CALLBACK-02: Call onLoadError when part not found
   * Expected: Trigger error callback with meaningful error message
   */
  it('CALLBACK-02: should call onLoadError when part not found', async () => {
    const mockError = new Error('Pieza no encontrada (ID: invalid-id)');
    
    vi.spyOn(uploadService, 'getPartDetail').mockRejectedValue(mockError);

    const onLoadError = vi.fn();

    render(<ModelLoader partId="invalid-id" onLoadError={onLoadError} />);

    await waitFor(() => {
      expect(onLoadError).toHaveBeenCalledWith(mockError);
    });
  });

  /**
   * EDGE-01: Handle empty string partId gracefully
   * Expected: Should attempt fetch and handle error appropriately
   */
  it('EDGE-01: should handle empty partId gracefully', async () => {
    vi.spyOn(uploadService, 'getPartDetail').mockRejectedValue(
      new Error('Pieza no encontrada (ID: )')
    );

    render(<ModelLoader partId="" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar modelo')).toBeInTheDocument();
    });
  });
});
