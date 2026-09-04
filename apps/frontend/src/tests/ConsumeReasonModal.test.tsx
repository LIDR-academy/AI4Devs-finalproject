import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsumeReasonModal } from '../features/kitchen/components/ConsumeReasonModal.js';
import type { RemanenteFEFOItem } from '../features/kitchen/services/kitchen.service.js';

const remanente: RemanenteFEFOItem = {
  id: 'rem-1',
  insumoId: 'ins-1',
  insumoName: 'Salsa de Tomate',
  unitOfMeasure: 'KG',
  currentQuantity: '1.750',
  initialQuantity: '2.000',
  location: 'KITCHEN_FRIDGE',
  expirationDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  hoursRemaining: 12,
  isCriticalAlert: false,
  status: 'ACTIVE',
};

const REASONS = [
  { id: 'reason-1', label: 'Preparación de plato', isActive: true },
  { id: 'reason-2', label: 'Cortesía a cliente', isActive: true },
];

describe('TK-108-FE: ConsumeReasonModal Component Suite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sin motivo elegido, el submit se bloquea con ErrorBanner (sin POST, sin popup nativo)', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return { ok: true, status: 200, json: async () => REASONS };
      }
      throw new Error('No debería llamar al backend sin motivo elegido');
    });
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();

    render(<ConsumeReasonModal target={{ remanente, quantity: 0.25 }} onClose={vi.fn()} onSuccess={onSuccess} />);

    await waitFor(() => expect(screen.getByText('Preparación de plato')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Consumo/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Debe seleccionar el motivo del consumo/i);
    });
    expect(onSuccess).not.toHaveBeenCalled();
    // El <select> no lleva `required` nativo (Guard 38) — la validación es del componente.
    expect(screen.getByLabelText(/Motivo del Consumo/i)).not.toBeRequired();
  });

  it('con motivo elegido, envía reasonId + notes correctamente', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return { ok: true, status: 200, json: async () => REASONS };
      }
      expect(url).toContain('/kitchen/remanentes/rem-1/consume');
      const body = JSON.parse(init.body as string);
      expect(body).toMatchObject({ quantity: 0.25, reasonId: 'reason-2', notes: 'Se sirvió de más en la mesa 4' });
      return { ok: true, status: 200, json: async () => ({ remanenteId: 'rem-1', consumedQuantity: '0.250', remainingQuantity: '1.500', status: 'ACTIVE', isExhausted: false }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<ConsumeReasonModal target={{ remanente, quantity: 0.25 }} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => expect(screen.getByText('Cortesía a cliente')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Motivo del Consumo/i), { target: { value: 'reason-2' } });
    fireEvent.change(screen.getByLabelText(/Notas/i), { target: { value: 'Se sirvió de más en la mesa 4' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Consumo/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('null target no renderiza nada', () => {
    const { container } = render(<ConsumeReasonModal target={null} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
