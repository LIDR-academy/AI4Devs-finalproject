<template>
  <div class="h-full">
    <!-- Estado de Carga -->
    <div v-if="isAuthenticating" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-600">Verificando acceso...</p>
      </div>
    </div>

    <!-- Error: Enlace Inválido -->
    <div v-else-if="authError" class="flex items-center justify-center h-full">
      <div class="text-center max-w-md px-4">
        <div class="mb-4">
          <svg class="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido o Expirado</h2>
        <p class="text-gray-600 mb-6">
          Este enlace ha caducado o ha sido revocado por el propietario del proyecto.
        </p>
        <a href="/" class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
          Ir al Inicio
        </a>
      </div>
    </div>

    <!-- Prompt para Nombre -->
    <GuestNamePrompt 
      v-else-if="needsName" 
      @submit="handleNameSubmit"
    />

    <!-- Visor del Proyecto -->
    <div v-else class="h-full">
      <PlanViewer 
        v-if="currentPlanId"
        :plan-id="currentPlanId" 
        :project-id="projectId"
        :is-guest-mode="true"
      />
      <div v-else class="flex items-center justify-center h-full">
        <p class="text-gray-600">Cargando proyecto...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuestAuth } from '~/composables/useGuestAuth';
import { useGuestStore } from '~/stores/guest';
import PlanViewer from '~/components/plans/PlanViewer.vue';
import GuestNamePrompt from '~/components/guest/GuestNamePrompt.vue';

definePageMeta({
  layout: 'guest',
  middleware: [] // Sin middleware de autenticación normal
});

const route = useRoute();
const shareToken = computed(() => route.params.token as string);

const guestAuth = useGuestAuth();
const guestStore = useGuestStore();

const isAuthenticating = ref(true);
const authError = ref<string | null>(null);
const needsName = ref(false);
const projectId = ref<string>('');
const projectTitle = ref<string>('');
const guestToken = ref<string>('');
const currentPlanId = ref<string | null>(null);

// Proveer el token para que componentes hijos puedan usarlo
provide('guestAuthToken', guestToken);

// Inyectar función para actualizar nombre del proyecto en el layout
const setProjectName = inject<(name: string) => void>('setProjectName');

onMounted(async () => {
  await authenticateGuest();
});

async function authenticateGuest() {
  try {
    isAuthenticating.value = true;
    const response = await guestAuth.loginAsGuest(shareToken.value);
    
    console.log('Guest login response:', response);
    
    projectId.value = response.project.id;
    projectTitle.value = response.project.title;
    guestToken.value = response.accessToken;
    
    // Actualizar nombre del proyecto en el layout
    if (setProjectName) {
      setProjectName(response.project.title);
    }

    // Verificar si necesita nombre
    const persistedName = guestStore.getPersistedGuestName();
    console.log('Persisted guest name:', persistedName);
    
    if (!persistedName) {
      needsName.value = true;
    } else {
      // Ya tiene nombre, actualizar el store y cargar
      guestStore.setGuestUser({
        name: persistedName,
        projectId: response.project.id,
        token: response.accessToken,
        role: 'GUEST',
      });
      
      // Esperar a que el store se actualice
      await nextTick();
      console.log('[After nextTick] Guest token in store:', guestStore.guestToken.value ? 'exists' : 'missing');
      await loadProject();
    }
  } catch (error: any) {
    console.error('Guest auth error:', error);
    authError.value = error.message;
  } finally {
    isAuthenticating.value = false;
  }
}

async function handleNameSubmit(name: string) {
  console.log('Guest name submitted:', name);
  guestAuth.setGuestName(name, projectId.value);
  needsName.value = false;
  
  // Esperar a que el store se actualice
  await nextTick();
  await loadProject();
}

async function loadProject() {
  try {
    const config = useRuntimeConfig();
    const token = guestToken.value;
    
    console.log('Loading project with token:', token ? 'exists' : 'missing');
    console.log('Project ID:', projectId.value);
    
    if (!token) {
      authError.value = 'No se pudo autenticar';
      return;
    }
    
    // Cargar el primer plan disponible
    const plans = await $fetch(`${config.public.apiBase}/projects/${projectId.value}/plans`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Plans loaded:', plans);

    if (plans && plans.length > 0 && plans[0].plans && plans[0].plans.length > 0) {
      currentPlanId.value = plans[0].plans[0].id;
      console.log('Current plan ID set to:', currentPlanId.value);
    } else {
      console.log('No plans found for project');
    }
  } catch (error) {
    console.error('Error loading project:', error);
    authError.value = 'No se pudo cargar el proyecto';
  }
}
</script>
