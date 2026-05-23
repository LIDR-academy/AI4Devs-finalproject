import { createRouter, createWebHistory } from 'vue-router'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import AuthGuardErrorView from '@/views/AuthGuardErrorView.vue'
import CreateTreeView from '@/views/CreateTreeView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminSubscriptionsView from '@/views/AdminSubscriptionsView.vue'
import AdminMastersView from '@/views/AdminMastersView.vue'
import SubscribeByEmailView from '@/views/SubscribeByEmailView.vue'
import TreesDetailView from '@/views/TreesDetailView.vue'
import EditTreeView from '@/views/EditTreeView.vue'
import MyTreesListView from '@/views/MyTreesListView.vue'
import TreesListView from '@/views/TreesListView.vue'
import { authService } from '@/services/auth/oidc'
import type { AppRole } from '@/types/auth'

async function trySilentRefreshWithTimeout(timeoutMs = 800) {
  const timeoutPromise = new Promise<null>((resolve) => {
    globalThis.setTimeout(() => resolve(null), timeoutMs)
  })

  try {
    const refreshedUser = await Promise.race([
      authService.signinSilent(),
      timeoutPromise,
    ])
    if (refreshedUser && !refreshedUser.expired) {
      return refreshedUser
    }
    return null
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeRole(role: string): string {
  const normalized = role.trim().toUpperCase()
  return normalized.startsWith('ROLE_') ? normalized.slice('ROLE_'.length) : normalized
}

function decodeJwtPayload(token: string | null | undefined): unknown {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(globalThis.atob(padded)) as unknown
  } catch {
    return null
  }
}

function collectRolesFromClaims(claims: unknown, roles: Set<string>): void {
  if (!isRecord(claims)) {
    return
  }

  const realmAccess = claims.realm_access
  if (isRecord(realmAccess) && Array.isArray(realmAccess.roles)) {
    realmAccess.roles.forEach((role) => {
      if (typeof role === 'string') {
        roles.add(normalizeRole(role))
      }
    })
  }

  const resourceAccess = claims.resource_access
  if (isRecord(resourceAccess)) {
    Object.values(resourceAccess).forEach((resource) => {
      if (!isRecord(resource) || !Array.isArray(resource.roles)) {
        return
      }
      resource.roles.forEach((role) => {
        if (typeof role === 'string') {
          roles.add(normalizeRole(role))
        }
      })
    })
  }

  const directRoles = claims.roles
  if (Array.isArray(directRoles)) {
    directRoles.forEach((role) => {
      if (typeof role === 'string') {
        roles.add(normalizeRole(role))
      }
    })
  }

}

function extractTokenRoles(user: Awaited<ReturnType<typeof authService.getUser>>): Set<string> {
  const roles = new Set<string>()
  if (!user) {
    return roles
  }

  collectRolesFromClaims(user.profile, roles)
  collectRolesFromClaims(decodeJwtPayload(user.access_token), roles)
  return roles
}

function hasRequiredRole(user: Awaited<ReturnType<typeof authService.getUser>>, requiredRoles: AppRole[]): boolean {
  if (!user) {
    return false
  }
  const userRoles = extractTokenRoles(user)
  return requiredRoles.some((role) => userRoles.has(normalizeRole(role)))
}

function buildAuthErrorNavigation(redirect: string, reason: 'session' | 'forbidden') {
  return {
    name: 'auth-error',
    query: { redirect, reason },
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/auth/callback', name: 'auth-callback', component: AuthCallbackView },
    { path: '/auth/error', name: 'auth-error', component: AuthGuardErrorView },
    {
      path: '/trees',
      name: 'trees-list',
      component: TreesListView,
      meta: {
        pageTitleKey: 'pendingViews.treesList.title',
      },
    },
    {
      path: '/trees/:id',
      name: 'trees-detail',
      component: TreesDetailView,
      meta: {
        pageTitleKey: 'pendingViews.treesDetail.title',
      },
    },
    {
      path: '/subscriptions/new',
      name: 'subscriptions-new',
      component: SubscribeByEmailView,
      meta: {
        pageTitleKey: 'subscriptionNew.title',
      },
    },
    {
      path: '/trees/new',
      name: 'trees-new',
      component: CreateTreeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/trees/:id/edit',
      name: 'trees-edit',
      component: EditTreeView,
      meta: {
        requiresAuth: true,
        pageTitleKey: 'treeEdit.title',
      },
    },
    {
      path: '/my-trees',
      name: 'my-trees',
      component: MyTreesListView,
      meta: {
        requiresAuth: true,
        pageTitleKey: 'myTrees.title',
      },
    },
    {
      path: '/admin/masters',
      name: 'admin-masters',
      component: AdminMastersView,
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        pageTitleKey: 'adminMasters.title',
      },
    },
    {
      path: '/admin/subscriptions',
      name: 'admin-subscriptions',
      component: AdminSubscriptionsView,
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        pageTitleKey: 'adminSubscriptions.title',
      },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true
  }
  const requiredRoles = Array.isArray(to.meta.requiredRoles) ? (to.meta.requiredRoles as AppRole[]) : []

  let user = null
  try {
    user = await authService.getUser()
  } catch {
    return buildAuthErrorNavigation(to.fullPath, 'session')
  }

  if (user && !user.expired) {
    if (requiredRoles.length > 0 && !hasRequiredRole(user, requiredRoles)) {
      return buildAuthErrorNavigation(to.fullPath, 'forbidden')
    }
    return true
  }

  const refreshedUser = await trySilentRefreshWithTimeout()
  if (refreshedUser) {
    if (requiredRoles.length > 0 && !hasRequiredRole(refreshedUser, requiredRoles)) {
      return buildAuthErrorNavigation(to.fullPath, 'forbidden')
    }
    return true
  }

  try {
    await authService.login(to.fullPath)
  } catch {
    return buildAuthErrorNavigation(to.fullPath, 'session')
  }

  return false
})

export default router
