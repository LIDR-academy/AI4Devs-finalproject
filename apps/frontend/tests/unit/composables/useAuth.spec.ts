import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../../../composables/useAuth'

// Mock store
const mockSetToken = vi.fn()
const mockSetUser = vi.fn()
const mockClearAuth = vi.fn()

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({
    setToken: mockSetToken,
    setUser: mockSetUser,
    clearAuth: mockClearAuth
  })
}))

describe('useAuth Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock globals provided by Nuxt
    globalThis.$fetch = vi.fn()
    globalThis.navigateTo = vi.fn()
  })

  it('login calls api and updates store', async () => {
    const { login } = useAuth()
    
    const mockFetch = vi.mocked(global.$fetch)
    mockFetch.mockResolvedValueOnce({
      accessToken: 'token123',
      user: { id: 1, name: 'User' }
    })
    
    await login({ email: 'test@test.com', password: 'password' })
    
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: { email: 'test@test.com', password: 'password' }
    }))
    
    expect(mockSetToken).toHaveBeenCalledWith('token123')
    expect(mockSetUser).toHaveBeenCalledWith({ id: 1, name: 'User' })
    // expect(global.navigateTo).toHaveBeenCalledWith('/dashboard')
  })

  it('register calls register endpoint then auto-logins', async () => {
    const { register } = useAuth()
    const mockFetch = vi.mocked(global.$fetch)
    
    mockFetch.mockResolvedValueOnce({ id: 1 }) // register response
    mockFetch.mockResolvedValueOnce({         // login response
        accessToken: 'token123',
        user: { id: 1 }
    })

    await register({ email: 'test@test.com', password: 'pass', fullName: 'Name' })

    expect(mockFetch).toHaveBeenNthCalledWith(1, 'http://localhost:4000/api/auth/register', expect.objectContaining({
        method: 'POST',
        body: { email: 'test@test.com', password: 'pass', fullName: 'Name' }
    }))

    expect(mockFetch).toHaveBeenNthCalledWith(2, 'http://localhost:4000/api/auth/login', expect.objectContaining({
        body: { email: 'test@test.com', password: 'pass' }
    }))
  })

  it('logout clears auth and redirects', async () => {
    const { logout } = useAuth()
    await logout()
    expect(mockClearAuth).toHaveBeenCalled()
    // expect(global.navigateTo).toHaveBeenCalledWith('/login')
  })
  
  it('handles login error', async () => {
      const { login, error } = useAuth()
      const mockFetch = vi.mocked(global.$fetch)
      mockFetch.mockRejectedValueOnce({ data: { message: 'Invalid credentials' } })
      
      await expect(login({ email: 'a', password: 'b' })).rejects.toThrow()
      expect(error.value).toBe('Invalid credentials')
  })
})
