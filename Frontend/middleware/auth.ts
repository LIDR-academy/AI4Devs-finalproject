/**
 * Middleware de autenticación
 * Verifica si el usuario está autenticado y redirige a la página de login si no lo está
 * Este middleware se aplica a todas las rutas excepto a la página de login
 */

import { useAuthStore } from '~/stores/auth'

// Renombrado para evitar conflictos de nombres
export default defineNuxtRouteMiddleware((to, from) => {
  // Si la ruta es la página de login, permitir el acceso
  if (to.path === '/login') {
    const authStore = useAuthStore()
    
    // Si el usuario ya está autenticado y está intentando acceder a la página de login,
    // redirigirlo a la página principal o a la página a la que intentaba acceder
    if (authStore.isAuthenticated) {
      const redirectPath = to.query.redirect?.toString() || '/'
      return navigateTo(redirectPath)
    }
    
    // Si no está autenticado, permitir el acceso a la página de login
    return
  }
  
  // Para cualquier otra ruta, verificar si el usuario está autenticado
  const authStore = useAuthStore()
  
  // Si no está autenticado, redirigir a la página de login y guardar la URL a la que intentaba acceder
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath !== '/' ? to.fullPath : undefined }
    })
  }
})
