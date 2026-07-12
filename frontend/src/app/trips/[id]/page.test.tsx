import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'b1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

const useBookingDetail = vi.fn();
const mutateAsync = vi.fn();
const useCancelBooking = vi.fn(() => ({ mutateAsync, isPending: false, error: null }));
vi.mock('@/services/tripsService', () => ({
  useBookingDetail: (...a: unknown[]) => useBookingDetail(...a),
  useCancelBooking: () => useCancelBooking(),
}));

import TripDetailPage from './page';

const detail = {
  id: 'b1',
  reference_number: 'BK-20300101-ABC123',
  property: { id: 'p1', title: 'Cosy Eixample Apartment', photo_url: 'https://img/1.jpg', city: 'Barcelona', country: 'Spain', address: 'Carrer 1', host_name: 'Maria' },
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  guest_count: 2,
  status: 'confirmed',
  price_breakdown: { nights: 3, nightly_rate_eur: 100, subtotal_eur: 300, cleaning_fee_eur: 50, service_fee_eur: 36, tax_eur: 0, total_eur: 386 },
  cancellation_policy: 'Full refund if cancelled 48+ hours before check-in',
  can_cancel: true,
  refund_amount_eur: 386,
  created_at: '2026-01-01T10:00:00Z',
};

describe('TripDetailPage', () => {
  beforeEach(() => {
    useBookingDetail.mockReset();
    mutateAsync.mockReset();
    useCancelBooking.mockReturnValue({ mutateAsync, isPending: false, error: null });
  });

  it('renders booking detail with property, dates and price', () => {
    useBookingDetail.mockReturnValue({ data: detail, isLoading: false, error: null });
    render(<TripDetailPage />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
    expect(screen.getByText('BK-20300101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
    // editorial restyle: status badge uses terracotta-tint retone for confirmed
    expect(screen.getByText('confirmed').className).toContain('bg-terracotta-tint');
  });

  it('shows a 404 message when the booking is not found', () => {
    useBookingDetail.mockReturnValue({ data: undefined, isLoading: false, error: { status: 404 } });
    render(<TripDetailPage />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('hides the cancel button when can_cancel is false', () => {
    useBookingDetail.mockReturnValue({ data: { ...detail, can_cancel: false }, isLoading: false, error: null });
    render(<TripDetailPage />);
    expect(screen.queryByTestId('open-cancel-button')).not.toBeInTheDocument();
  });

  it('opens the modal and confirms cancellation', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({ booking_id: 'b1', status: 'cancelled', refund_amount_eur: 386, refund_status: 'full_refund' });
    useBookingDetail.mockReturnValue({ data: detail, isLoading: false, error: null });

    render(<TripDetailPage />);
    await user.click(screen.getByTestId('open-cancel-button'));
    expect(screen.getByTestId('cancellation-modal')).toBeInTheDocument();
    await user.click(screen.getByTestId('confirm-cancel-button'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ bookingId: 'b1', reason: undefined }));
  });
});
