import React from 'react';
import { Truck } from 'lucide-react';
import { InsumoItem } from '../services/stock.service.js';
import { RowActionButtons } from '../../../shared/components/RowActionButtons.js';
import { editRowAction } from '../../../shared/components/rowActionPresets.js';

interface ManageActionsProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
  onEdit: (insumo: InsumoItem) => void;
}

/** Botones "Editar" / "Reabastecer" — compartidos por la fila de tabla y la tarjeta de grilla del catálogo. */
export const InsumoManageActions: React.FC<ManageActionsProps> = ({ item, onRestock, onEdit }) => (
  <RowActionButtons
    actions={[
      editRowAction(item.name, () => onEdit(item)),
      { key: 'restock', icon: <Truck size={16} />, label: 'Reabastecer', onClick: () => onRestock(item) },
    ]}
  />
);
