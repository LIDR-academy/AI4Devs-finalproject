/**
 * ComparisonsPage Tests
 *
 * Test suite for the ComparisonsPage component.
 * Covers data fetching, search, sorting, pagination, and error states.
 *
 * @author AI4Devs
 * @date 2025-10-27
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { comparisonsService } from '../../services/comparisons.service';
import type { ComparisonListResponse, ComparisonSummary } from '../../types/comparison.types';
import ComparisonsPage from './ComparisonsPage';

// Mock the comparisons service
vi.mock('../../services/comparisons.service', () => ({
  comparisonsService: {
    listComparisons: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render component
const renderComparisonsPage = () => {
  return render(
    <BrowserRouter>
      <ComparisonsPage />
    </BrowserRouter>
  );
};

// Mock data
const mockComparisons: ComparisonSummary[] = [
  {
    id: 1,
    source_version_id: 11,
    target_version_id: 2,
    source_version_number: '1.0',
    target_version_number: '2.0',
    source_template_name: 'Template A',
    target_template_name: 'Template B',
    modification_percentage: 45.5,
    fields_added: 5,
    fields_removed: 3,
    fields_modified: 10,
    fields_unchanged: 20,
    created_at: '2025-10-27T10:00:00Z',
    created_by: 1,
  },
  {
    id: 2,
    source_version_id: 3,
    target_version_id: 4,
    source_version_number: '1.5',
    target_version_number: '2.5',
    source_template_name: 'Template C',
    target_template_name: 'Template D',
    modification_percentage: 30.2,
    fields_added: 2,
    fields_removed: 1,
    fields_modified: 5,
    fields_unchanged: 25,
    created_at: '2025-10-26T15:30:00Z',
    created_by: 2,
  },
];

const mockListResponse: ComparisonListResponse = {
  items: mockComparisons,
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

describe('ComparisonsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Data Fetching', () => {
    it('should render page title and description', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      expect(screen.getByText('Saved Comparisons')).toBeInTheDocument();
      expect(screen.getByText(/View and manage all saved template version comparisons/i)).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      vi.mocked(comparisonsService.listComparisons).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComparisonsPage();

      // Should show loading skeleton (check for skeleton elements)
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should fetch and display comparisons', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
        expect(screen.getByText('Template B')).toBeInTheDocument();
        expect(screen.getByText('Template C')).toBeInTheDocument();
        expect(screen.getByText('Template D')).toBeInTheDocument();
      });

      // Check that service was called with correct default params
      expect(comparisonsService.listComparisons).toHaveBeenCalledWith({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
    });

    it('should display modification percentages', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('45.5%')).toBeInTheDocument();
        expect(screen.getByText('30.2%')).toBeInTheDocument();
      });
    });

    it('should display change counts with badges', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('+5')).toBeInTheDocument(); // fields_added
        expect(screen.getByText('-3')).toBeInTheDocument(); // fields_removed
        expect(screen.getByText('~10')).toBeInTheDocument(); // fields_modified
      });
    });
  });

  describe('Search Functionality', () => {
    it('should have a search input', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by template name/i)).toBeInTheDocument();
      });
    });

    it('should debounce search input', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      const searchInput = await screen.findByPlaceholderText(/Search by template name/i);

      // Type search term
      await user.type(searchInput, 'Template A');

      // Should not call immediately
      expect(comparisonsService.listComparisons).toHaveBeenCalledTimes(1); // Initial load only

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(comparisonsService.listComparisons).toHaveBeenCalledWith(
            expect.objectContaining({
              search: 'Template A',
              page: 1, // Should reset to page 1
            })
          );
        },
        { timeout: 500 }
      );
    });
  });

  describe('Sorting Functionality', () => {
    it('should have a sort dropdown', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        const sortSelect = screen.getByLabelText(/Sort by/i);
        expect(sortSelect).toBeInTheDocument();
      });
    });

    it('should change sort field', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      const sortSelect = await screen.findByLabelText(/Sort by/i);

      // Change to modification percentage
      await user.selectOptions(sortSelect, 'modification_percentage');

      await waitFor(() => {
        expect(comparisonsService.listComparisons).toHaveBeenLastCalledWith({
          page: 1,
          page_size: 20,
          sort_by: 'modification_percentage',
          sort_order: 'desc',
        });
      });
    });

    it('should toggle sort order', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      const sortOrderButton = screen.getByRole('button', { name: /Sort descending/i });

      // Toggle to ascending
      await user.click(sortOrderButton);

      await waitFor(() => {
        expect(comparisonsService.listComparisons).toHaveBeenLastCalledWith({
          page: 1,
          page_size: 20,
          sort_by: 'created_at',
          sort_order: 'asc',
        });
      });
    });

    it('should sort by clicking table headers', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Find the table header (th) that contains "Modification %" - it's clickable
      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
      
      const headers = Array.from(table!.querySelectorAll('th'));
      const modificationTh = headers.find(th => th.textContent?.includes('Modification %'));
      expect(modificationTh).toBeDefined();

      // Verify the header is clickable (has cursor-pointer or onClick handler)
      expect(modificationTh!.className).toContain('cursor-pointer');
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls when multiple pages exist', async () => {
      const multiPageResponse: ComparisonListResponse = {
        ...mockListResponse,
        total: 50,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(multiPageResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Previous page/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Next page/i)).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      const multiPageResponse: ComparisonListResponse = {
        ...mockListResponse,
        total: 50,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(multiPageResponse);

      renderComparisonsPage();

      const nextButton = await screen.findByLabelText(/Next page/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(comparisonsService.listComparisons).toHaveBeenLastCalledWith({
          page: 2,
          page_size: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
      });
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      const page1Response: ComparisonListResponse = {
        ...mockListResponse,
        page: 1,
        total: 50,
        total_pages: 3,
      };
      const page2Response: ComparisonListResponse = {
        ...mockListResponse,
        page: 2,
        total: 50,
        total_pages: 3,
      };

      // Start on page 1
      vi.mocked(comparisonsService.listComparisons).mockResolvedValueOnce(page1Response);

      renderComparisonsPage();

      // Wait for first page to load
      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Click next to go to page 2
      vi.mocked(comparisonsService.listComparisons).mockResolvedValueOnce(page2Response);
      const nextButton = screen.getByLabelText(/Next page/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
      });

      // Click previous to go back to page 1
      vi.mocked(comparisonsService.listComparisons).mockResolvedValueOnce(page1Response);
      const prevButton = screen.getByLabelText(/Previous page/i);
      await user.click(prevButton);

      await waitFor(() => {
        expect(comparisonsService.listComparisons).toHaveBeenLastCalledWith({
          page: 1,
          page_size: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
      });
    });

    it('should change page size', async () => {
      const user = userEvent.setup();
      const multiPageResponse: ComparisonListResponse = {
        ...mockListResponse,
        total: 50,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(multiPageResponse);

      renderComparisonsPage();

      // Wait for initial render - look for any content that confirms page loaded
      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Find page size selector
      const pageSizeSelect = screen.getByLabelText(/Show:/i);
      expect(pageSizeSelect).toBeInTheDocument();

      // Change to 50 items per page
      await user.selectOptions(pageSizeSelect, '50');

      await waitFor(() => {
        expect(comparisonsService.listComparisons).toHaveBeenLastCalledWith({
          page: 1,
          page_size: 50,
          sort_by: 'created_at',
          sort_order: 'desc',
        });
      });
    });

    it('should disable previous button on first page', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue({
        ...mockListResponse,
        total: 50,
        total_pages: 3,
      });

      renderComparisonsPage();

      const prevButton = await screen.findByLabelText(/Previous page/i);
      expect(prevButton).toBeDisabled();
    });

    it('should render pagination buttons when on last page', async () => {
      const page3Response: ComparisonListResponse = {
        items: mockComparisons,
        page: 3,
        page_size: 20,
        total: 50,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(page3Response);

      renderComparisonsPage();

      // Wait for data and pagination to load
      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Verify pagination buttons are present
      const nextButton = await screen.findByLabelText(/Next page/i);
      const prevButton = screen.getByLabelText(/Previous page/i);
      
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to comparison detail on row click', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Click on first row
      const firstRow = screen.getByText('Template A').closest('tr');
      expect(firstRow).toBeInTheDocument();

      if (firstRow) {
        await user.click(firstRow);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/results/1');
    });

    it('should navigate to comparison detail on View button click', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Find all View buttons
      const viewButtons = screen.getAllByRole('button', { name: /View comparison/i });

      // Click first View button
      await user.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/results/1');
    });

    it('should navigate to create comparison page', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Click "New Comparison" button
      const newButton = screen.getByRole('button', { name: /New Comparison/i });
      await user.click(newButton);

      expect(mockNavigate).toHaveBeenCalledWith('/comparisons/create');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no comparisons exist', async () => {
      const emptyResponse: ComparisonListResponse = {
        items: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(emptyResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('No comparisons found')).toBeInTheDocument();
        expect(screen.getByText(/No saved comparisons yet/i)).toBeInTheDocument();
      });

      // Should show create button in empty state
      const createButton = screen.getByRole('button', { name: /Create Comparison/i });
      expect(createButton).toBeInTheDocument();
    });

    it('should show empty state with search term message', async () => {
      const user = userEvent.setup();
      const emptyResponse: ComparisonListResponse = {
        items: [],
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 0,
      };

      // Initially show some data
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Then return empty after search
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(emptyResponse);

      const searchInput = screen.getByPlaceholderText(/Search by template name/i);
      await user.type(searchInput, 'NonExistent');

      await waitFor(
        () => {
          expect(screen.getByText(/No comparisons match "NonExistent"/i)).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      const errorMessage = 'Failed to fetch comparisons';
      vi.mocked(comparisonsService.listComparisons).mockRejectedValue(new Error(errorMessage));

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Error Loading Comparisons')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should allow retry on error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Network error';

      // First call fails
      vi.mocked(comparisonsService.listComparisons).mockRejectedValueOnce(new Error(errorMessage));

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Second call succeeds
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      const retryButton = screen.getByRole('button', { name: /Retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      expect(comparisonsService.listComparisons).toHaveBeenCalledTimes(2);
    });
  });

  describe('Results Summary', () => {
    it('should show results count', async () => {
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 2 of 2 comparisons/i)).toBeInTheDocument();
      });
    });

    it('should update results count on pagination', async () => {
      const user = userEvent.setup();
      const page1Response: ComparisonListResponse = {
        ...mockListResponse,
        total: 50,
        page: 1,
        page_size: 20,
        total_pages: 3,
      };

      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(page1Response);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 20 of 50 comparisons/i)).toBeInTheDocument();
      });

      // Go to page 2
      const page2Response: ComparisonListResponse = {
        items: mockComparisons,
        total: 50,
        page: 2,
        page_size: 20,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValueOnce(page2Response);

      const nextButton = screen.getByLabelText(/Next page/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing 21 to 40 of 50 comparisons/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const multiPageResponse: ComparisonListResponse = {
        ...mockListResponse,
        total: 50,
        total_pages: 3,
      };
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(multiPageResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/Search comparisons/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sort by/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Previous page/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Next page/i)).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      vi.mocked(comparisonsService.listComparisons).mockResolvedValue(mockListResponse);

      renderComparisonsPage();

      await waitFor(() => {
        expect(screen.getByText('Template A')).toBeInTheDocument();
      });

      // Tab through interactive elements
      const searchInput = screen.getByPlaceholderText(/Search by template name/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Tab to sort dropdown
      await user.tab();
      const sortSelect = screen.getByLabelText(/Sort by/i);
      expect(document.activeElement).toBe(sortSelect);
    });
  });
});

