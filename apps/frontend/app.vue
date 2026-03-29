<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

// Try to restore session on app init if token exists
// callOnce ensures this runs only once on the server or client hydration
await callOnce(async () => {
    if (authStore.isAuthenticated && !authStore.user) {
        await authStore.fetchCurrentUser();
    }
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
