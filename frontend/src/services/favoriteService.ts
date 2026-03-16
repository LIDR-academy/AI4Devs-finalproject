import { Recipe } from './recipeService';
import api from './api';

export const favoriteService = {
  // Obtener todos los favoritos del usuario
  async getFavorites(): Promise<Recipe[]> {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Añadir una receta a favoritos
  async addFavorite(recipeId: string): Promise<void> {
    await api.post(`/favorites/${recipeId}`);
  },

  // Eliminar una receta de favoritos
  async removeFavorite(recipeId: string): Promise<void> {
    await api.delete(`/favorites/${recipeId}`);
  },

  // Verificar si una receta está en favoritos
  async checkFavorite(recipeId: string): Promise<boolean> {
    const response = await api.get(`/favorites/check/${recipeId}`);
    return response.data.isFavorite;
  }
}; 