import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { InsumoItem } from '../../stock/services/stock.service.js';
import { IngredientRow } from './recipeIngredientRow.js';

interface IngredientRowFieldsProps {
  row: IngredientRow;
  insumos: InsumoItem[];
  canRemove: boolean;
  includeEmptyOption?: boolean;
  onChange: (field: 'insumoId' | 'quantity', value: string) => void;
  onRemove: () => void;
}

/** Una fila editable de ingrediente (insumo + cantidad). Compartida por el alta y la edición de recetas. */
const IngredientRowFields: React.FC<IngredientRowFieldsProps> = ({
  row,
  insumos,
  canRemove,
  includeEmptyOption = false,
  onChange,
  onRemove,
}) => (
  <div className="flex-gap-xs">
    <select
      className="input-touch flex-2"
      value={row.insumoId}
      onChange={(e) => onChange('insumoId', e.target.value)}
      required
      aria-label="Insumo del ingrediente"
    >
      {includeEmptyOption && <option value="">Selecciona un insumo…</option>}
      {insumos.map((insumo) => (
        <option key={insumo.id} value={insumo.id}>
          {insumo.name} ({insumo.unitOfMeasure})
        </option>
      ))}
    </select>
    <input
      type="text"
      inputMode="decimal"
      className="input-touch flex-1"
      placeholder="Cantidad"
      value={row.quantity}
      onChange={(e) => onChange('quantity', e.target.value)}
      required
      aria-label="Cantidad del ingrediente"
    />
    <button
      type="button"
      className="btn-touch btn-secondary"
      onClick={onRemove}
      disabled={!canRemove}
      aria-label="Quitar ingrediente"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

interface IngredientRowsEditorProps {
  rows: IngredientRow[];
  insumos: InsumoItem[];
  includeEmptyOption?: boolean;
  onChangeRow: (key: number, field: 'insumoId' | 'quantity', value: string) => void;
  onRemoveRow: (key: number) => void;
  onAddRow: () => void;
}

/** Lista de filas de ingrediente + botón "Agregar Ingrediente". */
export const IngredientRowsEditor: React.FC<IngredientRowsEditorProps> = ({
  rows,
  insumos,
  includeEmptyOption,
  onChangeRow,
  onRemoveRow,
  onAddRow,
}) => (
  <>
    <div className="flex-column flex-gap-xs mb-2">
      {rows.map((row) => (
        <IngredientRowFields
          key={row.key}
          row={row}
          insumos={insumos}
          canRemove={rows.length > 1}
          includeEmptyOption={includeEmptyOption}
          onChange={(field, value) => onChangeRow(row.key, field, value)}
          onRemove={() => onRemoveRow(row.key)}
        />
      ))}
    </div>
    <button
      type="button"
      className="btn-touch btn-secondary flex-center flex-gap-xs mt-1"
      onClick={onAddRow}
    >
      <Plus size={16} />
      Agregar Ingrediente
    </button>
  </>
);
