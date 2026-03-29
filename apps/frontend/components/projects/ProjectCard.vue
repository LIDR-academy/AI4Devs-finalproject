<script setup lang="ts">
import type { Project } from '~/types/project';

const props = defineProps<{
  project: Project
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<template>
  <div class="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-lg font-semibold text-text truncate" :title="project.title">
        {{ project.title }}
      </h3>
      <span 
        class="text-xs px-2 py-1 rounded-full font-medium"
        :class="project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-secondary/20 text-text'"
      >
        {{ project.status }}
      </span>
    </div>
    
    <p class="text-secondary text-sm mb-4 flex-grow line-clamp-3">
      {{ project.description || 'Sin descripción' }}
    </p>
    
    <div class="mt-auto flex items-center justify-between text-xs text-secondary pt-4 border-t border-secondary/20">
      <span>Actualizado: {{ formatDate(project.updatedAt) }}</span>
      <NuxtLink 
        :to="`/dashboard/project/${project.id}`"
        class="text-primary hover:text-primary/70 font-medium"
      >
        Ver Proyecto &rarr;
      </NuxtLink>
    </div>
  </div>
</template>
