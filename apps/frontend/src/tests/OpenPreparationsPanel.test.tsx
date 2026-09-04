import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { OpenPreparationsPanel } from '../features/kitchen/components/OpenPreparationsPanel.js';

const OPEN_PREP = {
  id: 'prep-1',
  recipeId: 'rec-pizza',
  plannedPortions: 6,
  actualPortions: null,
  status: 'OPEN' as const,
  openedByOperatorId: 'op-1',
  openedAt: new Date('2026-09-04T10:00:00Z').toISOString(),
  closedByOperatorId: null,
  closedAt: null,
  notes: null,
};

const PREP_DETAIL = {
  ...OPEN_PREP,
  remanentes: [
    {
      id: 'rem-1',
      insumoId: 'ins-1',
      insumoName: 'Queso Mozzarella',
      currentQuantity: '2.000',
      initialQuantity: '2.000',
      storageLocationId: 'loc-prep',
      storageLocationName: 'Mesa de Preparación',
      isPristine: true,
      status: 'ACTIVE',
    },
  ],
};

const LOCATIONS = [
  { id: 'loc-prep', name: 'Mesa de Preparación', type: 'KITCHEN', isActive: true },
  { id: 'loc-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true },
];

function stubFetch(opts: {
  preparations?: unknown[];
  onAbandon?: () => void;
  onClose?: (body: Record<string, unknown>) => void;
} = {}) {
  let preparations = opts.preparations ?? [OPEN_PREP];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/abandon')) {
        opts.onAbandon?.();
        preparations = preparations.filter((p) => (p as { id: string }).id !== 'prep-1');
        return { ok: true, status: 200, json: async () => ({ id: 'prep-1', status: 'ABANDONED', unlinkedRemanentes: 1, closedAt: new Date().toISOString() }) };
      }
      if (url.includes('/close')) {
        opts.onClose?.(JSON.parse((init?.body as string) ?? '{}'));
        return { ok: true, status: 200, json: async () => ({ id: 'prep-1', recipeId: 'rec-pizza', status: 'CLOSED', actualPortions: 6, closedByOperatorId: null, closedAt: new Date().toISOString(), items: [] }) };
      }
      if (url.match(/\/kitchen\/recipe-preparations\/prep-1$/)) {
        return { ok: true, status: 200, json: async () => PREP_DETAIL };
      }
      if (url.includes('/kitchen/recipe-preparations')) {
        return { ok: true, status: 200, json: async () => preparations };
      }
      if (url.includes('/locations')) {
        return { ok: true, status: 200, json: async () => LOCATIONS };
      }
      if (url.includes('/recipes')) {
        return { ok: true, status: 200, json: async () => [{ id: 'rec-pizza', name: 'Pizza Margarita', category: 'Pizzas', ingredients: [] }] };
      }
      if (url.includes('/stock/insumos')) {
        return { ok: true, status: 200, json: async () => [] };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    })
  );
}

describe('TK-103-FE / TK-104-FE (US-027 / US-028): OpenPreparationsPanel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('se auto-oculta cuando no hay preparaciones abiertas', async () => {
    stubFetch({ preparations: [] });
    const { container } = render(<OpenPreparationsPanel />);
    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });

  it('lista las preparaciones abiertas resolviendo el nombre de la receta', async () => {
    stubFetch();
    render(<OpenPreparationsPanel />);
    expect(await screen.findByText(/Pizza Margarita/)).toBeInTheDocument();
    expect(screen.getByText(/6 porciones planificadas/)).toBeInTheDocument();
  });

  it('el botón "Cerrar preparación" abre el modal de cierre con el detalle cargado', async () => {
    stubFetch();
    render(<OpenPreparationsPanel />);
    const btn = await screen.findByRole('button', { name: /Cerrar preparación/i });
    fireEvent.click(btn);

    expect(await screen.findByText(/Cerrar Preparación — Pizza Margarita/i)).toBeInTheDocument();
    expect(await screen.findByText(/Queso Mozzarella/i)).toBeInTheDocument();
    expect(screen.getByText(/Extraído: 2.000/i)).toBeInTheDocument();
  });

  it('el botón "Abandonar" pide confirmación inline (sin window.confirm nativo) y al confirmar llama abandon + recarga', async () => {
    const onAbandon = vi.fn();
    stubFetch({ onAbandon });
    render(<OpenPreparationsPanel />);

    fireEvent.click(await screen.findByRole('button', { name: /^Abandonar$/i }));

    expect(await screen.findByText(/¿Confirmas abandonar la preparación de "Pizza Margarita"/i)).toBeInTheDocument();

    // 2 botones "Abandonar": el de la fila y el de confirmación del diálogo inline (Guard 38).
    const abandonButtons = screen.getAllByRole('button', { name: /^Abandonar$/i });
    expect(abandonButtons).toHaveLength(2);
    fireEvent.click(abandonButtons[1]);

    await waitFor(() => expect(onAbandon).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.queryByText(/Pizza Margarita/)).not.toBeInTheDocument();
    });
  });
});
