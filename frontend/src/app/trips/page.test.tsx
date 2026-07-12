import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams({ status: 'upcoming' }),
}));

const useMyTrips = vi.fn();
vi.mock('@/services/tripsService', () => ({
  useMyTrips: (...args: unknown[]) => useMyTrips(...args),
}));

import TripsPage from './page';

const trip = {
  id: 'b1',
  reference_number: 'BK-1',
  property_title: 'Cosy Eixample Apartment',
  property_photo_url: 'https://img/1.jpg',
  city: 'Barcelona',
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  status: 'confirmed',
  total_eur: 386,
};

describe('TripsPage', () => {
  beforeEach(() => {
    push.mockClear();
    useMyTrips.mockReset();
  });

  it('renders a list of trips', () => {
    useMyTrips.mockReturnValue({
      data: { bookings: [trip], pagination: { page: 1, size: 10, total_results: 1, total_pages: 1 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
  });

  it('applies editorial tokens to the heading and active tab', () => {
    useMyTrips.mockReturnValue({
      data: { bookings: [trip], pagination: { page: 1, size: 10, total_results: 1, total_pages: 1 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    expect(screen.getByRole('heading', { name: 'My Trips' }).className).toContain('font-serif');
    expect(screen.getByTestId('trips-filter-upcoming').className).toContain('border-terracotta');
  });

  it('shows an empty state when there are no trips', () => {
    useMyTrips.mockReturnValue({
      data: { bookings: [], pagination: { page: 1, size: 10, total_results: 0, total_pages: 0 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    expect(screen.getByText(/no trips/i)).toBeInTheDocument();
  });

  it('shows trip card skeletons while loading', () => {
    useMyTrips.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<TripsPage />);
    expect(screen.getAllByTestId('trip-card-skeleton').length).toBeGreaterThan(0);
  });

  it('navigates to the trip detail when a card is clicked', async () => {
    const user = userEvent.setup();
    useMyTrips.mockReturnValue({
      data: { bookings: [trip], pagination: { page: 1, size: 10, total_results: 1, total_pages: 1 } },
      isLoading: false,
      error: null,
    });
    render(<TripsPage />);
    await user.click(screen.getByTestId('trip-card'));
    expect(push).toHaveBeenCalledWith('/trips/b1');
  });
});
