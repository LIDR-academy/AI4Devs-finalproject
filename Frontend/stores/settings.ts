import { defineStore } from 'pinia'

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  mode: 'light' | 'dark'
}

export interface AppSettings {
  theme: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  dashboard: {
    defaultView: string
    refreshInterval: number
    showAnimations: boolean
  }
  sidebar: {
    collapsed: boolean
    position: 'left' | 'right'
  }
}

export interface SettingsState {
  currentTheme: Theme
  availableThemes: Theme[]
  settings: AppSettings
  loading: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    currentTheme: {
      id: 'bga-blue',
      name: 'BGA Azul',
      colors: {
        primary: '#0ea5e9',
        secondary: '#eab308',
        accent: '#22c55e',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      mode: 'light'
    },
    availableThemes: [
      {
        id: 'bga-blue',
        name: 'BGA Azul',
        colors: {
          primary: '#0ea5e9',
          secondary: '#eab308',
          accent: '#22c55e',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#1e293b',
          textSecondary: '#64748b'
        },
        mode: 'light'
      },
      {
        id: 'bga-dark',
        name: 'BGA Oscuro',
        colors: {
          primary: '#0ea5e9',
          secondary: '#eab308',
          accent: '#22c55e',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#94a3b8'
        },
        mode: 'dark'
      },
      {
        id: 'purple-theme',
        name: 'Púrpura Moderno',
        colors: {
          primary: '#a855f7',
          secondary: '#ec4899',
          accent: '#06b6d4',
          background: '#faf5ff',
          surface: '#ffffff',
          text: '#1e293b',
          textSecondary: '#64748b'
        },
        mode: 'light'
      },
      {
        id: 'emerald-theme',
        name: 'Esmeralda',
        colors: {
          primary: '#10b981',
          secondary: '#f59e0b',
          accent: '#8b5cf6',
          background: '#ecfdf5',
          surface: '#ffffff',
          text: '#1e293b',
          textSecondary: '#64748b'
        },
        mode: 'light'
      },
      {
        id: 'corporate-theme',
        name: 'Corporativo',
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#3b82f6',
          background: '#f9fafb',
          surface: '#ffffff',
          text: '#111827',
          textSecondary: '#6b7280'
        },
        mode: 'light'
      }
    ],
    settings: {
      theme: 'bga-blue',
      language: 'es',
      notifications: {
        email: true,
        push: true,
        desktop: false
      },
      dashboard: {
        defaultView: 'overview',
        refreshInterval: 30000,
        showAnimations: true
      },
      sidebar: {
        collapsed: false,
        position: 'left'
      }
    },
    loading: false
  }),

  getters: {
    isDarkMode: (state) => state.currentTheme.mode === 'dark',
    
    themeColors: (state) => state.currentTheme.colors,
    
    sidebarCollapsed: (state) => state.settings.sidebar.collapsed,
    
    notificationsEnabled: (state) => 
      state.settings.notifications.email || 
      state.settings.notifications.push || 
      state.settings.notifications.desktop
  },

  actions: {
    async loadSettings() {
      this.loading = true
      try {
        if (process.client) {
          const savedSettings = localStorage.getItem('app-settings')
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings)
            this.settings = { ...this.settings, ...parsed }
            await this.setTheme(this.settings.theme)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        this.loading = false
      }
    },

    async saveSettings() {
      try {
        if (process.client) {
          localStorage.setItem('app-settings', JSON.stringify(this.settings))
        }
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },

    async setTheme(themeId: string) {
      const theme = this.availableThemes.find(t => t.id === themeId)
      if (theme) {
        this.currentTheme = theme
        this.settings.theme = themeId
        
        if (process.client) {
          // Update CSS custom properties
          const root = document.documentElement
          Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value)
          })
          
          // Update color mode
          if (theme.mode === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        
        await this.saveSettings()
      }
    },

    async updateSettings(updates: Partial<AppSettings>) {
      this.settings = { ...this.settings, ...updates }
      await this.saveSettings()
    },

    async toggleSidebar() {
      this.settings.sidebar.collapsed = !this.settings.sidebar.collapsed
      await this.saveSettings()
    },

    async toggleDarkMode() {
      const currentTheme = this.currentTheme
      const oppositeMode = currentTheme.mode === 'light' ? 'dark' : 'light'
      
      // Find a theme with the opposite mode or create one
      let targetTheme = this.availableThemes.find(t => 
        t.mode === oppositeMode && t.id.includes('bga')
      )
      
      if (!targetTheme) {
        // Create dark/light variant if it doesn't exist
        targetTheme = oppositeMode === 'dark' ? 
          this.availableThemes.find(t => t.id === 'bga-dark') :
          this.availableThemes.find(t => t.id === 'bga-blue')
      }
      
      if (targetTheme) {
        await this.setTheme(targetTheme.id)
      }
    },

    async resetSettings() {
      this.settings = {
        theme: 'bga-blue',
        language: 'es',
        notifications: {
          email: true,
          push: true,
          desktop: false
        },
        dashboard: {
          defaultView: 'overview',
          refreshInterval: 30000,
          showAnimations: true
        },
        sidebar: {
          collapsed: false,
          position: 'left'
        }
      }
      
      await this.setTheme('bga-blue')
      await this.saveSettings()
    }
  }
})
