import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BookingSummary } from './BookingSummary';
import type { Property, PriceBreakdown } from '@/types';

// --------------------------------------------------------------------------
// Fixtures
// --------------------------------------------------------------------------

const mockProperty: Property = {
  id: 'prop-uuid-1',
  title: 'Cosy Studio in Berlin',
  description: 'A lovely place to stay.',
  property_type: 'studio',
  location: {
    lat: 52.52,
    lng: 13.405,
    city: 'Berlin',
    region: null,
    country: 'Germany',
    address: 'Unter den Linden 1',
  },
  max_guests: 2,
  bedrooms: 1,
  bathrooms: 1,
  nightly_rate_eur: 120,
  cleaning_fee_eur: 45,
  amenities: ['wifi', 'kitchen'],
  house_rules: ['no_smoking'],
  photos: [
    { url: 'https://example.com/photo1.jpg', caption: 'Living room' },
    { url: 'https://example.com/photo2.jpg', caption: 'Bedroom' },
  ],
  host: { id: 'host-1', first_name: 'Anna', is_verified: true },
  avg_rating: 4.8,
  review_count: 12,
};

const mockPriceBreakdown: PriceBreakdown = {
  nights: 3,
  nightly_rate_eur: 120,
  subtotal_eur: 360,
  cleaning_fee_eur: 45,
  service_fee_eur: 48.6,
  tax_eur: 0,
  total_eur: 453.6,
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('BookingSummary', () => {
  it('renders without crashing', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
  });

  it('shows property title', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getByText('Cosy Studio in Berlin')).toBeInTheDocument();
  });

  it('shows the editorial type-in-city label', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getByText(/^studio in berlin$/i)).toBeInTheDocument();
  });

  it('shows property city and country', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getByText(/Berlin.*Germany/)).toBeInTheDocument();
  });

  it('shows first property photo', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    const img = screen.getByAltText('Cosy Studio in Berlin');
    expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg');
  });

  it('shows night count', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getAllByText(/3 nights/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows the safe and secure booking reassurance', () => {
    render(
      <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
    );
    expect(screen.getByText(/safe and secure booking/i)).toBeInTheDocument();
  });

  describe('Price breakdown', () => {
    it('shows nightly rate × nights', () => {
      render(
        <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
      );
      expect(screen.getByText(/€120.00 × 3 nights/)).toBeInTheDocument();
    });

    it('shows cleaning fee', () => {
      render(
        <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
      );
      expect(screen.getByText(/cleaning fee/i)).toBeInTheDocument();
      expect(screen.getByText('€45.00')).toBeInTheDocument();
    });

    it('shows service fee', () => {
      render(
        <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
      );
      expect(screen.getByText(/service fee/i)).toBeInTheDocument();
      expect(screen.getByText('€48.60')).toBeInTheDocument();
    });

    it('shows total', () => {
      render(
        <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
      );
      expect(screen.getByTestId('price-total')).toHaveTextContent('€453.60');
    });

    it('hides tax row when tax_eur is 0', () => {
      render(
        <BookingSummary property={mockProperty} priceBreakdown={mockPriceBreakdown} />,
      );
      expect(screen.queryByText(/taxes/i)).not.toBeInTheDocument();
    });

    it('shows tax row when tax_eur > 0', () => {
      render(
        <BookingSummary
          property={mockProperty}
          priceBreakdown={{ ...mockPriceBreakdown, tax_eur: 20, total_eur: 473.6 }}
        />,
      );
      expect(screen.getByText(/taxes/i)).toBeInTheDocument();
    });
  });

  it('renders placeholder div when property has no photos', () => {
    const propertyNoPhotos: Property = { ...mockProperty, photos: [] };
    render(
      <BookingSummary property={propertyNoPhotos} priceBreakdown={mockPriceBreakdown} />,
    );
    // No img element — placeholder div rendered instead
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
