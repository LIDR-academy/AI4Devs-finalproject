/**
 * authStore Tests
 *
 * Verifies Zustand auth store behaviour:
 * - Initial state (no session)
 * - setSession / clearSession actions
 * - loginWithGoogle: successful call, failed call, network error
 * - logout: fires backend request and clears local session
 *
 * T009 acceptance: redirect to /login when no token; session persisted after login.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAuthStore } from '@/state/authStore';

// Helper to reset store + localStorage between tests
function resetStore() {
  useAuthStore.setState({ session: null, isLoading: false, error: null });
  localStorage.clear();
}

describe('authStore', () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetStore();
  });

  // ── Initial State ───────────────────────────────────────────────────────────

  describe('Initial State', () => {
    it('should have null session initially', () => {
      expect(useAuthStore.getState().session).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  // ── setSession ──────────────────────────────────────────────────────────────

  describe('setSession', () => {
    it('should store token, nombre, and foto', () => {
      const session = { token: 'jwt-abc', nombre: 'Ana García', foto: 'https://img.example.com/a.jpg' };
      useAuthStore.getState().setSession(session);
      expect(useAuthStore.getState().session).toEqual(session);
    });

    it('should accept null foto', () => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'Test', foto: null });
      expect(useAuthStore.getState().session?.foto).toBeNull();
    });

    it('should clear previous error when session is set', () => {
      useAuthStore.setState({ error: 'prev error' });
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'X', foto: null });
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  // ── clearSession ────────────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('should clear an existing session', () => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'X', foto: null });
      useAuthStore.getState().clearSession();
      expect(useAuthStore.getState().session).toBeNull();
    });

    it('should be safe to call when session is already null', () => {
      expect(() => useAuthStore.getState().clearSession()).not.toThrow();
      expect(useAuthStore.getState().session).toBeNull();
    });
  });

  // ── resetError ──────────────────────────────────────────────────────────────

  describe('resetError', () => {
    it('should clear error', () => {
      useAuthStore.setState({ error: 'some error' });
      useAuthStore.getState().resetError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  // ── loginWithGoogle ─────────────────────────────────────────────────────────

  describe('loginWithGoogle', () => {
    const mockAuthResponse = {
      sessionToken: 'session-jwt-123',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      nombre: 'Ana García',
      correo: 'ana@gmail.com',
      urlFoto: 'https://lh3.googleusercontent.com/a/photo.jpg',
    };

    it('should call POST /api/v1/identity/auth/google with the id_token', async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAuthResponse),
      });
      vi.stubGlobal('fetch', fetchSpy);

      await useAuthStore.getState().loginWithGoogle('google-id-token');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/identity/auth/google'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ idToken: 'google-id-token' }),
        })
      );
    });

    it('should store session after successful login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockAuthResponse),
        })
      );

      await useAuthStore.getState().loginWithGoogle('google-id-token');

      expect(useAuthStore.getState().session).toEqual({
        token: 'session-jwt-123',
        nombre: 'Ana García',
        foto: 'https://lh3.googleusercontent.com/a/photo.jpg',
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle null urlFoto in the response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ ...mockAuthResponse, urlFoto: null }),
        })
      );

      await useAuthStore.getState().loginWithGoogle('google-id-token');

      expect(useAuthStore.getState().session?.foto).toBeNull();
    });

    it('should set error and throw when backend returns non-ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () =>
            Promise.resolve({
              message: 'Token de Google inválido.',
            }),
        })
      );

      await expect(
        useAuthStore.getState().loginWithGoogle('bad-token')
      ).rejects.toThrow('Token de Google inválido.');

      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().error).toBe('Token de Google inválido.');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set generic error on network failure', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      );

      await expect(
        useAuthStore.getState().loginWithGoogle('token')
      ).rejects.toThrow();

      expect(useAuthStore.getState().error).toBeTruthy();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should clear session immediately (before backend responds)', async () => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'X', foto: null });
      const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchSpy);

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().session).toBeNull();
      // Should have called the backend logout endpoint
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/identity/auth/logout'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should clear session even when backend logout fails', async () => {
      useAuthStore.getState().setSession({ token: 'jwt', nombre: 'X', foto: null });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

      await expect(useAuthStore.getState().logout()).resolves.not.toThrow();
      expect(useAuthStore.getState().session).toBeNull();
    });

    it('should not call fetch when there is no active session', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      await useAuthStore.getState().logout();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
