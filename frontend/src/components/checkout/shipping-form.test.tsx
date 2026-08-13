import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShippingForm } from './shipping-form';
import type { ShippingData } from '../../types/checkout';

describe('ShippingForm', () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los 7 campos del formulario', () => {
    render(<ShippingForm onSubmit={onSubmit} />);
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/país/i)).toBeInTheDocument();
  });

  it('muestra error en nombre cuando está vacío al enviar', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/el nombre completo es obligatorio/i)).toBeInTheDocument();
  });

  it('muestra error en email cuando está vacío al enviar', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/el email es obligatorio/i)).toBeInTheDocument();
  });

  it('muestra error en email con formato inválido', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/email/i), 'no-es-un-email');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/introduce un email válido/i)).toBeInTheDocument();
  });

  it('no muestra error en teléfono cuando está vacío', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle Mayor 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    // phone is optional — no error for it
    expect(screen.queryByText(/teléfono.*obligatorio/i)).not.toBeInTheDocument();
  });

  it('no llama a onSubmit cuando hay errores de validación', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con ShippingData correcta cuando el formulario es válido', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/teléfono/i), '600123456');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle Mayor 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');

    // País has a default value 'España' — clear and re-type
    const countryInput = screen.getByLabelText(/país/i);
    await user.clear(countryInput);
    await user.type(countryInput, 'España');

    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const arg = onSubmit.mock.calls[0][0] as ShippingData;
    expect(arg.name).toBe('Ana Pérez');
    expect(arg.email).toBe('ana@test.com');
    expect(arg.phone).toBe('600123456');
    expect(arg.address).toBe('Calle Mayor 1');
    expect(arg.city).toBe('Madrid');
    expect(arg.postalCode).toBe('28001');
    expect(arg.country).toBe('España');
  });

  it('pre-rellena los campos cuando se pasa initialData', () => {
    const initialData: ShippingData = {
      name: 'Carlos López',
      email: 'carlos@test.com',
      address: 'Diagonal 200',
      city: 'Barcelona',
      postalCode: '08002',
      country: 'España',
    };
    render(<ShippingForm onSubmit={onSubmit} initialData={initialData} />);
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Carlos López');
    expect(screen.getByLabelText(/email/i)).toHaveValue('carlos@test.com');
    expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Barcelona');
  });

  // SEC-009-02: validación de formato de teléfono
  it('muestra error cuando el teléfono contiene caracteres no válidos', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/teléfono/i), 'no-es-telefono!!!');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/introduce un número de teléfono válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('acepta teléfonos en formato internacional válido', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/teléfono/i), '+34 600 123 456');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.queryByText(/teléfono válido/i)).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // SEC-009-02: validación de formato de código postal
  it('muestra error cuando el código postal contiene letras (xsdfsdf)', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), 'xsdfsdf');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/introduce un código postal válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra error cuando el código postal contiene caracteres especiales', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '2800!');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/introduce un código postal válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('muestra error cuando el código postal es demasiado corto', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '123');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.getByText(/introduce un código postal válido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('acepta código postal español válido (5 dígitos)', async () => {
    const user = userEvent.setup();
    render(<ShippingForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    expect(screen.queryByText(/código postal válido/i)).not.toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
