import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { appConfig } from '@/services/config'

const redirectUri = `${globalThis.location.origin}/auth/callback`
const postLogoutRedirectUri = `${globalThis.location.origin}/`

const manager = new UserManager({
  authority: appConfig.oidc.issuer,
  client_id: appConfig.oidc.clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  response_type: 'code',
  scope: appConfig.oidc.scope,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: globalThis.localStorage }),
})

async function bootstrapAuth(): Promise<void> {
  await manager.clearStaleState()
}

async function getUser(): Promise<User | null> {
  return manager.getUser()
}

async function login(returnPath = '/'): Promise<void> {
  await manager.signinRedirect({
    state: { returnPath },
  })
}

async function completeLogin(): Promise<User> {
  return manager.signinRedirectCallback()
}

async function logout(): Promise<void> {
  await manager.signoutRedirect()
}

async function signinSilent(): Promise<User | null> {
  return manager.signinSilent()
}

interface AuthEventsListener {
  onUserLoaded?: (user: User) => void
  onUserUnloaded?: () => void
  onAccessTokenExpired?: () => void
  onSilentRenewError?: (error: Error) => void
}

function subscribeAuthEvents(listener: AuthEventsListener): () => void {
  if (listener.onUserLoaded) {
    manager.events.addUserLoaded(listener.onUserLoaded)
  }
  if (listener.onUserUnloaded) {
    manager.events.addUserUnloaded(listener.onUserUnloaded)
  }
  if (listener.onAccessTokenExpired) {
    manager.events.addAccessTokenExpired(listener.onAccessTokenExpired)
  }
  if (listener.onSilentRenewError) {
    manager.events.addSilentRenewError(listener.onSilentRenewError)
  }

  return () => {
    if (listener.onUserLoaded) {
      manager.events.removeUserLoaded(listener.onUserLoaded)
    }
    if (listener.onUserUnloaded) {
      manager.events.removeUserUnloaded(listener.onUserUnloaded)
    }
    if (listener.onAccessTokenExpired) {
      manager.events.removeAccessTokenExpired(listener.onAccessTokenExpired)
    }
    if (listener.onSilentRenewError) {
      manager.events.removeSilentRenewError(listener.onSilentRenewError)
    }
  }
}

function getAccessToken(user: User | null): string | null {
  if (!user || user.expired) {
    return null
  }
  return user.access_token
}

export const authService = {
  getUser,
  login,
  completeLogin,
  logout,
  signinSilent,
  subscribeAuthEvents,
  getAccessToken,
}

export { bootstrapAuth }
