import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CartItemUI } from '../../types/cart';

vi.mock('../../contexts/cart-context', () => ({
  useCart: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useCart } from '../../contexts/cart-context';
import CheckoutPage from './page';

const mockUseCart = vi.mocked(useCart);

const item: CartItemUI = {
  productId: 'prod-1',
  productName: 'Nike Pegasus 41',
  productBrand: 'Nike',
  productPrice: 129.99,
  image: 'products/nike-pegasus.jpg',
  stock: 10,
  quantity: 1,
  size: '42',
};

function makeCart(items: CartItemUI[]) {
  const subtotal = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping: 4.99,
    total: subtotal + 4.99,
    isLoading: false,
    error: null,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
});

describe('CheckoutPage', () => {
  it('redirige a /cart cuando el carrito está vacío', () => {
    mockUseCart.mockReturnValue(makeCart([]));
    render(<CheckoutPage />);
    expect(mockPush).toHaveBeenCalledWith('/cart');
  });

  it('muestra el formulario de envío cuando el carrito tiene ítems', () => {
    mockUseCart.mockReturnValue(makeCart([item]));
    render(<CheckoutPage />);
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('muestra el StepIndicator en el paso 1 al cargar', () => {
    mockUseCart.mockReturnValue(makeCart([item]));
    render(<CheckoutPage />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).toHaveAttribute('aria-current', 'step');
  });

  it('avanza al paso 2 al enviar el formulario con datos válidos', async () => {
    const user = userEvent.setup();
    mockUseCart.mockReturnValue(makeCart([item]));
    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/dirección/i), 'Calle Mayor 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
    await user.type(screen.getByLabelText(/código postal/i), '28001');
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }));

    // After advancing, step 2 should be active
    const steps = screen.getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
  });

  it('muestra el resumen del pedido lateral con el nombre del producto', () => {
    mockUseCart.mockReturnValue(makeCart([item]));
    render(<CheckoutPage />);
    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
  });

  it('no redirige a /cart cuando el carrito tiene ítems', () => {
    mockUseCart.mockReturnValue(makeCart([item]));
    render(<CheckoutPage />);
    expect(mockPush).not.toHaveBeenCalledWith('/cart');
  });

  describe('paso 2 — datos de pago (US-010-TASK-02)', () => {
    async function fillShippingAndAdvance(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
      await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
      await user.type(screen.getByLabelText(/dirección/i), 'Calle Mayor 1');
      await user.type(screen.getByLabelText(/ciudad/i), 'Madrid');
      await user.type(screen.getByLabelText(/código postal/i), '28001');
      await user.click(screen.getByRole('button', { name: /continuar al pago/i }));
    }

    it('muestra PaymentForm y el paso 2 activo tras enviar el formulario de envío', async () => {
      const user = userEvent.setup();
      mockUseCart.mockReturnValue(makeCart([item]));
      render(<CheckoutPage />);

      await fillShippingAndAdvance(user);

      expect(screen.getByLabelText(/número de tarjeta/i)).toBeInTheDocument();
      const steps = screen.getAllByRole('listitem');
      expect(steps[1]).toHaveAttribute('aria-current', 'step');
    });

    it('avanza al paso 3 al enviar PaymentForm con datos válidos', async () => {
      const user = userEvent.setup();
      mockUseCart.mockReturnValue(makeCart([item]));
      render(<CheckoutPage />);

      await fillShippingAndAdvance(user);

      await user.type(screen.getByLabelText(/número de tarjeta/i), '1234567890123456');
      await user.type(screen.getByLabelText(/nombre del titular/i), 'Ana Pérez');
      await user.type(screen.getByLabelText(/fecha de vencimiento/i), '12/28');
      await user.type(screen.getByLabelText(/cvv/i), '123');
      await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));

      expect(
        screen.getByText(/Paso 3 — Revisión del pedido/i)
      ).toBeInTheDocument();
    });

    it('vuelve al paso 1 con los datos de envío intactos al pulsar Volver', async () => {
      const user = userEvent.setup();
      mockUseCart.mockReturnValue(makeCart([item]));
      render(<CheckoutPage />);

      await fillShippingAndAdvance(user);

      await user.click(screen.getByRole('button', { name: /volver/i }));

      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana Pérez');
    });

    it('el resumen del pedido permanece visible en el paso 2', async () => {
      const user = userEvent.setup();
      mockUseCart.mockReturnValue(makeCart([item]));
      render(<CheckoutPage />);

      await fillShippingAndAdvance(user);

      expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    });
  });
});
