import React from 'react';
import { render, renderHook, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './cart-context';
import type { CartResponse } from '../types/cart';

// Mock apiPost from api-client
vi.mock('../lib/api-client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api-client';
const mockApiGet = vi.mocked(apiGet);
const mockApiPost = vi.mocked(apiPost);
const mockApiPut = vi.mocked(apiPut);
const mockApiDelete = vi.mocked(apiDelete);

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
      <span data-testid="stock0">{cart.items[0]?.stock ?? 'none'}</span>
      <button
        data-testid="addBtn"
        onClick={() => {
          cart.addItem('prod-1', 1, 'M', 'red').catch(() => {});
        }}
      >
        Add
      </button>
      <button
        data-testid="updateBtn"
        onClick={() => {
          cart.updateItem('prod-1', 3, 'M', 'red').catch(() => {});
        }}
      >
        Update
      </button>
      <button
        data-testid="removeBtn"
        onClick={() => {
          cart.removeItem('prod-1', 'M', 'red').catch(() => {});
        }}
      >
        Remove
      </button>
      <button
        data-testid="clearBtn"
        onClick={() => {
          cart.clearCart();
        }}
      >
        Clear
      </button>
    </div>
  );
}

async function renderWithCart(ui: React.ReactNode = <CartConsumer />) {
  const result = render(<CartProvider>{ui}</CartProvider>);
  // Flush the mount effect's apiGet('/cart') promise inside act() so its
  // state update doesn't leak (and warn) into whichever test runs next.
  await act(async () => {});
  return result;
}

const mockCartItem = (overrides: Partial<CartResponse['items'][number]> = {}): CartResponse['items'][number] => ({
  productId: 'prod-1',
  productName: 'Shoe A',
  productBrand: 'Brand A',
  productPrice: 100,
  image: '/a.jpg',
  stock: 10,
  quantity: 1,
  size: 'M',
  color: 'red',
  ...overrides,
});

const mockCartResponse = (items: CartResponse['items']): CartResponse => ({
  items,
  subtotal: items.reduce((s, i) => s + i.productPrice * i.quantity, 0),
  shipping: 0,
  total: items.reduce((s, i) => s + i.productPrice * i.quantity, 0),
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Default: montar el provider siempre dispara un refresco al backend.
  mockApiGet.mockResolvedValue(mockCartResponse([]));
});

