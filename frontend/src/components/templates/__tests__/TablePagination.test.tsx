/**
 * Unit Tests for TablePagination Component
 *
 * Tests the pagination component for templates table with:
 * - Page navigation (first, previous, next, last)
 * - Page size selection
 * - Display of current page info
 * - Disabled states for boundary conditions
 * - Keyboard accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TablePagination from '../TablePagination';

describe('TablePagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    pageSize: 20,
    totalItems: 100,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders all pagination elements', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last page/i)).toBeInTheDocument();
    });

    it('displays correct page information', () => {
      render(<TablePagination {...defaultProps} currentPage={3} />);

      expect(screen.getByText(/page 3 of 5/i)).toBeInTheDocument();
      expect(screen.getByText(/showing 41-60 of 100/i)).toBeInTheDocument();
    });

    it('displays correct items range for first page', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByText(/showing 1-20 of 100/i)).toBeInTheDocument();
    });

    it('displays correct items range for last page with partial items', () => {
      render(
        <TablePagination
          {...defaultProps}
          currentPage={5}
          totalItems={95}
        />
      );

      expect(screen.getByText(/showing 81-95 of 95/i)).toBeInTheDocument();
    });

    it('renders page size selector with options', () => {
      render(<TablePagination {...defaultProps} />);

      const select = screen.getByLabelText(/items per page/i);
      expect(select).toBeInTheDocument();

      const option20 = screen.getByRole('option', { name: '20' });
      const option50 = screen.getByRole('option', { name: '50' });
      const option100 = screen.getByRole('option', { name: '100' });

      expect(option20).toBeInTheDocument();
      expect(option50).toBeInTheDocument();
      expect(option100).toBeInTheDocument();
    });
  });

  describe('Navigation Tests', () => {
    it('calls onPageChange when clicking next button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TablePagination {...defaultProps} onPageChange={onPageChange} />
      );

      const nextButton = screen.getByLabelText(/next page/i);
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking previous button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TablePagination
          {...defaultProps}
          currentPage={3}
          onPageChange={onPageChange}
        />
      );

      const previousButton = screen.getByLabelText(/previous page/i);
      await user.click(previousButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking first button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TablePagination
          {...defaultProps}
          currentPage={3}
          onPageChange={onPageChange}
        />
      );

      const firstButton = screen.getByLabelText(/first page/i);
      await user.click(firstButton);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange when clicking last button', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TablePagination {...defaultProps} onPageChange={onPageChange} />
      );

      const lastButton = screen.getByLabelText(/last page/i);
      await user.click(lastButton);

      expect(onPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Disabled States Tests', () => {
    it('disables first and previous buttons on first page', () => {
      render(<TablePagination {...defaultProps} currentPage={1} />);

      const firstButton = screen.getByLabelText(/first page/i);
      const previousButton = screen.getByLabelText(/previous page/i);

      expect(firstButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
    });

    it('disables next and last buttons on last page', () => {
      render(<TablePagination {...defaultProps} currentPage={5} />);

      const nextButton = screen.getByLabelText(/next page/i);
      const lastButton = screen.getByLabelText(/last page/i);

      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });

    it('enables all buttons on middle page', () => {
      render(<TablePagination {...defaultProps} currentPage={3} />);

      const firstButton = screen.getByLabelText(/first page/i);
      const previousButton = screen.getByLabelText(/previous page/i);
      const nextButton = screen.getByLabelText(/next page/i);
      const lastButton = screen.getByLabelText(/last page/i);

      expect(firstButton).not.toBeDisabled();
      expect(previousButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
      expect(lastButton).not.toBeDisabled();
    });

    it('disables all buttons when totalPages is 0', () => {
      render(<TablePagination {...defaultProps} totalPages={0} />);

      const firstButton = screen.getByLabelText(/first page/i);
      const previousButton = screen.getByLabelText(/previous page/i);
      const nextButton = screen.getByLabelText(/next page/i);
      const lastButton = screen.getByLabelText(/last page/i);

      expect(firstButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });
  });

  describe('Page Size Change Tests', () => {
    it('calls onPageSizeChange when changing page size', async () => {
      const user = userEvent.setup();
      const onPageSizeChange = vi.fn();

      render(
        <TablePagination
          {...defaultProps}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const select = screen.getByLabelText(/items per page/i);
      await user.selectOptions(select, '50');

      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it('selects correct current page size', () => {
      render(<TablePagination {...defaultProps} pageSize={50} />);

      const select = screen.getByLabelText(
        /items per page/i
      ) as HTMLSelectElement;
      expect(select.value).toBe('50');
    });
  });

  describe('Edge Cases Tests', () => {
    it('handles totalPages of 1 correctly', () => {
      render(<TablePagination {...defaultProps} totalPages={1} />);

      expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();

      const nextButton = screen.getByLabelText(/next page/i);
      const previousButton = screen.getByLabelText(/previous page/i);

      expect(nextButton).toBeDisabled();
      expect(previousButton).toBeDisabled();
    });

    it('handles empty dataset correctly', () => {
      render(
        <TablePagination
          {...defaultProps}
          totalPages={0}
          totalItems={0}
        />
      );

      expect(screen.getByText(/page 0 of 0/i)).toBeInTheDocument();
      expect(screen.getByText(/showing 0-0 of 0/i)).toBeInTheDocument();
    });

    it('handles very large numbers correctly', () => {
      render(
        <TablePagination
          {...defaultProps}
          currentPage={50}
          totalPages={100}
          totalItems={10000}
          pageSize={100}
        />
      );

      expect(screen.getByText(/page 50 of 100/i)).toBeInTheDocument();
      expect(
        screen.getByText(/showing 4901-5000 of 10000/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper aria labels for all buttons', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByLabelText(/first page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last page/i)).toBeInTheDocument();
    });

    it('has proper aria label for page size selector', () => {
      render(<TablePagination {...defaultProps} />);

      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });

    it('navigation is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <TablePagination {...defaultProps} onPageChange={onPageChange} />
      );

      const nextButton = screen.getByLabelText(/next page/i);
      nextButton.focus();
      await user.keyboard('{Enter}');

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });
});

