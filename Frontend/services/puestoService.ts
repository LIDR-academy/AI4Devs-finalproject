/**
 * Servicio para gestionar los puestos
 * Este servicio maneja todas las operaciones CRUD para la entidad Puesto
 */
import { apiClient } from './api';

// Interfaz para el puesto
export interface Puesto {
  puestoId?: number;
  puestoNombre: string;
  puestoDescripcion: string;
  puestoActivo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

// Interfaz para la respuesta paginada
interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Interfaz para los parámetros de filtrado y paginación
interface PuestoParams {
  page?: number;
  pageSize?: number;
  search?: string;
  activo?: boolean;
  includeInactive?: boolean; // Parámetro para incluir puestos inactivos
  sortBy?: string;
  sortDirection?: string;
}

// Servicio para gestionar los puestos
export const puestoService = {
  /**
   * Transforma un puesto del formato API (PascalCase) al formato frontend (camelCase)
   * @param puestoAPI - Puesto en formato API
   * @returns Puesto en formato frontend
   */
  transformarPuestoAFormatoFrontend(puestoAPI: any): Puesto {
    // Si no hay datos, devolver un objeto vacío con valores por defecto
    if (!puestoAPI) {
      console.warn('transformarPuestoAFormatoFrontend: puestoAPI es null o undefined');
      return {
        puestoNombre: '',
        puestoDescripcion: '',
        puestoActivo: true
      };
    }
    
    // Mapear propiedades del formato API al formato frontend
    const puesto: Puesto = {
      // Manejar tanto formato PascalCase como camelCase
      puestoId: puestoAPI.puestoId || puestoAPI.PuestoId || puestoAPI.id || null,
      puestoNombre: puestoAPI.puestoNombre || puestoAPI.PuestoNombre || puestoAPI.nombre || '',
      puestoDescripcion: puestoAPI.puestoDescripcion || puestoAPI.PuestoDescripcion || puestoAPI.descripcion || '',
      puestoActivo: puestoAPI.puestoActivo !== undefined ? puestoAPI.puestoActivo : 
                   puestoAPI.PuestoActivo !== undefined ? puestoAPI.PuestoActivo :
                   puestoAPI.activo !== undefined ? puestoAPI.activo : true,
      fechaCreacion: puestoAPI.fechaCreacion || puestoAPI.FechaCreacion || null,
      fechaModificacion: puestoAPI.fechaModificacion || puestoAPI.FechaModificacion || null
    };
    
    // Asegurar que puestoActivo sea booleano
    puesto.puestoActivo = Boolean(puesto.puestoActivo);
    
    return puesto;
  },
  
  /**
   * Transforma un puesto del formato frontend (camelCase) al formato API (PascalCase)
   * @param puesto - Puesto en formato frontend
   * @returns Puesto en formato API
   */
  transformarPuestoAFormatoAPI(puesto: Puesto): any {
    // Si no hay datos, devolver un objeto vacío
    if (!puesto) {
      console.warn('transformarPuestoAFormatoAPI: puesto es null o undefined');
      return {};
    }
    
    // Mapear propiedades del formato frontend al formato API
    const puestoAPI = {
      id: puesto.puestoId,
      nombre: puesto.puestoNombre || '',
      descripcion: puesto.puestoDescripcion || '',
      activo: Boolean(puesto.puestoActivo)
    };
    
    return puestoAPI;
  },

  /**
   * Obtiene todos los puestos
   * @param params - Parámetros de filtrado y paginación
   * @returns Lista de puestos paginada
   */
  async getAll(params?: PuestoParams): Promise<PaginatedResponse<Puesto>> {
    try {
      // Usar el endpoint que devuelve todos los puestos
      const endpoint = '/v1/Puestos/all';
      
      // Construir query string para filtros adicionales si es necesario
      const queryParams = new URLSearchParams();
      
      // Añadir el parámetro includeInactive siempre como true para obtener todos los puestos
      queryParams.append('includeInactive', 'true');
      
      // Añadir timestamp para evitar caché
      queryParams.append('_ts', Date.now().toString());
      
      if (params) {
        // Añadir parámetros de paginación
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
        
        // Añadir parámetros de búsqueda
        if (params.search) queryParams.append('search', params.search);
        
        // Añadir parámetros de ordenación
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
        
        // Si hay un parámetro _ts en params, usarlo (viene del store con forceRefresh)
        if (params._ts) queryParams.append('_ts', params._ts.toString());
      }
      
      // Construir URL completa
      const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('Realizando petición GET a:', url);
      
      // Realizar petición a la API con headers para evitar caché
      const response = await apiClient.get<any>(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Verificar la estructura de la respuesta
      console.log('Estructura de respuesta:', response);
      
      // Manejar diferentes estructuras de respuesta posibles
      let items = [];
      let paginationInfo = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      };
      
      // Si la respuesta es un objeto con propiedad 'items'
      if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
        paginationInfo = {
          pageNumber: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 1,
          hasPreviousPage: response.hasPreviousPage || false,
          hasNextPage: response.hasNextPage || false
        };
      } 
      // Si la respuesta es un objeto con propiedad 'data' que contiene los items
      else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
        // Intentar extraer información de paginación si existe
        if (response.pageNumber !== undefined) {
          paginationInfo = {
            pageNumber: response.pageNumber,
            pageSize: response.pageSize || 10,
            totalCount: response.totalCount || 0,
            totalPages: response.totalPages || 1,
            hasPreviousPage: response.hasPreviousPage || false,
            hasNextPage: response.hasNextPage || false
          };
        }
      }
      // Si la respuesta es directamente un array
      else if (Array.isArray(response)) {
        items = response;
      }
      
      // Transformar datos recibidos al formato frontend
      const puestos = items.map(item => this.transformarPuestoAFormatoFrontend(item));
      
      // Devolver respuesta paginada con los puestos transformados
      return {
        items: puestos,
        pageNumber: paginationInfo.pageNumber,
        pageSize: paginationInfo.pageSize,
        totalCount: paginationInfo.totalCount,
        totalPages: paginationInfo.totalPages,
        hasPreviousPage: paginationInfo.hasPreviousPage,
        hasNextPage: paginationInfo.hasNextPage
      };
    } catch (error) {
      console.error('Error al obtener puestos:', error);
      throw error;
    }
  },

  /**
   * Obtiene un puesto por su ID
   * @param id - ID del puesto
   * @returns Puesto encontrado o null si no existe
   */
  async getById(id: number): Promise<Puesto | null> {
    try {
      if (!id) {
        throw new Error('Se requiere un ID válido para obtener un puesto');
      }
      
      const response = await apiClient.get<ApiResponse<any> | any>(`/v1/Puestos/${id}`);
      
      // Extraer datos según la estructura de la respuesta
      let datosRespuesta;
      if (response.data !== undefined) {
        datosRespuesta = response.data;
      } else {
        datosRespuesta = response;
      }
      
      // Transformar a formato frontend
      return this.transformarPuestoAFormatoFrontend(datosRespuesta);
    } catch (error) {
      console.error(`Error al obtener puesto ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo puesto
   * @param puesto - Datos del puesto a crear
   * @returns El puesto creado
   */
  async create(puesto: Puesto): Promise<Puesto> {
    try {
      console.log('Creando nuevo puesto:', puesto);
      
      // Transformar a formato API
      const puestoAPI = this.transformarPuestoAFormatoAPI(puesto);
      
      // Realizar petición a la API con headers para evitar caché
      const response = await apiClient.post<ApiResponse<any> | any>(`/v1/Puestos?_ts=${Date.now()}`, puestoAPI, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Respuesta de creación de puesto:', response);
      
      // Extraer datos según la estructura de la respuesta
      let datosRespuesta;
      if (response.data !== undefined) {
        datosRespuesta = response.data;
      } else {
        datosRespuesta = response;
      }
      
      // Transformar a formato frontend
      const nuevoPuesto = this.transformarPuestoAFormatoFrontend(datosRespuesta);
      console.log('Nuevo puesto transformado:', nuevoPuesto);
      return nuevoPuesto;
    } catch (error) {
      console.error('Error al crear puesto:', error);
      throw error;
    }
  },

  /**
   * Actualiza un puesto existente
   * @param id - ID del puesto a actualizar
   * @param puesto - Datos actualizados del puesto
   * @returns El puesto actualizado
   */
  async update(id: number, puesto: Puesto): Promise<Puesto> {
    try {
      if (!id) {
        throw new Error('Se requiere un ID válido para actualizar un puesto');
      }
      
      console.log(`Actualizando puesto ID ${id}:`, puesto);
      
      // Transformar a formato API
      const puestoAPI = this.transformarPuestoAFormatoAPI(puesto);
      
      // Realizar petición a la API con headers para evitar caché
      const response = await apiClient.put<ApiResponse<any> | any>(`/v1/Puestos/${id}?_ts=${Date.now()}`, puestoAPI, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`Respuesta de actualización para puesto ID ${id}:`, response);
      
      // Extraer datos según la estructura de la respuesta
      let datosRespuesta;
      if (response.data !== undefined) {
        datosRespuesta = response.data;
      } else {
        datosRespuesta = response;
      }
      
      // Transformar a formato frontend
      const puestoActualizado = this.transformarPuestoAFormatoFrontend(datosRespuesta);
      console.log('Puesto actualizado transformado:', puestoActualizado);
      return puestoActualizado;
    } catch (error) {
      console.error(`Error al actualizar puesto ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un puesto por su ID
   * @param id - ID del puesto
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  async delete(id: number): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('Se requiere un ID válido para eliminar un puesto');
      }
      
      // Realizar petición a la API
      await apiClient.delete<ApiResponse<boolean> | boolean>(`/v1/Puestos/${id}`);
      
      // Si no hay error, consideramos que la operación fue exitosa
      return true;
    } catch (error) {
      console.error(`Error al eliminar puesto ID ${id}:`, error);
      throw error;
    }
  }
};
