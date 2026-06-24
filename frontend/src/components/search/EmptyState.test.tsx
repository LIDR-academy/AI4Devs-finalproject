import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders no results message', () => {
    render(<EmptyState />);

    expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
  });

  it('renders search tips', () => {
    render(<EmptyState />);

    expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
  });

  it('displays list of suggestions', () => {
    render(<EmptyState />);

    const suggestions = [
      /expand your date range/i,
      /try a different location/i,
      /remove some filters/i,
    ];

    suggestions.forEach(suggestion => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });

  it('renders expandable FAQ section', () => {
    render(<EmptyState />);

    const faqButton = screen.getByRole('button', { name: /frequently asked questions/i });
    expect(faqButton).toBeInTheDocument();
  });

  it('toggles FAQ visibility on click', async () => {
    const user = userEvent.setup();
    render(<EmptyState />);

    const faqButton = screen.getByRole('button', { name: /frequently asked questions/i });

    // Initially, FAQ content should not be visible
    expect(screen.queryByText(/what if no dates work/i)).not.toBeInTheDocument();

    // Click to expand
    await user.click(faqButton);
    expect(screen.getByText(/what if no dates work/i)).toBeInTheDocument();

    // Click to collapse
    await user.click(faqButton);
    expect(screen.queryByText(/what if no dates work/i)).not.toBeInTheDocument();
  });

  it('renders FAQ items', async () => {
    const user = userEvent.setup();
    render(<EmptyState />);

    const faqButton = screen.getByRole('button', { name: /frequently asked questions/i });
    await user.click(faqButton);

    expect(screen.getByText(/what if no dates work/i)).toBeInTheDocument();
    expect(screen.getByText(/contact a host directly/i)).toBeInTheDocument();
  });
});
