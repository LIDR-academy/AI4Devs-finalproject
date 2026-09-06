import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RescueRecipesModal } from '../features/recipes/components/RescueRecipesModal.js';

describe('TK-122-FE: RescueRecipesModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<RescueRecipesModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza sugerencias generadas y muestra badge de procedencia (HEURISTIC)', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/rescue-suggestions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            source: 'HEURISTIC',
            proposals: [
              {
                name: 'Sopa Minestrone de Rescate',
                description: 'Aprovechamiento de verduras y salsa',
                category: 'SOPAS',
                estimatedPortions: 4,
                ingredients: [
                  { insumoId: 'ins-1', insumoName: 'Tomate', quantity: '0.500', unit: 'KG', isAtRisk: true },
                ],
                preventedWasteEstimate: '0.500 KG',
              },
            ],
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RescueRecipesModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Sopa Minestrone de Rescate')).toBeInTheDocument();
      expect(screen.getByText(/Motor Heurístico Local/i)).toBeInTheDocument();
      expect(screen.getByText(/En riesgo/i)).toBeInTheDocument();
    });
  });

  it('muestra estado vacío cuando no hay remanentes en riesgo crítico', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/rescue-suggestions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            source: 'HEURISTIC',
            proposals: [],
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RescueRecipesModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/No hay remanentes en riesgo crítico en este momento/i)).toBeInTheDocument();
    });
  });

  it('permite guardar una sugerencia en el catálogo de recetas', async () => {
    const onSavedMock = vi.fn();
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/rescue-suggestions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            source: 'GEMINI',
            proposals: [
              {
                name: 'Crema de Calabaza Express',
                description: 'Aprovechamiento antes de vencer',
                category: 'SOPAS',
                estimatedPortions: 2,
                ingredients: [
                  { insumoId: 'ins-calabaza', insumoName: 'Calabaza', quantity: '1.000', unit: 'KG', isAtRisk: true },
                ],
                preventedWasteEstimate: '1.000 KG',
              },
            ],
          }),
        };
      }
      if (url.endsWith('/recipes') && init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        expect(body.name).toBe('Crema de Calabaza Express');
        expect(body.ingredients).toHaveLength(1);
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'rec-new-1', ...body }),
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RescueRecipesModal isOpen={true} onClose={() => {}} onRecipeSaved={onSavedMock} />);

    await waitFor(() => {
      expect(screen.getByText('Crema de Calabaza Express')).toBeInTheDocument();
      expect(screen.getByText(/Sugerencias Inteligentes Generadas por IA \(GEMINI\)/i)).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Guardar receta Crema de Calabaza Express/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Guardada en Catálogo/i)).toBeInTheDocument();
      expect(onSavedMock).toHaveBeenCalled();
    });
  });

  it('muestra mensaje de error cuando falla la llamada de sugerencias', async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Fallo de conexión' }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RescueRecipesModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Inconveniente temporal en el servidor/i)).toBeInTheDocument();
    });
  });
});
