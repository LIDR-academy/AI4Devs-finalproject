import type { AppRole } from '@/types/auth'
import { APP_ROLES } from '@/types/auth'

export function normalizeRole(role: string): string {
  const normalized = role.trim().toUpperCase()
  return normalized.startsWith('ROLE_') ? normalized.slice('ROLE_'.length) : normalized
}

export function decodeJwtPayload(token: string | null | undefined): unknown {
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

export function collectRolesFromClaims(claims: unknown, roles: Set<string>): void {
  if (typeof claims !== 'object' || claims === null) {
    return
  }

  const record = claims as Record<string, unknown>
  const realmAccess = record.realm_access
  if (typeof realmAccess === 'object' && realmAccess !== null) {
    const realmRoles = (realmAccess as Record<string, unknown>).roles
    if (Array.isArray(realmRoles)) {
      realmRoles.forEach((role) => {
        if (typeof role === 'string') {
          roles.add(normalizeRole(role))
        }
      })
    }
  }

  const resourceAccess = record.resource_access
  if (typeof resourceAccess === 'object' && resourceAccess !== null) {
    Object.values(resourceAccess).forEach((resource) => {
      if (typeof resource !== 'object' || resource === null) {
        return
      }
      const resourceRoles = (resource as Record<string, unknown>).roles
      if (!Array.isArray(resourceRoles)) {
        return
      }
      resourceRoles.forEach((role) => {
        if (typeof role === 'string') {
          roles.add(normalizeRole(role))
        }
      })
    })
  }

  const directRoles = record.roles
  if (Array.isArray(directRoles)) {
    directRoles.forEach((role) => {
      if (typeof role === 'string') {
        roles.add(normalizeRole(role))
      }
    })
  }
}

export interface JwtRoleSource {
  profile?: unknown
  access_token?: string | null
}

export function extractRoleSetFromUser(user: JwtRoleSource | null | undefined): Set<string> {
  const roles = new Set<string>()
  if (!user) {
    return roles
  }

  collectRolesFromClaims(user.profile, roles)
  collectRolesFromClaims(decodeJwtPayload(user.access_token ?? null), roles)
  return roles
}

export function extractAppRolesFromUser(user: JwtRoleSource | null | undefined): AppRole[] {
  const roles = extractRoleSetFromUser(user)
  return APP_ROLES.filter((role) => roles.has(role))
}

export function userHasAnyAppRole(
  user: JwtRoleSource | null | undefined,
  requiredRoles: readonly AppRole[],
): boolean {
  if (!user) {
    return false
  }
  const userRoles = extractRoleSetFromUser(user)
  return requiredRoles.some((role) => userRoles.has(normalizeRole(role)))
}
