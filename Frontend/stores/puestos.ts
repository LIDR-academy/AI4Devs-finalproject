/**
 * Store para la gestión de puestos
 * Utiliza Pinia para manejar el estado global de los puestos
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Puesto, puestoService } from '../services/puestoService';
import { useToast } from '../composables/useToast';

// Interfaz para los parámetros de filtrado y paginación
interface PuestoParams {
  page?: number;
  pageSize?: number;
  search?: string;
  activo?: boolean;
  includeInactive?: boolean;
  sortBy?: string;
  sortDirection?: string;
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

/**
 * Store para la gestión de puestos
 */
export const usePuestosStore = defineStore('puestos', () => {
  // Estado
  const puestos = ref<Puesto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPuesto = ref<Puesto | null>(null);
  const toast = useToast();
  
  // Estado de paginación
  const paginationInfo = ref<{
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });
  
  // Getters
  const getPuestoById = computed(() => {
    return (id: number) => puestos.value.find(p => p.puestoId === id) || null;
  });
  
  const getPuestosActivos = computed(() => {
    return puestos.value.filter(p => p.puestoActivo);
  });
  
  /**
   * Obtiene la lista de puestos según los parámetros especificados
   * @param params - Parámetros de filtrado y paginación
   * @param forceRefresh - Indica si se debe forzar la recarga de datos
   */
  async function fetchPuestos(params?: PuestoParams, forceRefresh = false) {
    // Si ya estamos cargando datos y no es una recarga forzada, no hacer nada
    if (isLoading.value && !forceRefresh) return;
    
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('Ejecutando fetchPuestos con forceRefresh:', forceRefresh);
      
      // Obtener puestos del servicio
      // Si forceRefresh es true, añadir un timestamp para evitar caché
      const queryParams = { ...params };
      if (forceRefresh) {
        // Añadir timestamp para evitar caché
        queryParams._ts = Date.now();
      }
      
      const response = await puestoService.getAll(queryParams);
      
      console.log('Respuesta del servidor:', response);
      
      // Actualizar estado
      puestos.value = response.items;
      
      // Actualizar información de paginación
      paginationInfo.value = {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage
      };
      
      return response;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los puestos';
      toast.error(error.value);
      console.error('Error en fetchPuestos:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Obtiene un puesto por su ID
   * @param id - ID del puesto
   */
  async function fetchPuestoById(id: number) {
    if (!id) return null;
    
    try {
      isLoading.value = true;
      error.value = null;
      
      // Obtener puesto del servicio
      const puesto = await puestoService.getById(id);
      
      // Actualizar puesto actual
      if (puesto) {
        currentPuesto.value = puesto;
        
        // Actualizar en la lista si ya existe
        const index = puestos.value.findIndex(p => p.puestoId === id);
        if (index !== -1) {
          puestos.value[index] = puesto;
        }
      }
      
      return puesto;
    } catch (err: any) {
      error.value = err.message || `Error al obtener el puesto con ID ${id}`;
      toast.error(error.value);
      console.error(`Error en fetchPuestoById(${id}):`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Crea un nuevo puesto
   * @param puesto - Datos del puesto a crear
   */
  async function createPuesto(puesto: Puesto) {
    try {
      isLoading.value = true;
      error.value = null;
      
      // Crear puesto mediante el servicio
      const nuevoPuesto = await puestoService.create(puesto);
      
      // Añadir a la lista de puestos
      puestos.value.push(nuevoPuesto);
      
      // Actualizar puesto actual
      currentPuesto.value = nuevoPuesto;
      
      // Mostrar notificación de éxito
      toast.success('Puesto creado correctamente');
      
      return nuevoPuesto;
    } catch (err: any) {
      error.value = err.message || 'Error al crear el puesto';
      toast.error(error.value);
      console.error('Error en createPuesto:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Actualiza un puesto existente
   * @param id - ID del puesto a actualizar
   * @param puesto - Datos actualizados del puesto
   */
  async function updatePuesto(id: number, puesto: Puesto) {
    if (!id) {
      error.value = 'Se requiere un ID válido para actualizar un puesto';
      toast.error(error.value);
      throw new Error(error.value);
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log('Actualizando puesto con ID:', id, 'Datos:', puesto);
      
      // Actualizar puesto mediante el servicio
      const puestoActualizado = await puestoService.update(id, puesto);
      
      console.log('Puesto actualizado recibido del servidor:', puestoActualizado);
      
      // Actualizar en la lista de manera segura
      const index = puestos.value.findIndex(p => p.puestoId === id);
      if (index !== -1) {
        // Crear una nueva referencia para asegurar la reactividad
        const nuevaLista = [...puestos.value];
        nuevaLista[index] = { ...puestoActualizado };
        puestos.value = nuevaLista;
        console.log('Puesto actualizado en la lista local');
      } else {
        console.warn('No se encontró el puesto en la lista local para actualizar');
      }
      
      // Actualizar puesto actual con una nueva referencia
      currentPuesto.value = { ...puestoActualizado };
      
      // Mostrar notificación de éxito
      toast.success('Puesto actualizado correctamente');
      
      return puestoActualizado;
    } catch (err: any) {
      error.value = err.message || `Error al actualizar el puesto con ID ${id}`;
      toast.error(error.value);
      console.error(`Error en updatePuesto(${id}):`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Elimina un puesto por su ID
   * @param id - ID del puesto a eliminar
   */
  async function deletePuesto(id: number) {
    if (!id) {
      error.value = 'Se requiere un ID válido para eliminar un puesto';
      toast.error(error.value);
      throw new Error(error.value);
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      
      // Eliminar puesto mediante el servicio
      const resultado = await puestoService.delete(id);
      
      // Si se eliminó correctamente, quitar de la lista
      if (resultado) {
        puestos.value = puestos.value.filter(p => p.puestoId !== id);
        
        // Si el puesto actual es el eliminado, resetear
        if (currentPuesto.value?.puestoId === id) {
          currentPuesto.value = null;
        }
        
        // Mostrar notificación de éxito
        toast.success('Puesto eliminado correctamente');
      }
      
      return resultado;
    } catch (err: any) {
      error.value = err.message || `Error al eliminar el puesto con ID ${id}`;
      toast.error(error.value);
      console.error(`Error en deletePuesto(${id}):`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Resetea el estado del store
   */
  function resetState() {
    puestos.value = [];
    currentPuesto.value = null;
    error.value = null;
    isLoading.value = false;
    paginationInfo.value = {
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    };
  }
  
  // Exponer estado y métodos
  return { 
    // Estado
    puestos, 
    isLoading, 
    error, 
    currentPuesto,
    paginationInfo,
    
    // Getters
    getPuestoById, 
    getPuestosActivos,
    
    // Acciones
    fetchPuestos, 
    fetchPuestoById, 
    createPuesto, 
    updatePuesto, 
    deletePuesto, 
    resetState 
  };
});
