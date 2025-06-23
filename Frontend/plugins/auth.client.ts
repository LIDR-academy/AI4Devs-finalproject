/**
 * Plugin para verificar la autenticación al cargar la aplicación
 * Este plugin se ejecuta solo en el lado del cliente
 * Fuerza a los usuarios no autenticados a ir a la página de login
 */

import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Obtener el store de autenticación
  const authStore = useAuthStore()
  
  // Verificar la autenticación al cargar la aplicación
  const isAuthenticated = await authStore.checkAuth()
  
  // Obtener el router y la ruta actual
  const router = useRouter()
  const route = useRoute()
  
  // Si no está autenticado y no está en la página de login, redirigir al login
  if (!isAuthenticated && route.path !== '/login') {
    // Usar nextTick para asegurar que la redirección ocurra después de que Vue termine de renderizar
    nextTick(() => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath !== '/' ? route.fullPath : undefined }
      })
    })
  }
})
