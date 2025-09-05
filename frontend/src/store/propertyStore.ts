import { create } from 'zustand';
import { IProperty, IPropertyFilters } from '@/types';
import { useAuthStore } from './authStore';

interface PropertyState {
  properties: IProperty[];
  userProperties: IProperty[];
  currentProperty: IProperty | null;
  filters: IPropertyFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  isLoading: boolean;
  loading: boolean;
  error: string | null;
}

interface PropertyActions {
  setProperties: (properties: IProperty[]) => void;
  addProperty: (property: IProperty) => void;
  createProperty: (propertyData: any) => Promise<IProperty>;
  updateProperty: (id_property: string, updates: Partial<IProperty>) => void;
  updatePropertyComplete: (id_property: string, propertyData: IProperty) => Promise<void>;
  removeProperty: (id_property: string) => void;
  setCurrentProperty: (property: IProperty | null) => void;
  setFilters: (filters: Partial<IPropertyFilters>) => void;
  resetFilters: () => void;
  setPagination: (pagination: Partial<PropertyState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  fetchProperties: () => Promise<void>;
  fetchUserProperties: () => Promise<void>;
  deleteProperty: (id_property: string) => Promise<void>;
  toggleFeatured: (id_property: string) => Promise<void>;
  updatePropertyStatus: (id_property: string, status: string) => Promise<void>;
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

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  // Estado inicial
  properties: [],
  userProperties: [],
  currentProperty: null,
  filters: initialFilters,
  pagination: initialPagination,
  isLoading: false,
  loading: false,
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

  updateProperty: (id_property: string, updates: Partial<IProperty>) => {
    set((state) => ({
      properties: state.properties.map((prop) =>
        prop.id_property === id_property ? { ...prop, ...updates } : prop
      ),
      currentProperty: state.currentProperty?.id_property === id_property
        ? { ...state.currentProperty, ...updates }
        : state.currentProperty
    }));
  },

  removeProperty: (id_property: string) => {
    set((state) => ({
      properties: state.properties.filter((prop) => prop.id_property !== id_property),
      currentProperty: state.currentProperty?.id_property === id_property ? null : state.currentProperty
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
      
      console.log('Creating property with token:', token ? 'Present' : 'Missing');
      console.log('Property data being sent:', propertyData);
      
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
        console.error('Error creating property:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          validation_errors: data.validation_errors
        });
        
        // Mostrar errores de validación específicos
        if (data.validation_errors && data.validation_errors.length > 0) {
          console.error('Validation errors:', data.validation_errors);
          data.validation_errors.forEach((error: any) => {
            console.error(`Field: ${error.field}, Message: ${error.message}`);
          });
        }
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
  },

  // Obtener propiedades del usuario
  fetchUserProperties: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/properties/my-properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error al obtener propiedades del usuario'}`);
      }

      const data = await response.json();
      set({ userProperties: data.properties || [], loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en fetchUserProperties:', error);
      set({ error: errorMessage, loading: false });
    }
  },

  // Eliminar propiedad
  deleteProperty: async (id_property: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      console.log('Eliminando propiedad:', id_property);
      console.log('Token disponible:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/properties/${id_property}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta de eliminación:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor al eliminar:', errorData);
        throw new Error(errorData.message || 'Error al eliminar propiedad');
      }

      // Remover de la lista local
      set((state) => ({
        userProperties: state.userProperties.filter(prop => prop.id_property !== id_property),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en deleteProperty:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Cambiar estado destacado
  toggleFeatured: async (id_property: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      console.log('Cambiando estado destacado para propiedad:', id_property);
      console.log('Token disponible:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/properties/${id_property}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta de toggle featured:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor al cambiar destacado:', errorData);
        throw new Error(errorData.message || 'Error al cambiar estado destacado');
      }

      const data = await response.json();
      console.log('Datos de respuesta destacado:', data);
      
      // Actualizar en la lista local
      set((state) => ({
        userProperties: state.userProperties.map(prop =>
          prop.id_property === id_property ? { ...prop, featured: data.data.featured } : prop
        ),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en toggleFeatured:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Actualizar estado de propiedad
  updatePropertyStatus: async (id_property: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      console.log('Actualizando estado de propiedad:', id_property, 'a', status);
      console.log('Token disponible:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/properties/${id_property}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      console.log('Respuesta de actualización de estado:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor al actualizar estado:', errorData);
        throw new Error(errorData.message || 'Error al actualizar estado');
      }

      const data = await response.json();
      console.log('Datos de respuesta estado:', data);
      
      // Actualizar en la lista local
      set((state) => ({
        userProperties: state.userProperties.map(prop =>
          prop.id_property === id_property ? { ...prop, status: data.data.status } : prop
        ),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en updatePropertyStatus:', error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Actualizar propiedad completa (para edición)
  updatePropertyComplete: async (id_property: string, propertyData: IProperty) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/properties/${id_property}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar propiedad');
      }

      const data = await response.json();
      
      // Actualizar el estado local inmediatamente con los datos de la respuesta
      set((state) => ({
        properties: state.properties.map(prop =>
          prop.id_property === id_property ? { ...prop, ...data.data } : prop
        ),
        userProperties: state.userProperties.map(prop =>
          prop.id_property === id_property ? { ...prop, ...data.data } : prop
        ),
        loading: false
      }));

      // Luego hacer fetch para asegurar consistencia
      const { fetchUserProperties } = get();
      await fetchUserProperties();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en updatePropertyComplete:', error);
      set({ error: errorMessage, loading: false });
      throw error;
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
