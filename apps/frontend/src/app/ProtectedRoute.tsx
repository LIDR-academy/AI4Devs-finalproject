import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppShell } from './session.js';

interface ProtectedRouteProps {
  /** Rol exigido para ver la ruta. Sin este prop, basta con estar autenticado. */
  requiredRole?: string;
  children: React.ReactNode;
}

/**
 * Guarda de ruta (US-023/TK-085-FE). La sesión ya está garantizada por `AppShell`
 * (que renderiza `PinLoginModal` cuando no hay usuario), así que aquí solo se
 * comprueba el rol. Un usuario autenticado sin el rol requerido se redirige a
 * Inventario — mismo gating que antes aplicaba el menú de Administración.
 *
 * Realineación futura con `US-015` (Dynamic RBAC): hoy compara `currentUser.role`;
 * cuando exista la matriz de permisos granular, esta comprobación pasará a
 * consultar permisos, sin cambiar la forma del componente.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { currentUser } = useAppShell();

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
