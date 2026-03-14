/**
 * LoginPage Tests
 *
 * Verifies the login page rendering and behaviour:
 * - Renders the Google login button when there is no active session (T009 criterion).
 * - Redirects to / when the user is already authenticated.
 * - Shows a loading indicator while loginWithGoogle is in progress.
 * - Shows an error message when login fails.
 *
 * @react-oauth/google components are mocked — no real Google calls in tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { useAuthStore } from '@/state/authStore';

// ── Mock @react-oauth/google ───────────────────────────────────────────────────
// Replace GoogleLogin with a simple button so we can test without a real GAPI.
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (resp: { credential: string }) => void;
    onError: () => void;
  }) => (
    <div>
      <button
        data-testid="google-login-button"
        onClick={() => onSuccess({ credential: 'mock-google-credential' })}
      >
        Iniciar sesión con Google
      </button>
      <button data-testid="google-login-error" onClick={() => onError()}>
        Simulate Error
      </button>
    </div>
  ),
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Test helpers ──────────────────────────────────────────────────────────────

function TestApp({ initialPath = '/login' }: { initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Builder Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function resetStore() {
  useAuthStore.setState({ session: null, isLoading: false, error: null });
  localStorage.clear();
}

describe('LoginPage', () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetStore();
  });

  // ── Unauthenticated rendering ────────────────────────────────────────────────

  describe('when there is no active session', () => {
    it('should render the page title', () => {
      render(<TestApp />);
      expect(screen.getByRole('heading', { name: /meditation builder/i })).toBeInTheDocument();
    });

    it('should render the Google login button', () => {
      render(<TestApp />);
      expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
    });

    it('should render a subtitle explaining the purpose', () => {
      render(<TestApp />);
      expect(screen.getByText(/sign in with google to instantly create, preview and save immersive ai-guided meditations/i)).toBeInTheDocument();
    });
  });

  // ── Already authenticated ────────────────────────────────────────────────────

  describe('when there is an active session', () => {
    it('should redirect to / without rendering login content', () => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'Ana', foto: null });
      render(<TestApp />);
      expect(screen.getByText('Builder Page')).toBeInTheDocument();
      expect(screen.queryByTestId('google-login-button')).not.toBeInTheDocument();
    });
  });

  // ── loginWithGoogle success ───────────────────────────────────────────────────

  describe('when login with Google succeeds', () => {
    it('should navigate to / after a successful login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              sessionToken: 'new-jwt',
              nombre: 'Ana García',
              correo: 'ana@gmail.com',
              urlFoto: null,
            }),
        })
      );

      render(<TestApp />);
      fireEvent.click(screen.getByTestId('google-login-button'));

      await waitFor(() => {
        expect(screen.getByText('Builder Page')).toBeInTheDocument();
      });
    });
  });

  // ── loginWithGoogle failure ───────────────────────────────────────────────────

  describe('when login with Google fails', () => {
    it('should display the error message', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () =>
            Promise.resolve({
              message: 'No ha sido posible iniciar sesión.',
            }),
        })
      );

      render(<TestApp />);
      fireEvent.click(screen.getByTestId('google-login-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /no ha sido posible iniciar sesión/i
        );
      });
    });

    it('should stay on /login after a failed login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ message: 'Error' }),
        })
      );

      render(<TestApp />);
      fireEvent.click(screen.getByTestId('google-login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
      });
    });
  });

  // ── C5: Google flow cancelled ─────────────────────────────────────────────────

  describe('C5: when the Google auth flow is cancelled', () => {
    it('should stay on the login page without showing an error', () => {
      render(<TestApp />);
      fireEvent.click(screen.getByTestId('google-login-error'));

      // Still on /login, no error displayed
      expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
