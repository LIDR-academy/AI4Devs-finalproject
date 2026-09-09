import React from 'react';
import { Trash2 } from 'lucide-react';
import { RecipeListItem } from '../services/recipes.service.js';
import { RowActionButtons } from '../../../shared/components/RowActionButtons.js';
import { editRowAction } from '../../../shared/components/rowActionPresets.js';

interface RecipeManageActionsProps {
  item: RecipeListItem;
  onEdit: (recipe: RecipeListItem) => void;
  onDelete: (recipe: RecipeListItem) => void;
}

/** Botones "Editar" / "Dar de baja" — solo visibles para ADMIN en el recetario (US-037/TK-131-FE). */
export const RecipeManageActions: React.FC<RecipeManageActionsProps> = ({ item, onEdit, onDelete }) => (
  <RowActionButtons
    actions={[
      editRowAction(item.name, () => onEdit(item)),
      {
        key: 'delete',
        icon: <Trash2 size={16} />,
        label: 'Dar de baja',
        onClick: () => onDelete(item),
        ariaLabel: `Dar de baja ${item.name}`,
      },
    ]}
  />
);
