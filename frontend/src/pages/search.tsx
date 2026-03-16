import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import RecipeCard from '@/components/recipes/RecipeCard';
import DietaryFilters from '@/components/search/DietaryFilters';

export default function SearchPage() {
  const { results, loading, error, search } = useSearch();
  const [searchType, setSearchType] = useState<'semantic' | 'ingredients' | 'filters'>('semantic');
  const [query, setQuery] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState<number>();
  const [difficulty, setDifficulty] = useState<string>('');
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false
  });

  const handleSearch = () => {
    search({
      type: searchType,
      query,
      ingredients,
      cookingTime,
      difficulty,
      dietaryRestrictions: dietaryFilters
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Buscar Recetas
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Encuentra la receta perfecta para ti
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filtros */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Búsqueda</h3>
              <div className="space-y-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="semantic">Búsqueda por texto</option>
                  <option value="ingredients">Búsqueda por ingredientes</option>
                  <option value="filters">Búsqueda por filtros</option>
                </select>
              </div>
            </div>

            {searchType === 'semantic' && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Búsqueda por texto</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar recetas..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {searchType === 'ingredients' && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ingredientes</h3>
                <div className="space-y-4">
                  <textarea
                    value={ingredients.join('\n')}
                    onChange={(e) => setIngredients(e.target.value.split('\n').filter(i => i.trim()))}
                    placeholder="Ingresa un ingrediente por línea"
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {searchType === 'filters' && (
              <>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros Generales</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
                        Tiempo máximo de cocción (minutos)
                      </label>
                      <input
                        type="number"
                        id="cookingTime"
                        value={cookingTime || ''}
                        onChange={(e) => setCookingTime(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                        Dificultad
                      </label>
                      <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Todas</option>
                        <option value="Fácil">Fácil</option>
                        <option value="Media">Media</option>
                        <option value="Difícil">Difícil</option>
                      </select>
                    </div>
                  </div>
                </div>

                <DietaryFilters
                  filters={dietaryFilters}
                  onChange={setDietaryFilters}
                />
              </>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Buscando recetas...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron recetas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 