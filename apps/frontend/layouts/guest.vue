<template>
  <div class="min-h-screen bg-background">
    <GuestHeader 
      :project-name="projectName"
      :guest-name="guestName"
    />
    
    <main class="h-[calc(100vh-4rem)]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useGuestStore } from '~/stores/guest';

const guestStore = useGuestStore();

// Estas props deberían venir del contexto de la página
const projectName = ref('Proyecto Compartido');
const guestName = computed(() => guestStore.guestUser?.name || 'Invitado');

// Escuchar eventos para actualizar el nombre del proyecto
provide('setProjectName', (name: string) => {
  projectName.value = name;
});
</script>
