import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartBadge } from './cart-badge';

vi.mock('../../contexts/cart-context', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '../../contexts/cart-context';
const mockUseCart = vi.mocked(useCart);

describe('CartBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('badge muestra la cantidad cuando itemCount > 0', () => {
    mockUseCart.mockReturnValue({
      itemCount: 4,
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      addItem: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<CartBadge />);

    const badge = screen.getByTestId('cart-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('4');
  });

  it('badge no se muestra con carrito vacío', () => {
    mockUseCart.mockReturnValue({
      itemCount: 0,
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      addItem: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<CartBadge />);

    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();
  });

  it('badge se actualiza al cambiar itemCount', () => {
    mockUseCart.mockReturnValue({
      itemCount: 1,
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      addItem: vi.fn(),
      isLoading: false,
      error: null,
    });

    const { rerender } = render(<CartBadge />);
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('1');

    mockUseCart.mockReturnValue({
      itemCount: 5,
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0,
      addItem: vi.fn(),
      isLoading: false,
      error: null,
    });

    rerender(<CartBadge />);
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
  });
});
