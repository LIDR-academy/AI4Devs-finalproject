'use client';

import React from 'react';

export interface PaymentFormProps {
  clientSecret: string;
  bookingId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}

/**
 * PaymentForm — demo-only payment path.
 *
 * StayHub does not process real charges. The backend issues a stub
 * PaymentIntent whose client secret is `pi_stub_secret_<paymentIntentId>`.
 * Clicking "Pay" derives that payment-intent id and reports success; the
 * confirm endpoint recognises it and completes the booking.
 *
 * `onError` is part of the public contract for API stability but is not
 * exercised by this demo path.
 */
export function PaymentForm({ clientSecret, bookingId, onSuccess }: PaymentFormProps) {
  const handlePay = () => {
    onSuccess(clientSecret.replace(/^pi_stub_secret_/, ''));
  };

  return (
    <div data-testid="payment-form-wrapper" data-booking-id={bookingId}>
      <p className="text-taupe text-sm mb-3">Demo mode — no real charge.</p>
      <button
        type="button"
        data-testid="pay-button"
        onClick={handlePay}
        className="w-full py-3 px-6 bg-terracotta text-white font-semibold rounded-pill hover:opacity-90 transition-colors"
      >
        Pay
      </button>
    </div>
  );
}
