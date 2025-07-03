/**
 * plugins/settings.client.ts
 * Plugin para inicializar la configuración de la aplicación
 */

// Importamos las dependencias necesarias
import { defineNuxtPlugin } from 'nuxt/app'
import { useSettingsStore } from '../stores/settings'

export default defineNuxtPlugin((nuxtApp) => {
  // Initialize settings on app start
  const settingsStore = useSettingsStore()
  
  // Load settings from localStorage if available
  if (process.client) {
    settingsStore.loadSettings()
  }
})
