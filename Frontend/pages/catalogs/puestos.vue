<!--
  puestos.vue
  Página principal para la gestión de puestos
  Incluye tabla con filtros, paginación y opciones CRUD
-->
<template>
  <div class="p-4 md:p-6">
    <!-- Encabezado -->
    <div
      class="flex flex-col justify-between items-start mb-6 md:flex-row md:items-center"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Puestos
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Administra los puestos de la organización
        </p>
      </div>

      <!-- Botón para crear nuevo puesto -->
      <button
        @click="openCreateModal"
        class="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg transition-colors md:mt-0 hover:bg-blue-700"
      >
        <span class="mr-2">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </span>
        Nuevo Puesto
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="p-4 mb-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 md:flex-row">
        <!-- Búsqueda por texto -->
        <div class="flex-grow">
          <label
            for="search"
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >Buscar</label
          >
          <div class="relative">
            <div
              class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              class="py-2 pr-4 pl-10 w-full text-gray-700 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Buscar por nombre o descripción"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Filtro por estado -->
        <div class="md:w-48">
          <label
            for="status"
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >Estado</label
          >
          <select
            id="status"
            v-model="filters.activo"
            class="px-3 py-2 w-full text-gray-700 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            @change="loadPuestos"
          >
            <option :value="null">Todos</option>
            <option :value="true">Activos</option>
            <option :value="false">Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de puestos -->
    <div class="overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table
          class="w-full text-sm text-left text-gray-700 dark:text-gray-300"
        >
          <thead
            class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
          >
            <tr>
              <th scope="col" class="px-6 py-3">ID</th>
              <th scope="col" class="px-6 py-3">Nombre</th>
              <th scope="col" class="px-6 py-3">Descripción</th>
              <th scope="col" class="px-6 py-3">Estado</th>
              <th scope="col" class="px-6 py-3">Fecha Creación</th>
              <th scope="col" class="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Estado de carga -->
            <tr
              v-if="puestosStore.isLoading"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td colspan="6" class="px-6 py-4 text-center">
                <div class="flex justify-center items-center">
                  <div
                    class="w-6 h-6 rounded-full border-2 animate-spin border-t-blue-500"
                  ></div>
                  <span class="ml-2">Cargando...</span>
                </div>
              </td>
            </tr>

            <!-- Mensaje de no hay datos -->
            <tr
              v-else-if="!puestosStore.puestos.length"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td colspan="6" class="px-6 py-4 text-center">
                No se encontraron puestos
              </td>
            </tr>

            <!-- Listado de puestos -->
            <tr
              v-for="puesto in puestosStore.puestos"
              :key="puesto.puestoId"
              class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4">{{ puesto.puestoId }}</td>
              <td class="px-6 py-4 font-medium">{{ puesto.puestoNombre }}</td>
              <td class="px-6 py-4">
                <span v-if="puesto.puestoDescripcion" class="line-clamp-2">{{
                  puesto.puestoDescripcion
                }}</span>
                <span v-else class="italic text-gray-400">Sin descripción</span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300':
                      puesto.puestoActivo,
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300':
                      !puesto.puestoActivo,
                  }"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ puesto.puestoActivo ? "Activo" : "Inactivo" }}
                </span>
              </td>
              <td class="px-6 py-4">
                {{ formatDate(puesto.fechaCreacion) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <!-- Botón editar -->
                  <button
                    @click="openEditModal(puesto.puestoId)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Editar"
                  >
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

                  <!-- Botón eliminar -->
                  <button
                    @click="confirmDelete(puesto)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Eliminar"
                  >
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div
        v-if="puestosStore.paginationInfo.totalPages > 1"
        class="flex justify-between items-center p-4 border-t dark:border-gray-700"
      >
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Mostrando
          {{
            (puestosStore.paginationInfo.pageNumber - 1) *
              puestosStore.paginationInfo.pageSize +
            1
          }}
          a
          {{
            Math.min(
              puestosStore.paginationInfo.pageNumber *
                puestosStore.paginationInfo.pageSize,
              puestosStore.paginationInfo.totalCount
            )
          }}
          de {{ puestosStore.paginationInfo.totalCount }} registros
        </div>

        <div class="flex space-x-1">
          <!-- Botón página anterior -->
          <button
            @click="goToPage(puestosStore.paginationInfo.pageNumber - 1)"
            :disabled="!puestosStore.paginationInfo.hasPreviousPage"
            class="px-3 py-1 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <!-- Números de página -->
          <template v-for="page in pageNumbers" :key="page">
            <button
              @click="goToPage(page)"
              :class="{
                'bg-blue-600 text-white':
                  page === puestosStore.paginationInfo.pageNumber,
                'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300':
                  page !== puestosStore.paginationInfo.pageNumber,
              }"
              class="px-3 py-1 rounded-md"
            >
              {{ page }}
            </button>
          </template>

          <!-- Botón página siguiente -->
          <button
            @click="goToPage(puestosStore.paginationInfo.pageNumber + 1)"
            :disabled="!puestosStore.paginationInfo.hasNextPage"
            class="px-3 py-1 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar puesto -->
    <PuestoModal
      v-model="showPuestoModal"
      :puesto-id="selectedPuestoId"
      @saved="onPuestoSaved"
    />

    <!-- Modal de confirmación para eliminar -->
    <DeleteConfirmationModal
      v-model="showDeleteModal"
      :item-name="puestoToDelete?.puestoNombre || ''"
      :is-deleting="isDeleting"
      @confirm="deletePuesto"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { usePuestosStore } from "../../stores/puestos";
import PuestoModal from "../../components/PuestoModal.vue";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal.vue";
import { useToast } from '../composables/useToast';

// Composables
const puestosStore = usePuestosStore();
const toast = useToast();

// Estado
const showPuestoModal = ref(false);
const selectedPuestoId = ref(null);
const showDeleteModal = ref(false);
const puestoToDelete = ref(null);
const isDeleting = ref(false);

// Filtros y paginación
const filters = ref({
  search: "",
  activo: null,
  page: 1,
  pageSize: 10,
});

// Calcular números de página para la paginación
const pageNumbers = computed(() => {
  const totalPages = puestosStore.paginationInfo.totalPages;
  const currentPage = puestosStore.paginationInfo.pageNumber;

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
});

// Cargar datos al montar el componente
onMounted(() => {
  loadPuestos();
});

// Función para cargar puestos con filtros
const loadPuestos = async (forceRefresh = false) => {
  try {
    console.log("Cargando puestos con forceRefresh:", forceRefresh);
    await puestosStore.fetchPuestos(
      {
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        search: filters.value.search,
        activo: filters.value.activo,
        includeInactive: filters.value.activo === null,
      },
      forceRefresh
    );
  } catch (error) {
    console.error("Error al cargar puestos:", error);
    // El toast de error ya se muestra en el store
  }
};

// Debounce para la búsqueda
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1; // Resetear a la primera página al buscar
    loadPuestos();
  }, 300);
};

