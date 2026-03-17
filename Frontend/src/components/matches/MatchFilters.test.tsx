import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import MatchFilters, { FilterOptions } from './MatchFilters';
import type { MatchDto } from '../../types/api';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

const mockMatches: MatchDto[] = [
  {
    id: 'match-1',
    tripId: 'trip-1',
    driverId: 'driver-1',
    score: 0.9,
    status: 'PENDING',
    origin: '40.4168,-3.7038',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-15T08:30:00Z',
    seatsFree: 4,
    reasons: ['Same route'],
    direction: 'TO_SEDE',
    pairedTripId: null
  },
  {
    id: 'match-2',
    tripId: 'trip-2',
    driverId: 'driver-2',
    score: 0.6,
    status: 'PENDING',
    origin: '40.4200,-3.7000',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-15T09:00:00Z',
    seatsFree: 2,
    reasons: ['Similar time'],
    direction: 'TO_SEDE',
    pairedTripId: null
  },
  {
    id: 'match-3',
    tripId: 'trip-3',
    driverId: 'driver-3',
    score: 0.3,
    status: 'PENDING',
    origin: '40.4100,-3.7100',
    destinationSedeId: 'SEDE-1',
    dateTime: '2024-01-16T08:00:00Z',
    seatsFree: 1,
    reasons: ['Different route'],
    direction: 'TO_SEDE',
    pairedTripId: null
  }
];

describe('MatchFilters', () => {
  const mockOnFilteredMatches = jest.fn();
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders filter controls correctly', () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Filter Results')).toBeInTheDocument();
    expect(screen.getByText('Minimum Score')).toBeInTheDocument();
    expect(screen.getByText('Minimum Seats')).toBeInTheDocument();
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
  });

  it('applies score filter correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '70' } });

    await waitFor(() => {
      expect(mockOnFilteredMatches).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ score: 0.9 })
        ])
      );
    });
  });

  it('applies seats filter correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const seatsSelect = screen.getByDisplayValue('1 seat');
    fireEvent.change(seatsSelect, { target: { value: '3' } });

    await waitFor(() => {
      expect(mockOnFilteredMatches).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ seatsFree: 4 })
        ])
      );
    });
  });

  it('applies date filters correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const dateFromInput = screen.getByLabelText('From Date');
    fireEvent.change(dateFromInput, { target: { value: '2024-01-15' } });

    await waitFor(() => {
      expect(mockOnFilteredMatches).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ dateTime: '2024-01-15T08:30:00Z' }),
          expect.objectContaining({ dateTime: '2024-01-15T09:00:00Z' })
        ])
      );
    });
  });

  it('sorts by score correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const sortBySelect = screen.getByDisplayValue('Score');
    fireEvent.change(sortBySelect, { target: { value: 'score' } });

    await waitFor(() => {
      const filteredMatches = mockOnFilteredMatches.mock.calls[0][0];
      expect(filteredMatches[0].score).toBeGreaterThanOrEqual(filteredMatches[1].score);
    });
  });

  it('sorts by date correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const sortBySelect = screen.getByDisplayValue('Score');
    fireEvent.change(sortBySelect, { target: { value: 'date' } });

    await waitFor(() => {
      const filteredMatches = mockOnFilteredMatches.mock.calls[0][0];
      const date1 = new Date(filteredMatches[0].dateTime);
      const date2 = new Date(filteredMatches[1].dateTime);
      expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
    });
  });

  it('sorts by seats correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const sortBySelect = screen.getByDisplayValue('Score');
    fireEvent.change(sortBySelect, { target: { value: 'seats' } });

    await waitFor(() => {
      const filteredMatches = mockOnFilteredMatches.mock.calls[0][0];
      expect(filteredMatches[0].seatsFree).toBeGreaterThanOrEqual(filteredMatches[1].seatsFree);
    });
  });

  it('changes sort order correctly', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const sortOrderSelect = screen.getByDisplayValue('Descending');
    fireEvent.change(sortOrderSelect, { target: { value: 'asc' } });

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: 'asc' })
      );
    });
  });

  it('shows active filter count', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '50' } });

    await waitFor(() => {
      expect(screen.getByTestId('active-count')).toBeInTheDocument();
    });
  });

  it('shows filter chips for active filters', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '50' } });

    await waitFor(() => {
      expect(screen.getByTestId('score-chip')).toBeInTheDocument();
    });
  });

  it('removes filter chips when clicked', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '50' } });

    await waitFor(() => {
      const chip = screen.getByTestId('score-chip');
      const removeButton = chip.querySelector('button');
      fireEvent.click(removeButton!);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('score-chip')).not.toBeInTheDocument();
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '50' } });

    await waitFor(() => {
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('score-chip')).not.toBeInTheDocument();
    });
  });

  it('persists filters to localStorage', async () => {
    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const scoreSlider = screen.getByRole('slider');
    fireEvent.change(scoreSlider, { target: { value: '70' } });

    await waitFor(() => {
      const savedFilters = localStorage.getItem('matchFilters');
      expect(savedFilters).toBeTruthy();
      const parsed = JSON.parse(savedFilters!);
      expect(parsed.minScore).toBe(70);
    });
  });

  it('loads filters from localStorage on mount', () => {
    const savedFilters = {
      minScore: 60,
      minSeats: 2,
      dateFrom: '2024-01-15',
      dateTo: '',
      sortBy: 'score',
      sortOrder: 'desc'
    };
    localStorage.setItem('matchFilters', JSON.stringify(savedFilters));

    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorage.setItem('matchFilters', 'invalid json');

    renderWithI18n(
      <MatchFilters
        matches={mockMatches}
        onFilteredMatches={mockOnFilteredMatches}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    // Should not crash and should use default values
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });
});
