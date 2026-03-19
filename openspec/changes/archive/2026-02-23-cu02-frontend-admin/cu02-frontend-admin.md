# CU-02: Frontend Admin Dashboard

> **Change**: `cu02-frontend-admin`
> **Estado**: 🔄 Pendiente de implementación
> **Fecha**: 2026-02-21
> **Prerequisito**: CU-01 completado ✅ (23/23 tareas, 37 tests pasando)

---

## Propuesta

### Por Qué

El MVP de Adresles necesita una interfaz de administración que cierre el ciclo visible del producto. El backend (CU-01) ya procesa compras, genera conversaciones IA y valida direcciones, pero toda esa actividad es invisible. El dashboard admin es el **actor "Admin/Mock UI"** definido en el Business.md (sección 2.1): la interfaz desde donde el administrador observa en tiempo real qué está ocurriendo en el sistema.

Sin este dashboard, el MVP no es demostrable ni operable: no hay forma de ver los pedidos recibidos, los usuarios que el sistema ha creado/reconocido, ni las conversaciones que la IA ha mantenido con los compradores.

### Qué Cambia

**Backend** (nuevo `AdminModule` en `apps/api`):
- Nuevo endpoint `GET /api/admin/orders` — lista todos los pedidos con contexto completo
- Nuevo endpoint `GET /api/admin/users` — lista todos los usuarios de Adresles (registrados y no registrados)
- Nuevo endpoint `GET /api/admin/conversations/:conversationId/messages` — mensajes de una conversación desde DynamoDB

**Frontend** (nueva app `apps/web-admin`):
- Dashboard Next.js 14 con tres vistas: órdenes, usuarios y visor de chat
- Vista `/orders`: tabla con estado de cada pedido y enlace directo a su conversación IA
- Vista `/users`: tabla de todos los usuarios del sistema con su estado de registro
- Vista `/conversations/[conversationId]`: reproductor de chat tipo burbuja de la conversación IA-usuario

### Capacidades

#### Nuevas Capacidades

- `admin-api`: Módulo NestJS con endpoints de lectura para órdenes, usuarios y mensajes de conversación
- `admin-dashboard-orders`: Vista tabular de pedidos con estados coloreados, modo (ADRESLES/TRADITIONAL) y acceso a chat
- `admin-dashboard-users`: Vista tabular de usuarios con distinción registrado/no registrado
- `admin-dashboard-chat`: Reproductor de conversación IA-usuario tipo burbuja, conectado a DynamoDB

#### Capacidades No Modificadas

- Flujo de procesamiento de compras (CU-01) — sin cambios
- Schema Prisma — sin cambios
- DynamoDB — sin cambios (el admin solo lee)
- Worker BullMQ — sin cambios

### Impacto

- Nueva app en el monorepo (`apps/web-admin`) — detectada automáticamente por `pnpm-workspace.yaml`
- Nuevo módulo en `apps/api/src/admin/`
- Sin migraciones de base de datos
- Sin cambios en `pnpm-workspace.yaml` ni `turbo.json` (ya configurados para `apps/*`)

### No-Objetivos de este Change

- Autenticación del admin (Supabase Auth — change posterior)
- Vista de detalles de dirección confirmada
- Acciones de admin sobre pedidos (cambiar estado, reenviar conversación)
- Frontend de usuario (`web-chat`) — change posterior
- Modo regalo en el dashboard

### Plan de Rollback

El `AdminModule` es aditivo (no modifica lógica existente). Si hay problemas, se puede eliminar el módulo sin afectar ningún otro flujo.

---

## Diseño

### Contexto Técnico

El stack del proyecto al iniciar este change:

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Backend API | NestJS 10.x + TypeScript 5.x | ✅ Operativo |
| ORM | Prisma 5.22.0 | ✅ 3 migraciones aplicadas |
| Base de datos relacional | Supabase (PostgreSQL 15) | ✅ Operativa |
| Mensajes de conversación | DynamoDB `adresles-messages` | ✅ TTL 90 días activo |
| Cola de trabajos | BullMQ + Redis 7 | ✅ Operativo |
| Frontend admin | — | ❌ No existe |

### Stack del Frontend

Next.js 14.x fue elegido en el ADR original para el Dashboard Admin por su SSR/SSG integrado, routing por carpetas y compatibilidad con Vercel (hosting planificado).

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 14.x | Framework React con App Router |
| TypeScript | 5.x | Type safety (strict mode) |
| TailwindCSS | 3.x | Utility-first CSS |
| Shadcn/ui | latest | Componentes UI accesibles (Radix UI) |
| `next/font` | built-in | Tipografía optimizada (Inter) |
| `date-fns` | 3.x | Formateo de fechas (locale ES) |
| `lucide-react` | latest | Iconos (incluido con Shadcn/ui) |
| `clsx` + `tailwind-merge` | latest | Composición de clases Tailwind |

### Arquitectura del AdminModule

