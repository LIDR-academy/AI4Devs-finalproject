import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentForm } from './PaymentForm';

// --------------------------------------------------------------------------
// Tests — demo-only payment path (no Stripe)
// --------------------------------------------------------------------------

describe('PaymentForm', () => {
  const defaultProps = {
    clientSecret: 'pi_stub_secret_pi_stub_ABC123',
    bookingId: 'booking-uuid-1',
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  it('renders the payment form wrapper with bookingId', () => {
    render(<PaymentForm {...defaultProps} />);
    const wrapper = screen.getByTestId('payment-form-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('data-booking-id', 'booking-uuid-1');
  });

  it('renders the demo-mode note', () => {
    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText(/demo/i)).toBeInTheDocument();
    expect(screen.getByText(/no real charge/i)).toBeInTheDocument();
  });

  it('renders the pay button', () => {
    render(<PaymentForm {...defaultProps} />);
    const button = screen.getByTestId('pay-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/pay/i);
  });

  it('calls onSuccess with the stripped payment-intent id on click', () => {
    const onSuccess = vi.fn();
    render(<PaymentForm {...defaultProps} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByTestId('pay-button'));

    expect(onSuccess).toHaveBeenCalledWith('pi_stub_ABC123');
  });
});
