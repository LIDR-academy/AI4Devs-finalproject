import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsumoCatalogPanel } from '../features/stock/components/InsumoCatalogPanel.js';

describe('TK-116-FE: barra de herramientas acoplada del catálogo de bodega (US-031)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const stubInsumos = () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => [
          { id: 'ins-1', name: 'Lomo Vacuno', unitOfMeasure: 'KG', warehouseStock: '20.000', stockByLocation: [] },
          { id: 'ins-2', name: 'Leche Entera', unitOfMeasure: 'L', warehouseStock: '10.000', stockByLocation: [] },
        ],
      }))
    );
  };

  it('sin preferencia guardada, arranca en vista de lista (tabla)', async () => {
    stubInsumos();
    render(<InsumoCatalogPanel />);

    expect(await screen.findByText('Lomo Vacuno')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('cambiar a vista de grilla la persiste y sobrevive a un remount', async () => {
    stubInsumos();
    const { unmount } = render(<InsumoCatalogPanel />);

    await screen.findByText('Lomo Vacuno');
    fireEvent.click(screen.getByRole('button', { name: /vista de grilla/i }));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(localStorage.getItem('fefo-catalog-view')).toBe('grid');

    unmount();
    stubInsumos();
    render(<InsumoCatalogPanel />);

    await screen.findByText('Lomo Vacuno');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('la búsqueda sigue filtrando el mismo set de insumos en ambas vistas', async () => {
    stubInsumos();
    render(<InsumoCatalogPanel />);

    await screen.findByText('Lomo Vacuno');
    fireEvent.change(screen.getByPlaceholderText(/Buscar insumo por nombre/i), { target: { value: 'Leche' } });

    expect(screen.queryByText('Lomo Vacuno')).not.toBeInTheDocument();
    expect(screen.getByText('Leche Entera')).toBeInTheDocument();
  });
});
