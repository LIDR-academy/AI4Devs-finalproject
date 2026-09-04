import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WarehouseExtractionModal } from '../features/stock/components/WarehouseExtractionModal.js';

const INSUMOS_FIXTURE = [
  { id: 'ins-1', name: 'Queso Mozzarella', unitOfMeasure: 'KG', warehouseStock: '10.000' },
  { id: 'ins-2', name: 'Aceite de Oliva', unitOfMeasure: 'L', warehouseStock: '5.000' },
];

function stubFetchForExtractionModal(activeRemanentesByInsumoId: Record<string, unknown[]>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/kitchen/remanentes-activos')) {
        const match = /insumoId=([^&]+)/.exec(url);
        const insumoId = match ? decodeURIComponent(match[1]) : '';
        return { ok: true, status: 200, json: async () => activeRemanentesByInsumoId[insumoId] ?? [] };
      }
      if (url.includes('/recipes')) {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (url.includes('/stock/insumos')) {
        return { ok: true, status: 200, json: async () => INSUMOS_FIXTURE };
      }
      if (url.includes('/locations')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 'loc-seed-meat-fridge', name: 'Heladera de Carnes', type: 'WAREHOUSE', isActive: true },
            { id: 'loc-2', name: 'Refrigerador Cocina', type: 'KITCHEN', isActive: true },
          ],
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    })
  );
}

describe('TK-080-FE: WarehouseExtractionModal — Advertencia de Apertura Duplicada (US-021)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('debe mostrar una advertencia no bloqueante con ubicacion y cantidad cuando ya hay un remanente activo del insumo (US-021 Escenario 1)', async () => {
    stubFetchForExtractionModal({
      'ins-1': [
        {
          id: 'rem-existente-1',
          insumoId: 'ins-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          currentQuantity: '2.300',
          initialQuantity: '3.000',
          location: 'KITCHEN_FRIDGE',
          expirationDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          hoursRemaining: 20,
          isCriticalAlert: false,
          status: 'ACTIVE',
        },
      ],
    });

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    expect(await screen.findByText(/ya existe un remanente activo/i)).toBeInTheDocument();
    const warningBanner = screen.getByRole('status');
    expect(warningBanner).toHaveTextContent('2.300');
    expect(warningBanner).toHaveTextContent('KITCHEN_FRIDGE');
  });

  it('no debe mostrar ninguna advertencia cuando no hay remanentes activos del insumo (US-021 Escenario 2)', async () => {
    stubFetchForExtractionModal({});

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirmar Extracción/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/ya existe un remanente activo/i)).not.toBeInTheDocument();
  });

  it('no debe bloquear la confirmacion de extraccion aunque la advertencia este visible (US-021 Escenario 1)', async () => {
    stubFetchForExtractionModal({
      'ins-1': [
        {
          id: 'rem-existente-1',
          insumoId: 'ins-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          currentQuantity: '2.300',
          initialQuantity: '3.000',
          location: 'KITCHEN_FRIDGE',
          expirationDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          hoursRemaining: 20,
          isCriticalAlert: false,
          status: 'ACTIVE',
        },
      ],
    });

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await screen.findByText(/ya existe un remanente activo/i);

    const confirmButton = screen.getByRole('button', { name: /Confirmar Extracción/i }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(false);
  });

  it('debe limpiar de inmediato la advertencia del insumo anterior al cambiar de insumo, sin esperar la nueva respuesta', async () => {
    let resolveIns2Check: (() => void) | undefined;
    const ins2CheckPending = new Promise<void>((resolve) => {
      resolveIns2Check = resolve;
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/kitchen/remanentes-activos')) {
          const match = /insumoId=([^&]+)/.exec(url);
          const insumoId = match ? decodeURIComponent(match[1]) : '';
          if (insumoId === 'ins-1') {
            return {
              ok: true,
              status: 200,
              json: async () => [
                {
                  id: 'rem-existente-1',
                  insumoId: 'ins-1',
                  insumoName: 'Queso Mozzarella',
                  unitOfMeasure: 'KG',
                  currentQuantity: '2.300',
                  initialQuantity: '3.000',
                  location: 'KITCHEN_FRIDGE',
                  expirationDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
                  hoursRemaining: 20,
                  isCriticalAlert: false,
                  status: 'ACTIVE',
                },
              ],
            };
          }
          // ins-2 (Aceite de Oliva): la respuesta queda pendiente a proposito hasta que el
          // test la libere explicitamente, para probar que la advertencia de ins-1 se limpia
          // de inmediato al cambiar de insumo, sin esperar a que esta consulta resuelva.
          await ins2CheckPending;
          return { ok: true, status: 200, json: async () => [] };
        }
        if (url.includes('/recipes')) {
          return { ok: true, status: 200, json: async () => [] };
        }
        if (url.includes('/stock/insumos')) {
          return { ok: true, status: 200, json: async () => INSUMOS_FIXTURE };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    expect(await screen.findByText(/ya existe un remanente activo/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Seleccionar Insumo de Bodega/i), { target: { value: 'ins-2' } });

    await waitFor(() => {
      expect(screen.queryByText(/ya existe un remanente activo/i)).not.toBeInTheDocument();
    });

    resolveIns2Check?.();
  });
});

describe('TK-096-FE: WarehouseExtractionModal — Sub-sector de bodega de origen (US-025)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('carga los sub-sectores de bodega (type WAREHOUSE) y auto-selecciona el primero', async () => {
    stubFetchForExtractionModal({});
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      const select = screen.getByLabelText(/Sector de Bodega Origen/i) as HTMLSelectElement;
      expect(select.value).toBe('loc-seed-meat-fridge');
    });
    // el sector de cocina no debe aparecer como opción de origen
    expect(screen.queryByRole('option', { name: 'Refrigerador Cocina' })).not.toBeInTheDocument();
  });

  it('envía fromStorageLocationId en el POST /stock/extraction', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) {
          return { ok: true, status: 200, json: async () => [{ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true }] };
        }
        if (url.includes('/stock/insumos')) return { ok: true, status: 200, json: async () => INSUMOS_FIXTURE };
        if (url.includes('/stock/extraction')) {
          capturedBody = JSON.parse(init?.body as string);
          return {
            ok: true,
            status: 201,
            json: async () => ({
              remanenteId: 'rem-x', insumoId: 'ins-1', insumoName: 'Queso Mozzarella', quantityExtracted: '1.000',
              fromStorageLocationId: 'loc-seed-dry', remainingSectorStock: '9.000', remainingWarehouseStock: '9.000',
              location: 'KITCHEN_FRIDGE', expirationDate: new Date().toISOString(), status: 'ACTIVE',
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    const onSuccess = vi.fn();
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sector de Bodega Origen/i) as HTMLSelectElement).value).toBe('loc-seed-dry');
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(capturedBody).toMatchObject({ fromStorageLocationId: 'loc-seed-dry' });
  });
});
