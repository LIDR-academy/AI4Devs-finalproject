import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --------------------------------------------------------------------------
// Mock next/navigation
// --------------------------------------------------------------------------

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams({
  propertyId: 'prop-uuid-1',
  checkIn: '2026-07-10',
  checkOut: '2026-07-13',
  guestCount: '2',
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

// --------------------------------------------------------------------------
// Mock bookingService
// --------------------------------------------------------------------------

const mockConfirmBookingMutate = vi.fn();

vi.mock('@/services/bookingService', () => ({
  useBookingHold: vi.fn(),
  useConfirmBooking: vi.fn(),
}));

import { useBookingHold, useConfirmBooking } from '@/services/bookingService';

// --------------------------------------------------------------------------
// Mock propertyService
// --------------------------------------------------------------------------

vi.mock('@/services/propertyService', () => ({
  usePropertyDetails: vi.fn(),
}));

import { usePropertyDetails } from '@/services/propertyService';

// --------------------------------------------------------------------------
// Mock child components
// --------------------------------------------------------------------------

vi.mock('@/components/booking/BookingSummary', () => ({
  BookingSummary: () => React.createElement('div', { 'data-testid': 'booking-summary-stub' }),
}));

vi.mock('@/components/booking/HoldCountdownBanner', () => ({
  HoldCountdownBanner: ({ onHoldExpired }: { onHoldExpired: () => void }) => {
    React.useEffect(() => { onHoldExpired(); }, [onHoldExpired]);
    return React.createElement('div', { 'data-testid': 'hold-banner-stub' });
  },
}));

vi.mock('@/components/booking/PaymentForm', () => ({
  PaymentForm: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (id: string) => void;
    onError: (msg: string) => void;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'payment-form' },
      React.createElement('button', { onClick: () => onSuccess('pi_test_123'), 'data-testid': 'mock-pay' }, 'Pay'),
      React.createElement('button', { onClick: () => onError('Declined'), 'data-testid': 'mock-error' }, 'Fail'),
    ),
}));

// --------------------------------------------------------------------------
// Import page (after mocks)
// --------------------------------------------------------------------------

import CheckoutPage from './page';

// --------------------------------------------------------------------------
// Fixtures
// --------------------------------------------------------------------------

const mockProperty = {
  id: 'prop-uuid-1',
  title: 'Cosy Studio in Berlin',
  description: 'Nice place.',
  property_type: 'studio',
  location: { lat: 52.52, lng: 13.405, city: 'Berlin', country: 'Germany', address: 'Main St', region: null },
  max_guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  nightly_rate_eur: 120,
  cleaning_fee_eur: 45,
  amenities: [],
  house_rules: [],
  photos: [{ url: 'https://example.com/p1.jpg', caption: 'Room' }],
  host: { id: 'h1', first_name: 'Anna', is_verified: true },
  avg_rating: 4.8,
  review_count: 5,
};

const mockBookingResponse = {
  booking_id: 'booking-uuid-1',
  reference_number: 'BK-12345678',
  price_breakdown: {
    nights: 3,
    nightly_rate_eur: 120,
    subtotal_eur: 360,
    cleaning_fee_eur: 45,
    service_fee_eur: 48.6,
    tax_eur: 0,
    total_eur: 453.6,
  },
  stripe_client_secret: 'pi_stub_secret_test',
  hold_expires_at: new Date(Date.now() + 600_000).toISOString(),
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset URL params to a complete, valid set (a test may override below).
    mockSearchParams = new URLSearchParams({
      propertyId: 'prop-uuid-1',
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      guestCount: '2',
    });

    // Set a mock auth token so the checkout auth guard does not redirect.
    localStorage.setItem('auth_token', 'test-jwt-token');

    // Default: property loaded, booking pending
    (usePropertyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockProperty,
      isLoading: false,
    });

    // Default: hold created successfully
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockBookingResponse,
      error: null,
      isLoading: false,
    });

    (useConfirmBooking as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockConfirmBookingMutate,
      isPending: false,
    });
  });

  it('redirects to /login when no auth token is present', async () => {
    localStorage.removeItem('auth_token');

    render(<CheckoutPage />);

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/login?redirect='),
      ),
    );
  });

  it('shows the params error when booking params are missing', async () => {
    mockSearchParams = new URLSearchParams({ guestCount: '1' });

    render(<CheckoutPage />);

    await waitFor(() =>
      expect(screen.getByTestId('checkout-error')).toBeInTheDocument(),
    );
    expect(screen.getByText(/missing booking parameters/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when property is loading', () => {
    (usePropertyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CheckoutPage />);
    expect(screen.getByTestId('checkout-loading')).toBeInTheDocument();
  });

  it('shows loading skeleton when booking creation is pending', () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    render(<CheckoutPage />);
    expect(screen.getByTestId('checkout-loading')).toBeInTheDocument();
  });

  it('shows error state when booking creation fails with 409', async () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: { status: 409, message: 'Conflict' },
      isLoading: false,
    });

    render(<CheckoutPage />);

    await waitFor(() =>
      expect(screen.getByTestId('checkout-error')).toBeInTheDocument(),
    );
    expect(screen.getByText(/no longer available/i)).toBeInTheDocument();
  });

  it('shows error state when booking creation fails with generic error', async () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: { status: 500, message: 'Internal server error' },
      isLoading: false,
    });

    render(<CheckoutPage />);

    await waitFor(() =>
      expect(screen.getByTestId('checkout-error')).toBeInTheDocument(),
    );
  });

  it('shows checkout page with summary and form after booking is created', async () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockBookingResponse,
      error: null,
      isLoading: false,
    });

    render(<CheckoutPage />);

    await waitFor(() =>
      expect(screen.getByTestId('checkout-page')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('booking-summary-stub')).toBeInTheDocument();
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
  });

  it('redirects to the property page with ?expired=true when the hold expires', async () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockBookingResponse,
      error: null,
      isLoading: false,
    });

    render(<CheckoutPage />);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/property/prop-uuid-1?expired=true'),
    );
  });

  it('navigates to confirmation page on successful payment', async () => {
    (useBookingHold as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockBookingResponse,
      error: null,
      isLoading: false,
    });

    // Confirm response is BookingDetailResponse (not the old flat shape).
    // It has `id` (not `booking_id`), `property.title` (not `property_title`),
    // and `price_breakdown.total_eur` (not a top-level `total_eur`).
    const mockConfirmResponse = {
      id: 'booking-uuid-1',
      reference_number: 'BK-12345678',
      status: 'confirmed' as const,
      property: {
        id: 'prop-uuid-1',
        title: 'Cosy Studio in Berlin',
        photo_url: 'https://example.com/p1.jpg',
        city: 'Berlin',
        country: 'Germany',
      },
      check_in: '2026-07-10',
      check_out: '2026-07-13',
      guest_count: 2,
      price_breakdown: {
        nights: 3,
        nightly_rate_eur: 120,
        subtotal_eur: 360,
        cleaning_fee_eur: 45,
        service_fee_eur: 48.6,
        tax_eur: 0,
        total_eur: 453.6,
      },
      created_at: '2026-07-07T10:00:00Z',
    };

    (useConfirmBooking as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: (vars: unknown, opts: { onSuccess: (data: typeof mockConfirmResponse) => void }) => {
        opts.onSuccess(mockConfirmResponse);
      },
      isPending: false,
    });

    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByTestId('checkout-page')).toBeInTheDocument());

    // Click "Pay" in the mocked PaymentForm
    screen.getByTestId('mock-pay').click();

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/confirmation/booking-uuid-1'),
    );
  });
});
