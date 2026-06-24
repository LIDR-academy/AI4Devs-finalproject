import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies editorial surface, radius and border classes', () => {
    render(<Card data-testid="card">x</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('bg-surface');
    expect(el.className).toContain('rounded-card');
    expect(el.className).toContain('border-border');
  });

  it('merges a custom className and forwards arbitrary props', () => {
    render(<Card data-testid="card" className="p-8" aria-label="trip">x</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('p-8');
    expect(el).toHaveAttribute('aria-label', 'trip');
  });
});
