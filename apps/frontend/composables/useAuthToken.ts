import { useAuthStore } from '~/stores/auth';
import { useGuestStore } from '~/stores/guest';

/**
 * Composable para obtener el token de autenticación
 * Ya sea de un usuario normal o de un guest
 */
export const useAuthToken = () => {
  const authStore = useAuthStore();
  const guestStore = useGuestStore();

  // Intentar obtener token inyectado (para guests en páginas públicas).
  // inject() puede devolver undefined si se llama fuera del contexto de un
  // componente Vue (ej: interceptor onRequest del plugin api.ts), por eso
  // usamos ?. para evitar el crash y caer al fallback del guestStore.
  const injectedToken = inject<Ref<string>>('guestAuthToken');

  const token = computed(() => {
    // Prioridad: authStore > injectedToken > guestStore
    if (authStore.token) {
      return authStore.token;
    }
    if (injectedToken?.value) {
      return injectedToken.value;
    }
    return guestStore.guestToken.value || '';
  });

  return {
    token,
  };
};
