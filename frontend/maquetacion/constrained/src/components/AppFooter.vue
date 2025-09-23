<template>
  <v-footer class="text-white" color="federalBlue" padless>
    <v-container class="py-10">
      <v-row class="mb-8" align="center">
        <!-- Left copy -->
        <v-col cols="12" md="4">
          <h3 class="text-h6 mb-2">{{ t('newsletter.title') }}</h3>
          <p class="text-body-2 opacity-90">{{ t('newsletter.subtitle') }}</p>
          <div class="d-flex align-center ga-3 mt-6">
            <v-avatar size="48" color="surface-variant">
              <span>Logo</span>
            </v-avatar>
            <v-btn icon variant="text" class="text-white">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Center newsletter form -->
        <v-col cols="12" md="4" class="text-md-center">
          <v-text-field
            :placeholder="t('newsletter.emailPlaceholder')"
            variant="underlined"
            hide-details
            color="nonPhotoBlue"
          />
        </v-col>

        <!-- Right CTA -->
        <v-col cols="12" md="4" class="text-md-right">
          <v-btn color="pacificCyan" size="large">{{ t('newsletter.cta') }}</v-btn>
        </v-col>
      </v-row>

      <v-divider opacity="0.2" />

      <v-row class="pt-8">
        <v-col cols="12" md="6" lg="4">
          <h4 class="text-subtitle-1 mb-3">{{ t('footer.help') }}</h4>
          <ul class="opacity-90">
            <li><RouterLink to="/help" class="text-white text-decoration-none">{{ t('footer.links.faq') }}</RouterLink></li>
            <li><RouterLink to="/help" class="text-white text-decoration-none">{{ t('footer.links.customerService') }}</RouterLink></li>
            <li><RouterLink to="/help" class="text-white text-decoration-none">{{ t('footer.links.guides') }}</RouterLink></li>
            <li><RouterLink to="/help" class="text-white text-decoration-none">{{ t('footer.links.contact') }}</RouterLink></li>
          </ul>
        </v-col>
        <v-col cols="12" md="6" lg="4">
          <h4 class="text-subtitle-1 mb-3">{{ t('footer.other') }}</h4>
          <ul class="opacity-90">
            <li><RouterLink to="/privacy" class="text-white text-decoration-none">{{ t('footer.links.privacy') }}</RouterLink></li>
            <li><RouterLink to="/sitemap" class="text-white text-decoration-none">{{ t('footer.links.sitemap') }}</RouterLink></li>
            <li><RouterLink to="/subscriptions" class="text-white text-decoration-none">{{ t('footer.links.subscriptions') }}</RouterLink></li>
          </ul>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.opacity-90 {
  opacity: 0.9;
}
</style>
