# CU03-A4 — Ruta /simulate: layout vertical y enlace en sidebar

**App**: `apps/web-admin` (Next.js 16 — App Router)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-A1 completado (función `getStores()` disponible)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** tener una sección "Simulación" accesible desde el sidebar,  
**para** poder simular conversaciones de compra Adresles y probar el comportamiento del agente.

---

## Descripción funcional

### Enlace en el sidebar

Se añade un nuevo ítem de navegación "Simulación" al sidebar, con un icono adecuado (`MessageSquare` de lucide-react). El enlace activa el estilo activo cuando la ruta empieza por `/simulate`.

### Layout de la página `/simulate`

La página tiene un layout **vertical** con tres zonas:

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar │             SIMULAR COMPRA ADRESLES            │
│         │                                                 │
│         │  ┌──────────────────────────────────────────┐  │  ← zona A: barra fija
│         │  │  RESUMEN DEL PEDIDO CONFIGURADO          │  │    altura: auto (~80px)
│         │  │  Tienda: ModaMujer · Ana García · ADRES. │  │
│         │  │  [✎ Cambiar pedido]  [+ Nueva simulación]│  │
│         │  └──────────────────────────────────────────┘  │
│         │                                                 │
│         │  ┌──────────────────────────────────────────┐  │  ← zona B: scrollable
│         │  │  (burbujas de chat)                      │  │    flex-1, overflow-y-auto
│         │  │                                          │  │
│         │  │  (estado inicial: botón centrado)        │  │
│         │  └──────────────────────────────────────────┘  │
│         │                                                 │
│         │  ┌──────────────────────────── [Enviar ▶] ──┐  │  ← zona C: fija en pie
│         │  │  Escribe tu respuesta...                  │  │    visible solo con conversación activa
│         │  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Zona A (barra de resumen)**: siempre visible. Muestra el resumen del pedido activo (tienda, comprador, modo) y los botones "Cambiar pedido" y "Nueva simulación". Cuando no hay conversación activa, muestra solo el botón "Nueva simulación".

**Zona B (área de chat)**: ocupa el espacio restante (`flex-1`), con `overflow-y-auto`. Cuando no hay conversación activa, muestra el estado vacío con un botón central "Nueva Simulación". Cuando hay conversación, muestra las burbujas (implementadas en CU03-A6).

**Zona C (input de respuesta)**: fijo en el pie de página. Solo se muestra cuando hay una conversación activa. Implementado en CU03-A6.

### Estado vacío

Cuando no hay conversación activa, la zona B muestra:

```
┌──────────────────────────────────────────────┐
│                                              │
│         💬                                   │
│   Ninguna simulación activa                  │
│   Configura un pedido para comenzar          │
│                                              │
│        [+ Nueva Simulación]                 │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Arquitectura de la solución

### `apps/web-admin/src/components/layout/sidebar.tsx`

Añadir `MessageSquare` a los imports de lucide-react y un nuevo ítem al array `navItems`:

```typescript
import { ShoppingCart, Users, MessageSquare } from 'lucide-react';

const navItems = [
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/simulate', label: 'Simulación', icon: MessageSquare },
];
```

La lógica `isActive = pathname.startsWith(href)` ya existente en el sidebar es suficiente — `/simulate` no colisiona con ninguna ruta existente.

### `apps/web-admin/src/app/simulate/page.tsx` — Server Component

Precarga stores y users con sus direcciones. Pasa los datos al Client Component raíz.  
Añadir `export const dynamic = 'force-dynamic'` siguiendo el patrón de todas las páginas de datos del proyecto.

```typescript
import { getStores, getUsersForSimulate } from '@/lib/api';
import { SimulationPage } from '@/components/simulate/simulation-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Simulación — Adresles Admin' };

export default async function SimulatePage() {
  const [storesData, usersData] = await Promise.all([
    getStores(),
    getUsersForSimulate(),
  ]);

  return (
    <SimulationPage
      stores={storesData.data}
      users={usersData.data}
    />
  );
}
```

### `apps/web-admin/src/app/simulate/loading.tsx`

```typescript
export default function SimulateLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3 h-16 animate-pulse bg-muted/30" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Cargando simulación...</div>
      </div>
    </div>
  );
}
```

### `apps/web-admin/src/app/simulate/error.tsx`

Sigue el patrón de `/orders/error.tsx` y `/users/error.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SimulateError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Simulate page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        No se pudo cargar la simulación
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Ocurrió un error al obtener los datos. Por favor, inténtalo de nuevo.
      </p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}
```

### `apps/web-admin/src/lib/api.ts` — nueva función `getUsersForSimulate()`

`UsersResponse` ya está importado al inicio del archivo. Solo hay que añadir la nueva función al final:

```typescript
export async function getUsersForSimulate(): Promise<UsersResponse> {
  return apiFetch<UsersResponse>('/api/admin/users?limit=100&sort=name&dir=asc');
}
```

### `apps/web-admin/src/components/simulate/simulation-page.tsx` — Client Component raíz

```typescript
'use client';

import { useState } from 'react';
import { SimulateStore, AdminUser } from '@/types/api';
import { OrderSummaryBar } from './order-summary-bar';
import { SimulationEmptyState } from './simulation-empty-state';
import { OrderConfigModal } from './order-config-modal';

