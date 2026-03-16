import { create } from 'zustand';
import { api } from '../services/api';
import { Recipe } from '../types/recipe';

interface FavoriteState {
  favorites: Recipe[];
  loading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addFavorite: (recipeId: string, recipe?: Recipe) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string, recipe?: Recipe) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  fetchFavorites: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/favorites');
      set({ favorites: response.data, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar favoritos',
        loading: false,
      });
    }
  },

  addFavorite: async (recipeId: string, recipe?: Recipe) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/api/favorites/${recipeId}`, { recipe });
      await get().fetchFavorites();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al agregar a favoritos',
      });
    } finally {
      set({ loading: false });
    }
  },

  removeFavorite: async (recipeId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/favorites/${recipeId}`);
      await get().fetchFavorites();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar de favoritos',
      });
    } finally {
      set({ loading: false });
    }
  },

  isFavorite: (recipeId: string) => {
    return get().favorites.some((recipe) => recipe.id === recipeId);
  },

  toggleFavorite: async (recipeId: string, recipe?: Recipe) => {
    const { isFavorite, addFavorite, removeFavorite } = get();
    if (isFavorite(recipeId)) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId, recipe);
    }
  }
})); 