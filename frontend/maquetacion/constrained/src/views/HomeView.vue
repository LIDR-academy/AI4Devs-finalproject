<template>
  <v-container fluid class="pa-0">
    <!-- Hero image based on provided attachment URL. Decision: use as a visual placeholder requested by the user. -->
    <v-img
      src="https://cdn.builder.io/api/v1/image/assets%2Ff97eae8776df4d49a24df28334ac26db%2Fd305aa74ae15424ea2d82c56cfe320ff?format=webp&width=1600"
      alt="Hero"
      height="480"
      cover
      class="elevation-0"
    >
      <v-container class="fill-height d-flex align-center justify-center">
        <h1 class="text-h4 text-md-h2 font-weight-medium text-white text-center text-shadow">
          {{ t('hero.title') }}
        </h1>
      </v-container>
    </v-img>
  </v-container>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.text-shadow {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
</style>
