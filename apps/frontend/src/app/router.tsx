import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell.js';
import { ProtectedRoute } from './ProtectedRoute.js';
import { InventarioRoute } from './routes/InventarioRoute.js';
import { BodegaRoute } from './routes/BodegaRoute.js';
import { RecetasRoute } from './routes/RecetasRoute.js';
import { ReportesRoute } from './routes/ReportesRoute.js';
import { AjustesLayout } from './routes/ajustes/AjustesLayout.js';
import { ConfiguracionRoute, PersonalRoute, RolesRoute, MovimientosRoute, MotivosRoute } from './routes/ajustes/index.js';

/**
 * Shell de rutas del Sistema FEFO (US-023/TK-085-FE). Data router de
 * `react-router-dom` 7. Las operaciones transitorias (extracción, receta,
 * conciliación, descarte, formularios de alta/edición) NO son rutas — siguen
 * como modales lanzados desde su ruta padre. Reportes y Ajustes van tras
 * `<ProtectedRoute requiredRole="ADMIN">`; `/ajustes` es un layout route con
 * 5 sub-rutas inline deep-linkables (US-024; la sub-ruta `catalogo` se retiró
 * en TK-095-FE WS-3 por duplicar `/bodega` + `/recetas`; `motivos` se sumó en
 * TK-107-FE / ADR-004).
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <InventarioRoute /> },
      { path: 'bodega', element: <BodegaRoute /> },
      // TK-095-FE WS-3: `/estaciones` renombrada a `/bodega` (la página siempre fue el
      // catálogo de bodega, no las estaciones). Redirect para enlaces guardados.
      { path: 'estaciones', element: <Navigate to="/bodega" replace /> },
      { path: 'recetas', element: <RecetasRoute /> },
      {
        path: 'reportes',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <ReportesRoute />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ajustes',
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AjustesLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="configuracion" replace /> },
          { path: 'configuracion', element: <ConfiguracionRoute /> },
          { path: 'personal', element: <PersonalRoute /> },
          { path: 'roles', element: <RolesRoute /> },
          { path: 'movimientos', element: <MovimientosRoute /> },
          { path: 'motivos', element: <MotivosRoute /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
