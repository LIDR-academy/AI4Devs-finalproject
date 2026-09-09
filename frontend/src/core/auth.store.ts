import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from './api';
import type { AppRole, AuthUser, LoginResponse } from './auth.types';

const tokenStorageKey = 'tejaflow.accessToken';
const userStorageKey = 'tejaflow.user';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const accessToken = ref<string | null>(localStorage.getItem(tokenStorageKey));
  const user = ref<AuthUser | null>(readStoredUser());
  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));

  async function login(email: string, password: string): Promise<void> {
    const response = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    accessToken.value = response.accessToken;
    user.value = {
      idUsuario: response.idUsuario,
      nombre: response.nombre,
      email: response.email,
      rol: response.rol,
    };

    localStorage.setItem(tokenStorageKey, response.accessToken);
    localStorage.setItem(userStorageKey, JSON.stringify(user.value));
  }

  function logout(): void {
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
    void router.push({ name: 'login' });
  }

  function hasAnyRole(roles: AppRole[]): boolean {
    return user.value ? roles.includes(user.value.rol) : false;
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    logout,
    hasAnyRole,
  };
});

function readStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(userStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(userStorageKey);
    return null;
  }
}

