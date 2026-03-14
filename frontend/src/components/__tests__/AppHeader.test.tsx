/**
 * AppHeader Tests
 *
 * Verifies the header renders correctly for authenticated users:
 * - Displays the user's name
 * - Displays the profile photo when available
 * - Omits the photo when urlFoto is null
 * - "Cerrar sesión" button calls logout and navigates to /login
 *
 * T010 acceptance: cabecera renderiza datos del perfil
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useAuthStore } from '@/state/authStore';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function TestApp() {
  return (
    <MemoryRouter>
      <AppHeader />
    </MemoryRouter>
  );
}

function resetStore() {
  useAuthStore.setState({ session: null, isLoading: false, error: null });
  localStorage.clear();
}

describe('AppHeader', () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    resetStore();
  });

  // ── No session ──────────────────────────────────────────────────────────────

  describe('when there is no session', () => {
    it('should render nothing', () => {
      const { container } = render(<TestApp />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ── With session ─────────────────────────────────────────────────────────────

  describe('when there is an active session', () => {
    const session = {
      token: 'jwt-token',
      nombre: 'Ana García',
      foto: 'https://lh3.googleusercontent.com/a/photo.jpg',
    };

    beforeEach(() => {
      useAuthStore.getState().setSession(session);
    });

    it('should render the user display name', () => {
      render(<TestApp />);
      expect(screen.getByTestId('header-user-name')).toHaveTextContent('Ana García');
    });

    it('should render the profile photo with alt text', () => {
      render(<TestApp />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', session.foto);
      expect(img).toHaveAttribute('alt', `Foto de perfil de ${session.nombre}`);
    });

    it('should render the logout button', () => {
      render(<TestApp />);
      expect(screen.getByTestId('header-logout-button')).toBeInTheDocument();
      expect(screen.getByTestId('header-logout-button')).toHaveTextContent('Cerrar sesión');
    });

    it('should not render a photo when foto is null', () => {
      useAuthStore.getState().setSession({ ...session, foto: null });
      render(<TestApp />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────────

  describe('logout action', () => {
    beforeEach(() => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'Ana', foto: null });
    });

    it('should clear session and navigate to /login when logout button is clicked', async () => {
      // Mock the logout fetch call (logout is best-effort)
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

      render(<TestApp />);
      fireEvent.click(screen.getByTestId('header-logout-button'));

      await waitFor(() => {
        expect(useAuthStore.getState().session).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });

    it('should navigate to /login even if the backend logout fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      render(<TestApp />);
      fireEvent.click(screen.getByTestId('header-logout-button'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });
  });
});