El `AdminModule` es un módulo NestJS de solo lectura que delega en `PrismaService` (datos relacionales) y `MockConversationsService` (mensajes DynamoDB). No contiene lógica de negocio nueva.

```
AdminController
    │
    ├── adminService.getOrders()      → prisma.order.findMany(...)
    ├── adminService.getUsers()       → prisma.user.findMany(...)
    └── adminService.getMessages(id)  → mockConversationsService.getConversationHistory(id)
```

`AdminModule` importa:
- `PrismaModule` — ya existente en `apps/api/src/prisma/`
- `MockModule` — ya existente en `apps/api/src/mock/`, expone `MockConversationsService`

### Decisiones

#### D1: Reutilizar MockConversationsService para DynamoDB

**Decisión**: El endpoint `GET /api/admin/conversations/:id/messages` reutiliza `getConversationHistory()` de `MockConversationsService` en lugar de crear un nuevo cliente DynamoDB.

**Justificación**: La lógica de conexión a DynamoDB (credenciales, región, endpoint local para desarrollo) ya está encapsulada en `MockConversationsService`. Duplicarla violaría DRY. En una refactorización futura se puede extraer a un `DynamoDBService` compartido.

**Alternativa rechazada**: Crear `DynamoDBAdminService` nuevo — redundancia innecesaria para el MVP.

#### D2: Sin autenticación en el MVP

**Decisión**: El `AdminController` no tiene guards de autenticación.

**Justificación**: Supabase Auth está planificado pero no implementado. El MVP es un entorno controlado (servidor propio, no público). La auth se añade en un change dedicado posterior.

**Riesgo aceptado**: Los endpoints `/api/admin/*` son accesibles sin credenciales. Mitigación: no exponer el puerto del API directamente en producción (Traefik como proxy).

#### D3: Paginación básica desde el inicio

**Decisión**: Los endpoints de lista aceptan `?page=1&limit=50` con valores por defecto.

**Justificación**: El volumen de datos en el MVP es bajo, pero implementar paginación desde el inicio evita refactorizaciones. El frontend la usa aunque no muestre controles de paginación complejos inicialmente.

#### D4: Navegación unidireccional Orders → Chat

**Decisión**: La única entrada al visor de chat es desde la tabla de órdenes (icono de chat en cada fila).

**Justificación**: El admin llega a una conversación siempre desde el contexto de un pedido. No hay vista de "lista de todas las conversaciones" porque la conversación es un detalle del pedido, no una entidad de primer nivel en el dashboard.

#### D5: Server Components por defecto, Client Components solo cuando necesario

**Decisión**: Todas las páginas y la mayoría de los componentes son Server Components de Next.js 14. Solo se marcan con `'use client'` los componentes que requieren interactividad o hooks del navegador.

**Justificación**: Maximiza el rendimiento (menos JS enviado al cliente), simplifica el data fetching (fetch directo en el servidor) y aprovecha las características del App Router.

**Componentes que requieren `'use client'`**:
- `chat-view.tsx` (scroll automático al último mensaje con `useEffect`)
- `chat-expiry-banner.tsx` (cálculo de fecha relativa en cliente)

### Flujo de Datos

```
[Admin abre /orders]
        │
        ▼
GET /api/admin/orders
        │
        ▼
AdminService → prisma.order.findMany({
  include: {
    store: true,
    user: { include: { phone: true } },
    conversations: { select: { id: true } }
  },
  orderBy: { webhookReceivedAt: 'desc' },
  skip: (page-1) * limit,
  take: limit
})
        │
        ▼
[Tabla renderizada en Next.js Server Component]
[Fila con conversations.length > 0 → icono chat habilitado]
        │
        ▼ [click icono chat]
[Navega a /conversations/:conversationId]
        │
        ▼
GET /api/admin/conversations/:id/messages
        │
        ▼
AdminService → mockConversationsService.getConversationHistory(id)
        │      → DynamoDB QueryCommand (PK: conversationId, orden ASC por timestamp)
        │
        ▼
[Mensajes renderizados como burbujas de chat]
```

### TTL de Mensajes DynamoDB

Cada mensaje en DynamoDB tiene:
- `expiresAt`: timestamp Unix = `createdAt + 90 días`
- DynamoDB TTL elimina el ítem automáticamente cuando `now > expiresAt`
- `QueryCommand` nunca devuelve ítems expirados (DynamoDB los filtra)

El frontend muestra un **banner de advertencia** cuando `expiresAt` del primer mensaje (en Unix timestamp) es menor que `now + 7 días`.

---

## Sistema de Diseño — Brand Adresles

### Paleta de Colores

La identidad de Adresles se construye sobre un contraste fuerte negro-lima con el teal como acento funcional.

