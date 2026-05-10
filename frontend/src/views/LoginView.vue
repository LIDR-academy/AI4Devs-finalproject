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
  <section class="card">
    <h2>{{ t('login.title') }}</h2>
    <p class="muted">{{ t('login.description') }}</p>
  </section>
</template>
