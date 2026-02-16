/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import DoctorSearch from '@/app/components/search/DoctorSearch';
import * as doctorsApi from '@/lib/api/doctors';

// Mock de Google Maps
jest.mock('@react-google-maps/api', () => ({
  useLoadScript: jest.fn(() => ({
    isLoaded: true,
    loadError: null,
  })),
  GoogleMap: ({ children }: { children: React.ReactNode }) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div data-testid="info-window">{children}</div>,
}));

// Mock de geolocalización
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation as Geolocation,
  configurable: true,
});

// Mock de la API
jest.mock('@/lib/api/doctors', () => ({
  searchDoctors: jest.fn(),
  getSpecialties: jest.fn(),
}));

// Mock de useAuthStore
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    accessToken: 'test-token',
  })),
}));

// Mock de useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({ locale: 'es' }),
}));

const messages = {
  search: {
    title: 'Buscar Médicos',
    specialty: 'Especialidad',
    selectSpecialty: 'Selecciona una especialidad',
    useMyLocation: 'Usar mi ubicación',
    gettingLocation: 'Obteniendo ubicación...',
    postalCode: 'Código postal',
    postalCodePlaceholder: 'Ej: 06000',
    radius: 'Radio de búsqueda',
    date: 'Fecha',
    optional: 'Opcional',
    search: 'Buscar',
    searching: 'Buscando...',
    yourLocation: 'Tu ubicación',
    resultsFound: '{count} resultados encontrados',
    noResults: 'No se encontraron médicos',
    searchError: 'Error al buscar médicos',
    googleMapsError: 'Error al cargar Google Maps',
    reviews: 'reseñas',
    viewProfile: 'Ver perfil',
    viewAvailability: 'Ver disponibilidad',
    previous: 'Anterior',
    next: 'Siguiente',
    pageInfo: 'Página {current} de {total}',
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider messages={messages} locale="es">
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe('DoctorSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (doctorsApi.getSpecialties as jest.Mock).mockResolvedValue([
      { id: '1', nameEs: 'Cardiología', nameEn: 'Cardiology', isActive: true },
      { id: '2', nameEs: 'Dermatología', nameEn: 'Dermatology', isActive: true },
    ]);
  });

  it('debe renderizar el formulario de búsqueda', () => {
    render(<DoctorSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Buscar Médicos')).toBeInTheDocument();
    expect(screen.getByLabelText(/Especialidad/)).toBeInTheDocument();
    expect(screen.getByText('Usar mi ubicación')).toBeInTheDocument();
  });

  it('debe mostrar campo de código postal cuando no hay geolocalización', () => {
    render(<DoctorSearch />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText('Ej: 06000')).toBeInTheDocument();
  });

  it('debe solicitar geolocalización al hacer clic en el botón', async () => {
    const mockPosition = {
      coords: {
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    };

    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback) => {
      success(mockPosition);
      }
    );

    render(<DoctorSearch />, { wrapper: createWrapper() });

    const locationButton = screen.getByText('Usar mi ubicación');
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('debe cargar especialidades al montar el componente', async () => {
    render(<DoctorSearch />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(doctorsApi.getSpecialties).toHaveBeenCalled();
    });
  });

  it('debe mostrar resultados cuando se completa una búsqueda', async () => {
    const mockResults = {
      doctors: [
        {
          id: '1',
          firstName: 'Juan',
          lastName: 'García',
          specialties: [{ id: '1', nameEs: 'Cardiología', nameEn: 'Cardiology', isPrimary: false }],
          address: 'Av. Reforma 123',
          distanceKm: 2.5,
          ratingAverage: 4.5,
          totalReviews: 10,
          verificationStatus: 'approved',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    (doctorsApi.searchDoctors as jest.Mock).mockResolvedValue(mockResults);

    render(<DoctorSearch />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Cardiología' })).toBeInTheDocument();
    });

    // Seleccionar especialidad
    const specialtySelect = screen.getByLabelText(/Especialidad/);
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    // Ingresar código postal
    const postalCodeInput = screen.getByPlaceholderText('Ej: 06000');
    fireEvent.change(postalCodeInput, { target: { value: '06000' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Buscar' })).not.toBeDisabled();
    });

    // Enviar formulario
    const searchButton = screen.getByText('Buscar');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(doctorsApi.searchDoctors).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Juan García')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay resultados', async () => {
    (doctorsApi.searchDoctors as jest.Mock).mockResolvedValue({
      doctors: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    render(<DoctorSearch />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Cardiología' })).toBeInTheDocument();
    });

    const specialtySelect = screen.getByLabelText(/Especialidad/);
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    const postalCodeInput = screen.getByPlaceholderText('Ej: 06000');
    fireEvent.change(postalCodeInput, { target: { value: '06000' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Buscar' })).not.toBeDisabled();
    });

    const searchButton = screen.getByText('Buscar');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron médicos/)).toBeInTheDocument();
    });
  });

  it('debe manejar errores de geolocalización', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: PositionCallback, error?: PositionErrorCallback) => {
        if (error) {
          error({
            code: 1,
            message: 'Permission denied',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        }
      }
    );

    render(<DoctorSearch />, { wrapper: createWrapper() });

    const locationButton = screen.getByText('Usar mi ubicación');
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/Permiso de ubicación denegado/)).toBeInTheDocument();
    });
  });
});
