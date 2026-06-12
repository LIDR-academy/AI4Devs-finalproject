import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Product } from '../../../types';

// Preserve ApiError (real), mock only fetchProduct
vi.mock('../../../lib/api-client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../lib/api-client')>();
  return { ...mod, fetchProduct: vi.fn() };
});

// vi.hoisted ensures mockNotFound is available when vi.mock factory executes
const { mockNotFound } = vi.hoisted(() => ({
  mockNotFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
  useRouter: () => ({ refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { fetchProduct, ApiError } from '../../../lib/api-client';
import ProductDetailPage, { generateMetadata } from './page';
import NotFoundPage from './not-found';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'uuid-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: 129.99,
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Gran zapatilla para running',
  features: ['amortiguación', 'suela flexible'],
  distance: ['marathon'],
  surface: ['road'],
  level: ['beginner'],
  objective: ['training'],
  sizes: ['42', '43'],
  colors: ['negro', 'blanco'],
  stock: 10,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProductDetailPage', () => {
  it('renders product name, brand and price', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct());

    render(await ProductDetailPage({ params: { id: 'uuid-1' } }));

    expect(screen.getByRole('heading', { name: /nike pegasus 41/i })).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
    expect(screen.getByText(/129/)).toBeInTheDocument();
  });

  it('renders add-to-cart button enabled when stock > 0', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct({ stock: 5 }));

    render(await ProductDetailPage({ params: { id: 'uuid-1' } }));

    const button = screen.getByRole('button', { name: /añadir al carrito/i });
    expect(button).not.toBeDisabled();
  });

  it('renders button disabled with text "Agotado" when stock === 0', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct({ stock: 0 }));

    render(await ProductDetailPage({ params: { id: 'uuid-1' } }));

    const button = screen.getByRole('button', { name: /agotado/i });
    expect(button).toBeDisabled();
  });

  it('calls notFound when fetchProduct throws a 404 ApiError', async () => {
    vi.mocked(fetchProduct).mockRejectedValue(new ApiError(404, 'Producto no encontrado'));

    await expect(
      ProductDetailPage({ params: { id: 'non-existent' } }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('rethrows non-404 errors without calling notFound', async () => {
    vi.mocked(fetchProduct).mockRejectedValue(new ApiError(500, 'Server error'));

    await expect(
      ProductDetailPage({ params: { id: 'uuid-1' } }),
    ).rejects.toThrow('Server error');
    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('renders product description', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct());

    render(await ProductDetailPage({ params: { id: 'uuid-1' } }));

    expect(screen.getByText('Gran zapatilla para running')).toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  it('returns title with product name', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct({ name: 'Brooks Ghost 16' }));

    const metadata = await generateMetadata({ params: { id: 'uuid-1' } });

    expect(metadata.title).toBe('Brooks Ghost 16');
  });

  it('returns description with product description', async () => {
    vi.mocked(fetchProduct).mockResolvedValue(buildProduct({ description: 'Desc del producto' }));

    const metadata = await generateMetadata({ params: { id: 'uuid-1' } });

    expect(metadata.description).toBe('Desc del producto');
  });

  it('returns fallback title when fetchProduct throws', async () => {
    vi.mocked(fetchProduct).mockRejectedValue(new Error('Network error'));

    const metadata = await generateMetadata({ params: { id: 'non-existent' } });

    expect(typeof metadata.title).toBe('string');
    expect(metadata.title).toBeTruthy();
  });
});

describe('NotFoundPage', () => {
  it('renders link back to catalog', () => {
    render(<NotFoundPage />);

    const link = screen.getByRole('link', { name: /catálogo/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders a not-found message', () => {
    render(<NotFoundPage />);

    expect(screen.getByText(/producto no encontrado/i)).toBeInTheDocument();
  });
});