describe('CartContext', () => {
  it('US-017-TASK-05: CartProvider no expone sessionId en el contexto', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });
    await act(async () => {});

    expect(result.current).not.toHaveProperty('sessionId');
  });

  it('itemCount es 0 con carrito vacío', async () => {
    await renderWithCart();
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
        stock: 10,
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
        stock: 5,
        quantity: 3,
        size: 'L',
        color: 'blue',
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('5'),
    );
  });

  it('addItem llama a apiPost con los parámetros correctos', async () => {
    mockApiPost.mockResolvedValueOnce(mockCartResponse([]));

    await renderWithCart();

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
        stock: 10,
        quantity: 1,
        size: 'M',
        color: 'red',
      },
    ];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

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

    await renderWithCart();

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

    await renderWithCart();

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

    await renderWithCart();

    await act(async () => {
      screen.getByTestId('addBtn').click();
    });

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));

    expect(localStorage.getItem('sessionId')).toBeNull();
    expect(localStorage.getItem('runmarket_session')).toBeNull();
  });

  it('la respuesta de addItem incluye stock en cada ítem', async () => {
    const items = [mockCartItem({ productId: 'prod-1', stock: 8, quantity: 1 })];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => { screen.getByTestId('addBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('stock0').textContent).toBe('8'),
    );
  });

  // ─── updateItem ────────────────────────────────────────────────────────────

  it('updateItem llama a apiPut con productId, quantity, size y color', async () => {
    const items = [mockCartItem({ quantity: 3 })];
    mockApiPut.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() => expect(mockApiPut).toHaveBeenCalledTimes(1));
    expect(mockApiPut).toHaveBeenCalledWith('/cart/prod-1', { quantity: 3, size: 'M', color: 'red' });
  });

  it('updateItem actualiza items y totales con la respuesta del servidor', async () => {
    const items = [mockCartItem({ quantity: 3, productPrice: 50 })];
    mockApiPut.mockResolvedValueOnce({
      ...mockCartResponse(items),
      subtotal: 150,
      total: 150,
    });

    await renderWithCart();

    await act(async () => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('3'),
    );
    expect(screen.getByTestId('subtotal').textContent).toBe('150');
  });

  it('updateItem rellena error cuando el servidor devuelve error', async () => {
    const { ApiError } = await import('../lib/api-client');
    mockApiPut.mockRejectedValueOnce(new ApiError(409, 'Stock insuficiente'));

    await renderWithCart();

    await act(async () => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('error').textContent).toBe('Stock insuficiente'),
    );
  });

  it('isLoading es true durante updateItem y false al terminar', async () => {
    let resolve!: (v: CartResponse) => void;
    const deferred = new Promise<CartResponse>((r) => { resolve = r; });
    mockApiPut.mockReturnValueOnce(deferred);

    await renderWithCart();

    act(() => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('true'),
    );

    await act(async () => { resolve(mockCartResponse([])); });

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false'),
    );
  });

  // ─── removeItem ────────────────────────────────────────────────────────────

  it('removeItem llama a apiDelete con productId, size y color en query string', async () => {
    mockApiDelete.mockResolvedValueOnce(mockCartResponse([]));

    await renderWithCart();

    await act(async () => { screen.getByTestId('removeBtn').click(); });

    await waitFor(() => expect(mockApiDelete).toHaveBeenCalledTimes(1));
    expect(mockApiDelete).toHaveBeenCalledWith('/cart/prod-1?size=M&color=red');
  });

  it('removeItem actualiza items con la respuesta del servidor', async () => {
    mockApiDelete.mockResolvedValueOnce(mockCartResponse([]));

    await renderWithCart();

    await act(async () => { screen.getByTestId('removeBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('0'),
    );
  });

  it('removeItem rellena error cuando el servidor devuelve error', async () => {
    const { ApiError } = await import('../lib/api-client');
    mockApiDelete.mockRejectedValueOnce(new ApiError(404, 'Ítem no encontrado en el carrito'));

    await renderWithCart();

    await act(async () => { screen.getByTestId('removeBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('error').textContent).toBe('Ítem no encontrado en el carrito'),
    );
  });

  it('updateItem actualiza la caché de localStorage', async () => {
    const items = [mockCartItem({ quantity: 2 })];
    mockApiPut.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() => expect(mockApiPut).toHaveBeenCalledTimes(1));

    const cached = JSON.parse(localStorage.getItem('runmarket_cart') ?? '[]') as unknown[];
    expect(cached).toHaveLength(1);
  });

  it('sessionId no se persiste en localStorage tras updateItem', async () => {
    mockApiPut.mockResolvedValueOnce(mockCartResponse([]));

    await renderWithCart();

    await act(async () => { screen.getByTestId('updateBtn').click(); });

    await waitFor(() => expect(mockApiPut).toHaveBeenCalledTimes(1));

    expect(localStorage.getItem('sessionId')).toBeNull();
  });

  // ─── clearCart ─────────────────────────────────────────────────────────────

  it('clearCart vacía items y totales', async () => {
    const items = [mockCartItem({ quantity: 2, productPrice: 100 })];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => { screen.getByTestId('addBtn').click(); });

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('2'),
    );

    act(() => { screen.getByTestId('clearBtn').click(); });

    expect(screen.getByTestId('itemCount').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');
    expect(screen.getByTestId('total').textContent).toBe('0');
  });

  it('clearCart borra la caché de localStorage', async () => {
    const items = [mockCartItem({ quantity: 1 })];
    mockApiPost.mockResolvedValueOnce(mockCartResponse(items));

    await renderWithCart();

    await act(async () => { screen.getByTestId('addBtn').click(); });

    await waitFor(() =>
      expect(localStorage.getItem('runmarket_cart')).not.toBeNull(),
    );

    act(() => { screen.getByTestId('clearBtn').click(); });

    expect(localStorage.getItem('runmarket_cart')).toBeNull();
  });

  it('clearCart no llama a la API', async () => {
    await renderWithCart();

    act(() => { screen.getByTestId('clearBtn').click(); });

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(mockApiPut).not.toHaveBeenCalled();
    expect(mockApiDelete).not.toHaveBeenCalled();
  });

  // ─── hidratación al montar (bug: subtotal/total en 0,00 €) ────────────────

  it('al montar, sincroniza subtotal/shipping/total con el backend aunque haya items en caché', async () => {
    const items = [mockCartItem({ quantity: 2, productPrice: 60 })];
    localStorage.setItem('runmarket_cart', JSON.stringify(items));
    mockApiGet.mockResolvedValueOnce({ items, subtotal: 120, shipping: 5, total: 125 });

    await renderWithCart();

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/cart'));
    await waitFor(() =>
      expect(screen.getByTestId('subtotal').textContent).toBe('120'),
    );
    expect(screen.getByTestId('total').textContent).toBe('125');
  });

  it('si el refresco al backend falla, mantiene los items optimistas de localStorage', async () => {
    const items = [mockCartItem({ quantity: 1 })];
    localStorage.setItem('runmarket_cart', JSON.stringify(items));
    mockApiGet.mockRejectedValueOnce(new Error('network error'));

    await renderWithCart();

    await waitFor(() =>
      expect(screen.getByTestId('itemCount').textContent).toBe('1'),
    );
  });
});
