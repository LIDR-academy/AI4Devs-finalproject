import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '../features/auth/services/auth.service.js';
import { useIdleTimeout } from '../shared/hooks/useIdleTimeout.js';

const IDLE_TIMEOUT_MINUTES = 15;

type SessionUser = { id: string; name: string; role: string; mustChangePin?: boolean };

/**
 * Estado de sesión transversal del `AppShell` (TK-085-FE). Concentra lo que antes
 * vivía disperso en `App.tsx`: usuario actual, aviso de sesión, cierre por
 * inactividad táctil (Guard 37) y el listener global `restostock:unauthorized`.
 */
export function useSession() {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => AuthService.getStoredUser());
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const reloadUser = useCallback(() => setCurrentUser(AuthService.getStoredUser()), []);

  const login = useCallback(() => {
    setSessionNotice(null);
    reloadUser();
  }, [reloadUser]);

  const logout = useCallback((notice?: string) => {
    AuthService.logout();
    setCurrentUser(null);
    setSessionNotice(notice ?? null);
  }, []);

  /** Muestra un aviso en la pantalla de login sin tocar la sesión (p. ej. tras resetear el PIN). */
  const notify = useCallback((notice: string) => setSessionNotice(notice), []);

  useEffect(() => {
    const handleUnauthorized = (e: Event) => {
      const detailMsg =
        (e as CustomEvent<{ message?: string }>).detail?.message ||
        'Tu sesión ha expirado por seguridad. Por favor, ingresa tu PIN nuevamente.';
      logout(detailMsg);
    };
    window.addEventListener('restostock:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('restostock:unauthorized', handleUnauthorized);
  }, [logout]);

  useIdleTimeout({
    timeoutMinutes: IDLE_TIMEOUT_MINUTES,
    isLoggedIn: !!currentUser && !currentUser.mustChangePin,
    onIdle: useCallback(
      () => logout('Sesión cerrada por inactividad táctil (15 minutos sin interacción).'),
      [logout],
    ),
  });

  return { currentUser, sessionNotice, login, logout, reloadUser, notify };
}
