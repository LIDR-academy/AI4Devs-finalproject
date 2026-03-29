import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  
  // If user is not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  // If authenticated but user data is not loaded, fetch it
  if (!authStore.user && authStore.token) {
    await authStore.fetchCurrentUser();
  }
});
