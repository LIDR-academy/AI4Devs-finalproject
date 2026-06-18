import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentForm } from './payment-form';
import type { PaymentData } from '../../types/checkout';

describe('PaymentForm', () => {
  const onSubmit = vi.fn();
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los 4 campos del formulario de pago', () => {
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    expect(screen.getByLabelText(/número de tarjeta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre del titular/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it('muestra error en número de tarjeta cuando está vacío al confirmar', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(screen.getByText(/el número de tarjeta es obligatorio/i)).toBeInTheDocument();
  });

  it('muestra error en número de tarjeta con formato inválido', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.type(screen.getByLabelText(/número de tarjeta/i), '1234');
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(
      screen.getByText(/introduce un número de tarjeta válido de 16 dígitos/i)
    ).toBeInTheDocument();
  });

  it('muestra error en fecha de vencimiento con formato inválido', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.type(screen.getByLabelText(/fecha de vencimiento/i), '13/99');
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(
      screen.getByText(/introduce una fecha de vencimiento válida \(mm\/aa\)/i)
    ).toBeInTheDocument();
  });

  it('muestra error en CVV con formato inválido', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.type(screen.getByLabelText(/cvv/i), '12');
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(screen.getByText(/el cvv debe tener 3 dígitos/i)).toBeInTheDocument();
  });

  it('no llama a onSubmit cuando hay errores de validación', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con PaymentData correcto cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);

    await user.type(screen.getByLabelText(/número de tarjeta/i), '1234567890123456');
    await user.type(screen.getByLabelText(/nombre del titular/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/fecha de vencimiento/i), '12/28');
    await user.type(screen.getByLabelText(/cvv/i), '123');

    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const arg = onSubmit.mock.calls[0][0] as PaymentData;
    expect(arg.cardNumber).toBe('1234567890123456');
    expect(arg.cardName).toBe('Ana Pérez');
    expect(arg.cardExpiry).toBe('12/28');
    expect(arg.cardCVV).toBe('123');
  });

  it('llama a onBack al pulsar Volver sin validar el formulario', async () => {
    const user = userEvent.setup();
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /volver/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pre-rellena los campos cuando se pasa initialData', () => {
    const initialData: PaymentData = {
      cardNumber: '1234567890123456',
      cardName: 'Ana Pérez',
      cardExpiry: '12/28',
      cardCVV: '123',
    };
    render(<PaymentForm onSubmit={onSubmit} onBack={onBack} initialData={initialData} />);
    expect(screen.getByLabelText(/número de tarjeta/i)).toHaveValue('1234567890123456');
    expect(screen.getByLabelText(/nombre del titular/i)).toHaveValue('Ana Pérez');
    expect(screen.getByLabelText(/fecha de vencimiento/i)).toHaveValue('12/28');
    expect(screen.getByLabelText(/cvv/i)).toHaveValue('123');
  });
});
