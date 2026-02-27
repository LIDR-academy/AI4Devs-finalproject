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

### `apps/web-admin/src/app/simulate/page.tsx` — Server Component

Precarga stores y users con sus direcciones. Pasa los datos al Client Component raíz.

```typescript
import { getStores } from '@/lib/api';
import { SimulationPage } from '@/components/simulate/simulation-page';

export const metadata = { title: 'Simulación — Adresles Admin' };

export default async function SimulatePage() {
  const [storesData, usersData] = await Promise.all([
    getStores(),
    getUsersForSimulate(),   // nueva función en api.ts — ver abajo
  ]);

  return (
    <SimulationPage
      stores={storesData.data}
      users={usersData.data}
    />
  );
}
```

### `apps/web-admin/src/lib/api.ts` — nueva función `getUsersForSimulate()`

Reutiliza el endpoint `GET /api/admin/users` existente con `limit=100` para obtener todos los usuarios, incluyendo el conteo de direcciones (ya incluido en `AdminUser._count.addresses`):

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

---

## Lista de tareas

- [ ] Añadir ítem "Simulación" con icono `MessageSquare` al array `navItems` en `sidebar.tsx`
- [ ] Crear carpeta `apps/web-admin/src/app/simulate/`
- [ ] Crear `apps/web-admin/src/app/simulate/page.tsx` (Server Component que precarga stores y users)
- [ ] Crear `apps/web-admin/src/app/simulate/loading.tsx`
- [ ] Añadir función `getUsersForSimulate()` en `apps/web-admin/src/lib/api.ts`
- [ ] Crear carpeta `apps/web-admin/src/components/simulate/`
- [ ] Crear `apps/web-admin/src/components/simulate/simulation-page.tsx` (Client Component raíz con estado)
- [ ] Crear `apps/web-admin/src/components/simulate/order-summary-bar.tsx` (barra fija superior)
- [ ] Implementar estado vacío dentro de `simulation-page.tsx` con botón "Nueva Simulación" centrado
- [ ] Verificar que el enlace del sidebar navega a `/simulate` y se marca como activo correctamente
- [ ] Verificar que el layout vertical (flex-col, flex-1, overflow-y-auto) funciona correctamente en pantalla completa