// Ir a una página específica
const goToPage = (page) => {
  if (page < 1 || page > puestosStore.paginationInfo.totalPages) return;

  filters.value.page = page;
  loadPuestos();
};

// Abrir modal para crear nuevo puesto
const openCreateModal = () => {
  selectedPuestoId.value = null;
  showPuestoModal.value = true;
};

// Abrir modal para editar puesto
const openEditModal = (id) => {
  selectedPuestoId.value = id;
  showPuestoModal.value = true;
};

// Confirmar eliminación de puesto
const confirmDelete = (puesto) => {
  puestoToDelete.value = puesto;
  showDeleteModal.value = true;
};

// Eliminar puesto
const deletePuesto = async () => {
  if (!puestoToDelete.value || isDeleting.value) return;

  isDeleting.value = true;

  try {
    await puestosStore.deletePuesto(puestoToDelete.value.puestoId);
    showDeleteModal.value = false;
    puestoToDelete.value = null;

    // Recargar datos para actualizar la lista
    await loadPuestos();
  } catch (error) {
    console.error("Error al eliminar puesto:", error);
    // El toast de error ya se muestra en el store
  } finally {
    isDeleting.value = false;
  }
};

// Manejar evento de guardado exitoso
const onPuestoSaved = async (puesto) => {
  console.log("Evento onPuestoSaved recibido con puesto:", puesto);

  // Esperar un momento para asegurar que el backend haya procesado los cambios
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    // Forzar recarga de datos desde el servidor con forceRefresh=true
    console.log("Forzando recarga de datos desde el servidor...");
    await loadPuestos(true);
    console.log("Datos recargados correctamente");
    toast.success("Lista de puestos actualizada correctamente");
  } catch (error) {
    console.error("Error al recargar la lista de puestos:", error);
    toast.error("Error al actualizar la lista de puestos");
  }
};

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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
