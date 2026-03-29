<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header con botón compartir -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Detalle del Proyecto</h1>
        <p class="mt-1 text-sm text-gray-500">ID: {{ projectId }}</p>
      </div>
      
      <button
        v-if="canShare"
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        @click="showShareModal = true"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartir
      </button>
    </div>

    <!-- Pestañas de Navegación del Proyecto (Planos, Miembros, Config) -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <a href="#" class="border-primary text-primary whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium" aria-current="page">Planos</a>
        <a href="#" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">Miembros</a>
        <a href="#" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium">Configuración</a>
      </nav>
    </div>

    <!-- Contenido Principal: Lista de Planos -->
    <PlanList :project-id="projectId" />
    
    <!-- Modal de Compartir -->
    <ShareProjectModal 
      v-model="showShareModal"
      :project-id="projectId"
    />
  </div>
</template>

<script setup lang="ts">
import PlanList from '@/components/plans/PlanList.vue'
import ShareProjectModal from '@/components/projects/ShareProjectModal.vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const authStore = useAuthStore()

const projectId = computed(() => route.params.id as string)
const showShareModal = ref(false)

const canShare = computed(() => {
  const role = authStore.user?.role
  // Permitir a todos los usuarios registrados (ADMIN, ARCHITECT, CLIENT)
  // Solo excluir a usuarios GUEST (invitados por enlace)
  return role === 'ADMIN' || role === 'ARCHITECT' || role === 'CLIENT'
})

// Asegurar que el usuario esté cargado
onMounted(() => {
  if (!authStore.user && authStore.token) {
    authStore.fetchCurrentUser()
  }
})

</script>
