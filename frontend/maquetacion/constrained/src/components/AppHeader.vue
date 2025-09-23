<template>
  <div>
    <!-- Top promo bar -->
    <v-system-bar color="primary" height="32" class="text-white d-none d-sm-flex">
      <div class="mx-auto text-caption">
        {{ t('promo.freeShipping') }}
      </div>
    </v-system-bar>

    <!-- Main header -->
    <v-app-bar flat height="72" color="surface" density="comfortable" fixed>
      <v-container class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-3">
          <v-avatar size="36" color="primary">
            <span class="text-white">L</span>
          </v-avatar>
          <RouterLink to="/" class="text-h6 text-high-emphasis text-decoration-none">Logo</RouterLink>
        </div>

        <!-- Centered navigation -->
        <div class="d-none d-md-flex">
          <v-tabs v-model="tab" align-tabs="center" color="primary" slider-color="primary">
            <v-tab :to="{ name: 'shop' }">{{ t('nav.shop') }}</v-tab>
            <v-tab :to="{ name: 'subscribe' }">{{ t('nav.subscribe') }}</v-tab>
            <v-tab :to="{ name: 'about' }">{{ t('nav.about') }}</v-tab>
          </v-tabs>
        </div>

        <!-- Search on the right -->
        <div class="w-50 d-none d-lg-flex">
          <SearchBar :placeholder="t('search.placeholder')" />
        </div>

        <!-- Mobile search icon -->
        <v-btn icon class="d-lg-none" variant="text">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SearchBar from '@/components/SearchBar.vue'

const { t } = useI18n()
const route = useRoute()
const tab = ref<string>('')

watch(
  () => route.name,
  (name) => {
    if (typeof name === 'string') tab.value = name
  },
  { immediate: true }
)
</script>
