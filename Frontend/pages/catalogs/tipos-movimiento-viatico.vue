<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <!-- Encabezado con título y botón de nuevo -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Tipos de Movimiento de Viático
        </h1>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nuevo Tipo de Movimiento
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
              placeholder="Buscar tipos de movimiento..."
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
                    (http://localhost:5217/api)
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

        <!-- Mensaje cuando no hay datos -->
        <div
          v-else-if="tiposMovimientoViatico.length === 0"
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          <p>No se encontraron tipos de movimiento de viático.</p>
        </div>

        <!-- Tabla de tipos de movimiento de viático -->
        <div v-else-if="tiposMovimientoViatico.length > 0" class="overflow-x-auto">
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
                  Descripción
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Afectación
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Requiere Comprobante
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
              <tr v-for="tipo in paginatedTiposMovimientoViatico" :key="tipo.id">
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
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
                  <div class="max-w-xs overflow-hidden text-ellipsis" style="max-width: 200px;">
                    <span :title="tipo.descripcion || '-'" class="cursor-help">
                      {{ tipo.descripcion || "-" }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  <span
                    :class="
                      tipo.afectacion === 1
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    "
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ tipo.afectacion === 1 ? "Positivo (+1)" : "Negativo (-1)" }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  <span
                    :class="
                      tipo.requiereComprobante
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    "
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ tipo.requiereComprobante ? "Sí" : "No" }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  <span
                    :class="
                      tipo.activo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    "
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ tipo.activo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openEditModal(tipo)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
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

        <!-- Mensaje cuando no hay resultados con los filtros aplicados -->
        <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
          <p>
            No se encontraron tipos de movimiento de viático con los filtros
            aplicados.
          </p>
        </div>

        <!-- Paginación -->
        <div
          v-if="filteredTiposMovimientoViatico.length > 0"
          class="flex justify-between items-center mt-6"
        >
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando <span class="font-medium">{{ paginationStart }}</span> a
            <span class="font-medium">{{ paginationEnd }}</span> de
            <span class="font-medium">{{ filteredTiposMovimientoViatico.length }}</span>
            resultados
          </div>
          <div class="flex space-x-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de tipo de movimiento de viático -->
      <TipoMovimientoViaticoModal
        :show="showModal"
        :tipo-movimiento-viatico="currentTipoMovimientoViatico"
        :is-editing="isEditing"
        :connection-error="connectionError"
        @close="showModal = false"
        @submit="handleSubmit"
      />

      <!-- Modal de confirmación de eliminación -->
      <ConfirmDeleteModal
        :show="showDeleteModal"
        :item-id="tipoMovimientoViaticoToDelete?.id || ''"
        :item-name="tipoMovimientoViaticoToDelete?.nombre || ''"
        :is-loading="isDeleting"
        @close="showDeleteModal = false"
        @confirm="deleteTipoMovimientoViatico"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { useToast } from '../composables/useToast';
import TipoMovimientoViaticoModal from "~/components/TipoMovimientoViaticoModal.vue";
import ConfirmDeleteModal from "~/components/ConfirmDeleteModal.vue";
import { tipoMovimientoViaticoService } from "~/services/tipoMovimientoViaticoService";

// Toast para notificaciones
const toast = useToast();

// Estado de los datos
const tiposMovimientoViatico = ref([]);
const loading = ref(true);
const connectionError = ref(false);

// Estado para la paginación
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Estado para los filtros
const filters = ref({
  search: "",
  status: "all",
});

// Estado para el modal
const showModal = ref(false);
const isEditing = ref(false);
const currentTipoMovimientoViatico = ref(null);

// Modal de confirmación de eliminación
const showDeleteModal = ref(false);
const tipoMovimientoViaticoToDelete = ref(null);

// Estado de eliminación
const isDeleting = ref(false);

// Estado para la reconexión
const reconnecting = ref(false);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectInterval = ref(null);

// Filtrar tipos de movimiento de viático según los filtros aplicados
const filteredTiposMovimientoViatico = computed(() => {
  return tiposMovimientoViatico.value.filter((tipo) => {
    // Filtrar por búsqueda (nombre o descripción)
    const searchMatch =
      !filters.value.search ||
      tipo.nombre
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      (tipo.descripcion &&
        tipo.descripcion
          .toLowerCase()
          .includes(filters.value.search.toLowerCase()));

    // Filtrar por estado
    const statusMatch =
      filters.value.status === "all" ||
      (filters.value.status === "active" && tipo.activo) ||
      (filters.value.status === "inactive" && !tipo.activo);

    return searchMatch && statusMatch;
  });
});

// Calcular el total de páginas
const totalPages = computed(() => {
  return Math.ceil(
    filteredTiposMovimientoViatico.value.length / itemsPerPage.value
  );
});

// Obtener los elementos para la página actual
const paginatedTiposMovimientoViatico = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTiposMovimientoViatico.value.slice(start, end);
});

// Calcular el inicio y fin de la paginación
const paginationStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const paginationEnd = computed(() => {
  return Math.min(
    currentPage.value * itemsPerPage.value,
    filteredTiposMovimientoViatico.value.length
  );
});

// Navegar a la página anterior
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Navegar a la página siguiente
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Abrir modal para crear un nuevo tipo de movimiento de viático
const openCreateModal = () => {
  isEditing.value = false;
  currentTipoMovimientoViatico.value = null;
  showModal.value = true;
};

// Abrir modal para editar un tipo de movimiento de viático existente
const openEditModal = (tipo) => {
  isEditing.value = true;
  currentTipoMovimientoViatico.value = { ...tipo };
  showModal.value = true;
};

// Abrir modal de confirmación para eliminar un tipo de movimiento de viático
const confirmDelete = (tipo) => {
  tipoMovimientoViaticoToDelete.value = tipo;
  showDeleteModal.value = true;
};

