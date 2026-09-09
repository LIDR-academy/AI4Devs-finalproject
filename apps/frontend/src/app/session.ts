import { createContext, useContext } from 'react';

/**
 * Sesión y utilidades transversales que el `AppShell` inyecta a todas las rutas
 * hijas vía `<Outlet context>` (react-router 7). Evita prop-drilling de
 * `currentUser`/`onLogout` a través de cada ruta.
 */
export interface AppShellContext {
  currentUser: { id: string; name: string; role: string; mustChangePin?: boolean };
  onLogout: () => void;
  /** Re-lee la sesión desde `AuthService` (p. ej. tras rotar el PIN). */
  reloadUser: () => void;
}

export const AppShellCtx = createContext<AppShellContext | null>(null);

export function useAppShell(): AppShellContext {
  const ctx = useContext(AppShellCtx);
  if (!ctx) {
    throw new Error('useAppShell debe usarse dentro de <AppShell>.');
  }
  return ctx;
}
