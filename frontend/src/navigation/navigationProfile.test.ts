import { describe, expect, it } from 'vitest'
import { buildNavigationProfileState } from '@/navigation/navigationProfile'

describe('buildNavigationProfileState', () => {
  it('returns public-only navigation when user is not authenticated', () => {
    const result = buildNavigationProfileState(true, false, () => false)

    expect(result).toEqual({
      isAdmin: false,
      isCollaboratorOrAdmin: false,
      canShowLogin: true,
      canShowLogout: false,
    })
  })

  it('returns collaborator navigation when user is authenticated as collaborator', () => {
    const result = buildNavigationProfileState(true, true, (role) => role === 'COLABORADOR')

    expect(result).toEqual({
      isAdmin: false,
      isCollaboratorOrAdmin: true,
      canShowLogin: false,
      canShowLogout: true,
    })
  })

  it('returns full navigation when user is authenticated as admin', () => {
    const result = buildNavigationProfileState(true, true, (role) => role === 'ADMIN')

    expect(result).toEqual({
      isAdmin: true,
      isCollaboratorOrAdmin: true,
      canShowLogin: false,
      canShowLogout: true,
    })
  })

  it('hides auth action buttons while auth state is initializing', () => {
    const result = buildNavigationProfileState(false, false, () => false)

    expect(result.canShowLogin).toBe(false)
    expect(result.canShowLogout).toBe(false)
  })
})
