<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRoute } from 'vue-router'
import AppShellSidebar from '@/components/layout/AppShellSidebar.vue'
import { useAuth } from '@/composables/useAuth'
import { buildNavigationProfileState } from '@/navigation/navigationProfile'

const route = useRoute()
const auth = useAuth()
const { t } = useI18n()

const navigationProfile = computed(() =>
  buildNavigationProfileState(auth.isReady.value, auth.isAuthenticated.value, auth.hasRole),
)
const isAdmin = computed(() => navigationProfile.value.isAdmin)
const isCollaboratorOrAdmin = computed(() => navigationProfile.value.isCollaboratorOrAdmin)
const canShowLogin = computed(() => navigationProfile.value.canShowLogin)
const canShowLogout = computed(() => navigationProfile.value.canShowLogout)

const sidebarOpen = ref(false)
const isDesktop = ref(
  typeof window !== 'undefined' ? window.matchMedia('(min-width: 960px)').matches : true,
)

let mediaQuery: MediaQueryList | null = null

function onMediaChange(event: MediaQueryListEvent): void {
  isDesktop.value = event.matches
  if (event.matches) {
    sidebarOpen.value = false
  }
}

function onEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeSidebar()
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 960px)')
  mediaQuery.addEventListener('change', onMediaChange)
  window.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', onMediaChange)
  window.removeEventListener('keydown', onEscape)
})

function toggleSidebar(): void {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar(): void {
  sidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  },
)

</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar-open': sidebarOpen && !isDesktop }">
    <button
      v-if="sidebarOpen && !isDesktop"
      type="button"
      class="app-sidebar-backdrop"
      :aria-label="t('navigation.closeMenu')"
      @click="closeSidebar"
    />

    <aside
      class="app-sidebar"
      :class="{ 'app-sidebar--open': sidebarOpen || isDesktop }"
      :aria-hidden="!isDesktop && !sidebarOpen ? true : undefined"
    >
      <AppShellSidebar
        :is-admin="isAdmin"
        :is-collaborator-or-admin="isCollaboratorOrAdmin"
        :can-show-login="canShowLogin"
        :can-show-logout="canShowLogout"
        @login="auth.login('/')"
        @logout="auth.logout()"
        @navigate="closeSidebar"
      />
    </aside>

    <div class="app-main">
      <header v-if="!isDesktop" class="app-main-toolbar">
        <button
          type="button"
          class="app-menu-toggle"
          :aria-expanded="sidebarOpen || isDesktop"
          :aria-label="sidebarOpen ? t('navigation.closeMenu') : t('navigation.openMenu')"
          @click="toggleSidebar"
        >
          <span class="app-menu-toggle__bar" />
          <span class="app-menu-toggle__bar" />
          <span class="app-menu-toggle__bar" />
        </button>
        <span class="app-main-toolbar__brand">{{ t('appShell.brand') }}</span>
      </header>

      <div class="app-main-body container page-content">
        <RouterView :key="route.fullPath" />
      </div>
    </div>
  </div>
</template>
