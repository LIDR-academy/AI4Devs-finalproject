import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShiftReconciliationWizard } from '../features/kitchen/components/ShiftReconciliationWizard.js';

describe('TK-007-D: ShiftReconciliationWizard Component Suite', () => {
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

  it('debe permitir enviar la reconciliacion sin bloqueo si la varianza es menor al 50%', () => {
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

    const submitBtn = screen.getByRole('button', { name: /Enviar Conciliación de Turno/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('debe bloquear el envio y mostrar alerta si la varianza supera el 50% hasta marcar el checkbox de autorizacion', () => {
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
    fireEvent.change(inputPhys, { target: { value: '0.3' } }); // Varianza = 70% desvio

    expect(screen.getByText(/Alerta de Varianza Crítica Mayor al 50%/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Enviar Conciliación de Turno/i });
    expect(submitBtn).toBeDisabled();

    const authCheckbox = screen.getByRole('checkbox', { name: /Autorizar diferencia crítica/i });
    fireEvent.click(authCheckbox);

    expect(submitBtn).not.toBeDisabled();
  });
});
