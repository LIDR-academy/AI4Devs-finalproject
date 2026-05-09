import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { AppRole } from '@/types/auth'

export function useAuth() {
  const authStore = useAuthStore()
  authStore.initAuthState()
  const { currentUser, isAuthenticated, isReady, isLoading, userRoles } = storeToRefs(authStore)

  return {
    currentUser,
    isAuthenticated,
    isReady,
    isLoading,
    userRoles,
    hasRole: (role: AppRole) => authStore.hasRole(role),
    refreshUser: authStore.refreshUser,
    login: authStore.login,
    logout: authStore.logout,
  }
}