| Token | HEX | Uso principal |
|-------|-----|---------------|
| `brand-black` | `#000000` | Sidebar, header, texto principal, fondos de contraste |
| `brand-lime` | `#DBFF36` | CTA, estado activo en nav, badges de atención, acentos |
| `brand-teal` | `#00687D` | Burbujas de usuario en chat, badges de éxito, links |
| `brand-white` | `#FFFFFF` | Fondos de contenido, texto sobre negro/teal |

**Pares de contraste accesibles (WCAG AA):**
- `#DBFF36` sobre `#000000` ✅ (ratio 13.1:1)
- `#FFFFFF` sobre `#000000` ✅ (ratio 21:1)
- `#FFFFFF` sobre `#00687D` ✅ (ratio 5.3:1)
- `#000000` sobre `#DBFF36` ✅ (ratio 13.1:1)

### Configuración Tailwind — `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          lime:  '#DBFF36',
          teal:  '#00687D',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        chat:    '1.25rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Variables CSS — `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --brand-black: 0 0% 0%;
    --brand-lime:  74 100% 60%;
    --brand-teal:  190 100% 24%;
    --brand-white: 0 0% 100%;

    /* Shadcn/ui token overrides */
    --background:  0 0% 100%;
    --foreground:  0 0% 0%;
    --primary:     0 0% 0%;        /* brand-black */
    --primary-foreground: 74 100% 60%;  /* brand-lime */
    --accent:      74 100% 60%;    /* brand-lime */
    --accent-foreground: 0 0% 0%;
    --ring:        190 100% 24%;   /* brand-teal */
  }
}
```

### Tipografía

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

- **Título de página**: `text-2xl font-bold tracking-tight` — 24px, bold, ligero tracking
- **Subtítulo / label**: `text-sm font-medium text-muted-foreground`
- **Cuerpo tabla**: `text-sm` — 14px
- **Metadatos / timestamp**: `text-xs text-muted-foreground` — 12px

### Layout General

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR (#000000)  │  MAIN CONTENT (#FFFFFF)            │
│  ─────────────────  │  ─────────────────────────────── │
│  🏷 adresles        │  [breadcrumb / page title]         │
│                     │                                    │
│  > Pedidos  ←activo │  [tabla / contenido principal]     │
│    con borde #DBFF36│                                    │
│  · Usuarios         │                                    │
│                     │                                    │
│  ──────────────     │                                    │
│  v0.1.0             │                                    │
└──────────────────────────────────────────────────────────┘
  w-64 (fija)          flex-1 (scroll)
```

### Diseño del Sidebar

- **Fondo**: `bg-brand-black` (`#000000`)
- **Logo**: Logotipo Adresles o wordmark en blanco, esquina superior izquierda
- **Nav item inactivo**: `text-white/70 hover:text-white hover:bg-white/10`
- **Nav item activo**: `text-brand-lime border-l-2 border-brand-lime bg-white/5`
- **Footer del sidebar**: versión de la app en `text-white/30 text-xs`

### Diseño de Tablas

- **Header de tabla**: `bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500`
- **Fila normal**: `bg-white border-b border-gray-100`
- **Fila hover**: `hover:bg-brand-lime/5` (5% de opacidad del lime)
- **Texto principal en celda**: `text-sm text-gray-900 font-medium`
- **Texto secundario en celda**: `text-xs text-gray-500`

### Diseño de Badges

```
Paleta de badges alineada con la identidad de marca:

OrderStatus:
┌─────────────────┬──────────────────────────────────────────────┐
│ PENDING_PAYMENT │ bg-gray-100    text-gray-600                 │
│ PENDING_ADDRESS │ bg-brand-lime  text-brand-black  (atención)  │
│ READY_TO_PROCESS│ bg-brand-teal  text-white        (acción)    │
│ COMPLETED       │ bg-emerald-100 text-emerald-700  (éxito)     │
│ CANCELED        │ bg-red-100     text-red-600      (error)     │
└─────────────────┴──────────────────────────────────────────────┘

OrderMode:
┌─────────────┬─────────────────────────────────────────────┐
│ ADRESLES    │ bg-brand-black text-brand-lime  (marca)     │
│ TRADITIONAL │ bg-gray-100    text-gray-700    (neutro)    │
└─────────────┴─────────────────────────────────────────────┘

isRegistered:
┌────────────┬────────────────────────────────────────────┐
│ true  (Sí) │ bg-brand-teal/10 text-brand-teal           │
│ false (No) │ bg-gray-100      text-gray-500             │
└────────────┴────────────────────────────────────────────┘

ConversationStatus:
┌──────────────┬──────────────────────────────────────────┐
│ ACTIVE       │ bg-brand-teal/10 text-brand-teal         │
│ WAITING_USER │ bg-brand-lime    text-brand-black        │
│ COMPLETED    │ bg-emerald-100   text-emerald-700        │
│ ESCALATED    │ bg-orange-100    text-orange-700         │
│ TIMEOUT      │ bg-red-100       text-red-600            │
└──────────────┴──────────────────────────────────────────┘
```

