import { http } from './http'

type LoginResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: string
  actor: {
    id: string
    displayName: string
    role: 'SUPERADMIN' | 'ADMIN' | 'USER'
  }
}

export const authApi = {
  login: async (payload: { actorId: string; displayName?: string; password: string }) => {
    const { data } = await http.post<LoginResponse>('/auth/login', payload)
    return data
  },
  refresh: async (payload: { refreshToken: string }) => {
    const { data } = await http.post<LoginResponse>('/auth/refresh', payload)
    return data
  },
  logout: async () => {
    await http.post('/auth/logout')
  },
}
