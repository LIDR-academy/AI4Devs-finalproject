/**
 * app/router.options.ts
 * Configuración de opciones del router para Nuxt 3
 */

import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig> {
  routes: (_routes) => _routes,
  // Configuración global de middleware para todas las rutas
  // Esto reemplaza la configuración anterior en routeRules
  middleware: ['auth']
}
