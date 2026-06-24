import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders a button for each page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });
  it('marks the current page with aria-current', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });
  it('calls onPageChange when a page is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('windows large page counts: shows first, last, current neighbours, and ellipsis', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
    // first, last, current and neighbours present
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    // far-away page not rendered as a button
    expect(screen.queryByRole('button', { name: 'Page 8' })).not.toBeInTheDocument();
    // ellipsis gap rendered
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('shows every page without ellipsis when the count is small', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    for (let p = 1; p <= 5; p++) {
      expect(screen.getByRole('button', { name: `Page ${p}` })).toBeInTheDocument();
    }
    expect(screen.queryAllByText('…')).toHaveLength(0);
  });
});
