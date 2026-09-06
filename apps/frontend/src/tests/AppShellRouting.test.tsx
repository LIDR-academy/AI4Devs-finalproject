import type { ReactElement } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../app/AppShell.js';
import { ProtectedRoute } from '../app/ProtectedRoute.js';
import { InventarioRoute } from '../app/routes/InventarioRoute.js';
import { RecetasRoute } from '../app/routes/RecetasRoute.js';
import { ReportesRoute } from '../app/routes/ReportesRoute.js';
import { BodegaRoute } from '../app/routes/BodegaRoute.js';
import { AjustesLayout } from '../app/routes/ajustes/AjustesLayout.js';
import { PersonalRoute, MovimientosRoute } from '../app/routes/ajustes/index.js';
import { router } from '../app/router.js';
import { AuthService } from '../features/auth/services/auth.service.js';

/** Smoke test del árbol real de `app/router.tsx` — detecta drift (p. ej. quitar un `<ProtectedRoute>`). */
describe('TK-085-FE: forma del árbol de rutas real (app/router.tsx)', () => {
  const shell = router.routes[0];
  const children = shell.children ?? [];
  const byPath = (p: string) => children.find((r) => r.path === p);

  it('la ruta raíz es una layout route sin path con AppShell', () => {
    expect(shell.path).toBeUndefined();
    expect(children.length).toBeGreaterThanOrEqual(6);
  });

  it('la ruta index y las rutas de sesión existen', () => {
    expect(children.some((r) => r.index)).toBe(true);
    expect(byPath('bodega')).toBeDefined();
    expect(byPath('estaciones')).toBeDefined(); // redirect legacy -> /bodega
    expect(byPath('recetas')).toBeDefined();
    expect(byPath('*')).toBeDefined();
  });

  // TK-121-FE (US-015 Esc. 2): el gating pasó de rol a permiso — un rol personalizado
  // con `reports:view` ve Reportes sin necesidad de llamarse ADMIN.
  it('/reportes y /ajustes están envueltas en <ProtectedRoute requiredPermission="...">', () => {
    const expected: Record<string, string> = { reportes: 'reports:view', ajustes: 'roles:manage' };
    for (const [path, permission] of Object.entries(expected)) {
      const el = byPath(path)?.element as ReactElement<{ requiredPermission?: string; requiredRole?: string }>;
      expect(el?.type).toBe(ProtectedRoute);
      expect(el?.props.requiredPermission).toBe(permission);
      expect(el?.props.requiredRole).toBeUndefined();
    }
  });

  it('/ajustes es un layout route con sub-rutas + index redirect (US-024, US-030, US-034)', () => {
    const ajustes = byPath('ajustes');
    const subPaths = (ajustes?.children ?? []).map((r) => r.path).filter(Boolean);
    expect(subPaths).toEqual(['configuracion', 'personal', 'roles', 'movimientos', 'motivos', 'ia']);
    expect((ajustes?.children ?? []).some((r) => r.index)).toBe(true); // <Navigate to="configuracion">
  });
});

/**
 * US-023 / TK-085-FE: shell de rutas + guarda por rol. Se prueban los mismos
 * componentes que monta `app/router.tsx`, pero con el `<MemoryRouter>` declarativo
 * (el data router `createMemoryRouter` no navega bajo jsdom por un choque de
 * realms de `AbortSignal` en undici — limitación del entorno, no del código).
 */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<InventarioRoute />} />
          <Route path="bodega" element={<BodegaRoute />} />
          <Route path="recetas" element={<RecetasRoute />} />
          <Route
            path="reportes"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ReportesRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="ajustes"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AjustesLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="personal" replace />} />
            <Route path="personal" element={<PersonalRoute />} />
            <Route path="movimientos" element={<MovimientosRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('TK-085-FE: Shell de rutas y ProtectedRoute (US-023)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin sesión, cualquier ruta muestra el login por PIN (US-023 Escenario 4)', () => {
    renderAt('/recetas');
    expect(screen.getByText(/Acceso Táctil de Operarios/i)).toBeInTheDocument();
  });

  it('con sesión de operario, la ruta index renderiza el Tablero FEFO dentro del shell', async () => {
    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    renderAt('/');
    await waitFor(() => expect(screen.getByText(/Tablero FEFO de Cocina/i)).toBeInTheDocument());
    expect(screen.getByRole('navigation', { name: /Navegación principal/i })).toBeInTheDocument();
  });

  it('un operario no-ADMIN que abre /reportes es redirigido a Inventario (US-023 Escenario 2)', async () => {
    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    renderAt('/reportes');
    await waitFor(() => expect(screen.getByText(/Tablero FEFO de Cocina/i)).toBeInTheDocument());
    expect(screen.queryByText(/Reporte de Mermas y Eficiencia/i)).not.toBeInTheDocument();
  });

  it('la nav de un operario no-ADMIN no incluye Reportes ni Ajustes', async () => {
    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    renderAt('/');
    await waitFor(() => expect(screen.getByRole('link', { name: /Inventario/i })).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /Reportes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ajustes/i })).not.toBeInTheDocument();
  });

  it('un ADMIN sí ve Reportes y Ajustes en la nav', async () => {
    AuthService.saveSession('t', { id: 'a1', name: 'Admin Uno', role: 'ADMIN' });
    renderAt('/');
    await waitFor(() => expect(screen.getByRole('link', { name: /Reportes/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Ajustes/i })).toBeInTheDocument();
  });

  it('D-1: en /bodega un operario no-ADMIN NO ve acciones de gestión (403 evitado)', async () => {
    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    renderAt('/bodega');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Bodega' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Extraer de Bodega/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo Insumo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ubicaciones/i })).not.toBeInTheDocument();
  });

  it('D-1: en /bodega un ADMIN sí ve "+ Nuevo Insumo" y "Ubicaciones"', async () => {
    AuthService.saveSession('t', { id: 'a1', name: 'Admin Uno', role: 'ADMIN' });
    renderAt('/bodega');
    await waitFor(() => expect(screen.getByRole('button', { name: /Nuevo Insumo/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Ubicaciones/i })).toBeInTheDocument();
  });

  it('US-024: /ajustes/personal deep-link renderiza la sección inline (sin overlay); no-ADMIN → /', async () => {
    AuthService.saveSession('t', { id: 'a1', name: 'Admin Uno', role: 'ADMIN' });
    const { container, unmount } = renderAt('/ajustes/personal');
    await waitFor(() => expect(screen.getByRole('heading', { name: /Gestión de Personal/i })).toBeInTheDocument());
    expect(screen.getByRole('navigation', { name: /Secciones de Ajustes/i })).toBeInTheDocument();
    expect(container.querySelector('[class*="modal-overlay"]')).toBeNull();
    unmount();

    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    renderAt('/ajustes/movimientos');
    await waitFor(() => expect(screen.getByText(/Tablero FEFO de Cocina/i)).toBeInTheDocument());
  });

  it('D-1: en /recetas el operario ve el recetario sin "+ Nueva Receta"; el ADMIN sí', async () => {
    AuthService.saveSession('t', { id: 'u1', name: 'Operario Uno', role: 'KITCHEN_STAFF' });
    const { unmount } = renderAt('/recetas');
    await waitFor(() => expect(screen.getByRole('heading', { name: /Recetario/i })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Nueva Receta/i })).not.toBeInTheDocument();
    unmount();

    AuthService.saveSession('t', { id: 'a1', name: 'Admin Uno', role: 'ADMIN' });
    renderAt('/recetas');
    await waitFor(() => expect(screen.getByRole('button', { name: /Nueva Receta/i })).toBeInTheDocument());
  });
});
