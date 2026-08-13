import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { OrderListResponse } from '../../types/order';
import type { OrderStatus } from '../../types';
import { OrderCard } from './order-card';

function buildOrder(overrides: Partial<OrderListResponse> = {}): OrderListResponse {
  return {
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
        image: 'products/nike-pegasus.jpg',
        quantity: 1,
        size: '42',
      },
    ],
    ...overrides,
  };
}

describe('OrderCard', () => {
  it('renderiza el ID, la fecha formateada y el total del pedido', () => {
    const order = buildOrder();
    render(<OrderCard order={order} />);
    expect(screen.getByText(order.id)).toBeInTheDocument();
    expect(screen.getByText(/19 de junio de 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/134[,.]98/)).toBeInTheDocument();
  });

  it.each<[OrderStatus, string]>([
    ['processing', 'En proceso'],
    ['shipped', 'Enviado'],
    ['delivered', 'Entregado'],
    ['cancelled', 'Cancelado'],
  ])('muestra el badge correcto para el estado %s', (status, expectedLabel) => {
    const order = buildOrder({ status });
    render(<OrderCard order={order} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('cada producto del pedido enlaza a su ficha con el nombre dentro', () => {
    const order = buildOrder({
      items: [
        {
          productId: 'prod-1',
          productName: 'Nike Pegasus 41',
          productBrand: 'Nike',
          productPrice: 129.99,
          image: 'products/nike-pegasus.jpg',
          quantity: 1,
        },
        {
          productId: 'prod-2',
          productName: 'Salomon Speedcross 6',
          productBrand: 'Salomon',
          productPrice: 149.99,
          image: 'products/salomon.jpg',
          quantity: 2,
        },
      ],
    });
    render(<OrderCard order={order} />);

    const link1 = screen.getByRole('link', { name: /Nike Pegasus 41/i });
    expect(link1).toHaveAttribute('href', '/product/prod-1');

    const link2 = screen.getByRole('link', { name: /Salomon Speedcross 6/i });
    expect(link2).toHaveAttribute('href', '/product/prod-2');
  });
});
