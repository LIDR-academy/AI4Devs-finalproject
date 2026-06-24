import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { BookingSummary } from '@/types';
import { TripCard } from './TripCard';

const trip: BookingSummary = {
  id: '11111111-2222-3333-4444-555555555555',
  reference_number: 'BK-20300101-ABC123',
  property_title: 'Cosy Eixample Apartment',
  property_photo_url: 'https://img/1.jpg',
  city: 'Barcelona',
  check_in: '2030-06-10',
  check_out: '2030-06-13',
  status: 'confirmed',
  total_eur: 386,
};

describe('TripCard', () => {
  it('renders title, city, reference, total and a status badge', () => {
    render(<TripCard trip={trip} onClick={vi.fn()} />);
    expect(screen.getByText('Cosy Eixample Apartment')).toBeInTheDocument();
    expect(screen.getByText(/Barcelona/)).toBeInTheDocument();
    expect(screen.getByText('BK-20300101-ABC123')).toBeInTheDocument();
    expect(screen.getByText('€386.00')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText('10 Jun 2030 → 13 Jun 2030')).toBeInTheDocument();
  });

  it('uses editorial card styling and status tokens', () => {
    render(<TripCard trip={trip} onClick={vi.fn()} />);
    expect(screen.getByTestId('trip-card').className).toContain('rounded-card');
    expect(screen.getByTestId('trip-status').className).toContain('bg-terracotta-tint');
  });

  it('calls onClick with the booking id when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TripCard trip={trip} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(trip.id);
  });
});
