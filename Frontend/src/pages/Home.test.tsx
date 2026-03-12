import { render, screen } from '@testing-library/react';
import Home from './Home';
import { AuthProvider } from '../auth/AuthProvider';

jest.mock('../auth/keycloak', () => {
  return {
    getKeycloak: () => ({
      token: undefined,
      init: jest.fn().mockResolvedValue(false),
      login: jest.fn(),
      logout: jest.fn(),
      updateToken: jest.fn().mockResolvedValue(false),
    }),
  };
});

describe('Home', () => {
  it('renders hero section with title', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(/bonÀreaGo/i)).toBeInTheDocument();
  });

  it('renders main tagline', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(/Tu plataforma corporativa para compartir viajes/i)).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(/Comparte tu Viaje/i)).toBeInTheDocument();
    expect(screen.getByText(/Encuentra Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahorra Costos/i)).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(/¿Cómo funciona?/i)).toBeInTheDocument();
    expect(screen.getByText(/Crea tu Viaje/i)).toBeInTheDocument();
    expect(screen.getByText(/Busca Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Reserva y Viaja/i)).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(/Comenzar Ahora/i)).toBeInTheDocument();
  });
});

