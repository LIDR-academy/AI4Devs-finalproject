import React from 'react';
import { Pencil, Truck } from 'lucide-react';
import { InsumoItem } from '../services/stock.service.js';

interface ManageActionsProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
  onEdit: (insumo: InsumoItem) => void;
}

/** Botones "Editar" / "Reabastecer" — compartidos por la fila de tabla y la tarjeta de grilla del catálogo. */
export const InsumoManageActions: React.FC<ManageActionsProps> = ({ item, onRestock, onEdit }) => (
  <div className="flex-gap-xs flex-center">
    <button
      type="button"
      onClick={() => onEdit(item)}
      className="btn-touch btn-secondary flex-center flex-gap-xs"
      aria-label={`Editar ${item.name}`}
    >
      <Pencil size={16} />
      Editar
    </button>
    <button
      type="button"
      onClick={() => onRestock(item)}
      className="btn-touch btn-secondary flex-center flex-gap-xs"
    >
      <Truck size={16} />
      Reabastecer
    </button>
  </div>
);
