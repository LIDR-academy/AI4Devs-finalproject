/**
 * Middleware global para funcionalidades comunes en toda la aplicación
 * Ya no maneja la autenticación para evitar duplicación con auth.ts
 */

export default defineNuxtRouteMiddleware((to) => {
  // Este middleware ahora solo registra navegación para propósitos de depuración
  // y podría expandirse para otras funcionalidades globales en el futuro
  console.log(`Navegando a: ${to.path}`);
  
  // No realizar ninguna redirección, solo continuar
  return;
})
