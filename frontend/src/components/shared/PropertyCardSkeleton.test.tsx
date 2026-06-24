import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

describe('PropertyCardSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<PropertyCardSkeleton />);
    const el = screen.getByTestId('property-card-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
