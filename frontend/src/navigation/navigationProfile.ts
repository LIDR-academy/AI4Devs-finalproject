import type { AppRole } from '@/types/auth'

export interface NavigationProfileState {
  isAdmin: boolean
  isCollaboratorOrAdmin: boolean
  canShowLogin: boolean
  canShowLogout: boolean
}

export function buildNavigationProfileState(
  isReady: boolean,
  isAuthenticated: boolean,
  hasRole: (role: AppRole) => boolean,
): NavigationProfileState {
  const isAdmin = isAuthenticated && hasRole('ADMIN')
  const isCollaboratorOrAdmin = isAuthenticated && (hasRole('COLABORADOR') || isAdmin)
  const canShowLogin = isReady && !isAuthenticated
  const canShowLogout = isReady && isAuthenticated

  return {
    isAdmin,
    isCollaboratorOrAdmin,
    canShowLogin,
    canShowLogout,
  }
}
