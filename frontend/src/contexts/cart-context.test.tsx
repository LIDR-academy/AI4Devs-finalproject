import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './cart-context';
import type { CartResponse } from '../types/cart';

// Mock apiPost from api-client
vi.mock('../lib/api-client', () => ({
  apiPost: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

import { apiPost } from '../lib/api-client';
const mockApiPost = vi.mocked(apiPost);

// Helper: a component that exposes cart context values via data-testid
function CartConsumer() {
  const cart = useCart();
  return (
    <div>
      <span data-testid="itemCount">{cart.itemCount}</span>
      <span data-testid="subtotal">{cart.subtotal}</span>
      <span data-testid="total">{cart.total}</span>
      <span data-testid="isLoading">{String(cart.isLoading)}</span>
      <span data-testid="error">{cart.error ?? 'null'}</span>
      <button
        data-testid="addBtn"
        onClick={() => {
          cart.addItem('prod-1', 1, 'M', 'red').catch(() => {
            // Intentionally swallowed in tests — callers handle via toast
          });
        }}
      >
        Add
      </button>
    </div>
  );
}

function renderWithCart(ui: React.ReactNode = <CartConsumer />) {
  return render(<CartProvider>{ui}</CartProvider>);
}

const mockCartResponse = (items: CartResponse['items']): CartResponse => ({
  sessionId: 'srv-session-uuid',
  items,
  subtotal: items.reduce((s, i) => s + i.productPrice * i.quantity, 0),
  shipping: 0,
  total: items.reduce((s, i) => s + i.productPrice * i.quantity, 0),
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('CartContext', () => {
  it('itemCount es 0 con carrito vacío', () => {
    renderWithCart();
    expect(screen.getByTestId('itemCount').textContent).toBe('0');
  });

  it('itemCount suma las quantities de todos los ítems', async () => {
    const items = [
      {
        productId: 'p1',
        productName: 'Shoe A',
        productBrand: 'Brand A',
        productPrice: 100,
        image: '/a.jpg',
        quantity: 2,
        size: 'M',
        color: 'red',
      },
      {
        productId: 'p2',
        productName: 'Shoe B',
        productBrand: 'Brand B',
        productPrice: 50,
        image: '/b.jpg',
        quantity: 3,
        size: 'L',
        color: 'blue',
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('5'),
    );
  });

  it('addItem llama a apiPost con los parámetros correctos', async () => {
    mockApiPost.mockResolvedValueOnce(mockCartResponse([]));

    renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
    expect(mockApiPost).toHaveBeenCalledWith('/cart', {
      productId: 'prod-1',
      quantity: 1,
      size: 'M',
      color: 'red',
    });
  });

  it('addItem actualiza items con la respuesta del servidor', async () => {
    const items = [
      {
        productId: 'prod-1',
        productName: 'Shoe A',
        productBrand: 'Brand A',
        productPrice: 120,
        image: '/a.jpg',
        quantity: 1,
        size: 'M',
        color: 'red',
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('1'),
    );
    expect(screen.getByTestId('subtotal').textContent).toBe('120');
  });

  it('isLoading es true durante addItem y false al terminar', async () => {
    let resolveAdd!: (value: CartResponse) => void;
    const deferredPromise = new Promise<CartResponse>((resolve) => {
      resolveAdd = resolve;
    });
    mockApiPost.mockReturnValueOnce(deferredPromise);

    renderWithCart();

    // Start the add — don't await
    act(() => {
      screen.getByTestId('addBtn').click();
    });

    // isLoading should become true before the promise resolves
    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('true'),
    );

    // Resolve the deferred promise
    await act(async () => {
      resolveAdd(mockCartResponse([]));
    });

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    );
  });

  it('error se rellena cuando addItem falla', async () => {
    const { ApiError } = await import('../lib/api-client');
    mockApiPost.mockRejectedValueOnce(
      new ApiError(409, 'Stock insuficiente'),
    );

    renderWithCart();

    await act(async () => {
      // addItem re-throws, swallow here
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('error').textContent).toBe(
        'Stock insuficiente',
      ),
    );
  });

  it('sessionId no se persiste en localStorage', async () => {
    mockApiPost.mockResolvedValueOnce(mockCartResponse([]));

    renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));

    expect(localStorage.getItem('sessionId')).toBeNull();
    expect(localStorage.getItem('runmarket_session')).toBeNull();
  });
});
