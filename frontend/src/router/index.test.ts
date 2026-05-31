import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockedAuthService = vi.hoisted(() => ({
  getUser: vi.fn(),
  signinSilent: vi.fn(),
  login: vi.fn(),
}))

vi.mock('@/services/auth/oidc', () => ({
  authService: mockedAuthService,
}))

vi.mock('@/views/AdminMastersView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/AdminSubscriptionsView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/AuthCallbackView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/AuthGuardErrorView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/CreateTreeView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/HomeView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/LoginView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/SubscribeByEmailView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/TreeDetailView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/EditTreeView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/MyTreesListView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/views/TreesListView.vue', () => ({ default: { template: '<div />' } }))

import router from '@/router'

type MockedUser = {
  expired: boolean
  profile: Record<string, unknown>
  access_token: string
}

function toBase64Url(value: string): string {
  return globalThis.btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function buildJwt(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(payload))
  return `${header}.${body}.`
}

function buildUserWithRealmRoles(roles: string[]): MockedUser {
  return {
    expired: false,
    profile: {},
    access_token: buildJwt({
      realm_access: { roles },
    }),
  }
}

async function navigate(path: string): Promise<void> {
  try {
    await router.push(path)
  } catch {
    // ignore duplicated navigation in setup steps
  }
}

describe('router guards', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockedAuthService.getUser.mockResolvedValue(null)
    mockedAuthService.signinSilent.mockResolvedValue(null)
    mockedAuthService.login.mockResolvedValue(undefined)
    await navigate('/')
  })

  it('allows public routes without session', async () => {
    await navigate('/ejemplares')

    expect(router.currentRoute.value.name).toBe('ejemplares-list')
    expect(mockedAuthService.login).not.toHaveBeenCalled()
  })

  it('allows public detail route without session', async () => {
    await navigate('/ejemplares/42')

    expect(router.currentRoute.value.name).toBe('ejemplares-detail')
    expect(mockedAuthService.login).not.toHaveBeenCalled()
  })

  it('tries login when accessing protected route without session', async () => {
    await navigate('/ejemplares/new')

    expect(mockedAuthService.login).toHaveBeenCalledWith('/ejemplares/new')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('redirects to auth error with forbidden reason for admin route without ADMIN role', async () => {
    mockedAuthService.getUser.mockResolvedValue(buildUserWithRealmRoles(['COLABORADOR']))

    await navigate('/admin/masters')

    expect(router.currentRoute.value.name).toBe('auth-error')
    expect(router.currentRoute.value.query.reason).toBe('forbidden')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/masters')
  })

  it('allows admin route when user has ADMIN role', async () => {
    mockedAuthService.getUser.mockResolvedValue(buildUserWithRealmRoles(['ADMIN']))

    await navigate('/admin/masters')

    expect(router.currentRoute.value.name).toBe('admin-masters')
  })

  it('allows admin subscriptions route when user has ADMIN role', async () => {
    mockedAuthService.getUser.mockResolvedValue(buildUserWithRealmRoles(['ADMIN']))

    await navigate('/admin/subscriptions')

    expect(router.currentRoute.value.name).toBe('admin-subscriptions')
  })
})
