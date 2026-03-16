import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useFavorites = (recipeId: string) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await api.get(`/api/favorites/check/${recipeId}`);
        setIsFavorite(response.data.isFavorite);
        setError(null);
      } catch (err) {
        setError('Error al verificar favorito');
        console.error('Error checking favorite:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavorite();
  }, [recipeId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${recipeId}`);
      } else {
        await api.post(`/api/favorites/${recipeId}`);
      }
      setIsFavorite(!isFavorite);
      setError(null);
    } catch (err) {
      setError('Error al actualizar favorito');
      console.error('Error toggling favorite:', err);
    }
  };

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite
  };
}; 