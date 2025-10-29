import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import { Navbar } from './Navbar';

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithProviders = (component: React.ReactElement, authenticated = false, language = 'ca') => {
  // Set language before rendering
  i18n.changeLanguage(language);
  
  // Mock the useAuth hook
  mockUseAuth.mockReturnValue({
    authenticated,
    login: jest.fn(),
    logout: jest.fn(),
  });
  
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('Navbar i18n', () => {
  test('renders navigation labels in Catalan', () => {
    renderWithProviders(<Navbar />, false, 'ca');

    expect(screen.getByText('Inici')).toBeInTheDocument();
    // Only authenticated users see other nav items
    expect(screen.queryByText('Viatges')).not.toBeInTheDocument();
    expect(screen.queryByText('Cercar')).not.toBeInTheDocument();
    expect(screen.queryByText('Reserves')).not.toBeInTheDocument();
    expect(screen.queryByText('Historial')).not.toBeInTheDocument();
  });

  test('renders authentication buttons in Catalan', () => {
    renderWithProviders(<Navbar />, false, 'ca');

    expect(screen.getByText('Iniciar Sessió')).toBeInTheDocument();
  });

  test('renders authentication buttons in English', () => {
    renderWithProviders(<Navbar />, false, 'en');

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('maintains functionality with different languages', () => {
    renderWithProviders(<Navbar />, false, 'es');

    // Links should still work
    const homeLink = screen.getByText('Inicio').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('mobile menu shows translated labels in Catalan', () => {
    renderWithProviders(<Navbar />, false, 'ca');

    // Open mobile menu
    const hamburgerButton = screen.getByRole('button', { name: /Obrir menú|Open menu/i });
    fireEvent.click(hamburgerButton);

    expect(screen.getAllByText('Inici')).toHaveLength(2); // Desktop and mobile
    // Only authenticated users see other nav items
    expect(screen.queryByText('Viatges')).not.toBeInTheDocument();
  });

  test('mobile menu shows translated labels in English for authenticated user', () => {
    renderWithProviders(<Navbar />, true, 'en');

    // Open mobile menu
    const hamburgerButton = screen.getByRole('button', { name: /Obrir menú|Open menu/i });
    fireEvent.click(hamburgerButton);

    expect(screen.getAllByText('Home')).toHaveLength(2); // Desktop and mobile
    // Trips should be visible in both desktop and mobile for authenticated users
    expect(screen.getAllByText('Trips')).toHaveLength(2); // Desktop and mobile
  });
});
