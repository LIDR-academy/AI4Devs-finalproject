<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Proyectos
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Gestiona todos los proyectos de consultoría
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <NuxtLink to="/projects/gantt" class="btn-secondary">
          <ChartBarIcon class="w-4 h-4 mr-2" />
          Vista Gantt
        </NuxtLink>
        <NuxtLink to="/projects/create" class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </NuxtLink>
      </div>
    </div>

    <!-- Filters and Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Filter Card -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filtros
        </h3>
        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Estado
            </label>
            <select v-model="filters.status" class="input-field">
              <option value="all">Todos</option>
              <option value="planning">Planificación</option>
              <option value="in-progress">En Progreso</option>
              <option value="review">Revisión</option>
              <option value="completed">Completado</option>
              <option value="on-hold">En Pausa</option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cliente
            </label>
            <select v-model="filters.client" class="input-field">
              <option value="all">Todos</option>
              <option
                v-for="client in uniqueClients"
                :key="client"
                :value="client"
              >
                {{ client }}
              </option>
            </select>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Gerente
            </label>
            <select v-model="filters.manager" class="input-field">
              <option value="all">Todos</option>
              <option
                v-for="manager in uniqueManagers"
                :key="manager"
                :value="manager"
              >
                {{ manager }}
              </option>
            </select>
          </div>

          <button @click="clearFilters" class="w-full btn-secondary text-sm">
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Proyectos"
            :value="projectStore.projects.length"
            :icon="FolderIcon"
            color="blue"
          />

          <MetricCard
            title="Presupuesto Total"
            :value="projectStore.totalBudget"
            :icon="CurrencyDollarIcon"
            color="green"
            format="currency"
          />

          <MetricCard
            title="Progreso Promedio"
            :value="projectStore.averageProgress"
            :icon="ChartBarIcon"
            color="purple"
            format="percentage"
            :progress="projectStore.averageProgress"
            :show-progress="true"
          />
        </div>
      </div>
    </div>

    <!-- Projects Grid/List Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ filteredProjects.length }} proyecto{{
            filteredProjects.length !== 1 ? "s" : ""
          }}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="viewMode = 'grid'"
          class="p-2 rounded-lg transition-colors"
          :class="
            viewMode === 'grid'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          "
        >
          <Squares2X2Icon class="w-5 h-5" />
        </button>
        <button
          @click="viewMode = 'list'"
          class="p-2 rounded-lg transition-colors"
          :class="
            viewMode === 'list'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          "
        >
          <ListBulletIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Projects Grid View -->
    <div
      v-if="viewMode === 'grid'"
      class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/projects/${project.id}`)"
      >
        <!-- Project Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2"
            >
              {{ project.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ project.client }}
            </p>
          </div>
          <div class="ml-4">
            <span class="status-badge" :class="getStatusClass(project.status)">
              {{ getStatusLabel(project.status) }}
            </span>
          </div>
        </div>

        <!-- Progress -->
        <div class="mb-4">
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1"
          >
            <span>Progreso</span>
            <span>{{ project.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill bg-primary-500"
              :style="{ width: `${project.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Project Info -->
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Gerente:</span>
            <span class="text-gray-900 dark:text-white">{{
              project.manager
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Presupuesto:</span>
            <span class="text-gray-900 dark:text-white">
              {{ formatCurrency(project.budget) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Fecha límite:</span>
            <span class="text-gray-900 dark:text-white">
              {{ formatDate(project.endDate) }}
            </span>
          </div>
        </div>

        <!-- Team -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Equipo:</span
            >
            <div class="flex -space-x-2">
              <div
                v-for="(member, index) in project.team.slice(0, 3)"
                :key="member"
                class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                :title="member"
              >
                {{ member.charAt(0) }}
              </div>
              <div
                v-if="project.team.length > 3"
                class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
              >
                +{{ project.team.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects List View -->
    <div v-else>
      <DataTable
        title=""
        :data="filteredProjects"
        :columns="projectColumns"
        :show-search="true"
        :show-actions="true"
        @edit="editProject"
        @delete="confirmDeleteProject"
      >
        <template #cell-name="{ item }">
          <div>
            <NuxtLink
              :to="`/projects/${item.id}`"
              class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              {{ item.name }}
            </NuxtLink>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ item.client }}
            </p>
          </div>
        </template>

        <template #cell-status="{ value }">
          <span class="status-badge" :class="getStatusClass(value)">
            {{ getStatusLabel(value) }}
          </span>
        </template>

        <template #cell-progress="{ value }">
          <div class="flex items-center space-x-2">
            <div class="flex-1 progress-bar max-w-24">
              <div
                class="progress-bar-fill bg-primary-500"
                :style="{ width: `${value}%` }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400 min-w-12">
              {{ value }}%
            </span>
          </div>
        </template>

        <template #cell-budget="{ value }">
          {{ formatCurrency(value) }}
        </template>

        <template #cell-endDate="{ value }">
          {{ formatDate(value) }}
        </template>

        <template #cell-team="{ item }">
          <div class="flex -space-x-2">
            <div
              v-for="(member, index) in item.team.slice(0, 3)"
              :key="member"
              class="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
              :title="member"
            >
              {{ member.charAt(0) }}
            </div>
            <div
              v-if="item.team.length > 3"
              class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
            >
              +{{ item.team.length - 3 }}
            </div>
          </div>
        </template>

        <template #row-actions="{ item }">
          <NuxtLink
            :to="`/projects/${item.id}`"
            class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <EyeIcon class="w-4 h-4" />
          </NuxtLink>
          <button
            @click="editProject(item)"
            class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
          <button
            @click="confirmDeleteProject(item)"
            class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="card p-6 m-4 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar Eliminación
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que deseas eliminar el proyecto "{{
            projectToDelete?.name
          }}"? Esta acción no se puede deshacer.
        </p>
        <div class="flex items-center justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="deleteProject" class="btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FolderIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { useProjectStore } from "~/stores/projects";
import { useToast } from "vue-toastification";

const toast = useToast();
const projectStore = useProjectStore();

// Reactive state
const viewMode = ref<"grid" | "list">("grid");
const showDeleteModal = ref(false);
const projectToDelete = ref<any>(null);

// Filters
const filters = reactive({
  status: "all",
  client: "all",
  manager: "all",
});

// Computed
const filteredProjects = computed(() => {
  return projectStore.projects.filter((project) => {
    if (filters.status !== "all" && project.status !== filters.status)
      return false;
    if (filters.client !== "all" && project.client !== filters.client)
      return false;
    if (filters.manager !== "all" && project.manager !== filters.manager)
      return false;
    return true;
  });
});

const uniqueClients = computed(() => {
  return [...new Set(projectStore.projects.map((p) => p.client))];
});

const uniqueManagers = computed(() => {
  return [...new Set(projectStore.projects.map((p) => p.manager))];
});

// Table columns
const projectColumns = [
  { key: "name", label: "Proyecto", type: "text" },
  { key: "status", label: "Estado", type: "status" },
  { key: "progress", label: "Progreso", type: "progress" },
  { key: "budget", label: "Presupuesto", type: "currency" },
  { key: "manager", label: "Gerente", type: "text" },
  { key: "endDate", label: "Fecha Límite", type: "date" },
  { key: "team", label: "Equipo", type: "text" },
];

// Methods
const getStatusClass = (status: string) => {
  const classes = {
    planning: "warning",
    "in-progress": "info",
    review: "warning",
    completed: "success",
    "on-hold": "danger",
  };
  return classes[status as keyof typeof classes] || "info";
};

const getStatusLabel = (status: string) => {
  const labels = {
    planning: "Planificación",
    "in-progress": "En Progreso",
    review: "Revisión",
    completed: "Completado",
    "on-hold": "En Pausa",
  };
  return labels[status as keyof typeof labels] || status;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-MX");
};

const clearFilters = () => {
  filters.status = "all";
  filters.client = "all";
  filters.manager = "all";
};

const editProject = (project: any) => {
  navigateTo(`/projects/${project.id}/edit`);
};

const confirmDeleteProject = (project: any) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const deleteProject = () => {
  if (projectToDelete.value) {
    toast.success("El proyecto ha sido eliminado correctamente");
    showDeleteModal.value = false;
    projectToDelete.value = null;
  }
};

// Initialize data
onMounted(async () => {
  await projectStore.fetchProjects();
});
</script>
