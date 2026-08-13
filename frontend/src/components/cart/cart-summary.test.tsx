import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartSummary } from './cart-summary';

describe('CartSummary', () => {
  const onCheckout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra subtotal y total formateados', () => {
    render(
      <CartSummary
        subtotal={45}
        shipping={4.99}
        total={49.99}
        itemCount={2}
        onCheckout={onCheckout}
      />,
    );
    expect(screen.getByText(/45[,.]00/)).toBeInTheDocument();
    expect(screen.getByText(/49[,.]99/)).toBeInTheDocument();
  });

  it('muestra «Gratis» cuando shipping es 0', () => {
    render(
      <CartSummary
        subtotal={60}
        shipping={0}
        total={60}
        itemCount={2}
        onCheckout={onCheckout}
      />,
    );
    expect(screen.getByText('Gratis')).toBeInTheDocument();
    expect(screen.queryByText(/4[,.]99/)).not.toBeInTheDocument();
  });

  it('muestra 4,99 € y mensaje incentivador cuando shipping > 0', () => {
    render(
      <CartSummary
        subtotal={30}
        shipping={4.99}
        total={34.99}
        itemCount={1}
        onCheckout={onCheckout}
      />,
    );
    // Shipping row shows "4,99 €" (exact text node, not matching total "34,99 €")
    expect(screen.getAllByText(/4[,.]99/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Gratis')).not.toBeInTheDocument();
    expect(screen.getByText(/20[,.]00/)).toBeInTheDocument();
    expect(screen.getByText(/envío gratis/i)).toBeInTheDocument();
  });

  it('calcula el importe del incentivo correctamente', () => {
    render(
      <CartSummary
        subtotal={42.5}
        shipping={4.99}
        total={47.49}
        itemCount={1}
        onCheckout={onCheckout}
      />,
    );
    expect(screen.getByText(/7[,.]50/)).toBeInTheDocument();
  });

  it('botón «Tramitar pedido» deshabilitado cuando itemCount es 0', () => {
    render(
      <CartSummary
        subtotal={0}
        shipping={4.99}
        total={4.99}
        itemCount={0}
        onCheckout={onCheckout}
      />,
    );
    expect(screen.getByRole('button', { name: /tramitar pedido/i })).toBeDisabled();
  });

  it('botón «Tramitar pedido» activo cuando itemCount > 0', () => {
    render(
      <CartSummary
        subtotal={45}
        shipping={4.99}
        total={49.99}
        itemCount={2}
        onCheckout={onCheckout}
      />,
    );
    expect(screen.getByRole('button', { name: /tramitar pedido/i })).not.toBeDisabled();
  });

  it('botón «Tramitar pedido» llama a onCheckout al hacer click', async () => {
    const user = userEvent.setup();
    render(
      <CartSummary
        subtotal={45}
        shipping={4.99}
        total={49.99}
        itemCount={2}
        onCheckout={onCheckout}
      />,
    );
    await user.click(screen.getByRole('button', { name: /tramitar pedido/i }));
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });
});
