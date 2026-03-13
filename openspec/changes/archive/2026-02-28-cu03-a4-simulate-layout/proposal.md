## Why

El Dashboard Admin necesita una sección "Simulación" desde la que el administrador pueda simular conversaciones de compra Adresles sin necesidad de generar pedidos reales. Esta pantalla es el punto de entrada visual del flujo de simulación (CU03) y es prerequisito para los artefactos CU03-A5 (modal de configuración) y CU03-A6 (chat en tiempo real).

## What Changes

- Se añade el ítem "Simulación" con icono `MessageSquare` al sidebar de navegación de `apps/web-admin`
- Se crea la ruta `/simulate` con Server Component que precarga stores y usuarios
- Se implementa el layout vertical de tres zonas (barra de resumen, área de chat, input) usando `flex-col h-full`
- Se crea el estado vacío de la zona B con botón "Nueva Simulación" centrado
- Se añade la función `getUsersForSimulate()` en `api.ts` para precargar usuarios
- Se crean los archivos de route segment estándar: `loading.tsx` y `error.tsx`

## Capabilities

### New Capabilities

- `simulate-layout`: Estructura visual de la página `/simulate` del Dashboard Admin — sidebar link, layout vertical de 3 zonas y estado vacío. Es la capa de presentación del flujo de simulación; no incluye lógica de negocio (modal ni chat).

### Modified Capabilities

_(ninguna — no cambia ninguna especificación existente)_

## Impact

- **Archivos modificados**: `apps/web-admin/src/components/layout/sidebar.tsx`, `apps/web-admin/src/lib/api.ts`
- **Archivos nuevos**: `apps/web-admin/src/app/simulate/page.tsx`, `loading.tsx`, `error.tsx`; `apps/web-admin/src/components/simulate/simulation-page.tsx`, `order-summary-bar.tsx`, `simulation-empty-state.tsx`
- **Dependencias**: lucide-react (`MessageSquare` ya disponible), `@/components/ui/button` (ya disponible)
- **APIs consumidas**: `GET /api/admin/stores` (ya implementado CU03-A1), `GET /api/admin/users?limit=100` (endpoint existente)
- **Rollback**: Los cambios en `sidebar.tsx` y `api.ts` son aditivos; eliminar el ítem de `navItems` y la función `getUsersForSimulate()` restaura el estado anterior sin efectos secundarios.
