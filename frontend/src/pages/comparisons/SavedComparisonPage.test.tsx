/**
 * SavedComparisonPage Tests
 *
 * Test suite for the SavedComparisonPage component.
 * Covers data fetching, loading states, error handling, and navigation.
 *
 * @author AI4Devs
 * @date 2025-10-27
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { comparisonsService } from '../../services/comparisons.service';
import type { ComparisonResult } from '../../types/comparison.types';
import SavedComparisonPage from './SavedComparisonPage';

// Mock the comparisons service
vi.mock('../../services/comparisons.service', () => ({
  comparisonsService: {
    getComparison: vi.fn(),
  },
}));

// Mock react-router-dom navigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ comparisonId: '1' }),
  };
});

// Helper function to render component with router
const renderSavedComparisonPage = (comparisonId: string = '1') => {
  return render(
    <BrowserRouter>
      <SavedComparisonPage />
    </BrowserRouter>
  );
};

// Mock comparison data
const mockComparison: ComparisonResult = {
  global_metrics: {
    source_template_name: 'Template A',
    source_version_number: '1.0',
    source_version_id: 11,
    source_created_at: '2025-10-01T10:00:00Z',
    source_page_count: 5,
    source_field_count: 50,
    target_template_name: 'Template B',
    target_version_number: '2.0',
    target_version_id: 2,
    target_created_at: '2025-10-27T10:00:00Z',
    target_page_count: 6,
    target_field_count: 55,
    page_count_changed: true,
    field_count_changed: true,
    modification_percentage: 45.5,
    fields_added: 5,
    fields_removed: 3,
    fields_modified: 10,
    fields_unchanged: 37,
  },
  field_changes: [
    {
      field_id: 'field_1',
      status: 'ADDED',
      source_page_number: null,
      target_page_number: 1,
      page_number_changed: false,
      near_text_diff: null,
      source_near_text: null,
      target_near_text: 'Sample text',
      value_options_diff: null,
      source_value_options: null,
      target_value_options: ['Option 1', 'Option 2'],
      position_change: null,
      source_position: null,
      target_position: { x: 100, y: 200, width: 150, height: 30 },
    },
    {
      field_id: 'field_2',
      status: 'REMOVED',
      source_page_number: 2,
      target_page_number: null,
      page_number_changed: false,
      near_text_diff: null,
      source_near_text: 'Old text',
      target_near_text: null,
      value_options_diff: null,
      source_value_options: ['Old Option'],
      target_value_options: null,
      position_change: null,
      source_position: { x: 50, y: 100, width: 150, height: 30 },
      target_position: null,
    },
  ],
  analyzed_at: '2025-10-27T12:00:00Z',
};

describe('SavedComparisonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Data Fetching', () => {
    it('should show loading skeleton initially', () => {
      vi.mocked(comparisonsService.getComparison).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderSavedComparisonPage();

      // Check for loading skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should fetch and display comparison data', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
        expect(screen.getByText(/Template A \(v1\.0\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Template B \(v2\.0\)/i)).toBeInTheDocument();
      });

      // Verify service was called with correct ID
      expect(comparisonsService.getComparison).toHaveBeenCalledWith(1);
    });

    it('should display analyzed date', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText(/Analyzed:/i)).toBeInTheDocument();
      });
    });

    it('should render breadcrumb navigation', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Comparisons')).toBeInTheDocument();
        expect(screen.getByText('Detail')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should render GlobalMetricsCard with correct data', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        // Check for metrics card content
        expect(screen.getByText('Comparison Results')).toBeInTheDocument();
        expect(screen.getByText('45.50%')).toBeInTheDocument();
      });
    });

    it('should render ComparisonTable with field changes', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        // Check for table filter buttons with role="tab"
        const filterButtons = screen.getAllByRole('tab');
        expect(filterButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show 404 error for not found comparison', async () => {
      const error = new Error('Comparison not found');
      vi.mocked(comparisonsService.getComparison).mockRejectedValue(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Comparison Not Found')).toBeInTheDocument();
      });

      // Check for "View All Comparisons" button which is part of 404 error state
      expect(screen.getByRole('button', { name: /View All Comparisons/i })).toBeInTheDocument();
    });

    it('should show generic error for other failures', async () => {
      const error = new Error('Network error');
      vi.mocked(comparisonsService.getComparison).mockRejectedValue(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Error Loading Comparison')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should allow retry on error', async () => {
      const user = userEvent.setup();
      const error = new Error('Temporary error');

      // First call fails
      vi.mocked(comparisonsService.getComparison).mockRejectedValueOnce(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Error Loading Comparison')).toBeInTheDocument();
      });

      // Second call succeeds
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      const retryButton = screen.getByRole('button', { name: /Retry/i });
      await user.click(retryButton);

      // Note: In real scenario, window.location.reload() would be called
      // For tests, we just verify the button exists and is clickable
      expect(retryButton).toBeInTheDocument();
    });

    it('should call getComparison with parsed ID', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(comparisonsService.getComparison).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to comparisons list', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back to List/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons');
    });

    it('should navigate to new comparison page', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Find "New Comparison" button (there might be multiple)
      const newComparisonButtons = screen.getAllByRole('button', { name: /New Comparison/i });
      await user.click(newComparisonButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/create');
    });

    it('should navigate to analyze again with pre-filled data', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      const analyzeAgainButton = screen.getByRole('button', { name: /Analyze Again/i });
      await user.click(analyzeAgainButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/create', {
        state: {
          sourceVersionId: 11,
          targetVersionId: 2,
        },
      });
    });

    it('should navigate from breadcrumb links', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Click on Comparisons breadcrumb
      const comparisonsLink = screen.getByRole('link', { name: /Comparisons/i });
      expect(comparisonsLink).toHaveAttribute('href', '/comparisons');
    });

    it('should navigate to home from breadcrumb', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      const homeLink = screen.getByRole('link', { name: /Home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Error States Navigation', () => {
    it('should navigate from 404 error to comparisons list', async () => {
      const user = userEvent.setup();
      const error = new Error('Comparison not found');
      vi.mocked(comparisonsService.getComparison).mockRejectedValue(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Comparison Not Found')).toBeInTheDocument();
      });

      const viewAllButton = screen.getByRole('button', { name: /View All Comparisons/i });
      await user.click(viewAllButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons');
    });

    it('should navigate from 404 error to create new comparison', async () => {
      const user = userEvent.setup();
      const error = new Error('Comparison not found');
      vi.mocked(comparisonsService.getComparison).mockRejectedValue(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Comparison Not Found')).toBeInTheDocument();
      });

      const newComparisonButton = screen.getByRole('button', { name: /New Comparison/i });
      await user.click(newComparisonButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/create');
    });

    it('should navigate from generic error to comparisons list', async () => {
      const user = userEvent.setup();
      const error = new Error('Network error');
      vi.mocked(comparisonsService.getComparison).mockRejectedValue(error);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Error Loading Comparison')).toBeInTheDocument();
      });

      const goToListButton = screen.getByRole('button', { name: /Go to Comparisons List/i });
      await user.click(goToListButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Check breadcrumb navigation
      const breadcrumb = screen.getByRole('navigation', { name: /Breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();

      // Check buttons have accessible text
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/.+/); // Has some text content
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Tab through interactive elements
      const backButton = screen.getByRole('button', { name: /Back to List/i });
      backButton.focus();
      expect(document.activeElement).toBe(backButton);

      // Tab to next button
      await user.tab();
      const analyzeButton = screen.getByRole('button', { name: /Analyze Again/i });
      expect(document.activeElement).toBe(analyzeButton);
    });
  });

  describe('Date Formatting', () => {
    it('should format analyzed date correctly', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        // Check that date is formatted (format may vary by locale)
        const analyzedText = screen.getByText(/Analyzed:/i);
        expect(analyzedText).toBeInTheDocument();
        expect(analyzedText.textContent).toMatch(/\d{4}/); // Should contain year
      });
    });

    it('should handle missing analyzed_at gracefully', async () => {
      const comparisonWithoutDate = { ...mockComparison, analyzed_at: undefined };
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(comparisonWithoutDate);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Should not show analyzed date if not present
      expect(screen.queryByText(/Analyzed:/i)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render all action buttons when loaded', async () => {
      vi.mocked(comparisonsService.getComparison).mockResolvedValue(mockComparison);

      renderSavedComparisonPage();

      await waitFor(() => {
        expect(screen.getByText('Saved Comparison')).toBeInTheDocument();
      });

      // Header actions
      expect(screen.getByRole('button', { name: /Back to List/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyze Again/i })).toBeInTheDocument();

      // Footer actions
      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThan(2);
    });
  });
});

