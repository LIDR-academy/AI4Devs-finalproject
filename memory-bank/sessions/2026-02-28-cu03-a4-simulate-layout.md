# Sesión 2026-02-28: CU03-A4 — Layout /simulate y enlace en Sidebar — Completado

> **Change**: `cu03-a4-simulate-layout`  
> **Estado**: ✅ Completado y verificado (17/17 tareas + sugerencias S1/S2 resueltas) — pendiente de `/opsx-archive`

## Resumen

Implementación de la estructura visual de la sección "Simulación" en el Dashboard Admin (`apps/web-admin`). Incluye: enlace en el sidebar, ruta `/simulate` con Server Component que precarga datos en SSR, layout vertical de 3 zonas (barra de resumen, área de chat scrollable, input condicional), estado vacío de la zona B, y placeholder de `OrderConfigModal` con el contrato de tipos completo listo para CU03-A5.

---

## Completado

### Sidebar

- **`apps/web-admin/src/components/layout/sidebar.tsx`** (modificado):
  - `MessageSquare` añadido a imports de `lucide-react`
  - Nuevo ítem `{ href: '/simulate', label: 'Simulación', icon: MessageSquare }` en `navItems`
  - La lógica `pathname.startsWith(href)` existente activa el estilo correctamente

### API

- **`apps/web-admin/src/lib/api.ts`** (modificado):
  - Nueva función `getUsersForSimulate(): Promise<UsersResponse>` — reutiliza `UsersResponse` ya importado, llama a `GET /api/admin/users?limit=100&sortBy=name&sortDir=asc`

### Ruta `/simulate`

- **`apps/web-admin/src/app/simulate/page.tsx`** (nuevo):
  - Server Component con `export const dynamic = 'force-dynamic'` y `export const metadata = { title: 'Simulación | Adresles Admin' }`
  - `Promise.all([getStores(), getUsersForSimulate()])` para precarga paralela en SSR
  - Props `stores` y `users` pasadas a `<SimulationPage>`
- **`apps/web-admin/src/app/simulate/loading.tsx`** (nuevo): skeleton con barra animada `animate-pulse bg-muted/30`
- **`apps/web-admin/src/app/simulate/error.tsx`** (nuevo): Client Component, mensaje "No se pudo cargar la simulación" + botón "Reintentar", patrón idéntico a `/orders/error.tsx`

### Componentes

- **`apps/web-admin/src/components/simulate/order-summary-bar.tsx`** (nuevo):
  - Zona A — siempre visible, título "Simulación de Compras"
  - Resumen y botón "Cambiar pedido" condicionales a `summary !== null`
- **`apps/web-admin/src/components/simulate/simulation-empty-state.tsx`** (nuevo):
  - Zona B (estado vacío) — `MessageSquare` + "Ninguna simulación activa" + botón "Nueva Simulación"
  - Centrado con `flex flex-col items-center justify-center h-full` (sin `py-*` extra)
- **`apps/web-admin/src/components/simulate/order-config-modal.tsx`** (nuevo):
  - Placeholder que devuelve `null`; interface `OrderConfigModalProps` completo con `onConversationStarted` — contrato fijado para CU03-A5
- **`apps/web-admin/src/components/simulate/simulation-page.tsx`** (nuevo):
  - Client Component raíz con `useState` para `activeConversation` y `modalOpen`
  - Composición de las 3 zonas (A: `OrderSummaryBar`, B: `SimulationEmptyState`/placeholder CU03-A6, C: condicional a `activeConversation`)

---

## Tests

Sin tests unitarios en esta tarea — layout puro sin lógica de negocio. Los tests de integración/E2E se añadirán en CU03-A6 cuando el flujo completo esté operativo.

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **SSR preload de stores + users en `page.tsx`** (vs. fetch en cliente) | El modal de CU03-A5 necesita ambas listas al abrirse; precargando en SSR el modal se abre sin latencia adicional |
| **`useState` local (vs. Zustand)** para `activeConversation` y `modalOpen` | Estado puramente local a la página, no compartido con ninguna otra parte de la app |
| **Placeholder `OrderConfigModal` con interface completo** | Fija el contrato `onConversationStarted(data: { conversationId, orderId, summary })` antes de CU03-A5; `simulation-page.tsx` no necesitará modificarse |
| **`metadata` por página con separador `|`** | Patrón ya establecido en `/orders` y `/users`; `/simulate` lo adopta y es consistente con el resto |

---

## Errores Encontrados y Resueltos

| Error | Causa | Solución |
|-------|-------|----------|
| `API error 400: /api/admin/users?limit=100&sort=name&dir=asc` | `getUsersForSimulate()` usaba los parámetros incorrectos `sort=` y `dir=` en lugar del esquema real del endpoint | Corrección a `sortBy=name&sortDir=asc` (consistente con `getUsers()` en el mismo archivo) |
| Separador `—` en `metadata.title` de `/simulate` | Se usó em dash en lugar del separador `|` que usan `/orders` y `/users` | Cambiado a `'Simulación \| Adresles Admin'` |

---

## Archivos Creados/Modificados

```
apps/web-admin/src/
├── components/layout/
│   └── sidebar.tsx                    # Modificado — MessageSquare + ítem Simulación
├── lib/
│   └── api.ts                         # Modificado — getUsersForSimulate()
├── app/simulate/                      # Nuevo directorio
│   ├── page.tsx                       # Nuevo — Server Component SSR + metadata
│   ├── loading.tsx                    # Nuevo — skeleton animado
│   └── error.tsx                      # Nuevo — error boundary con Reintentar
└── components/simulate/               # Nuevo directorio
    ├── simulation-page.tsx            # Nuevo — Client Component raíz (useState)
    ├── order-summary-bar.tsx          # Nuevo — Zona A
    ├── simulation-empty-state.tsx     # Nuevo — Zona B (estado vacío)
    └── order-config-modal.tsx         # Nuevo — Placeholder CU03-A5 (interface completo)

openspec/changes/cu03-a4-simulate-layout/
└── (todos los artefactos + tasks.md 17/17 completadas)
```

---

## Notas para CU03-A5

`order-config-modal.tsx` ya tiene el interface completo:
```typescript
interface OrderConfigModalProps {
  open: boolean;
  onClose: () => void;
  stores: SimulateStore[];
  users: AdminUser[];
  onConversationStarted: (data: {
    conversationId: string;
    orderId: string;
    summary: string;
  }) => void;
}
```
CU03-A5 solo necesita implementar el cuerpo del modal. `simulation-page.tsx` no requiere modificaciones.

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [CU03-A4 Simulate Layout](b31e7bff-1e1e-4284-9064-abed8e1e9e00)
