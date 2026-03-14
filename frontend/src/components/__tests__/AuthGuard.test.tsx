/**
 * AuthGuard Tests
 *
 * Verifies the route guard behaviour:
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users see the matched child route (via <Outlet />).
 *
 * T009 acceptance: redirect to /login when accessing /library without a token.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuthStore } from '@/state/authStore';

// Minimal test application that replicates the App.tsx route structure
function TestApp({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<AuthGuard />}>
          <Route path="/" element={<div>Builder Page</div>} />
          <Route path="/library" element={<div>Library Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

const mockSession = { token: 'jwt-token', nombre: 'Ana', foto: null };

function resetStore() {
  useAuthStore.setState({ session: null, isLoading: false, error: null });
  localStorage.clear();
}

describe('AuthGuard', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  // ── Unauthenticated ─────────────────────────────────────────────────────────

  describe('when there is no active session', () => {
    it('should redirect to /login when accessing /', () => {
      render(<TestApp initialPath="/" />);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect to /login when accessing /library', () => {
      render(<TestApp initialPath="/library" />);
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should NOT render the protected page content', () => {
      render(<TestApp initialPath="/library" />);
      expect(screen.queryByText('Library Page')).not.toBeInTheDocument();
    });
  });

  // ── Authenticated ───────────────────────────────────────────────────────────

  describe('when there is an active session', () => {
    beforeEach(() => {
      useAuthStore.getState().setSession(mockSession);
    });

    it('should render the builder page at /', () => {
      render(<TestApp initialPath="/" />);
      expect(screen.getByText('Builder Page')).toBeInTheDocument();
    });

    it('should render the library page at /library', () => {
      render(<TestApp initialPath="/library" />);
      expect(screen.getByText('Library Page')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<TestApp initialPath="/" />);
      expect(screen.getByRole('link', { name: /create meditation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /library/i })).toBeInTheDocument();
    });

    it('should NOT redirect to /login', () => {
      render(<TestApp initialPath="/library" />);
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });
});
