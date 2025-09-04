import { create } from 'zustand';
import { IProperty } from '@/types';
import { useAuthStore } from './authStore';
import { favoriteEventManager } from '../utils/favoriteEvents';

interface FavoriteState {
  favorites: IProperty[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface FavoriteActions {
  // Obtener favoritos del usuario
  fetchFavorites: (page?: number, limit?: number) => Promise<void>;
  
  // Agregar propiedad a favoritos
  addToFavorites: (propertyId: string) => Promise<boolean>;
  
  // Remover propiedad de favoritos
  removeFromFavorites: (propertyId: string) => Promise<boolean>;
  
  // Verificar si una propiedad está en favoritos
  checkFavoriteStatus: (propertyId: string) => Promise<boolean>;
  
  // Obtener estado de favoritos para múltiples propiedades
  getFavoritesForProperties: (propertyIds: string[]) => Promise<string[]>;
  
  // Limpiar estado
  clearError: () => void;
  clearFavorites: () => void;
}

const initialPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false
};

export const useFavoriteStore = create<FavoriteState & FavoriteActions>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,
  pagination: initialPagination,

  fetchFavorites: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch(`/api/favorites?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Fetch favorites response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener favoritos');
      }

      // Extraer solo las propiedades de los favoritos
      const properties = data.data?.map((favorite: any) => favorite.favoriteProperty) || [];
      
      set({
        favorites: properties,
        pagination: data.pagination || initialPagination,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  addToFavorites: async (propertyId: string) => {
    // No actualizar isLoading global para evitar re-renders
    set({ error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agregar a favoritos');
      }

      // Si la respuesta incluye la propiedad completa, usarla
      if (data.data && data.data.favoriteProperty) {
        const { favorites } = get();
        set({
          favorites: [data.data.favoriteProperty, ...favorites]
        });
      } else {
        // Si no, refrescar la lista completa
        await get().fetchFavorites();
      }

      // Emitir evento de favorito agregado
      favoriteEventManager.emit('favorite_added', propertyId);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeFromFavorites: async (propertyId: string) => {
    // No actualizar isLoading global para evitar re-renders
    set({ error: null });
    
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al remover de favoritos');
      }

      // Remover la propiedad de la lista de favoritos
      const { favorites, pagination } = get();
      const newFavorites = favorites.filter(fav => fav.id_property !== propertyId);
      set({
        favorites: newFavorites,
        pagination: {
          ...pagination,
          totalItems: Math.max(0, pagination.totalItems - 1)
        }
      });

      // Emitir evento de favorito removido
      favoriteEventManager.emit('favorite_removed', propertyId);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage });
      throw error;
    }
  },

  checkFavoriteStatus: async (propertyId: string) => {
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        return false;
      }

      const response = await fetch(`/api/favorites/${propertyId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return false;
      }

      return data.data?.isFavorite || false;
    } catch (error) {
      console.error(`Error checking favorite status for property ${propertyId}:`, error);
      return false;
    }
  },

  getFavoritesForProperties: async (propertyIds: string[]) => {
    try {
      const token = useAuthStore.getState().token;
      
      if (!token || propertyIds.length === 0) {
        return [];
      }

      // Para simplificar, verificamos cada propiedad individualmente
      // En una implementación más avanzada, podríamos hacer una sola llamada
      const favoriteIds: string[] = [];
      
      for (const propertyId of propertyIds) {
        const isFavorite = await get().checkFavoriteStatus(propertyId);
        if (isFavorite) {
          favoriteIds.push(propertyId);
        }
      }

      return favoriteIds;
    } catch (error) {
      return [];
    }
  },

  clearError: () => set({ error: null }),
  clearFavorites: () => set({ favorites: [], pagination: initialPagination })
}));
