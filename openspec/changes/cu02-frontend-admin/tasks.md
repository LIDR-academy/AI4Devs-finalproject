## 1. Backend — AdminModule

- [ ] 1.1 Verificar que `MockModule` tiene `exports: [MockConversationsService]`; añadirlo si no está
- [ ] 1.2 Crear `apps/api/src/admin/admin.module.ts` — importa `PrismaModule` y `MockModule`
- [ ] 1.3 Crear `apps/api/src/admin/admin.service.ts` — métodos `getOrders(page, limit)`, `getUsers(page, limit)`, `getConversationMessages(conversationId)`
- [ ] 1.4 Crear `apps/api/src/admin/admin.controller.ts` — tres endpoints GET con `@Controller('admin')` y `@Get(...)`; paginación `page` y `limit` via `@Query()`
- [ ] 1.5 Registrar `AdminModule` en `apps/api/src/app.module.ts`
- [ ] 1.6 Crear `apps/api/src/admin/admin.service.spec.ts` — tests unitarios (Prisma mock + MockConversationsService mock)
- [ ] 1.7 Crear `apps/api/src/admin/admin.controller.spec.ts` — tests de integración HTTP con `supertest`
- [ ] 1.8 Verificar que los 37 tests existentes siguen pasando: `cd apps/api && pnpm test`

## 2. Frontend — Scaffold y Configuración

- [ ] 2.1 Inicializar `apps/web-admin` con Next.js 14 (`create-next-app` — TypeScript, Tailwind, App Router, sin `src` separado)
- [ ] 2.2 Configurar `package.json` con nombre `@adresles/web-admin` y versión `0.1.0`
- [ ] 2.3 Instalar dependencias adicionales: `date-fns`, `clsx`, `tailwind-merge`
- [ ] 2.4 Instalar y configurar Shadcn/ui: `npx shadcn@latest init` (tema: zinc, CSS variables: sí)
- [ ] 2.5 Añadir componentes Shadcn: `table`, `badge`, `button`, `separator`, `skeleton`
- [ ] 2.6 Actualizar `tailwind.config.ts` con tokens de brand Adresles (`brand-black`, `brand-lime`, `brand-teal`, `brand-white`) y `borderRadius.chat: '1.25rem'`
- [ ] 2.7 Actualizar `src/app/globals.css` con variables CSS de brand y overrides Shadcn (ver diseño)
- [ ] 2.8 Crear `src/types/api.ts` con todas las interfaces TypeScript (ver `specs/admin-api/spec.md`)
- [ ] 2.9 Crear `src/lib/api.ts` con `apiFetch`, `getOrders`, `getUsers`, `getConversationMessages` (`revalidate: 30`)
- [ ] 2.10 Crear `src/lib/utils.ts` con `cn`, `formatDate`, `formatRelativeDate`, `formatCurrency`, `formatPhone`, `formatFullName`, `isExpiringSoon`, `formatExpiryDate`
- [ ] 2.11 Crear `apps/web-admin/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`

## 3. Frontend — Layout

- [ ] 3.1 Crear `src/app/layout.tsx` — RootLayout con Inter font (`next/font/google`), skip link `<a href="#main-content">`, `<Sidebar>` y `<main id="main-content">`
- [ ] 3.2 Crear `src/components/layout/sidebar.tsx` — `'use client'`, `usePathname()`, nav activa con `border-l-2 border-brand-lime`, footer con versión `v0.1.0`, `aria-label="Navegación principal"`
- [ ] 3.3 Crear `src/app/page.tsx` — `redirect('/orders')`

## 4. Frontend — Vista Órdenes

- [ ] 4.1 Crear `src/app/orders/page.tsx` — Server Component, `getOrders()`, `<OrdersTable>` o `<OrdersEmptyState>`
- [ ] 4.2 Crear `src/app/orders/loading.tsx` — skeleton con 8 filas (`<Skeleton>` por celda)
- [ ] 4.3 Crear `src/app/orders/error.tsx` — error boundary con mensaje amigable y botón retry
- [ ] 4.4 Crear `src/components/orders/orders-table.tsx` — Shadcn `Table`, 8 columnas según especificación (incluyendo icono chat condicional `MessageSquare`)
- [ ] 4.5 Crear `src/components/orders/order-status-badge.tsx` — `OrderStatusBadge` y `OrderModeBadge` con paleta completa brand
- [ ] 4.6 Crear `src/components/orders/orders-empty-state.tsx` — icono `ShoppingCart` + texto vacío

## 5. Frontend — Vista Usuarios

- [ ] 5.1 Crear `src/app/users/page.tsx` — Server Component, `getUsers()`, `<UsersTable>` o `<UsersEmptyState>`
- [ ] 5.2 Crear `src/app/users/loading.tsx` — skeleton con 8 filas
- [ ] 5.3 Crear `src/app/users/error.tsx` — error boundary
- [ ] 5.4 Crear `src/components/users/users-table.tsx` — 7 columnas según especificación (incluyendo fecha relativa con tooltip)
- [ ] 5.5 Crear `src/components/users/user-registered-badge.tsx` — badge `bg-brand-teal/10` (Sí) / `bg-gray-100` (No)
- [ ] 5.6 Crear `src/components/users/users-empty-state.tsx` — icono `Users` + texto vacío

## 6. Frontend — Vista Conversación

- [ ] 6.1 Crear `src/app/conversations/[conversationId]/page.tsx` — Server Component, `getConversationMessages(id)`, renderiza `<ChatView>`
- [ ] 6.2 Crear `src/app/conversations/[conversationId]/loading.tsx` — skeleton de 5-6 burbujas alternadas (izquierda/derecha)
- [ ] 6.3 Crear `src/app/conversations/[conversationId]/error.tsx` — error boundary con `<Link href="/orders">← Volver a pedidos</Link>`
- [ ] 6.4 Crear `src/components/chat/chat-view.tsx` — `'use client'`, `useEffect` + `ref` para scroll al último mensaje, header `bg-brand-black` con `← Pedido #N`, badge tipo conversación y badge estado
- [ ] 6.5 Crear `src/components/chat/chat-bubble.tsx` — burbuja por `role`: assistant (izq, gris, borde teal, avatar Bot) / user (dcha, teal, avatar User) / system (centrado, itálico, separadores)
- [ ] 6.6 Crear `src/components/chat/chat-expiry-banner.tsx` — `'use client'`, `sticky top-0`, `bg-brand-lime text-brand-black`, icono `Clock`, solo si `isExpiringSoon(expiresAt)` es true
