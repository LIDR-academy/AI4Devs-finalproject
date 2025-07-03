<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <AppSidebar
      :collapsed="settingsStore.sidebarCollapsed"
      @toggle="settingsStore.toggleSidebar()"
    />

    <!-- Main Content -->
    <div
      class="transition-all duration-300 ease-in-out"
      :class="settingsStore.sidebarCollapsed ? 'ml-16' : 'ml-64'"
    >
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Sistema de notificaciones personalizado -->
    <ClientOnly>
      <NotivueWrapper />
    </ClientOnly>

    <!-- Loading Overlay -->
    <AppLoading v-if="isLoading" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeMount } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import { useRoute, useRouter, navigateTo } from '#imports'

// Clave para el token de autenticación (debe coincidir con la del store de auth)
const AUTH_TOKEN_KEY = process.env.NUXT_PUBLIC_AUTH_TOKEN_KEY || 'auth-token'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Estados globales
const isLoading = ref(false)
const authCheckComplete = ref(false)
const isAuthenticating = ref(true) // Nuevo estado para indicar que estamos verificando la autenticación

// Middleware de autenticación para rutas protegidas
const handleAuthentication = async () => {
  // Registrar la ruta actual para depuración
  console.log('Verificando autenticación en ruta:', route.path)
  
  // Si ya estamos en login o logout, no hacemos nada
  if (route.path === '/login' || route.path === '/logout') {
    console.log('Estamos en login/logout, no verificamos autenticación')
    isAuthenticating.value = false
    return
  }
  
  // Si estamos en el índice y ya tenemos token en localStorage, confiar en él inicialmente
  // Esto evita redirecciones innecesarias al actualizar la página en el índice
  if ((route.path === '/' || route.path === '') && typeof window !== 'undefined') {
    const hasToken = localStorage.getItem(AUTH_TOKEN_KEY)
    const hasUser = localStorage.getItem('user')
    
    if (hasToken && hasUser) {
      console.log('Estamos en el índice con token local, confiando en autenticación local')
      // Asegurarnos de que el store tenga los datos cargados
      if (!authStore.isAuthenticated) {
        await authStore.checkAuth()
      }
      
      // Completar la verificación sin redireccionar
      if (!authCheckComplete.value) {
        authCheckComplete.value = true
        isAuthenticating.value = false
      }
      return
    }
  }

  // Si ya completamos la verificación y no estamos autenticados, redirigir al login
  if (authCheckComplete.value && !authStore.isAuthenticated) {
    console.log('Verificación completada, no autenticado, redirigiendo a login')
    navigateTo('/login')
    return
  }

  // Si aún no hemos verificado la autenticación, hacerlo ahora
  if (!authCheckComplete.value) {
    console.log('Primera verificación de autenticación')
    isLoading.value = true
    try {
      // Verificar autenticación
      const isAuthenticated = await authStore.checkAuth()
      console.log('Resultado de verificación:', isAuthenticated ? 'autenticado' : 'no autenticado')

      // Si no estamos autenticados después de verificar, redirigir al login
      if (!isAuthenticated && typeof window !== 'undefined') {
        console.log('No autenticado, redirigiendo a login')
        navigateTo('/login')
        return
      }
    } finally {
      authCheckComplete.value = true
      isLoading.value = false
      isAuthenticating.value = false
    }
  }
}

// Initialize stores
onBeforeMount(async () => {
  // Cargar configuraciones mientras verificamos autenticación
  settingsStore.loadSettings()
})

onMounted(async () => {
  // Verificar autenticación al montar el componente
  await handleAuthentication()
})

// Sistema unificado de protección de rutas
// Monitorea tanto cambios de ruta como cambios en el estado de autenticación

// 1. Observar cambios en la ruta para verificar autenticación al navegar
watch(
  () => route.path,
  async newPath => {
    console.log('Cambio de ruta detectado:', newPath)
    // Ignorar rutas de autenticación
    if (newPath === '/login' || newPath === '/logout') {
      return
    }
    
    // Si no estamos autenticados, verificar autenticación
    if (!authStore.isAuthenticated) {
      console.log('Navegación a ruta protegida sin autenticación, verificando...')
      await handleAuthentication()
    }
  }
)

// 2. Observar cambios en el estado de autenticación para proteger sesión activa
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated, prevValue) => {
    // Solo actuar cuando cambiamos de autenticado a no autenticado
    // y la verificación inicial ya se completó
    if (
      !isAuthenticated &&
      prevValue === true &&
      authCheckComplete.value &&
      !isAuthenticating.value
    ) {
      const currentPath = route.path
      if (currentPath !== '/login' && currentPath !== '/logout') {
        console.log('Pérdida de autenticación detectada, redirigiendo a login')
        navigateTo('/login')
      }
    }
  }
)
</script>
