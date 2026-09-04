import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeSelectorModal } from '../features/kitchen/components/RecipeSelectorModal.js';

// TK-111-FE (US-007 v1.1.0): vista previa de disponibilidad por ingrediente en el modal
// "Preparar Receta" — DoD: sin stock suficiente bloquea el envío; con stock suficiente lo
// habilita; cambiar porciones vuelve a consultar y puede habilitar/deshabilitar.
describe('TK-111-FE: RecipeSelectorModal — vista previa de disponibilidad de ingredientes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const RECIPE = { id: 'rec-cafe', name: 'Café con Leche', category: 'Bebidas', ingredients: [{ insumoId: 'ins-leche', quantity: '0.100' }] };
  const INSUMO = { id: 'ins-leche', name: 'Leche', unitOfMeasure: 'L', warehouseStock: '0' };

  function stubFetch(availabilityByPortions: (portions: number) => { isSufficient: boolean; availableQuantity: string; requiredQuantity: string }) {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/recipes')) {
        return { ok: true, status: 200, json: async () => [RECIPE] };
      }
      if (url.includes('/stock/insumos')) {
        return { ok: true, status: 200, json: async () => [INSUMO] };
      }
      if (url.includes('/availability')) {
        const portionsMatch = url.match(/portions=(\d+)/);
        const portions = portionsMatch ? Number(portionsMatch[1]) : 1;
        const ing = availabilityByPortions(portions);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            recipeId: 'rec-cafe',
            recipeName: 'Café con Leche',
            portions,
            ingredients: [{ insumoId: 'ins-leche', insumoName: 'Leche', unitOfMeasure: 'L', requiredQuantity: ing.requiredQuantity, availableQuantity: ing.availableQuantity, isSufficient: ing.isSufficient }],
            isFullyAvailable: ing.isSufficient,
          }),
        };
      }
      return { ok: true, status: 200, json: async () => [] };
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('ingrediente insuficiente: se marca visualmente y "Confirmar Preparación" queda deshabilitado', async () => {
    stubFetch(() => ({ isSufficient: false, requiredQuantity: '0.100', availableQuantity: '0.050' }));

    render(<RecipeSelectorModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/0.100 \/ 0.050 L/)).toBeInTheDocument());

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Preparación/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('todos los ingredientes suficientes: "Confirmar Preparación" queda habilitado', async () => {
    stubFetch(() => ({ isSufficient: true, requiredQuantity: '0.100', availableQuantity: '0.500' }));

    render(<RecipeSelectorModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/0.100 \/ 0.500 L/)).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /Confirmar Preparación/i })).not.toBeDisabled();
  });

  it('cambiar porciones vuelve a consultar disponibilidad y puede pasar de habilitado a deshabilitado', async () => {
    // Con 1 porción alcanza (0.100 requerido / 0.150 disponible); con 2 porciones ya no (0.200 / 0.150).
    stubFetch((portions) => ({
      isSufficient: portions === 1,
      requiredQuantity: (0.1 * portions).toFixed(3),
      availableQuantity: '0.150',
    }));

    render(<RecipeSelectorModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/0.100 \/ 0.150 L/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Confirmar Preparación/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '+' }));

    await waitFor(() => expect(screen.getByText(/0.200 \/ 0.150 L/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Confirmar Preparación/i })).toBeDisabled();
  });
});