// Manejar el envío del formulario (crear o actualizar)
const handleSubmit = async (tipoMovimientoViatico) => {
  try {
    if (isEditing.value) {
      // Actualizar tipo de movimiento de viático existente
      await tipoMovimientoViaticoService.update(
        tipoMovimientoViatico.id,
        tipoMovimientoViatico
      );
      toast.success("Tipo de movimiento de viático actualizado correctamente");
    } else {
      // Crear nuevo tipo de movimiento de viático
      await tipoMovimientoViaticoService.create(tipoMovimientoViatico);
      toast.success("Tipo de movimiento de viático creado correctamente");
    }

    // Cerrar el modal y actualizar la lista
    showModal.value = false;
    await refreshList();
  } catch (error) {
    console.error(
      "Error al guardar tipo de movimiento de viático:",
      error
    );
    toast.error(
      `Error al ${isEditing.value ? "actualizar" : "crear"} tipo de movimiento de viático: ${error.message || "Error desconocido"}`
    );
  }
};

// Eliminar un tipo de movimiento de viático
const deleteTipoMovimientoViatico = async () => {
  if (!tipoMovimientoViaticoToDelete.value?.id) return;

  try {
    isDeleting.value = true;
    await tipoMovimientoViaticoService.delete(tipoMovimientoViaticoToDelete.value.id);
    toast.success("Tipo de movimiento de viático eliminado correctamente");
    showDeleteModal.value = false;
    await refreshList();
  } catch (error) {
    console.error("Error al eliminar tipo de movimiento de viático:", error);
    toast.error(
      `Error al eliminar tipo de movimiento de viático: ${error.message || "Error desconocido"}`
    );
  } finally {
    isDeleting.value = false;
  }
};

// Obtener todos los tipos de movimiento de viático
const fetchTiposMovimientoViatico = async (forceRefresh = false) => {
  try {
    loading.value = true;
    connectionError.value = false;

    // Establecer un timeout para detectar problemas de conexión
    const timeoutId = setTimeout(() => {
      if (loading.value) {
        console.warn("La solicitud está tardando demasiado, posible problema de conexión");
        connectionError.value = true;
      }
    }, 10000); // 10 segundos

    try {
      const data = await tipoMovimientoViaticoService.getAll(forceRefresh);
      tiposMovimientoViatico.value = data;
      connectionError.value = false;
      return true;
    } catch (error) {
      console.error("Error al obtener datos:", error);
      throw error; // Re-lanzar para ser manejado en el catch externo
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Error al obtener tipos de movimiento de viático:", error);
    connectionError.value = true;
    return false;
  } finally {
    loading.value = false;
  }
};

// Forzar actualización de datos
const forceRefresh = async () => {
  return await fetchTiposMovimientoViatico(true);
};

// Actualizar la lista después de una operación
const refreshList = async () => {
  try {
    loading.value = true;

    // Establecer un timeout para detectar problemas de conexión
    const timeoutId = setTimeout(() => {
      if (loading.value) {
        console.warn("La solicitud está tardando demasiado, posible problema de conexión");
        connectionError.value = true;
      }
    }, 10000); // 10 segundos

    try {
      const freshData = await tipoMovimientoViaticoService.getAll(true);

      // Determinar el formato de la respuesta y extraer los datos
      const dataArray = Array.isArray(freshData)
        ? freshData
        : freshData.data && Array.isArray(freshData.data)
        ? freshData.data
        : [];

      // Actualizar los datos con una técnica segura para Vue 3
      tiposMovimientoViatico.value = JSON.parse(JSON.stringify(dataArray));

      // Resetear a la primera página si es necesario
      if (
        paginatedTiposMovimientoViatico.value.length === 0 &&
        currentPage.value > 1
      ) {
        currentPage.value = 1;
      }

      // Reducir logs excesivos
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          "Lista actualizada después de operación:",
          tiposMovimientoViatico.value.length + " elementos"
        );
      }
      return true; // Indicar éxito
    } catch (error) {
      // Manejar específicamente errores de conexión
      if (error.name === "AbortError") {
        console.warn("La solicitud excedió el tiempo de espera");
        connectionError.value = true;
        toast.error(
          "La conexión con el servidor está tardando demasiado. Por favor, verifica que el backend esté en ejecución."
        );
      } else if (
        error.message &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("Network Error") ||
          error.message.includes("ERR_CONNECTION_REFUSED"))
      ) {
        console.warn("Error de conexión detectado al refrescar lista");
        connectionError.value = true;
        toast.error(
          "No se pudo conectar con el servidor. Por favor, verifica que el backend esté en ejecución."
        );
      } else {
        // Para otros tipos de errores, mostrar mensaje genérico
        console.error("Error al refrescar lista después de operación:", error);
        if (!error.message?.includes("401")) {
          toast.error(
            "Error al actualizar la lista: " +
              (error.message || "Error desconocido")
          );
        }
      }
      return false;
    } finally {
      // Asegurarse de limpiar el timeout en caso de error
      clearTimeout(timeoutId);
    }
  } finally {
    loading.value = false;
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
      // Intentar obtener datos
      await fetchTiposMovimientoViatico();

      // Si llegamos aquí, la conexión fue exitosa
      if (!connectionError.value) {
        stopReconnection();
        toast.success("Conexión restablecida correctamente");
      }
    } catch (error) {
      console.warn(
        `Intento de reconexión ${reconnectAttempts.value} fallido:`,
        error
      );
      // El error ya será manejado por fetchTiposMovimientoViatico
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
  fetchTiposMovimientoViatico();
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  stopReconnection(); // Asegurarse de limpiar el intervalo al desmontar
});
</script>
