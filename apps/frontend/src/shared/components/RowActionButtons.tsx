import React from 'react';

export interface RowAction {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

/**
 * Barra de botones "secundarios" de una fila/tarjeta (Editar, Reabastecer, Dar de baja…).
 * Fuente única para las acciones de gestión del catálogo de insumos y del recetario
 * (evita el clon entre `InsumoManageActions` y `RecipeManageActions`).
 */
export const RowActionButtons: React.FC<{ actions: RowAction[] }> = ({ actions }) => (
  <div className="flex-gap-xs flex-center">
    {actions.map((action) => (
      <button
        key={action.key}
        type="button"
        onClick={action.onClick}
        className="btn-touch btn-secondary flex-center flex-gap-xs"
        aria-label={action.ariaLabel}
      >
        {action.icon}
        {action.label}
      </button>
    ))}
  </div>
);
