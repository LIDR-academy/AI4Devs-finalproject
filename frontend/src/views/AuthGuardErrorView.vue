<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const auth = useAuth()
const { t } = useI18n()
const retryError = ref('')
const errorReason = computed(() =>
  route.query.reason === 'forbidden' ? 'forbidden' : 'session',
)
const canRetryLogin = computed(() => errorReason.value === 'session')
const descriptionKey = computed(() =>
  errorReason.value === 'forbidden'
    ? 'authGuardError.descriptionForbidden'
    : 'authGuardError.descriptionSession',
)

async function retryLogin(): Promise<void> {
  if (!canRetryLogin.value) {
    return
  }
  retryError.value = ''
  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  try {
    await auth.login(redirectPath)
  } catch {
    retryError.value = t('authGuardError.retryError')
  }
}
</script>

<template>
  <section class="card">
    <h2>{{ t('authGuardError.title') }}</h2>
    <p class="muted">{{ t(descriptionKey) }}</p>

    <div class="actions">
      <button v-if="canRetryLogin" class="btn btn-primary" type="button" @click="retryLogin">
        {{ t('authGuardError.retryCta') }}
      </button>
      <RouterLink class="btn btn-secondary" to="/">
        {{ t('authGuardError.backHomeCta') }}
      </RouterLink>
    </div>

    <p v-if="retryError" class="error" role="alert">{{ retryError }}</p>
  </section>
</template>
