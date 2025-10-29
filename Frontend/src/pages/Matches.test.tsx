import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Matches from './Matches';
import { MatchesService } from '../api/matches';
import { BookingsService } from '../api/bookings';
import type { MatchDto } from '../types/api';
import i18n from '../i18n/config';

// Mock MapPreview to avoid react-leaflet ESM issues in Jest
jest.mock('../components/map/MapPreview', () => () => <div data-testid="map-preview" />);

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

  beforeAll(async () => {
    await i18n.changeLanguage('es');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock BookingsService to return empty array by default
    (BookingsService.getMyBookings as jest.Mock).mockResolvedValue([]);
  });

  it('renders matches page title', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    // Title exists in Spanish (or fallback key) - may appear in button too
    expect(screen.getAllByText(/Buscar Viajes|title/i).length).toBeGreaterThan(0);
  });

  it('renders search form', () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    render(<Matches />);
    // First row has 4 controls: direction + sede + time + origin
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1);
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
    
    // Fill form (direction defaults to TO_SEDE)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '40.4168,-3.7038' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);
    
    await waitFor(() => {
      expect(MatchesService.findMatches).toHaveBeenCalledWith(expect.objectContaining({
        direction: 'TO_SEDE',
        destinationSedeId: 'SEDE-1',
        origin: '40.4168,-3.7038',
      }));
    });
  });

  it('switches to FROM_SEDE and requires originSedeId', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);

    render(<Matches />);

    // Switch direction using the first combobox (DirectionFilter)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'FROM_SEDE' } });

    // Now originSede selector should be present as the second combobox
    const updatedSelects = screen.getAllByRole('combobox');
    fireEvent.change(updatedSelects[1], { target: { value: 'SEDE-2' } });

    // Submit
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);

    await waitFor(() => {
      expect(MatchesService.findMatches).toHaveBeenCalledWith(expect.objectContaining({
        direction: 'FROM_SEDE',
        originSedeId: 'SEDE-2',
      }));
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
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);
    
    await waitFor(() => {
      // Less brittle checks (translated UI or key fallback)
      expect(screen.getByText(/Viaje a|match\.tripTo/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Ubicación cercana')).toBeInTheDocument();
      expect(screen.getByText('Horario compatible')).toBeInTheDocument();
    });
  });

  it('shows score badges with correct colors', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    
    render(<Matches />);
    
    // Perform search
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);
    
    await waitFor(() => {
      const scoreBadge = screen.getByText('Excelente (85%)');
      expect(scoreBadge).toHaveClass('text-green-600', 'bg-green-100');
    });
  });

  it('shows no results message when no matches found', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    
    render(<Matches />);
    
    // Perform search
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);
    
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
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);

    await waitFor(() => {
      expect(screen.getByText(/Encontrados|results\.title/i)).toBeInTheDocument();
    });

    const reservedBtn = screen.getByRole('button', { name: /Ya Reservado/i });
    expect(reservedBtn).toBeDisabled();
  });

  it('calls createBooking when reserving an available trip and updates UI', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue(mockMatches);
    (BookingsService.getMyBookings as jest.Mock).mockResolvedValue([]);
    (BookingsService.createBooking as jest.Mock).mockResolvedValue({ id: 'b2' });

    // Mock prompt to choose 1 seat
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('1');

    render(<Matches />);

    // Perform search
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'SEDE-1' } });
    const submitBtn = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn!);

    // Reserve -> opens seat selection modal
    const reserveBtn = await screen.findByRole('button', { name: /Reservar Viaje|match\.book/i });
    expect(reserveBtn).toBeEnabled();
    fireEvent.click(reserveBtn);

    // Select 1 seat and confirm
    const selectOneSeat = await screen.findByRole('button', { name: /Select 1 seat/i });
    fireEvent.click(selectOneSeat);
    const confirmBtn = await screen.findByRole('button', { name: /Confirmar Reserva/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(BookingsService.createBooking).toHaveBeenCalledWith({ tripId: 'trip1', seatsRequested: 1 });
    });

    promptSpy.mockRestore();
  });

  it('clears search when clear button is clicked', async () => {
    (MatchesService.findMatches as jest.Mock).mockResolvedValue([]);
    
    render(<Matches />);
    
    // Perform search
    const selects4 = screen.getAllByRole('combobox');
    fireEvent.change(selects4[1], { target: { value: 'SEDE-1' } });
    const submitBtn4 = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn4!);
    
    await waitFor(() => {
      expect(screen.getByText(/No se encontraron viajes|results\.empty/i)).toBeInTheDocument();
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
    const selects5 = screen.getAllByRole('combobox');
    fireEvent.change(selects5[1], { target: { value: 'SEDE-1' } });
    const submitBtn5 = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn5!);
    
    await waitFor(() => {
      expect(screen.getByText(/Buscando|search\.searching/i)).toBeInTheDocument();
    });
  });

  it('shows alert on API error', async () => {
    (MatchesService.findMatches as jest.Mock).mockRejectedValue(new Error('network'));
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Matches />);
    
    // Perform search
    const selects6 = screen.getAllByRole('combobox');
    fireEvent.change(selects6[1], { target: { value: 'SEDE-1' } });
    const submitBtn6 = screen.getAllByRole('button').find(b => (b as HTMLButtonElement).type === 'submit') || screen.getAllByRole('button')[0];
    fireEvent.click(submitBtn6!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
