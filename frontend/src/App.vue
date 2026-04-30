<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { buildNavigationProfileState } from '@/navigation/navigationProfile'

const auth = useAuth()
const { t } = useI18n()
const navigationProfile = computed(() =>
  buildNavigationProfileState(auth.isReady.value, auth.isAuthenticated.value, auth.hasRole),
)
const isAdmin = computed(() => navigationProfile.value.isAdmin)
const isCollaboratorOrAdmin = computed(() => navigationProfile.value.isCollaboratorOrAdmin)
const canShowLogin = computed(() => navigationProfile.value.canShowLogin)
const canShowLogout = computed(() => navigationProfile.value.canShowLogout)
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar-content">
        <div class="brand-row">
          <img
            class="brand-logo"
            src="/MyTreeLibrary2.png"
            width="36"
            height="36"
            alt=""
            aria-hidden="true"
          />
          <div class="brand-text">
            <h1 class="brand">{{ t('appShell.brand') }}</h1>
            <p class="tagline">{{ t('appShell.tagline') }}</p>
          </div>
        </div>

        <nav class="main-nav" :aria-label="t('navigation.ariaLabel')">
          <RouterLink class="nav-link" to="/">{{ t('navigation.home') }}</RouterLink>
          <RouterLink class="nav-link" to="/trees">{{ t('navigation.trees') }}</RouterLink>
          <RouterLink class="nav-link" to="/subscriptions/new">{{ t('navigation.subscribe') }}</RouterLink>

          <template v-if="isCollaboratorOrAdmin">
            <RouterLink class="nav-link" to="/trees/new">{{ t('navigation.createTree') }}</RouterLink>
            <RouterLink class="nav-link" to="/my-trees">{{ t('navigation.myTrees') }}</RouterLink>
          </template>

          <template v-if="isAdmin">
            <RouterLink class="nav-link" to="/admin/masters">{{ t('navigation.adminMasters') }}</RouterLink>
            <RouterLink class="nav-link" to="/admin/subscriptions">
              {{ t('navigation.adminSubscriptions') }}
            </RouterLink>
          </template>
        </nav>

        <div class="topbar-auth-actions">
          <button
            v-if="canShowLogin"
            class="btn btn-secondary btn-sm"
            @click="auth.login('/')"
          >
            {{ t('navigation.login') }}
          </button>
          <button v-else-if="canShowLogout" class="btn btn-secondary btn-sm" @click="auth.logout()">
            {{ t('navigation.logout') }}
          </button>
        </div>
      </div>
    </header>

    <main class="container page-content">
      <RouterView />
    </main>
  </div>
</template>
