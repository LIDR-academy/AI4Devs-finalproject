## Why

El DTO actual (`CreateMockOrderDto`) no transporta contexto sobre el estado del comprador en el eCommerce ni datos manuales del destinatario de regalo. Sin estos campos, el Worker no puede seleccionar el sub-journey correcto en CU03-B2 (comprador con dirección guardada en eCommerce, pedido regalo con destinatario manual, etc.) y tiene que inferir el flujo de forma incompleta.

## What Changes

- Se crea el paquete `packages/shared-types` (`@adresles/shared-types`) que exporta `ProcessConversationJobData` (con el nuevo campo `context`), `ProcessResponseJobData` y `MockOrderContext`. Esto elimina la duplicación de tipos entre API y Worker.
- Se añade la clase `MockGiftRecipientDto` con `first_name`, `last_name` y `phone`.
- Se añaden tres campos opcionales a `CreateMockOrderDto`: `buyer_registered_ecommerce` (boolean), `buyer_ecommerce_address` (MockAddressDto) y `gift_recipient` (MockGiftRecipientDto).
- `MockOrdersService.processAdreslesOrder()` construye un objeto `context` con los nuevos campos y lo pasa a `ConversationsService.createAndEnqueue()`.
- `ConversationsService.createAndEnqueue()` acepta `context?: MockOrderContext` (importado de `@adresles/shared-types`) y lo incluye en el payload del job BullMQ.
- `queue.service.ts` y `conversation.processor.ts` eliminan sus definiciones locales de `ProcessConversationJobData` e importan desde `@adresles/shared-types`.
- `conversationProcessor` extrae `context` de `job.data` y lo pasa a `processGetAddressJourney()` (sin modificar su lógica interna) para que CU03-B2 pueda consumirlo.
- `turbo.json` se actualiza para que la tarea `dev` dependa de `^build`, garantizando que `shared-types` se compile antes de que API y Worker arranquen.

## Capabilities

### New Capabilities

_(ninguna — esta change extiende capacidades existentes)_

### Modified Capabilities

- `mock-orders-api`: El esquema de entrada de `POST /api/mock/orders` acepta tres nuevos campos opcionales (`buyer_registered_ecommerce`, `buyer_ecommerce_address`, `gift_recipient`). Se añaden escenarios de validación y de propagación del contexto al job BullMQ.

## Impact

- **Paquete nuevo**: `packages/shared-types` (zero dependencias de producción; solo TypeScript)
- **Archivos modificados**: `create-mock-order.dto.ts`, `mock-orders.service.ts`, `conversations.service.ts`, `queue.service.ts`, `conversation.processor.ts`, `apps/api/package.json`, `apps/worker/package.json`, `turbo.json`
- **API**: `POST /api/mock/orders` — retrocompatible; los nuevos campos son todos opcionales
- **BullMQ jobs**: el payload del job `process-conversation` crece con un campo `context` opcional; los jobs existentes sin ese campo siguen funcionando
- **Tests**: `mock-orders.service.spec.ts` requiere nuevos casos de prueba
- **Rollback**: eliminar `packages/shared-types`, restaurar las interfaces locales en `queue.service.ts` y `conversation.processor.ts`, revertir los tres campos del DTO y los cambios en `package.json` / `turbo.json`
