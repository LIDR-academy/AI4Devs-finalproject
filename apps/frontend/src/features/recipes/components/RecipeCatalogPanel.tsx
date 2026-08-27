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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ChefHat size={22} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Recetario</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Gestiona el recetario de preparaciones y sus ingredientes.
          </p>
        </div>
      </div>

      <button onClick={onCreateClick} className="btn-touch btn-primary">
        + Nueva Receta
      </button>
    </div>

    <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
      <Search
        size={18}
        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
      />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar receta por nombre..."
        style={{
          width: '100%',
          padding: '12px 16px 12px 40px',
          borderRadius: '4px',
          border: '1px solid var(--border-card)',
          backgroundColor: 'var(--bg-root)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
        }}
      />
    </div>
  </>
);

interface RecipeTableRowProps {
  item: RecipeListItem;
}

const RecipeTableRow: React.FC<RecipeTableRowProps> = ({ item }) => (
  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
    <td style={{ padding: '16px', fontWeight: 600 }}>{item.name}</td>
    <td style={{ padding: '16px' }}>
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--border-card)',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {item.category}
      </span>
    </td>
    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
      {item.ingredients.length} ingrediente{item.ingredients.length === 1 ? '' : 's'}
    </td>
  </tr>
);

interface RecipeTableProps {
  recipes: RecipeListItem[];
}

const RecipeTable: React.FC<RecipeTableProps> = ({ recipes }) => (
  <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'var(--bg-card)' }}>
      <thead>
        <tr style={{ backgroundColor: 'var(--bg-root)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}>
          <th style={{ padding: '16px' }}>Nombre Receta</th>
          <th style={{ padding: '16px' }}>Categoría</th>
          <th style={{ padding: '16px' }}>Ingredientes</th>
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
      <div style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center' }}>Cargando recetario...</div>
    ) : filteredRecipes.length === 0 ? (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '6px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
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
    <div className="recipe-catalog-panel" style={{ padding: '24px', color: 'var(--text-primary)' }}>
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
