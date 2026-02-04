import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Planning3DViewerPage from './Planning3DViewer';

vi.mock('@/components/planning/DicomViewer3D', () => ({
  default: function MockDicomViewer3D({
    onMeasurement,
    onClearMeasurement,
  }: {
    onMeasurement?: (distance: number) => void;
    onClearMeasurement?: () => void;
  }) {
    return (
      <div data-testid="dicom-viewer-3d">
        <button
          type="button"
          onClick={() => onMeasurement?.(42.5)}
          data-testid="trigger-measurement"
        >
          Simular medición 42.5 mm
        </button>
        <button
          type="button"
          onClick={() => onClearMeasurement?.()}
          data-testid="trigger-clear"
        >
          Borrar medición
        </button>
      </div>
    );
  },
}));

vi.mock('@/services/planning.service', () => ({
  default: {
    getPlanningBySurgeryId: vi.fn(),
  },
}));

vi.mock('@/utils/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import planningService from '@/services/planning.service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/planning/surgeries/surgery-123/3d-viewer']}>
          <Routes>
            <Route
              path="/planning/surgeries/:surgeryId/3d-viewer"
              element={children}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
};

describe('Planning3DViewerPage', () => {
  beforeEach(() => {
    vi.mocked(planningService.getPlanningBySurgeryId).mockResolvedValue(null as any);
  });

  it('renderiza el título del visualizador 3D', async () => {
    render(<Planning3DViewerPage />, { wrapper: createWrapper() });
    expect(await screen.findByText(/Visualizador 3D - Planificación Quirúrgica/i)).toBeInTheDocument();
  });

  it('muestra el botón Cargar ejemplo cuando no hay planificación', async () => {
    render(<Planning3DViewerPage />, { wrapper: createWrapper() });
    const buttons = await screen.findAllByRole('button', { name: /Cargar ejemplo/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra la medición en mm cuando el visor notifica una medición', async () => {
    render(<Planning3DViewerPage />, { wrapper: createWrapper() });
    const trigger = await screen.findByTestId('trigger-measurement');
    fireEvent.click(trigger);
    expect(screen.getByText('42.50 mm')).toBeInTheDocument();
  });

  it('oculta la medición cuando se llama a onClearMeasurement', async () => {
    render(<Planning3DViewerPage />, { wrapper: createWrapper() });
    const trigger = await screen.findByTestId('trigger-measurement');
    fireEvent.click(trigger);
    expect(screen.getByText('42.50 mm')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('trigger-clear'));
    expect(screen.queryByText('42.50 mm')).not.toBeInTheDocument();
  });

  it('renderiza el visor 3D mockeado', async () => {
    render(<Planning3DViewerPage />, { wrapper: createWrapper() });
    expect(await screen.findByTestId('dicom-viewer-3d')).toBeInTheDocument();
  });
});
