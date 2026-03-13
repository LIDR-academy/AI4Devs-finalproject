## Why

La sección `/simulate` del Dashboard Admin necesita un selector de tienda para configurar pedidos simulados. Sin un endpoint que devuelva las tiendas disponibles, el frontend no puede poblar ese selector y el flujo de simulación queda bloqueado.

## What Changes

- Nuevo endpoint `GET /api/admin/stores` en el `AdminModule` de NestJS que devuelve la lista de tiendas activas enriquecidas con el nombre del eCommerce propietario.
- Nuevos tipos TypeScript `StorePlatform`, `SimulateStore` y `StoresResponse` en el frontend (`apps/web-admin`).
- Nueva función `getStores()` en la capa de acceso a datos del frontend (`src/lib/api.ts`).

## Capabilities

### New Capabilities

_(Ninguna — no se introduce una capacidad completamente nueva)_

### Modified Capabilities

- `admin-api`: Se añade el requisito `GET /api/admin/stores` al conjunto de endpoints del AdminModule. El endpoint devuelve `{ data: SimulateStore[] }` con tiendas `ACTIVE`, ordenadas por `ecommerce.commercialName ASC` luego `store.name ASC`, con fallback `legalName` cuando `commercialName` es null.

## Impact

- **Backend** (`apps/api`): `AdminService` (nuevo método `getStores()`), `AdminController` (nuevo handler `@Get('stores')`), specs de test `admin.service.spec.ts` y `admin.controller.spec.ts`.
- **Frontend** (`apps/web-admin`): `src/types/api.ts` (nuevos tipos), `src/lib/api.ts` (nueva función).
- **Sin breaking changes**: Cambio puramente aditivo; endpoints y tipos existentes no se modifican.
- **Rollback**: Eliminar el handler del controlador y el método del servicio. Sin migraciones de base de datos implicadas.
