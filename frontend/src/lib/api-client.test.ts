import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchProducts, fetchOrders } from './api-client';
import { Product, ProductFilters } from '../types';
import { OrderListResponse } from '../types/order';

// Unified fetch mock: reset and re-stub before each test, restore after.
const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── helpers ──────────────────────────────────────────────────────────────────

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

const stubFetch = (status: number, body: unknown) => {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
};

// ── fetchProducts ─────────────────────────────────────────────────────────────

describe('fetchProducts()', () => {
  it('calls the correct API URL', async () => {
    stubFetch(200, { products: [buildProduct()], total: 1 });

    await fetchProducts();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/products');
  });

  it('returns ProductsResponse with products and total', async () => {
    const products = [buildProduct(), buildProduct({ id: 'uuid-2' })];
    stubFetch(200, { products, total: 2 });

    const result = await fetchProducts();

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('throws an Error when the server responds with 500', async () => {
    stubFetch(500, { error: 'Internal server error' });

    await expect(fetchProducts()).rejects.toThrow();
  });

  it('does not expose server-internal details in the thrown error for 500', async () => {
    stubFetch(500, { error: 'Internal server error' });

    await expect(fetchProducts()).rejects.toThrow('Internal server error');
  });

  it('returns empty products array with total 0 when catalog is empty', async () => {
    stubFetch(200, { products: [], total: 0 });

    const result = await fetchProducts();

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ── fetchProducts with filters ────────────────────────────────────────────────

describe('fetchProducts() with filters', () => {
  it('calls /products without query string when no filters provided', async () => {
    stubFetch(200, { products: [], total: 0 });

    await fetchProducts();

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('?');
  });

  it('serializes single distance value as query param', async () => {
    stubFetch(200, { products: [], total: 0 });
    const filters: ProductFilters = { distance: ['5K'] };

    await fetchProducts(filters);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
  });

  it('serializes multiple distance values as repeated params (OR within dimension)', async () => {
    stubFetch(200, { products: [], total: 0 });
    const filters: ProductFilters = { distance: ['5K', 'marathon'] };

    await fetchProducts(filters);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('distance=5K');
    expect(url).toContain('distance=marathon');
  });

  it('serializes multiple dimensions as combined query string (AND between dimensions)', async () => {
    stubFetch(200, { products: [], total: 0 });
    const filters: ProductFilters = { distance: ['marathon'], surface: ['road'] };

    await fetchProducts(filters);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('distance=marathon');
    expect(url).toContain('surface=road');
  });

  it('does not add query params for empty arrays', async () => {
    stubFetch(200, { products: [], total: 0 });
    const filters: ProductFilters = { distance: [], surface: [] };

    await fetchProducts(filters);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('?');
  });

  it('serializes all four running dimensions', async () => {
    stubFetch(200, { products: [], total: 0 });
    const filters: ProductFilters = {
      distance: ['marathon'],
      surface: ['road'],
      level: ['advanced'],
      objective: ['competition'],
    };

    await fetchProducts(filters);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('distance=marathon');
    expect(url).toContain('surface=road');
    expect(url).toContain('level=advanced');
    expect(url).toContain('objective=competition');
  });
});

// ── apiGet ────────────────────────────────────────────────────────────────────

describe('apiGet()', () => {
  it('returns typed data on success', async () => {
    stubFetch(200, { status: 'ok' });

    const { apiGet } = await import('./api-client');
    const result = await apiGet<{ status: string }>('/health');
    expect(result.status).toBe('ok');
  });

  it('throws Error on non-2xx response', async () => {
    stubFetch(404, { error: 'Not found' });

    const { apiGet } = await import('./api-client');
    await expect(apiGet('/missing')).rejects.toThrow('Not found');
  });

  it('throws Error with fallback message when body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('not json'); },
    });

    const { apiGet } = await import('./api-client');
    await expect(apiGet('/broken')).rejects.toThrow();
  });

  it('includes credentials: include so the session cookie is sent', async () => {
    stubFetch(200, { status: 'ok' });

    const { apiGet } = await import('./api-client');
    await apiGet('/health');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({ credentials: 'include' })
    );
  });
});

// ── fetchOrders ───────────────────────────────────────────────────────────────

const buildOrder = (overrides: Partial<OrderListResponse> = {}): OrderListResponse => ({
  id: 'ORD-1',
  status: 'processing',
  date: '2026-06-19T00:00:00.000Z',
  subtotal: 100,
  shipping: 5,
  total: 105,
  shippingName: 'Jane Runner',
  shippingEmail: 'jane@example.com',
  shippingAddress: 'Calle Falsa 123',
  shippingCity: 'Madrid',
  shippingPostalCode: '28080',
  shippingCountry: 'ES',
  items: [
    {
      productId: 'uuid-1',
      productName: 'Nike Pegasus 41',
      productBrand: 'Nike',
      productPrice: 129.99,
      image: 'products/nike-pegasus.jpg',
      quantity: 1,
    },
  ],
  ...overrides,
});

describe('fetchOrders()', () => {
  it('calls apiGet("/orders") and returns the typed array', async () => {
    const orders = [buildOrder()];
    stubFetch(200, orders);

    const result = await fetchOrders();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/orders');
    expect(result).toEqual(orders);
  });
});

// ── apiPost ───────────────────────────────────────────────────────────────────

describe('apiPost()', () => {
  it('sends POST with JSON body', async () => {
    stubFetch(200, { id: '123' });

    const { apiPost } = await import('./api-client');
    const result = await apiPost<{ id: string }>('/orders', { items: [] });
    expect(result.id).toBe('123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/orders'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });
});
