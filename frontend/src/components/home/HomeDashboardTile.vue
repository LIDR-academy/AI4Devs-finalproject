<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
  title: string
  description: string
  variant?: 'primary' | 'default'
}>()
</script>

<template>
  <RouterLink
    class="home-tile"
    :class="{ 'home-tile--primary': variant === 'primary' }"
    :to="to"
  >
    <span class="home-tile__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="home-tile__main">
      <span class="home-tile__title">{{ title }}</span>
      <span class="home-tile__desc">{{ description }}</span>
    </span>
    <span class="home-tile__chevron" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </RouterLink>
</template>
