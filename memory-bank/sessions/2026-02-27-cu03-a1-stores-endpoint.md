# Sesión 2026-02-27: CU03-A1 — Endpoint GET /api/admin/stores — Completado

> **Change**: `cu03-a1-stores-endpoint`  
> **Estado**: ✅ Completado (15/15 tareas) — verificado, pendiente de `/opsx-archive`

## Resumen

Implementación del endpoint `GET /api/admin/stores` en el `AdminModule`. El endpoint devuelve la lista de tiendas con `status = ACTIVE` enriquecida con el nombre del eCommerce propietario (`commercialName ?? legalName`), sin paginación ni filtros. El objetivo es poblar el selector de tienda de la futura sección `/simulate` del Dashboard Admin.

---

## Completado

### Backend — AdminModule (NestJS)

- **`admin.service.ts`**:
  - Import añadido: `StorePlatform` desde `@prisma/client` (enum nativo, no `string` genérico)
  - Interfaz exportada `SimulateStore` con campos `id`, `name`, `url`, `platform: StorePlatform`, `ecommerceName: string`
  - Método `getStores()`: `prisma.store.findMany` con `where: { status: 'ACTIVE' }`, `orderBy: [{ ecommerce: { commercialName: 'asc' } }, { name: 'asc' }]`, `select` incluye `ecommerce: { commercialName, legalName }`; mapeo con fallback `commercialName ?? legalName`

- **`admin.controller.ts`**: Handler `@Get('stores') getStores()` sin query params ni DTO de entrada

- **`admin.service.spec.ts`**:
  - `store: { findMany: jest.fn() }` añadido al mock de Prisma
  - 3 tests en `describe('getStores')`: mapeo correcto, fallback `legalName` cuando `commercialName` es null, lista vacía
  - Assertion de `orderBy` incluida en el test de mapeo: verifica tanto `where` como `orderBy`

- **`admin.controller.spec.ts`**:
  - `getStores: jest.fn()` añadido al mock de `AdminService`
  - 2 tests en `describe('GET /admin/stores')`: 200 con datos, 200 con lista vacía

- **Tests**: 104/104 tests pasan (99 preexistentes + 5 nuevos)

### Frontend — Dashboard Admin (Next.js)

- **`apps/web-admin/src/types/api.ts`**:
  - `type StorePlatform = 'WOOCOMMERCE' | 'PRESTASHOP' | 'MAGENTO' | 'SHOPIFY'` (alineado con el enum del schema Prisma)
  - `interface SimulateStore` con `platform: StorePlatform` (tipado fuerte, no `string`)
  - `interface StoresResponse { data: SimulateStore[] }`

- **`apps/web-admin/src/lib/api.ts`**:
  - Import `StoresResponse` añadido
  - `export const getStores = (): Promise<StoresResponse> => apiFetch<StoresResponse>('/api/admin/stores')`

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Endpoint en `AdminModule`, no en `StoresModule`** | El endpoint sirve al Dashboard Admin para poblar un selector de UI, no es una operación de negocio del dominio Stores. Evita dependencias cruzadas entre módulos. |
| **Sin paginación ni filtros** | El número de tiendas activas es bajo (< 20 típicamente). Devolver todo en una respuesta es correcto y simplifica la implementación. |
| **Fallback `commercialName ?? legalName`** | `Ecommerce.commercialName` es `String?` (nullable) en el schema. `legalName` siempre presente garantiza que `ecommerceName` nunca sea null en la respuesta. |
| **`platform: StorePlatform` (enum de Prisma) en vez de `string`** | Mejora el autocompletado y la seguridad de tipos tanto en backend como en frontend. El tipo `StorePlatform` de `@prisma/client` es la fuente de verdad. |
| **Assertion `orderBy` en test de servicio** | La verificación inicial solo cubría `where`. Se añadió `orderBy` al `expect.objectContaining` para que el escenario de ordenación tenga cobertura explícita. |

---

## Archivos Modificados/Creados

```
apps/api/src/admin/
├── admin.service.ts              # Modificado (import StorePlatform, SimulateStore, getStores)
├── admin.controller.ts           # Modificado (@Get('stores') handler)
├── admin.service.spec.ts         # Modificado (store mock, +3 tests getStores)
└── admin.controller.spec.ts      # Modificado (getStores mock, +2 tests)

apps/web-admin/src/
├── types/api.ts                  # Modificado (+StorePlatform, +SimulateStore, +StoresResponse)
└── lib/api.ts                    # Modificado (+StoresResponse import, +getStores)
```

---

## Tests

- Backend: **104/104 tests pasan** (sin regresión, +5 tests nuevos)
- Frontend: sin cambios en lógica de UI (solo tipos y función de API)

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: sesión actual (2026-02-27)
