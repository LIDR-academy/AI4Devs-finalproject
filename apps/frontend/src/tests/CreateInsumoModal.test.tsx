import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateInsumoModal } from '../features/stock/components/CreateInsumoModal.js';

const WAREHOUSE_SECTORS = [
  { id: 'loc-seed-meat-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', isActive: true },
  { id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true },
  { id: 'loc-2', name: 'Refrigerador Cocina', type: 'KITCHEN', isActive: true },
];

function stubFetch(onInsumoPost: (body: Record<string, unknown>) => unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/locations')) {
        return { ok: true, status: 200, json: async () => WAREHOUSE_SECTORS };
      }
      const body = JSON.parse(init?.body as string) as Record<string, unknown>;
      return { ok: true, status: 201, json: async () => onInsumoPost(body) };
    })
  );
}

describe('TK-078-FE / TK-096-FE: CreateInsumoModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar el campo de costo con la unidad de medida por defecto (KG) como sufijo', () => {
    stubFetch(() => ({}));
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByLabelText(/Costo por KG \(Opcional\)/i)).toBeInTheDocument();
  });

  it('US-025: bloquea el envío si no se selecciona un sub-sector de bodega', async () => {
    let posted = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/locations')) return { ok: true, status: 200, json: async () => [] };
        posted = true;
        return { ok: true, status: 201, json: async () => ({}) };
      })
    );
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Nombre del Insumo/i), { target: { value: 'Harina' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Insumo/i }));

    await waitFor(() => {
      expect(screen.getByText(/sub-sector de bodega/i)).toBeInTheDocument();
    });
    expect(posted).toBe(false);
  });

  it('US-025: envía storageLocationId (auto-seleccionado) y unitCost en el body del POST', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    stubFetch((body) => {
      capturedBody = body;
      return { id: 'ins-new-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: '0.000', unitCost: '1800.00' };
    });

    const onSuccess = vi.fn();
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector de Bodega/i) as HTMLSelectElement).value).toBe('loc-seed-meat-fridge');
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Insumo/i), { target: { value: 'Queso Mozzarella' } });
    fireEvent.change(screen.getByLabelText(/Costo por KG \(Opcional\)/i), { target: { value: '1800.00' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Insumo/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(capturedBody).toMatchObject({ unitCost: '1800.00', storageLocationId: 'loc-seed-meat-fridge' });
  });

  it('no incluye unitCost en el body del POST cuando el usuario deja el campo vacio', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    stubFetch((body) => {
      capturedBody = body;
      return { id: 'ins-new-2', name: 'Salsa de Tomate', unitOfMeasure: 'KG', warehouseStock: '0.000' };
    });

    const onSuccess = vi.fn();
    render(<CreateInsumoModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector de Bodega/i) as HTMLSelectElement).value).toBe('loc-seed-meat-fridge');
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Insumo/i), { target: { value: 'Salsa de Tomate' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Insumo/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(capturedBody).not.toHaveProperty('unitCost');
  });
});
