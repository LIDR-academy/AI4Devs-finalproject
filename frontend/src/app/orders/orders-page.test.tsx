import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OrderListResponse } from '../../types/order';

vi.mock('../../lib/api-client', () => ({
  fetchOrders: vi.fn(),
}));

import { fetchOrders } from '../../lib/api-client';
import OrdersPage from './page';

const mockFetchOrders = vi.mocked(fetchOrders);

function buildOrder(overrides: Partial<OrderListResponse> = {}): OrderListResponse {
  return {
    id: 'ORD-1234567890',
    status: 'processing',
    date: '2026-06-18T00:00:00.000Z',
    subtotal: 129.99,
    shipping: 4.99,
    total: 134.98,
    shippingName: 'Ana Ruiz',
    shippingEmail: 'ana@example.com',
    shippingAddress: 'Calle Mayor 1',
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
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OrdersPage', () => {
  it('shows a loading indicator while fetchOrders is pending', () => {
    mockFetchOrders.mockReturnValue(new Promise(() => {}));

    render(<OrdersPage />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    expect(screen.queryByText(/aún no tienes pedidos/i)).not.toBeInTheDocument();
    expect(screen.queryByText('ORD-1234567890')).not.toBeInTheDocument();
  });

  it('renders one OrderCard per order returned by fetchOrders', async () => {
    mockFetchOrders.mockResolvedValue([
      buildOrder({ id: 'ORD-1111111111' }),
      buildOrder({ id: 'ORD-2222222222' }),
    ]);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('ORD-1111111111')).toBeInTheDocument();
    });
    expect(screen.getByText('ORD-2222222222')).toBeInTheDocument();
  });

  it('shows the empty state with CTA when fetchOrders resolves to []', async () => {
    mockFetchOrders.mockResolvedValue([]);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText(/aún no tienes pedidos/i)).toBeInTheDocument();
    });
    const cta = screen.getByRole('link', { name: /explorar productos/i });
    expect(cta).toHaveAttribute('href', '/');
  });

  it('shows an error message with role="alert" when fetchOrders rejects', async () => {
    mockFetchOrders.mockRejectedValue(new Error('Network error'));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.queryByText('ORD-1234567890')).not.toBeInTheDocument();
  });
});
