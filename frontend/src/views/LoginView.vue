<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const auth = useAuth()
const { t } = useI18n()

onMounted(async () => {
  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await auth.login(redirectPath)
})
</script>

<template>
  <div class="auth-flow-page">
    <header class="page-header auth-flow-page__header">
      <h1 class="page-header__title">{{ t('login.title') }}</h1>
      <p class="page-header__description">{{ t('login.description') }}</p>
    </header>
    <p class="status-note" role="status">{{ t('login.redirecting') }}</p>
  </div>
</template>
