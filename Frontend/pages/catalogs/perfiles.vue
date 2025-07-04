<template>
  <div class="container px-4 py-8 mx-auto">
    <div class="p-6 mb-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <!-- Encabezado con título y botón de nuevo -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catálogo de Perfiles
        </h1>
        <button
          @click="openCreateModal"
          class="flex items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary-600 hover:bg-primary-700"
        >
          <svg
            class="mr-2 -ml-1 w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Perfil
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <svg
              class="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="filters.search"
              @input="onSearchInput"
              type="text"
              placeholder="Buscar perfiles..."
              class="py-2 pr-4 pl-10 w-full text-gray-900 bg-white rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="filters.status"
            @change="onFilterChange"
            class="px-4 py-2 w-full text-gray-900 bg-white rounded-lg border border-gray-300 md:w-48 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <div class="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {{ perfiles.length }} resultado(s)
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
                    ({{ config.public.apiUrl }})
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
        <div v-if="perfilesStore.isLoading" class="flex justify-center items-center p-4">
          <div class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary-500"></div>
          <p class="ml-3">Cargando perfiles...</p>
        </div>

        <!-- Error de conexión -->
        <div v-else-if="perfilesStore.error" class="p-8 text-center text-red-500 dark:text-red-400">
          <p>Error al cargar perfiles. Por favor, intente nuevamente.</p>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="perfiles.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No se encontraron perfiles.</p>
        </div>

        <!-- Tabla de perfiles -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">ID</th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Nombre</th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Descripción</th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Estado</th>
                <th class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
              <tr v-for="perfil in perfiles" :key="perfil.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ perfil.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">{{ perfil.nombre }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">{{ perfil.descripcion || '-' }}</td>
                <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white">
                  <span class="inline-flex px-2 text-xs font-semibold leading-5 rounded-full" :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': perfil.activo,
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': !perfil.activo
                  }">{{ perfil.activo ? 'Activo' : 'Inactivo' }}</span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <button @click="openEditModal(perfil)" class="mr-2 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button @click="openDeleteModal(perfil)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar perfil -->
    <PerfilModal
      v-model="showPerfilModal"
      :perfil-id="selectedPerfilId"
      @saved="onPerfilSaved"
    />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmDeleteModal
      :show="showDeleteModal"
      :item-id="selectedPerfilId"
      :item-name="selectedPerfilName"
      :is-loading="isDeletingPerfil"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { usePerfilesStore } from "../../stores/perfiles";
import { useToast } from '../composables/useToast';
import PerfilModal from "../../components/PerfilModal.vue";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal.vue";

// Configuración para acceder a variables de entorno
const config = useRuntimeConfig();

// Configuración de la página - Accesible para cualquier usuario autenticado
definePageMeta({
  title: "Gestión de Perfiles",
  layout: "default",
  // No incluimos middleware específico para permitir acceso a cualquier usuario autenticado
});

// Store y estado
const perfilesStore = usePerfilesStore();
// Asegurarse de que perfiles esté inicializado como un array
if (!perfilesStore.perfiles) {
  perfilesStore.$patch({ perfiles: [] });
}
const toast = useToast();

// Estado
const loading = ref(false);
const isDeletingPerfil = ref(false);
const showPerfilModal = ref(false);
const showDeleteModal = ref(false);
const selectedPerfilId = ref(0); // Inicializado como 0 en lugar de null o cadena vacía
const selectedPerfilName = ref("");
const searchTimeout = ref(null);

// Estado de conexión
const connectionError = ref(false);
const reconnecting = ref(false);
const reconnectAttempts = ref(0);
const maxReconnectAttempts = 3;
const reconnectInterval = ref(null);

// Filtros
const filters = reactive({
  status: "all", // 'all', 'active', 'inactive'
  search: "",
});

// Lista filtrada de perfiles
const perfiles = computed(() => {
  console.log('Calculando perfiles filtrados...');
  console.log('perfilesStore.perfiles:', perfilesStore.perfiles);
  
  // Asegurarse de que estamos trabajando con un array
  const perfilesArray = Array.isArray(perfilesStore.perfiles) ? perfilesStore.perfiles : [];
  console.log('perfilesArray después de verificación:', perfilesArray);
  
  // Si no hay datos, devolver array vacío
  if (perfilesArray.length === 0) {
    console.log('No hay perfiles en el store, devolviendo array vacío');
    return [];
  }

  // Aplicar filtros en el frontend
  const filtrados = perfilesArray.filter((perfil) => {
    // Filtro de estado
    if (filters.status === "active" && !perfil.activo) return false;
    if (filters.status === "inactive" && perfil.activo) return false;

    // Filtro de búsqueda
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase().trim();
      return (
        perfil.nombre.toLowerCase().includes(searchTerm) ||
        (perfil.descripcion &&
          perfil.descripcion.toLowerCase().includes(searchTerm))
      );
    }

    return true;
  });
  
  console.log('Perfiles filtrados:', filtrados);
  return filtrados;
});

// Observar cambios en los filtros
watch(
  () => filters.status,
  () => {
    // No es necesario llamar a la API, solo filtrar los datos locales
  }
);

// Métodos para filtros
function onFilterChange() {
  // No es necesario hacer nada, el computed se actualizará automáticamente
}

