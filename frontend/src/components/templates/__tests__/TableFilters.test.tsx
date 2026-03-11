/**
 * Unit Tests for TableFilters Component
 *
 * Tests the filters component for templates table with:
 * - Search input with debounced updates
 * - Clear search button
 * - Responsive design
 * - Keyboard accessibility
 *
 * @author AI4Devs
 * @date 2025-10-25
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TableFilters from '../TableFilters';

describe('TableFilters Component', () => {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
  };

  describe('Rendering Tests', () => {
    it('renders search input', () => {
      render(<TableFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('displays current search value', () => {
      render(<TableFilters {...defaultProps} search="test query" />);

      const searchInput = screen.getByDisplayValue('test query');
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<TableFilters {...defaultProps} />);

      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Search Input Tests', () => {
    it('calls onSearchChange when typing in search', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TableFilters {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'template');

      // Should be called for each character typed
      expect(onSearchChange).toHaveBeenCalled();
    });

    it('calls onSearchChange with correct value when typing', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TableFilters {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 't');

      // Should be called with the typed character
      expect(onSearchChange).toHaveBeenCalledWith('t');
    });
  });

  describe('Clear Button Tests', () => {
    it('shows clear button when search has value', () => {
      render(<TableFilters {...defaultProps} search="test" />);

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeInTheDocument();
    });

    it('hides clear button when search is empty', () => {
      render(<TableFilters {...defaultProps} search="" />);

      const clearButton = screen.queryByLabelText(/clear search/i);
      expect(clearButton).not.toBeInTheDocument();
    });

    it('calls onSearchChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TableFilters
          {...defaultProps}
          search="test query"
          onSearchChange={onSearchChange}
        />
      );

      const clearButton = screen.getByLabelText(/clear search/i);
      await user.click(clearButton);

      expect(onSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper label for search input', () => {
      render(<TableFilters {...defaultProps} />);

      const searchInput = screen.getByLabelText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('has proper aria-label for clear button', () => {
      render(<TableFilters {...defaultProps} search="test" />);

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('search input is keyboard accessible', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      render(
        <TableFilters {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      searchInput.focus();
      await user.keyboard('test');

      expect(onSearchChange).toHaveBeenCalled();
    });
  });

  describe('Edge Cases Tests', () => {
    it('handles very long search queries', () => {
      const longQuery = 'a'.repeat(200);

      render(<TableFilters {...defaultProps} search={longQuery} />);

      const searchInput = screen.getByDisplayValue(longQuery);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles special characters in search', () => {
      const specialQuery = '!@#$%^&*()';

      render(<TableFilters {...defaultProps} search={specialQuery} />);

      const searchInput = screen.getByDisplayValue(specialQuery);
      expect(searchInput).toBeInTheDocument();
    });
  });
});

