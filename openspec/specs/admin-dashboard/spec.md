## ADDED Requirements

### Requirement: Layout con sidebar de navegación
La app SHALL renderizar un layout de dos columnas: sidebar fijo de 264px (`bg-brand-black`) con navegación principal y área de contenido flexible con scroll.

El sidebar SHALL mostrar el wordmark "adresles" en `text-brand-lime` con el tag "admin" en `text-white/30`, dos ítems de navegación con iconos lucide-react (`ShoppingCart` para Pedidos, `Users` para Usuarios) y la versión `v0.1.0` en el footer (`text-white/30 text-xs`).

El ítem activo SHALL marcarse con `border-l-2 border-brand-lime bg-white/5 text-brand-lime`. Los ítems inactivos SHALL tener `text-white/70 hover:bg-white/10 hover:text-white`.

La raíz `/` SHALL redirigir automáticamente a `/orders`.

El layout SHALL incluir un skip link `<a href="#main-content">Saltar al contenido</a>` visible al recibir foco (`sr-only focus:not-sr-only`).

#### Scenario: Navegación a /orders muestra ítem activo
- **WHEN** el usuario navega a `/orders`
- **THEN** el ítem "Pedidos" en el sidebar muestra estado activo: `border-l-2 border-brand-lime bg-white/5 text-brand-lime`

#### Scenario: Redirección desde raíz
- **WHEN** el usuario accede a `/`
- **THEN** es redirigido automáticamente a `/orders`

#### Scenario: Skip link accesible al recibir foco
- **WHEN** el usuario presiona Tab en la primera interacción con la página
- **THEN** el skip link `"Saltar al contenido"` se hace visible y permite saltar al `#main-content`

---

### Requirement: Vista de órdenes con tabla y estados
La página `/orders` SHALL obtener los pedidos vía `GET /api/admin/orders` (Server Component) y renderizarlos en una tabla Shadcn.

**Columnas de la tabla (en orden):**

| Columna | Origen | Notas |
|---------|--------|-------|
| Referencia | `externalOrderNumber` | Fallback: `externalOrderId` si null; ordenable |
| Tienda | `store.name` | Ordenable; subsort por Referencia |
| Usuario | `user.firstName + user.lastName` + `user.phone.e164` | Nombre en línea 1 (`font-medium`), teléfono en línea 2 (`text-xs text-gray-500`); ordenable por nombre completo |
| Importe | `totalAmount` + `currency` | `formatCurrency(totalAmount, currency)`; ordenable |
| Estado | `status` | `<OrderStatusBadge>`; **no ordenable** |
| Modo | `orderMode` | `<OrderModeBadge>`; **no ordenable** |
| Fecha | `webhookReceivedAt` | `formatDate(webhookReceivedAt)`; ordenable |
| Chat | `conversations[0].id` | Icono `MessageSquare` (lucide) visible solo si `conversations.length > 0`; `aria-label="Ver conversación del pedido #[N]"`; **no ordenable** |

**Ordenación**: dinámica vía query params `?sort=<columna>&dir=<asc|desc>`. Por defecto: `date DESC` (más recientes primero). Ver spec `orders-column-sorting` para los requisitos completos de ordenación.

**Filtros**: la tabla SHALL ir precedida de la barra de filtros `OrdersFilterBar`. Ver spec `orders-filters` para los requisitos completos de filtrado y búsqueda.

**Subtítulo de la página**: SHALL mostrar `"N pedido(s) encontrado(s)"` donde N es `meta.total` (total filtrado devuelto por la API), no un texto fijo.

La tabla SHALL mostrar un skeleton de 8 filas durante la carga (`loading.tsx`) y un estado vacío adaptativo:
- Sin pedidos y sin filtros: icono `ShoppingCart` + "Sin pedidos todavía. Cuando se procese un pedido aparecerá aquí."
- Sin resultados con filtros activos: icono `ShoppingCart` + "Sin resultados" + "Prueba a ajustar o limpiar los filtros activos."

**Paleta de badges completa:**
- `PENDING_PAYMENT` → `bg-gray-100 text-gray-600 border-gray-200`
- `PENDING_ADDRESS` → `bg-brand-lime text-brand-black border-brand-lime`
- `READY_TO_PROCESS` → `bg-brand-teal text-white border-brand-teal`
- `COMPLETED` → `bg-emerald-100 text-emerald-700 border-emerald-200`
- `CANCELED` → `bg-red-100 text-red-600 border-red-200`
- `ADRESLES` → `bg-brand-black text-brand-lime border-brand-black`
- `TRADITIONAL` → `bg-gray-100 text-gray-700 border-gray-200`

