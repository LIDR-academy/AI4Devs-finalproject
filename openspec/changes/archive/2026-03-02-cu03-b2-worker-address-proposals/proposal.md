## Why

En el flujo GET_ADDRESS, el agente IA pregunta siempre la dirección al usuario incluso cuando ya la conocemos (libreta Adresles o eCommerce). Esto genera fricción innecesaria. El cambio permite proponer la dirección guardada para que el usuario solo confirme en lugar de escribirla de cero.

## What Changes

- Nueva fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` en la máquina de estados del Worker.
- Sub-journey 2.1: usuario registrado con dirección en Adresles → proponer dirección favorita directamente.
- Sub-journey 2.3: usuario no registrado con dirección en eCommerce (`context.buyerEcommerceAddress`) → proponer esa dirección.
- Función `buildAddressProposalMessage()` para mensajes bilingües (ES/EN) según fuente (adresles/ecommerce).
- Handler `handleAddressProposalConfirm`: confirmar → `finalizeAddress`; rechazar → transicionar a `WAITING_ADDRESS`.
- Reutilizar `pendingAddress` en la nueva fase (sin nuevos campos en `ConversationState`).

## Capabilities

### New Capabilities

(ninguna — el cambio extiende flujos existentes)

### Modified Capabilities

- `mock-conversations`: El journey GET_ADDRESS detecta sub-journeys 2.1 y 2.3 antes de preguntar la dirección; añade fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` y handler asociado.

## Impact

- **`apps/worker/src/services/address.service.ts`**: Nuevo `ConversationPhase`, `buildAddressProposalMessage()`.
- **`apps/worker/src/processors/conversation.processor.ts`**: `processGetAddressJourney()` con ramas 2.1/2.3, `handleAddressProposalConfirm()`, propagación de `context`.
- **DynamoDB**: Estado incluye `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress`.
- **Tests**: Unitarios para `buildAddressProposalMessage()`. Verificación manual en `/simulate`.
- **Sin impacto en**: API, frontend, schema Prisma, colas BullMQ.

**Plan de rollback**: Cambios solo en Worker. Revertir commits; no hay migración de datos.
