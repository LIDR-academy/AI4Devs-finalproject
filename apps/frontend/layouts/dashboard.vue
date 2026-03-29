<template>
  <div class="min-h-screen bg-secondary flex flex-col">

    <!-- Topbar -->
    <header class="bg-primary border-b border-secondary/20 h-14 flex items-center justify-between px-6 shrink-0">
      <!-- Logo / enlace a Proyectos -->
      <NuxtLink
        to="/dashboard"
        class="text-2xl font-bold tracking-widest text-accent hover:opacity-80 transition-opacity mr-8"
      >
        TRACÉ
      </NuxtLink>


      <!-- Usuario + Logout -->
      <div class="flex items-center gap-4">
        <div v-if="authStore.user" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {{ authStore.user.fullName?.charAt(0) || 'U' }}
          </div>
          <div class="hidden sm:block leading-tight">
            <p class="text-sm font-medium text-accent truncate max-w-[140px]">{{ authStore.user.fullName }}</p>
            <p class="text-xs text-white truncate max-w-[140px]">{{ authStore.user.role }}</p>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent hover:text-accent bg-white/10 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>

    <UiToast />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};
</script>
