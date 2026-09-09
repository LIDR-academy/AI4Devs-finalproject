import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import { WarehouseExtractionModal } from '../features/stock/components/WarehouseExtractionModal.js';

// TK-119-FE: BarcodeScannerButton llama a @zxing/browser real (getUserMedia) — no
// disponible en jsdom. Se mockea el módulo del hook para simular el resultado del
// escaneo sin depender de una cámara real; el componente en sí ya tiene su propia
// cobertura RTL dedicada en shared/components/BarcodeScannerButton.test.tsx.
let mockScanResult: ((barcode: string) => void) | undefined;
vi.mock('../shared/hooks/useBarcodeScanner.js', () => ({
  useBarcodeScanner: (active: boolean, onScan: (barcode: string) => void) => {
    mockScanResult = active ? onScan : undefined;
    return { videoRef: { current: null }, error: null };
  },
}));

// US-025: el saldo por sub-sector es obligatorio en la respuesta real de /stock/insumos
// (ListInsumosUseCase) — sin él, el chequeo de stock por sector de origen (bugfix del
// modal, ver "Sector de Bodega Origen") bloquearía toda extracción en estos tests.
const INSUMOS_FIXTURE = [
  {
    id: 'ins-1',
    name: 'Queso Mozzarella',
    unitOfMeasure: 'KG',
    warehouseStock: '10.000',
    stockByLocation: [
      { storageLocationId: 'loc-seed-meat-fridge', storageLocationName: 'Heladera de Carnes', quantity: '10.000' },
      { storageLocationId: 'loc-seed-dry', storageLocationName: 'Bodega de Secos', quantity: '10.000' },
    ],
  },
  {
    id: 'ins-2',
    name: 'Aceite de Oliva',
    unitOfMeasure: 'L',
    warehouseStock: '5.000',
    barcode: '7791234567890',
    stockByLocation: [
      { storageLocationId: 'loc-seed-meat-fridge', storageLocationName: 'Heladera de Carnes', quantity: '5.000' },
      { storageLocationId: 'loc-seed-dry', storageLocationName: 'Bodega de Secos', quantity: '5.000' },
    ],
  },
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

    const originSelect = await screen.findByLabelText(/Sector de Bodega Origen/i);
    await waitFor(() => expect((originSelect as HTMLSelectElement).value).toBe('loc-seed-meat-fridge'));
    // el área de cocina no debe aparecer como opción de ORIGEN (solo en el destino)
    expect(within(originSelect).queryByRole('option', { name: 'Refrigerador Cocina' })).not.toBeInTheDocument();
    // TK-102-FE: sí aparece como opción de DESTINO en cocina
    const destSelect = await screen.findByLabelText(/Ubicación Destino en Cocina/i);
    expect(within(destSelect).getByRole('option', { name: 'Refrigerador Cocina' })).toBeInTheDocument();
  });

  it('envía fromStorageLocationId en el POST /stock/extraction', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) {
          return { ok: true, status: 200, json: async () => [{ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true }, { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true }] };
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

  it('TK-103-FE (US-027): modo RECIPE exige receta y envía plannedPortions + recipeId', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/kitchen/recipe-preparations')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [{ id: 'rec-pizza', name: 'Pizza Margarita', category: 'Pizzas', ingredients: [] }] };
        if (url.includes('/locations')) {
          return { ok: true, status: 200, json: async () => [
            { id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true },
            { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true },
          ] };
        }
        if (url.includes('/stock/insumos')) return { ok: true, status: 200, json: async () => INSUMOS_FIXTURE };
        if (url.includes('/stock/extraction')) {
          capturedBody = JSON.parse(init?.body as string);
          return { ok: true, status: 201, json: async () => ({
            remanenteId: 'rem-x', recipePreparationId: 'prep-1', insumoId: 'ins-1', insumoName: 'Queso Mozzarella',
            quantityExtracted: '1.000', fromStorageLocationId: 'loc-seed-dry', remainingSectorStock: '9.000',
            remainingWarehouseStock: '9.000', location: 'Mesa de Preparación', expirationDate: new Date().toISOString(), status: 'ACTIVE',
          }) };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    const onSuccess = vi.fn();
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => expect((screen.getByLabelText(/Sector de Bodega Origen/i) as HTMLSelectElement).value).toBe('loc-seed-dry'));
    fireEvent.change(screen.getByLabelText(/Propósito \/ Motivo/i), { target: { value: 'RECIPE' } });

    // sin receta seleccionada → el submit se bloquea con validación de cliente
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));
    expect(await screen.findByText(/seleccionar la receta que va a preparar/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    fireEvent.change(await screen.findByLabelText(/Seleccionar Receta Destino/i), { target: { value: 'rec-pizza' } });
    fireEvent.change(screen.getByLabelText(/Porciones Planificadas/i), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(capturedBody).toMatchObject({ purpose: 'RECIPE', recipeId: 'rec-pizza', plannedPortions: 6 });
  });

  it('TK-102-FE (US-026): envía toStorageLocationId con el id del área de cocina elegida del catálogo', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              { id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true },
              { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true },
              { id: 'loc-seed-kitchen-line', name: 'Línea de Servicio', type: 'KITCHEN', isActive: true },
            ],
          };
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
              location: 'Línea de Servicio', expirationDate: new Date().toISOString(), status: 'ACTIVE',
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    const onSuccess = vi.fn();
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    const dest = (await screen.findByLabelText(/Ubicación Destino en Cocina/i)) as HTMLSelectElement;
    await waitFor(() => expect(dest.value).toBe('loc-seed-kitchen-prep')); // auto-selecciona la primera
    fireEvent.change(dest, { target: { value: 'loc-seed-kitchen-line' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(capturedBody).toMatchObject({ toStorageLocationId: 'loc-seed-kitchen-line' });
    expect(capturedBody).not.toHaveProperty('toLocation');
  });
});