#### Scenario: Tabla renderiza pedidos correctamente
- **WHEN** el usuario accede a `/orders` y hay pedidos disponibles
- **THEN** la tabla muestra una fila por pedido con las 8 columnas especificadas

#### Scenario: Barra de filtros precede a la tabla
- **WHEN** el usuario accede a `/orders`
- **THEN** se muestra la barra de filtros (`OrdersFilterBar`) encima de la tabla

#### Scenario: Subtítulo muestra el conteo filtrado
- **WHEN** hay 3 pedidos con `status=COMPLETED` de un total de 10 y el filtro de estado está activo
- **THEN** el subtítulo muestra "3 pedidos encontrados"

#### Scenario: Icono de chat solo aparece en pedidos con conversación
- **WHEN** un pedido tiene `conversations.length > 0`
- **THEN** se muestra el icono `MessageSquare` con `aria-label` y enlace a `/conversations/[id]`

#### Scenario: Pedido sin conversación no muestra icono de chat
- **WHEN** un pedido tiene `conversations.length === 0`
- **THEN** la celda de chat está vacía (sin icono ni enlace)

#### Scenario: Estado vacío sin filtros activos
- **WHEN** la API devuelve `data: []` y no hay filtros activos
- **THEN** se muestra el componente `OrdersEmptyState` con mensaje "Sin pedidos todavía. Cuando se procese un pedido aparecerá aquí."

#### Scenario: Estado vacío con filtros activos
- **WHEN** la API devuelve `data: []` y hay al menos un filtro activo
- **THEN** se muestra el componente `OrdersEmptyState` con mensaje "Sin resultados" y "Prueba a ajustar o limpiar los filtros activos."

#### Scenario: Skeleton durante carga
- **WHEN** la página está cargando datos de la API
- **THEN** se muestra el skeleton de 8 filas (`loading.tsx`) con `<Skeleton>` en cada celda

---

### Requirement: Vista de usuarios con badge registrado/no registrado
La página `/users` SHALL obtener los usuarios vía `GET /api/admin/users` (Server Component) y renderizarlos en una tabla Shadcn.

**Columnas de la tabla (en orden):**

| Columna | Origen | Notas |
|---------|--------|-------|
| Nombre | `firstName + lastName` | `formatFullName(firstName, lastName)` — "—" si ambos null |
| Teléfono | `phone.e164` | `formatPhone(e164)` |
| Email | `email` | "—" si null |
| Registrado | `isRegistered` | `<UserRegisteredBadge>` |
| Pedidos | `_count.orders` | Número entero |
| Direcciones | `_count.addresses` | Número entero |
| Última interacción | `lastInteractionAt` | `formatRelativeDate()` — "Hace 2h"; tooltip con fecha absoluta; "—" si null |

**Filtro**: solo usuarios con `isDeleted = false` (aplicado en backend).
**Ordenación**: por `lastInteractionAt` descendente (nulos al final).

La columna "Registrado" SHALL usar `UserRegisteredBadge`:
- `isRegistered = true` → `bg-brand-teal/10 text-brand-teal` — texto "Sí"
- `isRegistered = false` → `bg-gray-100 text-gray-500` — texto "No"

#### Scenario: Tabla renderiza usuarios correctamente
- **WHEN** el usuario accede a `/users` y hay usuarios disponibles
- **THEN** la tabla muestra una fila por usuario con las 7 columnas especificadas

#### Scenario: Badge registrado
- **WHEN** `isRegistered = true`
- **THEN** el badge muestra "Sí" con fondo `bg-brand-teal/10`

#### Scenario: Badge no registrado
- **WHEN** `isRegistered = false`
- **THEN** el badge muestra "No" con fondo `bg-gray-100`

#### Scenario: Estado vacío cuando no hay usuarios
- **WHEN** la API devuelve `data: []`
- **THEN** se muestra `UsersEmptyState` con icono `Users` y mensaje informativo

---

### Requirement: Reproductor de conversación tipo burbuja
La página `/conversations/[conversationId]` SHALL obtener los mensajes vía `GET /api/admin/conversations/:id/messages` (Server Component) y renderizarlos como burbujas de chat.

**Header de la página** (`bg-brand-black text-white`):
```
← Pedido #[externalOrderNumber]    [conversationType badge]    [status badge]
Iniciada: [startedAt] · Completada: [completedAt o "En curso"]
```
- El botón `← Pedido` usa `<Link href="/orders">` + clase `text-brand-teal hover:underline`
- `conversationType` valores: `GET_ADDRESS`, `INFORMATION`, `REGISTER`, `GIFT_NOTIFICATION`, `SUPPORT`

