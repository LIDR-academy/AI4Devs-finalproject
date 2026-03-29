// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      titleTemplate: '%s | TRACÉ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  components: [
    {
      path: '~/components/common',
      pathPrefix: false,
    },
    '~/components'
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
    }
  },
  build: {
    transpile: ['vee-validate']
  },
  compatibilityDate: '2025-01-25'
})
