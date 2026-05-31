<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'

defineProps<{
  to: RouteLocationRaw
}>()

const { t } = useI18n()
</script>

<template>
  <nav class="page-header__nav" :aria-label="t('navigation.pageBackNavAria')">
    <RouterLink class="page-back-link" :to="to">
      <slot />
    </RouterLink>
  </nav>
</template>
