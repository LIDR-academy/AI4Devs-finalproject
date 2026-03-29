<template>
  <UiModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <template #title>
      Compartir Proyecto
    </template>
    
    <div class="space-y-4">
      <!-- Switch de Activación -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-900">Acceso Público</h4>
          <p class="text-sm text-gray-500">Permitir acceso mediante enlace compartido</p>
        </div>
        <button
          type="button"
          :class="[
            isActive ? 'bg-primary' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          ]"
          :disabled="isToggling"
          @click="toggleShare"
        >
          <span
            :class="[
              isActive ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>

      <!-- URL Generada -->
      <div v-if="isActive && shareUrl" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Enlace de Acceso
        </label>
        <div class="flex gap-2">
          <input
            :value="shareUrl"
            readonly
            type="text"
            class="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          />
          <button
            type="button"
            class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
            @click="copyToClipboard"
          >
            Copiar
          </button>
        </div>
        <p class="text-xs text-gray-500">
          Cualquier persona con este enlace podrá ver el plano y dejar comentarios.
        </p>
      </div>

      <!-- Estado de Carga -->
      <div v-if="isToggling" class="text-center py-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>

      <!-- Error -->
      <div v-if="error" class="rounded-md bg-red-50 p-3">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
        @click="$emit('update:modelValue', false)"
      >
        Cerrar
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { InvitationResponse } from '~/types/guest';
import { useToastStore } from '~/stores/toast';
import { useAuthStore } from '~/stores/auth';

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>();

const config = useRuntimeConfig();
const authStore = useAuthStore();
const toastStore = useToastStore();

const invitation = ref<InvitationResponse | null>(null);
const shareUrl = ref('');
const isToggling = ref(false);
const error = ref('');

const isActive = computed(() => !!invitation.value && invitation.value.status === 'PENDING');

// Cargar estado actual al abrir el modal
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    await loadShareStatus();
  }
});

async function loadShareStatus() {
  try {
    const response = await $fetch<InvitationResponse[]>(
      `${config.public.apiBase}/projects/${props.projectId}/invitations`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    );
    
    // Buscar invitación de guest (email: guest@system)
    const guestInvitation = response.find(
      inv => inv.email === 'guest@system' && inv.status === 'PENDING'
    );
    
    if (guestInvitation) {
      invitation.value = guestInvitation;
      shareUrl.value = `${window.location.origin}/p/${guestInvitation.token}`;
    }
  } catch (e: any) {
    // Si no existe token, está desactivado
    if (e.status !== 404) {
      error.value = 'Error al cargar el estado de compartición';
    }
  }
}

async function toggleShare() {
  isToggling.value = true;
  error.value = '';

  try {
    if (invitation.value) {
      // Desactivar - revocar invitación
      await $fetch(
        `${config.public.apiBase}/projects/${props.projectId}/invitations/${invitation.value.token}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authStore.token}` }
        }
      );
      
      invitation.value = null;
      shareUrl.value = '';
      
      toastStore.add({
        type: 'success',
        message: 'Acceso público desactivado'
      });
    } else {
      // Activar - crear invitación sin email
      const response = await $fetch<InvitationResponse>(
        `${config.public.apiBase}/projects/${props.projectId}/invitations`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: {} // Sin email, el backend usará guest@system
        }
      );
      
      invitation.value = response;
      shareUrl.value = `${window.location.origin}/p/${response.token}`;
      
      toastStore.add({
        type: 'success',
        message: 'Enlace generado correctamente'
      });
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Error al cambiar el estado de compartición';
    toastStore.add({
      type: 'error',
      message: error.value
    });
  } finally {
    isToggling.value = false;
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    toastStore.add({
      type: 'success',
      message: 'Enlace copiado al portapapeles'
    });
  } catch (e) {
    toastStore.add({
      type: 'error',
      message: 'Error al copiar el enlace'
    });
  }
}
</script>
