import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Matches from './Matches';
import { BookingsService } from '../api';

// Mock de las dependencias
jest.mock('../api', () => ({
  MatchesService: {
    searchMatches: jest.fn(),
  },
  BookingsService: {
    createBooking: jest.fn(),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'matches.search.title': 'Search trips',
        'matches.search.destination': 'Destination',
        'matches.search.time': 'Time',
        'matches.search.origin': 'Origin',
        'matches.search.search': 'Search',
        'matches.search.searching': 'Searching...',
        'matches.results.title': 'Found {count} compatible trips',
        'matches.results.empty': 'No trips found',
        'matches.match.driver': 'Driver',
        'matches.match.departure': 'Departure',
        'matches.match.arrival': 'Arrival',
        'matches.match.seats': 'Seats',
        'matches.match.book': 'Book Trip',
        'matches.match.selectSeats': 'Select Seats',
        'matches.match.availableSeats': 'Available seats: {seats}',
        'matches.match.selectSeatsDescription': 'Choose how many seats you want to book',
        'matches.match.orEnterManually': 'Or enter manually:',
        'matches.match.confirmBooking': 'Confirm Booking',
        'matches.match.bookingSuccess': 'Booking created successfully! {seats} seat(s) reserved.',
        'matches.match.bookingError': 'Error creating booking',
        'common:cancel': 'Cancel'
      };
      return translations[key] || key;
    }
  })
}));

jest.mock('../env', () => ({
  env: {
    VITE_MATCHES_API_BASE_URL: 'http://localhost:8080/api'
  }
}));

// Mock de MapPreview
jest.mock('../components/map/MapPreview', () => {
  return function MockMapPreview() {
    return <div data-testid="map-preview">Map Preview</div>;
  };
});

// Mock de TrustProfile
jest.mock('../components/trust/TrustProfile', () => {
  return function MockTrustProfile() {
    return <div data-testid="trust-profile">Trust Profile</div>;
  };
});

// Mock de RatingForm
jest.mock('../components/trust/RatingForm', () => {
  return function MockRatingForm() {
    return <div data-testid="rating-form">Rating Form</div>;
  };
});

describe('Matches Integration Tests', () => {
  const mockMatches = [
    {
      id: '1',
      tripId: 'trip-1',
      driverId: 'driver-1',
      origin: 'Madrid',
      destinationSedeId: 'SEDE-1',
      dateTime: '2024-01-15T08:00:00Z',
      seatsFree: 3,
      score: 0.8,
      reasons: ['Same destination', 'Similar time']
    },
    {
      id: '2',
      tripId: 'trip-2',
      driverId: 'driver-2',
      origin: 'Barcelona',
      destinationSedeId: 'SEDE-2',
      dateTime: '2024-01-15T09:00:00Z',
      seatsFree: 2,
      score: 0.6,
      reasons: ['Same destination']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (BookingsService.createBooking as jest.Mock).mockResolvedValue({});
  });

  describe('Seat Selection Modal Integration', () => {
    it('should open seat selection modal when booking button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock the search results
      const { MatchesService } = require('../api');
      MatchesService.searchMatches.mockResolvedValue(mockMatches);

      render(<Matches />);

      // Fill search form
      const destinationSelect = screen.getAllByRole('combobox')[1];
      await user.selectOptions(destinationSelect, 'SEDE-1');

      const timeInput = screen.getByLabelText('search.time');
      await user.type(timeInput, '08:00');

      const originInput = screen.getByLabelText('search.origin');
      await user.type(originInput, '40.4168,-3.7038');

      // Submit search
      const searchButton = screen.getByRole('button');
      await user.click(searchButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Book Trip')).toBeInTheDocument();
      });

      // Click booking button
      const bookingButtons = screen.getAllByText('Book Trip');
      await user.click(bookingButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Select Seats')).toBeInTheDocument();
        expect(screen.getByText('Available seats: 3')).toBeInTheDocument();
      });
    });

    it('should show seat selection buttons for available seats', async () => {
      const user = userEvent.setup();
      
      const { MatchesService } = require('../api');
      MatchesService.searchMatches.mockResolvedValue([mockMatches[0]]);

      render(<Matches />);

      // Perform search and open modal
      await user.selectOptions(screen.getAllByRole('combobox')[1], 'SEDE-1');
      await user.type(screen.getByLabelText('search.time'), '08:00');
      await user.type(screen.getByLabelText('search.origin'), '40.4168,-3.7038');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Book Trip')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Book Trip'));

      await waitFor(() => {
        // Should show buttons for 1, 2, 3 seats
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();
      });
    });

    it('should create booking when seat selection is confirmed', async () => {
      const user = userEvent.setup();
      
      const { MatchesService } = require('../api');
      MatchesService.searchMatches.mockResolvedValue([mockMatches[0]]);

      render(<Matches />);

      // Perform search and open modal
      await user.selectOptions(screen.getAllByRole('combobox')[1], 'SEDE-1');
      await user.type(screen.getByLabelText('search.time'), '08:00');
      await user.type(screen.getByLabelText('search.origin'), '40.4168,-3.7038');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Book Trip')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Book Trip'));

      await waitFor(() => {
        expect(screen.getByText('Select Seats')).toBeInTheDocument();
      });

      // Select 2 seats and confirm
      await user.click(screen.getByText('2'));
      await user.click(screen.getByText('Confirm Booking'));

      // Should call booking service
      await waitFor(() => {
        expect(BookingsService.createBooking).toHaveBeenCalledWith({
          tripId: 'trip-1',
          seatsRequested: 2
        });
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      const { MatchesService } = require('../api');
      MatchesService.searchMatches.mockResolvedValue([mockMatches[0]]);

      render(<Matches />);

      // Perform search and open modal
      await user.selectOptions(screen.getAllByRole('combobox')[1], 'SEDE-1');
      await user.type(screen.getByLabelText('search.time'), '08:00');
      await user.type(screen.getByLabelText('search.origin'), '40.4168,-3.7038');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Book Trip')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Book Trip'));

      await waitFor(() => {
        expect(screen.getByText('Select Seats')).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByText('Cancel'));

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Select Seats')).not.toBeInTheDocument();
      });
    });

    it('should handle manual seat input', async () => {
      const user = userEvent.setup();
      
      const { MatchesService } = require('../api');
      MatchesService.searchMatches.mockResolvedValue([mockMatches[0]]);

      render(<Matches />);

      // Perform search and open modal
      await user.selectOptions(screen.getByRole('combobox'), 'SEDE-1');
      await user.type(screen.getByPlaceholderText('08:30'), '08:00');
      await user.type(screen.getByPlaceholderText('40.4168,-3.7038'), '40.4168,-3.7038');
      await user.click(screen.getByText('Search'));

      await waitFor(() => {
        expect(screen.getByText('Book Trip')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Book Trip'));

      await waitFor(() => {
        expect(screen.getByText('Select Seats')).toBeInTheDocument();
      });

      // Use manual input
      const manualInput = screen.getByDisplayValue('1');
      await user.clear(manualInput);
      await user.type(manualInput, '2');

      // Confirm booking
      await user.click(screen.getByText('Confirm Booking'));

      // Should call booking service with 2 seats
      await waitFor(() => {
        expect(BookingsService.createBooking).toHaveBeenCalledWith({
          tripId: 'trip-1',
          seatsRequested: 2
        });
      });
    });
  });
});
