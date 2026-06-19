import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../contexts/cart-context', () => ({
  useCart: () => ({ itemCount: 0 }),
}));

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

import { Header } from './header';

describe('Header navigation', () => {
  it('renders Catálogo and Pedidos links pointing to / and /orders', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Header />);

    const catalogLink = screen.getByRole('link', { name: /catálogo/i });
    const ordersLink = screen.getByRole('link', { name: /pedidos/i });

    expect(catalogLink).toHaveAttribute('href', '/');
    expect(ordersLink).toHaveAttribute('href', '/orders');
  });

  it('highlights the active route', () => {
    mockUsePathname.mockReturnValue('/orders');
    render(<Header />);

    const ordersLink = screen.getByRole('link', { name: /pedidos/i });
    expect(ordersLink.className).toContain('text-rm-cta');
  });
});
