import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CartItemUI } from '../../types/cart';

vi.mock('../../contexts/cart-context', () => ({
  useCart: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useCart } from '../../contexts/cart-context';
import { toast } from 'sonner';
import CartPage from './page';

const mockUseCart = vi.mocked(useCart);
const mockToast = vi.mocked(toast);

const buildItem = (overrides: Partial<CartItemUI> = {}): CartItemUI => ({
  productId: 'prod-1',
  productName: 'Nike Pegasus 41',
  productBrand: 'Nike',
  productPrice: 129.99,
  image: 'products/nike-pegasus.jpg',
  stock: 10,
  quantity: 2,
  size: '42',
  color: 'negro',
  ...overrides,
});

function makeCart(items: CartItemUI[], extra?: Partial<ReturnType<typeof useCart>>) {
  const subtotal = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping: subtotal >= 50 ? 0 : 4.99,
    total: subtotal + (subtotal >= 50 ? 0 : 4.99),
    isLoading: false,
    error: null,
    addItem: vi.fn(),
    updateItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clearCart: vi.fn(),
    ...extra,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
});

describe('CartPage', () => {
  it('muestra estado vacío cuando items es []', () => {
    mockUseCart.mockReturnValue(makeCart([]));
    render(<CartPage />);
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /ver catálogo/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('no muestra estado vacío cuando hay ítems', () => {
    mockUseCart.mockReturnValue(makeCart([buildItem()]));
    render(<CartPage />);
    expect(screen.queryByText(/tu carrito está vacío/i)).not.toBeInTheDocument();
  });

  it('renderiza un CartItemRow por cada ítem del contexto', () => {
    mockUseCart.mockReturnValue(
      makeCart([
        buildItem({ productId: 'p1', productName: 'Zapatilla A' }),
        buildItem({ productId: 'p2', productName: 'Zapatilla B' }),
      ]),
    );
    render(<CartPage />);
    expect(screen.getByText('Zapatilla A')).toBeInTheDocument();
    expect(screen.getByText('Zapatilla B')).toBeInTheDocument();
  });

  it('«Tramitar pedido» no se muestra en el estado vacío', () => {
    mockUseCart.mockReturnValue(makeCart([]));
    render(<CartPage />);
    expect(screen.queryByRole('button', { name: /tramitar pedido/i })).not.toBeInTheDocument();
  });

  it('«Tramitar pedido» activo y navega a /checkout con ítems', async () => {
    const user = userEvent.setup();
    mockUseCart.mockReturnValue(makeCart([buildItem()]));
    render(<CartPage />);
    const btn = screen.getByRole('button', { name: /tramitar pedido/i });
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('llama a removeItem del contexto cuando CartItemRow dispara onRemove', async () => {
    const user = userEvent.setup();
    const cart = makeCart([buildItem({ productId: 'prod-1', size: '42', color: 'negro' })]);
    mockUseCart.mockReturnValue(cart);
    render(<CartPage />);
    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    await waitFor(() =>
      expect(cart.removeItem).toHaveBeenCalledWith('prod-1', '42', 'negro'),
    );
  });

  it('llama a updateItem del contexto cuando CartItemRow dispara onQuantityChange', async () => {
    const user = userEvent.setup();
    const cart = makeCart([buildItem({ productId: 'prod-1', quantity: 2, stock: 10, size: '42', color: 'negro' })]);
    mockUseCart.mockReturnValue(cart);
    render(<CartPage />);
    await user.click(screen.getByRole('button', { name: /aumentar/i }));
    await waitFor(() =>
      expect(cart.updateItem).toHaveBeenCalledWith('prod-1', 3, '42', 'negro'),
    );
  });

  it('muestra toast de error cuando removeItem falla', async () => {
    const user = userEvent.setup();
    const cart = makeCart([buildItem()]);
    cart.removeItem = vi.fn().mockRejectedValue(new Error('Error de red'));
    mockUseCart.mockReturnValue(cart);
    render(<CartPage />);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /eliminar/i }));
    });
    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringMatching(/eliminar|carrito/i),
      ),
    );
  });

  it('muestra toast de error cuando updateItem falla', async () => {
    const user = userEvent.setup();
    const cart = makeCart([buildItem({ quantity: 2, stock: 10 })]);
    cart.updateItem = vi.fn().mockRejectedValue(new Error('Stock insuficiente'));
    mockUseCart.mockReturnValue(cart);
    render(<CartPage />);
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /aumentar/i }));
    });
    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringMatching(/actualizar|carrito/i),
      ),
    );
  });
});
