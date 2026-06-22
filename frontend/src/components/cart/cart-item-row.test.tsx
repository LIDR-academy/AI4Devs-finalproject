import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItemRow } from './cart-item-row';
import type { CartItemUI } from '../../types/cart';

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

describe('CartItemRow', () => {
  const onQuantityChange = vi.fn();
  const onRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    onQuantityChange.mockResolvedValue(undefined);
    onRemove.mockResolvedValue(undefined);
  });

  it('renderiza el nombre y la marca del producto', () => {
    render(
      <CartItemRow
        item={buildItem()}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
  });

  it('renderiza el precio unitario formateado', () => {
    render(
      <CartItemRow
        item={buildItem({ productPrice: 129.99 })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.getByText(/129[,.]99/)).toBeInTheDocument();
  });

  it('muestra talla y color cuando existen', () => {
    render(
      <CartItemRow
        item={buildItem({ size: '42', color: 'negro' })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.getByText(/Talla.*42/)).toBeInTheDocument();
    expect(screen.getByText(/Color.*negro/i)).toBeInTheDocument();
  });

  it('no muestra talla ni color cuando son undefined', () => {
    render(
      <CartItemRow
        item={buildItem({ size: undefined, color: undefined })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.queryByText(/Talla/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Color/)).not.toBeInTheDocument();
  });

  it('botón + llama a onQuantityChange con quantity + 1', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={buildItem({ quantity: 2, stock: 10 })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    await user.click(screen.getByRole('button', { name: /aumentar/i }));
    expect(onQuantityChange).toHaveBeenCalledWith('prod-1', 3, '42', 'negro');
  });

  it('botón - llama a onQuantityChange con quantity - 1', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={buildItem({ quantity: 2, stock: 10 })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    await user.click(screen.getByRole('button', { name: /reducir/i }));
    expect(onQuantityChange).toHaveBeenCalledWith('prod-1', 1, '42', 'negro');
  });

  it('botón - está deshabilitado cuando quantity === 1', () => {
    render(
      <CartItemRow
        item={buildItem({ quantity: 1 })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.getByRole('button', { name: /reducir/i })).toBeDisabled();
  });

  it('botón + está deshabilitado cuando quantity === stock', () => {
    render(
      <CartItemRow
        item={buildItem({ quantity: 5, stock: 5 })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    expect(screen.getByRole('button', { name: /aumentar/i })).toBeDisabled();
  });

  it('botón eliminar llama a onRemove con productId, size y color', async () => {
    const user = userEvent.setup();
    render(
      <CartItemRow
        item={buildItem({ productId: 'prod-1', size: '42', color: 'negro' })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onRemove).toHaveBeenCalledWith('prod-1', '42', 'negro');
  });

  it('todos los controles están deshabilitados cuando isUpdating es true', () => {
    render(
      <CartItemRow
        item={buildItem()}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={true}
      />,
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('renderiza la imagen del producto', () => {
    render(
      <CartItemRow
        item={buildItem({ productName: 'Nike Pegasus 41', image: 'products/nike-pegasus.jpg' })}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        isUpdating={false}
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Nike Pegasus 41');
  });
});
