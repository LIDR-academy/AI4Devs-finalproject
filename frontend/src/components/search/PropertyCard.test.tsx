import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PropertyCard } from './PropertyCard';
import type { PropertySummary } from '@/types';

describe('PropertyCard Component', () => {
  const mockProperty: PropertySummary = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Cosy Barcelona Apartment',
    photo_url: 'https://example.com/photo.jpg',
    nightly_rate_eur: 120.0,
    cleaning_fee_eur: 50.0,
    location: {
      lat: 41.4001,
      lng: 2.1644,
      city: 'Barcelona',
      country: 'Spain',
    },
    avg_rating: 4.8,
    review_count: 12,
    property_type: 'apartment',
    max_guests: 4,
    bedrooms: 2,
  };

  it('renders property title', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    expect(screen.getByText('Cosy Barcelona Apartment')).toBeInTheDocument();
  });

  it('renders property photo', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    const img = screen.getByAltText(/cosy barcelona apartment/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders nightly rate', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    expect(screen.getByText(/€120/)).toBeInTheDocument();
  });

  it('renders rating as single star with numeric value', () => {
    const { container } = render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    // Editorial style: single star + toFixed(2) (both aria-hidden; sr-only span carries accessible text)
    // Use container queries because aria-hidden elements are excluded from accessible getByText
    const ratingSpan = container.querySelector('[aria-hidden="true"].font-sans');
    expect(ratingSpan).toBeInTheDocument();
    expect(ratingSpan?.textContent).toBe('4.80');
    // Single star present (aria-hidden)
    const starSpan = container.querySelector('[aria-hidden="true"].text-terracotta');
    expect(starSpan).toBeInTheDocument();
    expect(starSpan?.textContent).toBe('★');
  });

  it('shows "night" label in price', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    expect(screen.getByText('night')).toBeInTheDocument();
  });

  it('renders city and country as the location heading', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    // Editorial: location is an h3 heading with font-serif
    const heading = screen.getByRole('heading', { name: /barcelona, spain/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('font-serif');
  });

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<PropertyCard property={mockProperty} onClick={handleClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockProperty.id);
  });

  it('exposes the rating to assistive tech with context', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);
    expect(
      screen.getByText(`Rated ${mockProperty.avg_rating!.toFixed(2)} out of 5`)
    ).toBeInTheDocument();
  });

  it('renders "New" when avg_rating is null', () => {
    const propertyNoRating = { ...mockProperty, avg_rating: null };

    render(<PropertyCard property={propertyNoRating} onClick={() => {}} />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders city location', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);

    expect(screen.getByText(/barcelona, spain/i)).toBeInTheDocument();
  });
});
