import { Pencil } from 'lucide-react';
import { RowAction } from './RowActionButtons.js';

/**
 * Acción "Editar" estándar de una fila de catálogo. Fuente única para el botón de edición
 * de insumos y de recetas (evita el clon entre `InsumoManageActions` y `RecipeManageActions`).
 */
export function editRowAction(targetName: string, onEdit: () => void): RowAction {
  return { key: 'edit', icon: <Pencil size={16} />, label: 'Editar', onClick: onEdit, ariaLabel: `Editar ${targetName}` };
}
