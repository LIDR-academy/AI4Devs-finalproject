<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
      <p class="text-gray-600 dark:text-gray-400">Personaliza tu experiencia en BGA Business System</p>
    </div>

    <!-- Settings Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="section in settingSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="activeSection === section.id
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <component :is="section.icon" class="w-5 h-5 mr-3" />
            {{ section.name }}
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- Theme Settings -->
        <div v-if="activeSection === 'appearance'" class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Apariencia</h3>
          
          <div class="space-y-6">
            <!-- Theme Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema de Color
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="theme in settingsStore.availableThemes"
                  :key="theme.id"
                  @click="settingsStore.setTheme(theme.id)"
                  class="relative p-4 border-2 rounded-lg cursor-pointer transition-colors"
                  :class="settingsStore.currentTheme.id === theme.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ theme.name }}
                    </h4>
                    <div
                      v-if="settingsStore.currentTheme.id === theme.id"
                      class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <CheckIcon class="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <div
                      v-for="(color, key) in theme.colors"
                      :key="key"
                      class="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
                      :style="{ backgroundColor: color }"
                      v-if="['primary', 'secondary', 'accent'].includes(key)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dark Mode Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modo Oscuro
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Alterna entre tema claro y oscuro
                </p>
              </div>
              <button
                @click="settingsStore.toggleDarkMode()"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.isDarkMode ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <!-- Animations -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Animaciones
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Habilitar animaciones de interfaz
                </p>
              </div>
              <button
                @click="toggleAnimations"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.settings.dashboard.showAnimations ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.settings.dashboard.showAnimations ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeSection === 'notifications'" class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notificaciones</h3>
          
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notificaciones por Email
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones importantes por correo electrónico
                </p>
              </div>
              <button
                @click="toggleEmailNotifications"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.settings.notifications.email ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.settings.notifications.email ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notificaciones Push
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Recibir notificaciones push en el navegador
                </p>
              </div>
              <button
                @click="togglePushNotifications"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.settings.notifications.push ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.settings.notifications.push ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notificaciones de Escritorio
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Mostrar notificaciones en el escritorio
                </p>
              </div>
              <button
                @click="toggleDesktopNotifications"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.settings.notifications.desktop ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.settings.notifications.desktop ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Dashboard Settings -->
        <div v-if="activeSection === 'dashboard'" class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Dashboard</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vista Predeterminada
              </label>
              <select
                v-model="settingsStore.settings.dashboard.defaultView"
                @change="saveDashboardSettings"
                class="input-field"
              >
                <option value="overview">Resumen General</option>
                <option value="projects">Proyectos</option>
                <option value="tasks">Tareas</option>
                <option value="kpis">KPIs</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Intervalo de Actualización
              </label>
              <select
                v-model="dashboardRefreshInterval"
                @change="saveDashboardSettings"
                class="input-field"
              >
                <option :value="15000">15 segundos</option>
                <option :value="30000">30 segundos</option>
                <option :value="60000">1 minuto</option>
                <option :value="300000">5 minutos</option>
                <option :value="0">Manual</option>
              </select>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div v-if="activeSection === 'system'" class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sistema</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma
              </label>
              <select
                v-model="settingsStore.settings.language"
                @change="saveLanguageSettings"
                class="input-field"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sidebar Colapsado
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Mantener la barra lateral colapsada por defecto
                </p>
              </div>
              <button
                @click="settingsStore.toggleSidebar()"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="settingsStore.sidebarCollapsed ? 'bg-primary-600' : 'bg-gray-200'"
              >
                <span
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                  :class="settingsStore.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Acciones del Sistema</h4>
              <div class="space-y-3">
                <button
                  @click="exportSettings"
                  class="w-full btn-secondary text-left"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 mr-2 inline" />
                  Exportar Configuración
                </button>
                <button
                  @click="importSettings"
                  class="w-full btn-secondary text-left"
                >
                  <ArrowUpTrayIcon class="w-4 h-4 mr-2 inline" />
                  Importar Configuración
                </button>
                <button
                  @click="confirmResetSettings"
                  class="w-full btn-danger text-left"
                >
                  <ArrowPathIcon class="w-4 h-4 mr-2 inline" />
                  Restablecer Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="card p-6 m-4 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Restablecer Configuración
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que deseas restablecer toda la configuración a los valores predeterminados? 
          Esta acción no se puede deshacer.
        </p>
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="showResetModal = false"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            @click="resetSettings"
            class="btn-danger"
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PaintBrushIcon,
  BellIcon,
  ComputerDesktopIcon,
  CogIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({
  middleware: 'auth'
})

