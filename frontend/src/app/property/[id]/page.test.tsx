import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import PropertyDetailPage from './page';
import type { Property, AvailabilityResponse, ReviewsResponse } from '@/types';

// ── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'prop-uuid-001' })),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams({})),
}));

vi.mock('@/services/propertyService', () => ({
  usePropertyDetails: vi.fn(),
  usePropertyAvailability: vi.fn(),
  usePriceCalculation: vi.fn(),
  usePropertyReviews: vi.fn(),
}));

import {
  usePropertyDetails,
  usePropertyAvailability,
  usePriceCalculation,
  usePropertyReviews,
} from '@/services/propertyService';

// Stub the calendar so the page test can drive its date-selection callback
// directly (the calendar's own behaviour is covered in its own test file).
vi.mock('@/components/property/AvailabilityCalendar', () => ({
  AvailabilityCalendar: ({
    onDateRangeSelect,
  }: {
    onDateRangeSelect: (checkIn: string, checkOut: string) => void;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'availability-calendar' },
      React.createElement(
        'button',
        {
          'data-testid': 'cal-pick-dates',
          onClick: () => onDateRangeSelect('2026-08-01', '2026-08-05'),
        },
        'pick dates',
      ),
    ),
}));

const mockProperty: Property = {
  id: 'prop-uuid-001',
  title: 'Cosy Eixample Apartment',
  description: 'Bright 1-bedroom apartment in the heart of Eixample.',
  property_type: 'apartment',
  location: {
    lat: 41.392,
    lng: 2.162,
    city: 'Barcelona',
    region: 'Catalonia',
    country: 'ES',
    address: 'Carrer de Provenca 100',
  },
  max_guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  nightly_rate_eur: 95.0,
  cleaning_fee_eur: 35.0,
  amenities: ['wifi', 'kitchen', 'air_conditioning'],
  house_rules: ['no_smoking', 'no_parties'],
  photos: [
    { url: 'https://example.com/photo1.jpg', caption: 'Living room' },
    { url: 'https://example.com/photo2.jpg', caption: 'Bedroom' },
  ],
  host: {
    id: 'host-001',
    first_name: 'Test',
    avatar_url: 'https://example.com/avatar.jpg',
    is_verified: true,
  },
  avg_rating: 4.7,
  review_count: 0,
};

const mockAvailability: AvailabilityResponse = {
  property_id: 'prop-uuid-001',
  unavailable_dates: [],
};

const mockReviews: ReviewsResponse = {
  reviews: [],
  pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 },
  avg_rating: 0,
  total_reviews: 0,
};

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('PropertyDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (usePropertyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockProperty,
      isLoading: false,
      error: null,
    });
    (usePropertyAvailability as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAvailability,
      isLoading: false,
      error: null,
    });
    (usePriceCalculation as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    (usePropertyReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockReviews,
      isLoading: false,
      error: null,
    });
  });

  describe('Loading state', () => {
    it('renders loading skeleton when property is loading', () => {
      (usePropertyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('property-detail-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error state when property fetch fails', () => {
      (usePropertyDetails as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Not found'),
      });

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('property-page-error')).toBeInTheDocument();
      expect(screen.getByText(/property not found/i)).toBeInTheDocument();
    });
  });

  describe('Successful render', () => {
    it('renders property page container', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('property-page')).toBeInTheDocument();
    });

    it('renders property title', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
    });

    it('renders property location', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/barcelona, es/i)).toBeInTheDocument();
    });

    it('renders property description', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/bright 1-bedroom apartment/i)).toBeInTheDocument();
    });

    it('renders host info', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/hosted by test/i)).toBeInTheDocument();
    });

    it('renders verified host badge', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/verified host/i)).toBeInTheDocument();
    });

    it('renders PhotoGallery', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('photo-gallery')).toBeInTheDocument();
    });

    it('renders AmenityList', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('amenity-list')).toBeInTheDocument();
    });

    it('renders AvailabilityCalendar', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      const cals = screen.getAllByTestId('availability-calendar');
      expect(cals.length).toBeGreaterThan(0);
    });

    it('renders PriceBreakdown placeholder (no dates selected)', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      const placeholders = screen.getAllByTestId('price-breakdown-placeholder');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('renders ReviewList', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('review-list')).toBeInTheDocument();
    });

    it('renders "No reviews yet" empty state', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('review-list-empty')).toBeInTheDocument();
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });

    it('renders house rules', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/no smoking/i)).toBeInTheDocument();
      expect(screen.getByText(/no parties/i)).toBeInTheDocument();
    });

    it('renders capacity chips (guests, bedrooms, bathrooms)', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/2 guests/i)).toBeInTheDocument();
      expect(screen.getByText(/1 bedroom/i)).toBeInTheDocument();
      expect(screen.getByText(/1 bathroom/i)).toBeInTheDocument();
    });

    it('renders Reserve button disabled when no dates selected', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      const reserveBtn = screen.getByTestId('reserve-button');
      expect(reserveBtn).toBeDisabled();
    });

    it('renders Reserve button enabled when dates are selected in URL', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({ check_in: '2026-07-10', check_out: '2026-07-15' }),
      );

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      const reserveBtn = screen.getByTestId('reserve-button');
      expect(reserveBtn).not.toBeDisabled();
    });

    it('navigates to checkout on Reserve click', async () => {
      const { useRouter, useSearchParams } = await import('next/navigation');
      const mockPush = vi.fn();
      (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
      });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({ check_in: '2026-07-10', check_out: '2026-07-15' }),
      );

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByTestId('reserve-button'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/booking/checkout?propertyId=prop-uuid-001'),
      );
    });

    it('updates the URL with scroll:false when a date is picked (no jump to top)', async () => {
      const { useRouter } = await import('next/navigation');
      const mockReplace = vi.fn();
      (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
        push: vi.fn(),
        replace: mockReplace,
        back: vi.fn(),
      });

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      fireEvent.click(screen.getAllByTestId('cal-pick-dates')[0]);

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('check_in=2026-08-01'),
        { scroll: false },
      );
    });
  });

  describe('Expired-hold banner', () => {
    beforeEach(async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({}),
      );
    });

    it('shows the expired-hold banner when ?expired=true', async () => {
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({ expired: 'true' }),
      );

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.getByTestId('expired-banner')).toBeInTheDocument();
    });

    it('does not show the banner without ?expired', () => {
      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      expect(screen.queryByTestId('expired-banner')).not.toBeInTheDocument();
    });

    it('dismisses the expired-hold banner', async () => {
      const user = userEvent.setup();
      const { useSearchParams } = await import('next/navigation');
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
        new URLSearchParams({ expired: 'true' }),
      );

      render(<PropertyDetailPage />, { wrapper: createWrapper() });
      await user.click(screen.getByTestId('expired-banner-dismiss'));
      expect(screen.queryByTestId('expired-banner')).not.toBeInTheDocument();
    });
  });
});
