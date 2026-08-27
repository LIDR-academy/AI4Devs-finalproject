import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeSelectorModal } from '../features/kitchen/components/RecipeSelectorModal.js';

describe('TK-061: RecipeSelectorModal conectado al catálogo real', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('carga las recetas reales del catálogo (GET /recipes) en vez de datos hardcodeados', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/recipes')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 'rec-lasagna',
              name: 'Lasagna Boloñesa',
              category: 'PASTA',
              ingredients: [{ insumoId: 'ins-carne-1', quantity: '0.200' }],
            },
          ],
        };
      }
      if (url.includes('/stock/insumos')) {
        return {
          ok: true,
          status: 200,
          json: async () => [{ id: 'ins-carne-1', name: 'Carne Molida', unitOfMeasure: 'KG', warehouseStock: '5.000' }],
        };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RecipeSelectorModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Lasagna Boloñesa')).toBeInTheDocument();
      expect(screen.getByText(/0.200 Carne Molida/i)).toBeInTheDocument();
    });

    expect(screen.queryByText('Pizza Margarita')).not.toBeInTheDocument();
  });

  it('cae a las recetas de demo si falla la llamada al catálogo (modo offline)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<RecipeSelectorModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Pizza Margarita')).toBeInTheDocument();
    });
  });

  it('muestra un estado vacío si el catálogo no tiene recetas dadas de alta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));

    render(<RecipeSelectorModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/No hay recetas dadas de alta/i)).toBeInTheDocument();
    });
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<RecipeSelectorModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('confirma la preparación llamando a KitchenService.consumeRecipe con la receta real seleccionada', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/recipes')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 'rec-lasagna', name: 'Lasagna Boloñesa', category: 'PASTA', ingredients: [] },
          ],
        };
      }
      if (url.includes('/stock/insumos')) {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (url.includes('/consume')) {
        expect(url).toContain('rec-lasagna');
        expect(init?.method).toBe('POST');
        return { ok: true, status: 200, json: async () => ({}) };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    vi.stubGlobal('fetch', fetchMock);

    const onSuccess = vi.fn();
    render(<RecipeSelectorModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByText('Lasagna Boloñesa')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Preparación/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
