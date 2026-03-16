import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Recipe } from '@/types/recipe';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get('/api/recipes');
        setRecipes(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar las recetas');
        console.error('Error fetching recipes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return { recipes, isLoading, error };
}; 