import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, Search, Sparkles } from 'lucide-react';
import { RecipesService, RecipeListItem } from '../services/recipes.service.js';
import { CreateRecipeModal } from './CreateRecipeModal.js';
import { RescueRecipesModal } from './RescueRecipesModal.js';
import { EditRecipeModal } from './EditRecipeModal.js';
import { RecipeManageActions } from './RecipeManageActions.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { ConfirmModal } from '../../../shared/components/ConfirmModal.js';
import styles from './RecipeCatalogPanel.module.css';

interface RecipeCatalogHeaderProps {
  onCreateClick: () => void;
  onRescueClick: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  canManage: boolean;
}

const RecipeCatalogHeader: React.FC<RecipeCatalogHeaderProps> = ({
  onCreateClick,
  onRescueClick,
  search,
  onSearchChange,
  canManage,
}) => (
  <>
    <div className="flex-between flex-wrap mb-6 gap-4">
      <div className="flex-gap-xs">
        <ChefHat size={22} className="text-primary-color flex-shrink-0" />
        <div>
          <h1 className="m-0 fs-xl fw-bold">Recetario</h1>
          <p className="text-secondary-color mt-1 fs-sm">
            Gestiona el recetario de preparaciones y sus ingredientes.
          </p>
        </div>
      </div>

      <div className="flex-gap-sm flex-wrap">
        <button
          type="button"
          onClick={onRescueClick}
          className="btn-touch btn-secondary flex-center flex-gap-xs"
          id="btn-rescue-recipes"
        >
          <Sparkles size={18} className="text-primary-color" />
          <span>Sugerencias IA Anti-Desperdicio</span>
        </button>

        {canManage && (
          <button type="button" onClick={onCreateClick} className="btn-touch btn-primary" id="btn-create-recipe">
            + Nueva Receta
          </button>
        )}
      </div>
    </div>

    <div className="search-input-wrapper">
      <Search size={18} className="search-icon-left" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar receta por nombre..."
        className="input-touch input-with-icon w-full fs-md"
      />
    </div>
  </>
);

interface RowProps {
  item: RecipeListItem;
  canManage: boolean;
  onEdit: (recipe: RecipeListItem) => void;
  onDelete: (recipe: RecipeListItem) => void;
}

const RecipeTableRow: React.FC<RowProps> = ({ item, canManage, onEdit, onDelete }) => (
  <tr>
    <td className="fw-semibold">{item.name}</td>
    <td>
      <span className="neutral-badge">{item.category}</span>
    </td>
    <td className="text-secondary-color">
      {item.ingredients.length} ingrediente{item.ingredients.length === 1 ? '' : 's'}
    </td>
    {canManage && (
      <td>
        <RecipeManageActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </td>
    )}
  </tr>
);

interface RecipeTableProps {
  recipes: RecipeListItem[];
  canManage: boolean;
  onEdit: (recipe: RecipeListItem) => void;
  onDelete: (recipe: RecipeListItem) => void;
}

