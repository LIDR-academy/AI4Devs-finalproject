import React, { useState, useEffect } from 'react';
import { ChefHat, Search } from 'lucide-react';
import { RecipesService, RecipeListItem } from '../services/recipes.service.js';
import { CreateRecipeModal } from './CreateRecipeModal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';

interface RecipeCatalogHeaderProps {
  onCreateClick: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const RecipeCatalogHeader: React.FC<RecipeCatalogHeaderProps> = ({ onCreateClick, search, onSearchChange }) => (
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

      <button type="button" onClick={onCreateClick} className="btn-touch btn-primary">
        + Nueva Receta
      </button>
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

interface RecipeTableRowProps {
  item: RecipeListItem;
}

const RecipeTableRow: React.FC<RecipeTableRowProps> = ({ item }) => (
  <tr>
    <td className="fw-semibold">{item.name}</td>
    <td>
      <span className="neutral-badge">
        {item.category}
      </span>
    </td>
    <td className="text-secondary-color">
      {item.ingredients.length} ingrediente{item.ingredients.length === 1 ? '' : 's'}
    </td>
  </tr>
);

interface RecipeTableProps {
  recipes: RecipeListItem[];
}

const RecipeTable: React.FC<RecipeTableProps> = ({ recipes }) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th>Nombre Receta</th>
          <th>Categoría</th>
          <th>Ingredientes</th>
        </tr>
      </thead>
      <tbody>
        {recipes.map((item) => (
          <RecipeTableRow key={item.id} item={item} />
        ))}
      </tbody>
    </table>
  </div>
);

interface RecipeCatalogBodyProps {
  error: string | null;
  loading: boolean;
  filteredRecipes: RecipeListItem[];
}

const RecipeCatalogBody: React.FC<RecipeCatalogBodyProps> = ({ error, loading, filteredRecipes }) => (
  <>
    {error && <ErrorBanner message={error} />}

    {loading ? (
      <div className="catalog-state-message">Cargando recetario...</div>
    ) : filteredRecipes.length === 0 ? (
      <div className="card-dashboard catalog-empty-card">
        No hay recetas registradas en el recetario.
      </div>
    ) : (
      <RecipeTable recipes={filteredRecipes} />
    )}
  </>
);

export const RecipeCatalogPanel: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RecipesService.listRecipes();
      setRecipes(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al cargar el recetario.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreated = (message: string) => {
    setFeedback(message);
    setIsModalOpen(false);
    fetchRecipes();
  };

  return (
    <div className="recipe-catalog-panel">
      <RecipeCatalogHeader
        onCreateClick={() => {
          setFeedback(null);
          setIsModalOpen(true);
        }}
        search={search}
        onSearchChange={setSearch}
      />

      {feedback && <SuccessFeedbackBanner message={feedback} />}

      <RecipeCatalogBody error={error} loading={loading} filteredRecipes={filteredRecipes} />

      <CreateRecipeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
};
