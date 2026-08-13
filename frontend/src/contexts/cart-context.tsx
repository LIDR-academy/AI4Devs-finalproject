'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api-client';
import type { CartContextValue, CartItemUI, CartResponse } from '../types/cart';

const CART_STORAGE_KEY = 'runmarket_cart';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage on mount (optimistic cache — prevents flicker),
  // then reconcile with the backend: it's the only source of truth for
  // subtotal/shipping/total, which the optimistic cache never carries.
  useEffect(() => {
    let cancelled = false;

    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItemUI[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Corrupted cache — silently ignore and start empty
    }

    apiGet<CartResponse>('/cart')
      .then((response) => {
        if (cancelled) return;
        setItems(response.items);
        setSubtotal(response.subtotal);
        setShipping(response.shipping);
        setTotal(response.total);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(response.items));
      })
      .catch(() => {
        // Backend unreachable — keep the optimistic cache from localStorage
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(
    async (
      productId: string,
      quantity: number,
      size?: string,
      color?: string,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiPost<CartResponse>('/cart', {
          productId,
          quantity,
          size,
          color,
        });

        setItems(response.items);
        setSubtotal(response.subtotal);
        setShipping(response.shipping);
        setTotal(response.total);

        // Persist items as optimistic cache — sessionId stays in HttpOnly cookie only
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(response.items));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateItem = useCallback(
    async (
      productId: string,
      quantity: number,
      size?: string,
      color?: string,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiPut<CartResponse>(`/cart/${encodeURIComponent(productId)}`, {
          quantity,
          size,
          color,
        });
        setItems(response.items);
        setSubtotal(response.subtotal);
        setShipping(response.shipping);
        setTotal(response.total);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(response.items));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeItem = useCallback(
    async (
      productId: string,
      size?: string,
      color?: string,
    ): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (size) params.set('size', size);
        if (color) params.set('color', color);
        const qs = params.toString();
        const path = `/cart/${encodeURIComponent(productId)}${qs ? `?${qs}` : ''}`;
        const response = await apiDelete<CartResponse>(path);
        setItems(response.items);
        setSubtotal(response.subtotal);
        setShipping(response.shipping);
        setTotal(response.total);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(response.items));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearCart = useCallback((): void => {
    setItems([]);
    setSubtotal(0);
    setShipping(0);
    setTotal(0);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    isLoading,
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
