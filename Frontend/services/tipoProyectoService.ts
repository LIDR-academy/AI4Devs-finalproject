/**
 * Servicio para gestionar los tipos de proyecto
 * Este archivo contiene las funciones para interactuar con la API de tipos de proyecto
 */
import { apiClient } from './api';

// Interfaz para el tipo de proyecto
export interface TipoProyecto {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

// Servicio para gestionar los tipos de proyecto
export const tipoProyectoService = {
  /**
   * Obtiene todos los tipos de proyecto
   * @param forceRefresh - Si es true, añade un parámetro para evitar caché
   * @param includeInactive - Si es true, incluye también los tipos de proyecto inactivos
   * @returns Lista de tipos de proyecto
   */
  async getAll(forceRefresh: boolean = false, includeInactive: boolean = false): Promise<TipoProyecto[]> {
    try {
      // Determinar el endpoint según si se requieren inactivos
      let endpoint = includeInactive ? '/v1/TiposProyecto/all' : '/v1/TiposProyecto';
      
      // Añadir parámetros a la URL
      const params = new URLSearchParams();
      
      // Si se requieren inactivos, añadir el parámetro includeInactive=true
      if (includeInactive) {
        params.append('includeInactive', 'true');
      }
      
      // Si se solicita evitar caché, añadir el parámetro _nocache
      if (forceRefresh) {
        params.append('_nocache', new Date().getTime().toString());
      }
      
      // Añadir los parámetros a la URL si hay alguno
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      console.log(`Llamando a la API para obtener tipos de proyecto desde: ${endpoint}`);
      
      const response = await apiClient.get<ApiResponse<TipoProyecto[]> | TipoProyecto[]>(endpoint);
      
      // Imprimir la respuesta completa para depuración
      console.log('Respuesta completa de la API:', response);
      
      // Si response es undefined o null
      if (!response) {
        console.log('La respuesta de la API es undefined o null, devolviendo array vacío');
        return [];
      }
      
      // Procesar la respuesta para obtener el array de tipos de proyecto
      let tiposProyecto: TipoProyecto[] = [];
      
      // La API está devolviendo los datos directamente sin estar en una propiedad 'data'
      if (Array.isArray(response)) {
        tiposProyecto = response;
      }
      // Si response tiene una propiedad data que es un array
      else if (response.data && Array.isArray(response.data)) {
        tiposProyecto = response.data;
      }
      // Si response.data tiene una propiedad data que es un array
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        tiposProyecto = response.data.data;
      }
      
      // Si no se requieren los inactivos, filtrar solo los activos
      if (!includeInactive) {
        console.log('Filtrando solo tipos de proyecto activos');
        return tiposProyecto.filter(tipo => tipo.activo);
      }
      
      console.log(`Devolviendo ${tiposProyecto.length} tipos de proyecto (incluidos inactivos)`);
      return tiposProyecto;
    } catch (error: any) {
      // Detectar específicamente errores de conexión y propagarlos
      if (error.message && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Network Error') ||
          error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        console.warn('Error de conexión detectado en tipoProyectoService.getAll:', error.message);
        // Propagar el error para que pueda ser manejado por los componentes
        throw error;
      }
      
      // Propagar errores de autenticación (401)
      if (error.response && error.response.status === 401) {
        console.warn('Error de autenticación en tipoProyectoService.getAll');
        throw error;
      }
      
      console.error('Error al obtener todos los tipos de proyecto:', error);
      throw error; // Propagar el error para manejo centralizado
    }
  },

