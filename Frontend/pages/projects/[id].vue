<template>
  <div class="p-6">
    <div v-if="loading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"
      ></div>
      <p class="mt-4 text-gray-600">Cargando proyecto...</p>
    </div>

    <div v-else-if="project" class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ project.name }}</h1>
        <div class="flex space-x-2">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Editar
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Exportar
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Información del proyecto -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Detalles del Proyecto</h2>
            <div class="space-y-3">
              <div>
                <span class="font-medium">Cliente:</span>
                <span class="ml-2">{{ project.client }}</span>
              </div>
              <div>
                <span class="font-medium">Estado:</span>
                <span
                  class="ml-2 px-2 py-1 rounded text-sm"
                  :class="getStatusClass(project.status)"
                >
                  {{ getStatusLabel(project.status) }}
                </span>
              </div>
              <div>
                <span class="font-medium">Progreso:</span>
                <span class="ml-2">{{ project.progress }}%</span>
              </div>
              <div v-if="project.dueDate">
                <span class="font-medium">Fecha límite:</span>
                <span class="ml-2">{{ formatDate(project.dueDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Acciones rápidas</h3>
            <div class="space-y-2">
              <button
                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Agregar tarea
              </button>
              <button
                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Subir archivo
              </button>
              <button
                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Generar reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg">Proyecto no encontrado</p>
      <NuxtLink
        to="/projects"
        class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Volver a proyectos
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';
import { useProjectStore } from "~/stores/projects";

// ✅ Definir todas las variables necesarias
const route = useRoute(); // Composable de Nuxt para obtener la ruta
const toast = useToast(); // Hook correcto para toast
const projectStore = useProjectStore(); // Store de proyectos

// Estados reactivos
const loading = ref(true);
const project = ref(null);

// Métodos helper
const getStatusLabel = (status) => {
  const labels = {
    planning: "Planificación",
    "in-progress": "En Progreso",
    completed: "Completado",
    "on-hold": "En Pausa",
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    planning: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    "on-hold": "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  if (!dateString) return "No definida";
  return new Date(dateString).toLocaleDateString("es-ES");
};

// ✅ Initialize data (corregido)
onMounted(async () => {
  try {
    const projectId = route.params.id;

    // Verificar si el método existe en el store
    if (projectStore.fetchProject) {
      await projectStore.fetchProject(projectId);
      project.value = projectStore.currentProject; // Ajusta según tu store
    } else {
      // Fallback si no tienes el método implementado
      console.warn("fetchProject no implementado en projectStore");
      // Simular datos de ejemplo
      project.value = {
        id: projectId,
        name: `Proyecto ${projectId}`,
        client: "Cliente Ejemplo",
        status: "in-progress",
        progress: 75,
        dueDate: "2024-12-31",
      };
    }

    if (!project.value) {
      toast.error("No se pudo cargar el proyecto");
      await navigateTo("/projects");
    }
  } catch (error) {
    console.error("Error cargando proyecto:", error);
    toast.error("Error al cargar el proyecto");
    await navigateTo("/projects");
  } finally {
    loading.value = false;
  }
});

// Meta de la página
definePageMeta({
  title: "Detalle del Proyecto",
});
</script>
