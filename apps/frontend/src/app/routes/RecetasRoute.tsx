import React from 'react';
import { RecipeCatalogPanel } from '../../features/recipes/components/RecipeCatalogPanel.js';
import { useAppShell } from '../session.js';

/**
 * Ruta Recetas (`/recetas`, US-023). Monta el Recetario bajo una ruta de operario;
 * las acciones de alta (ADMIN, `POST /recipes`) sólo se muestran a ADMIN (D-1, AUDIT-DEV-003).
 */
export const RecetasRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  return <RecipeCatalogPanel canManage={currentUser.role === 'ADMIN'} />;
};
