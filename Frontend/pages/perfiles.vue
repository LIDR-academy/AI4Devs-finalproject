<template>
  <div class="container px-4 py-6 mx-auto">
    <!-- Encabezado y botón de agregar -->
    <div class="flex flex-col justify-between mb-6 md:flex-row md:items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Gestión de Perfiles
      </h1>
      <div class="flex mt-4 space-x-2 md:mt-0">
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
        <button
          @click="refreshData"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="grid gap-4 mb-6 md:grid-cols-3">
      <div class="flex items-center">
        <label
          for="estado"
          class="block mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Estado:
        </label>
        <select
          id="estado"
          v-model="filters.includeInactive"
          @change="onFilterChange"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option :value="false">Solo activos</option>
          <option :value="true">Todos</option>
        </select>
      </div>
      <div class="flex items-center">
        <label
          for="pageSize"
          class="block mr-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Mostrar:
        </label>
        <select
          id="pageSize"
          v-model="filters.pageSize"
          @change="onFilterChange"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
        >
          <option :value="5">5 por página</option>
          <option :value="10">10 por página</option>
          <option :value="20">20 por página</option>
          <option :value="50">50 por página</option>
        </select>
      </div>
      <div>
        <label for="search" class="sr-only">Buscar</label>
        <div class="relative">
          <div
            class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
          >
            <svg
              class="w-5 h-5 text-gray-400"
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
          </div>
          <input
            id="search"
            v-model="filters.searchTerm"
            @input="onSearchInput"
            type="text"
            placeholder="Buscar por nombre..."
            class="block pl-10 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de perfiles -->
    <div
      class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
            >
              ID
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
            >
              Nombre
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
            >
              Descripción
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
            >
              Estado
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"
        >
          <tr v-if="isLoading" class="animate-pulse">
            <td
              colspan="5"
              class="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400"
            >
              Cargando perfiles...
            </td>
          </tr>
          <tr
            v-else-if="perfiles.length === 0"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td
              colspan="5"
              class="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400"
            >
              No se encontraron perfiles
            </td>
          </tr>
          <tr
            v-for="perfil in perfiles"
            :key="perfil.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td
              class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ perfil.id }}
            </td>
            <td
              class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap dark:text-white"
            >
              {{ perfil.nombre }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="line-clamp-2">{{
                perfil.descripcion || "Sin descripción"
              }}</span>
            </td>
            <td class="px-6 py-4 text-sm whitespace-nowrap">
              <span
                :class="{
                  'inline-flex rounded-full px-2 text-xs font-semibold leading-5': true,
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                    perfil.activo,
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                    !perfil.activo,
                }"
              >
                {{ perfil.activo ? "Activo" : "Inactivo" }}
              </span>
            </td>
            <td
              class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap"
            >
              <button
                @click="openEditModal(perfil)"
                class="mr-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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
              <button
                @click="openDeleteModal(perfil)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="flex justify-between items-center mt-4">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Mostrando
        <span class="font-medium">{{
          paginationInfo.pageSize * (paginationInfo.pageNumber - 1) + 1
        }}</span>
        a
        <span class="font-medium">
          {{
            Math.min(
              paginationInfo.pageSize * paginationInfo.pageNumber,
              paginationInfo.totalCount
            )
          }}
        </span>
        de
        <span class="font-medium">{{ paginationInfo.totalCount }}</span>
        resultados
      </div>
      <div class="flex space-x-2">
        <button
          @click="prevPage"
          :disabled="!paginationInfo.hasPreviousPage"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Anterior
        </button>
        <button
          @click="nextPage"
          :disabled="!paginationInfo.hasNextPage"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Siguiente
        </button>
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
import { ref, reactive, computed, onMounted } from "vue";
import { usePerfilesStore } from "../stores/perfiles";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import PerfilModal from "../components/PerfilModal.vue";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.vue";

// Configurar middleware para esta página
definePageMeta({
  middleware: ["admin"],
  title: "Gestión de Perfiles",
  layout: "default",
});

// Store y toast
const perfilesStore = usePerfilesStore();
const toast = useToast();

// Estado
const isLoading = ref(false);
const isDeletingPerfil = ref(false);
const showPerfilModal = ref(false);
const showDeleteModal = ref(false);
const selectedPerfilId = ref(null);
const selectedPerfilName = ref("");
const searchTimeout = ref(null);

