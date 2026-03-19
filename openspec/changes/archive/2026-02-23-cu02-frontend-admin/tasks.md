## 1. Backend — AdminModule

- [x] 1.1 Verificar que `MockModule` tiene `exports: [MockConversationsService]`; añadirlo si no está
- [x] 1.2 Crear `apps/api/src/admin/admin.module.ts` — importa `PrismaModule` y `MockModule`
- [x] 1.3 Crear `apps/api/src/admin/admin.service.ts` — métodos `getOrders(page, limit)`, `getUsers(page, limit)`, `getConversationMessages(conversationId)`
- [x] 1.4 Crear `apps/api/src/admin/admin.controller.ts` — tres endpoints GET con `@Controller('admin')` y `@Get(...)`; paginación `page` y `limit` via `@Query()`
- [x] 1.5 Registrar `AdminModule` en `apps/api/src/app.module.ts`
- [x] 1.6 Crear `apps/api/src/admin/admin.service.spec.ts` — tests unitarios (Prisma mock + MockConversationsService mock)
- [x] 1.7 Crear `apps/api/src/admin/admin.controller.spec.ts` — tests de integración HTTP con `supertest`
- [x] 1.8 Verificar que los 37 tests existentes siguen pasando: `cd apps/api && pnpm test`

## 2. Frontend — Scaffold y Configuración

- [x] 2.1 Inicializar `apps/web-admin` con Next.js 16/latest (`create-next-app` — TypeScript, Tailwind v4, App Router, con `src/`)
- [x] 2.2 Configurar `package.json` con nombre `@adresles/web-admin` y versión `0.1.0`
- [x] 2.3 Instalar dependencias adicionales: `date-fns`, `clsx`, `tailwind-merge`
- [x] 2.4 Instalar y configurar Shadcn/ui: `components.json` manual (tema: zinc, CSS variables: sí, Tailwind v4)
- [x] 2.5 Añadir componentes Shadcn: `table`, `badge`, `button`, `separator`, `skeleton`
- [x] 2.6 Tokens de brand en `globals.css` (@theme Tailwind v4): `brand-black`, `brand-lime`, `brand-teal`, `brand-white`, `radius-chat`
- [x] 2.7 Actualizar `src/app/globals.css` con variables CSS de brand y tokens Shadcn (Tailwind v4)
- [x] 2.8 Crear `src/types/api.ts` con todas las interfaces TypeScript
- [x] 2.9 Crear `src/lib/api.ts` con `apiFetch`, `getOrders`, `getUsers`, `getConversationMessages`
- [x] 2.10 Crear `src/lib/utils.ts` con `cn`, `formatDate`, `formatRelativeDate`, `formatCurrency`, `formatPhone`, `formatFullName`, `isExpiringSoon`, `formatExpiryDate`
- [x] 2.11 Crear `apps/web-admin/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`

## 3. Frontend — Layout

- [x] 3.1 Crear `src/app/layout.tsx` — RootLayout con Inter font (`next/font/google`), skip link `<a href="#main-content">`, `<Sidebar>` y `<main id="main-content">`
- [x] 3.2 Crear `src/components/layout/sidebar.tsx` — `'use client'`, `usePathname()`, nav activa con `border-l-2 border-brand-lime`, footer con versión `v0.1.0`, `aria-label="Navegación principal"`
- [x] 3.3 Crear `src/app/page.tsx` — `redirect('/orders')`

## 4. Frontend — Vista Órdenes

- [x] 4.1 Crear `src/app/orders/page.tsx` — Server Component, `getOrders()`, `<OrdersTable>` o `<OrdersEmptyState>`
- [x] 4.2 Crear `src/app/orders/loading.tsx` — skeleton con 8 filas (`<Skeleton>` por celda)
- [x] 4.3 Crear `src/app/orders/error.tsx` — error boundary con mensaje amigable y botón retry
- [x] 4.4 Crear `src/components/orders/orders-table.tsx` — Shadcn `Table`, 8 columnas según especificación (incluyendo icono chat condicional `MessageSquare`)
- [x] 4.5 Crear `src/components/orders/order-status-badge.tsx` — `OrderStatusBadge` y `OrderModeBadge` con paleta completa brand
- [x] 4.6 Crear `src/components/orders/orders-empty-state.tsx` — icono `ShoppingCart` + texto vacío

## 5. Frontend — Vista Usuarios

- [x] 5.1 Crear `src/app/users/page.tsx` — Server Component, `getUsers()`, `<UsersTable>` o `<UsersEmptyState>`
- [x] 5.2 Crear `src/app/users/loading.tsx` — skeleton con 8 filas
- [x] 5.3 Crear `src/app/users/error.tsx` — error boundary
- [x] 5.4 Crear `src/components/users/users-table.tsx` — 7 columnas según especificación (incluyendo fecha relativa con tooltip)
- [x] 5.5 Crear `src/components/users/user-registered-badge.tsx` — badge `bg-brand-teal/10` (Sí) / `bg-gray-100` (No)
- [x] 5.6 Crear `src/components/users/users-empty-state.tsx` — icono `Users` + texto vacío

## 6. Frontend — Vista Conversación

- [x] 6.1 Crear `src/app/conversations/[conversationId]/page.tsx` — Server Component, `getConversationMessages(id)`, renderiza `<ChatView>`
- [x] 6.2 Crear `src/app/conversations/[conversationId]/loading.tsx` — skeleton de 5-6 burbujas alternadas (izquierda/derecha)
- [x] 6.3 Crear `src/app/conversations/[conversationId]/error.tsx` — error boundary con `<Link href="/orders">← Volver a pedidos</Link>`
- [x] 6.4 Crear `src/components/chat/chat-view.tsx` — `'use client'`, `useEffect` + `ref` para scroll al último mensaje, header `bg-brand-black` con `← Pedido #N`, badge tipo conversación y badge estado
- [x] 6.5 Crear `src/components/chat/chat-bubble.tsx` — burbuja por `role`: assistant (izq, gris, borde teal, avatar Bot) / user (dcha, teal, avatar User) / system (centrado, itálico, separadores)
- [x] 6.6 Crear `src/components/chat/chat-expiry-banner.tsx` — `'use client'`, `sticky top-0`, `bg-brand-lime text-brand-black`, icono `Clock`, solo si `isExpiringSoon(expiresAt)` es true