### Diseño de Burbujas de Chat

```
assistant (IA Adresles):
  ┌───────────────────────────────────────────┐
  │ bg-gray-100 · rounded-chat rounded-tl-sm  │
  │ text-gray-900 text-sm                     │
  │ borde izquierdo: border-l-2 #00687D       │
  └───────────────────────────────────────────┘
  timestamp: text-xs text-gray-400 mt-1

user (comprador):
                ┌──────────────────────────────┐
                │ bg-brand-teal (#00687D)       │
                │ text-white text-sm            │
                │ rounded-chat rounded-tr-sm    │
                └──────────────────────────────┘
                timestamp: text-xs text-white/60 mt-1

system (mensaje de contexto):
  ─────────── texto sutil centrado ───────────
  text-xs text-gray-400 italic text-center
  separado por líneas horizontales finas
```

### Banner de Expiración TTL

```
┌─────────────────────────────────────────────────────────────┐
│ 🕐  bg-brand-lime  text-brand-black  font-medium  text-sm  │
│     Los mensajes expiran el [fecha]. Después no             │
│     estarán disponibles.                                    │
└─────────────────────────────────────────────────────────────┘
```
- Fondo `bg-brand-lime` + texto `text-brand-black` — máximo contraste y atención
- Icono `Clock` de `lucide-react`
- Posición: sticky al top del área de mensajes, debajo del header

---

## Especificación de API

### GET /api/admin/orders

**Query params**: `?page=1&limit=50`

**Response** `200 OK`:
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

### GET /api/admin/users

**Query params**: `?page=1&limit=50`

**Response** `200 OK`:
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

### GET /api/admin/conversations/:conversationId/messages

**Response** `200 OK`:
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

**Response** `404 Not Found`: si `conversationId` no existe en Prisma.

---

## TypeScript — Tipos e Interfaces

Todos los tipos en `src/types/`. No usar `any`; usar `unknown` si el tipo es indeterminado.

### `src/types/api.ts`

```typescript
// Tipos del API Admin — alineados con el schema Prisma

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

// ─── Entidades ─────────────────────────────────────────────────

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
  _count: {
    orders: number;
    addresses: number;
  };
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
  expiresAt: number;
}

// ─── Responses ─────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ConversationMessagesResponse {
  conversationId: string;
  messages: ConversationMessage[];
}

export type OrdersResponse = PaginatedResponse<AdminOrder>;
export type UsersResponse = PaginatedResponse<AdminUser>;
```

---

## Estructura de Archivos

### Backend (apps/api)

```
apps/api/src/admin/
├── admin.module.ts          ← Importa PrismaModule + MockModule
├── admin.controller.ts      ← GET /api/admin/orders, /users, /conversations/:id/messages
├── admin.service.ts         ← Lógica de consulta Prisma + delegación a MockConversationsService
├── admin.controller.spec.ts ← Tests integración HTTP (supertest)
└── admin.service.spec.ts    ← Tests unitarios (mock Prisma + mock MockConversationsService)
```

Registro del módulo en `apps/api/src/app.module.ts`:
```typescript
imports: [
  // ... módulos existentes
  AdminModule,
]
```

### Frontend (apps/web-admin)

```
apps/web-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx                           ← RootLayout + Inter font + sidebar
│   │   ├── globals.css                          ← Variables CSS brand + Tailwind
│   │   ├── page.tsx                             ← redirect('/orders')
│   │   ├── orders/
│   │   │   ├── page.tsx                         ← Server Component (fetch + render)
│   │   │   ├── loading.tsx                      ← Suspense skeleton de tabla
│   │   │   └── error.tsx                        ← Error boundary de página
│   │   ├── users/
│   │   │   ├── page.tsx                         ← Server Component (fetch + render)
│   │   │   ├── loading.tsx                      ← Suspense skeleton de tabla
│   │   │   └── error.tsx                        ← Error boundary de página
│   │   └── conversations/
│   │       └── [conversationId]/
│   │           ├── page.tsx                     ← Server Component (fetch + render)
│   │           ├── loading.tsx                  ← Suspense skeleton de chat
│   │           └── error.tsx                    ← Error boundary de página
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx                      ← 'use client' — nav activa con usePathname
│   │   ├── orders/
│   │   │   ├── orders-table.tsx                 ← Server Component — Shadcn Table
│   │   │   ├── orders-table-skeleton.tsx        ← Skeleton de filas
│   │   │   ├── orders-empty-state.tsx           ← Estado vacío (sin pedidos)
│   │   │   └── order-status-badge.tsx           ← Badge por OrderStatus
│   │   ├── users/
│   │   │   ├── users-table.tsx                  ← Server Component — Shadcn Table
│   │   │   ├── users-table-skeleton.tsx         ← Skeleton de filas
│   │   │   ├── users-empty-state.tsx            ← Estado vacío (sin usuarios)
│   │   │   └── user-registered-badge.tsx        ← Badge Sí/No por isRegistered
│   │   └── chat/
│   │       ├── chat-view.tsx                    ← 'use client' — scroll al último mensaje
│   │       ├── chat-view-skeleton.tsx           ← Skeleton de burbujas
│   │       ├── chat-bubble.tsx                  ← Server Component — burbuja individual
│   │       └── chat-expiry-banner.tsx           ← 'use client' — cálculo TTL en cliente
│   ├── lib/
│   │   ├── api.ts                               ← Fetch helpers tipados
│   │   └── utils.ts                             ← Formatters (fecha, moneda, teléfono, nombre)
│   └── types/
│       └── api.ts                               ← Interfaces TypeScript (ver sección anterior)
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## Implementación Detallada de Componentes Clave

### `src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },   // ISR: revalidar cada 30s en producción
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getOrders(page = 1, limit = 50): Promise<OrdersResponse> {
  return apiFetch(`/api/admin/orders?page=${page}&limit=${limit}`);
}

