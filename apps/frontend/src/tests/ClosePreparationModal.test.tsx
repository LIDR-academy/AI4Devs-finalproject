import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { ClosePreparationModal } from '../features/kitchen/components/ClosePreparationModal.js';

const LOCATIONS = [
  { id: 'loc-fridge', name: 'Heladera Principal', type: 'KITCHEN', isActive: true },
  { id: 'loc-dry', name: 'Bodega de Secos', type: 'WAREHOUSE', isActive: true },
];

function detailWith(remanentes: Record<string, unknown>[]) {
  return {
    id: 'prep-1',
    recipeId: 'rec-pizza',
    plannedPortions: 8,
    actualPortions: null,
    status: 'OPEN',
    openedByOperatorId: 'op-1',
    openedAt: new Date().toISOString(),
    closedByOperatorId: null,
    closedAt: null,
    notes: null,
    remanentes,
  };
}

function stubFetch(opts: {
  remanentes: Record<string, unknown>[];
  closeResponse?: { ok: boolean; status: number; body: unknown };
  captureCloseBody?: (body: Record<string, unknown>) => void;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/close')) {
        opts.captureCloseBody?.(JSON.parse((init?.body as string) ?? '{}'));
        const resp = opts.closeResponse ?? { ok: true, status: 200, body: { id: 'prep-1', status: 'CLOSED' } };
        return { ok: resp.ok, status: resp.status, json: async () => resp.body };
      }
      if (url.includes('/kitchen/recipe-preparations/prep-1')) {
        return { ok: true, status: 200, json: async () => detailWith(opts.remanentes) };
      }
      if (url.includes('/locations')) {
        return { ok: true, status: 200, json: async () => LOCATIONS };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    })
  );
}

const MOZZARELLA = {
  id: 'rem-1',
  insumoId: 'ins-1',
  insumoName: 'Queso Mozzarella',
  currentQuantity: '2.000',
  initialQuantity: '2.000',
  storageLocationId: 'loc-fridge',
  storageLocationName: 'Heladera Principal',
  isPristine: true,
  status: 'ACTIVE',
};

