export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Only allow admin and manager roles
  if (!authStore.isAdmin && !authStore.isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Se requieren permisos de administrador o gerente.'
    })
  }
})
