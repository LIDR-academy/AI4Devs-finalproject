<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import PageBackLink from '@/components/layout/PageBackLink.vue'
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
  <div class="tree-form-page subscription-page">
    <header class="page-header tree-form-page__header">
      <PageBackLink :to="{ name: 'home' }">{{ t('navigation.home') }}</PageBackLink>
      <h1 class="page-header__title">{{ t(pageTitleKey) }}</h1>
      <p class="page-header__description">{{ t('subscriptionNew.intro') }}</p>
    </header>

    <template v-if="successEmail">
      <div class="tree-form" role="region" :aria-label="t('subscriptionNew.title')">
        <output class="success tree-form-page__flash" aria-live="polite">{{
          t('subscriptionNew.success', { email: successEmail })
        }}</output>
        <div class="field-full actions page-actions-footer">
          <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">
            {{ t('navigation.home') }}
          </RouterLink>
          <button type="button" class="btn btn-primary tree-form-submit" @click="resetForm">
            {{ t('subscriptionNew.subscribeAnother') }}
          </button>
        </div>
      </div>
    </template>

    <form v-else class="tree-form" @submit.prevent="submit">
      <div class="field-full subscription-form-panel catalog-toolbar__panel">
        <div class="field">
          <label class="form-label" for="subscription-email">{{
            t('subscriptionNew.fields.email.label')
          }}</label>
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
      </div>

      <p v-if="errorMessage" class="error field-full" role="alert">{{ errorMessage }}</p>

      <div class="field-full actions page-actions-footer">
        <RouterLink class="btn btn-secondary" :to="{ name: 'home' }">
          {{ t('navigation.home') }}
        </RouterLink>
        <button type="submit" class="btn btn-primary tree-form-submit" :disabled="isSubmitting">
          {{ isSubmitting ? t('subscriptionNew.submitting') : t('subscriptionNew.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>
