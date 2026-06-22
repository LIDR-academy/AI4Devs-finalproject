import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProductVariantSelector } from './product-variant-selector';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock CartContext so we don't need a real CartProvider (no API calls)
const mockAddItem = vi.fn();
let mockIsLoading = false;

vi.mock('../../contexts/cart-context', () => ({
  useCart: () => ({
    addItem: mockAddItem,
    isLoading: mockIsLoading,
    error: null,
    items: [],
    itemCount: 0,
    subtotal: 0,
    shipping: 0,
    total: 0,
  }),
}));

const DEFAULT_PROPS = {
  sizes: [],
  colors: [],
  stock: 5,
  productId: 'prod-1',
  productName: 'Zapatilla Test',
  productBrand: 'Nike',
  productPrice: 99.99,
  image: 'zapatilla-test.jpg',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockIsLoading = false;
});

describe('ProductVariantSelector', () => {
  // ── Existing tests (must keep passing) ─────────────────────────────────────

  it('no renderiza la sección de tallas cuando sizes está vacío', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    expect(screen.queryByText('Talla')).not.toBeInTheDocument();
  });

  it('no renderiza la sección de colores cuando colors está vacío', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    expect(screen.queryByText('Color')).not.toBeInTheDocument();
  });

  it('renderiza la sección de tallas cuando sizes tiene valores', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} sizes={['40', '41']} />);
    expect(screen.getByText('Talla')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '40' })).toBeInTheDocument();
  });

  it('muestra error al intentar añadir sin seleccionar talla cuando el producto tiene tallas', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} sizes={['40', '41']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona una talla');
  });

  it('no muestra error si sizes y colors están vacíos', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('limpia el error de talla al seleccionar una talla después del intento fallido', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} sizes={['40', '41']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '40' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra error al intentar añadir sin seleccionar color cuando el producto tiene colores', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} colors={['black', 'red']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona un color');
  });

  it('no muestra error de color si colors está vacío', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra los colores con etiqueta en español', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} colors={['black', 'white', 'red']} />);
    expect(screen.getByRole('button', { name: 'Negro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Blanco' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rojo' })).toBeInTheDocument();
  });

  it('limpia el error de color al seleccionar un color después del intento fallido', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} colors={['black', 'red']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Negro' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra primero el error de talla cuando faltan talla y color', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} sizes={['40']} colors={['black']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona una talla');
  });

  it('muestra «Agotado» y el botón está deshabilitado cuando stock es 0', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} stock={0} />);
    const btn = screen.getByRole('button', { name: /agotado/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('el stepper tiene max igual al stock', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} stock={3} />);
    const increment = screen.getByRole('button', { name: /aumentar cantidad/i });
    await userEvent.click(increment); // quantity → 2
    await userEvent.click(increment); // quantity → 3
    expect(increment).toBeDisabled();
  });

  it('el stepper empieza en 1 y el botón − está deshabilitado inicialmente', () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reducir cantidad/i })).toBeDisabled();
  });

  // ── New tests for US-007-TASK-06 ───────────────────────────────────────────

  it('el botón se deshabilita cuando isLoading es true', () => {
    mockIsLoading = true;
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    const btn = screen.getByRole('button', { name: /añadir al carrito/i });
    expect(btn).toBeDisabled();
  });

  it('toast de éxito aparece tras addItem exitoso', async () => {
    const { toast } = await import('sonner');
    mockAddItem.mockResolvedValueOnce(undefined);
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(toast.success).toHaveBeenCalledWith('Producto añadido al carrito');
  });

  it('toast de error aparece cuando addItem falla', async () => {
    const { toast } = await import('sonner');
    mockAddItem.mockRejectedValueOnce(new Error('Network error'));
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(toast.error).toHaveBeenCalledWith('No se pudo añadir al carrito. Inténtalo de nuevo.');
  });

  it('addItem no se llama cuando stock es 0', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} stock={0} />);
    const btn = screen.getByRole('button', { name: /agotado/i });
    await userEvent.click(btn);
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('addItem no se llama sin talla cuando el producto tiene tallas', async () => {
    render(<ProductVariantSelector {...DEFAULT_PROPS} sizes={['40', '41']} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Por favor, selecciona una talla');
  });

  it('addItem se llama con los parámetros correctos', async () => {
    mockAddItem.mockResolvedValueOnce(undefined);
    render(
      <ProductVariantSelector
        {...DEFAULT_PROPS}
        sizes={['40', '41']}
        colors={['black', 'white']}
        stock={5}
      />,
    );
    // Select size 40
    await userEvent.click(screen.getByRole('button', { name: '40' }));
    // Select color Negro (black)
    await userEvent.click(screen.getByRole('button', { name: 'Negro' }));
    // Click add to cart
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(mockAddItem).toHaveBeenCalledWith('prod-1', 1, '40', 'Negro');
  });

  it('el corredor permanece en la página tras añadir (sin redirección)', async () => {
    mockAddItem.mockResolvedValueOnce(undefined);
    render(<ProductVariantSelector {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
