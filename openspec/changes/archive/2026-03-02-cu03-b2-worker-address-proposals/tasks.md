## 1. address.service.ts — Fase y función de mensaje

- [x] 1.1 Añadir fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` al tipo `ConversationPhase` en `address.service.ts`
- [x] 1.2 Implementar función `buildAddressProposalMessage(pending, storeName, source, language)` en `address.service.ts`

## 2. processGetAddressJourney — Sub-journeys 2.1 y 2.3

- [x] 2.1 Modificar `processGetAddressJourney()` para recibir `context?: MockOrderContext` como parámetro
- [x] 2.2 Implementar rama sub-journey 2.1: si `user.isRegistered`, cargar direcciones de Prisma y, si hay al menos una, proponer la favorita o primera
- [x] 2.3 Implementar rama sub-journey 2.3: si `!user.isRegistered` y `context?.buyerRegisteredEcommerce` y `context.buyerEcommerceAddress`, proponer esa dirección
- [x] 2.4 En ambas ramas, guardar estado con `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'`, `pendingAddress`, `failedAttempts: 0`; guardar mensajes y publicar SSE

## 3. processResponseProcessor — Handler y propagación de context

- [x] 3.1 Implementar `handleAddressProposalConfirm()`: interpretar intent, si CONFIRM → `finalizeAddress(ctx, state.pendingAddress!)`; si rechaza → transicionar a `WAITING_ADDRESS` con corrección si existe
- [x] 3.2 Añadir `WAITING_ADDRESS_PROPOSAL_CONFIRM` al mapa `handlers` en `processResponseProcessor()`
- [x] 3.3 En `conversationProcessor()`, pasar `context` de `job.data` a `processGetAddressJourney()`

## 4. Tests

- [x] 4.1 Añadir tests unitarios para `buildAddressProposalMessage()` (Spanish, English, source adresles, source ecommerce)

## 5. Verificación manual (opcional)

- [x] 5.1 Verificar sub-journey 2.1 desde simulación con usuario registrado y dirección en libreta
- [x] 5.2 Verificar sub-journey 2.3 desde simulación con usuario no registrado, toggles eCommerce activos
- [x] 5.3 Verificar sub-journeys 2.2 y 2.4 (pregunta estándar) siguen funcionando
