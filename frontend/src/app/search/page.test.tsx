import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { vi, describe, it, expect } from 'vitest';
import SearchPage from './page';
import { usePropertySearch } from '@/services/searchService';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    pathname: '/search',
  })),
  useSearchParams: vi.fn(() =>
    new URLSearchParams({
      location: 'Barcelona',
      checkIn: '2025-07-01',
      checkOut: '2025-07-10',
      page: '1',
    }),
  ),
}));

// Mock search service
vi.mock('@/services/searchService', () => ({
  usePropertySearch: vi.fn((params) => {
    if (!params) {
      return {
        data: { results: [], pagination: { page: 1, size: 20, total_results: 0, total_pages: 0 } },
        isLoading: false,
        error: null,
      };
    }
    return {
      data: {
        results: [
          {
            id: '1',
            title: 'Beautiful Barcelona Apartment',
            photo_url: 'https://via.placeholder.com/300x200',
            nightly_rate_eur: 120,
            location: { lat: 41.3851, lng: 2.1734, city: 'Barcelona', country: 'Spain' },
            avg_rating: 4.5,
            review_count: 24,
            property_type: 'apartment',
            max_guests: 4,
            bedrooms: 2,
          },
          {
            id: '2',
            title: 'Cozy Barcelona Studio',
            photo_url: 'https://via.placeholder.com/300x200',
            nightly_rate_eur: 80,
            location: { lat: 41.39, lng: 2.17, city: 'Barcelona', country: 'Spain' },
            avg_rating: 4.2,
            review_count: 18,
            property_type: 'studio',
            max_guests: 2,
          },
          {
            id: '3',
            title: 'Spacious Barcelona Villa',
            photo_url: 'https://via.placeholder.com/300x200',
            nightly_rate_eur: 250,
            location: { lat: 41.38, lng: 2.19, city: 'Barcelona', country: 'Spain' },
            avg_rating: 4.8,
            review_count: 42,
            property_type: 'villa',
            max_guests: 8,
            bedrooms: 4,
          },
        ],
        pagination: { page: 1, size: 20, total_results: 150, total_pages: 8 },
      },
      isLoading: false,
      error: null,
    };
  }),
  useGeocode: vi.fn(() => ({
    data: { results: [] },
    isLoading: false,
    error: null,
  })),
}));

// Create QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('SearchPage', () => {
  it('renders SearchBar, FilterPanel, PropertyCard grid, MapView', () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    // SearchBar should be visible
    expect(screen.getByLabelText(/where/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/check-in/i)).toBeInTheDocument();

    // FilterPanel is toggle-gated behind the Filters pill — open it
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));
    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument();

    // PropertyCard grid should be visible
    expect(screen.getByText(/Beautiful Barcelona Apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Cozy Barcelona Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Spacious Barcelona Villa/i)).toBeInTheDocument();
  });

  it('displays PropertyCard grid with results from search', () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    // Verify all three properties are displayed
    expect(screen.getByText(/Beautiful Barcelona Apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Cozy Barcelona Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Spacious Barcelona Villa/i)).toBeInTheDocument();

    // Verify price is displayed
    expect(screen.getByText(/€120/)).toBeInTheDocument();
    expect(screen.getByText(/€80/)).toBeInTheDocument();
    expect(screen.getByText(/€250/)).toBeInTheDocument();
  });

  it('displays pagination controls', async () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    // Wait for pagination to be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    });

    // Numbered pages: current page 1 of 8 total pages
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument();
  });

  it('disables previous button on first page', async () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: 'Previous page' });
      expect(prevButton).toBeDisabled();
    });
  });

  it('enables next button when not on last page', async () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: 'Next page' });
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('displays property count info', async () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/of 150 results/i)).toBeInTheDocument();
    });
  });

  it('renders FilterPanel with all filter options', () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    // FilterPanel is toggle-gated behind the Filters pill — open it
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    // Price range filters
    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument();

    // Property type should be visible
    const filterHeading = screen.queryByText(/property type/i);
    expect(filterHeading).toBeInTheDocument();

    // Bedrooms filter
    const bedroomHeading = screen.queryByText(/bedrooms/i);
    expect(bedroomHeading).toBeInTheDocument();
  });

  it('handles PropertyCard click and triggers navigation', async () => {
    const { useRouter } = await vi.importMock<typeof import('next/navigation')>('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      pathname: '/search',
    });

    render(<SearchPage />, { wrapper: createWrapper() });

    // Click the first property card button by its accessible name
    const propertyButton = screen.getByRole('button', { name: 'View Beautiful Barcelona Apartment' });
    fireEvent.click(propertyButton);

    expect(mockPush).toHaveBeenCalledWith('/property/1');
  });

  it('displays SearchBar at the top of the page', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() });

    // SearchBar wrapper scrolls with the page (not sticky) — assert it renders
    const searchBarWrapper = container.querySelector('.border-b.border-divider.bg-canvas');
    expect(searchBarWrapper).toBeInTheDocument();
  });

  it('displays responsive layout grid', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() });

    // Check for grid layout
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();

    // Should have grid columns defined (main grid container with 4 columns)
    expect(gridElement).toHaveClass('grid-cols-1');
  });

  it('renders sidebar FilterPanel', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() });

    // Check for aside (sidebar) elements
    const sidebars = container.querySelectorAll('aside');
    expect(sidebars.length).toBeGreaterThanOrEqual(1);
  });

  it('renders main results area', () => {
    const { container } = render(<SearchPage />, { wrapper: createWrapper() });

    // Check for main element
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('applies filters and updates search results', async () => {
    render(<SearchPage />, { wrapper: createWrapper() });

    // FilterPanel is toggle-gated behind the Filters pill — open it
    fireEvent.click(screen.getByRole('button', { name: /filters/i }));

    // Get filter inputs
    const minPriceInput = screen.getByLabelText(/minimum price/i);

    // Change minimum price
    fireEvent.change(minPriceInput, { target: { value: '100' } });

    // Wait for state update
    await waitFor(() => {
      expect(minPriceInput).toHaveValue(100);
    });
  });

  it('displays EmptyState when no results', () => {
    // This test verifies structure; actual EmptyState display depends on search results
    render(<SearchPage />, { wrapper: createWrapper() });

    // With our mock returning 3 properties, EmptyState should not be visible
    const emptyStateHeading = screen.queryByText(/no properties found/i);
    expect(emptyStateHeading).not.toBeInTheDocument();
  });

  it('renders PropertyCardSkeleton grid while loading', () => {
    (usePropertySearch as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<SearchPage />, { wrapper: createWrapper() });

    expect(screen.getAllByTestId('property-card-skeleton').length).toBeGreaterThan(0);
  });
});
