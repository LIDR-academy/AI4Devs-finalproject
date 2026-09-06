import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppShell } from './session.js';
import { usePermissions } from '../shared/hooks/usePermissions.js';

interface ProtectedRouteProps {
  /** Rol exigido para ver la ruta. Sin este prop, basta con estar autenticado. */
  requiredRole?: string;
  /** US-015 Esc. 2 / TK-121-FE: código de `Permission` exigido. Preferido sobre `requiredRole`. */
  requiredPermission?: string;
  children: React.ReactNode;
}

/**
 * Guarda de ruta (US-023/TK-085-FE). La sesión ya está garantizada por `AppShell`
 * (que renderiza `PinLoginModal` cuando no hay usuario). Un usuario autenticado que
 * no cumple el requisito se redirige a Inventario.
 *
 * Desde `TK-121-FE` la comprobación preferida es por **permiso** (`requiredPermission`),
 * tal como anticipaba la nota anterior de este componente; `requiredRole` se mantiene
 * para cualquier ruta que aún no haya migrado. Esto NO es un control de acceso: el
 * backend rechaza igual con `403` a quien esquive la navegación.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, requiredPermission, children }) => {
  const { currentUser } = useAppShell();
  const { has } = usePermissions();

  if (requiredPermission && !has(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
