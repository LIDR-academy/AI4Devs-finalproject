## 1. Backend — AdminService

- [x] 1.1 Añadir interfaz `SimulateStore` en `apps/api/src/admin/admin.service.ts` (junto a `GetOrdersParams` y `GetUsersParams`)
- [x] 1.2 Implementar método `getStores()` en `AdminService`: `prisma.store.findMany` con `where: { status: 'ACTIVE' }`, `orderBy: [{ ecommerce: { commercialName: 'asc' } }, { name: 'asc' }]`, `select` con campos `id`, `name`, `url`, `platform` y `ecommerce: { commercialName, legalName }`
- [x] 1.3 Mapear resultado con fallback `ecommerceName: s.ecommerce.commercialName ?? s.ecommerce.legalName`

## 2. Backend — AdminController

- [x] 2.1 Añadir handler `@Get('stores') getStores()` en `AdminController` que delegue a `this.adminService.getStores()`

## 3. Backend — Tests

- [x] 3.1 Añadir `getStores: jest.fn()` al objeto `mockAdminService` en `admin.controller.spec.ts`
- [x] 3.2 Añadir bloque `describe('GET /admin/stores')` en `admin.controller.spec.ts` con 2 tests: respuesta 200 con datos y respuesta 200 con lista vacía
- [x] 3.3 Añadir `store: { findMany: jest.fn() }` al objeto `mockPrisma` en `admin.service.spec.ts`
- [x] 3.4 Añadir bloque `describe('getStores')` en `admin.service.spec.ts` con 3 tests: mapeo correcto, fallback `legalName` cuando `commercialName` es null, y lista vacía
- [x] 3.5 Ejecutar `pnpm test` en `apps/api` y verificar que todos los tests pasan (incluyendo los preexistentes)

## 4. Frontend — Tipos

- [x] 4.1 Añadir `type StorePlatform = 'WOOCOMMERCE' | 'PRESTASHOP' | 'MAGENTO' | 'SHOPIFY'` en `apps/web-admin/src/types/api.ts`
- [x] 4.2 Añadir interfaz `SimulateStore` con campos `id`, `name`, `url`, `platform: StorePlatform`, `ecommerceName: string` en `apps/web-admin/src/types/api.ts`
- [x] 4.3 Añadir interfaz `StoresResponse` con campo `data: SimulateStore[]` en `apps/web-admin/src/types/api.ts`

## 5. Frontend — API Client

- [x] 5.1 Añadir `StoresResponse` al bloque de imports en `apps/web-admin/src/lib/api.ts`
- [x] 5.2 Añadir función `export const getStores = (): Promise<StoresResponse> => apiFetch<StoresResponse>('/api/admin/stores')` en `apps/web-admin/src/lib/api.ts`

## 6. Verificación

- [x] 6.1 Arrancar el stack (`docker compose up` o equivalente) y verificar que `GET /api/admin/stores` responde `200 OK` con las 3 tiendas del seed con sus `ecommerceName` correctos
