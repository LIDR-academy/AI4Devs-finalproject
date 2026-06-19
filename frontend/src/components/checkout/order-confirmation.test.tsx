import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { OrderResponse } from '../../types/order';
import { OrderConfirmation } from './order-confirmation';

const order: OrderResponse = {
  id: 'ORD-1234567890',
  status: 'processing',
  date: '2026-06-19T00:00:00.000Z',
  subtotal: 129.99,
  shipping: 4.99,
  total: 134.98,
  shippingName: 'Ana Corredora',
  shippingEmail: 'ana@example.com',
  shippingAddress: 'Calle Maratón 10',
  shippingCity: 'Madrid',
  shippingPostalCode: '28001',
  shippingCountry: 'España',
  items: [
    {
      productId: 'prod-1',
      productName: 'Nike Pegasus 41',
      productBrand: 'Nike',
      productPrice: 129.99,
      quantity: 1,
      size: '42',
    },
  ],
};

describe('OrderConfirmation', () => {
  it('renderiza el número de pedido y el icono de confirmación', () => {
    render(<OrderConfirmation order={order} />);
    expect(screen.getByText('¡Pedido confirmado!')).toBeInTheDocument();
    expect(screen.getByText(order.id)).toBeInTheDocument();
  });

  it('renderiza el mensaje de notificación con el email de envío', () => {
    render(<OrderConfirmation order={order} />);
    expect(screen.getByText(order.shippingEmail)).toBeInTheDocument();
  });

  it('renderiza el CTA Ver mis pedidos enlazando a /orders (US-013 ya implementada)', () => {
    render(<OrderConfirmation order={order} />);
    expect(screen.getByRole('link', { name: 'Ver mis pedidos' })).toHaveAttribute('href', '/orders');
  });

  it('el CTA Seguir comprando enlaza a /', () => {
    render(<OrderConfirmation order={order} />);
    expect(screen.getByRole('link', { name: 'Seguir comprando' })).toHaveAttribute('href', '/');
  });
});
