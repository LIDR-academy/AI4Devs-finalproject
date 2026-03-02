# Sesión 2026-03-02: CU03-B1 — Worker DB Sync: StatusSource + Schema Compartido — Completado

> **Change**: `cu03-b1-worker-db-sync`  
> **Estado**: ✅ Completado y verificado (30/30 tareas)

## Resumen

Change de corrección y trazabilidad que resolvió tres problemas simultáneos:

1. **Schema drift silencioso**: El Worker tenía un `OrderStatus` con valores distintos al del API (`SYNCED`, `ADDRESS_CONFIRMED` en lugar de `READY_TO_PROCESS`, `CANCELED`, etc.), sin errores en runtime pero con sistema de tipos roto. Corregido aplicando ADR-008 (Opción C).
2. **Trazabilidad de cambios de estado**: Los pedidos no registraban quién originó su último cambio de estado. Añadido campo `statusSource` (enum `ADRESLES | STORE`) y garantizado que `syncedAt` se setea en toda transición relevante.
3. **Bug TRADITIONAL → COMPLETED**: `MockOrdersService.processTraditionalOrder()` llamaba a `updateStatus('COMPLETED')` tras la simulación de sync, lo que contradecía la semántica del MVP. Eliminado — `READY_TO_PROCESS` es el estado final del MVP.

---

## Completado

### Schema y DB (`apps/api/prisma/schema.prisma`)

- Nuevo enum `StatusSource { ADRESLES STORE }` después de `OrderStatus`
- Campo `statusSource StatusSource? @map("status_source")` en modelo `Order` (entre `syncedAt` y `createdAt`)
- Schema sincronizado con la DB via `prisma db push` (el proyecto usa `db push`, no migration files con historial)

### Worker Schema (ADR-008, Opción C)

- `apps/worker/package.json` + `"prisma": { "schema": "../api/prisma/schema.prisma" }`
- Eliminado `apps/worker/prisma/schema.prisma`
- `prisma generate` en Worker lee el schema del API correctamente
- `tsc --noEmit` en Worker: 0 errores

### OrdersService API (`apps/api/src/orders/orders.service.ts`)

- Import de `StatusSource` desde `@prisma/client`
- `updateStatus()`: tercer parámetro renombrado de `timestamps` a `options`, añadido `statusSource?: StatusSource`
- `createFromMock()`: para pedidos TRADITIONAL (`isAddressReady = true`) se setean `syncedAt: now` y `statusSource: StatusSource.STORE`

### MockOrdersService (`apps/api/src/mock/mock-orders.service.ts`)

- Eliminada la llamada a `updateStatus(order.id, 'COMPLETED', { syncedAt: new Date() })` en `processTraditionalOrder()`. `READY_TO_PROCESS` es el estado final del MVP.

### Worker `finalizeAddress()` (`apps/worker/src/processors/conversation.processor.ts`)

- `prisma.order.update()` ahora incluye `syncedAt: now` y `statusSource: 'ADRESLES'`
- Llamada a `simulateEcommerceSync()` pasa `ctx.order.store.name`
- Llamada a `buildSyncSuccessMessage()` pasa `ctx.order.store.name`
- Log final refleja `status=READY_TO_PROCESS`, `syncedAt` y `statusSource=ADRESLES`

### `buildSyncSuccessMessage()` y `simulateEcommerceSync()` (`apps/worker/src/services/address.service.ts`)

- `buildSyncSuccessMessage(pending, language, storeName)`: nuevo tercer parámetro obligatorio. Los mensajes en ES/EN/FR mencionan `storeName` y confirman actualización en tienda + Adresles.
- `simulateEcommerceSync(orderId, pending, storeName?)`: nuevo parámetro opcional. Prefijo de logs cambiado de `[ECOMMERCE_SYNC]` a `[SYNC_SIMULATED]`, incluye `storeName`, `status=READY_TO_PROCESS` y `syncedAt` timestamp.

### Tests

