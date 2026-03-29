import { defineNuxtPlugin } from '#app';
import { useAuthToken } from '~/composables/useAuthToken';
import { useGuestStore } from '~/stores/guest';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const guestStore = useGuestStore();
  const authStore = useAuthStore();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Usar el composable para obtener el token
      const { token } = useAuthToken();
      const tokenValue = token.value;
      
      console.log('[API Plugin] Request:', request, 'Token:', !!tokenValue);
      
      if (tokenValue) {
        const authHeaderValue = `Bearer ${tokenValue}`;
        
        options.headers = options.headers || {};
        
        // Handle both plain object and Headers instance cases
        if (options.headers instanceof Headers) {
            options.headers.set('Authorization', authHeaderValue);
        } else if (Array.isArray(options.headers)) {
            // Handle array of headers formatting
            options.headers.push(['Authorization', authHeaderValue]);
        } else {
            // Plain object
            // @ts-ignore
            options.headers.Authorization = authHeaderValue;
        }
      } else {
        console.warn('API Request without token (Store empty):', request);
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Si es guest, no redirigir al login
        if (guestStore.isGuest) {
          console.error('Guest authentication failed');
          return;
        }
        authStore.clearAuth();
        navigateTo('/login');
      }
    }
  });

  return {
    provide: {
      api
    }
  };
});
