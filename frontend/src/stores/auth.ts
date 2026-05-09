import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'oidc-client-ts'
import { authService, bootstrapAuth } from '@/services/auth/oidc'
import type { AppRole } from '@/types/auth'
import { APP_ROLES } from '@/types/auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeRole(role: string): string {
  const normalized = role.trim().toUpperCase()
  return normalized.startsWith('ROLE_') ? normalized.slice('ROLE_'.length) : normalized
}

function decodeJwtPayload(token: string | null | undefined): unknown {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(globalThis.atob(padded)) as unknown
  } catch {
    return null
  }
}

function collectRolesFromClaims(claims: unknown, roles: Set<string>): void {
  if (!isRecord(claims)) {
    return
  }

  const realmAccess = claims.realm_access
  if (isRecord(realmAccess) && Array.isArray(realmAccess.roles)) {
    realmAccess.roles.forEach((role) => {
      if (typeof role === 'string') {
        roles.add(normalizeRole(role))
      }
    })
  }

  const resourceAccess = claims.resource_access
  if (isRecord(resourceAccess)) {
    Object.values(resourceAccess).forEach((resource) => {
      if (!isRecord(resource) || !Array.isArray(resource.roles)) {
        return
      }
      resource.roles.forEach((role) => {
        if (typeof role === 'string') {
          roles.add(normalizeRole(role))
        }
      })
    })
  }

  const directRoles = claims.roles
  if (Array.isArray(directRoles)) {
    directRoles.forEach((role) => {
      if (typeof role === 'string') {
        roles.add(normalizeRole(role))
      }
    })
  }
}

function extractUserRoles(user: User | null): AppRole[] {
  if (!user) {
    return []
  }

  const roles = new Set<string>()

  collectRolesFromClaims(user.profile, roles)
  collectRolesFromClaims(decodeJwtPayload(user.access_token), roles)

  return APP_ROLES.filter((role) => roles.has(role))
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const isReady = ref(false)
  const isAuthenticated = computed(() => Boolean(currentUser.value && !currentUser.value.expired))
  const userRoles = computed<AppRole[]>(() => extractUserRoles(currentUser.value))

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
