## ADDED Requirements

### Requirement: Listar pedidos con contexto completo
El sistema SHALL exponer `GET /api/admin/orders` que devuelva todos los pedidos ordenados por `webhookReceivedAt` descendente, incluyendo datos de tienda, usuario (con teléfono) y lista de IDs de conversación asociadas.

El endpoint SHALL aceptar los parámetros de paginación `page` (entero ≥ 1, defecto 1) y `limit` (entero entre 1 y 100, defecto 50).

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

La consulta Prisma SHALL incluir:
```
prisma.order.findMany({
  include: {
    store: true,
    user: { include: { phone: true } },
    conversations: { select: { id: true } }
  },
  orderBy: { webhookReceivedAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
})
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

---

### Requirement: Listar usuarios con conteos
El sistema SHALL exponer `GET /api/admin/users` que devuelva todos los usuarios con `isDeleted = false`, ordenados por `lastInteractionAt` descendente (nulos al final), incluyendo teléfono y conteo de pedidos y direcciones.

El endpoint SHALL aceptar los mismos parámetros de paginación que `/api/admin/orders`.

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

#### Scenario: Usuario incluye teléfono y conteos
- **WHEN** se hace `GET /api/admin/users` y existe al menos un usuario
- **THEN** cada item incluye `phone.e164`, `phone.formattedNational`, `phone.country`, `_count.orders` y `_count.addresses`

#### Scenario: Usuarios eliminados no aparecen
- **WHEN** existen usuarios con `isDeleted = true`
- **THEN** esos usuarios NO aparecen en la respuesta de `/api/admin/users`

---

### Requirement: Obtener mensajes de una conversación
El sistema SHALL exponer `GET /api/admin/conversations/:conversationId/messages` que devuelva todos los mensajes de la conversación desde DynamoDB, ordenados cronológicamente (ASC por timestamp).

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
  ]
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

---

### Requirement: AdminModule es aditivo y no modifica módulos existentes
El `AdminModule` SHALL importarse en `app.module.ts` sin modificar ningún otro módulo existente. La lógica de negocio de CU-01 (procesamiento de compras, Worker, conversaciones IA) SHALL permanecer inalterada.

#### Scenario: Tests de CU-01 siguen pasando tras registrar AdminModule
- **WHEN** se registra `AdminModule` en `app.module.ts` y se ejecuta `pnpm test` en `apps/api`
- **THEN** los 37 tests existentes pasan sin modificaciones

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
