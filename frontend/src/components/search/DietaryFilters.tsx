import React from 'react';

interface DietaryFiltersProps {
  filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  };
  onChange: (filters: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    nutFree: boolean;
  }) => void;
}

export default function DietaryFilters({ filters, onChange }: DietaryFiltersProps) {
  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      [name]: e.target.checked
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Restricciones Dietéticas</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="vegetarian"
            checked={filters.vegetarian}
            onChange={handleChange('vegetarian')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-900">
            🥬 Vegetariano
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="vegan"
            checked={filters.vegan}
            onChange={handleChange('vegan')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="vegan" className="ml-2 block text-sm text-gray-900">
            🌱 Vegano
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="glutenFree"
            checked={filters.glutenFree}
            onChange={handleChange('glutenFree')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="glutenFree" className="ml-2 block text-sm text-gray-900">
            🌾 Sin Gluten
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="dairyFree"
            checked={filters.dairyFree}
            onChange={handleChange('dairyFree')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="dairyFree" className="ml-2 block text-sm text-gray-900">
            🥛 Sin Lácteos
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="nutFree"
            checked={filters.nutFree}
            onChange={handleChange('nutFree')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="nutFree" className="ml-2 block text-sm text-gray-900">
            🥜 Sin Frutos Secos
          </label>
        </div>
      </div>
    </div>
  );
} 