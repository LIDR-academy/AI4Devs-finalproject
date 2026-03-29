import type { GuestLoginResponse } from '~/types/guest';
import { useGuestStore } from '~/stores/guest';

export const useGuestAuth = () => {
  const config = useRuntimeConfig();
  const guestStore = useGuestStore();
  
  const loading = ref(false);
  const error = ref<string | null>(null);

  const apiBase = config.public.apiBase;

  const loginAsGuest = async (shareToken: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch<GuestLoginResponse>(`${apiBase}/auth/guest/login`, {
        method: 'POST',
        body: { token: shareToken },
      });

      guestStore.setGuestToken(response.accessToken);
      console.log('[useGuestAuth] Token saved to store, checking:', guestStore.guestToken.value ? 'exists' : 'missing');
      
      // Recuperar nombre persistido si existe
      const persistedName = guestStore.getPersistedGuestName();
      
      if (persistedName) {
        guestStore.setGuestUser({
          name: persistedName,
          projectId: response.project.id,
          token: response.accessToken,
          role: 'GUEST',
        });
      }

      return response;
    } catch (e: any) {
      const errorMessage = e.data?.message || e.message || 'Enlace inválido o expirado';
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  const setGuestName = (name: string, projectId: string) => {
    guestStore.saveGuestName(name);
    guestStore.setGuestUser({
      name,
      projectId,
      token: guestStore.guestToken.value!,
      role: 'GUEST',
    });
  };

  const logout = () => {
    guestStore.clearGuest();
  };

  return {
    loading,
    error,
    loginAsGuest,
    setGuestName,
    logout,
  };
};
