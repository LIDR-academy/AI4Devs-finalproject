// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: {
    // Deshabilitamos oxc-parser que está causando problemas
    typescriptBundlerResolution: false
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
  ],
  css: [
    "~/assets/css/main.css",
    "vue-toastification/dist/index.css", // ← Línea 11 reescrita
  ],
  plugins: ["~/plugins/toastification.client.js"],
  colorMode: {
    preference: "light",
    fallback: "light",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storageKey: "nuxt-color-mode",
  },
  app: {
    head: {
      title: "ConsultCore 3:1",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Sistema de Gestión Integral - Consultoría Estratégica",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || "/api",
    },
  },
  
  // Configuración para aplicar middleware de autenticación globalmente
  routeRules: {
    '/**': { middleware: ['auth'] },
    '/login': { middleware: [] } // Excluir la página de login del middleware de autenticación
  },
});
