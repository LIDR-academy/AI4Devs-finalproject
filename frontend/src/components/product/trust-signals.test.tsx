import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustSignals } from './trust-signals';

describe('TrustSignals', () => {
  it('renders free shipping signal', () => {
    render(<TrustSignals />);
    expect(screen.getByText(/envío gratis/i)).toBeInTheDocument();
  });

  it('renders free returns signal', () => {
    render(<TrustSignals />);
    expect(screen.getByText(/devolución gratuita/i)).toBeInTheDocument();
  });

  it('renders warranty signal', () => {
    render(<TrustSignals />);
    expect(screen.getByText(/garantía/i)).toBeInTheDocument();
  });

  it('renders exactly three trust items', () => {
    render(<TrustSignals />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});
