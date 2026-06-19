import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Product } from '../types';

// Mock fetchProducts before importing the page
vi.mock('../lib/api-client', () => ({
  fetchProducts: vi.fn(),
}));

// Mock next/navigation for CatalogErrorState, FilterEmptyState, and FilterPanel
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { fetchProducts } from '../lib/api-client';
import CatalogPage from './page';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'uuid-1',
  name: 'Nike Pegasus 41',
  brand: 'Nike',
  price: 129.99,
  image: 'products/nike-pegasus.jpg',
  category: 'shoes',
  subcategory: 'road',
  description: 'Great running shoe',
  features: [],
  distance: [],
  surface: [],
  level: ['beginner'],
  objective: [],
  sizes: [],
  colors: [],
  stock: 10,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

const noSearchParams = Promise.resolve({});

describe('CatalogPage', () => {
  it('renders a ProductCard for each product returned', async () => {
    const products = [
      buildProduct({ id: '1', name: 'Nike Pegasus 41' }),
      buildProduct({ id: '2', name: 'Asics Gel-Nimbus 26' }),
      buildProduct({ id: '3', name: 'Brooks Ghost 16' }),
    ];
    vi.mocked(fetchProducts).mockResolvedValue({ products, total: 3 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    expect(screen.getByText('Asics Gel-Nimbus 26')).toBeInTheDocument();
    expect(screen.getByText('Brooks Ghost 16')).toBeInTheDocument();
  });

  it('renders the results counter with the correct total', async () => {
    const products = [buildProduct(), buildProduct({ id: '2' })];
    vi.mocked(fetchProducts).mockResolvedValue({ products, total: 2 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByText(/2 productos encontrados/i)).toBeInTheDocument();
  });

  it('renders catalog empty state when no filters active and no products', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByTestId('catalog-empty-state')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders error state with retry button when fetchProducts throws', async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Network error'));

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByTestId('catalog-error-state')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('does not crash the page layout when fetch fails', async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Network error'));

    expect(async () => render(await CatalogPage({ searchParams: noSearchParams }))).not.toThrow();
  });

  it('renders the page title', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByRole('heading', { name: /productos para running/i })).toBeInTheDocument();
  });

  it('renders the FilterPanel alongside the product grid', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [buildProduct()], total: 1 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument();
  });
});

describe('CatalogPage — filter params', () => {
  it('calls fetchProducts with distance filter from searchParams', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ distance: '5K' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: ['5K'] }),
    );
  });

  it('calls fetchProducts with multiple distance values as array', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ distance: ['5K', 'marathon'] }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: ['5K', 'marathon'] }),
    );
  });

  it('discards invalid enum values from searchParams before calling fetchProducts', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ distance: 'INVALIDO' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: [] }),
    );
  });

  it('calls fetchProducts with empty filters when no searchParams', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: noSearchParams });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ distance: [], surface: [], level: [], objective: [] }),
    );
  });

  it('shows FilterEmptyState when filters are active and no products match', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(
      await CatalogPage({ searchParams: Promise.resolve({ distance: 'marathon' }) }),
    );

    expect(screen.getByTestId('filter-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('catalog-empty-state')).not.toBeInTheDocument();
  });

  it('shows CatalogEmptyState (not FilterEmptyState) when no filters and no products', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage({ searchParams: noSearchParams }));

    expect(screen.getByTestId('catalog-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-empty-state')).not.toBeInTheDocument();
  });

  it('passes a valid category to fetchProducts', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ category: 'shoes' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'shoes' }),
    );
  });

  it('discards an invalid category', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ category: 'bogus' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: undefined }),
    );
  });

  it('passes a valid priceMax to fetchProducts', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ priceMax: '150' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: 150 }),
    );
  });

  it('discards a non-numeric priceMax', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ priceMax: 'abc' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: undefined }),
    );
  });

  it('discards a negative priceMax', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({ searchParams: Promise.resolve({ priceMax: '-10' }) });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ priceMax: undefined }),
    );
  });

  it('combines category and distance in the same call', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    await CatalogPage({
      searchParams: Promise.resolve({ category: 'shoes', distance: 'marathon' }),
    });

    expect(fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'shoes', distance: ['marathon'] }),
    );
  });

  it('shows FilterEmptyState when only category is active and there are no results', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage({ searchParams: Promise.resolve({ category: 'shoes' }) }));

    expect(screen.getByTestId('filter-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('catalog-empty-state')).not.toBeInTheDocument();
  });

  it('shows FilterEmptyState when only priceMax is active and there are no results', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage({ searchParams: Promise.resolve({ priceMax: '50' }) }));

    expect(screen.getByTestId('filter-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('catalog-empty-state')).not.toBeInTheDocument();
  });
});
