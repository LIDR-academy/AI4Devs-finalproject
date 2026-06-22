import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { CartItemUI } from '../../types/cart';
import type { ShippingData } from '../../types/checkout';
import { OrderReview } from './order-review';

const shippingData: ShippingData = {
  name: 'Ana Corredora',
  email: 'ana@example.com',
  phone: '600123456',
  address: 'Calle Maratón 10',
  city: 'Madrid',
  postalCode: '28001',
  country: 'España',
};

const item1: CartItemUI = {
  productId: 'prod-1',
  productName: 'Nike Pegasus 41',
  productBrand: 'Nike',
  productPrice: 129.99,
  image: 'products/nike-pegasus.jpg',
  stock: 10,
  quantity: 2,
  size: '42',
  color: 'Negro',
};

const item2: CartItemUI = {
  productId: 'prod-2',
  productName: 'Salomon Speedcross 6',
  productBrand: 'Salomon',
  productPrice: 149.99,
  image: 'products/salomon.jpg',
  stock: 5,
  quantity: 1,
};

function baseProps() {
  return {
    shippingData,
    items: [item1, item2],
    subtotal: 409.97,
    shipping: 4.99,
    total: 414.96,
    isSubmitting: false,
    error: null as string | null,
    onConfirm: vi.fn(),
    onBack: vi.fn(),
  };
}

describe('OrderReview', () => {
  it('renderiza la dirección de envío', () => {
    render(<OrderReview {...baseProps()} />);
    expect(screen.getByText(shippingData.name)).toBeInTheDocument();
    expect(screen.getByText(shippingData.address)).toBeInTheDocument();
    expect(screen.getByText(shippingData.city)).toBeInTheDocument();
    expect(screen.getByText(shippingData.email)).toBeInTheDocument();
  });

  it('renderiza todos los artículos con su variante', () => {
    render(<OrderReview {...baseProps()} />);
    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    expect(screen.getByText(/Talla: 42/)).toBeInTheDocument();
    expect(screen.getByText(/Color: Negro/)).toBeInTheDocument();
    expect(screen.getByText('Salomon Speedcross 6')).toBeInTheDocument();
  });

  it('muestra Gratis cuando shipping es 0', () => {
    render(<OrderReview {...baseProps()} shipping={0} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('llama a onConfirm al pulsar Confirmar pedido', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<OrderReview {...props} />);
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama a onBack al pulsar Volver', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<OrderReview {...props} />);
    await user.click(screen.getByRole('button', { name: /volver/i }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it('muestra el mensaje de error cuando error no es null', () => {
    render(<OrderReview {...baseProps()} error="Algo falló" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Algo falló');
  });

  it('deshabilita los botones y muestra Procesando cuando isSubmitting es true', () => {
    render(<OrderReview {...baseProps()} isSubmitting />);
    expect(screen.getByRole('button', { name: /volver/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled();
  });
});
