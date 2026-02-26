/**
 * T-1009-TEST-FRONT: 3D Viewer Integration Tests - Error Handling
 * 
 * Tests error handling scenarios for the 3D viewer modal integration:
 * - 404 from backend API → ErrorFallback UI
 * - Network timeout → Loading timeout → Error message
 * - WebGL unavailable → ViewerErrorBoundary catches
 * - GLB 404 from CDN → useGLTF throws → Error boundary
 * - Corrupted GLB → Three.js parsing error → ErrorFallback
 * 
 * Pattern: MSW mocking with error responses, error boundaries, timeout simulation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';

// Component under test
import { PartDetailModal } from '@/components/Dashboard/PartDetailModal';

// Services (mocked)
import * as uploadService from '@/services/upload.service';
import * as navigationService from '@/services/navigation.service';

// Fixtures
import {
  mockPartDetailCapitel,
  mockPartDetailGLBError,
} from '../fixtures/viewer.fixtures';

// Store
import { usePartsStore } from '@/stores/parts.store';

// Mock Portal (avoids nested document.body during rendering)
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

// Mock Services
vi.mock('@/services/upload.service');
vi.mock('@/services/navigation.service');

describe('T-1009-TEST-FRONT: 3D Viewer Integration Tests - Error Handling', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.clearAllMocks();
    
    // Reset store
    usePartsStore.setState({ selectedId: null });
    
    // Default mocks (can be overridden in individual tests)
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: null,
      next_id: null,
      current_index: 0,
      total_count: 1,
    });
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * ERR-INT-01: 404 from Backend API → ErrorFallback UI
   * 
   * GIVEN: User opens modal for a part that doesn't exist
   * WHEN: Backend API returns 404 error
   * THEN: Modal should display ErrorFallback component
   * AND: Error message "Pieza no encontrada" should be visible
   * AND: "Cerrar" button should be present to dismiss modal
   * AND: No 3D viewer or metadata should be displayed
   */
  it('ERR-INT-01: should display ErrorFallback when backend returns 404', async () => {
    // Arrange: Mock backend returning 404 error
    const notFoundError = new Error('Part not found');
    (notFoundError as any).response = { status: 404 };
    vi.mocked(uploadService.getPartDetail).mockRejectedValue(notFoundError);

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId="non-existent-id" 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for API call
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith('non-existent-id');
    });

    // Assert: ErrorFallback displayed with 404-specific message
    await waitFor(() => {
      expect(screen.getByText(/pieza no encontrada/i)).toBeInTheDocument();
    });

    // Assert: Error icon (⚠️) visible
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    // Assert: Close button present
    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    expect(closeButton).toBeInTheDocument();

    // Assert: No 3D viewer rendered
    expect(screen.queryByTestId('model-loader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('part-viewer-canvas')).not.toBeInTheDocument();

    // Assert: No metadata tabs visible
    expect(screen.queryByRole('tab', { name: /metadatos/i })).not.toBeInTheDocument();
  });

  /**
   * ERR-INT-02: Network Timeout → Loading Timeout → Error Message
   * 
   * GIVEN: User opens modal for a part
   * WHEN: Backend API request times out (exceeds 10s threshold)
   * THEN: Modal should stop showing "Cargando..." after timeout
   * AND: Error message "La carga está tardando demasiado" should be visible
   * AND: "Reintentar" button should be present
   * AND: User can click Reintentar to retry fetch
   */
  it('ERR-INT-02: should display timeout error message when API request exceeds threshold', { timeout: 20000 }, async () => {
    // Arrange: Mock backend with delayed response (simulates network timeout)
    vi.mocked(uploadService.getPartDetail).mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Network timeout'));
        }, 12000); // Exceeds 10s threshold
      });
    });

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailCapitel.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for API call
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailCapitel.id);
    });

    // Assert: Loading state initially visible (use specific text to avoid multiple matches)
    expect(screen.getByText(/cargando pieza/i)).toBeInTheDocument();

    // Assert: After timeout (10s+), error message displayed
    await waitFor(
      () => {
        expect(screen.getByText(/la carga está tardando demasiado/i)).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // Assert: Reintentar button present
    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();

    // Assert: No 3D viewer rendered yet
    expect(screen.queryByTestId('model-loader')).not.toBeInTheDocument();
  });

  /**
   * ERR-INT-03: WebGL Unavailable → ViewerErrorBoundary Catches
   * 
   * GIVEN: User opens modal on a browser without WebGL support
   * WHEN: PartViewerCanvas tries to initialize Three.js renderer
   * THEN: ViewerErrorBoundary should catch the error
   * AND: Fallback UI "WebGL no está disponible en este navegador" should display
   * AND: Metadata tab should still be accessible (graceful degradation)
   * AND: User can view part data without 3D visualization
   */
  it('ERR-INT-03: should catch WebGL unavailable error in ViewerErrorBoundary', async () => {
    // Arrange: Mock backend returning valid part
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailCapitel);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // Arrange: Mock WebGL context to fail
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null); // WebGL unavailable

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailCapitel.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailCapitel.id);
    });

    // Assert: Part code displayed (modal header rendered)
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailCapitel.iso_code)).toBeInTheDocument();
    });

    // Assert: WebGL error message displayed
    await waitFor(() => {
      expect(screen.getByText(/webgl no está disponible/i)).toBeInTheDocument();
    });

    // Assert: Metadata tab still accessible
    const metadataTab = screen.getByRole('tab', { name: /metadatos/i });
    expect(metadataTab).toBeInTheDocument();

    // Cleanup: Restore original getContext
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  /**
   * ERR-INT-04: GLB 404 from CDN → useGLTF Throws → Error Boundary
   * 
   * GIVEN: User opens modal for a part with invalid low_poly_url (404 from CDN)
   * WHEN: ModelLoader tries to load GLB file via useGLTF hook
   * THEN: useGLTF should throw an error (GLTF file not found)
   * AND: ViewerErrorBoundary should catch the error
   * AND: Fallback UI "Error al cargar el modelo 3D" should display
   * AND: Error details include "Archivo no encontrado en CDN"
   */
  it('ERR-INT-04: should catch GLB 404 error from CDN in error boundary', async () => {
    // Arrange: Mock backend returning part with invalid GLB URL
    vi.mocked(uploadService.getPartDetail).mockResolvedValue(mockPartDetailGLBError);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={mockPartDetailGLBError.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(mockPartDetailGLBError.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(mockPartDetailGLBError.iso_code)).toBeInTheDocument();
    });

    // Assert: Error boundary catches GLB load failure
    await waitFor(() => {
      expect(screen.getByText(/error al cargar el modelo 3d/i)).toBeInTheDocument();
    });

    // Assert: Error details mention CDN issue
    expect(screen.getByText(/archivo no encontrado en cdn/i)).toBeInTheDocument();

    // Assert: No canvas rendered (error state instead)
    expect(screen.queryByTestId('part-viewer-canvas')).not.toBeInTheDocument();
  });

  /**
   * ERR-INT-05: Corrupted GLB → Three.js Parsing Error → ErrorFallback
   * 
   * GIVEN: User opens modal for a part with corrupted GLB file
   * WHEN: ModelLoader tries to parse GLB via Three.js GLTFLoader
   * THEN: Three.js should throw parsing error (invalid GLTF format)
   * AND: ViewerErrorBoundary should catch the error
   * AND: Fallback UI "El archivo 3D está corrupto" should display
   * AND: User can click "Reportar problema" to log issue
   * 
   * @remarks
   * The global useGLTF mock in setup.ts detects URLs containing 'corrupted'
   * and throws a parsing error. No need to re-mock here.
   */
  it('ERR-INT-05: should catch corrupted GLB parsing error in error boundary', async () => {
    // Arrange: Mock backend returning part with valid URL but corrupted file
    const corruptedPart = {
      ...mockPartDetailCapitel,
      low_poly_url: 'https://cdn.example.com/corrupted-model.glb', // File exists but is invalid
    };

    vi.mocked(uploadService.getPartDetail).mockResolvedValue(corruptedPart);
    vi.mocked(navigationService.getPartNavigation).mockResolvedValue({
      prev_id: 'prev-id',
      next_id: 'next-id',
      current_index: 5,
      total_count: 20,
    });

    // NOTE: The global useGLTF mock in setup.ts will throw parsing error
    // when it detects 'corrupted' in the URL

    // Act: Render modal
    render(
      <PartDetailModal 
        isOpen={true} 
        partId={corruptedPart.id} 
        onClose={mockOnClose} 
      />
    );

    // Assert: Wait for data fetch
    await waitFor(() => {
      expect(uploadService.getPartDetail).toHaveBeenCalledWith(corruptedPart.id);
    });

    // Assert: Part code displayed
    await waitFor(() => {
      expect(screen.getByText(corruptedPart.iso_code)).toBeInTheDocument();
    });

    // Assert: Corrupted file error message displayed
    await waitFor(() => {
      expect(screen.getByText(/el archivo 3d está corrupto/i)).toBeInTheDocument();
    });

    // Assert: "Reportar problema" button present
    const reportButton = screen.getByRole('button', { name: /reportar problema/i });
    expect(reportButton).toBeInTheDocument();

    // Assert: No canvas rendered
    expect(screen.queryByTestId('part-viewer-canvas')).not.toBeInTheDocument();
  });
});
