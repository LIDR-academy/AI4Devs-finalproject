// perfilService.ts
import { apiClient } from './api';
// Utilizamos el tipo de respuesta genérico para evitar dependencia directa de axios
type ApiResponse<T> = {
  data?: T;
  [key: string]: any;
};

// Interfaces para los DTOs
export interface PerfilDto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  objetoId: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface CreatePerfilDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  objetoId?: number;
}

export interface UpdatePerfilDto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  objetoId?: number;
}

export interface PerfilFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  activo?: boolean | null;
  includeInactive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Servicio para gestión de perfiles
const perfilService = {
  // Obtener todos los perfiles (incluyendo inactivos si se especifica)
  getAllPerfiles: async (includeInactive: boolean = false): Promise<PerfilDto[]> => {
    try {
      console.log('perfilService.getAllPerfiles - iniciando petición');
      const response = await apiClient.get(
        `/v1/Perfiles/all?includeInactive=${includeInactive}`
      );
      console.log('perfilService.getAllPerfiles - respuesta completa:', response);
      
      // Verificar si la respuesta es válida
      if (!response) {
        console.error('perfilService.getAllPerfiles - respuesta undefined');
        return [];
      }
      
      // Verificar si la respuesta es un array directamente
      if (Array.isArray(response)) {
        console.log('perfilService.getAllPerfiles - respuesta es un array:', response.length);
        return response;
      }
      
      // Si la respuesta tiene una estructura con data, usar response.data
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('perfilService.getAllPerfiles - usando response.data');
        return Array.isArray(response.data) ? response.data : [];
      }
      
      console.error('perfilService.getAllPerfiles - formato de respuesta inesperado:', response);
      return [];
    } catch (error) {
      console.error('Error al obtener todos los perfiles:', error);
      throw error;
    }
  },

  // Obtener perfiles paginados con filtros
  getPerfiles: async (params: PerfilFilterParams): Promise<PaginatedResponse<PerfilDto>> => {
    try {
      let url = '/v1/Perfiles';
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.activo !== null && params.activo !== undefined) {
        queryParams.append('activo', params.activo.toString());
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await apiClient.get(url);
      return (response as ApiResponse<PaginatedResponse<PerfilDto>>).data as PaginatedResponse<PerfilDto>;
    } catch (error) {
      console.error('Error al obtener perfiles paginados:', error);
      throw error;
    }
  },

  // Obtener un perfil por su ID
  getPerfilById: async (id: number): Promise<PerfilDto> => {
    try {
      console.log(`perfilService.getPerfilById - Iniciando petición para ID: ${id}`);
      const response = await apiClient.get(`/v1/Perfiles/${id}`);
      console.log(`perfilService.getPerfilById - Respuesta completa:`, response);
      
      // Verificar si la respuesta es válida
      if (!response) {
        console.error(`perfilService.getPerfilById - Respuesta undefined para ID: ${id}`);
        throw new Error(`No se pudo obtener el perfil con ID ${id}`);
      }
      
      // Verificar si la respuesta tiene la estructura esperada
      let perfilData: PerfilDto;
      
      if (typeof response === 'object' && response !== null) {
        if ('data' in response && response.data !== undefined) {
          // Si la respuesta tiene una propiedad data, usarla
          console.log(`perfilService.getPerfilById - Usando response.data:`, response.data);
          perfilData = response.data as PerfilDto;
        } else {
          // Si la respuesta es el objeto directamente
          console.log(`perfilService.getPerfilById - Usando response directamente:`, response);
          perfilData = response as any as PerfilDto;
        }
      } else {
        console.error(`perfilService.getPerfilById - Formato de respuesta inesperado:`, response);
        throw new Error(`Formato de respuesta inesperado para el perfil con ID ${id}`);
      }
      
      // Verificar que el objeto tenga las propiedades mínimas necesarias
      if (!perfilData || !perfilData.id || !perfilData.nombre) {
        console.error(`perfilService.getPerfilById - Datos de perfil incompletos:`, perfilData);
        throw new Error(`Datos incompletos para el perfil con ID ${id}`);
      }
      
      console.log(`perfilService.getPerfilById - Datos de perfil procesados:`, perfilData);
      return perfilData;
    } catch (error) {
      console.error(`Error al obtener el perfil con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo perfil
  createPerfil: async (perfil: CreatePerfilDto): Promise<PerfilDto> => {
    try {
      console.log('perfilService.createPerfil - Iniciando petición con datos:', perfil);
      const response = await apiClient.post('/v1/Perfiles', perfil);
      console.log('perfilService.createPerfil - Respuesta completa:', response);
      
      // Verificar si la respuesta es válida
      if (!response) {
        console.error('perfilService.createPerfil - Respuesta undefined');
        throw new Error('No se recibió respuesta del servidor al crear el perfil');
      }
      
      // Verificar si la respuesta tiene la estructura esperada
      let perfilData: PerfilDto;
      
      if (typeof response === 'object' && response !== null) {
        if ('data' in response && response.data !== undefined) {
          // Si la respuesta tiene una propiedad data, usarla
          console.log('perfilService.createPerfil - Usando response.data:', response.data);
          perfilData = response.data as PerfilDto;
        } else {
          // Si la respuesta es el objeto directamente
          console.log('perfilService.createPerfil - Usando response directamente:', response);
          perfilData = response as any as PerfilDto;
        }
      } else {
        console.error('perfilService.createPerfil - Formato de respuesta inesperado:', response);
        throw new Error('Formato de respuesta inesperado al crear el perfil');
      }
      
      // Verificar que el objeto tenga al menos un ID
      if (!perfilData || !perfilData.id) {
        console.warn('perfilService.createPerfil - Datos de perfil incompletos o sin ID:', perfilData);
        // Si no tiene ID pero tenemos algún dato, devolvemos lo que tenemos
        return perfilData || {} as PerfilDto;
      }
      
      console.log('perfilService.createPerfil - Perfil creado correctamente:', perfilData);
      return perfilData;
    } catch (error) {
      console.error('Error al crear el perfil:', error);
      throw error;
    }
  },

  // Actualizar un perfil existente
  updatePerfil: async (id: number, perfil: UpdatePerfilDto): Promise<void> => {
    try {
      await apiClient.put(`/v1/Perfiles/${id}`, perfil);
    } catch (error) {
      console.error(`Error al actualizar el perfil con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un perfil (borrado lógico)
  deletePerfil: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/v1/Perfiles/${id}`);
    } catch (error) {
      console.error(`Error al eliminar el perfil con ID ${id}:`, error);
      throw error;
    }
  }
};

export default perfilService;
