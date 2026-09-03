import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell.js';
import { ProtectedRoute } from './ProtectedRoute.js';
import { InventarioRoute } from './routes/InventarioRoute.js';
import { EstacionesRoute } from './routes/EstacionesRoute.js';
import { RecetasRoute } from './routes/RecetasRoute.js';
import { ReportesRoute } from './routes/ReportesRoute.js';
import { AjustesRoute } from './routes/AjustesRoute.js';

/**
 * Shell de rutas del Sistema FEFO (US-023/TK-085-FE). Data router de
 * `react-router-dom` 7. Las operaciones transitorias (extracción, receta,
 * conciliación, descarte) NO son rutas — siguen como modales lanzados desde su
 * ruta padre. Reportes y Ajustes van tras `<ProtectedRoute requiredRole="ADMIN">`.
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <InventarioRoute /> },
      { path: 'estaciones', element: <EstacionesRoute /> },
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
            <AjustesRoute />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
