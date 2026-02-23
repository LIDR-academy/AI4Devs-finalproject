## Context

CU-01 dejó un backend funcional (NestJS + Prisma + DynamoDB + BullMQ) sin interfaz visible. Este change añade:
1. Un `AdminModule` NestJS de solo lectura sobre los datos existentes.
2. Una app Next.js 14 (`apps/web-admin`) que consume esos endpoints.

El sistema usa Supabase (PostgreSQL vía Prisma) para datos relacionales y DynamoDB para mensajes de conversación. No hay auth de admin implementada; el MVP corre en entorno controlado.

### Stack existente al inicio del change

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Backend API | NestJS 10.x + TypeScript 5.x | ✅ Operativo |
| ORM | Prisma 5.22.0 | ✅ 3 migraciones aplicadas |
| Base de datos relacional | Supabase (PostgreSQL 15) | ✅ Operativa |
| Mensajes de conversación | DynamoDB `adresles-messages` | ✅ TTL 90 días activo |
| Cola de trabajos | BullMQ + Redis 7 | ✅ Operativo |
| Frontend admin | — | ❌ No existe |

### Stack del Frontend (`apps/web-admin`)

Next.js 14.x fue elegido en el ADR original para el Dashboard Admin por su SSR/SSG integrado, routing por carpetas y compatibilidad con Vercel.

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

## Goals / Non-Goals

**Goals:**
- Exponer tres endpoints de lectura (`/api/admin/orders`, `/api/admin/users`, `/api/admin/conversations/:id/messages`) sin duplicar lógica de acceso a datos
- Renderizar pedidos, usuarios y conversaciones en un dashboard Next.js 14 con identidad visual Adresles
- Mantener los 37 tests de CU-01 pasando sin modificar ningún módulo existente

**Non-Goals:**
- Autenticación/autorización del admin (change posterior con Supabase Auth)
- Vista de detalles de dirección confirmada
- Acciones de admin sobre pedidos (cambiar estado, reenviar conversación)
- Frontend de usuario (`web-chat`) — change posterior
- Modo regalo en el dashboard

## Decisions

### D1: AdminModule reutiliza MockConversationsService para acceso a DynamoDB

La lógica de conexión a DynamoDB (credenciales, región, endpoint local) ya está encapsulada en `MockConversationsService`. `AdminModule` importa `MockModule` y delega `getConversationHistory()` directamente.

**Alternativa rechazada**: Crear un `DynamoDBAdminService` nuevo — duplicaría configuración y violaría DRY. En una refactorización futura se puede extraer a un `DynamoDBService` compartido.

### D2: Sin autenticación en el MVP

`AdminController` no lleva guards. El MVP corre en servidor propio con Traefik como proxy; los puertos no están expuestos directamente. La auth con Supabase se añade en un change dedicado.

**Riesgo aceptado**: Endpoints `/api/admin/*` accesibles sin credenciales en la red interna.

### D3: Paginación básica desde el inicio

Los endpoints de lista aceptan `?page=1&limit=50`. Aunque el volumen del MVP es bajo, implementarla desde el inicio evita refactorizaciones futuras. El frontend la usa aunque no muestre controles complejos.

### D4: Navegación unidireccional Orders → Chat

La única entrada al visor de chat es desde la tabla de órdenes. La conversación es un detalle del pedido, no una entidad de primer nivel. No existe una vista "lista de todas las conversaciones".

### D5: Server Components por defecto, 'use client' solo donde necesario

Next.js 14 App Router: todas las páginas y componentes son Server Components. Solo se marcan con `'use client'` los componentes que requieren interactividad o hooks del navegador:
- `sidebar.tsx` — necesita `usePathname()` para la nav activa
- `chat-view.tsx` — necesita `useEffect` + `ref` para scroll al último mensaje
- `chat-expiry-banner.tsx` — calcula `Date.now()` en cliente para el aviso de TTL

Esto maximiza rendimiento (menos JS en cliente) y simplifica el data fetching (fetch directo en servidor con `revalidate: 30`). Los datos del admin no son tiempo real; 30 segundos es suficiente para el MVP. En producción se puede forzar `cache: 'no-store'` si se necesita siempre fresco.

## Arquitectura del AdminModule

El `AdminModule` es un módulo NestJS de **solo lectura** que delega en `PrismaService` (datos relacionales) y `MockConversationsService` (mensajes DynamoDB). No contiene lógica de negocio nueva.

