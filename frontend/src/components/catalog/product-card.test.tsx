import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import { Product } from '../../types';

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

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={buildProduct()} />);
    expect(screen.getByText('Nike Pegasus 41')).toBeInTheDocument();
  });

  it('renders product brand', () => {
    render(<ProductCard product={buildProduct()} />);
    expect(screen.getByText('Nike')).toBeInTheDocument();
  });

  it('renders price formatted in euros', () => {
    render(<ProductCard product={buildProduct({ price: 129.99 })} />);
    const priceEl = screen.getByTestId('product-price');
    expect(priceEl.textContent).toContain('129');
    expect(priceEl.textContent).toContain('€');
  });

  it('renders image with alt equal to product name', () => {
    render(<ProductCard product={buildProduct()} />);
    expect(screen.getByAltText('Nike Pegasus 41')).toBeInTheDocument();
  });

  it('link points to /product/:id', () => {
    render(<ProductCard product={buildProduct({ id: 'abc-123' })} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/abc-123');
  });

  it('renders beginner level badge with label Principiante', () => {
    render(<ProductCard product={buildProduct({ level: ['beginner'] })} />);
    expect(screen.getByText('Principiante')).toBeInTheDocument();
  });

  it('renders intermediate level badge with label Popular', () => {
    render(<ProductCard product={buildProduct({ level: ['intermediate'] })} />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('renders advanced level badge with label Avanzado', () => {
    render(<ProductCard product={buildProduct({ level: ['advanced'] })} />);
    expect(screen.getByText('Avanzado')).toBeInTheDocument();
  });

  it('renders multiple level badges when product has several levels', () => {
    render(<ProductCard product={buildProduct({ level: ['beginner', 'intermediate'] })} />);
    expect(screen.getByText('Principiante')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('does not render stock warning when stock is sufficient', () => {
    render(<ProductCard product={buildProduct({ stock: 15 })} />);
    expect(screen.queryByText(/agotado/i)).not.toBeInTheDocument();
  });

  it('renders Agotado text when stock is 0', () => {
    render(<ProductCard product={buildProduct({ stock: 0 })} />);
    expect(screen.getByText(/agotado/i)).toBeInTheDocument();
  });
});