interface SimulationPageProps {
  stores: SimulateStore[];
  users: AdminUser[];
}

export function SimulationPage({ stores, users }: SimulationPageProps) {
  const [activeConversation, setActiveConversation] = useState<{
    conversationId: string;
    orderId: string;
    summary: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Zona A: barra de resumen fija */}
      <OrderSummaryBar
        summary={activeConversation?.summary ?? null}
        onNewSimulation={() => setModalOpen(true)}
        onChangeOrder={() => setModalOpen(true)}
      />

      {/* Zona B: área de chat scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!activeConversation ? (
          <SimulationEmptyState onNewSimulation={() => setModalOpen(true)} />
        ) : (
          // SimulationChat (CU03-A6)
          <div>{/* placeholder para CU03-A6 */}</div>
        )}
      </div>

      {/* Zona C: input fijo (CU03-A6) */}
      {activeConversation && (
        <div className="border-t p-4">
          {/* placeholder para CU03-A6 */}
        </div>
      )}

      {/* Modal de configuración (CU03-A5) */}
      <OrderConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        stores={stores}
        users={users}
        onConversationStarted={(data) => {
          setActiveConversation(data);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
```

### `apps/web-admin/src/components/simulate/order-summary-bar.tsx`

Barra superior fija con el resumen del pedido activo. Cuando no hay pedido, muestra solo el botón "Nueva Simulación".

```typescript
'use client';

import { Button } from '@/components/ui/button';

interface OrderSummaryBarProps {
  summary: string | null;
  onNewSimulation: () => void;
  onChangeOrder: () => void;
}

export function OrderSummaryBar({ summary, onNewSimulation, onChangeOrder }: OrderSummaryBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-3 shrink-0">
      <div>
        <h1 className="text-lg font-semibold">Simulación de Compras</h1>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>
      <div className="flex gap-2">
        {summary && (
          <Button variant="outline" size="sm" onClick={onChangeOrder}>
            ✎ Cambiar pedido
          </Button>
        )}
        <Button size="sm" onClick={onNewSimulation}>
          + Nueva Simulación
        </Button>
      </div>
    </div>
  );
}
```

### `apps/web-admin/src/components/simulate/simulation-empty-state.tsx`

Estado vacío de la zona B. Se renderiza cuando no hay conversación activa.

```typescript
'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationEmptyStateProps {
  onNewSimulation: () => void;
}

export function SimulationEmptyState({ onNewSimulation }: SimulationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8 py-24">
      <MessageSquare className="h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
      <div>
        <p className="text-base font-medium text-foreground">Ninguna simulación activa</p>
        <p className="text-sm text-muted-foreground mt-1">
          Configura un pedido para comenzar
        </p>
      </div>
      <Button onClick={onNewSimulation}>
        + Nueva Simulación
      </Button>
    </div>
  );
}
```

---

## Tests unitarios

Esta tarea implementa únicamente layout y navegación estática (sin lógica de negocio ni llamadas a API en los componentes cliente). **No se requieren tests unitarios en este ticket.** Los tests de integración/E2E que cubren la simulación completa se añadirán en CU03-A6 una vez el flujo completo esté operativo.

---

## Requisitos no funcionales

- **Accesibilidad**: Seguir WCAG 2.1 AA. El icono `MessageSquare` del sidebar debe llevar `aria-hidden="true"`. El heading `<h1>` en `OrderSummaryBar` es el único H1 de la página.
- **`force-dynamic`**: Obligatorio en `page.tsx` para evitar que Vercel cachee el SSR (datos cambian con cada pedido).
- **`h-full` en el layout**: `SimulationPage` usa `flex flex-col h-full`; el contenedor padre (layout de la app) ya debe tener `h-screen` o `flex-1`. Verificar que el layout raíz en `app/layout.tsx` soporta esto (ya lo hace en el diseño actual con `flex-1`).

---

## Lista de tareas

- [ ] Añadir `MessageSquare` a imports de lucide-react y un nuevo ítem al array `navItems` en `sidebar.tsx`
- [ ] Crear carpeta `apps/web-admin/src/app/simulate/`
- [ ] Crear `apps/web-admin/src/app/simulate/page.tsx` (Server Component con `force-dynamic`, precarga stores y users)
- [ ] Crear `apps/web-admin/src/app/simulate/loading.tsx`
- [ ] Crear `apps/web-admin/src/app/simulate/error.tsx` (patrón igual a `/orders/error.tsx`)
- [ ] Añadir función `getUsersForSimulate()` al final de `apps/web-admin/src/lib/api.ts` (reutiliza `UsersResponse` ya importado)
- [ ] Crear carpeta `apps/web-admin/src/components/simulate/`
- [ ] Crear `apps/web-admin/src/components/simulate/simulation-page.tsx` (Client Component raíz con estado)
- [ ] Crear `apps/web-admin/src/components/simulate/order-summary-bar.tsx` (barra fija superior con import de `Button`)
- [ ] Crear `apps/web-admin/src/components/simulate/simulation-empty-state.tsx` (estado vacío con `MessageSquare` + `Button`)
- [ ] Verificar que el enlace del sidebar navega a `/simulate` y se marca como activo correctamente
- [ ] Verificar que el layout vertical (`flex-col`, `flex-1`, `overflow-y-auto`) funciona correctamente en pantalla completa
