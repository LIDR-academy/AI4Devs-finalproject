import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { OpenPreparationsPanel } from '../features/kitchen/components/OpenPreparationsPanel.js';

function stubFetch(preparations: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/kitchen/recipe-preparations')) {
        return { ok: true, status: 200, json: async () => preparations };
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

describe('TK-103-FE (US-027): OpenPreparationsPanel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('se auto-oculta cuando no hay preparaciones abiertas', async () => {
    stubFetch([]);
    const { container } = render(<OpenPreparationsPanel />);
    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });

  it('lista las preparaciones abiertas resolviendo el nombre de la receta', async () => {
    stubFetch([OPEN_PREP]);
    render(<OpenPreparationsPanel />);
    expect(await screen.findByText(/Pizza Margarita/)).toBeInTheDocument();
    expect(screen.getByText(/6 porciones planificadas/)).toBeInTheDocument();
  });

  it('muestra el botón "Cerrar preparación" solo si se pasa onClosePreparation y lo invoca con el id', async () => {
    stubFetch([OPEN_PREP]);
    const onClose = vi.fn();
    render(<OpenPreparationsPanel onClosePreparation={onClose} />);
    const btn = await screen.findByRole('button', { name: /Cerrar preparación/i });
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledWith('prep-1');
  });

  it('sin onClosePreparation no renderiza el botón de cierre', async () => {
    stubFetch([OPEN_PREP]);
    render(<OpenPreparationsPanel />);
    await screen.findByText(/Pizza Margarita/);
    expect(screen.queryByRole('button', { name: /Cerrar preparación/i })).not.toBeInTheDocument();
  });
});
