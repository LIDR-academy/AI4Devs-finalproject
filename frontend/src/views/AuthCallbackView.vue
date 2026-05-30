<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth/oidc'

const router = useRouter()
const errorMessage = ref('')
const { t } = useI18n()

onMounted(async () => {
  try {
    const user = await authService.completeLogin()
    const returnPath = (user.state as { returnPath?: string } | null)?.returnPath ?? '/'
    await router.replace(returnPath)
  } catch {
    errorMessage.value = t('authCallback.error')
  }
})
</script>

<template>
  <div class="auth-flow-page">
    <header class="page-header auth-flow-page__header">
      <h1 class="page-header__title">{{ t('authCallback.title') }}</h1>
      <p v-if="!errorMessage" class="page-header__description">{{ t('authCallback.validating') }}</p>
    </header>
    <p v-if="!errorMessage" class="status-note" role="status">{{ t('authCallback.processing') }}</p>
    <p v-else class="error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
