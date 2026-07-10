import { beforeEach, describe, expect, it } from 'vitest'
import { AUTH_SESSION_STORAGE_KEY, readAuthSession } from './authSession'

describe('authSession', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns null and clears storage when session is expired', () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        actorId: 'qa-user',
        displayName: 'QA User',
        role: 'USER',
        accessToken: 'expired-token',
        refreshToken: 'refresh-expired-token',
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        signedInAt: new Date(Date.now() - 5_000).toISOString(),
      }),
    )

    const session = readAuthSession()

    expect(session).toBeNull()
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('returns session when not expired', () => {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify({
        actorId: 'qa-user',
        displayName: 'QA User',
        role: 'USER',
        accessToken: 'valid-token',
        refreshToken: 'refresh-valid-token',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        signedInAt: new Date().toISOString(),
      }),
    )

    const session = readAuthSession()

    expect(session).toEqual(
      expect.objectContaining({
        actorId: 'qa-user',
        displayName: 'QA User',
      }),
    )
  })
})
