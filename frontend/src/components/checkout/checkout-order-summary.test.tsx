import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CartItemUI } from '../../types/cart';

vi.mock('../../contexts/cart-context', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '../../contexts/cart-context';
import { CheckoutOrderSummary } from './checkout-order-summary';

const mockUseCart = vi.mocked(useCart);

function makeCart(items: CartItemUI[], shipping = 4.99) {
  const subtotal = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const total = subtotal + shipping;
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping,
    total,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    isLoading: false,
    error: null,
  };
}

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

describe('CheckoutOrderSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los artículos del carrito con nombre y cantidad', () => {
    mockUseCart.mockReturnValue(makeCart([item1, item2]));
    render(<CheckoutOrderSummary />);
    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    expect(screen.getByText('Salomon Speedcross 6')).toBeInTheDocument();
  });

  it('muestra el subtotal, envío y total con formato de moneda', () => {
    mockUseCart.mockReturnValue(makeCart([item1]));
    render(<CheckoutOrderSummary />);
    // subtotal: 129.99 * 2 = 259.98
    expect(screen.getByText(/259[,.]98/)).toBeInTheDocument();
    // shipping: 4.99
    expect(screen.getByText(/4[,.]99/)).toBeInTheDocument();
    // total: 264.97
    expect(screen.getByText(/264[,.]97/)).toBeInTheDocument();
  });

  it('muestra «Gratis» y clase verde cuando el envío es 0', () => {
    mockUseCart.mockReturnValue(makeCart([item1], 0));
    render(<CheckoutOrderSummary />);
    const gratisEl = screen.getByText('Gratis');
    expect(gratisEl).toBeInTheDocument();
    expect(gratisEl).toHaveClass('text-green-600');
  });

  it('muestra talla y color cuando el ítem los tiene', () => {
    mockUseCart.mockReturnValue(makeCart([item1]));
    render(<CheckoutOrderSummary />);
    expect(screen.getByText(/Talla: 42/)).toBeInTheDocument();
    expect(screen.getByText(/Color: Negro/)).toBeInTheDocument();
  });

  it('no muestra variante cuando el ítem no tiene talla ni color', () => {
    mockUseCart.mockReturnValue(makeCart([item2]));
    render(<CheckoutOrderSummary />);
    expect(screen.queryByText(/Talla:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Color:/)).not.toBeInTheDocument();
  });

  it('muestra el título «Resumen del pedido»', () => {
    mockUseCart.mockReturnValue(makeCart([]));
    render(<CheckoutOrderSummary />);
    expect(screen.getByText(/resumen del pedido/i)).toBeInTheDocument();
  });
});
