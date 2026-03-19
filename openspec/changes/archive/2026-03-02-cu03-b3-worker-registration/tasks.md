## 1. address.service.ts — Tipos y mensajes

- [x] 1.1 Añadir `WAITING_REGISTER` y `WAITING_REGISTER_EMAIL` al tipo `ConversationPhase`
- [x] 1.2 Añadir campo `confirmedAddress?: PendingAddress` a `ConversationState`
- [x] 1.3 Implementar `buildRegistrationOfferMessage(language)` con soporte ES/EN
- [x] 1.4 Implementar `buildRegistrationEmailRequestMessage(language)` con soporte ES/EN
- [x] 1.5 Implementar `buildRegistrationSuccessMessage(language)` con soporte ES/EN
- [x] 1.6 Implementar `buildRegistrationDeclinedMessage(language)` con soporte ES/EN
- [x] 1.7 Implementar `extractEmailFromMessage(message: string): string | null` con regex

## 2. address.service.spec.ts — Tests unitarios

- [x] 2.1 Tests para `buildRegistrationOfferMessage` (ES/EN)
- [x] 2.2 Tests para `buildRegistrationEmailRequestMessage` (ES/EN)
- [x] 2.3 Tests para `buildRegistrationSuccessMessage` (ES/EN)
- [x] 2.4 Tests para `buildRegistrationDeclinedMessage` (ES/EN)
- [x] 2.5 Tests para `extractEmailFromMessage` (válido, solo email, inválido, vacío)

## 3. conversation.processor.ts — finalizeAddress y handlers

- [x] 3.1 Asegurar que `user.isRegistered` esté en `HandlerContext` (incluir en `findUnique` de Prisma)
- [x] 3.2 Modificar `finalizeAddress()`: bifurcar según `user.isRegistered`; si no registrado, ofrecer registro y guardar `WAITING_REGISTER` con `confirmedAddress` sin marcar COMPLETED
- [x] 3.3 Implementar `handleWaitingRegister()`: CONFIRM → pedir email y transicionar a `WAITING_REGISTER_EMAIL`; rechaza → mensaje despedida + COMPLETED + SSE complete
- [x] 3.4 Implementar `handleWaitingRegisterEmail()`: email válido → `prisma.user.update` (isRegistered, registeredAt, email) → mensaje confirmación → transicionar a `WAITING_SAVE_ADDRESS`; inválido → re-pedir email
- [x] 3.5 Implementar handler temporal para `WAITING_SAVE_ADDRESS` que cierre la conversación tras mensaje de confirmación (para despliegue independiente de B3)
- [x] 3.6 Añadir `WAITING_REGISTER`, `WAITING_REGISTER_EMAIL` y `WAITING_SAVE_ADDRESS` al mapa de handlers en `processResponseProcessor()`

## 4. conversation.processor — Tests

- [x] 4.1 Test: `finalizeAddress` con usuario registrado → marca COMPLETED y publica SSE complete
- [x] 4.2 Test: `finalizeAddress` con usuario no registrado → no marca COMPLETED, ofrece registro, estado WAITING_REGISTER
- [x] 4.3 Test: `handleWaitingRegister` acepta → pide email y transiciona a WAITING_REGISTER_EMAIL
- [x] 4.4 Test: `handleWaitingRegister` rechaza → mensaje despedida + COMPLETED + SSE complete
- [x] 4.5 Test: `handleWaitingRegisterEmail` email válido → User actualizado + mensaje confirmación + WAITING_SAVE_ADDRESS
- [x] 4.6 Test: `handleWaitingRegisterEmail` email inválido → re-pide email, mantiene WAITING_REGISTER_EMAIL

## 5. Specs y verificación

- [x] 5.1 Sincronizar delta spec a `openspec/specs/mock-conversations/spec.md` (merge de requirements ADDED/MODIFIED)
- [x] 5.2 Ejecutar todos los tests del Worker y verificar que pasan
- [x] 5.3 Ejecutar `madge --circular apps/worker/src` y verificar ausencia de ciclos
