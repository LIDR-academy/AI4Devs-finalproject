<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useProjectStore } from '~/stores/project';
import ProjectCard from '~/components/projects/ProjectCard.vue';
import CreateProjectModal from '~/components/projects/CreateProjectModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
});

const authStore = useAuthStore();
const projectStore = useProjectStore();

const showCreateModal = ref(false);

onMounted(() => {
  projectStore.fetchProjects();
});

const handleCreateClick = () => {
  if (projectStore.canCreateProject) {
    showCreateModal.value = true;
  }
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Cabecera de página -->
    <div data-testid="dashboard-header" class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-text">Proyectos</h1>
        <p data-testid="dashboard-user-name" class="text-sm text-secondary">
          Bienvenido, {{ authStore.user?.fullName }}
        </p>
      </div>

      <button
        @click="handleCreateClick"
        :disabled="!projectStore.canCreateProject"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-accent bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        :title="!projectStore.canCreateProject ? 'Has alcanzado el límite de proyectos de tu plan' : ''"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Nuevo Proyecto
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="projectStore.loading && projectStore.projects.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error -->
    <div v-else-if="projectStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ projectStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Sin proyectos -->
    <div
      v-if="!projectStore.loading && projectStore.projects.length === 0 && !projectStore.error"
      class="text-center py-16 bg-white rounded-lg border border-dashed border-secondary/30"
    >
      <svg class="mx-auto h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-text">No hay proyectos</h3>
      <p class="mt-1 text-sm text-secondary">Comienza creando tu primer proyecto de arquitectura.</p>
      <div class="mt-6">
        <button
          @click="handleCreateClick"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-accent bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Crear Proyecto
        </button>
      </div>
    </div>

    <!-- Grid de proyectos -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard
        v-for="project in projectStore.projects"
        :key="project.id"
        :project="project"
      />
    </div>

    <CreateProjectModal
      v-model="showCreateModal"
      @success="projectStore.fetchProjects"
    />
  </div>
</template>
