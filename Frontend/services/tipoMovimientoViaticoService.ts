/**
 * Servicio para gestionar los tipos de movimiento de viático
 * Este archivo contiene las funciones para interactuar con la API de tipos de movimiento de viático
 */
import { apiClient } from './api';

// Interfaz para el tipo de movimiento de viático
export interface TipoMovimientoViatico {
  id?: number;
  nombre: string;
  descripcion?: string;
  afectacion: number; // 1: Positivo, -1: Negativo
  requiereComprobante: boolean;
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

// Servicio para gestionar los tipos de movimiento de viático
export const tipoMovimientoViaticoService = {
  /**
   * Obtiene todos los tipos de movimiento de viático
   * @param forceRefresh - Si es true, añade un parámetro para evitar caché
   * @returns Lista de tipos de movimiento de viático
   */
  async getAll(forceRefresh: boolean = false): Promise<TipoMovimientoViatico[]> {
    try {
      // Añadir parámetro para evitar caché si se solicita
      const endpoint = forceRefresh 
        ? `/v1/TiposMovimientoViatico?_nocache=${new Date().getTime()}` 
        : '/v1/TiposMovimientoViatico';
      
      console.log(`Llamando a la API para obtener tipos de movimiento de viático desde: ${endpoint}`);
      
      const response = await apiClient.get<ApiResponse<TipoMovimientoViatico[]> | TipoMovimientoViatico[]>(endpoint);
      
      // Imprimir la respuesta completa para depuración
      console.log('Respuesta completa de la API:', response);
      
      // Si response es undefined o null
      if (!response) {
        console.log('La respuesta de la API es undefined o null, devolviendo array vacío');
        return [];
      }
      
      // La API está devolviendo los datos directamente sin estar en una propiedad 'data'
      if (Array.isArray(response)) {
        console.log('La API devolvió un array directamente:', response);
        return response;
      }
      
      // Si response tiene una propiedad data que es un array
      if (response.data && Array.isArray(response.data)) {
        console.log('La API devolvió un objeto con propiedad data que es un array:', response.data);
        return response.data;
      }
      
      // Si response.data tiene una propiedad data que es un array
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('La API devolvió un objeto anidado con propiedad data:', response.data.data);
        return response.data.data;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn('La respuesta de la API tiene un formato inesperado:', response);
      return [];
    } catch (error: any) {
      // Detectar específicamente errores de conexión y propagarlos
      if (error.message && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Network Error') ||
          error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        console.warn('Error de conexión detectado en tipoMovimientoViaticoService.getAll:', error.message);
        // Propagar el error para que pueda ser manejado por los componentes
        throw error;
      }
      
      // Propagar errores de autenticación (401)
      if (error.response && error.response.status === 401) {
        console.warn('Error de autenticación en tipoMovimientoViaticoService.getAll');
        throw error;
      }
      
      console.error('Error al obtener todos los tipos de movimiento de viático:', error);
      throw error; // Propagar el error para manejo centralizado
    }
  },

  /**
   * Obtiene un tipo de movimiento de viático por su ID
   * @param id - ID del tipo de movimiento de viático
   * @returns Tipo de movimiento de viático
   */
  async getById(id: number): Promise<TipoMovimientoViatico> {
    try {
      console.log(`Obteniendo tipo de movimiento de viático con ID ${id}`);
      const response = await apiClient.get<ApiResponse<TipoMovimientoViatico> | TipoMovimientoViatico>(`/v1/TiposMovimientoViatico/${id}`);
      
      console.log(`Respuesta completa para tipo de movimiento de viático ID ${id}:`, response);
      
      // Si la respuesta es directamente el objeto esperado
      if (response && typeof response === 'object' && !Array.isArray(response) && response.id) {
        console.log(`Respuesta directa con ID ${id}:`, response);
        return response as TipoMovimientoViatico;
      }
      
      // Si la respuesta es un objeto pero no tiene ID, podría ser un wrapper
      if (response && typeof response === 'object') {
        // Caso 1: La API devuelve un objeto con propiedad data
        if (response.data && typeof response.data === 'object') {
          if (response.data.id) {
            console.log(`Respuesta con data.id ${id}:`, response.data);
            return response.data as TipoMovimientoViatico;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            // Si data es un array, buscar el elemento con el ID correcto
            const item = response.data.find(item => item.id === id);
            if (item) {
              console.log(`Encontrado elemento con ID ${id} en array:`, item);
              return item as TipoMovimientoViatico;
            }
          }
        }
        
        // Caso 2: La respuesta es el objeto directo pero sin wrapper
        if (response.id === id) {
          console.log(`Respuesta directa con ID ${id}:`, response);
          return response as TipoMovimientoViatico;
        }
      }
      
      // Si llegamos aquí, intentamos una última vez con una estructura conocida
      const tipoMovimientoViatico: TipoMovimientoViatico = {
        id: id,
        nombre: '',
        descripcion: '',
        afectacion: 1,
        requiereComprobante: true,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      };
      
      console.warn(`No se pudo extraer correctamente el tipo de movimiento de viático con ID ${id}, devolviendo estructura básica`);
      return tipoMovimientoViatico;
    } catch (error) {
      console.error(`Error al obtener tipo de movimiento de viático con ID ${id}:`, error);
      
      // Devolver un objeto con la estructura correcta pero vacío
      return {
        id: id,
        nombre: '',
        descripcion: '',
        afectacion: 1,
        requiereComprobante: true,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      } as TipoMovimientoViatico;
    }
  },

  /**
   * Crea un nuevo tipo de movimiento de viático
   * @param tipoMovimientoViatico - Datos del tipo de movimiento de viático
   * @returns Tipo de movimiento de viático creado
   */
  async create(tipoMovimientoViatico: TipoMovimientoViatico): Promise<TipoMovimientoViatico> {
    try {
      const response = await apiClient.post<ApiResponse<TipoMovimientoViatico> | TipoMovimientoViatico>('/v1/TiposMovimientoViatico', tipoMovimientoViatico);
      
      // Caso especial: si response.data es undefined o null
      if (!response.data) {
        console.log('La respuesta de la API es undefined o null, devolviendo objeto vacío');
        return {} as TipoMovimientoViatico;
      }
      
      // Caso 1: La API devuelve un objeto directamente (sin wrapper)
      if (typeof response.data === 'object' && !Array.isArray(response.data) && 
          !response.data.hasOwnProperty('statusCode') && !response.data.hasOwnProperty('data')) {
        console.log('La API devolvió un objeto directamente:', response.data);
        return response.data as TipoMovimientoViatico;
      }
      
      // Caso 2: La API devuelve un objeto con propiedad data
      if (response.data && response.data.data) {
        console.log('La API devolvió un objeto con propiedad data:', response.data.data);
        return response.data.data;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn('La respuesta de la API tiene un formato inesperado:', response.data);
      return {} as TipoMovimientoViatico;
    } catch (error) {
      console.error('Error al crear tipo de movimiento de viático:', error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  /**
   * Actualiza un tipo de movimiento de viático existente
   * @param id - ID del tipo de movimiento de viático
   * @param tipoMovimientoViatico - Datos actualizados del tipo de movimiento de viático
   * @returns Tipo de movimiento de viático actualizado
   */
  async update(id: number, tipoMovimientoViatico: TipoMovimientoViatico): Promise<TipoMovimientoViatico> {
    try {
      console.log(`Enviando actualización para tipo de movimiento de viático ID ${id}:`, tipoMovimientoViatico);
      
      // Guardar una copia de los datos enviados para usarla como respuesta si es necesario
      const datosEnviados = { ...tipoMovimientoViatico, id };
      
      try {
        // Realizar la actualización
        const response = await apiClient.put<ApiResponse<TipoMovimientoViatico> | TipoMovimientoViatico>(`/v1/TiposMovimientoViatico/${id}`, tipoMovimientoViatico);
        
        console.log(`Respuesta de actualización para ID ${id} con status:`, response);
        
        // Si la respuesta es un objeto vacío (común en respuestas 204 No Content)
        if (!response || Object.keys(response).length === 0) {
          console.log(`Respuesta vacía (posiblemente 204 No Content), usando datos enviados como respuesta`);
          // Devolver los datos que enviamos, ya que sabemos que se actualizaron correctamente
          return datosEnviados;
        }
        
        // Si la respuesta es el objeto directamente
        if (response && typeof response === 'object' && response.id === id) {
          console.log(`Respuesta directa con ID correcto:`, response);
          return response as TipoMovimientoViatico;
        }
        
        // Si la respuesta tiene una propiedad data
        if (response && response.data) {
          if (typeof response.data === 'object' && response.data.id === id) {
            console.log(`Respuesta con data.id correcto:`, response.data);
            return response.data as TipoMovimientoViatico;
          } else if (response.data.data && response.data.data.id === id) {
            console.log(`Respuesta con data.data.id correcto:`, response.data.data);
            return response.data.data as TipoMovimientoViatico;
          }
        }
        
        // Si llegamos aquí, intentamos obtener los datos actualizados
        console.log(`No se pudo extraer datos de la respuesta, obteniendo datos actualizados`);
        const datosActualizados = await this.getById(id);
        
        // Si getById devuelve un objeto con ID, lo usamos
        if (datosActualizados && datosActualizados.id === id) {
          return datosActualizados;
        }
        
        // Si todo falla, devolvemos los datos que enviamos
        console.log(`No se pudo obtener datos actualizados, usando datos enviados como respuesta`);
        return datosEnviados;
        
      } catch (updateError) {
        console.error(`Error en la llamada de actualización:`, updateError);
        
        // Si hay un error 401, no intentamos hacer más llamadas para evitar ciclos
        if (updateError.response && updateError.response.status === 401) {
          console.error(`Error de autenticación 401 en actualización, no realizando más llamadas`);
          throw updateError;
        }
        
        // Para otros errores, intentamos obtener los datos actuales
        console.log(`Intentando obtener datos actuales después del error`);
        return await this.getById(id);
      }
    } catch (error) {
      console.error('Error al actualizar tipo de movimiento de viático:', error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  /**
   * Elimina un tipo de movimiento de viático
   * @param id - ID del tipo de movimiento de viático
   * @returns Resultado de la operación
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando eliminación del tipo de movimiento de viático con ID ${id}`);
      
      // Realizar la petición DELETE
      const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/v1/TiposMovimientoViatico/${id}`);
      
      console.log(`Respuesta completa de eliminación para ID ${id}:`, response);
      
      // Caso 1: Respuesta 204 No Content (éxito sin contenido)
      // En este caso, response puede ser un objeto vacío o tener data undefined
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
      console.error(`Error al eliminar tipo de movimiento de viático con ID ${id}:`, error);
      
      // Si es un error 401, propagarlo para que sea manejado por el interceptor global
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción con mensaje descriptivo
      throw new Error(error.message || `Error al eliminar el tipo de movimiento de viático con ID ${id}`);
    }
  }
};