  /**
   * Obtiene un tipo de proyecto por su ID
   * @param id - ID del tipo de proyecto
   * @returns Tipo de proyecto
   */
  async getById(id: number): Promise<TipoProyecto> {
    try {
      console.log(`Obteniendo tipo de proyecto con ID ${id}`);
      const response = await apiClient.get<ApiResponse<TipoProyecto> | TipoProyecto>(`/v1/TiposProyecto/${id}`);
      
      console.log(`Respuesta completa para tipo de proyecto ID ${id}:`, response);
      
      // Si la respuesta es directamente el objeto esperado
      if (response && typeof response === 'object' && !Array.isArray(response) && response.id) {
        console.log(`Respuesta directa con ID ${id}:`, response);
        return response as TipoProyecto;
      }
      
      // Si la respuesta es un objeto pero no tiene ID, podría ser un wrapper
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Si tiene una propiedad data que es el objeto esperado
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          if (response.data.id) {
            console.log(`Respuesta con wrapper data para ID ${id}:`, response.data);
            return response.data as TipoProyecto;
          }
          
          // Si data.data es el objeto esperado (doble wrapper)
          if (response.data.data && typeof response.data.data === 'object' && response.data.data.id) {
            console.log(`Respuesta con doble wrapper data para ID ${id}:`, response.data.data);
            return response.data.data as TipoProyecto;
          }
        }
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn(`La respuesta para ID ${id} tiene un formato inesperado:`, response);
      throw new Error(`No se pudo obtener el tipo de proyecto con ID ${id}`);
    } catch (error: any) {
      console.error(`Error al obtener tipo de proyecto con ID ${id}:`, error);
      
      // Si es un error de red, propagarlo directamente
      if (error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network Error') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        throw error;
      }
      
      // Si es un error 404, manejar específicamente
      if (error.response && error.response.status === 404) {
        throw new Error(`No se encontró el tipo de proyecto con ID ${id}`);
      }
      
      // Si es un error 401, propagarlo para manejo centralizado
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción genérica
      throw new Error(`Error al obtener el tipo de proyecto con ID ${id}: ${error.message || 'Error desconocido'}`);
    }
  },

  /**
   * Crea un nuevo tipo de proyecto
   * @param tipoProyecto - Datos del tipo de proyecto
   * @returns Tipo de proyecto creado
   */
  async create(tipoProyecto: TipoProyecto): Promise<TipoProyecto> {
    try {
      console.log('Creando nuevo tipo de proyecto:', tipoProyecto);
      
      const response = await apiClient.post<ApiResponse<TipoProyecto> | TipoProyecto>('/v1/TiposProyecto', tipoProyecto);
      
      console.log('Respuesta de creación de tipo de proyecto:', response);
      
      // Caso 1: La API devuelve directamente el objeto creado
      if (response && typeof response === 'object' && !Array.isArray(response) && response.id) {
        console.log('La API devolvió el objeto creado directamente:', response);
        return response as TipoProyecto;
      }
      
      // Caso 2: La API devuelve un wrapper con el objeto creado en data
      if (response && typeof response === 'object' && response.data) {
        if (typeof response.data === 'object' && !Array.isArray(response.data) && response.data.id) {
          console.log('La API devolvió un wrapper con el objeto creado:', response.data);
          return response.data as TipoProyecto;
        }
        
        // Caso 3: Doble wrapper (data.data)
        if (response.data.data && typeof response.data.data === 'object' && response.data.data.id) {
          console.log('La API devolvió un doble wrapper con el objeto creado:', response.data.data);
          return response.data.data as TipoProyecto;
        }
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn('La respuesta de creación tiene un formato inesperado:', response);
      
      // Como último recurso, devolvemos los datos enviados con un ID generado temporalmente
      // Esto es solo un fallback y no debería ocurrir en producción
      return {
        ...tipoProyecto,
        id: Math.floor(Math.random() * -1000), // ID negativo temporal
      };
    } catch (error: any) {
      console.error('Error al crear tipo de proyecto:', error);
      
      // Si es un error de validación (400), extraer detalles si están disponibles
      if (error.response && error.response.status === 400 && error.response.data) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        
        throw new Error(`Error de validación: ${errorMessages || error.message || 'Datos inválidos'}`);
      }
      
      // Si es un error de autenticación (401), propagarlo
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción genérica
      throw new Error(error.message || 'Error al crear el tipo de proyecto');
    }
  },

  /**
   * Actualiza un tipo de proyecto existente
   * @param id - ID del tipo de proyecto
   * @param tipoProyecto - Datos actualizados del tipo de proyecto
   * @returns Tipo de proyecto actualizado
   */
  async update(id: number, tipoProyecto: TipoProyecto): Promise<TipoProyecto> {
    try {
      console.log(`Actualizando tipo de proyecto con ID ${id}:`, tipoProyecto);
      
      // Asegurarse de que el ID en la URL coincida con el ID en el objeto
      const datosEnviados = { ...tipoProyecto, id };
      
      const response = await apiClient.put<ApiResponse<TipoProyecto> | TipoProyecto>(
        `/v1/TiposProyecto/${id}`,
        datosEnviados
      );
      
      console.log(`Respuesta de actualización para ID ${id}:`, response);
      
      // Caso 1: La API devuelve directamente el objeto actualizado
      if (response && typeof response === 'object' && !Array.isArray(response) && response.id) {
        console.log(`La API devolvió el objeto actualizado directamente para ID ${id}:`, response);
        return response as TipoProyecto;
      }
      
      // Caso 2: La API devuelve un objeto vacío o null (204 No Content)
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        console.log(`La API devolvió respuesta vacía para ID ${id}, obteniendo datos actualizados...`);
        try {
          // Intentar obtener el objeto actualizado
          return await this.getById(id);
        } catch (getError) {
          console.warn(`No se pudo obtener el objeto actualizado para ID ${id}:`, getError);
          // Devolver los datos enviados como fallback
          return datosEnviados;
        }
      }
      
      // Caso 3: La API devuelve un wrapper con el objeto actualizado
      if (response && typeof response === 'object' && response.data) {
        // Si data es directamente el objeto
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          if (response.data.id) {
            console.log(`La API devolvió un wrapper con el objeto actualizado para ID ${id}:`, response.data);
            return response.data as TipoProyecto;
          }
          
          // Si data.data es el objeto (doble wrapper)
          if (response.data.data && typeof response.data.data === 'object' && response.data.data.id) {
            console.log(`La API devolvió un doble wrapper con el objeto actualizado para ID ${id}:`, response.data.data);
            return response.data.data as TipoProyecto;
          }
        }
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn(`La respuesta de actualización para ID ${id} tiene un formato inesperado:`, response);
      
      // Como último recurso, devolvemos los datos enviados
      return datosEnviados;
    } catch (error: any) {
      console.error(`Error al actualizar tipo de proyecto con ID ${id}:`, error);
      
      // Si es un error de validación (400), extraer detalles si están disponibles
      if (error.response && error.response.status === 400 && error.response.data) {
        const validationErrors = error.response.data.errors || {};
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        
        throw new Error(`Error de validación: ${errorMessages || error.message || 'Datos inválidos'}`);
      }
      
      // Si es un error de autenticación (401), propagarlo
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Si es un error 404, manejar específicamente
      if (error.response && error.response.status === 404) {
        throw new Error(`No se encontró el tipo de proyecto con ID ${id}`);
      }
      
      // Para otros errores, lanzar una excepción genérica
      throw new Error(error.message || `Error al actualizar el tipo de proyecto con ID ${id}`);
    }
  },

  /**
   * Elimina un tipo de proyecto
   * @param id - ID del tipo de proyecto
   * @returns Resultado de la operación
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando eliminación del tipo de proyecto con ID ${id}`);
      
      // Realizar la petición DELETE
      const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/v1/TiposProyecto/${id}`);
      
      console.log(`Respuesta completa de eliminación para ID ${id}:`, response);
      
      // Caso 1: Respuesta 204 No Content (éxito sin contenido)
      if (!response || Object.keys(response).length === 0 || response.data === undefined || response.data === null) {
        console.log(`Eliminación exitosa (204 No Content) para ID ${id}`);
        return true;
      }
      
      // Caso 2: La API devuelve un booleano directamente
      if (typeof response.data === 'boolean') {
        console.log(`La API devolvió un booleano para ID ${id}:`, response.data);
        return response.data;
      }
      
      // Caso 3: La API devuelve un objeto con propiedad data que es un booleano
      if (response.data && typeof response.data.data === 'boolean') {
        console.log(`La API devolvió un objeto con data booleana para ID ${id}:`, response.data.data);
        return response.data.data;
      }
      
      // Caso 4: La API devuelve un objeto con statusCode
      if (response.data && typeof response.data.statusCode === 'number') {
        const success = response.data.statusCode >= 200 && response.data.statusCode < 300;
        console.log(`La API devolvió statusCode ${response.data.statusCode} para ID ${id}, resultado: ${success ? 'éxito' : 'fallo'}`);
        return success;
      }
      
      // Caso 5: La respuesta es un objeto sin formato esperado pero existe (asumimos éxito)
      if (response && typeof response === 'object') {
        console.log(`Respuesta de eliminación para ID ${id} es un objeto sin formato esperado, asumiendo éxito`);
        return true;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato totalmente inesperado
      console.warn(`La respuesta de eliminación para ID ${id} tiene un formato inesperado:`, response);
      // Asumimos éxito por defecto para evitar falsos negativos
      return true;
    } catch (error: any) {
      console.error(`Error al eliminar tipo de proyecto con ID ${id}:`, error);
      
      // Si es un error 401, propagarlo para que sea manejado por el interceptor global
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción con mensaje descriptivo
      throw new Error(error.message || `Error al eliminar el tipo de proyecto con ID ${id}`);
    }
  }
};