const RecipeTable: React.FC<RecipeTableProps> = ({ recipes, canManage, onEdit, onDelete }) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th>Nombre Receta</th>
          <th>Categoría</th>
          <th>Ingredientes</th>
          {canManage && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {recipes.map((item) => (
          <RecipeTableRow key={item.id} item={item} canManage={canManage} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  </div>
);

interface RecipeCatalogBodyProps {
  error: string | null;
  loading: boolean;
  filteredRecipes: RecipeListItem[];
  canManage: boolean;
  onEdit: (recipe: RecipeListItem) => void;
  onDelete: (recipe: RecipeListItem) => void;
}

const RecipeCatalogBody: React.FC<RecipeCatalogBodyProps> = ({
  error,
  loading,
  filteredRecipes,
  canManage,
  onEdit,
  onDelete,
}) => (
  <>
    {error && <ErrorBanner message={error} />}

    {loading ? (
      <div className={styles['catalog-state-message']}>Cargando recetario...</div>
    ) : filteredRecipes.length === 0 ? (
      <div className={`card-dashboard ${styles['catalog-empty-card']}`}>
        No hay recetas registradas en el recetario.
      </div>
    ) : (
      <RecipeTable recipes={filteredRecipes} canManage={canManage} onEdit={onEdit} onDelete={onDelete} />
    )}
  </>
);

function useRecipeList() {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecipes(await RecipesService.listRecipes());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar el recetario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  return { loading, error, search, setSearch, filteredRecipes, fetchRecipes };
}

function useRecipeManagement(fetchRecipes: () => Promise<void>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RecipeListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecipeListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pickTarget = (setter: (r: RecipeListItem | null) => void) => (recipe: RecipeListItem) => {
    setFeedback(null);
    setDeleteError(null);
    setter(recipe);
  };
  const afterMutation = (message: string, close: () => void) => {
    setFeedback(message);
    close();
    fetchRecipes();
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await RecipesService.deleteRecipe(deleteTarget.id);
      setFeedback(`Receta "${deleteTarget.name}" dada de baja.`);
      setDeleteTarget(null);
      fetchRecipes();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo dar de baja la receta.');
      setDeleteTarget(null);
    }
  };

  return {
    feedback, deleteError, isCreateOpen, setIsCreateOpen, isRescueOpen, setIsRescueOpen,
    editTarget, setEditTarget, deleteTarget, setDeleteTarget, fetchRecipes,
    openCreate: () => { setFeedback(null); setIsCreateOpen(true); },
    openRescue: () => { setFeedback(null); setIsRescueOpen(true); },
    onEdit: pickTarget(setEditTarget),
    onDelete: pickTarget(setDeleteTarget),
    onCreated: (m: string) => afterMutation(m, () => setIsCreateOpen(false)),
    onEdited: (m: string) => afterMutation(m, () => setEditTarget(null)),
    confirmDelete,
  };
}

function useRecipeCatalog() {
  const list = useRecipeList();
  const management = useRecipeManagement(list.fetchRecipes);
  return { ...list, ...management };
}

type Catalog = ReturnType<typeof useRecipeCatalog>;

const RecipeCatalogModals: React.FC<{ c: Catalog }> = ({ c }) => (
  <>
    <CreateRecipeModal isOpen={c.isCreateOpen} onClose={() => c.setIsCreateOpen(false)} onCreated={c.onCreated} />
    <RescueRecipesModal isOpen={c.isRescueOpen} onClose={() => c.setIsRescueOpen(false)} onRecipeSaved={c.fetchRecipes} />
    <EditRecipeModal
      isOpen={c.editTarget !== null}
      recipe={c.editTarget}
      onClose={() => c.setEditTarget(null)}
      onSuccess={c.onEdited}
    />
    <ConfirmModal
      isOpen={c.deleteTarget !== null}
      title="Dar de baja receta"
      message={
        c.deleteTarget
          ? `¿Retirar "${c.deleteTarget.name}" del recetario? Dejará de aparecer en el recetario, en las sugerencias de rescate y en la disponibilidad. Las preparaciones históricas se conservan.`
          : ''
      }
      confirmLabel="Dar de baja"
      onConfirm={c.confirmDelete}
      onCancel={() => c.setDeleteTarget(null)}
    />
  </>
);

/**
 * @param canManage `true` sólo para ADMIN — muestra "+ Nueva Receta" y las acciones
 * Editar / Dar de baja (`POST` / `PUT` / `DELETE /recipes`, `requireRole('ADMIN')` en backend).
 * Default `false`: en `/recetas` (ruta de operario) el recetario es sólo de consulta.
 */
export const RecipeCatalogPanel: React.FC<{ canManage?: boolean }> = ({ canManage = false }) => {
  const c = useRecipeCatalog();

  return (
    <div className={styles['recipe-catalog-panel']}>
      <RecipeCatalogHeader
        onCreateClick={c.openCreate}
        onRescueClick={c.openRescue}
        search={c.search}
        onSearchChange={c.setSearch}
        canManage={canManage}
      />

      {c.feedback && <SuccessFeedbackBanner message={c.feedback} />}
      {c.deleteError && <ErrorBanner message={c.deleteError} />}

      <RecipeCatalogBody
        error={c.error}
        loading={c.loading}
        filteredRecipes={c.filteredRecipes}
        canManage={canManage}
        onEdit={c.onEdit}
        onDelete={c.onDelete}
      />

      <RecipeCatalogModals c={c} />
    </div>
  );
};