export function getUsers(page = 1, limit = 50): Promise<UsersResponse> {
  return apiFetch(`/api/admin/users?page=${page}&limit=${limit}`);
}

export function getConversationMessages(
  conversationId: string,
): Promise<ConversationMessagesResponse> {
  return apiFetch(`/api/admin/conversations/${conversationId}/messages`);
}
```

> `next: { revalidate: 30 }` — los datos del admin no son tiempo real; 30 segundos es suficiente para el MVP. En producción se puede ajustar o forzar `cache: 'no-store'` si se necesita siempre fresco.

### `src/lib/utils.ts`

```typescript
import { format, formatDistanceToNow, fromUnixTime, isAfter, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es });
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
}

export function formatCurrency(amount: string, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export function formatPhone(e164: string): string {
  return e164;
}

export function formatFullName(
  firstName: string | null,
  lastName: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(' ') || '—';
}

export function isExpiringSoon(expiresAtUnix: number, daysThreshold = 7): boolean {
  const expiresAt = fromUnixTime(expiresAtUnix);
  return !isAfter(expiresAt, addDays(new Date(), daysThreshold));
}

export function formatExpiryDate(expiresAtUnix: number): string {
  return format(fromUnixTime(expiresAtUnix), "d 'de' MMMM 'de' yyyy", { locale: es });
}
```

### `src/components/layout/sidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/orders', label: 'Pedidos',  icon: ShoppingCart },
  { href: '/users',  label: 'Usuarios', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-brand-black">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-brand-lime">adresles</span>
        <span className="text-xs text-white/30">admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-brand-lime bg-white/5 text-brand-lime'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4">
        <p className="text-xs text-white/30">v0.1.0</p>
      </div>
    </aside>
  );
}
```

### `src/components/orders/order-status-badge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus, OrderMode } from '@/types/api';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT:  'bg-gray-100 text-gray-600 border-gray-200',
  PENDING_ADDRESS:  'bg-brand-lime text-brand-black border-brand-lime',
  READY_TO_PROCESS: 'bg-brand-teal text-white border-brand-teal',
  COMPLETED:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELED:         'bg-red-100 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT:  'Pago pendiente',
  PENDING_ADDRESS:  'Dirección pendiente',
  READY_TO_PROCESS: 'Listo',
  COMPLETED:        'Completado',
  CANCELED:         'Cancelado',
};

const MODE_STYLES: Record<OrderMode, string> = {
  ADRESLES:    'bg-brand-black text-brand-lime border-brand-black',
  TRADITIONAL: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function OrderModeBadge({ mode }: { mode: OrderMode }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', MODE_STYLES[mode])}>
      {mode === 'ADRESLES' ? 'Adresles' : 'Tradicional'}
    </Badge>
  );
}
```

### `src/components/chat/chat-bubble.tsx`

```typescript
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bot, User } from 'lucide-react';
import type { ConversationMessage } from '@/types/api';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const time = format(new Date(message.timestamp), 'HH:mm', { locale: es });

  if (message.role === 'system') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-gray-200" />
        <p className="text-xs italic text-gray-400">{message.content}</p>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
    );
  }

  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
          <Bot className="h-4 w-4 text-brand-teal" aria-hidden="true" />
        </div>
      )}

      <div className={cn('flex max-w-[70%] flex-col', isAssistant ? 'items-start' : 'items-end')}>
        <div
          className={cn(
            'rounded-chat px-4 py-2.5 text-sm',
            isAssistant
              ? 'rounded-tl-sm border-l-2 border-brand-teal bg-gray-100 text-gray-900'
              : 'rounded-tr-sm bg-brand-teal text-white',
          )}
        >
          {message.content}
        </div>
        <time
          dateTime={message.timestamp}
          className={cn(
            'mt-1 text-xs',
            isAssistant ? 'text-gray-400' : 'text-white/60',
          )}
        >
          {time}
        </time>
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
```

### `src/components/chat/chat-expiry-banner.tsx`

```typescript
'use client';