```
AdminController
    │
    ├── adminService.getOrders(page, limit)    → prisma.order.findMany(...)
    ├── adminService.getUsers(page, limit)     → prisma.user.findMany(...)
    └── adminService.getMessages(convId)       → mockConversationsService.getConversationHistory(id)
```

`AdminModule` importa:
- `PrismaModule` — ya existente en `apps/api/src/prisma/`
- `MockModule` — ya existente en `apps/api/src/mock/`, debe exportar `MockConversationsService`

Ficheros del módulo:
```
apps/api/src/admin/
├── admin.module.ts          ← Importa PrismaModule + MockModule
├── admin.controller.ts      ← GET /api/admin/orders, /users, /conversations/:id/messages
├── admin.service.ts         ← Lógica de consulta Prisma + delegación a MockConversationsService
├── admin.controller.spec.ts ← Tests integración HTTP (supertest)
└── admin.service.spec.ts    ← Tests unitarios (mock Prisma + mock MockConversationsService)
```

## Flujo de Datos

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

## TTL de Mensajes DynamoDB

Cada mensaje en DynamoDB tiene:
- `expiresAt`: timestamp Unix = `createdAt + 90 días`
- DynamoDB TTL elimina el ítem automáticamente cuando `now > expiresAt`
- `QueryCommand` nunca devuelve ítems expirados (DynamoDB los filtra internamente)

El frontend muestra un **banner de advertencia** (`bg-brand-lime`) cuando `expiresAt` del primer mensaje (Unix timestamp) es menor que `now + 7 días`. El cálculo se hace en cliente (`'use client'`) porque depende de `Date.now()` del navegador.

## Sistema de Diseño — Brand Adresles

La identidad visual se construye sobre un contraste fuerte negro-lima con el teal como acento funcional.

### Paleta de Colores

| Token | HEX | Uso principal |
|-------|-----|---------------|
| `brand-black` | `#000000` | Sidebar, header chat, texto principal, fondos de contraste |
| `brand-lime` | `#DBFF36` | CTA, estado activo en nav, badges de atención, banner TTL |
| `brand-teal` | `#00687D` | Burbujas de usuario, badges de éxito, links |
| `brand-white` | `#FFFFFF` | Fondos de contenido, texto sobre negro/teal |

**Pares de contraste accesibles (WCAG AA):**
- `#DBFF36` sobre `#000000` ✅ (ratio 13.1:1)
- `#FFFFFF` sobre `#000000` ✅ (ratio 21:1)
- `#FFFFFF` sobre `#00687D` ✅ (ratio 5.3:1)
- `#000000` sobre `#DBFF36` ✅ (ratio 13.1:1)

### Configuración Tailwind (`tailwind.config.ts`)

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
        chat:    '1.25rem',  // permite usar `rounded-chat` en burbujas
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Variables CSS (`src/app/globals.css`)

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
    --primary:     0 0% 0%;               /* brand-black */
    --primary-foreground: 74 100% 60%;    /* brand-lime */
    --accent:      74 100% 60%;           /* brand-lime */
    --accent-foreground: 0 0% 0%;
    --ring:        190 100% 24%;          /* brand-teal */
  }
}
```

### Tipografía

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
```

- **Título de página**: `text-2xl font-bold tracking-tight` — 24px, bold
- **Subtítulo / label**: `text-sm font-medium text-muted-foreground`
- **Cuerpo tabla**: `text-sm` — 14px
- **Metadatos / timestamp**: `text-xs text-muted-foreground` — 12px

