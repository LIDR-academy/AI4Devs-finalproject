import React from 'react';
import { useFavoriteStore } from '../../store/favoriteStore';
import { Recipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const getDietaryIcon = (type: string) => {
    switch (type) {
      case 'vegetarian':
        return '🥬';
      case 'vegan':
        return '🌱';
      case 'glutenFree':
        return '🌾';
      case 'dairyFree':
        return '🥛';
      case 'nutFree':
        return '🥜';
      default:
        return '';
    }
  };

  const getDietaryLabel = (type: string) => {
    switch (type) {
      case 'vegetarian':
        return 'Vegetariano';
      case 'vegan':
        return 'Vegano';
      case 'glutenFree':
        return 'Sin Gluten';
      case 'dairyFree':
        return 'Sin Lácteos';
      case 'nutFree':
        return 'Sin Frutos Secos';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
          <button
            onClick={() => toggleFavorite(recipe.id, recipe)}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
          >
            {isFavorite(recipe.id) ? '❤️' : '🤍'}
          </button>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.dietaryRestrictions && Object.entries(recipe.dietaryRestrictions)
            .filter(([_, value]) => value === true)
            .map(([key]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                title={getDietaryLabel(key)}
              >
                {getDietaryIcon(key)} {getDietaryLabel(key)}
              </span>
            ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span className="inline-flex items-center">
              <svg className="h-5 w-5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.cookingTime} min
            </span>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center">
              <svg className="h-5 w-5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 