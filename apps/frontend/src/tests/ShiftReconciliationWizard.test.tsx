import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShiftReconciliationWizard } from '../features/kitchen/components/ShiftReconciliationWizard.js';

describe('TK-007-D: ShiftReconciliationWizard Component Suite', () => {
  beforeEach(() => {
    // ADR-004 / TK-109-FE: el wizard carga el catálogo activo de motivos al abrirse.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ id: 'reason-1', label: 'Error de manipulación', isActive: true }],
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockRemanentes = [
    {
      id: 'rem-1',
      insumoId: 'ins-1',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      currentQuantity: '1.0000',
      initialQuantity: '1.0000',
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date().toISOString(),
      hoursRemaining: 12,
      isCriticalAlert: true,
      status: 'ACTIVE',
    },
  ];

  it('debe permitir enviar la reconciliacion sin bloqueo si la varianza es menor al 50%', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <ShiftReconciliationWizard
        isOpen={true}
        remanentes={mockRemanentes}
        operatorId="user-op-1"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    await act(async () => {}); // deja resolver la carga del catálogo de motivos (irrelevante aquí, varianza=0)
    const submitBtn = screen.getByRole('button', { name: /Enviar Conciliación de Turno/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('debe bloquear el envio y mostrar alerta si la varianza supera el 50% hasta marcar el checkbox de autorizacion Y elegir motivo (ADR-004)', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <ShiftReconciliationWizard
        isOpen={true}
        remanentes={mockRemanentes}
        operatorId="user-op-1"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const inputPhys = screen.getByDisplayValue('1');
    fireEvent.change(inputPhys, { target: { value: '0.3' } }); // Varianza = -70% (negativa, critica)

    expect(screen.getByText(/Alerta de Varianza Crítica Mayor al 50%/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Enviar Conciliación de Turno/i });
    expect(submitBtn).toBeDisabled();

    const authCheckbox = screen.getByRole('checkbox', { name: /Autorizar diferencia crítica/i });
    fireEvent.click(authCheckbox);

    // Autorizar la varianza crítica no basta: sigue bloqueado hasta elegir el motivo
    // de la varianza negativa (ADR-004 / TK-109-FE).
    expect(submitBtn).toBeDisabled();

    await waitFor(() => expect(screen.getByText('Error de manipulación')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Motivo de la Varianza Negativa/i), { target: { value: 'reason-1' } });

    expect(submitBtn).not.toBeDisabled();
  });

  it('varianza negativa no critica tambien exige motivo antes de habilitar el envio (ADR-004)', async () => {
    render(
      <ShiftReconciliationWizard
        isOpen={true}
        remanentes={mockRemanentes}
        operatorId="user-op-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const inputPhys = screen.getByDisplayValue('1');
    fireEvent.change(inputPhys, { target: { value: '0.8' } }); // Varianza = -20% (negativa, no critica)

    const submitBtn = screen.getByRole('button', { name: /Enviar Conciliación de Turno/i });
    expect(submitBtn).toBeDisabled();

    await waitFor(() => expect(screen.getByText('Error de manipulación')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Motivo de la Varianza Negativa/i), { target: { value: 'reason-1' } });

    expect(submitBtn).not.toBeDisabled();
  });

  it('varianza positiva no exige motivo — no muestra el selector', async () => {
    render(
      <ShiftReconciliationWizard
        isOpen={true}
        remanentes={mockRemanentes}
        operatorId="user-op-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const inputPhys = screen.getByDisplayValue('1');
    fireEvent.change(inputPhys, { target: { value: '1.2' } }); // Varianza = +0.2 (positiva)
    await act(async () => {}); // deja resolver la carga del catálogo de motivos (irrelevante aquí)

    expect(screen.queryByLabelText(/Motivo de la Varianza Negativa/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar Conciliación de Turno/i })).not.toBeDisabled();
  });

  it('con motivo elegido, el payload enviado incluye el reasonId de la línea negativa', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') {
        return { ok: true, status: 200, json: async () => [{ id: 'reason-1', label: 'Error de manipulación', isActive: true }] };
      }
      const body = JSON.parse(init.body as string);
      expect(body.items[0]).toMatchObject({ remanenteId: 'rem-1', physicalQuantity: 0.3, reasonId: 'reason-1' });
      return { ok: true, status: 201, json: async () => ({ reconciliationId: 'recon-1', autoDiscardedCount: 0, processedItemsCount: 1, items: [] }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const handleSuccess = vi.fn();

    render(
      <ShiftReconciliationWizard
        isOpen={true}
        remanentes={mockRemanentes}
        operatorId="user-op-1"
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    );

    fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '0.3' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Autorizar diferencia crítica/i }));
    await waitFor(() => expect(screen.getByText('Error de manipulación')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Motivo de la Varianza Negativa/i), { target: { value: 'reason-1' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar Conciliación de Turno/i }));

    await waitFor(() => expect(handleSuccess).toHaveBeenCalled());
  });
});
