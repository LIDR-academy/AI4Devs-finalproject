import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConfirmationSessionData } from '@/types/booking';

// --------------------------------------------------------------------------
// Mock next/navigation
// --------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
  useParams: () => ({ id: 'booking-uuid-1' }),
}));

// --------------------------------------------------------------------------
// Import page (after mocks)
// --------------------------------------------------------------------------

import ConfirmationPage from './page';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const BOOKING_ID = 'booking-uuid-1';
const SESSION_KEY = `confirmation_${BOOKING_ID}`;

const mockSessionData: ConfirmationSessionData = {
  booking_id: BOOKING_ID,
  reference_number: 'BK-12345678',
  property_title: 'Cosy Studio in Berlin',
  property_photo_url: 'https://example.com/photo.jpg',
  check_in: '2026-07-10',
  check_out: '2026-07-13',
  total_eur: 453.6,
};

function setSessionData(data: ConfirmationSessionData | null) {
  if (data === null) {
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('ConfirmationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders the confirmation page', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('confirmation-page')).toBeInTheDocument(),
    );
  });

  it('shows the booked heading', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByText(/your trip is booked/i)).toBeInTheDocument(),
    );
  });

  it('shows the success checkmark icon', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('confirmation-icon')).toBeInTheDocument(),
    );
  });

  it('shows booking reference number prominently', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('reference-number')).toHaveTextContent('BK-12345678'),
    );
  });

  it('shows property title', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByText('Cosy Studio in Berlin')).toBeInTheDocument(),
    );
  });

  it('shows check-in and check-out dates', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() => {
      expect(screen.getByText(/Jul 10 – Jul 13, 2026/)).toBeInTheDocument();
    });
  });

  it('shows total paid', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('total-paid')).toHaveTextContent('€453.60'),
    );
  });

  it('shows "View My Trips" button and navigates to /trips when clicked', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() => {
      const btn = screen.getByTestId('view-trips-button');
      expect(btn).toBeInTheDocument();
      expect(btn).not.toBeDisabled();
    });
    screen.getByTestId('view-trips-button').click();
    expect(mockPush).toHaveBeenCalledWith('/trips');
  });

  it('shows "Back to Search" button', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('back-to-search-button')).toBeInTheDocument(),
    );
  });

  it('navigates to "/" when Back to Search is clicked', async () => {
    setSessionData(mockSessionData);
    render(<ConfirmationPage />);

    await waitFor(() =>
      expect(screen.getByTestId('back-to-search-button')).toBeInTheDocument(),
    );

    screen.getByTestId('back-to-search-button').click();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows fallback message when sessionStorage has no data', async () => {
    // No session data set
    render(<ConfirmationPage />);
    await waitFor(() =>
      expect(screen.getByTestId('confirmation-page')).toBeInTheDocument(),
    );
    // Heading still shows
    expect(screen.getByText(/your trip is booked/i)).toBeInTheDocument();
    // But no reference number block
    expect(screen.queryByTestId('reference-number-block')).not.toBeInTheDocument();
    // And no details card
    expect(screen.queryByTestId('confirmation-details')).not.toBeInTheDocument();
  });
});
