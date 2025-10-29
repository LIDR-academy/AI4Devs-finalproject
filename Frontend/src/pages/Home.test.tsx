import { render, screen } from '@testing-library/react';
import Home from './Home';
import { AuthProvider } from '../auth/AuthProvider';
import i18n from '../i18n/config';

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
  beforeAll(async () => {
    await i18n.changeLanguage('es');
  });

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
    expect(screen.getByText(i18n.t('home.getStarted') as string)).toBeInTheDocument();
  });

  it('edge: renders fallback language when missing key', async () => {
    await i18n.changeLanguage('fr');
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    // Title exists (will render FR if available, else fallback EN)
    expect(screen.getByText(/home\.title|bonÀreaGo/i)).toBeInTheDocument();
    await i18n.changeLanguage('es');
  });

  it('edge: shows auth actions based on auth state', () => {
    // Not authenticated: shows getStarted
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );
    expect(screen.getByText(i18n.t('home.getStarted') as string)).toBeInTheDocument();
  });
});