function onSearchInput() {
  // Debounce para evitar muchas actualizaciones mientras se escribe
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    // No es necesario hacer nada, el computed se actualizará automáticamente
  }, 300);
}

// Función para cargar los perfiles
async function fetchAllPerfiles() {
  console.log('Iniciando fetchAllPerfiles en el componente');
  loading.value = true;
  connectionError.value = false;

  try {
    console.log('Antes de llamar a perfilesStore.fetchAllPerfiles');
    const resultado = await perfilesStore.fetchAllPerfiles(true);
    console.log('Resultado directo de fetchAllPerfiles:', resultado);
    
    // Asegurarse de que perfiles sea un array
    if (!Array.isArray(perfilesStore.perfiles)) {
      console.warn('perfilesStore.perfiles no es un array, inicializando como array vacío');
      perfilesStore.$patch({ perfiles: resultado || [] });
    }
    
    console.log('Perfiles cargados en el store:', perfilesStore.perfiles);
    console.log('Tipo de perfilesStore.perfiles:', typeof perfilesStore.perfiles);
    console.log('¿Es un array?', Array.isArray(perfilesStore.perfiles));
    if (Array.isArray(perfilesStore.perfiles)) {
      console.log('Longitud del array:', perfilesStore.perfiles.length);
      if (perfilesStore.perfiles.length > 0) {
        console.log('Primer elemento:', perfilesStore.perfiles[0]);
      }
    }
    
    // Forzar actualización del estado si es necesario
    if (resultado && resultado.length > 0 && (!perfilesStore.perfiles || perfilesStore.perfiles.length === 0)) {
      console.log('Forzando actualización del estado con resultado directo');
      perfilesStore.$patch({ perfiles: resultado });
    }
  } catch (error) {
    console.error('Error al cargar perfiles:', error);
    connectionError.value = true;
    toast.error("Error al cargar los perfiles");
  } finally {
    loading.value = false;
    console.log('fetchAllPerfiles finalizado, loading:', loading.value);
    console.log('Estado de conexión:', {
      perfilesEnStore: perfilesStore.perfiles.length,
      perfilesFiltrados: perfiles.value.length,
      loading: loading.value,
      connectionError: connectionError.value
    });
  }
}

// Reintentar conexión
async function retryConnection() {
  if (reconnecting.value) return;

  reconnecting.value = true;
  reconnectAttempts.value = 0;

  reconnectInterval.value = setInterval(async () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      stopReconnection();
      return;
    }

    reconnectAttempts.value++;
    try {
      await fetchAllPerfiles();
      if (!connectionError.value) {
        stopReconnection();
        toast.success("Conexión restablecida");
      }
    } catch (error) {
      console.error("Error al reconectar:", error);
    }
  }, 3000); // Intentar cada 3 segundos
}

// Detener reintentos de conexión
function stopReconnection() {
  if (reconnectInterval.value) {
    clearInterval(reconnectInterval.value);
    reconnectInterval.value = null;
  }
  reconnecting.value = false;
}

// Métodos para modales
function openCreateModal() {
  selectedPerfilId.value = 0; 
  showPerfilModal.value = true;
}

function openEditModal(perfil) {
  selectedPerfilId.value = perfil.id;
  showPerfilModal.value = true;
}

function openDeleteModal(perfil) {
  selectedPerfilId.value = perfil.id;
  selectedPerfilName.value = perfil.nombre;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  selectedPerfilId.value = 0; 
  selectedPerfilName.value = "";
}

async function confirmDelete() {
  try {
    console.log('confirmDelete - Iniciando eliminación de perfil:', selectedPerfilId.value);
    isDeletingPerfil.value = true;
    
    // Eliminar perfil en el store
    await perfilesStore.deletePerfil(selectedPerfilId.value);
    
    // Cerrar modal
    closeDeleteModal();
    
    // Forzar actualización del store con refresco completo
    console.log('confirmDelete - Actualizando listados después de eliminar');
    await perfilesStore.fetchAllPerfiles(true, true);
    
    // Forzar actualización de la UI
    await nextTick();
    
    // Mostrar mensaje de éxito
    toast.success("Perfil eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar perfil:", error);
    toast.error("Error al eliminar el perfil");
  } finally {
    isDeletingPerfil.value = false;
    console.log('confirmDelete - Finalizado');
  }
}

async function onPerfilSaved(perfilData) {
  console.log('onPerfilSaved - Evento recibido', perfilData ? 'con datos' : 'sin datos');
  
  try {
    // Asegurar que la UI se actualice con los datos más recientes del store
    await nextTick();
    
    // Si hay problemas de actualización, podemos forzar una recarga
    if (!perfiles.value || perfiles.value.length === 0) {
      console.log('onPerfilSaved - Forzando recarga de perfiles');
      await perfilesStore.fetchAllPerfiles(true);
    }
    
    console.log('onPerfilSaved - Actualización de UI completada');
  } catch (error) {
    console.error('onPerfilSaved - Error al actualizar la UI:', error);
    toast.error("Error al actualizar el listado de perfiles");
  }
}

// Inicializar
onMounted(async () => {
  console.log('onMounted iniciado');
  // Cargar perfiles solo desde el store
  await perfilesStore.fetchAllPerfiles(true);
  console.log('onMounted - Perfiles cargados desde el store');
});
</script>
