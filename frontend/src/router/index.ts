import { createRouter, createWebHistory } from 'vue-router'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import AuthGuardErrorView from '@/views/AuthGuardErrorView.vue'
import CreateEjemplarView from '@/views/CreateEjemplarView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminSubscriptionsView from '@/views/AdminSubscriptionsView.vue'
import AdminMastersView from '@/views/AdminMastersView.vue'
import SubscribeByEmailView from '@/views/SubscribeByEmailView.vue'
import EjemplaresDetailView from '@/views/EjemplaresDetailView.vue'
import EditEjemplarView from '@/views/EditEjemplarView.vue'
import MyEjemplaresListView from '@/views/MyEjemplaresListView.vue'
import EjemplaresListView from '@/views/EjemplaresListView.vue'
import { authService } from '@/services/auth/oidc'
import type { AppRole } from '@/types/auth'
import { userHasAnyAppRole } from '@/utils/jwtRoles'

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
      path: '/ejemplares',
      name: 'ejemplares-list',
      component: EjemplaresListView,
      meta: {
        pageTitleKey: 'pendingViews.treesList.title',
      },
    },
    {
      path: '/ejemplares/:id',
      name: 'ejemplares-detail',
      component: EjemplaresDetailView,
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
      path: '/ejemplares/new',
      name: 'ejemplares-new',
      component: CreateEjemplarView,
      meta: { requiresAuth: true },
    },
    {
      path: '/ejemplares/:id/edit',
      name: 'ejemplares-edit',
      component: EditEjemplarView,
      meta: {
        requiresAuth: true,
        pageTitleKey: 'treeEdit.title',
      },
    },
    {
      path: '/mis-ejemplares',
      name: 'mis-ejemplares',
      component: MyEjemplaresListView,
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
    if (requiredRoles.length > 0 && !userHasAnyAppRole(user, requiredRoles)) {
      return buildAuthErrorNavigation(to.fullPath, 'forbidden')
    }
    return true
  }

  const refreshedUser = await trySilentRefreshWithTimeout()
  if (refreshedUser) {
    if (requiredRoles.length > 0 && !userHasAnyAppRole(refreshedUser, requiredRoles)) {
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
