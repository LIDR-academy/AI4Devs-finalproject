import React, { useState } from 'react';
import { Recipe } from '../../types/recipe';

interface AdvancedSearchProps {
  onSearch: (params: any) => Promise<void>;
  isSearching: boolean;
  showAdvanced: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  isSearching,
  showAdvanced,
}) => {
  const [searchType, setSearchType] = useState<'semantic' | 'ingredients' | 'filters'>('semantic');
  const [query, setQuery] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [cookingTime, setCookingTime] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<string>('facil');

  const handleSemanticSearch = async () => {
    if (!query.trim()) return;
    await onSearch({
      type: 'semantic',
      query: query.trim(),
    });
  };

  const handleIngredientsSearch = async () => {
    if (ingredients.length === 0) return;
    await onSearch({
      type: 'ingredients',
      ingredients,
    });
  };

  const handleFiltersSearch = async () => {
    await onSearch({
      type: 'filters',
      cookingTime,
      difficulty,
    });
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showAdvanced ? (
        <div className="space-y-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setSearchType('semantic')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'semantic'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Búsqueda Semántica
            </button>
            <button
              onClick={() => setSearchType('ingredients')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'ingredients'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Por Ingredientes
            </button>
            <button
              onClick={() => setSearchType('filters')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'filters'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Filtros
            </button>
          </div>

          {searchType === 'semantic' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                  Describe lo que buscas
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: recetas fáciles con pollo, postres sin azúcar..."
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Usa lenguaje natural para describir el tipo de receta que buscas
                </p>
              </div>
              <button
                onClick={handleSemanticSearch}
                disabled={isSearching || !query.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSearching ? 'Buscando...' : 'Buscar con IA'}
              </button>
            </div>
          )}

          {searchType === 'ingredients' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">
                  Ingredientes
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="ingredients"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Agrega un ingrediente"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={addIngredient}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(ingredient)}
                        className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={handleIngredientsSearch}
                disabled={isSearching || ingredients.length === 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSearching ? 'Buscando...' : 'Buscar por Ingredientes'}
              </button>
            </div>
          )}

          {searchType === 'filters' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
                  Tiempo de cocción (minutos)
                </label>
                <input
                  type="number"
                  id="cookingTime"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(Number(e.target.value))}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <button
                onClick={handleFiltersSearch}
                disabled={isSearching}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSearching ? 'Buscando...' : 'Buscar con Filtros'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar recetas..."
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleSemanticSearch}
            disabled={isSearching || !query.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      )}
    </div>
  );
}; 