<template>
  <header class="bg-primary border-b border-secondary/20">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y Nombre del Proyecto -->
        <div class="flex items-center space-x-4">
          <span class="text-2xl font-bold tracking-widest text-accent">TRACÉ</span>
          <div class="flex items-center space-x-2">
            <h1 class="text-lg font-semibold text-accent">{{ projectName }}</h1>
            <span class="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
              Modo Invitado
            </span>
          </div>
        </div>

        <!-- Info del Invitado -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span class="text-sm font-medium text-primary">
                {{ guestInitials }}
              </span>
            </div>
            <span class="text-sm text-accent">{{ guestName }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectName: string;
  guestName: string;
}>();

const guestInitials = computed(() => {
  const names = props.guestName.split(' ');
  if (names.length >= 2) {
    return names[0][0].toUpperCase() + names[1][0].toUpperCase();
  }
  return props.guestName.substring(0, 2).toUpperCase();
});
</script>
