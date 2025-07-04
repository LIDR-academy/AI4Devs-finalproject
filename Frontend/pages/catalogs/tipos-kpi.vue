<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <!-- Encabezado con título y botón de nuevo -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Tipos de KPI
        </h1>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuevo Tipo de KPI
        </button>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar tipos de KPI..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="filters.status"
            class="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Contenedor principal para la tabla y mensajes -->
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
      >
        <!-- Indicador de estado de conexión -->
        <div
          v-if="connectionError"
          class="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 mb-4"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-500"
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
                <ul class="list-disc pl-5 space-y-1 mt-2">
                  <li>El servidor backend está en ejecución</li>
                  <li>
                    La URL del servidor es correcta
                    ({{ config.public.apiUrl }})
                  </li>
                  <li>No hay problemas de red o firewall</li>
                </ul>
                <div class="flex items-center mt-3 space-x-2">
                  <button
                    @click="retryConnection"
                    class="inline-flex items-center px-3 py-1.5 border border-red-500 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    :disabled="reconnecting"
                  >
                    <svg
                      v-if="!reconnecting"
                      class="-ml-1 mr-2 h-4 w-4"
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
                      class="-ml-1 mr-2 h-4 w-4 animate-spin"
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
                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="p-4 flex justify-center items-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
          ></div>
        </div>

        <!-- Mensaje de no hay datos -->
        <div
          v-else-if="!loading && tiposKPI.length === 0 && !connectionError"
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          <p>No se encontraron tipos de KPI.</p>
        </div>

        <!-- Tabla de tipos de KPI -->
        <div v-else-if="tiposKPI.length > 0" class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Nombre
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Unidad
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Formato
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr v-for="tipoKPI in paginatedTiposKPI" :key="tipoKPI.id">
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {{ tipoKPI.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold"
                    >
                      <ChartBarIcon class="w-5 h-5" />
                    </div>
                    <div class="ml-4">
                      <div
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ tipoKPI.nombre }}
                      </div>
                      <div
                        class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs"
                      >
                        {{ truncateText(tipoKPI.descripcion, 50) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ tipoKPI.unidad || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ tipoKPI.formato || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="
                      tipoKPI.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    "
                  >
                    {{ tipoKPI.activo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openEditModal(tipoKPI)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(tipoKPI)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay datos -->
        <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
          <ChartBarIcon class="mx-auto h-12 w-12 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No hay tipos de KPI
          </h3>
          <p>
            No se encontraron tipos de KPI que coincidan con los filtros
            aplicados.
          </p>
        </div>

        <!-- Paginación -->
        <div
          v-if="filteredTiposKPI.length > 0"
          class="flex justify-between items-center mt-6"
        >
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span class="font-medium">{{ paginationStart }}</span> a
            <span class="font-medium">{{ paginationEnd }}</span> de
            <span class="font-medium">{{ filteredTiposKPI.length }}</span>
            resultados
          </div>
          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de tipo de KPI -->
      <TipoKPIModal
        :show="showModal"
        :tipo-kpi="currentTipoKPI"
        :is-editing="isEditing"
        :connection-error="connectionError"
        @close="showModal = false"
        @saved="onTipoKPISaved"
        @connection-error="handleConnectionError"
      />

      <DeleteConfirmationModal
        :show="showDeleteModal"
        :item-id="tipoKPIToDelete?.id"
        :item-name="tipoKPIToDelete?.nombre"
        :is-loading="isDeleting"
        @close="showDeleteModal = false"
        @confirm="deleteTipoKPI"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";
import { useToast } from '../composables/useToast';
import { tipoKPIService } from "~/services/tipoKPIService.ts";
import TipoKPIModal from "~/components/TipoKPIModal.vue";
import DeleteConfirmationModal from "~/components/DeleteConfirmationModal.vue";

// Toast para notificaciones
const toast = useToast();

// Configuración para acceder a variables de entorno
const config = useRuntimeConfig();

// Estado
const tiposKPI = ref([]);
const loading = ref(false);
const error = ref(null);
const connectionError = ref(false);
const reconnecting = ref(false);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectInterval = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const filters = ref({
  search: "",
  status: "all",
});

// Modal de creación/edición
const showModal = ref(false);
const isEditing = ref(false);
const currentTipoKPI = ref(null);

// Modal de confirmación de eliminación
const showDeleteModal = ref(false);
const tipoKPIToDelete = ref(null);

// Estado de eliminación
const isDeleting = ref(false);

// Obtener tipos de KPI
const fetchTiposKPI = async () => {
  try {
    loading.value = true;
    error.value = null;
    connectionError.value = false;

    console.log("Obteniendo tipos de KPI...");

    try {
      const response = await tipoKPIService.getAll();

      console.log("Respuesta recibida:", response);

      // Verificamos si la respuesta es un array o tiene una propiedad data que es un array
      if (Array.isArray(response)) {
        tiposKPI.value = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        tiposKPI.value = response.data;
      } else {
        tiposKPI.value = [];
        console.warn(
          "La respuesta no contiene un array de tipos de KPI:",
          response
        );
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log("Tipos de KPI cargados:", tiposKPI.value.length + " elementos");
      }
    } catch (apiError) {
      // Manejar específicamente errores de conexión
      if (
        apiError.message &&
        (apiError.message.includes("Failed to fetch") ||
          apiError.message.includes("NetworkError") ||
          apiError.message.includes("Network Error") ||
          apiError.message.includes("ERR_CONNECTION_REFUSED"))
      ) {
        console.warn("Error de conexión detectado:", apiError.message);
        connectionError.value = true;
        toast.error(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
        );
      } else if (apiError.response && apiError.response.status === 401) {
        console.warn("Error de autenticación al obtener tipos de KPI");
      } else {
        error.value =
          apiError.message || "Error al cargar los tipos de KPI";
        toast.error(error.value);
      }

      if (!connectionError.value) {
        throw apiError;
      }
    }
  } catch (err) {
    console.error("Error al obtener tipos de KPI:", err);

    if (!connectionError.value) {
      error.value = err.message || "Error al cargar los tipos de KPI";
      toast.error(error.value);
    }

    tiposKPI.value = [];
  } finally {
    loading.value = false;
  }
};

// Filtrar tipos de KPI
const filteredTiposKPI = computed(() => {
  let filtered = Array.isArray(tiposKPI.value)
    ? [...tiposKPI.value]
    : [];

  // Filtrar por búsqueda
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    filtered = filtered.filter(
      (kpi) =>
        kpi.nombre.toLowerCase().includes(searchTerm) ||
        (kpi.descripcion && kpi.descripcion.toLowerCase().includes(searchTerm)) ||
        (kpi.unidadPersonalizada && kpi.unidadPersonalizada.toLowerCase().includes(searchTerm)) ||
        getTipoMedidaLabel(kpi.tipoMedida || TipoMedidaKPI.NumeroEntero).toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por estado
  if (filters.value.status !== "all") {
    filtered = filtered.filter(
      (kpi) =>
        (filters.value.status === "active" && kpi.activo) ||
        (filters.value.status === "inactive" && !kpi.activo)
    );
  }

  return filtered;
});

// Paginación
const totalPages = computed(() =>
  Math.ceil(filteredTiposKPI.value.length / itemsPerPage.value)
);

const paginatedTiposKPI = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  const result = filteredTiposKPI.value.slice(start, end);
  return result;
});

const paginationStart = computed(
  () => (currentPage.value - 1) * itemsPerPage.value + 1
);

const paginationEnd = computed(() =>
  Math.min(
    currentPage.value * itemsPerPage.value,
    filteredTiposKPI.value.length
  )
);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Resetear página cuando cambian los filtros
watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// Métodos de utilidad
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};


// Métodos para modales
const openCreateModal = () => {
  isEditing.value = false;
  currentTipoKPI.value = {
    nombre: "",
    descripcion: "",
    unidad: "",
    formato: "",
    activo: true,
  };
  showModal.value = true;
};

const openEditModal = (tipoKPI) => {
  isEditing.value = true;
  currentTipoKPI.value = { ...tipoKPI };
  showModal.value = true;
};

const confirmDelete = (tipoKPI) => {
  tipoKPIToDelete.value = tipoKPI;
  showDeleteModal.value = true;
};

// Manejar el guardado de un tipo de KPI
const onTipoKPISaved = async (savedTipoKPI) => {
  try {
    console.log("Tipo de KPI guardado desde modal:", savedTipoKPI);
    console.log("Modo edición:", isEditing.value);

    // Cerrar el modal primero
    showModal.value = false;

    if (savedTipoKPI && savedTipoKPI.id) {
      if (isEditing.value) {
        console.log(`Procesando actualización de tipo de KPI ID ${savedTipoKPI.id}`);
        const index = tiposKPI.value.findIndex(
          (item) => item.id === savedTipoKPI.id
        );
        if (index >= 0) {
          // Actualizar el elemento existente con todos los nuevos datos
          tiposKPI.value[index] = { ...savedTipoKPI };
          console.log(
            `Actualizado localmente el tipo de KPI con ID ${savedTipoKPI.id} en el índice ${index}:`,
            tiposKPI.value[index]
          );
          
          // Forzar reactividad de Vue
          tiposKPI.value = [...tiposKPI.value];
        } else {
          // Si no se encuentra, añadirlo al principio
          tiposKPI.value.unshift({ ...savedTipoKPI });
          console.log(
            `Tipo de KPI con ID ${savedTipoKPI.id} no encontrado en la lista, añadido al principio`
          );
        }
      } else {
        // Para nuevos elementos, añadir al principio
        tiposKPI.value.unshift({ ...savedTipoKPI });
        console.log(
          `Nuevo tipo de KPI con ID ${savedTipoKPI.id} añadido al principio de la lista`
        );
      }
    } else {
      console.warn("savedTipoKPI no tiene ID válido:", savedTipoKPI);
      // Si no tenemos el objeto actualizado, refrescar toda la lista
      await refreshTiposKPIList();
      return;
    }

    // Solo mostrar mensaje de éxito, no refrescar toda la lista
    toast.success(isEditing.value ? 'Tipo de KPI actualizado correctamente' : 'Tipo de KPI creado correctamente');
  } catch (error) {
    console.error("Error al procesar el tipo de KPI guardado:", error);
    toast.error("Error al actualizar la lista de tipos de KPI");
    // En caso de error, refrescar la lista para mantener consistencia
    await refreshTiposKPIList();
  }
};

// Manejo de errores de conexión desde el modal
const handleConnectionError = (hasError) => {
  console.log(`Error de conexión desde modal: ${hasError}`);
  connectionError.value = hasError;

  if (!hasError) {
    refreshTiposKPIList();
  }
};

// Eliminar un tipo de KPI
const deleteTipoKPI = async (id) => {
  try {
    console.log(`Eliminando tipo de KPI con ID ${id}...`);
    isDeleting.value = true;
    connectionError.value = false;

    try {
      const success = await tipoKPIService.delete(id);
      console.log(`Resultado de eliminar tipo de KPI ${id}:`, success);

      showDeleteModal.value = false;

      if (success) {
        toast.success("Tipo de KPI eliminado correctamente");

        const refreshSuccess = await refreshTiposKPIList();

        if (!refreshSuccess) {
          console.warn(
            "La eliminación fue exitosa pero no se pudo refrescar la lista"
          );
          const index = tiposKPI.value.findIndex((kpi) => kpi.id === id);
          if (index !== -1) {
            const newArray = [...tiposKPI.value];
            newArray.splice(index, 1);
            tiposKPI.value = newArray;
            console.log("Elemento eliminado localmente del array");
          }
        }
      } else {
        toast.error("No se pudo eliminar el tipo de KPI");
      }
    } catch (apiError) {
      if (
        apiError.message &&
        (apiError.message.includes("Failed to fetch") ||
          apiError.message.includes("NetworkError") ||
          apiError.message.includes("Network Error") ||
          apiError.message.includes("ERR_CONNECTION_REFUSED"))
      ) {
        console.warn(
          "Error de conexión detectado al eliminar:",
          apiError.message
        );
        connectionError.value = true;
        toast.error(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
        );
      } else if (apiError.response && apiError.response.status === 401) {
        console.warn("Error de autenticación al eliminar tipo de KPI");
      } else {
        throw apiError;
      }

      showDeleteModal.value = false;
    }
  } catch (error) {
    console.error(`Error al eliminar tipo de KPI ${id}:`, error);
    toast.error("Error al eliminar: " + (error.message || "Error desconocido"));

    showDeleteModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};

// Función para refrescar la lista de tipos de KPI
const refreshTiposKPIList = async () => {
  try {
    loading.value = true;
    connectionError.value = false;
    console.log(
      "Refrescando lista de tipos de KPI después de una operación"
    );

    await fetchTiposKPI();
    return true;
  } catch (error) {
    console.error("Error al refrescar lista después de operación:", error);
    if (!error.message?.includes("401")) {
      toast.error(
        "Error al actualizar la lista: " +
          (error.message || "Error desconocido")
      );
    }
    return false;
  } finally {
    loading.value = false;
  }
};

// Función para intentar reconectar automáticamente
const retryConnection = async () => {
  if (reconnecting.value) return;

  reconnecting.value = true;
  reconnectAttempts.value = 0;

  if (reconnectInterval.value) {
    clearInterval(reconnectInterval.value);
  }

  reconnectInterval.value = setInterval(async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      stopReconnection();
      toast.error(
        "No se pudo establecer conexión después de múltiples intentos. Por favor, verifica el estado del servidor."
      );
      return;
    }

    reconnectAttempts.value++;
    console.log(
      `Intento de reconexión ${reconnectAttempts.value}/${maxReconnectAttempts}...`
    );

    try {
      await fetchTiposKPI();

      if (!connectionError.value) {
        stopReconnection();
        toast.success("Conexión restablecida correctamente");
      }
    } catch (error) {
      console.warn(
        `Intento de reconexión ${reconnectAttempts.value} fallido:`,
        error
      );
    }
  }, 5000);
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
  fetchTiposKPI();
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  stopReconnection();
});
</script>