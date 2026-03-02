## Why

Al confirmar una dirección de entrega, el Worker actualiza `Order.status` a `READY_TO_PROCESS` pero no registra `syncedAt` ni el origen del cambio. Además, el schema de Prisma del Worker tiene valores de `OrderStatus` distintos al del API (ambos apuntan a la misma DB), lo que provoca un error silencioso de tipado. Este cambio cierra ese gap antes de que el MVP avance hacia producción.

## What Changes

- Se añade el campo `statusSource` (enum `ADRESLES | STORE`) al modelo `Order` para rastrear quién originó cada cambio de estado.
- `finalizeAddress()` en el Worker pasa a setear `syncedAt` y `statusSource: 'ADRESLES'` al actualizar el pedido.
- `buildSyncSuccessMessage()` recibe `storeName` y genera un mensaje que menciona explícitamente ambas actualizaciones (tienda + Adresles).
- **BREAKING** (schema): Se añade el campo `status_source` a la tabla `orders` — requiere migración Prisma.
- El Worker elimina su propio `schema.prisma` y pasa a leer el schema del API directamente vía `"prisma": { "schema": "../api/prisma/schema.prisma" }` en su `package.json` (Opción C, stepping stone hacia `packages/prisma-db` — ver ticket `infra-prisma-shared-schema`).
- `OrdersService.createFromMock()` setea `syncedAt` y `statusSource: 'STORE'` al crear pedidos TRADITIONAL.
- `MockOrdersService.processTraditionalOrder()` elimina la llamada a `updateStatus('COMPLETED')`: `READY_TO_PROCESS` es el estado final del MVP.

## Capabilities

### New Capabilities

- `order-status-source`: Mecanismo de trazabilidad del origen de cada cambio de estado de un pedido — campo `statusSource` en el modelo `Order` y enum `StatusSource { ADRESLES STORE }`.

### Modified Capabilities

- `mock-orders-api`: El flujo de pedidos TRADITIONAL ya no actualiza el estado a `COMPLETED` tras la simulación de sync. `READY_TO_PROCESS` es el estado final del MVP. Además, la creación de pedidos TRADITIONAL incluye `syncedAt` y `statusSource: 'STORE'`.
- `mock-conversations`: `finalizeAddress()` en el Worker ahora setea `syncedAt` y `statusSource: 'ADRESLES'` al actualizar `Order.status`, y `buildSyncSuccessMessage()` incluye el nombre de la tienda en el mensaje de confirmación.

## Impact

- **Base de datos**: Migración Prisma (`add-order-status-source`) — añade columna `status_source` a la tabla `orders`. Requiere ejecutar en todos los entornos (dev, staging, prod).
- **`apps/api/prisma/schema.prisma`**: Nuevo enum `StatusSource` + campo en `Order`.
- **`apps/worker/package.json`**: Añade `"prisma": { "schema": "../api/prisma/schema.prisma" }`. El archivo `apps/worker/prisma/schema.prisma` es eliminado.
- **`apps/api/src/orders/orders.service.ts`**: Firma de `updateStatus()` y lógica de `createFromMock()`.
- **`apps/api/src/mock/mock-orders.service.ts`**: Eliminar `updateStatus('COMPLETED')` en flujo TRADITIONAL.
- **`apps/worker/src/processors/conversation.processor.ts`**: `finalizeAddress()` con nuevos campos.
- **`apps/worker/src/services/address.service.ts`**: `buildSyncSuccessMessage()` y `simulateEcommerceSync()`.
- **Tests afectados**: `orders.service.spec.ts`, `mock-orders.service.spec.ts`.
- **Sin impacto en**: `apps/web-admin/`, `packages/shared-types/`, lógica de colas BullMQ, canal SSE.

**Plan de rollback**: La columna `status_source` es nullable (`StatusSource?`) — si se necesita revertir, basta con eliminarla con una migración `ALTER TABLE orders DROP COLUMN status_source`. El comportamiento de la aplicación no depende de su presencia para funcionar.
