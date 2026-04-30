<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
const { t } = useI18n()
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const isAdmin = computed(() => isAuthenticated.value && auth.hasRole('ADMIN'))
const homeTitle = computed(() => (isAdmin.value ? t('home.adminTitle') : t('home.collaboratorTitle')))
const homeDescription = computed(() =>
  isAdmin.value ? t('home.adminDescription') : t('home.collaboratorDescription'),
)
</script>

<template>
  <section class="card home-card">
    <div class="home-hero">
      <div class="home-logo-wrap">
        <img class="home-logo" src="/MyTreeLibrary.png" :alt="t('home.logoAlt')" />
      </div>
      <template v-if="isAuthenticated">
        <h2 class="home-title">{{ homeTitle }}</h2>
        <p class="muted home-description">
          {{ homeDescription }}
        </p>
      </template>
    </div>

    <p v-if="!auth.isReady" class="status-note">
      {{ t('home.authInitializing') }}
    </p>

    <div v-if="isAuthenticated" class="home-section">
      <div class="actions home-actions">
        <RouterLink class="btn btn-primary" to="/trees/new">{{ t('home.goToCreate') }}</RouterLink>
        <RouterLink class="btn btn-secondary" to="/my-trees">{{ t('home.goToMyTrees') }}</RouterLink>
      </div>
    </div>

    <div v-if="isAdmin" class="home-section">
      <div class="actions home-actions">
        <RouterLink class="btn btn-secondary" to="/admin/masters">
          {{ t('home.goToAdminMasters') }}
        </RouterLink>
        <RouterLink class="btn btn-secondary" to="/admin/subscriptions">
          {{ t('home.goToAdminSubscriptions') }}
        </RouterLink>
      </div>
    </div>

  </section>
</template>
