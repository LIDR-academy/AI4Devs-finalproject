## ADDED Requirements

### Requirement: Listar pedidos con contexto completo
El sistema SHALL exponer `GET /api/admin/orders` que devuelva pedidos paginados con soporte de ordenación y filtrado, incluyendo datos de tienda, usuario (con teléfono) y lista de IDs de conversación asociadas.

El endpoint SHALL aceptar los siguientes query params (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `ref\|store\|user\|amount\|date` | Columna de ordenación (defecto: `date`) |
| `sortDir` | `asc\|desc` | Dirección (defecto: `desc`) |
| `q` | string | Búsqueda de texto libre en `store.name`, **`externalOrderId`**, `user.firstName`, `user.lastName` (case-insensitive, OR entre columnas) |
| `status` | string CSV | Estados a filtrar, ej: `COMPLETED,CANCELED`. Valores inválidos se ignoran silenciosamente |
| `mode` | string CSV | Modos a filtrar, ej: `ADRESLES`. Valores inválidos se ignoran silenciosamente |
| `from` | `YYYY-MM-DD` | Fecha inicio (inclusiva desde `00:00:00.000Z`). El DTO valida el formato; formato incorrecto → HTTP 400 |
| `to` | `YYYY-MM-DD` | Fecha fin (inclusiva hasta `23:59:59.999Z`). Mismo comportamiento que `from` |

Los filtros se combinan con lógica AND entre sí. Dentro de `status` y `mode`, la lógica es OR.

`meta.total` refleja siempre el número de pedidos que cumplen los filtros activos (no el total global).

**Respuesta `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "externalOrderId": "wc-1001",
      "externalOrderNumber": "#1001",
      "totalAmount": "55.00",
      "currency": "EUR",
      "feePercentage": "3.75",
      "feeAmount": "2.06",
      "status": "COMPLETED",
      "orderMode": "ADRESLES",
      "paymentType": "CREDIT_CARD",
      "isGift": false,
      "webhookReceivedAt": "2026-02-21T10:00:00Z",
      "addressConfirmedAt": "2026-02-21T10:05:00Z",
      "store": {
        "id": "uuid",
        "name": "Mi Tienda Online",
        "url": "https://mitienda.com"
      },
      "user": {
        "id": "uuid",
        "firstName": "Juan",
        "lastName": "García",
        "email": "juan@example.com",
        "isRegistered": false,
        "phone": {
          "e164": "+34612345678",
          "formattedNational": "612 34 56 78"
        }
      },
      "conversations": [
        { "id": "conv-uuid" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

La consulta Prisma usa `buildWhere(params)` (método privado de `AdminService`) para construir el `where` y aplica el mismo filtro tanto en `findMany` como en `count`:
```typescript
const where = this.buildWhere(params);
prisma.$transaction([
  prisma.order.findMany({ include: { ... }, where, orderBy, skip, take }),
  prisma.order.count({ where }),
])
```

#### Scenario: Consulta paginada de pedidos
- **WHEN** se hace `GET /api/admin/orders?page=1&limit=50`
- **THEN** el sistema responde `200 OK` con un array `data` de pedidos y un objeto `meta` con `page`, `limit` y `total`

#### Scenario: Pedido incluye datos de tienda, usuario y conversaciones
- **WHEN** se hace `GET /api/admin/orders` y existe al menos un pedido
- **THEN** cada item del array `data` incluye `store.id`, `store.name`, `user.id`, `user.isRegistered`, `user.phone.e164` y `conversations` como array de objetos `{ id }`

#### Scenario: Respuesta vacía cuando no hay pedidos
- **WHEN** se hace `GET /api/admin/orders` y no hay pedidos en la base de datos
- **THEN** el sistema responde `200 OK` con `data: []` y `meta.total: 0`

#### Scenario: Filtro de texto libre sobre 4 columnas
- **WHEN** se hace `GET /api/admin/orders?q=garcia`
- **THEN** la respuesta incluye solo pedidos donde `store.name`, `externalOrderId`, `user.firstName` o `user.lastName` contiene "garcia" (case-insensitive)

#### Scenario: Filtro de texto libre busca por externalOrderId
- **WHEN** se hace `GET /api/admin/orders?q=100`
- **THEN** la respuesta incluye solo pedidos donde `store.name`, `externalOrderId`, `user.firstName` o `user.lastName` contiene "100" (case-insensitive)
- **AND** no se busca por `externalOrderNumber`

#### Scenario: Ordenación por ref usa externalOrderId sin nulls
- **WHEN** se hace `GET /api/admin/orders?sortBy=ref&sortDir=asc`
- **THEN** `buildOrderBy` produce `[{ externalOrderId: 'asc' }]` (sin clave `nulls`)

#### Scenario: Ordenación por store incluye externalOrderId como subsort
- **WHEN** se hace `GET /api/admin/orders?sortBy=store&sortDir=asc`
- **THEN** `buildOrderBy` produce `[{ store: { name: 'asc' } }, { externalOrderId: 'asc' }]`

#### Scenario: Filtro de status multi-valor aplica OR
- **WHEN** se hace `GET /api/admin/orders?status=COMPLETED,CANCELED`
- **THEN** la respuesta incluye pedidos con `status = COMPLETED` OR `status = CANCELED`

#### Scenario: status inválido ignorado silenciosamente
- **WHEN** se hace `GET /api/admin/orders?status=INVALID_STATUS`
- **THEN** la respuesta devuelve todos los pedidos sin filtrar y status HTTP 200

#### Scenario: Filtro de rango de fechas
- **WHEN** se hace `GET /api/admin/orders?from=2026-02-01&to=2026-02-28`
- **THEN** la respuesta incluye solo pedidos con `webhookReceivedAt` entre `2026-02-01T00:00:00Z` y `2026-02-28T23:59:59.999Z`

#### Scenario: meta.total refleja el count filtrado
- **WHEN** se hace `GET /api/admin/orders?status=COMPLETED` y hay 3 pedidos completados de un total de 10
- **THEN** la respuesta tiene `meta.total = 3`

---

### Requirement: Listar usuarios con conteos
El sistema SHALL exponer `GET /api/admin/users` que devuelva usuarios paginados con soporte de ordenación y filtrado. Solo se devuelven usuarios con `isDeleted = false` (condición base invariable). Incluye teléfono y conteo de pedidos y direcciones.

El endpoint SHALL aceptar los siguientes query params (todos opcionales):

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `name\|email\|orders\|addresses\|lastInteraction` | Columna de ordenación (defecto: `lastInteraction`) |
| `sortDir` | `asc\|desc` | Dirección de ordenación (defecto: `desc`) |
| `q` | string | Búsqueda libre en `firstName`, `lastName`, `email` (case-insensitive, OR entre campos) |
| `registered` | `true\|false` | Filtrar por `isRegistered`. Ausente = todos. Valores inválidos se ignoran silenciosamente |

Los filtros `q` y `registered` se combinan con lógica AND.

`meta.total` refleja siempre el número de usuarios que cumplen los filtros activos (no el total global).

La consulta Prisma usa `buildUsersWhere(params)` (método privado de `AdminService`) para construir el `where` y aplica el mismo filtro en `findMany` y en `count`. `buildUsersWhere` incluye siempre `{ isDeleted: false }` como condición base del array `AND`.

**Respuesta `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "García",
      "email": "juan@example.com",
      "preferredLanguage": "es",
      "isRegistered": false,
      "registeredAt": null,
      "lastInteractionAt": "2026-02-21T10:05:00Z",
      "createdAt": "2026-02-21T10:00:00Z",
      "phone": {
        "e164": "+34612345678",
        "formattedNational": "612 34 56 78",
        "country": "ES"
      },
      "_count": {
        "orders": 1,
        "addresses": 0
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

#### Scenario: Consulta paginada de usuarios
- **WHEN** se hace `GET /api/admin/users?page=1&limit=50`
- **THEN** el sistema responde `200 OK` con `data` (array de usuarios) y `meta` con paginación

#### Scenario: Consulta sin params usa defaults
- **WHEN** se hace `GET /api/admin/users` sin params
- **THEN** el sistema responde `200 OK` con usuarios ordenados por `lastInteractionAt DESC`, nulls al final, filtrando `isDeleted = false`

#### Scenario: Ordenación por nombre con nulls al final
- **WHEN** se hace `GET /api/admin/users?sortBy=name&sortDir=asc`
- **THEN** la respuesta devuelve usuarios ordenados por `firstName ASC` luego `lastName ASC`, con usuarios sin nombre al final

#### Scenario: Ordenación por conteo de pedidos
- **WHEN** se hace `GET /api/admin/users?sortBy=orders&sortDir=desc`
- **THEN** la respuesta devuelve usuarios con más pedidos primero

#### Scenario: sortBy inválido hace fallback silencioso (nivel servicio)
- **WHEN** se hace `GET /api/admin/users?sortBy=invalido&sortDir=asc`
- **THEN** `AdminService` usa el orden por defecto (`lastInteraction DESC`)

> **Nota:** El DTO `UsersQuery` usa `@IsIn`, por lo que clientes externos con `sortBy` inválido reciben HTTP 400. El frontend siempre envía valores válidos. Deuda técnica: eliminar `@IsIn` de `UsersQuery.sortBy` y `OrdersQuery.sortBy` para alinear con el fallback silencioso del servicio (ver también `registered` abajo).

#### Scenario: sortDir se ignora cuando sortBy es inválido
- **WHEN** se hace `GET /api/admin/users?sortBy=invalido&dir=asc`
- **THEN** la respuesta usa los defaults completos (`lastInteraction DESC`), ignorando `dir`

> **Comportamiento de diseño:** Un `sortBy` inválido implica defaults completos; `sortDir` no se aplica de forma aislada.

#### Scenario: Búsqueda de texto libre OR en tres campos
- **WHEN** se hace `GET /api/admin/users?q=garcia`
- **THEN** la respuesta incluye solo usuarios donde `firstName`, `lastName` o `email` contiene "garcia" (case-insensitive)

#### Scenario: Filtro por registered=true
- **WHEN** se hace `GET /api/admin/users?registered=true`
- **THEN** la respuesta incluye solo usuarios con `isRegistered = true`

#### Scenario: Filtro por registered=false
- **WHEN** se hace `GET /api/admin/users?registered=false`
- **THEN** la respuesta incluye solo usuarios con `isRegistered = false`

#### Scenario: Combinación AND de q y registered
- **WHEN** se hace `GET /api/admin/users?q=garcia&registered=true`
- **THEN** la respuesta incluye solo usuarios registrados cuyo nombre o email contiene "garcia"

#### Scenario: registered inválido se ignora silenciosamente (nivel servicio)
- **WHEN** se hace `GET /api/admin/users?registered=invalido`
- **THEN** `AdminService` devuelve todos los usuarios sin filtro de registro

#### Scenario: meta.total refleja el count filtrado
- **WHEN** se hace `GET /api/admin/users?registered=true` y hay 3 registrados de un total de 10
- **THEN** la respuesta tiene `meta.total = 3`

#### Scenario: Usuario incluye teléfono y conteos
- **WHEN** se hace `GET /api/admin/users` y existe al menos un usuario
- **THEN** cada item incluye `phone.e164`, `phone.formattedNational`, `phone.country`, `_count.orders` y `_count.addresses`

#### Scenario: Usuarios eliminados no aparecen
- **WHEN** existen usuarios con `isDeleted = true`
- **THEN** esos usuarios NO aparecen en la respuesta de `/api/admin/users`

---

### Requirement: Obtener mensajes de una conversación
El sistema SHALL exponer `GET /api/admin/conversations/:conversationId/messages` que devuelva todos los mensajes de la conversación desde DynamoDB, ordenados cronológicamente (ASC por timestamp).

La respuesta incluye el campo `order` con `externalOrderId` (NOT NULL) en lugar de `externalOrderNumber` (nullable). La estructura del campo `order` en la respuesta de contexto de conversación es `{ externalOrderId: string }`.

**Respuesta `200 OK`:**
```json
{
  "conversationId": "conv-uuid",
  "messages": [
    {
      "messageId": "msg-001",
      "role": "assistant",
      "content": "Hola! Para procesar tu pedido necesito tu dirección de entrega.",
      "timestamp": "2026-02-21T10:01:00Z",
      "expiresAt": 1748822460
    },
    {
      "messageId": "msg-002",
      "role": "user",
      "content": "Calle Mayor 5, Madrid 28013",
      "timestamp": "2026-02-21T10:02:00Z",
      "expiresAt": 1748822520
    },
    {
      "messageId": "msg-003",
      "role": "assistant",
      "content": "Perfecto! He validado tu dirección con Google Maps ✓",
      "timestamp": "2026-02-21T10:03:00Z",
      "expiresAt": 1748822580
    }
  ],
  "order": {
    "externalOrderId": "100"
  }
}
```

**Respuesta `404 Not Found`:** si `conversationId` no existe en Prisma.

La implementación SHALL delegar en `mockConversationsService.getConversationHistory(conversationId)`, que internamente ejecuta un `QueryCommand` a DynamoDB con `ScanIndexForward: true` (orden ASC cronológico). Los mensajes con TTL expirado son filtrados automáticamente por DynamoDB y nunca aparecen en la respuesta.

#### Scenario: Conversación existente con mensajes
- **WHEN** se hace `GET /api/admin/conversations/conv-uuid/messages` y la conversación existe en Prisma y tiene mensajes en DynamoDB
- **THEN** el sistema responde `200 OK` con `{ conversationId, messages: [...] }` donde cada mensaje incluye `messageId`, `role`, `content`, `timestamp` y `expiresAt` (Unix timestamp)

#### Scenario: Conversación no encontrada
- **WHEN** se hace `GET /api/admin/conversations/id-inexistente/messages` y el `conversationId` no existe en Prisma
- **THEN** el sistema responde `404 Not Found`

#### Scenario: Conversación sin mensajes en DynamoDB
- **WHEN** se hace `GET /api/admin/conversations/conv-uuid/messages` y la conversación existe en Prisma pero no tiene mensajes en DynamoDB (expirados o nunca escritos)
- **THEN** el sistema responde `200 OK` con `{ conversationId, messages: [] }`

#### Scenario: Campo order devuelve externalOrderId directamente
- **WHEN** se hace `GET /api/admin/conversations/:id/messages` para una conversación con pedido asociado
- **THEN** el campo `order` en la respuesta contiene `{ externalOrderId: "<valor>" }` (nunca null, sin fallback)
- **AND** no aparece el campo `externalOrderNumber` en la respuesta

---

### Requirement: AdminModule es aditivo y no modifica módulos existentes
El `AdminModule` SHALL importarse en `app.module.ts` sin modificar ningún otro módulo existente. La lógica de negocio de CU-01 (procesamiento de compras, Worker, conversaciones IA) SHALL permanecer inalterada.

#### Scenario: Tests de CU-01 siguen pasando tras registrar AdminModule
- **WHEN** se registra `AdminModule` en `app.module.ts` y se ejecuta `pnpm test` en `apps/api`
- **THEN** los 37 tests existentes pasan sin modificaciones

---

### Requirement: Listar tiendas activas para simulación
El sistema SHALL exponer `GET /api/admin/stores` que devuelva la lista completa de tiendas con `status = ACTIVE`, enriquecida con el nombre comercial del eCommerce propietario. No requiere parámetros de entrada, paginación ni filtros.

La respuesta SHALL tener la forma `{ "data": SimulateStore[] }` donde cada elemento incluye `id`, `name`, `url`, `platform` (valor del enum `StorePlatform`) y `ecommerceName` (nunca null).

Ordenación fija: primero por `ecommerce.commercialName ASC`, luego por `store.name ASC`.

Cuando `ecommerce.commercialName` sea null, SHALL usarse `ecommerce.legalName` como valor de `ecommerceName`.

**Respuesta `200 OK`:**
```json
{
  "data": [
    {
      "id": "uuid-store-1",
      "name": "ModaMujer Tienda Principal",
      "url": "https://modamujer.example.com",
      "platform": "WOOCOMMERCE",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-2",
      "name": "ModaMujer Outlet",
      "url": "https://modamujer-outlet.example.com",
      "platform": "SHOPIFY",
      "ecommerceName": "ModaMujer"
    },
    {
      "id": "uuid-store-3",
      "name": "TechGadgets Store",
      "url": "https://techgadgets.example.com",
      "platform": "PRESTASHOP",
      "ecommerceName": "TechGadgets"
    }
  ]
}
```

#### Scenario: Consulta de tiendas activas
- **WHEN** se hace `GET /api/admin/stores`
- **THEN** el sistema responde `200 OK` con `{ data: [...] }` donde cada elemento incluye `id`, `name`, `url`, `platform` y `ecommerceName`

#### Scenario: Solo aparecen tiendas con status ACTIVE
- **WHEN** existen tiendas con `status = INACTIVE` o `status = PENDING_SETUP`
- **THEN** esas tiendas NO aparecen en la respuesta

#### Scenario: Respuesta vacía cuando no hay tiendas activas
- **WHEN** no existen tiendas con `status = ACTIVE`
- **THEN** el sistema responde `200 OK` con `{ data: [] }`

#### Scenario: ecommerceName nunca es null
- **WHEN** una tienda pertenece a un eCommerce con `commercialName = null`
- **THEN** `ecommerceName` en la respuesta contiene el valor de `legalName` del eCommerce

#### Scenario: Ordenación por ecommerceName y luego por nombre de tienda
- **WHEN** existen múltiples tiendas de distintos eCommerces
- **THEN** la respuesta las ordena primero por nombre de eCommerce ASC y luego por nombre de tienda ASC dentro del mismo eCommerce

---

## Tipos TypeScript (`src/types/api.ts`)

Todos los tipos del frontend en `src/types/`. No usar `any`; usar `unknown` si el tipo es indeterminado.

```typescript
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_ADDRESS'
  | 'READY_TO_PROCESS'
  | 'COMPLETED'
  | 'CANCELED';

export type OrderMode = 'ADRESLES' | 'TRADITIONAL';

export type PaymentType =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'BIZUM'
  | 'BANK_TRANSFER'
  | 'CASH_ON_DELIVERY'
  | 'OTHER';

export type ConversationStatus =
  | 'ACTIVE'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'ESCALATED'
  | 'TIMEOUT';

export type ConversationType =
  | 'GET_ADDRESS'
  | 'INFORMATION'
  | 'REGISTER'
  | 'GIFT_NOTIFICATION'
  | 'SUPPORT';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface AdminPhone {
  e164: string;
  formattedNational: string;
  country: string | null;
}

export interface AdminStore {
  id: string;
  name: string;
  url: string;
}

export interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isRegistered: boolean;
  registeredAt: string | null;
  lastInteractionAt: string | null;
  createdAt: string;
  phone: AdminPhone | null;
  _count: { orders: number; addresses: number };
}

export interface AdminOrderUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isRegistered: boolean;
  phone: Pick<AdminPhone, 'e164' | 'formattedNational'> | null;
}

export interface AdminOrder {
  id: string;
  externalOrderId: string;
  externalOrderNumber: string | null;
  totalAmount: string;
  currency: string;
  feePercentage: string;
  feeAmount: string;
  status: OrderStatus;
  orderMode: OrderMode;
  paymentType: PaymentType;
  isGift: boolean;
  webhookReceivedAt: string;
  addressConfirmedAt: string | null;
  store: AdminStore;
  user: AdminOrderUser;
  conversations: Array<{ id: string }>;
}

export interface ConversationMessage {
  messageId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  expiresAt: number;  // Unix timestamp
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface ConversationMessagesResponse {
  conversationId: string;
  messages: ConversationMessage[];
}

export type OrdersResponse = PaginatedResponse<AdminOrder>;
export type UsersResponse  = PaginatedResponse<AdminUser>;

export type SortByColumn = 'ref' | 'store' | 'user' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

export const VALID_SORT_COLUMNS: SortByColumn[] = ['ref', 'store', 'user', 'amount', 'date'];
export const DEFAULT_SORT: SortByColumn = 'date';
export const DEFAULT_DIR: SortDir = 'desc';

export type UserSortByColumn = 'name' | 'email' | 'orders' | 'addresses' | 'lastInteraction';
export const VALID_USER_SORT_COLUMNS: UserSortByColumn[] = ['name', 'email', 'orders', 'addresses', 'lastInteraction'];
export const DEFAULT_USER_SORT: UserSortByColumn = 'lastInteraction';
export const DEFAULT_USER_DIR: SortDir = 'desc';

export interface OrdersFilters {
  q?: string;
  status?: OrderStatus[];
  mode?: OrderMode[];
  from?: string;
  to?: string;
}

export interface UsersFilters {
  q?: string;
  registered?: 'true' | 'false';
}

export const USER_REGISTERED_FILTER_LABELS: Record<string, string> = {
  true: 'Registrado',
  false: 'No registrado',
};

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT', 'PENDING_ADDRESS', 'READY_TO_PROCESS', 'COMPLETED', 'CANCELED',
];
export const VALID_ORDER_MODES: OrderMode[] = ['ADRESLES', 'TRADITIONAL'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pago pendiente',
  PENDING_ADDRESS: 'Dirección pendiente',
  READY_TO_PROCESS: 'Listo para procesar',
  COMPLETED: 'Completado',
  CANCELED: 'Cancelado',
};
export const ORDER_MODE_LABELS: Record<OrderMode, string> = {
  ADRESLES: 'Adresles',
  TRADITIONAL: 'Tradicional',
};
```

---

## Datos del Schema Prisma Utilizados

Modelos en `apps/api/prisma/schema.prisma`:

| Modelo | Campos usados |
|--------|--------------|
| `Order` | `id`, `externalOrderId`, `externalOrderNumber`, `totalAmount`, `currency`, `feePercentage`, `feeAmount`, `status`, `orderMode`, `paymentType`, `isGift`, `webhookReceivedAt`, `addressConfirmedAt` |
| `Store` | `id`, `name`, `url` |
| `User` | `id`, `firstName`, `lastName`, `email`, `isRegistered`, `registeredAt`, `lastInteractionAt`, `isDeleted`, `preferredLanguage`, `createdAt` |
| `Phone` | `e164`, `formattedNational`, `country` |
| `Conversation` | `id` (solo el ID, para el enlace al chat) |

**DynamoDB `adresles-messages`:**
- PK: `conversationId` (String)
- SK: `timestamp` (String ISO-8601)
- Campos: `messageId`, `role` (`user` / `assistant` / `system`), `content`, `expiresAt` (Number Unix)
- TTL attribute: `expiresAt` — DynamoDB elimina automáticamente los ítems expirados

---

### Requirement: Listar direcciones con datos de usuario desde AdminModule
El sistema SHALL exponer `GET /api/admin/addresses` mediante el `AdminController` existente, delegando en el `AdminService` la lógica de consulta. El endpoint es aditivo: no modifica los endpoints existentes de pedidos, usuarios, tiendas ni conversaciones.

El endpoint implementa el mismo patrón arquitectónico que `GET /api/admin/users`:
- DTO de query `AddressesQuery` con decoradores `class-validator` (`@IsOptional`, `@IsIn`, `@IsString`)
- Método `getAddresses(page, limit, params)` en `AdminService`
- Métodos privados `buildAddressesOrderBy(sortBy, dir)` y `buildAddressesWhere(params)`
- Misma transacción `prisma.$transaction([findMany, count])` con el mismo `where`

La especificación completa del contrato del endpoint (parámetros, respuesta JSON, comportamiento de filtros y ordenación) está en `openspec/specs/addresses-admin-api/spec.md`.

#### Scenario: Endpoint addresses aditivo — no rompe endpoints existentes
- **WHEN** se registra el nuevo endpoint en `AdminController` y se ejecuta `pnpm test` en `apps/api`
- **THEN** todos los tests existentes de `admin.service.spec.ts` y `admin.controller.spec.ts` siguen pasando

#### Scenario: DTO AddressesQuery rechaza propiedades no declaradas
- **WHEN** se hace `GET /api/admin/addresses?campoDesconocido=valor`
- **THEN** el sistema responde `400 Bad Request` (comportamiento del `ValidationPipe` global con `forbidNonWhitelisted: true`)

#### Scenario: DTO AddressesQuery acepta todos los params válidos
- **WHEN** se hace `GET /api/admin/addresses?page=1&limit=50&sortBy=city&sortDir=asc&q=madrid&favorite=true`
- **THEN** el sistema responde `200 OK` sin errores de validación

#### Scenario: buildAddressesWhere incluye isDeleted=false como condición base
- **WHEN** se invoca `buildAddressesWhere({})` (sin parámetros)
- **THEN** el objeto `where` resultante incluye `{ AND: [{ isDeleted: false }] }`

#### Scenario: buildAddressesOrderBy devuelve defaults cuando sortBy es inválido
- **WHEN** se invoca `buildAddressesOrderBy('invalido', 'asc')`
- **THEN** devuelve la ordenación por defecto: `[{ user: { firstName: { sort: 'asc', nulls: 'last' } } }, { user: { lastName: { sort: 'asc', nulls: 'last' } } }]`
