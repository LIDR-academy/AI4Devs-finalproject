import { defineStore } from 'pinia';
import type { User } from '~/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = useCookie<string | null>('auth_token');

  const isAuthenticated = computed(() => !!token.value);

  function setUser(newUser: User | null) {
    user.value = newUser;
  }

  function setToken(newToken: string | null) {
    token.value = newToken;
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
  }

  async function fetchCurrentUser() {
    if (!token.value) return;
    
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<User>(`${config.public.apiBase}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token.value}`
        }
      });
      
      setUser(data);
    } catch (e: any) {
      console.error('Failed to fetch user session', e);
      // If 401, clear token
      if (e.response?.status === 401 || e.statusCode === 401) {
          clearAuth();
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    clearAuth,
    fetchCurrentUser
  };
});
