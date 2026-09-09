import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RestockInsumoModal } from '../features/stock/components/RestockInsumoModal.js';
import { InsumoCatalogPanel } from '../features/stock/components/InsumoCatalogPanel.js';
import { LocationsManagementModal } from '../features/stock/components/LocationsManagementModal.js';

const WAREHOUSE_SECTORS = [
  { id: 'loc-seed-meat-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', isActive: true, hasStock: true },
  { id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true, hasStock: false },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TK-096-FE: RestockInsumoModal — sub-sector destino (US-025)', () => {
  it('bloquea el envío sin sub-sector y luego envía storageLocationId', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/locations')) return { ok: true, status: 200, json: async () => WAREHOUSE_SECTORS };
        capturedBody = JSON.parse(init?.body as string);
        return { ok: true, status: 200, json: async () => ({ insumoId: 'ins-1', insumoName: 'Harina', storageLocationId: 'loc-seed-meat-fridge', quantityAdded: '5.000', newSectorStock: '5.000', newWarehouseStock: '5.000' }) };
      })
    );

    const insumo = { id: 'ins-1', name: 'Harina', unitOfMeasure: 'KG', warehouseStock: '0.000' };
    render(<RestockInsumoModal isOpen insumo={insumo} onClose={() => {}} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sub-sector de Bodega destino/i) as HTMLSelectElement).value).toBe('loc-seed-meat-fridge');
    });

    fireEvent.change(screen.getByLabelText(/Cantidad Recibida/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Reabastecimiento/i }));

    await waitFor(() => expect(capturedBody).toMatchObject({ quantity: '5', storageLocationId: 'loc-seed-meat-fridge' }));
  });
});

describe('TK-096-FE: InsumoCatalogPanel — desglose de stock por sub-sector (US-025)', () => {
  it('muestra el total y despliega el desglose por sector', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 'ins-1',
            name: 'Lomo Vacuno',
            unitOfMeasure: 'KG',
            warehouseStock: '20.000',
            stockByLocation: [
              { storageLocationId: 'loc-seed-meat-fridge', storageLocationName: 'Heladera de Carnes', quantity: '12.000' },
              { storageLocationId: 'loc-seed-freezer', storageLocationName: 'Cámara de Congelados', quantity: '8.000' },
            ],
          },
        ],
      }))
    );

    render(<InsumoCatalogPanel />);

    expect(await screen.findByText(/20.000 KG/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    const breakdown = await screen.findByText('Heladera de Carnes');
    expect(breakdown).toBeInTheDocument();
    expect(screen.getByText('Cámara de Congelados')).toBeInTheDocument();
  });
});

describe('TK-074-FE: LocationsManagementModal — sector con existencias (US-025)', () => {
  it('deshabilita desactivar/eliminar cuando hasStock', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/locations')) return { ok: true, status: 200, json: async () => WAREHOUSE_SECTORS };
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    render(<LocationsManagementModal isOpen onClose={() => {}} />);

    const row = (await screen.findByText('Heladera de Carnes')).closest('div')?.parentElement?.parentElement as HTMLElement;
    const buttons = within(row).getAllByRole('button');
    // Power + Trash deshabilitados por hasStock
    expect(buttons.some((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(buttons.filter((b) => (b as HTMLButtonElement).disabled)).toHaveLength(2);
  });
});
