export default defineNuxtPlugin((nuxtApp) => {
  // Initialize settings on app start
  const settingsStore = useSettingsStore()
  
  // Load settings from localStorage if available
  if (process.client) {
    settingsStore.loadSettings()
  }
})
