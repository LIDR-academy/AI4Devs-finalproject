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
  <section class="card">
    <h2>{{ t('authCallback.title') }}</h2>
    <p v-if="!errorMessage" class="muted">{{ t('authCallback.validating') }}</p>
    <p v-else class="error">{{ errorMessage }}</p>
  </section>
</template>
