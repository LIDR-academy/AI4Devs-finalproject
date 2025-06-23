<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div
      class="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-2">
            ¡Bienvenido de vuelta, {{ authStore.user?.name }}! 👋
          </h1>
          <p class="text-primary-100">
            Aquí tienes un resumen de la actividad de tus proyectos
          </p>
        </div>
        <div class="hidden lg:block">
          <div
            class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <span class="text-3xl">📊</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Proyectos Activos"
        :value="metrics.activeProjects"
        :icon="FolderIcon"
        color="blue"
        :trend="5.2"
        trend-label="vs mes anterior"
        :show-trend="true"
      />

      <MetricCard
        title="Tareas Pendientes"
        :value="metrics.pendingTasks"
        :icon="ClockIcon"
        color="yellow"
        :trend="-8.1"
        trend-label="vs semana anterior"
        :show-trend="true"
      />

      <MetricCard
        title="Retorno Promedio"
        :value="metrics.averageReturn"
        :icon="CurrencyDollarIcon"
        color="green"
        format="percentage"
        :trend="12.5"
        trend-label="vs trimestre anterior"
        :show-trend="true"
      />

      <MetricCard
        title="Eficiencia Operativa"
        :value="metrics.operationalEfficiency"
        :icon="ChartBarIcon"
        color="purple"
        format="percentage"
        :progress="metrics.operationalEfficiency"
        :show-progress="true"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Project Progress Chart -->
      <ChartCard
        title="Progreso de Proyectos"
        type="bar"
        :data="projectProgressData"
        :show-period-selector="true"
      />

      <!-- KPI Trends Chart -->
      <ChartCard
        title="Tendencias de KPIs"
        type="line"
        :data="kpiTrendsData"
        :show-period-selector="true"
      />
    </div>

    <!-- Current Projects and Recent Activity -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Current Projects -->
      <div class="xl:col-span-2">
        <DataTable
          title="Proyectos Actuales"
          :data="currentProjects"
          :columns="projectColumns"
          :show-pagination="false"
          :show-search="false"
          :show-actions="false"
        >
          <template #actions>
            <NuxtLink to="/projects" class="btn-primary"> Ver Todos </NuxtLink>
          </template>

          <template #cell-status="{ value }">
            <span
              class="status-badge"
              :class="{
                success: value === 'completed',
                info: value === 'in-progress',
                warning: value === 'planning',
                danger: value === 'on-hold',
              }"
            >
              {{ getStatusLabel(value) }}
            </span>
          </template>

          <template #cell-progress="{ value }">
            <div class="flex items-center space-x-2">
              <div class="flex-1 progress-bar">
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
        </DataTable>
      </div>

      <!-- Recent Activity -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h3>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-start space-x-3"
          >
            <div class="flex-shrink-0">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="getActivityColor(activity.type)"
              >
                <component
                  :is="getActivityIcon(activity.type)"
                  class="w-4 h-4 text-white"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ activity.title }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ activity.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {{ formatTimeAgo(activity.timestamp) }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <NuxtLink
            to="/activity"
            class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Ver toda la actividad →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Acciones Rápidas
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          to="/projects/create"
          class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors group"
        >
          <PlusIcon
            class="w-8 h-8 text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2"
          />
          <span
            class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          >
            Nuevo Proyecto
          </span>
        </NuxtLink>

        <NuxtLink
          to="/tasks/create"
          class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors group"
        >
          <ClipboardDocumentListIcon
            class="w-8 h-8 text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2"
          />
          <span
            class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          >
            Nueva Tarea
          </span>
        </NuxtLink>

        <NuxtLink
          to="/reports/weekly"
          class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors group"
        >
          <DocumentTextIcon
            class="w-8 h-8 text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2"
          />
          <span
            class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          >
            Generar Informe
          </span>
        </NuxtLink>

        <NuxtLink
          to="/finance/expenses"
          class="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors group"
        >
          <ReceiptPercentIcon
            class="w-8 h-8 text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 mb-2"
          />
          <span
            class="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          >
            Registrar Gasto
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FolderIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  UserIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";
import { ref } from "vue-demi";
import { useAuthStore } from "~/stores/auth";
import { useProjectStore } from "~/stores/projects";
import { useTaskStore } from "~/stores/tasks";

const authStore = useAuthStore();
const projectStore = useProjectStore();
const taskStore = useTaskStore();

// Mock metrics
const metrics = reactive({
  activeProjects: 8,
  pendingTasks: 23,
  averageReturn: 285, // 285% return
  operationalEfficiency: 87,
});

// Chart data
const projectProgressData = {
  labels: [
    "Proyecto A",
    "Proyecto B",
    "Proyecto C",
    "Proyecto D",
    "Proyecto E",
  ],
  datasets: [
    {
      label: "Progreso (%)",
      data: [85, 65, 45, 95, 30],
      backgroundColor: [
        "rgba(14, 165, 233, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(234, 179, 8, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(168, 85, 247, 0.8)",
      ],
      borderColor: [
        "rgba(14, 165, 233, 1)",
        "rgba(34, 197, 94, 1)",
        "rgba(234, 179, 8, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(168, 85, 247, 1)",
      ],
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
};

const kpiTrendsData = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
  datasets: [
    {
      label: "Eficiencia Operativa",
      data: [65, 72, 78, 81, 85, 87],
      borderColor: "rgba(14, 165, 233, 1)",
      backgroundColor: "rgba(14, 165, 233, 0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Satisfacción Cliente",
      data: [70, 75, 80, 78, 82, 85],
      borderColor: "rgba(34, 197, 94, 1)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

// Table data
const currentProjects = ref([
  {
    id: "1",
    name: "Optimización Procesos ABC",
    client: "Industrias ABC",
    status: "in-progress",
    progress: 85,
    dueDate: "2024-08-15",
  },
  {
    id: "2",
    name: "Transformación Digital XYZ",
    client: "TechCorp XYZ",
    status: "planning",
    progress: 25,
    dueDate: "2024-09-30",
  },
  {
    id: "3",
    name: "Mejora Productividad DEF",
    client: "Comercial DEF",
    status: "completed",
    progress: 100,
    dueDate: "2024-07-20",
  },
]);

const projectColumns = [
  { key: "name", label: "Proyecto", type: "text" },
  { key: "client", label: "Cliente", type: "text" },
  { key: "status", label: "Estado", type: "status" },
  { key: "progress", label: "Progreso", type: "progress" },
  { key: "dueDate", label: "Fecha Límite", type: "date" },
];

// Recent activities
const recentActivities = ref([
  {
    id: "1",
    type: "task",
    title: "Tarea completada",
    description: "Análisis de procesos manufactureros",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    type: "project",
    title: "Proyecto actualizado",
    description: "Progreso del 85% en Optimización ABC",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    type: "expense",
    title: "Gasto aprobado",
    description: "Viáticos de $1,500 MXN",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "4",
    type: "report",
    title: "Informe generado",
    description: "Reporte semanal del proyecto XYZ",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
]);

// Methods
const getStatusLabel = (status: string) => {
  const labels = {
    planning: "Planificación",
    "in-progress": "En Progreso",
    completed: "Completado",
    "on-hold": "En Pausa",
  };
  return labels[status as keyof typeof labels] || status;
};

const getActivityColor = (type: string) => {
  const colors = {
    task: "bg-blue-500",
    project: "bg-green-500",
    expense: "bg-yellow-500",
    report: "bg-purple-500",
  };
  return colors[type as keyof typeof colors] || "bg-gray-500";
};

const getActivityIcon = (type: string) => {
  const icons = {
    task: CheckCircleIcon,
    project: FolderIcon,
    expense: CurrencyDollarIcon,
    report: DocumentTextIcon,
  };
  return icons[type as keyof typeof icons] || UserIcon;
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Hace unos minutos";
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} días`;
};

// Definir metadata para esta página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
});

// Initialize data
onMounted(async () => {
  // Verificar si el usuario está autenticado
  if (!authStore.isAuthenticated) {
    // Redirigir al login si no está autenticado
    navigateTo('/login');
    return;
  }
  
  // Si está autenticado, cargar los datos
  await Promise.all([projectStore.fetchProjects(), taskStore.fetchTasks()]);
});
</script>
