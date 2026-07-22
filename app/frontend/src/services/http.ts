import axios from 'axios'
import { clearAuthSession, readAuthSession, saveAuthSession } from './authSession'

export const AUTH_UNAUTHORIZED_EVENT = 'psai-auth-unauthorized'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setAuthToken = (accessToken: string | null) => {
  if (accessToken) {
    http.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    return
  }

  delete http.defaults.headers.common.Authorization
}

setAuthToken(readAuthSession()?.accessToken ?? null)

type RetriableRequestConfig = {
  _psaiRetry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

const withAuthorizationHeader = (headers: unknown, token: string) => {
  if (headers && typeof headers === 'object' && 'set' in headers) {
    const setHeader = (headers as { set: (name: string, value: string) => void }).set

    if (typeof setHeader === 'function') {
      setHeader('Authorization', `Bearer ${token}`)
      return headers
    }
  }

  return {
    ...(headers as Record<string, unknown>),
    Authorization: `Bearer ${token}`,
  }
}

const refreshAccessToken = async () => {
  const session = readAuthSession()

  if (!session?.refreshToken) {
    clearAuthSession()
    setAuthToken(null)
    return null
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await axios.post<{
          accessToken: string
          refreshToken: string
          expiresAt: string
          actor: {
            id: string
            displayName: string
            role: 'SUPERADMIN' | 'ADMIN' | 'USER'
          }
        }>(
          `${apiBaseUrl}/auth/refresh`,
          {
            refreshToken: session.refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        saveAuthSession({
          actorId: data.actor.id,
          displayName: data.actor.displayName,
          role: data.actor.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          signedInAt: session.signedInAt,
        })

        setAuthToken(data.accessToken)
        return data.accessToken
      } catch {
        clearAuthSession()
        setAuthToken(null)
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

http.interceptors.request.use((config) => {
  const accessToken = readAuthSession()?.accessToken

  if (accessToken) {
    config.headers = withAuthorizationHeader(config.headers, accessToken) as typeof config.headers
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isLoginRequest = requestUrl.includes('/auth/login')
      const isRefreshRequest = requestUrl.includes('/auth/refresh')
      const isLogoutRequest = requestUrl.includes('/auth/logout')
      const config = (error.config ?? {}) as typeof error.config & RetriableRequestConfig

      if (!isLoginRequest && !isRefreshRequest && !isLogoutRequest && !config._psaiRetry) {
        const renewedAccessToken = await refreshAccessToken()

        if (renewedAccessToken) {
          config._psaiRetry = true
          config.headers = withAuthorizationHeader(config.headers, renewedAccessToken) as typeof config.headers

          return http.request(config)
        }
      }

      if (!isLoginRequest && !isRefreshRequest && !isLogoutRequest && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    return message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
