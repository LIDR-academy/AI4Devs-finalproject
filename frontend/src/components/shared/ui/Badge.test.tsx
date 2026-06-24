import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Confirmed</Badge>);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('applies terracotta-tint pill classes', () => {
    render(<Badge data-testid="badge">x</Badge>);
    const el = screen.getByTestId('badge');
    expect(el.className).toContain('bg-terracotta-tint');
    expect(el.className).toContain('rounded-pill');
    expect(el.className).toContain('text-terracotta');
    expect(el.className).toContain('uppercase');
  });

  it('merges a custom className', () => {
    render(<Badge data-testid="badge" className="ml-2">x</Badge>);
    expect(screen.getByTestId('badge').className).toContain('ml-2');
  });
});
