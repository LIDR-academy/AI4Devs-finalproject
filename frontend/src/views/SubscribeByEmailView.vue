<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { usePublicSubscriptionForm } from '@/composables/usePublicSubscriptionForm'

const route = useRoute()
const { t } = useI18n()
const { email, isSubmitting, successEmail, errorMessage, submit, resetForm, clearStatus } =
  usePublicSubscriptionForm()

const pageTitleKey = computed(() => {
  const metaTitle = route.meta.pageTitleKey
  return typeof metaTitle === 'string' ? metaTitle : 'subscriptionNew.title'
})

function onEmailInput(): void {
  if (errorMessage.value || successEmail.value) {
    clearStatus()
  }
}
</script>

<template>
  <section class="card form-card">
    <h2>{{ t(pageTitleKey) }}</h2>
    <p class="muted">{{ t('subscriptionNew.intro') }}</p>

    <template v-if="successEmail">
      <div class="tree-form" role="region" :aria-label="t('subscriptionNew.title')">
        <output class="success field-full" aria-live="polite">{{
          t('subscriptionNew.success', { email: successEmail })
        }}</output>
        <div class="field-full actions">
          <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">{{ t('subscriptionNew.cancel') }}</RouterLink>
          <button type="button" class="btn btn-primary tree-form-submit" @click="resetForm">
            {{ t('subscriptionNew.subscribeAnother') }}
          </button>
        </div>
      </div>
    </template>

    <form v-else class="tree-form" @submit.prevent="submit">
      <div class="field field-full">
        <label class="form-label" for="subscription-email">{{ t('subscriptionNew.fields.email.label') }}</label>
        <input
          id="subscription-email"
          v-model="email"
          class="form-control"
          type="email"
          name="email"
          autocomplete="email"
          maxlength="320"
          required
          :disabled="isSubmitting"
          :placeholder="t('subscriptionNew.fields.email.placeholder')"
          @input="onEmailInput"
        />
      </div>

      <p v-if="errorMessage" class="error field-full" role="alert">{{ errorMessage }}</p>

      <div class="field-full actions">
        <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">{{ t('subscriptionNew.cancel') }}</RouterLink>
        <button type="submit" class="btn btn-primary tree-form-submit" :disabled="isSubmitting">
          {{ isSubmitting ? t('subscriptionNew.submitting') : t('subscriptionNew.submit') }}
        </button>
      </div>
    </form>
  </section>
</template>
