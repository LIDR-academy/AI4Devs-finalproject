import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Product } from '../types';

// Mock fetchProducts before importing the page
vi.mock('../lib/api-client', () => ({
  fetchProducts: vi.fn(),
}));

// Mock next/navigation for CatalogErrorState's useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
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

describe('CatalogPage', () => {
  it('renders a ProductCard for each product returned', async () => {
    const products = [
      buildProduct({ id: '1', name: 'Nike Pegasus 41' }),
      buildProduct({ id: '2', name: 'Asics Gel-Nimbus 26' }),
      buildProduct({ id: '3', name: 'Brooks Ghost 16' }),
    ];
    vi.mocked(fetchProducts).mockResolvedValue({ products, total: 3 });

    render(await CatalogPage());

    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
    expect(screen.getByText('Asics Gel-Nimbus 26')).toBeInTheDocument();
    expect(screen.getByText('Brooks Ghost 16')).toBeInTheDocument();
  });

  it('renders the results counter with the correct total', async () => {
    const products = [buildProduct(), buildProduct({ id: '2' })];
    vi.mocked(fetchProducts).mockResolvedValue({ products, total: 2 });

    render(await CatalogPage());

    expect(screen.getByText(/2 productos encontrados/i)).toBeInTheDocument();
  });

  it('renders empty state when catalog has no products', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage());

    expect(screen.getByTestId('catalog-empty-state')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders error state with retry button when fetchProducts throws', async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Network error'));

    render(await CatalogPage());

    expect(screen.getByTestId('catalog-error-state')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('does not crash the page layout when fetch fails', async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error('Network error'));

    expect(async () => render(await CatalogPage())).not.toThrow();
  });

  it('renders the page title', async () => {
    vi.mocked(fetchProducts).mockResolvedValue({ products: [], total: 0 });

    render(await CatalogPage());

    expect(screen.getByRole('heading', { name: /productos para running/i })).toBeInTheDocument();
  });
});
