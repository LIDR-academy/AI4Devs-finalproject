import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { RecipesService, RecipeListItem, UpdateRecipeRequest } from '../services/recipes.service.js';
import { InsumoItem } from '../../stock/services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { IngredientRowsEditor } from './RecipeIngredientRows.js';
import { IngredientRow, appendIngredientRow } from './recipeIngredientRow.js';

interface EditRecipeModalProps {
  isOpen: boolean;
  recipe: RecipeListItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function toRows(recipe: RecipeListItem): IngredientRow[] {
  return recipe.ingredients.map((ing, idx) => ({ key: idx, insumoId: ing.insumoId, quantity: String(ing.quantity) }));
}

function sameIngredients(recipe: RecipeListItem, rows: IngredientRow[]): boolean {
  const a = recipe.ingredients.map((i) => `${i.insumoId}:${i.quantity}`).join('|');
  const b = rows.map((r) => `${r.insumoId}:${r.quantity.trim()}`).join('|');
  return a === b;
}

/** Solo envía los campos que cambiaron; `''` en descripción → `null` (limpiar). */
function buildPatch(
  recipe: RecipeListItem,
  name: string,
  category: string,
  description: string,
  rows: IngredientRow[]
): UpdateRecipeRequest {
  const patch: UpdateRecipeRequest = {};
  if (name.trim() && name.trim() !== recipe.name) patch.name = name.trim();
  if (category.trim() && category.trim() !== recipe.category) patch.category = category.trim();

  const nextDesc = description.trim() === '' ? null : description.trim();
  if (nextDesc !== (recipe.description ?? null)) patch.description = nextDesc;

  if (!sameIngredients(recipe, rows)) {
    patch.ingredients = rows.map((r) => ({ insumoId: r.insumoId, quantity: r.quantity.trim() }));
  }
  return patch;
}

function useInsumosCatalog(isOpen: boolean) {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    RecipesService.listInsumos().then(setInsumos).catch(() => setInsumos([]));
  }, [isOpen]);
  return insumos;
}

function useEditRecipeForm(recipe: RecipeListItem | null, onSuccess: (m: string) => void, onClose: () => void) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipe) return;
    setName(recipe.name);
    setCategory(recipe.category);
    setDescription(recipe.description ?? '');
    setRows(toRows(recipe));
    setError(null);
  }, [recipe]);

  const setRow = (key: number, field: 'insumoId' | 'quantity', value: string) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((prev) => appendIngredientRow(prev));
  const removeRow = (key: number) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;
    if (!name.trim()) {
      setError('El nombre de la receta no puede estar vacío.');
      return;
    }
    const patch = buildPatch(recipe, name, category, description, rows);
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await RecipesService.updateRecipe(recipe.id, patch);
      onSuccess(`Receta "${name.trim()}" actualizada.`);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al editar la receta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name, setName, category, setCategory, description, setDescription,
    rows, setRow, addRow, removeRow, isSubmitting, error, handleSubmit,
  };
}

const EditRecipeFields: React.FC<{ form: ReturnType<typeof useEditRecipeForm>; insumos: InsumoItem[] }> = ({
  form,
  insumos,
}) => (
  <>
    {form.error && <ErrorBanner message={form.error} />}

    <label htmlFor="edit-recipe-name" className="form-label">Nombre</label>
    <input id="edit-recipe-name" type="text" value={form.name} onChange={(e) => form.setName(e.target.value)}
      className="input-touch w-full mb-4" required maxLength={120} />

    <label htmlFor="edit-recipe-category" className="form-label">Categoría</label>
    <input id="edit-recipe-category" type="text" value={form.category} onChange={(e) => form.setCategory(e.target.value)}
      className="input-touch w-full mb-4" required maxLength={60} />

    <label htmlFor="edit-recipe-description" className="form-label">Descripción (opcional)</label>
    <input id="edit-recipe-description" type="text" value={form.description}
      onChange={(e) => form.setDescription(e.target.value)} placeholder="Vacío la deja sin descripción"
      className="input-touch w-full mb-4" maxLength={500} />

    <span className="form-label">Ingredientes</span>
    <IngredientRowsEditor
      rows={form.rows}
      insumos={insumos}
      includeEmptyOption
      onChangeRow={form.setRow}
      onRemoveRow={form.removeRow}
      onAddRow={form.addRow}
    />
  </>
);

export const EditRecipeModal: React.FC<EditRecipeModalProps> = ({ isOpen, recipe, onClose, onSuccess }) => {
  const form = useEditRecipeForm(recipe, onSuccess, onClose);
  const insumos = useInsumosCatalog(isOpen);

  if (!isOpen || !recipe) return null;

  return (
    <Modal size="md">
      <ModalHeader icon={<Pencil className="text-primary-color" />} title="Editar Receta" onClose={onClose} />
      <p className="text-secondary-color mb-4 fs-sm">
        Si la receta ya tiene preparaciones cerradas, solo se podrán guardar nombre, categoría y descripción.
      </p>
      <form onSubmit={form.handleSubmit}>
        <EditRecipeFields form={form} insumos={insumos} />
        <ModalFooterActions
          onCancel={onClose}
          confirmLabel="Guardar Cambios"
          submittingLabel="Guardando..."
          isSubmitting={form.isSubmitting}
        />
      </form>
    </Modal>
  );
};
