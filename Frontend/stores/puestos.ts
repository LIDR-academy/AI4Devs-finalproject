/**
 * Store para gestionar el estado de los puestos
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Puesto, puestoService } from '~/services/puestoService';

export const usePuestosStore = defineStore('puestos', () => {
  // Estado
  const puestos = ref<Puesto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPuesto = ref<Puesto | null>(null);

  // Getters
  const getPuestoById = computed(() => {
    return (id: number) => puestos.value.find(p => p.puestoId === id) || null;
  });

  const getPuestosActivos = computed(() => {
    return puestos.value.filter(p => p.puestoActivo);
  });

  // Acciones
  /**
   * Carga todos los puestos desde la API
   * @param forceRefresh - Si es true, fuerza una recarga desde la API ignorando la caché
   */
  async function fetchPuestos(forceRefresh = false) {
    // Si ya estamos cargando, evitamos solicitudes duplicadas
    if (isLoading.value && !forceRefresh) {
      console.log('Ya hay una carga en progreso, ignorando solicitud duplicada');
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Iniciando carga de puestos...');
      // Incluimos explícitamente los puestos inactivos
      const respuestaPaginada = await puestoService.getAll({ 
        page: 1, 
        pageSize: 100,
        sortBy: 'Id',
        sortDirection: 'desc', // Más recientes primero
        includeInactive: true // Importante: esto hace que se incluyan tanto activos como inactivos
      });
      
      // Actualizar la lista de puestos
      puestos.value = respuestaPaginada.items;
      console.log(`Puestos cargados exitosamente: ${respuestaPaginada.items.length}`);
      
      // Registrar IDs para depuración
      const ids = respuestaPaginada.items.map(p => p.puestoId).join(', ');
      console.log(`IDs de puestos cargados: ${ids}`);
      
      return respuestaPaginada;
    } catch (err: any) {
      console.error('Error al cargar puestos:', err);
      error.value = err.message || 'Error al cargar los puestos';
      // No vaciamos el array de puestos para mantener datos anteriores si los hay
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Carga un puesto específico por su ID
   * @param id - ID del puesto a cargar
   */
  async function fetchPuestoById(id: number) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await puestoService.getById(id);
      currentPuesto.value = data;
      
      // Actualizar también en la lista si existe
      const index = puestos.value.findIndex(p => p.puestoId === id);
      if (index !== -1) {
        puestos.value[index] = data;
      }
      
      return data;
    } catch (err: any) {
      console.error(`Error al cargar puesto ID ${id}:`, err);
      error.value = err.message || `Error al cargar el puesto con ID ${id}`;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Crea un nuevo puesto
   * @param puesto - Datos del nuevo puesto
   */
  async function createPuesto(puesto: Puesto) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await puestoService.create(puesto);
      
      if (data) {
        // Añadir el nuevo puesto al array y ordenar por ID descendente (más reciente primero)
        puestos.value.push(data);
        puestos.value.sort((a, b) => (b.puestoId || 0) - (a.puestoId || 0));
        
        // Actualizar el puesto actual si es necesario
        currentPuesto.value = data;
        
        console.log('Puesto creado y añadido al store:', data);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error al crear puesto:', err);
      error.value = err.message || 'Error al crear el puesto';
      return null;
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
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await puestoService.update(id, puesto);
      
      if (data) {
        // Actualizar en la lista
        const index = puestos.value.findIndex(p => p.puestoId === id);
        if (index !== -1) {
          puestos.value[index] = data;
          console.log(`Puesto ID ${id} actualizado en el índice ${index}:`, data);
        } else {
          // Si no se encuentra en la lista, podría ser un problema de sincronización
          // Añadirlo a la lista para mantener la coherencia
          console.warn(`Puesto ID ${id} no encontrado en la lista local, añadiéndolo...`);
          puestos.value.push(data);
          puestos.value.sort((a, b) => (b.puestoId || 0) - (a.puestoId || 0));
        }
        
        // Actualizar puesto actual si es el mismo
        if (currentPuesto.value && currentPuesto.value.puestoId === id) {
          currentPuesto.value = data;
        }
      } else {
        console.warn(`La actualización del puesto ID ${id} devolvió datos nulos`);
      }
      
      return data;
    } catch (err: any) {
      console.error(`Error al actualizar puesto ID ${id}:`, err);
      error.value = err.message || `Error al actualizar el puesto con ID ${id}`;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Elimina un puesto
   * @param id - ID del puesto a eliminar
   */
  async function deletePuesto(id: number) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await puestoService.delete(id);
      
      if (success) {
        console.log(`Eliminación exitosa del puesto ID ${id}, actualizando estado local`);
        
        // Eliminar del array
        const puestoEliminado = puestos.value.find(p => p.puestoId === id);
        puestos.value = puestos.value.filter(p => p.puestoId !== id);
        
        // Limpiar puesto actual si es el mismo
        if (currentPuesto.value && currentPuesto.value.puestoId === id) {
          currentPuesto.value = null;
        }
        
        // Registrar para depuración
        console.log(`Puesto ID ${id} eliminado del store. Nombre: ${puestoEliminado?.puestoNombre}`);
        console.log(`Quedan ${puestos.value.length} puestos en el store`);
      } else {
        console.warn(`La operación de eliminación para el puesto ID ${id} no fue exitosa`);
      }
      
      return success;
    } catch (err: any) {
      console.error(`Error al eliminar puesto ID ${id}:`, err);
      error.value = err.message || `Error al eliminar el puesto con ID ${id}`;
      return false;
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
  }

  return {
    // Estado
    puestos,
    isLoading,
    error,
    currentPuesto,
    
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
