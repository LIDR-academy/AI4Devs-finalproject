import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportsDashboard } from '../../features/reports/components/ReportsDashboard.js';
import { useAppShell } from '../session.js';

/**
 * Ruta Reportes (`/reportes`, US-023) — protegida a `ADMIN` por `<ProtectedRoute>`.
 * `ReportsDashboard` conserva su forma de panel; `onClose` vuelve a Inventario.
 */
export const ReportesRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppShell();
  return <ReportsDashboard isOpen userRole={currentUser.role} onClose={() => navigate('/')} />;
};
