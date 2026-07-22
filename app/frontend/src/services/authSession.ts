export const AUTH_SESSION_STORAGE_KEY = 'psai-auth-session'

export type AuthSession = {
  actorId: string
  displayName: string
  role: 'SUPERADMIN' | 'ADMIN' | 'USER'
  accessToken: string
  refreshToken: string
  expiresAt: string
  signedInAt: string
}

const isExpired = (expiresAt: string) => {
  const expiresAtMs = Date.parse(expiresAt)

  if (Number.isNaN(expiresAtMs)) {
    return true
  }

  return expiresAtMs <= Date.now()
}

const parseAuthSession = (raw: string | null): AuthSession | null => {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (!parsed.actorId || !parsed.displayName || !parsed.role || !parsed.accessToken || !parsed.refreshToken || !parsed.expiresAt || !parsed.signedInAt) {
      return null
    }

    if (parsed.role !== 'SUPERADMIN' && parsed.role !== 'ADMIN' && parsed.role !== 'USER') {
      return null
    }

    return {
      actorId: parsed.actorId,
      displayName: parsed.displayName,
      role: parsed.role,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt,
      signedInAt: parsed.signedInAt,
    }
  } catch {
    return null
  }
}

export const readAuthSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const session = parseAuthSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY))

  if (!session || isExpired(session.expiresAt)) {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }

  return session
}

export const saveAuthSession = (session: AuthSession) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}