**Wireframe del área de mensajes:**
```
┌─────────────────────────────────────────────────────────────┐
│ bg-brand-black text-white px-6 py-4  (header)               │
│ ← Pedido #1001       [GET_ADDRESS]    [● COMPLETED verde]   │
│ Iniciada: 21 Feb 2026, 10:01 · Completada: 10:05            │
├─────────────────────────────────────────────────────────────┤
│ ⚠ [banner #DBFF36] expira el 22 May 2026       (sticky top) │
├─────────────────────────────────────────────────────────────┤
│ bg-white overflow-y-auto flex-1 px-6 py-4 space-y-4         │
│                                                             │
│  🤖│ Hola! Para procesar tu pedido necesito               │
│    │ tu dirección de entrega.                              │
│      10:01                                                  │
│                                                             │
│          Calle Mayor 5, Madrid 28013  │👤                   │
│                              10:02                          │
│                                                             │
│  🤖│ He encontrado la dirección en Google Maps.           │
│    │ ¿Confirmas: Calle Mayor 5, 28013 Madrid?             │
│      10:03                                                  │
│                                                             │
│                                   Sí  │👤                   │
│                              10:04                          │
│                                                             │
│  🤖│ Perfecto! Dirección confirmada ✓                     │
│      10:05                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Burbujas por rol:**
- `assistant` → alineado izquierda; `bg-gray-100 rounded-chat rounded-tl-sm border-l-2 border-brand-teal text-gray-900`; avatar `Bot` (`bg-brand-teal/10`)
- `user` → alineado derecha; `bg-brand-teal rounded-chat rounded-tr-sm text-white`; avatar `User` (`bg-gray-100`)
- `system` → centrado; `text-xs italic text-gray-400`; separadores `<div className="h-px flex-1 bg-gray-200">`

Timestamps: `<time dateTime={timestamp}>` — `text-xs text-gray-400` (assistant) / `text-xs text-white/60` (user).

La vista SHALL hacer scroll automático al último mensaje al cargar (`useEffect` + `ref` en el elemento `role="log"`).

#### Scenario: Mensajes renderizados como burbujas
- **WHEN** el usuario accede a `/conversations/conv-uuid` con mensajes disponibles
- **THEN** se muestran burbujas diferenciadas: assistant a la izquierda (gris, borde teal), user a la derecha (teal), system centrado (itálico)

#### Scenario: Scroll automático al último mensaje
- **WHEN** la página carga con mensajes
- **THEN** el scroll se posiciona automáticamente en el último mensaje visible

#### Scenario: Banner de expiración cuando TTL < 7 días
- **WHEN** el `expiresAt` del primer mensaje es menor que `Date.now() + 7 días`
- **THEN** se muestra el banner `bg-brand-lime text-brand-black` con icono `Clock` y la fecha exacta de expiración (`formatExpiryDate(expiresAt)`)

#### Scenario: Sin banner cuando TTL > 7 días
- **WHEN** el `expiresAt` del primer mensaje es mayor que `Date.now() + 7 días`
- **THEN** el banner NO se muestra (componente retorna `null`)

#### Scenario: Error 404 al acceder a conversación inexistente
- **WHEN** se accede a `/conversations/id-inexistente` y la API devuelve 404
- **THEN** se muestra el error boundary (`error.tsx`) con mensaje amigable y enlace de vuelta a `/orders`

---

### Requirement: Accesibilidad WCAG 2.1 AA
Todos los pares de color en la UI SHALL cumplir ratio de contraste ≥ 4.5:1 para texto normal (WCAG AA).

Los botones iconográficos SHALL incluir `aria-label` descriptivo (ej.: `aria-label="Ver conversación del pedido #1001"`).

El sidebar SHALL incluir `<nav aria-label="Navegación principal">`.

El contenedor de mensajes del chat SHALL incluir `role="log"` + `aria-live="polite"` + `aria-label="Conversación"`.

Los headers de tabla SHALL usar `<th scope="col">`.

Todos los elementos interactivos SHALL tener `focus-visible:ring-2 focus-visible:ring-brand-teal`.

#### Scenario: Contraste de badge PENDING_ADDRESS
- **WHEN** se renderiza el badge `PENDING_ADDRESS`
- **THEN** el par `#DBFF36` sobre `#000000` cumple ratio ≥ 4.5:1 (ratio real: 13.1:1 ✅)

