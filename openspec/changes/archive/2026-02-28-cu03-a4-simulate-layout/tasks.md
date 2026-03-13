## 1. Sidebar — Enlace de Simulación

- [x] 1.1 Añadir `MessageSquare` al import de lucide-react en `apps/web-admin/src/components/layout/sidebar.tsx`
- [x] 1.2 Añadir el ítem `{ href: '/simulate', label: 'Simulación', icon: MessageSquare }` al array `navItems` en `sidebar.tsx`
- [x] 1.3 Verificar que `pathname.startsWith('/simulate')` activa el estilo correcto al navegar a `/simulate`

## 2. API — Función getUsersForSimulate

- [x] 2.1 Añadir `getUsersForSimulate(): Promise<UsersResponse>` al final de `apps/web-admin/src/lib/api.ts` usando `apiFetch('/api/admin/users?limit=100&sort=name&dir=asc')`

## 3. Ruta /simulate — Archivos de segmento

- [x] 3.1 Crear carpeta `apps/web-admin/src/app/simulate/`
- [x] 3.2 Crear `apps/web-admin/src/app/simulate/page.tsx` como Server Component con `export const dynamic = 'force-dynamic'`, llamando a `getStores()` y `getUsersForSimulate()` en paralelo y pasando los datos a `<SimulationPage>`
- [x] 3.3 Crear `apps/web-admin/src/app/simulate/loading.tsx` con skeleton de barra animada (`animate-pulse bg-muted/30`)
- [x] 3.4 Crear `apps/web-admin/src/app/simulate/error.tsx` (Client Component) con mensaje "No se pudo cargar la simulación" y botón "Reintentar" siguiendo el patrón de `/orders/error.tsx`

## 4. Componentes de Simulación

- [x] 4.1 Crear carpeta `apps/web-admin/src/components/simulate/`
- [x] 4.2 Crear `apps/web-admin/src/components/simulate/order-summary-bar.tsx` con import de `Button` desde `@/components/ui/button`, mostrando título, resumen condicional y botones "Cambiar pedido" / "Nueva Simulación"
- [x] 4.3 Crear `apps/web-admin/src/components/simulate/simulation-empty-state.tsx` con `MessageSquare` (lucide-react), texto "Ninguna simulación activa", subtexto y botón "+ Nueva Simulación"
- [x] 4.4 Crear placeholder `apps/web-admin/src/components/simulate/order-config-modal.tsx` con `export function OrderConfigModal() { return null; }` para evitar error de import (será implementado en CU03-A5)
- [x] 4.5 Crear `apps/web-admin/src/components/simulate/simulation-page.tsx` como Client Component con `useState` para `activeConversation` y `modalOpen`, composición de `OrderSummaryBar`, `SimulationEmptyState`, zona C condicional y `OrderConfigModal`

## 5. Verificación Visual

- [x] 5.1 Arrancar `pnpm dev` en `apps/web-admin` y navegar a `/simulate` — verificar que el layout vertical ocupa `h-full` sin scroll extra en el contenedor raíz
- [x] 5.2 Verificar que la Zona B con estado vacío (`SimulationEmptyState`) está centrada vertical y horizontalmente
- [x] 5.3 Verificar que el enlace "Simulación" en el sidebar se marca como activo al estar en `/simulate` y se desactiva al navegar a `/orders` o `/users`
- [x] 5.4 Verificar que `loading.tsx` se muestra brevemente al navegar a `/simulate` (puede requerir throttling de red en DevTools)
