import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { History } from './History';
import { TripsService } from '../api/trips';
import { BookingsService } from '../api/bookings';
import type { TripDto, BookingDto } from '../types/api';

// Mock the services
jest.mock('../api/trips');
jest.mock('../api/bookings');

const mockTripsService = TripsService as jest.Mocked<typeof TripsService>;
const mockBookingsService = BookingsService as jest.Mocked<typeof BookingsService>;

const mockTrips: TripDto[] = [
  {
    id: 'trip-1',
    driverId: 'user-1',
    origin: { lat: 40.4168, lng: -3.7038 },
    destinationSedeId: 'SEDE-1',
    dateTime: '2025-01-15T08:00:00Z',
    seatsTotal: 4,
    seatsFree: 2,
  },
  {
    id: 'trip-2',
    driverId: 'user-1',
    origin: { lat: 40.4168, lng: -3.7038 },
    destinationSedeId: 'SEDE-2',
    dateTime: '2024-12-01T08:00:00Z', // Past date
    seatsTotal: 4,
    seatsFree: 1,
  },
];

const mockBookings: BookingDto[] = [
  {
    id: 'booking-1',
    tripId: 'trip-3',
    passengerId: 'user-1',
    seatsRequested: 1,
    status: 'CONFIRMED',
  },
  {
    id: 'booking-2',
    tripId: 'trip-4',
    passengerId: 'user-1',
    seatsRequested: 2,
    status: 'PENDING',
  },
];

describe('History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading spinner initially', () => {
    mockTripsService.getAllTrips.mockReturnValue(new Promise(() => {})); // Never resolves
    mockBookingsService.getMyBookings.mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render history page with title and statistics', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Historial de Viajes')).toBeInTheDocument();
    });

    // Check statistics cards
    expect(screen.getByText('Total Viajes')).toBeInTheDocument();
    expect(screen.getByText('CO₂ Ahorrado')).toBeInTheDocument();
    expect(screen.getByText('Km Compartidos')).toBeInTheDocument();

    // Check calculated stats (2 trips + 2 bookings = 4 total)
    expect(screen.getByText('4')).toBeInTheDocument(); // Total trips
    expect(screen.getByText('9.2 kg')).toBeInTheDocument(); // CO2 (4 * 2.3)
    expect(screen.getByText('60 km')).toBeInTheDocument(); // Km (4 * 15)
  });

  it('should render filters section', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Desde')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Rol')).toBeInTheDocument();
    expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
  });

  it('should display trips and bookings in history list', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for trip items
      expect(screen.getByText('SEDE-1')).toBeInTheDocument();
      expect(screen.getByText('SEDE-2')).toBeInTheDocument();

      // Check for booking items
      expect(screen.getAllByText(/Viaje ID:/i)).toHaveLength(2);
    });
  });

  it('should display status badges correctly', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for status badges (at least one of each type)
      expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0); // Past trip(s)
      expect(screen.getAllByText('CONFIRMED').length).toBeGreaterThan(0); // Confirmed booking
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0); // Pending booking
    });
  });

  it('should display role badges (Conductor/Pasajero)', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      const conductorBadges = screen.getAllByText('Conductor');
      const pasajeroBadges = screen.getAllByText('Pasajero');

      // At least 2 trips and 2 bookings (may include select options)
      expect(conductorBadges.length).toBeGreaterThanOrEqual(2);
      expect(pasajeroBadges.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should display empty state when no history items', async () => {
    mockTripsService.getAllTrips.mockResolvedValue([]);
    mockBookingsService.getMyBookings.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron viajes en el historial.')).toBeInTheDocument();
    });
  });

  it('should display error message when loading fails', async () => {
    mockTripsService.getAllTrips.mockRejectedValue(new Error('Network error'));
    mockBookingsService.getMyBookings.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar el historial/i)).toBeInTheDocument();
    });
  });

  it('should call services on mount', async () => {
    mockTripsService.getAllTrips.mockResolvedValue(mockTrips);
    mockBookingsService.getMyBookings.mockResolvedValue(mockBookings);

    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockTripsService.getAllTrips).toHaveBeenCalledTimes(1);
      expect(mockBookingsService.getMyBookings).toHaveBeenCalledTimes(1);
    });
  });
});