- `orders.service.spec.ts`: test TRADITIONAL verifica `syncedAt` y `statusSource: 'STORE'` en `prisma.order.create()`; test ADRESLES verifica ausencia de ambos campos. (22 tests pasan)
- `mock-orders.service.spec.ts`: test renombrado a "does not update order status after sync — READY_TO_PROCESS is the final MVP state", verifica que `updateStatus` **no** es llamado. (22 tests pasan)
- `address.service.spec.ts` (nuevo): 4 tests para `buildSyncSuccessMessage()` — ES/EN/FR + fallback, verificando presencia de `storeName` y "Adresles".

---

## Bugs Encontrados y Resueltos

| Bug | Causa | Solución |
|-----|-------|----------|
| Worker usaba `OrderStatus` con valores inexistentes en la DB | Schema del Worker divergente del API desde el inicio del proyecto | ADR-008: Worker apunta a `../api/prisma/schema.prisma` via `package.json` |
| Pedidos TRADITIONAL llegaban a estado `COMPLETED` | `processTraditionalOrder()` llamaba a `updateStatus('COMPLETED')` tras `simulateSync()` — semántica incorrecta para el MVP | Eliminada la llamada; `READY_TO_PROCESS` es el estado final del MVP |
| `StatusSource` usaba cast `'STORE' as StatusSource` | Primera implementación defensiva | Corregido a `StatusSource.STORE` (uso idiomático del enum) |

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Opción C para ADR-008** (no Opción B `packages/prisma-db`) | Resolver el drift inmediatamente con el mínimo cambio. La Opción B requiere refactorización de ambas apps; se reserva para el ticket `infra-prisma-shared-schema` |
| **`statusSource` nullable, sin backfill** | Un valor por defecto en la migración sería incorrecto para registros históricos mixtos (TRADITIONAL/ADRESLES). Los datos pre-despliegue tienen `NULL` = "origen desconocido", aceptable para MVP |
| **`syncedAt` y `statusSource` se setean juntos** | Semánticamente vinculados: si sabes cuándo cambió, también debes saber quién lo cambió |
| **`db push` en lugar de `migrate dev`** | El proyecto no tiene historial de migration files; `migrate dev` falla por inconsistencia en el shadow database. `db push` aplica el diff directamente |

---

## ADRs Generados

- **[ADR-008](../architecture/008-prisma-schema-worker-opcion-c.md)** — Worker apunta al schema Prisma del API (Opción C, stepping stone hacia `packages/prisma-db`)

---

## Ticket Derivado

- **`openspec/changes/infra-prisma-shared-schema/`** — Implementar `packages/prisma-db` (Opción B) como fuente de verdad explícita y neutral para el schema Prisma del monorepo

---

## Archivos Creados/Modificados

```
apps/api/prisma/
└── schema.prisma                        # + enum StatusSource + campo statusSource en Order

apps/worker/
├── package.json                         # + "prisma": { "schema": "../api/prisma/schema.prisma" }
└── prisma/
    └── schema.prisma                    # ELIMINADO

apps/api/src/orders/
├── orders.service.ts                    # + StatusSource import, updateStatus options, createFromMock syncedAt/statusSource
└── orders.service.spec.ts              # Tests TRADITIONAL verifican syncedAt + statusSource: 'STORE'

apps/api/src/mock/
├── mock-orders.service.ts              # - updateStatus('COMPLETED') en processTraditionalOrder
└── mock-orders.service.spec.ts         # Test renombrado; verifica que updateStatus NO se llama

apps/worker/src/processors/
└── conversation.processor.ts           # finalizeAddress: syncedAt, statusSource, storeName en logs y mensajes

apps/worker/src/services/
├── address.service.ts                  # buildSyncSuccessMessage(storeName), simulateEcommerceSync(storeName)
└── address.service.spec.ts            # NUEVO — 4 tests para buildSyncSuccessMessage

memory-bank/
├── README.md                           # Actualizado
├── architecture/008-prisma-schema-worker-opcion-c.md  # NUEVO — ADR-008
├── project-context/domain-glossary.md # + StatusSource, Order Status actualizado
└── sessions/2026-03-02-cu03-b1-worker-db-sync.md      # Este archivo
```

---

**Duración estimada**: 2 sesiones (enriquecimiento + implementación)  
**Conversación de referencia**: [CU03-B1 Worker DB Sync](87d028d2-62cd-40ff-b34e-aac7582c6393)
