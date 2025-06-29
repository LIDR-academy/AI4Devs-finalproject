<template>
  <div class="container px-4 py-8 mx-auto">
    <div class="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Puestos
        </h1>
        <button
          @click="openCreateModal"
          class="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon class="mr-2 w-5 h-5" />
          Nuevo Puesto
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
              placeholder="Buscar puestos..."
              class="py-2 pr-4 pl-10 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="filters.status"
            class="px-4 py-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 md:w-48 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
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
                    (https://localhost:44378/api)
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
        <div v-if="isLoading" class="flex justify-center items-center p-4">
          <div
            class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary-500"
          ></div>
        </div>

        <!-- Mensaje de no hay datos -->
        <div
          v-else-if="!isLoading && filteredPuestos.length === 0"
          class="p-8 text-center text-gray-500 dark:text-gray-400"
        >
          <p>No se encontraron puestos.</p>
        </div>

        <!-- Tabla de puestos -->
        <div v-else class="overflow-x-auto">
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
                  Fecha Creación
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
            >
              <tr
                v-for="puesto in filteredPuestos"
                :key="puesto.puestoId"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td
                  class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ puesto.puestoId }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ puesto.puestoNombre }}
                </td>
                <td
                  class="px-6 py-4 max-w-xs text-sm text-gray-500 truncate dark:text-gray-300"
                >
                  {{ puesto.puestoDescripcion }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="
                      puesto.puestoActivo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    "
                  >
                    {{ puesto.puestoActivo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-300"
                >
                  {{ formatDate(puesto.fechaCreacion) }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap"
                >
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="openEditModal(puesto)"
                      class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <PencilIcon class="w-5 h-5" />
                    </button>
                    <button
                      @click="confirmDelete(puesto)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje si no hay puestos -->
        <div
          v-if="filteredPuestos.length === 0 && !isLoading && !connectionError"
          class="py-12 text-center text-gray-500 dark:text-gray-400"
        >
          <FolderIcon class="mx-auto w-12 h-12 text-gray-400" />
          <p class="mt-2 text-lg font-medium">No hay puestos disponibles</p>
          <p class="mt-1">Crea un nuevo puesto para comenzar</p>
        </div>

        <!-- Mensaje de error de conexión -->
        <div v-if="connectionError" class="py-12 text-center text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p class="mt-2 text-lg font-medium">Error de conexión</p>
          <p class="mt-1">No se pudo conectar con el servidor</p>
          <button
            @click="retryConnection"
            class="px-4 py-2 mt-4 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
          >
            Reintentar conexión
          </button>
        </div>

        <!-- Indicador de carga -->
        <div v-if="isLoading" class="py-12 text-center">
          <div
            class="inline-block w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin dark:border-white"
          ></div>
          <p class="mt-2 text-gray-500 dark:text-gray-400">
            Cargando puestos...
          </p>
        </div>
      </div>

      <!-- Usar componentes modales externos -->
      <PuestoModal 
        v-model="showModal" 
        :puesto="formData" 
        :is-editing="isEditing"
        @submit="submitForm"
      />
      
      <DeleteConfirmationModal 
        v-model="showDeleteConfirm" 
        :item-name="puestoToDelete?.puestoNombre || ''"
        :is-deleting="isDeleting"
        @confirm="deletePuestoConfirmed"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { usePuestosStore } from "~/stores/puestos";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from "@heroicons/vue/24/outline";
import { useToast } from "~/composables/useToast";
// Importar componentes modales
import PuestoModal from "~/components/PuestoModal.vue";
import DeleteConfirmationModal from "~/components/modals/DeleteConfirmationModal.vue";

// Instancia del store
const puestosStore = usePuestosStore();

// Composable para notificaciones toast
const toast = useToast();

// Estado reactivo para filtros (usando un objeto reactivo para mejor manejo)
const filters = ref({
  search: "",
  status: "",
});

// Estado para modales y formularios
const showModal = ref(false);
const isEditing = ref(false);
const formData = ref({
  puestoNombre: "",
  puestoDescripcion: "",
  puestoActivo: true,
});
const formErrors = ref({});
const isSubmitting = ref(false);

// Estado para eliminación
const showDeleteConfirm = ref(false);
const puestoToDelete = ref(null);
const isDeleting = ref(false);

// Estado para manejo de errores de conexión
const connectionError = ref(false);
const reconnecting = ref(false);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectInterval = ref(null);

// Acceder al estado del store
const puestos = computed(() => puestosStore.puestos);
const isLoading = computed(() => puestosStore.isLoading);
const error = computed(() => puestosStore.error);

// Puestos filtrados usando el objeto filters
const filteredPuestos = computed(() => {
  return puestos.value.filter((puesto) => {
    // Filtro de búsqueda
    const matchesSearch =
      !filters.value.search ||
      puesto.puestoNombre
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      puesto.puestoDescripcion
        .toLowerCase()
        .includes(filters.value.search.toLowerCase());

    // Filtro de estado
    const matchesStatus =
      !filters.value.status ||
      (filters.value.status === "active" && puesto.puestoActivo) ||
      (filters.value.status === "inactive" && !puesto.puestoActivo);

    return matchesSearch && matchesStatus;
  });
});

// Función para cargar los puestos con manejo de errores de conexión
const fetchPuestos = async (forceRefresh = false) => {
  try {
    await puestosStore.fetchPuestos(forceRefresh);
    connectionError.value = false;
  } catch (err) {
    console.error("Error al cargar puestos:", err);

    // Manejar específicamente errores de conexión
    if (
      err.name === "AbortError" ||
      (err.message &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError") ||
          err.message.includes("Network Error") ||
          err.message.includes("ERR_CONNECTION_REFUSED")))
    ) {
      connectionError.value = true;
      toast.error(
        "No se pudo conectar con el servidor. Por favor, verifica que el backend esté en ejecución."
      );
    } else {
      // Para otros tipos de errores, mostrar mensaje genérico
      toast.error(
        `Error al cargar puestos: ${err.message || "Error desconocido"}`
      );
    }
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
      await fetchPuestos(true);

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
      // El error ya será manejado por fetchPuestos
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
  fetchPuestos();
});

// Limpiar al desmontar
onBeforeUnmount(() => {
  stopReconnection(); // Asegurarse de limpiar el intervalo al desmontar
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return dateString;
  }
};

// Abrir modal para crear nuevo puesto
const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    puestoNombre: "",
    puestoDescripcion: "",
    puestoActivo: true,
  };
  formErrors.value = {};
  showModal.value = true;
};

// Abrir modal para editar puesto
const openEditModal = (puesto) => {
  isEditing.value = true;
  formData.value = {
    puestoId: puesto.puestoId,
    puestoNombre: puesto.puestoNombre,
    puestoDescripcion: puesto.puestoDescripcion,
    puestoActivo: puesto.puestoActivo,
  };
  formErrors.value = {};
  showModal.value = true;
};

// Cerrar modal
const closeModal = () => {
  showModal.value = false;
};

// Validar formulario
const validateForm = () => {
  const errors = {};

  // Validar nombre
  if (!formData.value.puestoNombre) {
    errors.puestoNombre = "El nombre es obligatorio";
  } else if (formData.value.puestoNombre.length > 50) {
    errors.puestoNombre = "El nombre no puede exceder los 50 caracteres";
  }

  // Validar descripción
  if (!formData.value.puestoDescripcion) {
    errors.puestoDescripcion = "La descripción es obligatoria";
  } else if (formData.value.puestoDescripcion.length > 500) {
    errors.puestoDescripcion =
      "La descripción no puede exceder los 500 caracteres";
  }

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Enviar formulario (recibe datos del componente modal)
const submitForm = async (data) => {
  isSubmitting.value = true;

  try {
    console.log(`Procesando formulario en modo ${isEditing.value ? 'edición' : 'creación'}:`, data);
    
    if (isEditing.value) {
      // Actualizar puesto existente
      const resultado = await puestosStore.updatePuesto(
        data.puestoId,
        data
      );
      if (resultado) {
        toast.success(
          `El puesto "${data.puestoNombre}" ha sido actualizado correctamente`
        );
        // Refrescar la lista para asegurar sincronización
        await refreshPuestosList();
      } else {
        throw new Error("No se pudo actualizar el puesto");
      }
    } else {
      // Crear nuevo puesto
      const resultado = await puestosStore.createPuesto(data);
      if (resultado) {
        toast.success(
          `El puesto "${data.puestoNombre}" ha sido creado correctamente`
        );
        // Refrescar la lista para asegurar sincronización
        await refreshPuestosList();
      } else {
        throw new Error("No se pudo crear el puesto");
      }
    }

    // No es necesario cerrar el modal aquí, ya que el componente lo hace automáticamente
  } catch (err) {
    console.error("Error al guardar puesto:", err);
    toast.error(
      err.message ||
        "Ha ocurrido un error al guardar el puesto. Por favor, inténtelo de nuevo."
    );
  } finally {
    isSubmitting.value = false;
  }
};

// Confirmar eliminación
const confirmDelete = (puesto) => {
  puestoToDelete.value = puesto;
  showDeleteConfirm.value = true;
};

// Eliminar puesto confirmado
const deletePuestoConfirmed = async () => {
  if (!puestoToDelete.value) return;

  isDeleting.value = true;
  const nombrePuesto = puestoToDelete.value.puestoNombre;
  const puestoId = puestoToDelete.value.puestoId;

  try {
    console.log(`Iniciando eliminación del puesto ID ${puestoId}: ${nombrePuesto}`);
    
    const resultado = await puestosStore.deletePuesto(puestoId);
    if (resultado) {
      toast.success(
        `El puesto "${nombrePuesto}" ha sido eliminado correctamente`
      );
      showDeleteConfirm.value = false;
      
      // Refrescar la lista para asegurar sincronización
      await refreshPuestosList();
    } else {
      throw new Error("No se pudo eliminar el puesto");
    }
  } catch (err) {
    console.error(`Error al eliminar puesto ID ${puestoId}:`, err);
    toast.error(
      err.message ||
        `Ha ocurrido un error al eliminar el puesto "${nombrePuesto}". Por favor, inténtelo de nuevo.`
    );
  } finally {
    isDeleting.value = false;
  }
};

// Función para refrescar la lista de puestos
const refreshPuestosList = async () => {
  console.log('Refrescando lista de puestos...');
  try {
    await puestosStore.fetchPuestos(true); // forzar recarga desde API
    applyFilters(); // re-aplicar filtros después de recargar
    console.log('Lista de puestos actualizada correctamente');
  } catch (error) {
    console.error('Error al refrescar lista de puestos:', error);
    toast.error('No se pudo actualizar la lista de puestos');
  }
};

// Aplicar filtros a la lista de puestos
const applyFilters = () => {
  console.log('Aplicando filtros:', filters.value);
  // La lógica de filtrado ya está implementada en el computed filteredPuestos
};

// Vigilar cambios en los filtros para actualizar la URL y aplicar filtros
watch(
  () => filters.value,
  () => {
    // Aquí podrías actualizar los query params de la URL si lo deseas
    console.log("Filtros actualizados:", filters.value);
    applyFilters();
  },
  { deep: true }
);
</script>
