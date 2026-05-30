import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'oidc-client-ts'
import { authService, bootstrapAuth } from '@/services/auth/oidc'
import type { AppRole } from '@/types/auth'
import { extractAppRolesFromUser } from '@/utils/jwtRoles'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const isReady = ref(false)
  const isAuthenticated = computed(() => Boolean(currentUser.value && !currentUser.value.expired))
  const userRoles = computed<AppRole[]>(() => extractAppRolesFromUser(currentUser.value))

  async function refreshUser(): Promise<void> {
    isLoading.value = true
    try {
      currentUser.value = await authService.getUser()
    } finally {
      isLoading.value = false
    }
  }

  function initAuthState(): void {
    if (isInitialized.value) {
      return
    }
    isInitialized.value = true

    authService.subscribeAuthEvents({
      onUserLoaded: (user) => {
        currentUser.value = user
      },
      onUserUnloaded: () => {
        currentUser.value = null
      },
      onAccessTokenExpired: () => {
        currentUser.value = null
      },
      onSilentRenewError: () => {
        currentUser.value = null
      },
    })

    void (async () => {
      try {
        await bootstrapAuth()
        await refreshUser()
      } finally {
        isReady.value = true
      }
    })()
  }

  function hasRole(role: AppRole): boolean {
    return userRoles.value.includes(role)
  }

  return {
    currentUser,
    isLoading,
    isReady,
    isAuthenticated,
    userRoles,
    hasRole,
    refreshUser,
    login: authService.login,
    logout: authService.logout,
    initAuthState,
  }
})
