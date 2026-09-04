import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventarioRoute } from '../app/routes/InventarioRoute.js';
import { AppShellCtx } from '../app/session.js';

// TK-112-FE (US-026): las pestañas de filtro por área de cocina dejaron de coincidir
// con los remanentes reales — confirmado contra la base real, `Remanente.location`
// guarda el nombre del área (no el literal KITCHEN_FRIDGE/PREP/LINE) desde que
// TK-102-FE volvió dinámico el destino de la extracción.
describe('TK-112-FE: LocationFilterTabs / InventarioRoute — filtro por área de cocina real', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Misma forma exacta que la confirmada en vivo (docker exec ... SELECT location, "storageLocationId" FROM "Remanente").
  const REMANENTES = [
    { id: 'rem-1', insumoId: 'ins-1', insumoName: 'Salsa', unitOfMeasure: 'KG', currentQuantity: '1.000', initialQuantity: '1.000', location: 'Refrigerador Principal Cocina', storageLocationId: 'loc-seed-kitchen-fridge', expirationDate: new Date(Date.now() + 86400000).toISOString(), hoursRemaining: 24, isCriticalAlert: false, status: 'ACTIVE' },
    { id: 'rem-2', insumoId: 'ins-2', insumoName: 'Masa', unitOfMeasure: 'UNITS', currentQuantity: '5.000', initialQuantity: '5.000', location: 'Mesa de Preparación', storageLocationId: 'loc-seed-kitchen-prep', expirationDate: new Date(Date.now() + 86400000).toISOString(), hoursRemaining: 24, isCriticalAlert: false, status: 'ACTIVE' },
  ];
  const KITCHEN_AREAS = [
    { id: 'loc-seed-kitchen-fridge', name: 'Refrigerador Principal Cocina', type: 'KITCHEN', isActive: true },
    { id: 'loc-seed-kitchen-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true },
  ];

  function renderBoard() {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/remanentes-activos')) {
        return { ok: true, status: 200, json: async () => REMANENTES };
      }
      if (url.includes('/locations')) {
        return { ok: true, status: 200, json: async () => KITCHEN_AREAS };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    vi.stubGlobal('fetch', fetchMock);

    return render(
      <AppShellCtx.Provider value={{ currentUser: { id: 'u1', name: 'Operario', role: 'KITCHEN_STAFF' }, onLogout: vi.fn(), reloadUser: vi.fn() }}>
        <InventarioRoute />
      </AppShellCtx.Provider>
    );
  }

  it('muestra una pestaña por área de cocina real (no los literales KITCHEN_FRIDGE/PREP/LINE)', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refrigerador Principal Cocina/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Mesa de Preparación/i })).toBeInTheDocument();
    // El literal legado nunca debe aparecer como texto de pestaña.
    expect(screen.queryByText('KITCHEN_FRIDGE')).not.toBeInTheDocument();
  });

  it('el conteo de cada pestaña refleja los remanentes reales de esa área (bug confirmado: antes siempre daba 0)', async () => {
    renderBoard();

    const fridgeTab = await screen.findByRole('button', { name: /Refrigerador Principal Cocina/i });
    expect(fridgeTab).toHaveTextContent('1'); // 1 remanente en esa área

    const prepTab = screen.getByRole('button', { name: /Mesa de Preparación/i });
    expect(prepTab).toHaveTextContent('1');
  });

  it('al hacer clic en la pestaña de un área, filtra la lista a solo esa área', async () => {
    renderBoard();

    await waitFor(() => expect(screen.getByText('Salsa')).toBeInTheDocument());
    expect(screen.getByText('Masa')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: /Refrigerador Principal Cocina/i }));

    await waitFor(() => {
      expect(screen.getByText('Salsa')).toBeInTheDocument();
      expect(screen.queryByText('Masa')).not.toBeInTheDocument();
    });
  });
});
