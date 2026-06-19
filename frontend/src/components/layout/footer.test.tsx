import { render, screen } from '@testing-library/react';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders the copyright notice', () => {
    render(<Footer />);
    expect(
      screen.getByText('© 2026 RunMarket. Todos los derechos reservados.')
    ).toBeInTheDocument();
  });
});
