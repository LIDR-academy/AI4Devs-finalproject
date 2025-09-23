<template>
  <v-container class="py-16">
    <v-row align="center" justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="text-h4 text-md-h3 mb-2">{{ t('placeholder.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis">{{ t('placeholder.description') }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
