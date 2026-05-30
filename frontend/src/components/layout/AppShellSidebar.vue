<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

defineProps<{
  isAdmin: boolean
  isCollaboratorOrAdmin: boolean
  canShowLogin: boolean
  canShowLogout: boolean
}>()

const emit = defineEmits<{
  login: []
  logout: []
  navigate: []
}>()

const { t } = useI18n()

function onNavigate(): void {
  emit('navigate')
}
</script>

<template>
  <div class="app-sidebar__brand">
    <img
      class="app-sidebar__logo"
      src="/MyTreeLibrary2.png"
      width="32"
      height="32"
      alt=""
      aria-hidden="true"
    />
    <div class="app-sidebar__brand-text">
      <span class="app-sidebar__title">{{ t('appShell.brand') }}</span>
      <span class="app-sidebar__tagline">{{ t('appShell.tagline') }}</span>
    </div>
  </div>

  <div v-if="canShowLogin || canShowLogout" class="app-sidebar__auth">
    <button
      v-if="canShowLogin"
      type="button"
      class="btn btn-sidebar btn-sidebar-primary"
      @click="emit('login')"
    >
      {{ t('navigation.login') }}
    </button>
    <button
      v-else-if="canShowLogout"
      type="button"
      class="btn btn-sidebar btn-sidebar-ghost"
      @click="emit('logout')"
    >
      {{ t('navigation.logout') }}
    </button>
  </div>

  <nav class="app-sidebar__nav" :aria-label="t('navigation.ariaLabel')">
    <p class="app-sidebar__section-label">{{ t('navigation.exploreSection') }}</p>
    <RouterLink class="sidebar-nav-link" to="/" @click="onNavigate">
      {{ t('navigation.home') }}
    </RouterLink>
    <RouterLink class="sidebar-nav-link" :to="{ name: 'ejemplares-list' }" @click="onNavigate">
      {{ t('navigation.trees') }}
    </RouterLink>
    <RouterLink class="sidebar-nav-link" :to="{ name: 'subscriptions-new' }" @click="onNavigate">
      {{ t('navigation.subscribe') }}
    </RouterLink>

    <template v-if="isCollaboratorOrAdmin">
      <p class="app-sidebar__section-label">{{ t('navigation.workspaceSection') }}</p>
      <RouterLink class="sidebar-nav-link" :to="{ name: 'ejemplares-new' }" @click="onNavigate">
        {{ t('navigation.createTree') }}
      </RouterLink>
      <RouterLink class="sidebar-nav-link" :to="{ name: 'mis-ejemplares' }" @click="onNavigate">
        {{ t('navigation.myTrees') }}
      </RouterLink>
    </template>

    <template v-if="isAdmin">
      <p class="app-sidebar__section-label">{{ t('navigation.adminSection') }}</p>
      <RouterLink class="sidebar-nav-link" :to="{ name: 'admin-masters' }" @click="onNavigate">
        {{ t('navigation.adminMasters') }}
      </RouterLink>
      <RouterLink class="sidebar-nav-link" :to="{ name: 'admin-subscriptions' }" @click="onNavigate">
        {{ t('navigation.adminSubscriptions') }}
      </RouterLink>
    </template>
  </nav>
</template>
