import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { ref } from 'vue'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with null user and token', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeFalsy()
    expect(store.isAuthenticated).toBe(false)
  })

  it('setUser updates user state', () => {
    const store = useAuthStore()
    const user = { id: '1', email: 'test@example.com', fullName: 'Test User' }
    store.setUser(user as any)
    expect(store.user).toEqual(user)
  })

  it('setToken updates token state', () => {
    const store = useAuthStore()
    store.setToken('test-token')
    expect(store.token).toBe('test-token')
    expect(store.isAuthenticated).toBe(true)
  })

  it('clearAuth resets state', () => {
    const store = useAuthStore()
    store.setUser({ id: '1' } as any)
    store.setToken('token')
    
    store.clearAuth()
    
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  describe('fetchCurrentUser', () => {
    // Mock global $fetch
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'base' } }))

    beforeEach(() => {
        fetchMock.mockReset()
    })

    it('successfully fetches user', async () => {
        const store = useAuthStore()
        store.token = 'existing-token'
        const mockUser = { id: '123', email: 'me@test.com' }
        
        fetchMock.mockResolvedValue(mockUser)

        await store.fetchCurrentUser()

        expect(store.user).toEqual(mockUser)
    })

    it('clears auth on 401 error', async () => {
        const store = useAuthStore()
        store.token = 'bad-token'
        store.user = { id: '1' } as any

        fetchMock.mockRejectedValue({ 
            response: { status: 401 }
        })

        await store.fetchCurrentUser()

        expect(store.user).toBeNull()
        expect(store.token).toBeNull()
    })

    it('does nothing if no token exists', async () => {
        const store = useAuthStore()
        store.token = null
        
        await store.fetchCurrentUser()
        
        expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
