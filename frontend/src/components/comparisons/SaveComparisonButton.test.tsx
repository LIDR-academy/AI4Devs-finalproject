/**
 * Tests for SaveComparisonButton Component
 *
 * Tests button states, API interaction, and user feedback.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { comparisonsService } from '../../services/comparisons.service';
import type { ComparisonResult } from '../../types/comparison.types';
import SaveComparisonButton from './SaveComparisonButton';

// Mock the comparisons service
vi.mock('../../services/comparisons.service', () => ({
  comparisonsService: {
    saveComparison: vi.fn(),
    checkComparisonExists: vi.fn(),
  },
}));

// Mock toast notifications (we'll add this library later)
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock('react-hot-toast', () => ({
  default: mockToast,
  Toaster: () => null,
}));

describe('SaveComparisonButton', () => {
  const mockComparisonResult: ComparisonResult = {
    source_version_id: 1,
    target_version_id: 2,
    global_metrics: {
      source_version_number: 'v1.0',
      target_version_number: 'v2.0',
      source_page_count: 2,
      target_page_count: 2,
      page_count_changed: false,
      source_field_count: 10,
      target_field_count: 12,
      field_count_changed: true,
      fields_added: 2,
      fields_removed: 0,
      fields_modified: 3,
      fields_unchanged: 7,
      modification_percentage: 25.0,
      source_created_at: '2025-01-01T00:00:00Z',
      target_created_at: '2025-01-02T00:00:00Z',
    },
    field_changes: [],
    analyzed_at: '2025-01-03T00:00:00Z',
  };

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <SaveComparisonButton
          comparisonResult={mockComparisonResult}
          {...props}
        />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the save button', () => {
      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });
      expect(button).toBeInTheDocument();
    });

    it('should not be disabled initially', () => {
      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });
      expect(button).not.toBeDisabled();
    });

    it('should have proper accessibility attributes', () => {
      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Save Functionality', () => {
    it('should call saveComparison when clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockResolvedValue({
        comparison_id: 42,
        message: 'Comparison saved successfully',
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(comparisonsService.checkComparisonExists).toHaveBeenCalledWith(1, 2);
        expect(comparisonsService.saveComparison).toHaveBeenCalledWith(mockComparisonResult);
      });
    });

    it('should show loading state while saving', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      // Should show loading state
      expect(button).toBeDisabled();
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should show success state after successful save', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockResolvedValue({
        comparison_id: 42,
        message: 'Comparison saved successfully',
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Comparison saved successfully!')).toBeInTheDocument();
      });
    });

    it('should call onSaveSuccess callback after save', async () => {
      const user = userEvent.setup();
      const onSaveSuccess = vi.fn();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockResolvedValue({
        comparison_id: 42,
        message: 'Comparison saved successfully',
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent({ onSaveSuccess });
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(onSaveSuccess).toHaveBeenCalledWith(42);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when save fails', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockRejectedValue(
        new Error('Failed to save comparison')
      );

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Click the button above to retry.')).toBeInTheDocument();
      });
    });

    it('should show error message for specific errors', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockRejectedValue(
        new Error('Authentication required')
      );

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          comparison_id: 42,
          message: 'Comparison saved successfully',
          created_at: '2025-01-03T00:00:00Z',
        });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      // First attempt fails
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText('Comparison saved successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Duplicate Detection', () => {
    it('should show "Already Saved" when comparison exists', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: true,
        comparison_id: 42,
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('This comparison was already saved.')).toBeInTheDocument();
      });
    });

    it('should show link to existing comparison', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: true,
        comparison_id: 42,
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /view saved comparison/i });
        expect(link).toHaveAttribute('href', '/comparisons/results/42');
      });
    });

    it('should not call saveComparison if comparison already exists', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: true,
        comparison_id: 42,
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      await user.click(button);

      await waitFor(() => {
        expect(comparisonsService.saveComparison).not.toHaveBeenCalled();
      });
    });
  });

  describe('Styling and Accessibility', () => {
    it('should have primary button styling', () => {
      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });
      expect(button).toHaveClass('bg-primary-600');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.checkComparisonExists).mockResolvedValue({
        exists: false,
        comparison_id: null,
        created_at: null,
      });
      vi.mocked(comparisonsService.saveComparison).mockResolvedValue({
        comparison_id: 42,
        message: 'Comparison saved successfully',
        created_at: '2025-01-03T00:00:00Z',
      });

      renderComponent();
      const button = screen.getByRole('button', { name: /save comparison/i });

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(comparisonsService.saveComparison).toHaveBeenCalled();
      });
    });
  });
});

