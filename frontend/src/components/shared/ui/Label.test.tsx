import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Santorini, Greece</Label>);
    expect(screen.getByText('Santorini, Greece')).toBeInTheDocument();
  });

  it('applies uppercase, taupe and tracking classes', () => {
    render(<Label data-testid="label">x</Label>);
    const el = screen.getByTestId('label');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('text-taupe');
    expect(el.className).toContain('font-sans');
  });

  it('merges a custom className', () => {
    render(<Label data-testid="label" className="text-terracotta">x</Label>);
    expect(screen.getByTestId('label').className).toContain('text-terracotta');
  });
});
