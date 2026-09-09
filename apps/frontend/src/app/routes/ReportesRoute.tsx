import React from 'react';
import { ReportsDashboard } from '../../features/reports/components/ReportsDashboard.js';

/**
 * Ruta Reportes (`/reportes`, US-023 / US-024) — desde `TK-121-FE` protegida por el
 * permiso `reports:view` vía `<ProtectedRoute>`, no por el rol. `ReportsDashboard` se
 * renderiza inline en el `<main>` del shell (no como modal).
 */
export const ReportesRoute: React.FC = () => <ReportsDashboard />;
