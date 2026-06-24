import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PropertyDetailSkeleton } from './PropertyDetailSkeleton';

describe('PropertyDetailSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<PropertyDetailSkeleton />);
    const el = screen.getByTestId('property-detail-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
