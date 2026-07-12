import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TripCardSkeleton } from './TripCardSkeleton';

describe('TripCardSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<TripCardSkeleton />);
    const el = screen.getByTestId('trip-card-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
