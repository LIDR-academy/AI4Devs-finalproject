import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01', // ✅ Movido al nivel raíz
  app: {
    baseURL: '/consultcore/',
    buildAssetsDir: '_nuxt/',
    cdnURL: 'https://rrdeveloper.sytes.net/consultcore',
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
  ssr: false,
  nitro: {
    // compatibilityDate removido de aquí
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/login',
        '/logout'
      ]
    },
    publicAssets: [
      {
        baseURL: 'consultcore/_nuxt',
        dir: '.nuxt/dist/client'
      }
    ]
  },
  experimental: {
    typescriptBundlerResolution: false
  },
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode"
  ],
  css: [
    "~/assets/css/main.css",
    "notivue/notification.css", // Estilos para el componente <Notification />
    "notivue/animations.css", // Animaciones predeterminadas
  ],
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
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://rrdeveloper.sytes.net/consultoriaAPI/api',
      authTokenKey: process.env.NUXT_PUBLIC_AUTH_TOKEN_KEY || 'auth-token',
    },
  },
  // Las reglas de ruta deben configurarse de otra manera, ya que 'middleware' no es una propiedad válida en routeRules
  // Configuración alternativa usando router middleware en app/router.options.ts
  routeRules: {
    '/**': { },
    '/login': { }
  },
});