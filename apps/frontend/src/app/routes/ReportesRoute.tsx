import React from 'react';
import { ReportsDashboard } from '../../features/reports/components/ReportsDashboard.js';
import { useAppShell } from '../session.js';

/**
 * Ruta Reportes (`/reportes`, US-023 / US-024) — protegida a `ADMIN` por `<ProtectedRoute>`.
 * `ReportsDashboard` se renderiza inline en el `<main>` del shell (no como modal).
 */
export const ReportesRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  return <ReportsDashboard userRole={currentUser.role} />;
};
