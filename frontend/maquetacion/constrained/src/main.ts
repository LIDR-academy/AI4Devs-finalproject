import './assets/main.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import router from '@/router'
import { createI18n } from 'vue-i18n'
import es from '@/locales/es.json'
import en from '@/locales/en.json'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0077b6', // honolulu-blue
          federalBlue: '#03045e',
          honoluluBlue: '#0077b6',
          pacificCyan: '#00b4d8',
          nonPhotoBlue: '#90e0ef',
          lightCyan: '#caf0f8',
        },
      },
    },
  },
  icons: { defaultSet: 'mdi' },
})

const i18n = createI18n({
  locale: 'es',
  fallbackLocale: 'en',
  legacy: false,
  messages: { es, en },
})

createApp(App).use(vuetify).use(router).use(i18n).mount('#app')
