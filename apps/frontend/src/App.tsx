import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.js';

/**
 * Punto de entrada del cliente. Desde `US-023`/`TK-085-FE` la aplicación es una
 * SPA con `react-router-dom` 7: toda la estructura (shell de comanda, topbar de
 * navegación, gating de sesión, tema Día/Noche) vive en `AppShell`, montado como
 * ruta raíz del `router`.
 */
const App: React.FC = () => <RouterProvider router={router} />;

export { App };
export default App;
