# Sesión 2026-02-23: CU-02 Frontend Admin Dashboard — Completado

> **Change**: `cu02-frontend-admin`  
> **Estado**: ✅ Completado (40/40 tareas) — listo para archivar

## Resumen

Implementación completa del Caso de Uso 2 (CU-02): Dashboard Admin para visualización de datos del MVP. Se creó la nueva aplicación `apps/web-admin` con Next.js 16 y se implementó el módulo `AdminModule` en el backend NestJS. El change incluye las dos capas: API admin y UI.

---

## Completado

### Backend — AdminModule (NestJS)

- **`apps/api/src/admin/`** creado con:
  - `admin.module.ts` — importa `PrismaModule` y `MockModule`
  - `admin.service.ts` — lógica de negocio: paginación, filtrado `isDeleted: false`, datos relacionales incluidos
  - `admin.controller.ts` — 3 endpoints: `GET /admin/orders`, `GET /admin/users`, `GET /admin/conversations/:id/messages`
  - `admin.service.spec.ts` — tests unitarios (incluye caso para filtrado de usuarios eliminados)
  - `admin.controller.spec.ts` — tests de integración con supertest
- **`MockModule`** modificado para exportar `MockConversationsService`
- **`AppModule`** actualizado para registrar `AdminModule`
- Respuesta de mensajes extendida con `ConversationContext` (tipo, estado, timestamps, nº pedido)

### Frontend — Dashboard Admin (Next.js)

- **App creada**: `apps/web-admin` con Next.js 16.1.6, React 19, Tailwind v4, Shadcn/ui
- **Rutas implementadas**:
  - `/orders` — tabla de pedidos con `OrderStatusBadge`, `OrderModeBadge`, link a chat
  - `/users` — tabla de usuarios con `UserRegisteredBadge`, `RelativeDateCell` con tooltip accesible
  - `/conversations/[conversationId]` — visor de chat con burbujas por rol, header con metadatos, banner TTL
- **Layout**: Sidebar fijo, skip link, Inter font, `TooltipProvider` global via `<Providers>`
- **Tokens de marca** definidos en `globals.css` con `@theme`: `brand-black`, `brand-lime`, `brand-teal`, `brand-white`
- **Accesibilidad WCAG 2.1 AA**: `aria-label`, `scope="col"`, `role="log"`, tooltips accesibles, `focus-visible`

### Correcciones y mejoras (post-verificación)

- **W1**: Añadido test explícito para filtrado de `isDeleted = true` en `admin.service.spec.ts`
- **W2**: Reemplazado atributo `title` inaccessible con `<Tooltip>` de Shadcn en `UsersTable` mediante componente cliente `RelativeDateCell`
- **S1**: Decisión UX de mantener el patrón "separador flanqueado" para mensajes de sistema en `ChatBubble`; eliminado `separator.tsx` y su dependencia `@radix-ui/react-separator` por estar sin uso
- **S2**: Prop `expiresAtUnix` de `ChatExpiryBanner` cambiado a `number | undefined`, con guard interno; simplificado uso en `ChatView`

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Next.js 16 en vez de 14** | Versión más reciente disponible; compatible con todos los requisitos |
| **Tailwind v4 (CSS-first)** | Next.js 16 instala Tailwind 4 por defecto; `@theme` en `globals.css` en lugar de `tailwind.config.ts` |
| **`force-dynamic` + `cache: 'no-store'`** | Evita errores de build time cuando el API NestJS no está disponible en fase de prerendering |
| **Extensión respuesta de mensajes** | Se incluye `ConversationContext` en la respuesta de mensajes para evitar múltiples peticiones desde el frontend |
| **`src/` directory** | Convención moderna de Next.js en monorepo; prevalece sobre la mención ambigua "sin src separado" en las tareas |
| **Sin auth en MVP** | No-goal explícito en el diseño del change |
| **`RelativeDateCell` como Client Component** | Mantiene `UsersTable` como Server Component; el tooltip requiere `'use client'` (Radix UI) |

---

## Archivos Clave Creados/Modificados

```
apps/api/src/
├── admin/                          # Nuevo
│   ├── admin.module.ts
│   ├── admin.service.ts
│   ├── admin.controller.ts
│   ├── admin.service.spec.ts
│   └── admin.controller.spec.ts
├── mock/mock.module.ts             # Modificado (exports MockConversationsService)
└── app.module.ts                   # Modificado (importa AdminModule)

apps/web-admin/                     # Nuevo (toda la app)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/{page,loading,error}.tsx
│   │   ├── users/{page,loading,error}.tsx
│   │   └── conversations/[conversationId]/{page,loading,error}.tsx
│   ├── components/
│   │   ├── ui/{table,badge,button,skeleton,tooltip}.tsx
│   │   ├── layout/{sidebar,providers}.tsx
│   │   ├── orders/{orders-table,order-status-badge,orders-empty-state}.tsx
│   │   ├── users/{users-table,user-registered-badge,relative-date-cell,users-empty-state}.tsx
│   │   └── chat/{chat-view,chat-bubble,chat-expiry-banner,conversation-badges}.tsx
│   ├── lib/{api,utils}.ts
│   └── types/api.ts
├── components.json
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Tests

- Backend: todos los tests de `admin.service.spec.ts` y `admin.controller.spec.ts` pasan
- Build: `pnpm build` en `apps/web-admin` completado sin errores
- TypeScript: `tsc --noEmit` sin errores

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [CU-02 Frontend Admin](d8e17a0d-0f21-4b70-94eb-0447b8cbfd82)
