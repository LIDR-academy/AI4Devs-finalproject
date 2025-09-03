import { create } from 'zustand';
import { IProperty, IPropertyFilters } from '@/types';
import { useAuthStore } from './authStore';

interface PropertyState {
  properties: IProperty[];
  currentProperty: IProperty | null;
  filters: IPropertyFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface PropertyActions {
  setProperties: (properties: IProperty[]) => void;
  addProperty: (property: IProperty) => void;
  createProperty: (propertyData: any) => Promise<IProperty>;
  updateProperty: (id: number, updates: Partial<IProperty>) => void;
  removeProperty: (id: number) => void;
  setCurrentProperty: (property: IProperty | null) => void;
  setFilters: (filters: Partial<IPropertyFilters>) => void;
  resetFilters: () => void;
  setPagination: (pagination: Partial<PropertyState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  fetchProperties: () => Promise<void>;
}

type PropertyStore = PropertyState & PropertyActions;

const initialFilters: IPropertyFilters = {
  page: 1,
  limit: 10,
  sort_by: 'created_at',
  sort_order: 'DESC'
};

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 0
};

export const usePropertyStore = create<PropertyStore>((set) => ({
  // Estado inicial
  properties: [],
  currentProperty: null,
  filters: initialFilters,
  pagination: initialPagination,
  isLoading: false,
  error: null,

  // Acciones
  setProperties: (properties: IProperty[]) => {
    set({ properties });
  },

  addProperty: (property: IProperty) => {
    set((state) => ({
      properties: [property, ...state.properties]
    }));
  },

  updateProperty: (id: number, updates: Partial<IProperty>) => {
    set((state) => ({
      properties: state.properties.map((prop) =>
        prop.id === id ? { ...prop, ...updates } : prop
      ),
      currentProperty: state.currentProperty?.id === id
        ? { ...state.currentProperty, ...updates }
        : state.currentProperty
    }));
  },

  removeProperty: (id: number) => {
    set((state) => ({
      properties: state.properties.filter((prop) => prop.id !== id),
      currentProperty: state.currentProperty?.id === id ? null : state.currentProperty
    }));
  },

  setCurrentProperty: (property: IProperty | null) => {
    set({ currentProperty: property });
  },

  setFilters: (filters: Partial<IPropertyFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 } // Reset a página 1 al cambiar filtros
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters, pagination: initialPagination });
  },

  setPagination: (pagination: Partial<PropertyState['pagination']>) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination }
    }));
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  clearError: () => {
    set({ error: null });
  },

  createProperty: async (propertyData: any) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(propertyData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la propiedad');
      }
      
      set((state) => ({
        properties: [data.data, ...state.properties],
        isLoading: false
      }));
      
      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/properties');
      
      if (!response.ok) {
        throw new Error('Error al obtener las propiedades');
      }
      
      const data = await response.json();
      set({ 
        properties: data.data || [],
        pagination: data.pagination || initialPagination,
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false });
    }
  }
}));

// Selectores útiles
export const useProperties = () => usePropertyStore((state) => state.properties);
export const useCurrentProperty = () => usePropertyStore((state) => state.currentProperty);
export const useFilters = () => usePropertyStore((state) => state.filters);
export const usePagination = () => usePropertyStore((state) => state.pagination);
export const useIsLoading = () => usePropertyStore((state) => state.isLoading);
export const useError = () => usePropertyStore((state) => state.error);

// Alias para compatibilidad
export const useLoading = () => usePropertyStore((state) => state.isLoading);
