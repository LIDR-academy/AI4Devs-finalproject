<template>
  <div class="container px-4 py-8 mx-auto">
    <div class="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <!-- Encabezado con título y botón de nuevo -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Tipos de Proyecto
        </h1>
        <button
          @click="openCreateModal"
          class="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon class="mr-2 w-5 h-5" />
          Nuevo Tipo de Proyecto
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar tipos de proyecto..."
              class="py-2 pr-4 pl-10 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="filters.status"
            class="px-4 py-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 md:w-48 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Contenedor principal para la tabla y mensajes -->
      <div
        class="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800"
      >
        <!-- Indicador de estado de conexión -->
        <div
          v-if="connectionError"
          class="p-4 mb-4 bg-red-50 border-l-4 border-red-500 dark:bg-red-900/30"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="w-5 h-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                Error de conexión
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  No se pudo conectar con el servidor backend. Por favor,
                  verifica que:
                </p>
                <ul class="pl-5 mt-2 space-y-1 list-disc">
                  <li>El servidor backend está en ejecución</li>
                  <li>
                    La URL del servidor es correcta
                    (http://localhost:5217/api)
                  </li>
                  <li>No hay problemas de red o firewall</li>
                </ul>
                <div class="flex items-center mt-3 space-x-2">
                  <button
                    @click="retryConnection"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-white rounded-md border border-red-500 hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    :disabled="reconnecting"
                  >
                    <svg
                      v-if="!reconnecting"
                      class="mr-2 -ml-1 w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <svg
                      v-else
                      class="mr-2 -ml-1 w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {{
                      reconnecting
                        ? `Reintentando (${reconnectAttempts}/${maxReconnectAttempts})...`
                        : "Reintentar conexión"
                    }}
                  </button>
                  <button
                    v-if="reconnecting"
                    @click="stopReconnection"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="flex justify-center items-center p-4">
          <div
            class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary-500"
          ></div>
        </div>

        <!-- Mensaje de no hay datos -->
        <div
          v-else-if="!loading && tiposProyecto.length === 0"
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          <p>No se encontraron tipos de proyecto.</p>
        </div>

        <!-- Tabla de tipos de proyecto -->
        <div v-else-if="tiposProyecto.length > 0" class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                >
                  ID
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
            >
              <tr v-for="tipo in paginatedTiposProyecto" :key="tipo.id">
                <td
                  class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ tipo.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ tipo.nombre }}
                  </div>
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-900 dark:text-white"
                >
                  <div class="overflow-hidden max-w-xs text-ellipsis" style="max-width: 300px;">
                    <span :title="tipo.descripcion || '-'" class="cursor-help">
                      {{ tipo.descripcion || "-" }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <span
                    :class="
                      tipo.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    "
                    class="inline-flex px-2 text-xs font-semibold leading-5 rounded-full"
                  >
                    {{ tipo.activo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <button
                    @click="openEditModal(tipo)"
                    class="mr-4 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(tipo)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div
          v-if="tiposProyecto.length > itemsPerPage"
          class="px-6 py-4 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
              {{
                Math.min(currentPage * itemsPerPage, tiposProyecto.length)
              }}
              de {{ tiposProyecto.length }} resultados
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= Math.ceil(tiposProyecto.length / itemsPerPage)"
                class="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar tipo de proyecto -->
    <TipoProyectoModal
      :show="showModal"
      :tipo-proyecto="selectedTipoProyecto"
      :is-editing="isEditing"
      :connection-error="connectionError"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- Modal de confirmación para eliminar -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      :title="`Eliminar Tipo de Proyecto`"
      :message="`¿Estás seguro de que deseas eliminar el tipo de proyecto '${selectedTipoProyecto?.nombre}'? Esta acción no se puede deshacer.`"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import TipoProyectoModal from '@/components/TipoProyectoModal.vue';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue';
import { useToast } from '@/composables/useToast';
import { tipoProyectoService } from '@/services/tipoProyectoService';

// Toast para notificaciones
const toast = useToast();

// Estado de la página
const loading = ref(false);
const tiposProyecto = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedTipoProyecto = ref(null);
const connectionError = ref(false);
const reconnecting = ref(false);
const reconnectAttempts = ref(0);
const reconnectInterval = ref(null);
const maxReconnectAttempts = 5;

// Filtros y paginación
const filters = ref({
  search: '',
  status: 'all',
});
const currentPage = ref(1);
const itemsPerPage = 10;

// Tipos de proyecto filtrados
const filteredTiposProyecto = computed(() => {
  return tiposProyecto.value.filter((tipo) => {
    // Filtrar por búsqueda
    const searchMatch = !filters.value.search
      ? true
      : tipo.nombre
          .toLowerCase()
          .includes(filters.value.search.toLowerCase()) ||
        (tipo.descripcion || '')
          .toLowerCase()
          .includes(filters.value.search.toLowerCase());

    // Filtrar por estado
    const statusMatch =
      filters.value.status === 'all'
        ? true
        : filters.value.status === 'active'
        ? tipo.activo
        : !tipo.activo;

    return searchMatch && statusMatch;
  });
});

// Tipos de proyecto paginados
const paginatedTiposProyecto = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTiposProyecto.value.slice(startIndex, endIndex);
});

// Observar cambios en los filtros para resetear la paginación
watch(
  () => filters.value,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// Observar cambios en los datos filtrados para ajustar la página actual si es necesario
watch(
  () => filteredTiposProyecto.value.length,
  (newLength) => {
    const maxPage = Math.ceil(newLength / itemsPerPage) || 1;
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  }
);

// Abrir modal para crear
const openCreateModal = () => {
  selectedTipoProyecto.value = null;
  isEditing.value = false;
  showModal.value = true;
};

// Abrir modal para editar
const openEditModal = (tipo) => {
  selectedTipoProyecto.value = { ...tipo };
  isEditing.value = true;
  showModal.value = true;
};

// Cerrar modal
const closeModal = () => {
  // Primero ocultar el modal
  showModal.value = false;
  
  // Limpiar la selección
  selectedTipoProyecto.value = null;
  
  // Forzar la recreación del componente después de un pequeño retraso
  setTimeout(() => {
    isEditing.value = false;
  }, 300);
};

// Confirmar eliminación
const confirmDelete = (tipo) => {
  selectedTipoProyecto.value = tipo;
  showDeleteModal.value = true;
};

// Manejar envío del formulario (crear o editar)
const handleSubmit = async (tipoProyecto) => {
  try {
    if (isEditing.value) {
      // Actualizar tipo de proyecto existente
      await updateTipoProyecto(tipoProyecto);
      toast.success('Tipo de proyecto actualizado correctamente');
    } else {
      // Crear nuevo tipo de proyecto
      await createTipoProyecto(tipoProyecto);
      toast.success('Tipo de proyecto creado correctamente');
    }
    
    // Cerrar modal y refrescar lista con forzado de caché
    closeModal();
    await fetchTiposProyecto(true); // Pasar true para forzar actualización
  } catch (error) {
    console.error('Error al guardar tipo de proyecto:', error);
    toast.error(`Error al ${isEditing.value ? 'actualizar' : 'crear'} tipo de proyecto: ${error.message || 'Error desconocido'}`);
  }
};

// Manejar eliminación
const handleDelete = async () => {
  if (!selectedTipoProyecto.value) return;
  
  try {
    await deleteTipoProyecto(selectedTipoProyecto.value.id);
    toast.success('Tipo de proyecto eliminado correctamente');
    showDeleteModal.value = false;
    selectedTipoProyecto.value = null;
    await fetchTiposProyecto(true); // Forzar actualización completa
  } catch (error) {
    console.error('Error al eliminar tipo de proyecto:', error);
    toast.error(`Error al eliminar tipo de proyecto: ${error.message || 'Error desconocido'}`);
  }
};

// Obtener tipos de proyecto
const fetchTiposProyecto = async (forceRefresh = false) => {
  loading.value = true;
  connectionError.value = false;
  
  try {
    // Obtener todos los tipos de proyecto (activos e inactivos) con opción de forzar actualización
    const data = await tipoProyectoService.getAll(forceRefresh, true);
    
    // Mapear los datos recibidos al formato esperado por el componente
    tiposProyecto.value = data.map(item => ({
      id: item.id,
      nombre: item.tipoProyectoNombre || item.nombre,
      descripcion: item.tipoProyectoDescripcion || item.descripcion,
      activo: item.tipoProyectoActivo !== undefined ? item.tipoProyectoActivo : item.activo
    }));
    
    console.log(`Se obtuvieron ${tiposProyecto.value.length} tipos de proyecto`);
    const activos = tiposProyecto.value.filter(t => t.activo).length;
    const inactivos = tiposProyecto.value.length - activos;
    console.log(`Activos: ${activos}, Inactivos: ${inactivos}`);
    
    // Resetear a la primera página si es necesario
    if (paginatedTiposProyecto.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1;
    }
    
    // Limpiar cualquier error de conexión previo
    connectionError.value = false;
  } catch (error) {
    console.error('Error al obtener tipos de proyecto:', error);
    
    // Manejar específicamente errores de conexión
    if (error.name === 'AbortError' || 
        error.message && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Network Error') ||
          error.message.includes('ERR_CONNECTION_REFUSED')
        )
    ) {
      connectionError.value = true;
      toast.error('No se pudo conectar con el servidor. Por favor, verifica que el backend esté en ejecución.');
    } else {
      // Para otros tipos de errores, mostrar mensaje genérico
      toast.error(`Error al cargar tipos de proyecto: ${error.message || 'Error desconocido'}`);
    }
  } finally {
    loading.value = false;
  }
};

// Crear tipo de proyecto
const createTipoProyecto = async (tipoProyecto) => {
  try {
    // Mapear los datos al formato esperado por el servicio
    const tipoProyectoData = {
      tipoProyectoNombre: tipoProyecto.nombre,
      tipoProyectoDescripcion: tipoProyecto.descripcion,
      tipoProyectoActivo: tipoProyecto.activo
    };
    
    // Usar el servicio para crear
    return await tipoProyectoService.create(tipoProyectoData);
  } catch (error) {
    console.error('Error al crear tipo de proyecto:', error);
    throw error;
  }
};

// Actualizar tipo de proyecto
const updateTipoProyecto = async (tipoProyecto) => {
  try {
    // Mapear los datos al formato esperado por el servicio
    const tipoProyectoData = {
      tipoProyectoNombre: tipoProyecto.nombre,
      tipoProyectoDescripcion: tipoProyecto.descripcion,
      tipoProyectoActivo: tipoProyecto.activo
    };
    
    // Usar el servicio para actualizar
    return await tipoProyectoService.update(tipoProyecto.id, tipoProyectoData);
  } catch (error) {
    console.error('Error al actualizar tipo de proyecto:', error);
    throw error;
  }
};

// Eliminar tipo de proyecto
const deleteTipoProyecto = async (id) => {
  try {
    // Usar el servicio para eliminar
    return await tipoProyectoService.delete(id);
  } catch (error) {
    console.error('Error al eliminar tipo de proyecto:', error);
    throw error;
  }
};

// Función para intentar reconectar automáticamente
const retryConnection = async () => {
  if (reconnecting.value) return;
  
  reconnecting.value = true;
  reconnectAttempts.value = 0;
  
  // Limpiar cualquier intervalo existente
  if (reconnectInterval.value) {
    clearInterval(reconnectInterval.value);
  }
  
  // Crear un nuevo intervalo para intentos de reconexión
  reconnectInterval.value = setInterval(async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      stopReconnection();
      toast.error('No se pudo establecer conexión después de múltiples intentos. Por favor, verifica el estado del servidor.');
      return;
    }
    
    reconnectAttempts.value++;
    console.log(`Intento de reconexión ${reconnectAttempts.value}/${maxReconnectAttempts}...`);
    
    try {
      // Intentar obtener datos
      await fetchTiposProyecto();
      
      // Si llegamos aquí, la conexión fue exitosa
      if (!connectionError.value) {
        stopReconnection();
        toast.success('Conexión restablecida correctamente');
      }
    } catch (error) {
      console.warn(`Intento de reconexión ${reconnectAttempts.value} fallido:`, error);
      // El error ya será manejado por fetchTiposProyecto
    }
  }, 5000); // Intentar cada 5 segundos
};

// Función para detener los intentos de reconexión
const stopReconnection = () => {
  if (reconnectInterval.value) {
    clearInterval(reconnectInterval.value);
    reconnectInterval.value = null;
  }
  reconnecting.value = false;
  reconnectAttempts.value = 0;
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchTiposProyecto();
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  stopReconnection(); // Asegurarse de limpiar el intervalo al desmontar
});
</script>
