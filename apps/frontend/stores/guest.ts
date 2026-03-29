import { defineStore } from 'pinia';
import type { GuestUser } from '~/types/guest';

export const useGuestStore = defineStore('guest', () => {
  const guestUser = ref<GuestUser | null>(null);
  const guestToken = useCookie<string | null>('guest_token');

  const isGuest = computed(() => !!guestToken.value && guestUser.value?.role === 'GUEST');

  function setGuestUser(user: GuestUser | null) {
    guestUser.value = user;
  }

  function setGuestToken(token: string | null) {
    guestToken.value = token;
  }

  function clearGuest() {
    guestUser.value = null;
    guestToken.value = null;
  }

  function saveGuestName(name: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_name', name);
    }
  }

  function getPersistedGuestName(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guest_name');
    }
    return null;
  }

  return {
    guestUser,
    guestToken,
    isGuest,
    setGuestUser,
    setGuestToken,
    clearGuest,
    saveGuestName,
    getPersistedGuestName,
  };
});
