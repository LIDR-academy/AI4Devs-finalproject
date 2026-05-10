<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()

const pageTitleKey = computed(() => {
  const metaTitle = route.meta.pageTitleKey
  return typeof metaTitle === 'string' ? metaTitle : 'pendingViews.default.title'
})
</script>

<template>
  <section class="card">
    <h2>{{ t(pageTitleKey) }}</h2>
    <p class="muted">{{ t('pendingViews.default.description') }}</p>
    <div class="actions">
      <RouterLink class="btn btn-secondary" to="/">
        {{ t('pendingViews.default.backHome') }}
      </RouterLink>
    </div>
  </section>
</template>
