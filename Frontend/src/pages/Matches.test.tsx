import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Matches from './Matches';
import { MatchesService } from '../api/matches';
import { BookingsService } from '../api/bookings';
import type { MatchDto } from '../types/api';

// Mock the API services
jest.mock('../api/matches', () => ({
  MatchesService: {
    findMatches: jest.fn(),
  },
}));

jest.mock('../api/bookings', () => ({
  BookingsService: {
    getMyBookings: jest.fn(),
    createBooking: jest.fn(),
  },
}));

describe('Matches', () => {
  const mockMatches: MatchDto[] = [
    {
      id: '1',
      tripId: 'trip1',
      driverId: 'driver1',
      origin: '40.4168,-3.7038',
      destinationSedeId: 'SEDE-1',
      dateTime: '2024-01-01T08:00:00Z',
      seatsFree: 2,
      score: 0.85,
      reasons: ['Ubicación cercana', 'Horario compatible'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock BookingsService to return empty array by default
    (BookingsService.getMyBookings as jest.Mock).mockResolvedValue([]);
  });

  it('renders matches page title', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    
    expect(screen.getAllByText('Buscar Viajes')[0]).toBeInTheDocument();
  });

  it('renders search form', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    
    expect(screen.getByLabelText('Destino')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora Preferida (HH:MM)')).toBeInTheDocument();
    expect(screen.getByLabelText('Ubicación de Origen (lat,lng)')).toBeInTheDocument();
    expect(screen.getAllByText('Buscar Viajes')[1]).toBeInTheDocument();
  });

  it('shows initial state message', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    
    expect(screen.getByText('Busca tu viaje ideal')).toBeInTheDocument();
    expect(screen.getByText('Completa el formulario de búsqueda para encontrar viajes compatibles con tu ubicación y horario.')).toBeInTheDocument();
  });

  it('performs search when form is submitted', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    
    render(<Matches />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.change(screen.getByLabelText('Hora Preferida (HH:MM)'), { target: { value: '08:30' } });
    fireEvent.change(screen.getByLabelText('Ubicación de Origen (lat,lng)'), { target: { value: '40.4168,-3.7038' } });
    
    // Submit form
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      expect(MatchesService.findMatches).toHaveBeenCalledWith({
        destinationSedeId: 'SEDE-1',
        time: '08:30',
        origin: '40.4168,-3.7038',
      });
    });
  });

  it('shows disabled submit when no destination selected', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    const submit = screen.getAllByText('Buscar Viajes')[1].closest('button');
    expect(submit).toBeDisabled();
  });

  it('displays search results', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    
    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      expect(screen.getByText('Encontrados 1 viajes compatibles')).toBeInTheDocument();
      expect(screen.getByText('Viaje a SEDE-1')).toBeInTheDocument();
      // Texto dividido en <strong>Asientos disponibles:</strong> 2
      expect(screen.getByText('Asientos disponibles:', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Ubicación cercana')).toBeInTheDocument();
      expect(screen.getByText('Horario compatible')).toBeInTheDocument();
    });
  });

  it('shows score badges with correct colors', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    
    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      const scoreBadge = screen.getByText('Excelente (85%)');
      expect(scoreBadge).toHaveClass('text-green-600', 'bg-green-100');
    });
  });

  it('shows no results message when no matches found', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    
    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      expect(screen.getByText('No se encontraron viajes')).toBeInTheDocument();
      expect(screen.getByText('No hay viajes disponibles que coincidan con tus criterios de búsqueda.')).toBeInTheDocument();
    });
  });

  it('disables reserve button when trip is already reserved', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    // Simulate existing booking for the trip
    (BookingsService.getMyBookings as jest.Mock).mockResolvedValueOnce([
      { id: 'b1', tripId: 'trip1', passengerId: 'uX', seatsRequested: 1, status: 'PENDING', createdAt: '', updatedAt: '' },
    ]);

    render(<Matches />);

    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);

    await waitFor(() => {
      expect(screen.getByText('Encontrados 1 viajes compatibles')).toBeInTheDocument();
    });

    const reserveBtn = screen.getByRole('button', { name: /Reservar Viaje/i });
    expect(reserveBtn).toBeDisabled();
  });

  it('calls createBooking when reserving an available trip and updates UI', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    (BookingsService.getMyBookings as jest.Mock).mockResolvedValue([]);
    (BookingsService.createBooking as jest.Mock).mockResolvedValue({ id: 'b2' });

    // Mock prompt to choose 1 seat
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('1');

    render(<Matches />);

    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);

    const reserveBtn = await screen.findByRole('button', { name: /Reservar Viaje/i });
    expect(reserveBtn).toBeEnabled();

    fireEvent.click(reserveBtn);

    await waitFor(() => {
      expect(BookingsService.createBooking).toHaveBeenCalledWith({ tripId: 'trip1', seatsRequested: 1 });
    });

    // After booking, the trip should be marked as reserved (badge present)
    await waitFor(() => {
      expect(screen.getByText('Ya reservado')).toBeInTheDocument();
    });

    promptSpy.mockRestore();
  });

  it('clears search when clear button is clicked', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    
    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      expect(screen.getByText('No se encontraron viajes')).toBeInTheDocument();
    });
    
    // Clear search
    fireEvent.click(screen.getByText('Limpiar Búsqueda'));
    
    await waitFor(() => {
      expect(screen.getByText('Busca tu viaje ideal')).toBeInTheDocument();
    });
  });

  it('handles search button loading state', async () => {
    (MatchesService.findMatches as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);
    
    await waitFor(() => {
      expect(screen.getByText('Buscando...')).toBeInTheDocument();
    });
  });

  it('shows alert on API error', async () => {
    (MatchesService.findMatches as jest.Mock).mockRejectedValue(new Error('network'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Matches />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('Destino'), { target: { value: 'SEDE-1' } });
    fireEvent.click(screen.getAllByText('Buscar Viajes')[1]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
