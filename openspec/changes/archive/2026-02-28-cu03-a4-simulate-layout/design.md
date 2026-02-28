## Context

El Dashboard Admin (Next.js 16, App Router) ya tiene rutas `/orders` y `/users` con el patrón: Server Component → precarga datos → pasa props a Client Component raíz. La nueva ruta `/simulate` sigue exactamente el mismo patrón.

El layout raíz de la app en `app/layout.tsx` ya envuelve el contenido en un contenedor `flex h-screen` con el sidebar a la izquierda y `<main className="flex-1 overflow-y-auto">` a la derecha. La zona de contenido ya tiene la altura correcta; los componentes de `/simulate` solo deben usar `h-full` para aprovecharla.

Esta tarea implementa **únicamente la capa de presentación**: estructura visual, navegación y estado vacío. No introduce lógica de simulación (eso es CU03-A5 y CU03-A6).

## Goals / Non-Goals

**Goals:**
- Añadir el enlace "Simulación" al sidebar con activación correcta por `pathname.startsWith('/simulate')`
- Crear el layout vertical de `/simulate` con tres zonas (A: barra fija, B: scrollable, C: fijo en pie)
- Mostrar el estado vacío (zona B) con botón "Nueva Simulación" cuando no hay conversación activa
- Precargar stores y usuarios en el Server Component para que CU03-A5 tenga los datos disponibles sin fetch adicional

**Non-Goals:**
- Modal de configuración de pedido (CU03-A5)
- Burbujas de chat y input de respuesta (CU03-A6)
- SSE / tiempo real (ya implementado en CU03-A2)
- Persistencia de estado de simulación entre navegaciones

## Decisions

### D1: Precargar usuarios en el Server Component (vs. fetch en Client Component)

**Decisión**: `getUsersForSimulate()` se llama en `page.tsx` y los datos se pasan como props al Client Component, igual que `getStores()`.

**Rationale**: El modal de CU03-A5 necesita la lista completa de usuarios para el selector. Si el fetch se hiciera en el cliente, habría un loading spinner extra al abrir el modal. Precargando en SSR el modal se abre instantáneamente.

**Alternativa descartada**: Fetch en el cliente con TanStack Query — añade complejidad innecesaria cuando los datos son estáticos para la sesión de simulación.

### D2: Estado de conversación activa en `simulation-page.tsx` (vs. Zustand global)

**Decisión**: `useState` local en `SimulationPage` para `activeConversation` y `modalOpen`.

**Rationale**: El estado de simulación es local a la página y no se comparte con ninguna otra parte de la app. Zustand añade indirección sin beneficio.

**Alternativa descartada**: Contexto React o Zustand — sobrecarga innecesaria para estado puramente local.

### D3: `OrderConfigModal` como placeholder en esta tarea

**Decisión**: `simulation-page.tsx` importa `OrderConfigModal` pero en esta tarea el componente no existe aún (se crea en CU03-A5). Se renderiza condicionalmente con `modalOpen` y los tipos ya están definidos.

**Rationale**: Definir la interfaz de `onConversationStarted` ahora permite que CU03-A5 implemente el modal sin modificar `simulation-page.tsx`. El contrato queda fijado en esta tarea.

## Risks / Trade-offs

- **[Riesgo] `OrderConfigModal` no existe al implementar esta tarea** → Mitigación: añadir un placeholder vacío (`export function OrderConfigModal() { return null; }`) en `components/simulate/order-config-modal.tsx` para que el build no falle. CU03-A5 lo reemplaza.

- **[Trade-off] `getUsersForSimulate` usa `limit=100`** → Para MVPs con pocos usuarios es suficiente. Si el número de usuarios crece, se reemplazará por paginación en el modal (CU03-A5 o posterior).

- **[Riesgo] Layout `h-full` no funciona si el contenedor padre no tiene altura definida** → El `app/layout.tsx` existente ya usa `flex-1 overflow-auto` en `<main>`. Verificar que no se ha cambiado antes de implementar.

## Migration Plan

1. Añadir ítem al sidebar (`navItems` en `sidebar.tsx`) — cambio aditivo, sin efectos laterales
2. Crear función `getUsersForSimulate()` en `api.ts` — cambio aditivo
3. Crear todos los archivos nuevos bajo `app/simulate/` y `components/simulate/`
4. Crear placeholder `order-config-modal.tsx` para evitar error de import

**Rollback**: eliminar los archivos nuevos y revertir el ítem del sidebar en `navItems`. Sin migraciones de base de datos ni cambios de API.