// Filtros y paginación
const filters = reactive({
  pageNumber: 1,
  pageSize: 10,
  searchTerm: "",
  includeInactive: false,
});

// Computed properties
const perfiles = computed(() => perfilesStore.perfiles);
const paginationInfo = computed(() => perfilesStore.paginationInfo);

// Métodos para la paginación
function nextPage() {
  if (paginationInfo.value.hasNextPage) {
    filters.pageNumber++;
    fetchPerfiles();
  }
}

function prevPage() {
  if (paginationInfo.value.hasPreviousPage) {
    filters.pageNumber--;
    fetchPerfiles();
  }
}

// Métodos para filtros
function onFilterChange() {
  filters.pageNumber = 1; // Resetear a la primera página
  fetchPerfiles();
}

function onSearchInput() {
  // Debounce para evitar muchas peticiones mientras se escribe
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    filters.pageNumber = 1; // Resetear a la primera página
    fetchPerfiles();
  }, 300);
}

// Cargar datos
async function fetchPerfiles() {
  try {
    console.log("Iniciando fetchAllPerfiles en el componente");
    isLoading.value = true;
    console.log("Antes de llamar a perfilesStore.fetchAllPerfiles");

    // Llamar al método del store con forceRefresh = true para forzar la actualización
    const result = await perfilesStore.fetchAllPerfiles(true, true);
    console.log("Resultado directo de fetchAllPerfiles:", result);

    // Verificar el estado del store después de la llamada
    console.log("Perfiles cargados en el store:", perfilesStore.perfiles);
    console.log(
      "Tipo de perfilesStore.perfiles:",
      typeof perfilesStore.perfiles
    );
    console.log("¿Es un array?", Array.isArray(perfilesStore.perfiles));

    if (Array.isArray(perfilesStore.perfiles)) {
      console.log("Longitud del array:", perfilesStore.perfiles.length);
    }

    // Si no hay perfiles en el store, intentar cargarlos directamente
    if (!perfilesStore.perfiles || perfilesStore.perfiles.length === 0) {
      console.log(
        "No hay perfiles en el store, intentando cargar directamente"
      );
      try {
        const perfilService = await import("../services/perfilService");
        console.log("Servicio importado correctamente");
        const perfilesDirectos = await perfilService.default.getAllPerfiles(
          true
        );
        console.log("Perfiles cargados directamente:", perfilesDirectos);

        // Asignar manualmente al store si es necesario
        if (
          perfilesDirectos &&
          Array.isArray(perfilesDirectos) &&
          perfilesDirectos.length > 0
        ) {
          perfilesStore.perfiles = [...perfilesDirectos];
          console.log("perfilesDirectos actualizado:", perfilesStore.perfiles);
        }
      } catch (directError) {
        console.error("Error al cargar perfiles directamente:", directError);
      }
    }
  } catch (error) {
    console.error("Error al cargar perfiles:", error);
    toast.error("Error al cargar los perfiles");
  } finally {
    isLoading.value = false;
    console.log("fetchAllPerfiles finalizado, loading:", isLoading.value);
    console.log("Estado de conexión:", {
      perfilesEnStore: perfilesStore.perfiles
        ? perfilesStore.perfiles.length
        : 0,
      perfilesFiltrados: perfiles.value ? perfiles.value.length : 0,
      loading: isLoading.value,
      connectionError: !!perfilesStore.error,
    });
  }
}

function refreshData() {
  fetchPerfiles(true); // Forzar actualización
}

// Métodos para modales
function openCreateModal() {
  selectedPerfilId.value = null;
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
  selectedPerfilId.value = null;
  selectedPerfilName.value = "";
}

async function confirmDelete() {
  try {
    isDeletingPerfil.value = true;
    await perfilesStore.deletePerfil(selectedPerfilId.value);
    closeDeleteModal();
    fetchPerfiles(); // Recargar datos
  } catch (error) {
    console.error("Error al eliminar perfil:", error);
  } finally {
    isDeletingPerfil.value = false;
  }
}

function onPerfilSaved() {
  fetchPerfiles(); // Recargar datos después de guardar
}

// Inicializar
onMounted(() => {
  fetchPerfiles();
});
</script>
