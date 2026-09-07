export interface IngredientRow {
  key: number;
  insumoId: string;
  quantity: string;
}

/** Añade una fila de ingrediente nueva con clave incremental. Compartido por el alta y la edición de recetas. */
export function appendIngredientRow(rows: IngredientRow[], insumoId = ''): IngredientRow[] {
  const nextKey = rows.length ? Math.max(...rows.map((r) => r.key)) + 1 : 0;
  return [...rows, { key: nextKey, insumoId, quantity: '' }];
}
