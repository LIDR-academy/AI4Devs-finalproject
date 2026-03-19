## Why

El modelo `Order` tiene dos campos de referencia (`externalOrderId` NOT NULL y `externalOrderNumber` nullable), pero la UI, la búsqueda y los mensajes al LLM usan `externalOrderNumber` como fuente primaria, ignorando que `externalOrderId` es el identificador único garantizado. Esto produce referencias inconsistentes en la tabla de Pedidos, búsquedas que no devuelven lo que se ve en pantalla, y prompts al LLM con "N/A" cuando `externalOrderNumber` es null (habitual en simulaciones).

## What Changes

- `externalOrderId` pasa a ser la **única referencia activa** en UI, búsqueda y mensajes al LLM.
- El backend genera automáticamente `externalOrderId` con formato realista por plataforma (WooCommerce: numérico, Shopify: prefijo-número-sufijo secuencial, PrestaShop: 9 letras mayúsculas). El frontend deja de enviarlo.
- El seed actualiza los `externalOrderId` de los 20 pedidos mock a formatos coherentes con su plataforma y elimina `externalOrderNumber` de todos los `create`.
- La búsqueda `q` en el endpoint de pedidos admin pasa a buscar por `externalOrderId`.
- La ordenación por columna "Referencia" pasa a usar `externalOrderId` (NOT NULL, sin `nulls: 'last'`).
- El journey GET_ADDRESS del Worker pasa `externalOrderId` al prompt del LLM en lugar de `externalOrderNumber`.
- **Sin migración de base de datos**: `externalOrderNumber` permanece en el schema como nullable por compatibilidad histórica.

## Capabilities

### New Capabilities

- `external-order-id-generation`: Servicio backend que genera un `externalOrderId` válido y único para una tienda, según su plataforma (`WOOCOMMERCE`, `SHOPIFY`, `PRESTASHOP`). Usado desde `MockOrdersService` cuando el DTO no incluye `external_order_id`.

### Modified Capabilities

- `mock-orders-api`: `external_order_id` pasa de requerido a opcional en el DTO `CreateMockOrderDto`. El servicio genera el valor si no viene.
- `admin-api`: `buildWhere` busca por `externalOrderId`; `buildOrderBy` ordena por `externalOrderId`; `getConversationMessages` devuelve `externalOrderId` directamente.
- `mock-conversations`: El journey GET_ADDRESS usa `order.externalOrderId` en el prompt al LLM (elimina el posible "N/A").
- `order-config-modal`: Elimina `external_order_id` del payload que envía al backend.

## Impact

- **Backend**: `apps/api/src/orders/external-order-id.service.ts` (nuevo), `orders.module.ts`, `mock-orders.service.ts`, `mock/dto/create-mock-order.dto.ts`, `admin/admin.service.ts`
- **Worker**: `apps/worker/src/processors/conversation.processor.ts`
- **Frontend**: `apps/web-admin/src/types/api.ts`, `components/orders/orders-table.tsx`, `components/chat/chat-view.tsx`, `components/simulate/order-config-modal.tsx`
- **Seed**: `packages/prisma-db/seed.ts` — 20 pedidos actualizados
- **Tests**: `admin.service.spec.ts`, `mock-orders.service.spec.ts`, `mock-orders.controller.spec.ts`, `conversation.processor.spec.ts` (actualización), `external-order-id.service.spec.ts` (nuevo)
- **Plan de rollback**: al no haber migración de BD, revertir el código es suficiente. `externalOrderNumber` sigue en el schema; reactivar su uso en UI es un cambio de una línea.