describe('TK-119-FE: WarehouseExtractionModal — escaneo de código de barras (US-032)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockScanResult = undefined;
  });

  it('escaneo con match preselecciona el insumo en el formulario (match local contra el catálogo ya cargado, sin llamada de red adicional)', async () => {
    stubFetchForExtractionModal({});

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    fireEvent.click(await screen.findByRole('button', { name: /Escanear Código de Barras/i }));
    await act(async () => {
      mockScanResult?.('7791234567890');
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/Seleccionar Insumo de Bodega/i) as HTMLSelectElement).value).toBe('ins-2');
    });
  });

  it('escaneo sin match muestra ErrorBanner no bloqueante y el selector manual sigue disponible', async () => {
    stubFetchForExtractionModal({});

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    fireEvent.click(await screen.findByRole('button', { name: /Escanear Código de Barras/i }));
    await act(async () => {
      mockScanResult?.('0000000000000');
    });

    expect(await screen.findByText(/código no encontrado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seleccionar Insumo de Bodega/i)).toBeInTheDocument();
  });
});

describe('TK-100-FE (AUDIT-DEV-006): errores reales del backend y aritmética decimal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('F-5: un 422 del backend se muestra en el ErrorBanner — no un éxito falso, no cierra, no onSuccess', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) {
          return { ok: true, status: 200, json: async () => [{ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true }, { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true }] };
        }
        if (url.includes('/stock/insumos')) return { ok: true, status: 200, json: async () => INSUMOS_FIXTURE };
        if (url.includes('/stock/extraction')) {
          return {
            ok: false,
            status: 422,
            json: async () => ({
              type: 'https://restostock.com/errors/insufficient-stock',
              title: 'InsufficientStockException',
              status: 422,
              detail: 'Stock insuficiente para el insumo Queso Mozzarella. Solicitado: 999.000, Disponible: 10.000.',
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    render(<WarehouseExtractionModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sector de Bodega Origen/i) as HTMLSelectElement).value).toBe('loc-seed-dry');
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));

    expect(await screen.findByText(/[Ss]tock insuficiente/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('F-5: si falla la carga de insumos, muestra error con Reintentar y NO renderiza el formulario', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/stock/insumos')) {
          return { ok: false, status: 500, json: async () => ({ title: 'InternalServerError', status: 500, detail: 'boom' }) };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );

    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    expect(await screen.findByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar Extracción/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Seleccionar Insumo de Bodega/i)).not.toBeInTheDocument();
  });

  it('F-6: el stepper suma en decimal exacto (1.0 +0.5 ×3 = 2.5, sin 2.4999…)', async () => {
    stubFetchForExtractionModal({});
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    const qtyInput = (await screen.findByLabelText(/Cantidad a Extraer/i)) as HTMLInputElement;
    expect(qtyInput.value).toBe('1');

    const incBtn = document.getElementById('btn-increment-qty') as HTMLButtonElement;
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    expect(qtyInput.value).toBe('2.5');
  });

  it('bugfix: el insumo tiene stock total pero NO en el sector de origen elegido — bloquea con mensaje claro, sin llamar a la red', async () => {
    // Reproduce el caso reportado: "leche" con 10 L en Cámara de Congelados (no listada
    // como origen aquí) y 0 L en Bodega de Secos (el sector auto-seleccionado). El
    // dropdown de insumo mostraba "Stock Bodega: 10 L" sin indicar que ese sector no
    // tenía nada, y el operario solo se enteraba tras un 422 confuso al confirmar.
    let extractionCalled = false;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/kitchen/remanentes-activos')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/recipes')) return { ok: true, status: 200, json: async () => [] };
        if (url.includes('/locations')) {
          return { ok: true, status: 200, json: async () => [{ id: 'loc-seed-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true }, { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true }] };
        }
        if (url.includes('/stock/insumos')) {
          return {
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 'ins-leche',
                name: 'leche',
                unitOfMeasure: 'L',
                warehouseStock: '10.000',
                stockByLocation: [{ storageLocationId: 'loc-seed-freezer', storageLocationName: 'Cámara de Congelados', quantity: '10.000' }],
              },
            ],
          };
        }
        if (url.includes('/stock/extraction')) {
          extractionCalled = true;
          return { ok: true, status: 201, json: async () => ({}) };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      })
    );
    const onSuccess = vi.fn();
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Sector de Bodega Origen/i) as HTMLSelectElement).value).toBe('loc-seed-dry');
    });
    // el aviso bajo el selector de sector ya deja ver que ahí no hay nada, antes de intentar
    expect(await screen.findByText(/Disponible en este sector: 0\.000 L/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));

    expect(await screen.findByText(/Stock insuficiente en este sector/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(extractionCalled).toBe(false);
  });

  it('F-6: escribir 0 en la cantidad no se auto-corrige a 0.5 y el submit lo rechaza', async () => {
    stubFetchForExtractionModal({});
    const onSuccess = vi.fn();
    render(<WarehouseExtractionModal isOpen={true} onClose={() => {}} onSuccess={onSuccess} />);

    const qtyInput = (await screen.findByLabelText(/Cantidad a Extraer/i)) as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: '0' } });
    expect(qtyInput.value).toBe('0');

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Extracción/i }));
    expect(await screen.findByText(/cantidad a extraer debe ser mayor que cero/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