import { Clock } from 'lucide-react';
import { isExpiringSoon, formatExpiryDate } from '@/lib/utils';

interface ChatExpiryBannerProps {
  expiresAtUnix: number;
}

export function ChatExpiryBanner({ expiresAtUnix }: ChatExpiryBannerProps) {
  if (!isExpiringSoon(expiresAtUnix)) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-10 flex items-center gap-2 bg-brand-lime px-4 py-2.5 text-sm font-medium text-brand-black"
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Los mensajes de esta conversación expiran el{' '}
        <strong>{formatExpiryDate(expiresAtUnix)}</strong>. Después no estarán disponibles.
      </span>
    </div>
  );
}
```

### `src/app/orders/loading.tsx` — Skeleton de tabla

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-lg border">
        <div className="border-b bg-gray-50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Estados Vacíos

Cuando una lista no tiene datos, mostrar un estado vacío informativo:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              [icono ShoppingCart]                    │
│           Sin pedidos todavía                        │
│  Cuando se procese un pedido aparecerá aquí.         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Componente `orders-empty-state.tsx`:
- Icono de `lucide-react` (`ShoppingCart` / `Users`)
- Título `text-base font-medium text-gray-900`
- Descripción `text-sm text-gray-500`
- Centrado verticalmente en el área de tabla

---

## Especificación de Vistas

### Vista Órdenes `/orders`

**Columnas de la tabla:**

| Columna | Campo Prisma | Notas |
|---------|-------------|-------|
| N.º pedido | `externalOrderNumber` | Fallback: `externalOrderId` |
| Tienda | `store.name` | — |
| Usuario | `user.firstName + user.lastName` + `user.phone.e164` | Dos líneas |
| Importe | `totalAmount` + `currency` | Formateado con `formatCurrency()` |
| Estado | `status` | `<OrderStatusBadge>` |
| Modo | `orderMode` | `<OrderModeBadge>` |
| Fecha | `webhookReceivedAt` | Formateado con `formatDate()` |
| Chat | `conversations[0].id` | Icono `MessageSquare` (lucide), visible solo si `conversations.length > 0`; `aria-label="Ver conversación"` |

**Colores de badge**: ver sección Sistema de Diseño → Badges.

**Ordenación**: por `webhookReceivedAt` descendente (más recientes primero).

---

### Vista Usuarios `/users`

**Columnas de la tabla:**

| Columna | Campo Prisma | Notas |
|---------|-------------|-------|
| Nombre | `firstName + lastName` | `formatFullName()` |
| Teléfono | `phone.e164` | `formatPhone()` |
| Email | `email` | "—" si null |
| Registrado | `isRegistered` | `<UserRegisteredBadge>` |
| Pedidos | `_count.orders` | Número |
| Direcciones | `_count.addresses` | Número |
| Última interacción | `lastInteractionAt` | `formatRelativeDate()` — "Hace 2h"; tooltip con fecha absoluta |

**Filtro**: solo usuarios con `isDeleted = false`.

**Ordenación**: por `lastInteractionAt` descendente (nulos al final).

---

### Vista Conversación `/conversations/[conversationId]`

**Header de la página:**

```
← Pedido #[externalOrderNumber]    [conversationType badge]    [status badge]
Iniciada: [startedAt] · Completada: [completedAt o "En curso"]
```

- El botón `← Pedido` usa `<Link href="/orders">` + clase `text-brand-teal hover:underline`
- `conversationType` valores: `GET_ADDRESS`, `INFORMATION`, `REGISTER`, `GIFT_NOTIFICATION`, `SUPPORT`
- `status` badge: colores según tabla de la sección de diseño

**Burbujas de mensajes**: ver sección Sistema de Diseño → Burbujas y componente `<ChatBubble>`.

**Banner de expiración TTL**: ver componente `<ChatExpiryBanner>`.

**Wireframe:**

```
┌─────────────────────────────────────────────────────────────┐
│ bg-brand-black text-white px-6 py-4                         │
│ ← Pedido #1001        [GET_ADDRESS]    [● COMPLETED verde]  │
│ Iniciada: 21 Feb 2026, 10:01 · Completada: 10:05            │
├─────────────────────────────────────────────────────────────┤
│ ⚠ [banner DBFF36] expira el 22 May 2026        (sticky)     │
├─────────────────────────────────────────────────────────────┤
│ bg-white overflow-y-auto flex-1 px-6 py-4 space-y-4        │
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
│    │ Tu pedido está en camino.                             │
│      10:05                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Header de la conversación: `bg-brand-black` + texto blanco — coherente con el sidebar y refuerza identidad de marca.

---

## Flujo de Navegación

```
/orders
  └─ [icono chat en fila] ──▶ /conversations/[conversationId]
                                  └─ [← Pedido] ──▶ /orders
```

---

## Accesibilidad (WCAG 2.1 AA)

