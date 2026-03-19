## Why

En compra tradicional el primer mensaje del journey INFORMATION muestra saludo con nombre completo, número de pedido #N/A y no incluye la dirección de entrega. Esto degrada la experiencia y no refleja los datos ya persistidos (Order + OrderAddress). Es necesario corregir el contenido del mensaje para que sea informal, muestre el `external_order_id` y la dirección completa desde OrderAddress.

## What Changes

- **Worker**: En `conversationProcessor()` incluir la relación `orderAddress` al cargar la Order (Prisma `include: { store: true, orderAddress: true }`).
- **Worker**: En `processInformationJourney()` usar solo el nombre del usuario para el saludo (`user.firstName ?? 'Cliente'`), el `order.externalOrderId` para el número de pedido y, si existe `order.orderAddress`, incluir en el mensaje la dirección con `order.orderAddress.fullAddress`. Formatear el mensaje con saltos de línea entre frases.
- **Tests**: Añadir o actualizar tests unitarios en `conversation.processor.spec.ts` para el flujo INFORMATION (saludo, número de pedido, dirección).

No se modifican endpoints de la API, DTOs ni frontend.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `mock-conversations`: El primer mensaje del journey INFORMATION (compra tradicional) MUST saludar solo por nombre, MUST mostrar el número de pedido con `external_order_id` y MUST incluir la dirección de entrega formateada desde OrderAddress.fullAddress cuando exista.

## Impact

- **Código**: `apps/worker/src/processors/conversation.processor.ts` (consulta Order con include, lógica de `processInformationJourney`).
- **Tests**: `apps/worker/src/processors/conversation.processor.spec.ts`.
- **APIs/DB**: Sin cambios en contratos ni migraciones. Solo lectura de Order + orderAddress ya creados por la API en compra tradicional.

## Rollback

Revertir el commit que modifica `conversation.processor.ts` y el spec. No hay migraciones ni cambios de contrato; el mensaje volvería al formato anterior (nombre completo, #N/A, sin dirección explícita).
