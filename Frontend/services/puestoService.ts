/**
 * Servicio para gestionar los puestos
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
  includeInactive?: boolean; // Nuevo parámetro para incluir puestos inactivos
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
    
    console.log('Datos originales de la API:', puestoAPI);
    
    // Mapear propiedades del formato API al formato frontend
    // Manejar posibles variaciones en la estructura de datos
    const puesto: Puesto = {
      // Manejar tanto formato PascalCase como formato sin prefijo
      puestoId: puestoAPI.puestoId || puestoAPI.PuestoId || puestoAPI.id || null,
      puestoNombre: puestoAPI.puestoNombre || puestoAPI.PuestoNombre || puestoAPI.nombre || '',
      puestoDescripcion: puestoAPI.puestoDescripcion || puestoAPI.PuestoDescripcion || puestoAPI.descripcion || '',
      puestoActivo: puestoAPI.puestoActivo !== undefined ? puestoAPI.puestoActivo : 
                   puestoAPI.PuestoActivo !== undefined ? puestoAPI.PuestoActivo :
                   puestoAPI.activo !== undefined ? puestoAPI.activo : true,
      fechaCreacion: puestoAPI.fechaCreacion || puestoAPI.FechaCreacion || puestoAPI.fechaCreacion,
      fechaModificacion: puestoAPI.fechaModificacion || puestoAPI.FechaModificacion || null
    };
    
    // Asegurar que puestoActivo sea booleano
    puesto.puestoActivo = Boolean(puesto.puestoActivo);
    
    console.log('Puesto transformado a formato frontend:', puesto);
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
    
    // Mapear propiedades del formato frontend al formato API sin prefijo
    const puestoAPI = {
      id: puesto.puestoId,
      nombre: puesto.puestoNombre || '',
      descripcion: puesto.puestoDescripcion || '',
      activo: Boolean(puesto.puestoActivo)
    };
    
    console.log('Puesto transformado a formato API:', puestoAPI);
    return puestoAPI;
  },
  /**
   * Obtiene todos los puestos
   * @param params - Parámetros de filtrado y paginación
   * @returns Lista de puestos
   */
  async getAll(params?: PuestoParams): Promise<PaginatedResponse<Puesto>> {
    try {

            let endpoint = params?.includeInactive ? '/v1/TiposProyecto/all' : '/v1/TiposProyecto';

      console.log('Obteniendo todos los puestos con parámetros:', params);
      
      // Construir query string para filtros
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Añadir parámetros de paginación
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
        
        // Añadir parámetros de filtrado
        if (params.search) queryParams.append('search', params.search);
        
        // Importante: Solo añadir el parámetro activo si no queremos incluir inactivos
        // Si params.includeInactive es true, no enviamos el parámetro activo para traer todos
        if (params.activo !== undefined && !params.includeInactive) {
          queryParams.append('activo', params.activo.toString());
        }
        
        // Añadir parámetros de ordenación
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await apiClient.get<ApiResponse<Puesto[]> | Puesto[]>(`${endpoint}${queryString}`);
      
      console.log('Respuesta completa de getAll:', response);
      
      // Si la respuesta es null o undefined
      if (!response) {
        console.error('La respuesta de getAll es null o undefined');
        throw new Error('No se pudieron obtener los puestos');
      }
      
      // Determinar dónde están los datos en la respuesta
      let datosRespuesta: any = null;
      let items: any[] = [];
      
      console.log('Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);
      
      if (Array.isArray(response)) {
        // La API devolvió un array directamente
        console.log('La API devolvió un array directamente:', response);
        items = response;
        
        // Crear una estructura de respuesta paginada simulada
        datosRespuesta = {
          items: response,
          pageNumber: 1,
          pageSize: response.length,
          totalCount: response.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false
        };
      } else if (response.items !== undefined) {
        // Respuesta directa como lista paginada
        datosRespuesta = response;
        items = response.items;
      } else if (response.data && response.data.items !== undefined) {
        // Respuesta con estructura ApiResponse
        datosRespuesta = response.data;
        items = response.data.items;
      } else if (response.data && response.data.data && response.data.data.items !== undefined) {
        // Respuesta con estructura anidada
        datosRespuesta = response.data.data;
        items = response.data.data.items;
      } else {
        console.error('La respuesta de getAll tiene un formato inesperado:', response);
        throw new Error('Formato de respuesta inesperado al obtener puestos');
      }
      
      // Transformar los items de la respuesta al formato del frontend
      const itemsTransformados = items.map((item: any) => this.transformarPuestoAFormatoFrontend(item));
      
      // Construir la respuesta paginada con los items transformados
      const respuestaPaginada: PaginatedResponse<Puesto> = {
        items: itemsTransformados,
        pageNumber: datosRespuesta.pageNumber,
        pageSize: datosRespuesta.pageSize,
        totalCount: datosRespuesta.totalCount,
        totalPages: datosRespuesta.totalPages,
        hasPreviousPage: datosRespuesta.hasPreviousPage,
        hasNextPage: datosRespuesta.hasNextPage
      };
      
      console.log('Respuesta paginada transformada:', respuestaPaginada);
      return respuestaPaginada;
    } catch (error: any) {
      // Propagar errores de autenticación (401)
      if (error.response && error.response.status === 401) {
        console.warn('Error de autenticación en puestoService.getAll');
        throw error;
      }
      
      console.error('Error al obtener todos los puestos:', error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  /**
   * Obtiene un puesto por su ID
   * @param id - ID del puesto
   * @returns Puesto encontrado o null si no existe
   */
  async getById(id: number): Promise<Puesto | null> {
    try {
      console.log(`Obteniendo puesto con ID ${id}`);
      
      const response = await apiClient.get<ApiResponse<any> | any>(`/v1/Puestos/${id}`);
      
      console.log(`Respuesta completa para ID ${id}:`, response);
      
      // Si la respuesta es null o undefined
      if (!response) {
        console.error(`No se encontró puesto con ID ${id}`);
        return null;
      }
      
      // Transformar la respuesta del backend al formato del frontend
      const puestoEncontrado = this.transformarPuestoAFormatoFrontend(response);
      
      console.log('Puesto transformado para el frontend:', puestoEncontrado);
      return puestoEncontrado;
    } catch (error) {
      console.error(`Error al obtener puesto con ID ${id}:`, error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  /**
   * Crea un nuevo puesto
   * @param puesto - Datos del puesto a crear
   * @returns El puesto creado
   */
  async create(puesto: Puesto): Promise<Puesto> {
    try {
      console.log('Creando puesto:', puesto);
      const puestoAPI = this.transformarPuestoAFormatoAPI(puesto);
      console.log('Datos enviados a la API:', puestoAPI);
      
      const response = await apiClient.post<ApiResponse<any> | any>('/v1/Puestos', puestoAPI);
      console.log('Respuesta de la API (create):', response);
      
      // Extraer datos según la estructura de la respuesta
      let datosRespuesta;
      if (response.data !== undefined) {
        datosRespuesta = response.data;
        console.log('Usando response.data para obtener datos');
      } else if (response.result !== undefined) {
        datosRespuesta = response.result;
        console.log('Usando response.result para obtener datos');
      } else {
        datosRespuesta = response;
        console.log('Usando response directamente para obtener datos');
      }
      
      // Verificar que tenemos datos válidos
      if (!datosRespuesta) {
        console.error('No se pudieron extraer datos de la respuesta:', response);
        throw new Error('La respuesta de la API no contiene datos válidos');
      }
      
      // Transformar a formato frontend
      const puestoCreado = this.transformarPuestoAFormatoFrontend(datosRespuesta);
      console.log('Puesto creado (transformado):', puestoCreado);
      
      return puestoCreado;
    } catch (error) {
      console.error('Error en puestoService.create:', error);
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
      const puestoAPI = this.transformarPuestoAFormatoAPI(puesto);
      console.log('Datos enviados a la API:', puestoAPI);
      
      const response = await apiClient.put<ApiResponse<any> | any>(`/v1/Puestos/${id}`, puestoAPI);
      console.log('Respuesta de la API (update):', response);
      
      // Extraer datos según la estructura de la respuesta
      let datosRespuesta;
      if (response.data !== undefined) {
        datosRespuesta = response.data;
        console.log('Usando response.data para obtener datos');
      } else if (response.result !== undefined) {
        datosRespuesta = response.result;
        console.log('Usando response.result para obtener datos');
      } else {
        datosRespuesta = response;
        console.log('Usando response directamente para obtener datos');
      }
      
      // Verificar que tenemos datos válidos
      if (!datosRespuesta) {
        console.error('No se pudieron extraer datos de la respuesta:', response);
        throw new Error('La respuesta de la API no contiene datos válidos');
      }
      
      // Transformar a formato frontend
      const puestoActualizado = this.transformarPuestoAFormatoFrontend(datosRespuesta);
      console.log('Puesto actualizado (transformado):', puestoActualizado);
      return puestoActualizado;
      
    } catch (error) {
      console.error('Error al actualizar puesto:', error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  /**
   * Elimina un puesto por su ID
   * @param id - ID del puesto
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Eliminando puesto con ID ${id}`);
      
      // El backend espera el ID en el formato correcto
      const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/v1/Puestos/${id}`);
      
      console.log(`Respuesta completa de eliminación para ID ${id}:`, response);
      
      // Si la respuesta es null o undefined, consideramos que la operación fue exitosa
      // ya que muchas APIs devuelven 204 No Content para eliminaciones exitosas
      if (!response || Object.keys(response).length === 0) {
        console.log(`Eliminación exitosa (204 No Content) para ID ${id}`);
        return true;
      }
      
      // Si la respuesta es directamente un booleano
      if (typeof response === 'boolean') {
        console.log(`La API devolvió directamente un booleano para ID ${id}:`, response);
        return response;
      }
      
      // Si la respuesta tiene una propiedad data que es un booleano
      if (response.data !== undefined && typeof response.data === 'boolean') {
        console.log(`La API devolvió un objeto con propiedad data para ID ${id}:`, response.data);
        return response.data;
      }
      
      // Si la respuesta tiene una estructura anidada
      if (response.data && response.data.data !== undefined && typeof response.data.data === 'boolean') {
        console.log(`La API devolvió un objeto anidado para ID ${id}:`, response.data.data);
        return response.data.data;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado pero consideramos que fue exitosa
      console.warn(`La respuesta para ID ${id} tiene un formato inesperado, asumiendo éxito:`, response);
      // Asumimos éxito por defecto para evitar falsos negativos
      return true;
    } catch (error: any) {
      console.error(`Error al eliminar puesto con ID ${id}:`, error);
      
      // Si es un error 401, propagarlo para que sea manejado por el interceptor global
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción con mensaje descriptivo
      throw new Error(error.message || `Error al eliminar el puesto con ID ${id}`);
    }
  }
};
