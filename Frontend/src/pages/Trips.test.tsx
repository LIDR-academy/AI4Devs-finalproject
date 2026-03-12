import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Trips from './Trips';
import { TripsService } from '../api';
import type { TripDto } from '../types/api';

// Mock the API service (mock the same module the component imports)
jest.mock('../api');

describe('Trips', () => {
  const mockTrips: TripDto[] = [
    {
      id: '1',
      driverId: 'driver1',
      origin: { lat: 40.4168, lng: -3.7038 },
      destinationSedeId: 'SEDE-1',
      dateTime: '2024-01-01T08:00:00Z',
      seatsTotal: 4,
      seatsFree: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trips page title', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    
    render(<Trips />);
    
    await waitFor(() => {
      expect(screen.getByText('Mis Viajes')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    jest.mocked(TripsService.getAllTrips).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Trips />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('displays trips when loaded', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue(mockTrips);
    
    render(<Trips />);
    
    await waitFor(() => {
      expect(screen.getByText('Viaje a SEDE-1')).toBeInTheDocument();
      expect(screen.getByText('2 / 4 disponibles')).toBeInTheDocument();
    });
  });

  it('shows create trip button', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    
    render(<Trips />);
    
    await waitFor(() => {
      expect(screen.getByText('Crear Viaje')).toBeInTheDocument();
    });
  });

  it('shows create form when create button is clicked', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    
    render(<Trips />);
    
    const createButton = await screen.findByText('Crear Viaje');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Viaje')).toBeInTheDocument();
      expect(screen.getByLabelText('Latitud de Origen *')).toBeInTheDocument();
      expect(screen.getByLabelText('Longitud de Origen *')).toBeInTheDocument();
      expect(screen.getByLabelText('Destino *')).toBeInTheDocument();
      expect(screen.getByLabelText('Fecha y Hora *')).toBeInTheDocument();
      expect(screen.getByLabelText('Asientos Totales *')).toBeInTheDocument();
    });
  });

  it('shows empty state when no trips exist', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    
    render(<Trips />);
    
    await waitFor(() => {
      expect(screen.getByText('No tienes viajes creados')).toBeInTheDocument();
      expect(screen.getByText('Crea tu primer viaje para comenzar a compartir con tus compañeros')).toBeInTheDocument();
    });
  });

  it('submits form and creates trip', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    jest.mocked(TripsService.createTrip).mockResolvedValue(mockTrips[0]);
    
    render(<Trips />);
    
    // Open form
    fireEvent.click(await screen.findByText('Crear Viaje'));
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Viaje')).toBeInTheDocument();
    });
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Latitud de Origen *'), { target: { value: '40.4168' } });
    fireEvent.change(screen.getByLabelText('Longitud de Origen *'), { target: { value: '-3.7038' } });
    fireEvent.change(screen.getByLabelText('Destino *'), { target: { value: 'SEDE-1' } });
    // Use a future date to avoid validation errors
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().slice(0, 16);
    fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { target: { value: futureDateString } });
    fireEvent.change(screen.getByLabelText('Asientos Totales *'), { target: { value: '4' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Crear Viaje'));
    
    await waitFor(() => {
      expect(TripsService.createTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: { lat: 40.4168, lng: -3.7038 },
          destinationSedeId: 'SEDE-1',
          dateTime: expect.stringMatching(/Z$/),
          seatsTotal: 4,
        })
      );
    });
  });

  it('handles form cancellation', async () => {
    jest.mocked(TripsService.getAllTrips).mockResolvedValue([]);
    
    render(<Trips />);
    
    // Open form
    fireEvent.click(await screen.findByText('Crear Viaje'));
    
    await waitFor(() => {
      expect(screen.getByText('Crear Nuevo Viaje')).toBeInTheDocument();
    });
    
    // Cancel form
    fireEvent.click(screen.getAllByText('Cancelar')[1]);
    
    await waitFor(() => {
      expect(screen.queryByText('Crear Nuevo Viaje')).not.toBeInTheDocument();
    });
  });
});
