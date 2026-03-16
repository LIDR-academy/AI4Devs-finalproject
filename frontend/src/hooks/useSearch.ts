import { useState } from 'react';
import { Recipe } from '../types/recipe';
import { api } from '../services/api';

interface SearchParams {
  type: 'semantic' | 'ingredients' | 'filters';
  query?: string;
  ingredients?: string[];
  cookingTime?: number;
  difficulty?: string;
  dietaryRestrictions?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
  };
}

interface SearchResponse {
  success: boolean;
  data: Recipe[];
  message: string;
  error?: any;
}

export function useSearch() {
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (params.type) {
        case 'semantic':
          response = await api.post<SearchResponse>('/api/search/semantic', {
            query: params.query
          });
          break;

        case 'ingredients':
          response = await api.post<SearchResponse>('/api/search/ingredients', {
            ingredients: params.ingredients
          });
          break;

        case 'filters':
          response = await api.post<SearchResponse>('/api/search/filters', {
            cookingTime: params.cookingTime,
            difficulty: params.difficulty,
            dietaryRestrictions: params.dietaryRestrictions
          });
          break;

        default:
          throw new Error('Tipo de búsqueda no válido');
      }

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message);
        setResults([]);
      }
    } catch (err) {
      setError('Error al realizar la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    search
  };
} 