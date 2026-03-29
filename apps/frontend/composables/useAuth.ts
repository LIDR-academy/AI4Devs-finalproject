import type { LoginCredentials, RegisterPayload, LoginResponse, RegisterResponse } from '~/types/auth';
import { useAuthStore } from '~/stores/auth';

export const useAuth = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  
  const loading = ref(false);
  const error = ref<string | null>(null);

  const apiBase = config.public.apiBase;

  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<LoginResponse>(`${apiBase}/auth/login`, {
        method: 'POST',
        body: credentials,
      });

      authStore.setToken(response.accessToken);
      authStore.setUser(response.user);
      
      await navigateTo('/dashboard');
    } catch (e: any) {
      error.value = e.data?.message || 'Login failed';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload: RegisterPayload) => {
    loading.value = true;
    error.value = null;
    try {
      // 1. Register the user
      await $fetch<RegisterResponse>(`${apiBase}/auth/register`, {
        method: 'POST',
        body: {
          email: payload.email,
          password: payload.password,
          fullName: payload.fullName,
        },
      });

      // 2. Auto-login after registration
      await login({
        email: payload.email,
        password: payload.password
      });
      
    } catch (e: any) {
      error.value = e.data?.message || 'Registration failed';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    authStore.clearAuth();
    await navigateTo('/login');
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
  };
};
