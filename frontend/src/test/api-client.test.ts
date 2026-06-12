import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProducts } from '../lib/api-client';
import { Product } from '../types';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'uuid-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: 129.99,
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Great running shoe',
  features: ['cushioning'],
  distance: ['marathon'],
  surface: ['road'],
  level: ['beginner'],
  objective: ['training'],
  sizes: ['42'],
  colors: ['black'],
  stock: 10,
  ...overrides,
});

const mockFetch = (status: number, body: unknown) => {
  const json = vi.fn().mockResolvedValue(body);
  return vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json });
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchProducts()', () => {
  it('calls the correct API URL', async () => {
    const products = [buildProduct()];
    vi.stubGlobal('fetch', mockFetch(200, { products, total: 1 }));

    await fetchProducts();

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/products');
  });

  it('returns ProductsResponse with products and total', async () => {
    const products = [buildProduct(), buildProduct({ id: 'uuid-2' })];
    vi.stubGlobal('fetch', mockFetch(200, { products, total: 2 }));

    const result = await fetchProducts();

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('throws an Error when the server responds with 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { error: 'Internal server error' }));

    await expect(fetchProducts()).rejects.toThrow();
  });

  it('does not expose server-internal details in the thrown error for 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { error: 'Internal server error' }));

    await expect(fetchProducts()).rejects.toThrow('Internal server error');
  });

  it('returns empty products array with total 0 when catalog is empty', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { products: [], total: 0 }));

    const result = await fetchProducts();

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
  });
});