#### Scenario: Contraste de burbujas de usuario
- **WHEN** se renderiza una burbuja de tipo `user`
- **THEN** el par `#FFFFFF` sobre `#00687D` cumple ratio ≥ 4.5:1 (ratio real: 5.3:1 ✅)

#### Scenario: Botón de chat con aria-label
- **WHEN** se renderiza el icono de chat de un pedido
- **THEN** el elemento tiene `aria-label` que incluye el número de pedido

---

### Requirement: Endpoint GET /admin/orders acepta parámetros de ordenación
El endpoint `GET /api/admin/orders` SHALL aceptar los query params opcionales `sortBy` y `sortDir` para controlar el orden de los resultados devueltos.

Valores válidos de `sortBy`: `ref` | `store` | `user` | `amount` | `date`  
Valores válidos de `sortDir`: `asc` | `desc`  
Valor por defecto cuando no se proporcionan params: `sortBy=date`, `sortDir=desc`

#### Scenario: Solicitud sin parámetros de ordenación
- **WHEN** el cliente llama a `GET /api/admin/orders` sin `sortBy` ni `sortDir`
- **THEN** la respuesta devuelve los pedidos ordenados por `webhookReceivedAt DESC`
- **THEN** el status HTTP es 200

#### Scenario: Solicitud con sortBy y sortDir válidos
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=store&sortDir=asc`
- **THEN** la respuesta devuelve los pedidos ordenados por nombre de tienda ASC con subsort por referencia ASC
- **THEN** el status HTTP es 200

#### Scenario: sortBy inválido — fallback silencioso
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=foobar&sortDir=asc`
- **THEN** la respuesta devuelve los pedidos con el orden por defecto (`date DESC`)
- **THEN** el status HTTP es 200 (sin error 400)

#### Scenario: Ordenación por importe numérico
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=amount&sortDir=desc`
- **THEN** los pedidos se ordenan por `totalAmount` de mayor a menor (tipo Decimal en Prisma)

#### Scenario: Ordenación por referencia con nulls al final
- **WHEN** el cliente llama a `GET /api/admin/orders?sortBy=ref&sortDir=asc`
- **THEN** los pedidos con `externalOrderNumber` nulo aparecen al final de la lista

---

## Estructura de Archivos (`apps/web-admin`)

```
apps/web-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx                           ← RootLayout + Inter font + sidebar + skip link
│   │   ├── globals.css                          ← Variables CSS brand + Tailwind + overrides Shadcn
│   │   ├── page.tsx                             ← redirect('/orders')
│   │   ├── orders/
│   │   │   ├── page.tsx                         ← Server Component (getOrders + render)
│   │   │   ├── loading.tsx                      ← Skeleton de 8 filas
│   │   │   └── error.tsx                        ← Error boundary + botón retry
│   │   ├── users/
│   │   │   ├── page.tsx                         ← Server Component (getUsers + render)
│   │   │   ├── loading.tsx                      ← Skeleton de 8 filas
│   │   │   └── error.tsx                        ← Error boundary
│   │   └── conversations/
│   │       └── [conversationId]/
│   │           ├── page.tsx                     ← Server Component (getConversationMessages + render)
│   │           ├── loading.tsx                  ← Skeleton de 5-6 burbujas alternadas
│   │           └── error.tsx                    ← Error boundary + enlace a /orders
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx                      ← 'use client' — usePathname() para nav activa
│   │   ├── orders/
│   │   │   ├── orders-table.tsx                 ← 'use client' — Shadcn Table con ordenación
│   │   │   ├── sortable-column-header.tsx       ← 'use client' — cabecera sortable; preserva filtros activos
│   │   │   ├── orders-table-skeleton.tsx        ← Skeleton de filas
│   │   │   ├── orders-empty-state.tsx           ← ShoppingCart + texto vacío/sin resultados (prop hasFilters)
│   │   │   ├── order-status-badge.tsx           ← OrderStatusBadge + OrderModeBadge
│   │   │   ├── orders-filter-bar.tsx            ← 'use client' — coordinador de filtros + buildUrl()
│   │   │   ├── orders-search-input.tsx          ← 'use client' — input con debounce 300ms
│   │   │   ├── orders-status-filter.tsx         ← 'use client' — Popover multi-select de OrderStatus
│   │   │   ├── orders-mode-filter.tsx           ← 'use client' — Popover multi-select de OrderMode
│   │   │   ├── orders-date-filter.tsx           ← 'use client' — Popover date range picker nativo
│   │   │   └── orders-active-filter-chips.tsx   ← 'use client' — chips de filtros activos + Limpiar todo
│   │   ├── users/
│   │   │   ├── users-table.tsx                  ← Server Component — Shadcn Table
│   │   │   ├── users-table-skeleton.tsx         ← Skeleton de filas
│   │   │   ├── users-empty-state.tsx            ← Users icon + texto vacío
│   │   │   └── user-registered-badge.tsx        ← Badge Sí/No por isRegistered
│   │   └── chat/
│   │       ├── chat-view.tsx                    ← 'use client' — scroll al último mensaje
│   │       ├── chat-view-skeleton.tsx           ← Skeleton de burbujas
│   │       ├── chat-bubble.tsx                  ← Server Component — burbuja individual
│   │       └── chat-expiry-banner.tsx           ← 'use client' — cálculo TTL en cliente
│   ├── lib/
│   │   ├── api.ts                               ← apiFetch, getOrders, getUsers, getConversationMessages
│   │   └── utils.ts                             ← cn, formatDate, formatRelativeDate, formatCurrency,
│   │                                               formatPhone, formatFullName, isExpiringSoon, formatExpiryDate
│   └── types/
│       └── api.ts                               ← Interfaces TypeScript (ver specs/admin-api/spec.md)
├── package.json                                 ← name: "@adresles/web-admin", version: "0.1.0"
├── next.config.ts
├── tailwind.config.ts                           ← brand colors + borderRadius.chat
├── tsconfig.json                                ← strict: true
└── .env.local                                   ← NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Implementación de Componentes Clave

