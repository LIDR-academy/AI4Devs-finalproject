## Why

El backend de CU-01 ya procesa compras, genera conversaciones IA y valida direcciones, pero toda esa actividad es invisible. Sin un dashboard admin, el MVP no es demostrable ni operable: no hay forma de ver pedidos, usuarios ni conversaciones. Este change cierra el ciclo visible del producto implementando el actor "Admin/Mock UI" definido en el Business.md (sección 2.1).

## What Changes

**Backend** — nuevo `AdminModule` en `apps/api/src/admin/`:
- `GET /api/admin/orders?page&limit` — lista pedidos con store, user y conversations
- `GET /api/admin/users?page&limit` — lista usuarios con conteos de pedidos y direcciones
- `GET /api/admin/conversations/:conversationId/messages` — mensajes desde DynamoDB (delegado a `MockConversationsService`)

**Frontend** — nueva app `apps/web-admin` (Next.js 14, App Router, TypeScript, Tailwind + Shadcn/ui):
- Vista `/orders`: tabla de pedidos con badges de estado/modo y enlace a conversación IA
- Vista `/users`: tabla de usuarios con badge registrado/no registrado
- Vista `/conversations/[conversationId]`: reproductor de chat tipo burbuja conectado a DynamoDB, con banner de expiración TTL

## Capabilities

### New Capabilities
- `admin-api`: Módulo NestJS de solo lectura con tres endpoints GET para órdenes, usuarios y mensajes de conversación
- `admin-dashboard`: App Next.js 14 con layout sidebar (brand Adresles: negro/lima/teal), vistas de órdenes, usuarios y chat

### Modified Capabilities

_(ninguna — este change es puramente aditivo)_

## Impact

- Nueva app en el monorepo: `apps/web-admin` (detectada automáticamente por `pnpm-workspace.yaml`)
- Nuevo módulo: `apps/api/src/admin/` registrado en `app.module.ts`
- Sin migraciones de base de datos
- Sin cambios en `pnpm-workspace.yaml` ni `turbo.json`
- `MockModule` puede requerir añadir `exports: [MockConversationsService]` si no está ya expuesto

**Plan de rollback**: El `AdminModule` es aditivo (no modifica lógica existente). Eliminar el módulo y la app `web-admin` restaura el estado previo sin efecto en CU-01.