describe('ClosePreparationModal (US-028 / TK-104-FE)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no renderiza nada si preparationId es null', () => {
    const { container } = render(
      <ClosePreparationModal preparationId={null} recipeName="Pizza" onClose={() => {}} onReconciled={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('el cuadre inválido (sobrante + merma > extraído) bloquea el submit y no llama a close()', async () => {
    const captureCloseBody = vi.fn();
    stubFetch({ remanentes: [MOZZARELLA], captureCloseBody });
    const onReconciled = vi.fn();
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={() => {}} onReconciled={onReconciled} />);

    fireEvent.change(await screen.findByLabelText(/Sobrante:/i), { target: { value: '1.8' } });
    fireEvent.change(screen.getByLabelText(/^Merma:/i), { target: { value: '0.5' } });
    expect(await screen.findByText(/no cuadra con lo extraído/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Preparación/i }));
    expect(await screen.findByText(/superan lo extraído/i)).toBeInTheDocument();
    expect(captureCloseBody).not.toHaveBeenCalled();
    expect(onReconciled).not.toHaveBeenCalled();
  });

  it('merma > 0 sin motivo bloquea el submit', async () => {
    const captureCloseBody = vi.fn();
    stubFetch({ remanentes: [MOZZARELLA], captureCloseBody });
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={() => {}} onReconciled={() => {}} />);

    fireEvent.change(await screen.findByLabelText(/^Merma:/i), { target: { value: '0.2' } });
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Preparación/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/motivo de la merma/i);
    expect(captureCloseBody).not.toHaveBeenCalled();
  });

  it('"devolver a bodega" solo aparece en el desplegable si isPristine — con motivo no exige nada extra', async () => {
    const notPristine = { ...MOZZARELLA, id: 'rem-2', insumoId: 'ins-2', insumoName: 'Aceite de Oliva', isPristine: false };
    stubFetch({ remanentes: [MOZZARELLA, notPristine] });
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={() => {}} onReconciled={() => {}} />);

    await screen.findByText('Queso Mozzarella');
    const selects = (await screen.findAllByLabelText(/¿Dónde queda\?/i)) as HTMLSelectElement[];
    // Mozzarella (isPristine) sí ofrece Bodega de Secos
    expect(within(selects[0]).getByRole('option', { name: 'Bodega de Secos' })).toBeInTheDocument();
    // Aceite de Oliva (no intacto) NO ofrece devolver a bodega
    expect(within(selects[1]).queryByRole('option', { name: 'Bodega de Secos' })).not.toBeInTheDocument();
    // el checkbox "envase sin abrir" solo se ofrece para el remanente intacto (Mozzarella)
    expect(screen.getAllByLabelText(/envase sin abrir/i)).toHaveLength(1);
  });

  it('devolver a bodega sin marcar "envase sin abrir" bloquea el submit (espejo cliente del 422)', async () => {
    stubFetch({ remanentes: [MOZZARELLA] });
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={() => {}} onReconciled={() => {}} />);

    fireEvent.change(await screen.findByLabelText(/Sobrante:/i), { target: { value: '2.0' } });
    fireEvent.change(screen.getByLabelText(/¿Dónde queda\?/i), { target: { value: 'loc-dry' } });
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Preparación/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/envase sin abrir/i);
  });

  it('precisión Decimal exacta: extraído 0.30, sobrante 0.10, merma 0.10 → consumido 0.100 (sin deriva de float)', async () => {
    const item = { ...MOZZARELLA, currentQuantity: '0.300' };
    stubFetch({ remanentes: [item] });
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={() => {}} onReconciled={() => {}} />);

    fireEvent.change(await screen.findByLabelText(/Sobrante:/i), { target: { value: '0.10' } });
    fireEvent.change(screen.getByLabelText(/^Merma:/i), { target: { value: '0.10' } });
    fireEvent.change(screen.getByLabelText(/Motivo de la merma/i), { target: { value: 'recorte' } });

    expect(await screen.findByText(/Consumido: 0\.100 · cuadra/i)).toBeInTheDocument();
  });

  it('cierre feliz: envía el payload correcto y llama onReconciled + onClose', async () => {
    const onClose = vi.fn();
    const onReconciled = vi.fn();
    const captureCloseBody = vi.fn();
    stubFetch({ remanentes: [MOZZARELLA], captureCloseBody });
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={onClose} onReconciled={onReconciled} />);

    fireEvent.change(await screen.findByLabelText(/Sobrante:/i), { target: { value: '0.300' } });
    fireEvent.change(screen.getByLabelText(/¿Dónde queda\?/i), { target: { value: 'loc-fridge' } });
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Preparación/i }));

    await waitFor(() => expect(onReconciled).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(captureCloseBody).toHaveBeenCalledWith({
      actualPortions: 8,
      items: [{ insumoId: 'ins-1', leftoverQty: '0.300', leftoverLocationId: 'loc-fridge', markedUnopened: false, wastedQty: '0' }],
    });
  });

  it('un 422 del backend se muestra traducido en el ErrorBanner y no cierra el modal', async () => {
    stubFetch({
      remanentes: [MOZZARELLA],
      closeResponse: {
        ok: false,
        status: 422,
        body: { type: 'about:blank', title: 'NonPristineReturnException', status: 422, detail: 'Solo un remanente intacto puede devolverse a bodega.' },
      },
    });
    const onClose = vi.fn();
    const onReconciled = vi.fn();
    render(<ClosePreparationModal preparationId="prep-1" recipeName="Pizza Margarita" onClose={onClose} onReconciled={onReconciled} />);

    fireEvent.change(await screen.findByLabelText(/Sobrante:/i), { target: { value: '0.300' } });
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Preparación/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/remanente intacto/i);
    expect(onClose).not.toHaveBeenCalled();
    expect(onReconciled).not.toHaveBeenCalled();
  });
});