### Layout General

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR (#000000)  │  MAIN CONTENT (#FFFFFF)            │
│  ─────────────────  │  ─────────────────────────────── │
│  🏷 adresles admin  │  [breadcrumb / page title]         │
│                     │                                    │
│  > Pedidos  ←activo │  [tabla / contenido principal]     │
│    borde #DBFF36    │                                    │
│  · Usuarios         │                                    │
│                     │                                    │
│  ──────────────     │                                    │
│  v0.1.0             │                                    │
└──────────────────────────────────────────────────────────┘
  w-64 (fija)          flex-1 (scroll)
```

### Diseño de Badges

```
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
assistant (IA Adresles) — alineado izquierda:
  [🤖] ┌─────────────────────────────────────────┐
       │ bg-gray-100 · rounded-chat rounded-tl-sm │
       │ border-l-2 border-brand-teal             │
       │ text-gray-900 text-sm                    │
       └─────────────────────────────────────────┘
       timestamp: text-xs text-gray-400 mt-1

user (comprador) — alineado derecha:
                  ┌──────────────────────────────┐
                  │ bg-brand-teal (#00687D)       │
                  │ text-white text-sm            │
                  │ rounded-chat rounded-tr-sm    │
                  └──────────────────────────────┘ [👤]
                  timestamp: text-xs text-white/60 mt-1

system (mensaje de contexto):
  ────────── texto itálico centrado ──────────
  text-xs text-gray-400 italic text-center
```

### Banner de Expiración TTL

```
┌──────────────────────────────────────────────────────────────┐
│ 🕐  bg-brand-lime  text-brand-black  font-medium  text-sm    │
│     Los mensajes expiran el [fecha]. Después no              │
│     estarán disponibles.                                     │
└──────────────────────────────────────────────────────────────┘
```
- Posición: `sticky top-0 z-10` — visible al hacer scroll, por encima de los mensajes
- Icono `Clock` de `lucide-react`
- Solo se renderiza si `isExpiringSoon(expiresAt)` retorna `true`

## Flujo de Navegación

```
/orders
  └─ [icono MessageSquare en fila] ──▶ /conversations/[conversationId]
                                           └─ [← Pedido] ──▶ /orders
```

No existe una vista "lista de todas las conversaciones". La conversación es un detalle del pedido.

## Risks / Trade-offs

**[Sin auth en el MVP]** → Los endpoints admin son accesibles sin credenciales. Mitigación: Traefik como proxy; no exponer puerto API directamente. Añadir auth en siguiente change.

**[MockModule.exports]** → `AdminModule` necesita que `MockModule` exporte `MockConversationsService`. Si no está, el arranque de NestJS fallará con un error de dependencia. Mitigación: verificar y añadir `exports` en la tarea 1.1 antes de correr los tests.

**[ISR revalidate: 30]** → Los datos del dashboard pueden tener hasta 30 segundos de retraso. Aceptable para el MVP de admin; se puede ajustar a `cache: 'no-store'` si se requiere siempre fresco.

**[DynamoDB TTL]** → Los mensajes expirados son filtrados automáticamente por DynamoDB en las consultas. El banner de expiración avisa cuando quedan < 7 días, calculado en cliente con `Date.now()`.

**[Inconsistencia potencial entre Prisma y DynamoDB]** → Si existe un `conversationId` válido en Prisma pero sin mensajes en DynamoDB (expirados o nunca escritos), el endpoint devuelve `messages: []` en lugar de 404. Comportamiento intencional: la conversación existe aunque los mensajes hayan expirado.

## Requisitos No Funcionales

### Rendimiento
- **First Contentful Paint**: < 1.5s (Server Components + mínimo JS en cliente para tablas)
- **Largest Contentful Paint**: < 2.5s
- **ISR `revalidate: 30`**: datos actualizados cada 30s sin impacto en TTFB
- **No layout shift**: usar `min-h` en skeletons con las mismas dimensiones que el contenido real

### Compatibilidad
- Navegadores modernos: Chrome 110+, Firefox 110+, Safari 16+, Edge 110+
- Resolución mínima: 1280px de ancho (dashboard admin, no diseñado para móvil)

### Convenciones de Código
- Código fuente en **inglés** (variables, funciones, clases)
- Comentarios y docs en **español** (per `base-standards.mdc`)
- `strict: true` en tsconfig
- Sin `any` — usar tipos explícitos o `unknown`
- `cn()` para todas las combinaciones de clases Tailwind condicionales

## Variables de Entorno

```bash
# apps/web-admin/.env.local (desarrollo)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Producción (Vercel)
NEXT_PUBLIC_API_URL=https://api.adresles.com
```

## Notas para la Implementación

- Verificar que `MockModule` tiene `exports: [MockConversationsService]` **antes** de registrar `AdminModule` en `app.module.ts`. Si no, el bootstrapping de NestJS falla con error de proveedor no encontrado.
- Los Server Components de Next.js 14 hacen `fetch` directamente en el servidor — no se necesita estado en cliente para las vistas de tabla.
- `chat-view.tsx` es `'use client'` exclusivamente para el scroll automático (`useEffect` + `ref`). Todo el resto del chat (burbujas, header) puede permanecer como Server Component.
- `chat-expiry-banner.tsx` es `'use client'` porque el cálculo de "X días hasta expiración" se basa en `Date.now()` del navegador.
- Usar `next/link` para toda la navegación interna — nunca `<a>` directos.
- El `borderRadius.chat = '1.25rem'` en Tailwind permite usar `rounded-chat` en las burbujas para un estilo más suave.
- Seguir el estándar de testing: un `.spec.ts` por servicio y uno por controller, con mocks explícitos de dependencias externas (Prisma y DynamoDB).