- **Contraste**: todos los pares de color cumplen AA (ratio ≥ 4.5:1 para texto normal)
- **Tablas**: usar `<th scope="col">` en headers; `role="rowheader"` en primera columna si aplica
- **Botones iconográficos**: siempre con `aria-label` (ej.: `aria-label="Ver conversación del pedido #1001"`)
- **Badges**: usar `<span role="status">` para estados que cambian dinámicamente
- **Navegación**: el sidebar incluye `<nav aria-label="Navegación principal">`
- **Mensajes de chat**: el contenedor del chat incluye `role="log"` + `aria-live="polite"` + `aria-label="Conversación"`
- **Focus visible**: Tailwind `focus-visible:ring-2 focus-visible:ring-brand-teal` en todos los elementos interactivos
- **Skip link**: `<a href="#main-content" className="sr-only focus:not-sr-only">Saltar al contenido</a>` en el layout raíz

---

## Requisitos No Funcionales

### Rendimiento
- **First Contentful Paint**: < 1.5s (Server Components + no JS en cliente para tablas)
- **Largest Contentful Paint**: < 2.5s
- **ISR `revalidate: 30`**: datos actualizados cada 30 segundos sin impacto en TTFB
- **No layout shift**: usar `min-h` en skeletons con las mismas dimensiones que el contenido real

### Compatibilidad
- Navegadores modernos: Chrome 110+, Firefox 110+, Safari 16+, Edge 110+
- Resolución mínima: 1280px de ancho (dashboard admin, no diseñado para móvil)

### Convenciones de Código
- Código fuente en **inglés** (variables, funciones, clases)
- Comentarios y docs en **español** (per `.cursor/rules/base-standards.mdc`)
- `strict: true` en tsconfig
- Sin `any` — usar tipos explícitos o `unknown`
- `cn()` para todas las combinaciones de clases Tailwind condicionales

---

## Tareas de Implementación

### 1. Backend — AdminModule

- [ ] 1.1 Crear `apps/api/src/admin/admin.module.ts` — importa `PrismaModule` y `MockModule`
- [ ] 1.2 Crear `apps/api/src/admin/admin.service.ts` — métodos `getOrders(page, limit)`, `getUsers(page, limit)`, `getConversationMessages(conversationId)`
- [ ] 1.3 Crear `apps/api/src/admin/admin.controller.ts` — tres endpoints GET con `@Controller('admin')` y `@Get(...)`
- [ ] 1.4 Registrar `AdminModule` en `apps/api/src/app.module.ts`
- [ ] 1.5 Verificar que `MockModule` tiene `exports: [MockConversationsService]`; añadirlo si no está
- [ ] 1.6 Crear `apps/api/src/admin/admin.service.spec.ts` — tests unitarios (Prisma mock + MockConversationsService mock)
- [ ] 1.7 Crear `apps/api/src/admin/admin.controller.spec.ts` — tests de integración HTTP con `supertest`
- [ ] 1.8 Verificar que los 37 tests existentes siguen pasando: `cd apps/api && pnpm test`

### 2. Frontend — Scaffold y Configuración

- [ ] 2.1 Inicializar `apps/web-admin` con Next.js 14 (`create-next-app` — TypeScript, Tailwind, App Router, sin `src` separado)
- [ ] 2.2 Configurar `package.json` con nombre `@adresles/web-admin` y versión `0.1.0`
- [ ] 2.3 Instalar dependencias adicionales: `date-fns`, `clsx`, `tailwind-merge`
- [ ] 2.4 Instalar y configurar Shadcn/ui: `npx shadcn-ui@latest init` (tema: zinc, CSS variables: sí)
- [ ] 2.5 Añadir componentes Shadcn: `table`, `badge`, `button`, `separator`, `skeleton`
- [ ] 2.6 Actualizar `tailwind.config.ts` con tokens de brand Adresles (ver sección Sistema de Diseño)
- [ ] 2.7 Actualizar `src/app/globals.css` con variables CSS de brand y overrides Shadcn
- [ ] 2.8 Crear `src/types/api.ts` con todas las interfaces TypeScript (ver sección Tipos)
- [ ] 2.9 Crear `src/lib/api.ts` con `apiFetch`, `getOrders`, `getUsers`, `getConversationMessages`
- [ ] 2.10 Crear `src/lib/utils.ts` con `cn`, `formatDate`, `formatRelativeDate`, `formatCurrency`, `formatPhone`, `formatFullName`, `isExpiringSoon`, `formatExpiryDate`
- [ ] 2.11 Crear `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`

### 3. Frontend — Layout

- [ ] 3.1 Crear `src/app/layout.tsx` — RootLayout con Inter font, `<Sidebar>` y `<main id="main-content">`
- [ ] 3.2 Crear `src/components/layout/sidebar.tsx` — `'use client'`, `usePathname()`, nav activa con borde `brand-lime`
- [ ] 3.3 Crear `src/app/page.tsx` — `redirect('/orders')`

