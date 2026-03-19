# Sesión: external-order-id-coherence

> **Fecha**: 2026-03-13  
> **Change**: `external-order-id-coherence`  
> **Estado**: ✅ Completado (39/39 tareas)  
> **Tests**: 161 en `apps/api` + 49 en `apps/worker` — todos pasando  

---

## Objetivo

Consolidar `externalOrderId` como **única referencia activa** de un pedido en UI, búsqueda, sort y mensajes al LLM. Eliminar la ambigüedad del campo `externalOrderNumber` que era `nullable` y actuaba como referencia primaria de forma inconsistente.

---

## Qué se cambió

### Seed (`packages/prisma-db/seed.ts`)
- 20 pedidos actualizados con `externalOrderId` realistas por plataforma: numéricos para WooCommerce, `MM-0XXXX-OUT` para Shopify, 9 letras mayúsculas para PrestaShop
- Eliminado `externalOrderNumber` de todos los `prisma.order.create`

### Backend API (`apps/api`)
- **Nuevo servicio**: `ExternalOrderIdService` (`apps/api/src/orders/external-order-id.service.ts`) — genera un `externalOrderId` válido y único consultando pedidos previos de la tienda. Inyectable desde `OrdersModule`
- **DTO**: `CreateMockOrderDto.external_order_id` pasa de `@IsString() string!` a `@IsOptional() @IsString() string?`
- **`MockOrdersService`**: genera `externalOrderId` automáticamente si el payload no lo incluye
- **`AdminService.buildOrderBy`**: `refSort` cambia de `{ externalOrderNumber: { sort: dir, nulls: 'last' } }` a `{ externalOrderId: dir }` (NOT NULL, sin nulls)
- **`AdminService.buildWhere`**: búsqueda `q` usa `externalOrderId` en lugar de `externalOrderNumber`
- **`AdminService.getConversationMessages`**: devuelve `order.externalOrderId` directamente, sin fallback

### Worker (`apps/worker`)
- `processGetAddressJourney`: tipo del parámetro `order` y llamada a `buildGetAddressUserPrompt` actualizados a `externalOrderId`
- `HandlerContext.order`: eliminado `externalOrderNumber` del tipo

### Frontend (`apps/web-admin`)
- `ConversationContext.order`: `externalOrderId: string` (era `externalOrderNumber: string | null`)
- `CreateMockOrderPayload.external_order_id?: string` (ahora opcional)
- `orders-table.tsx`: eliminado fallback `?? externalOrderId`
- `chat-view.tsx`: usa `externalOrderId` directamente
- `order-config-modal.tsx`: eliminado `external_order_id: \`SIM-${Date.now()}\`` del payload

---

## Decisiones técnicas

### `ExternalOrderIdService.generate(storeId)` — algoritmos por plataforma

| Plataforma | Algoritmo |
|---|---|
| `WOOCOMMERCE` | Busca max numérico en pedidos previos de la tienda, suma delta aleatorio 1-5. Fallback: `"100"` |
| `SHOPIFY` | Obtiene pedido más reciente, aplica regex `/^(.*?)(\d{4,})(.*)$/`, incrementa preservando padding y prefijo/sufijo. Fallback: `"1001"` |
| `PRESTASHOP` | Genera 9 letras mayúsculas aleatorias, verifica unicidad en BD, reintenta hasta 10 veces |
| Otras / fallback | `"SIM-" + Date.now()` |

### Non-null assertion en `orders.service.ts`

```typescript
// Correcto — el campo siempre se asigna en MockOrdersService antes de llegar aquí
externalOrderId: dto.external_order_id!,
```

`external_order_id` es `string | undefined` en el DTO (campo opcional), pero `MockOrdersService.processMockOrder()` garantiza que el campo se rellena antes de llamar a `orders.createFromMock()`. El non-null assertion `!` es el mecanismo correcto para este contrato implícito.

### `mock.module.ts` ya importaba `OrdersModule`

No fue necesario modificar `mock.module.ts` — `OrdersModule` ya estaba importado (para `OrdersService`), por lo que `ExternalOrderIdService` (ahora exportado desde `OrdersModule`) quedó disponible sin cambios adicionales.

---

## Tests nuevos

- `apps/api/src/orders/external-order-id.service.spec.ts` — 8 escenarios: WooCommerce sin/con pedidos, PrestaShop formato/colisión, Shopify sin pedidos/patrón `MM-01007-OUT`/numérico, fallback
- Nuevo bloque `describe('conversationProcessor GET_ADDRESS journey')` en `conversation.processor.spec.ts` — verifica que el prompt al LLM contiene `externalOrderId` y no "N/A"

---

## Lecciones aprendidas

1. **Campos nullable como referencia activa causan deuda técnica**: `externalOrderNumber` era `nullable` en schema pero se usaba como referencia principal con fallback al campo NOT NULL — una inversión de dependencia que generó código defensivo en múltiples capas

2. **La generación de IDs simulados pertenece al backend**: mover `SIM-${Date.now()}` del frontend al `ExternalOrderIdService` centraliza la lógica y permite generar IDs realistas por plataforma. El frontend nunca debe fabricar datos de dominio

3. **La simplificación de sort/search sin nulls**: al cambiar de `{ externalOrderNumber: { sort: dir, nulls: 'last' } }` a `{ externalOrderId: dir }`, el `buildOrderBy` se simplifica porque `externalOrderId` es NOT NULL

4. **Non-null assertion `!` para contratos implícitos entre servicios**: cuando el contrato entre dos servicios garantiza que un campo opcional siempre tiene valor al llamarse, `!` es preferible a añadir guardas que nunca se ejecutarían

---

## Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `packages/prisma-db/seed.ts` | Actualización (20 pedidos, `externalOrderId` realistas) |
| `apps/api/src/orders/external-order-id.service.ts` | **Nuevo** |
| `apps/api/src/orders/external-order-id.service.spec.ts` | **Nuevo** |
| `apps/api/src/orders/orders.module.ts` | Añadir `ExternalOrderIdService` a providers/exports |
| `apps/api/src/orders/orders.service.ts` | Non-null assertion en `externalOrderId` |
| `apps/api/src/mock/dto/create-mock-order.dto.ts` | `external_order_id` → opcional |
| `apps/api/src/mock/mock-orders.service.ts` | Inyectar `ExternalOrderIdService`, generar si no viene |
| `apps/api/src/admin/admin.service.ts` | `buildOrderBy`, `buildWhere`, `getConversationMessages` |
| `apps/worker/src/processors/conversation.processor.ts` | Tipos y llamada en `processGetAddressJourney` |
| `apps/web-admin/src/types/api.ts` | `ConversationContext`, `CreateMockOrderPayload` |
| `apps/web-admin/src/components/orders/orders-table.tsx` | Eliminar fallback |
| `apps/web-admin/src/components/chat/chat-view.tsx` | Usar `externalOrderId` |
| `apps/web-admin/src/components/simulate/order-config-modal.tsx` | Eliminar `SIM-${Date.now()}` |
| `apps/api/src/admin/admin.service.spec.ts` | Actualizar expectations |
| `apps/api/src/mock/mock-orders.service.spec.ts` | Añadir mock `ExternalOrderIdService`, nuevos tests |
| `apps/api/src/mock/mock-orders.controller.spec.ts` | `external_order_id` opcional |
| `apps/worker/src/processors/conversation.processor.spec.ts` | Limpiar `externalOrderNumber`, nuevo bloque GET_ADDRESS |