const settingsStore = useSettingsStore()
const $toast = inject('toast') as any

// Reactive state
const activeSection = ref('appearance')
const showResetModal = ref(false)
const dashboardRefreshInterval = ref(settingsStore.settings.dashboard.refreshInterval)

// Settings sections
const settingSections = [
  { id: 'appearance', name: 'Apariencia', icon: PaintBrushIcon },
  { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
  { id: 'dashboard', name: 'Dashboard', icon: ComputerDesktopIcon },
  { id: 'system', name: 'Sistema', icon: CogIcon }
]

// Methods
const toggleAnimations = async () => {
  await settingsStore.updateSettings({
    dashboard: {
      ...settingsStore.settings.dashboard,
      showAnimations: !settingsStore.settings.dashboard.showAnimations
    }
  })
  $toast?.success('Configuración guardada', 'Las animaciones han sido actualizadas')
}

const toggleEmailNotifications = async () => {
  await settingsStore.updateSettings({
    notifications: {
      ...settingsStore.settings.notifications,
      email: !settingsStore.settings.notifications.email
    }
  })
  $toast?.success('Configuración guardada', 'Las notificaciones por email han sido actualizadas')
}

const togglePushNotifications = async () => {
  await settingsStore.updateSettings({
    notifications: {
      ...settingsStore.settings.notifications,
      push: !settingsStore.settings.notifications.push
    }
  })
  $toast?.success('Configuración guardada', 'Las notificaciones push han sido actualizadas')
}

const toggleDesktopNotifications = async () => {
  await settingsStore.updateSettings({
    notifications: {
      ...settingsStore.settings.notifications,
      desktop: !settingsStore.settings.notifications.desktop
    }
  })
  $toast?.success('Configuración guardada', 'Las notificaciones de escritorio han sido actualizadas')
}

const saveDashboardSettings = async () => {
  await settingsStore.updateSettings({
    dashboard: {
      ...settingsStore.settings.dashboard,
      refreshInterval: dashboardRefreshInterval.value
    }
  })
  $toast?.success('Configuración guardada', 'La configuración del dashboard ha sido actualizada')
}

const saveLanguageSettings = async () => {
  await settingsStore.saveSettings()
  $toast?.success('Configuración guardada', 'El idioma ha sido actualizado')
}

const exportSettings = () => {
  const settings = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    settings: settingsStore.settings,
    theme: settingsStore.currentTheme.id
  }
  
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bga-settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  $toast?.success('Configuración exportada', 'La configuración ha sido descargada')
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const imported = JSON.parse(text)
        
        if (imported.settings && imported.theme) {
          await settingsStore.updateSettings(imported.settings)
          await settingsStore.setTheme(imported.theme)
          $toast?.success('Configuración importada', 'La configuración ha sido restaurada')
        } else {
          $toast?.error('Error', 'Archivo de configuración inválido')
        }
      } catch (error) {
        $toast?.error('Error', 'No se pudo leer el archivo de configuración')
      }
    }
  }
  input.click()
}

const confirmResetSettings = () => {
  showResetModal.value = true
}

const resetSettings = async () => {
  await settingsStore.resetSettings()
  showResetModal.value = false
  $toast?.success('Configuración restablecida', 'Toda la configuración ha sido restablecida a los valores predeterminados')
}

// Initialize
onMounted(() => {
  dashboardRefreshInterval.value = settingsStore.settings.dashboard.refreshInterval
})
</script>
