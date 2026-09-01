import React, { useEffect, useState } from 'react';
import { Utensils, Plus, Trash2 } from 'lucide-react';
import { RecipesService } from '../services/recipes.service.js';
import { InsumoItem } from '../../stock/services/stock.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';

interface CreateRecipeFormProps {
  onCreated: (message: string) => void;
}

interface IngredientRow {
  key: number;
  insumoId: string;
  quantity: string;
}

function useInsumosCatalog() {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    RecipesService.listInsumos()
      .then(setInsumos)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Error cargando el catálogo de insumos.'));
  }, []);

  return { insumos, loadError };
}

function useCreateRecipeForm(onCreated: (message: string) => void, defaultInsumoId: string) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ key: 0, insumoId: defaultInsumoId, quantity: '' }]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Los insumos cargan de forma asincronica DESPUES de que useState fije su valor
  // inicial (siempre '' en el primer render) — sin este efecto, la fila unica y
  // no tocada por el usuario queda enviando un insumoId vacio (400) aunque el
  // <select> ya muestre visualmente el primer insumo real como seleccionado.
  useEffect(() => {
    if (!defaultInsumoId) return;
    setIngredients((prev) => (prev.length === 1 && prev[0].insumoId === '' ? [{ ...prev[0], insumoId: defaultInsumoId }] : prev));
  }, [defaultInsumoId]);

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, { key: prev.length ? Math.max(...prev.map((r) => r.key)) + 1 : 0, insumoId: defaultInsumoId, quantity: '' }]);
  };

  const removeIngredientRow = (key: number) => {
    setIngredients((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const updateIngredientRow = (key: number, field: 'insumoId' | 'quantity', value: string) => {
    setIngredients((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await RecipesService.createRecipe({
        name,
        category,
        ingredients: ingredients.map(({ insumoId, quantity }) => ({ insumoId, quantity })),
      });
      onCreated(`Receta "${name}" creada (ID ${result.recipeId}) con ${ingredients.length} ingrediente(s).`);
      setName('');
      setCategory('');
      setIngredients([{ key: 0, insumoId: defaultInsumoId, quantity: '' }]);
    } catch (err) {
      // No se cae en un fallback de éxito silencioso — un alta de receta fallida
      // debe verse como error real (ej. insumo inexistente → 404), nunca como si
      // la receta se hubiera creado.
      setError(err instanceof Error ? err.message : 'Error creando la receta.');
    }
    setIsSubmitting(false);
  };

  return { name, setName, category, setCategory, ingredients, addIngredientRow, removeIngredientRow, updateIngredientRow, error, isSubmitting, handleSubmit };
}

const IngredientRowFields: React.FC<{
  row: IngredientRow;
  insumos: InsumoItem[];
  canRemove: boolean;
  onChange: (field: 'insumoId' | 'quantity', value: string) => void;
  onRemove: () => void;
}> = ({ row, insumos, canRemove, onChange, onRemove }) => (
  <div className="flex-gap-xs">
    <select
      className="input-touch flex-2"
      value={row.insumoId}
      onChange={(e) => onChange('insumoId', e.target.value)}
      required
      aria-label="Insumo del ingrediente"
    >
      {insumos.map((insumo) => (
        <option key={insumo.id} value={insumo.id}>
          {insumo.name} ({insumo.unitOfMeasure})
        </option>
      ))}
    </select>
    <input
      type="text"
      className="input-touch flex-1"
      placeholder="Cantidad"
      value={row.quantity}
      onChange={(e) => onChange('quantity', e.target.value)}
      required
      aria-label="Cantidad del ingrediente"
    />
    <button
      type="button"
      className="btn-touch btn-secondary ingredient-row-remove-btn"
      onClick={onRemove}
      disabled={!canRemove}
      aria-label="Quitar ingrediente"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const RecipeBasicFields: React.FC<{
  name: string;
  onNameChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}> = ({ name, onNameChange, category, onCategoryChange }) => (
  <>
    <div>
      <label htmlFor="input-new-recipe-name" className="form-label">
        Nombre de la Receta:
      </label>
      <input
        type="text"
        id="input-new-recipe-name"
        className="input-touch w-full"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        minLength={2}
      />
    </div>

    <div>
      <label htmlFor="input-new-recipe-category" className="form-label">
        Categoría:
      </label>
      <input
        type="text"
        id="input-new-recipe-category"
        className="input-touch w-full"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        required
        minLength={2}
        placeholder="Pizzas, Pastas, Postres..."
      />
    </div>
  </>
);

const IngredientsFieldset: React.FC<{
  rows: IngredientRow[];
  insumos: InsumoItem[];
  onChangeRow: (key: number, field: 'insumoId' | 'quantity', value: string) => void;
  onRemoveRow: (key: number) => void;
  onAddRow: () => void;
}> = ({ rows, insumos, onChangeRow, onRemoveRow, onAddRow }) => (
  <fieldset className="fieldset-reset">
    <legend className="form-label p-0">
      Ingredientes:
    </legend>
    <div className="flex-column flex-gap-xs">
      {rows.map((row) => (
        <IngredientRowFields
          key={row.key}
          row={row}
          insumos={insumos}
          canRemove={rows.length > 1}
          onChange={(field, value) => onChangeRow(row.key, field, value)}
          onRemove={() => onRemoveRow(row.key)}
        />
      ))}
    </div>
    <button
      type="button"
      className="btn-touch btn-secondary flex-center flex-gap-xs add-ingredient-btn"
      onClick={onAddRow}
    >
      <Plus size={16} />
      Agregar Ingrediente
    </button>
  </fieldset>
);

export const CreateRecipeForm: React.FC<CreateRecipeFormProps> = ({ onCreated }) => {
  const { insumos, loadError } = useInsumosCatalog();
  const form = useCreateRecipeForm(onCreated, insumos[0]?.id ?? '');

  if (loadError) {
    return <ErrorBanner message={`No se pudo cargar el catálogo de insumos: ${loadError}`} />;
  }

  if (insumos.length === 0) {
    return <p role="status">Cargando catálogo de insumos... si no hay insumos, primero dé de alta uno en la pestaña "Alta de Insumo".</p>;
  }

  return (
    <form onSubmit={form.handleSubmit} className="flex-column flex-gap-md">
      {form.error && <ErrorBanner message={form.error} />}

      <RecipeBasicFields name={form.name} onNameChange={form.setName} category={form.category} onCategoryChange={form.setCategory} />

      <IngredientsFieldset
        rows={form.ingredients}
        insumos={insumos}
        onChangeRow={form.updateIngredientRow}
        onRemoveRow={form.removeIngredientRow}
        onAddRow={form.addIngredientRow}
      />

      <button
        type="submit"
        className="btn-touch btn-primary flex-center flex-gap-xs mt-1"
        disabled={form.isSubmitting}
      >
        <Utensils size={18} />
        {form.isSubmitting ? 'Creando...' : 'Crear Receta'}
      </button>
    </form>
  );
};