### `src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const getOrders = (
  page = 1,
  limit = 50,
  sortBy?: SortByColumn,
  sortDir?: SortDir,
  filters?: OrdersFilters,
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);
  if (filters?.q) params.set('q', filters.q);
  if (filters?.status?.length) params.set('status', filters.status.join(','));
  if (filters?.mode?.length) params.set('mode', filters.mode.join(','));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  return apiFetch(`/api/admin/orders?${params.toString()}`);
};

export const getUsers = (page = 1, limit = 50): Promise<UsersResponse> =>
  apiFetch(`/api/admin/users?page=${page}&limit=${limit}`);

export const getConversationMessages = (id: string): Promise<ConversationMessagesResponse> =>
  apiFetch(`/api/admin/conversations/${id}/messages`);
```

### `src/lib/utils.ts` — funciones clave

```typescript
export function cn(...inputs: ClassValue[]): string { return twMerge(clsx(inputs)); }
export function formatDate(iso: string): string { return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es }); }
export function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}
export function formatCurrency(amount: string, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 2 })
    .format(parseFloat(amount));
}
export function formatFullName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—';
}
export function isExpiringSoon(expiresAtUnix: number, daysThreshold = 7): boolean {
  return !isAfter(fromUnixTime(expiresAtUnix), addDays(new Date(), daysThreshold));
}
export function formatExpiryDate(expiresAtUnix: number): string {
  return format(fromUnixTime(expiresAtUnix), "d 'de' MMMM 'de' yyyy", { locale: es });
}
```

### `src/components/layout/sidebar.tsx` (fragmento)

```typescript
'use client';
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-black">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-brand-lime">adresles</span>
        <span className="text-xs text-white/30">admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Navegación principal">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'border-l-2 border-brand-lime bg-white/5 text-brand-lime'
                       : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}>
              <Icon className="h-4 w-4 shrink-0" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4"><p className="text-xs text-white/30">v0.1.0</p></div>
    </aside>
  );
}
```

### `src/components/chat/chat-bubble.tsx` (fragmento)

```typescript
// role === 'system' → separador itálico centrado
// role === 'assistant' → burbuja izquierda: bg-gray-100 border-l-2 border-brand-teal rounded-chat rounded-tl-sm
// role === 'user' → burbuja derecha: bg-brand-teal text-white rounded-chat rounded-tr-sm
// timestamp: <time dateTime={message.timestamp}>HH:mm</time>
// avatar assistant: Bot (lucide) en div bg-brand-teal/10
// avatar user: User (lucide) en div bg-gray-100
```

### `src/components/chat/chat-expiry-banner.tsx`

```typescript
'use client';
export function ChatExpiryBanner({ expiresAtUnix }: { expiresAtUnix: number }) {
  if (!isExpiringSoon(expiresAtUnix)) return null;
  return (
    <div role="alert" className="sticky top-0 z-10 flex items-center gap-2 bg-brand-lime px-4 py-2.5 text-sm font-medium text-brand-black">
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Los mensajes de esta conversación expiran el{' '}
        <strong>{formatExpiryDate(expiresAtUnix)}</strong>. Después no estarán disponibles.
      </span>
    </div>
  );
}
```
