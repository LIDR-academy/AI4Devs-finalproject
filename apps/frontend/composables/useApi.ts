import { useAuthStore } from '~/stores/auth';

export const useApi = <T>(url: string, options: any = {}) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const defaults = {
    baseURL: config.public.apiBase,
    headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
  };

  return useFetch<T>(url, {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
    },
    onResponseError({ response }) {
      // Handle global errors here (e.g. 401 logout)
      if (response.status === 401) {
        authStore.clearAuth();
        navigateTo('/login');
      }
    },
  });
};
