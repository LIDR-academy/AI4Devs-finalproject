import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders an h2 by default with serif + ink classes', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(el.className).toContain('font-serif');
    expect(el.className).toContain('text-ink');
  });

  it('renders the requested heading level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Big' })).toBeInTheDocument();
  });

  it('merges a custom className', () => {
    render(<Heading level={3} className="mb-4">Small</Heading>);
    const el = screen.getByRole('heading', { level: 3 });
    expect(el.className).toContain('mb-4');
  });

  it('forwards arbitrary attributes to the heading element', () => {
    render(<Heading id="trip-title" data-testid="heading">Title</Heading>);
    const el = screen.getByTestId('heading');
    expect(el).toHaveAttribute('id', 'trip-title');
  });
});