### 4. Frontend — Vista Órdenes

- [ ] 4.1 Crear `src/app/orders/page.tsx` — Server Component, `getOrders()`, `<OrdersTable>` o `<OrdersEmptyState>`
- [ ] 4.2 Crear `src/app/orders/loading.tsx` — skeleton con 8 filas
- [ ] 4.3 Crear `src/app/orders/error.tsx` — error boundary con mensaje amigable y botón retry
- [ ] 4.4 Crear `src/components/orders/orders-table.tsx` — Shadcn `Table`, columnas según especificación
- [ ] 4.5 Crear `src/components/orders/order-status-badge.tsx` — badges `OrderStatusBadge` y `OrderModeBadge`
- [ ] 4.6 Crear `src/components/orders/orders-empty-state.tsx` — icono + texto vacío

### 5. Frontend — Vista Usuarios

- [ ] 5.1 Crear `src/app/users/page.tsx` — Server Component, `getUsers()`, `<UsersTable>` o `<UsersEmptyState>`
- [ ] 5.2 Crear `src/app/users/loading.tsx` — skeleton con 8 filas
- [ ] 5.3 Crear `src/app/users/error.tsx` — error boundary
- [ ] 5.4 Crear `src/components/users/users-table.tsx` — columnas según especificación
- [ ] 5.5 Crear `src/components/users/user-registered-badge.tsx` — badge Sí/No
- [ ] 5.6 Crear `src/components/users/users-empty-state.tsx` — icono + texto vacío

### 6. Frontend — Vista Conversación

- [ ] 6.1 Crear `src/app/conversations/[conversationId]/page.tsx` — Server Component, `getConversationMessages(id)`, `<ChatView>`
- [ ] 6.2 Crear `src/app/conversations/[conversationId]/loading.tsx` — skeleton de 5-6 burbujas alternadas
- [ ] 6.3 Crear `src/app/conversations/[conversationId]/error.tsx` — error boundary con enlace de vuelta
- [ ] 6.4 Crear `src/components/chat/chat-view.tsx` — `'use client'`, `useEffect` para scroll al último mensaje, header con metadata
- [ ] 6.5 Crear `src/components/chat/chat-bubble.tsx` — burbuja por `role`, diseño brand (ver sección Burbujas)
- [ ] 6.6 Crear `src/components/chat/chat-expiry-banner.tsx` — `'use client'`, banner `bg-brand-lime` si TTL < 7 días

---

## Variables de Entorno

### `apps/web-admin/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

En producción (Vercel):
```
NEXT_PUBLIC_API_URL=https://api.adresles.com
```

---

## Datos del Schema Prisma Utilizados

Modelos en [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma):

| Modelo | Campos usados |
|--------|--------------|
| `Order` | `id`, `externalOrderId`, `externalOrderNumber`, `totalAmount`, `currency`, `feePercentage`, `feeAmount`, `status`, `orderMode`, `paymentType`, `isGift`, `webhookReceivedAt`, `addressConfirmedAt` |
| `Store` | `id`, `name`, `url` |
| `User` | `id`, `firstName`, `lastName`, `email`, `isRegistered`, `registeredAt`, `lastInteractionAt`, `isDeleted` |
| `Phone` | `e164`, `formattedNational`, `country` |
| `Conversation` | `id`, `orderId`, `conversationType`, `status`, `startedAt`, `completedAt` |

DynamoDB `adresles-messages`:
- PK: `conversationId` (String)
- SK: `timestamp` (String ISO-8601)
- Campos: `messageId`, `role` (`user` / `assistant` / `system`), `content`, `expiresAt` (Number Unix)
- TTL attribute: `expiresAt`

---

## Notas para la Implementación

- Verificar que `MockModule` tiene `exports: [MockConversationsService]` antes de que `AdminModule` lo importe. Si no, añadirlo al array `exports` del módulo.
- Los Server Components de Next.js 14 hacen `fetch` directamente en el servidor — no se necesita estado en cliente para las vistas de tabla. El `revalidate: 30` garantiza datos razonablemente frescos sin peticiones en cada render.
- `chat-view.tsx` es `'use client'` exclusivamente para el scroll automático al último mensaje (`useEffect` + `ref`). Todo el resto del chat (burbujas, header) puede permanecer como Server Component.
- `chat-expiry-banner.tsx` es `'use client'` porque el cálculo de "X días hasta expiración" se basa en `Date.now()` del navegador, que no está disponible en el servidor.
- Usar `next/link` para toda la navegación interna — nunca `<a>` directos.
- Seguir el estándar de testing del proyecto: un `.spec.ts` por servicio y uno por controller, con mocks explícitos de dependencias externas (Prisma y DynamoDB).
- El `borderRadius: chat: '1.25rem'` en Tailwind permite usar `rounded-chat` en las burbujas para un estilo más suave y moderno.
