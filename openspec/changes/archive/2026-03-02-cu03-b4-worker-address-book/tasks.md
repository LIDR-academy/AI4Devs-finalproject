# Tasks: CU03-B4 — Worker Libreta de direcciones

## 1. address.service.ts — Mensajes y fase

- [x] 1.1 Implementar `buildSaveAddressOfferMessage(pending, language)` bilingüe (ES/EN) en `address.service.ts`
- [x] 1.2 Implementar `buildSaveAddressLabelRequestMessage(language)` bilingüe en `address.service.ts`
- [x] 1.3 Implementar `buildAddressSavedMessage(language)` y `buildAddressNotSavedMessage(language)` bilingües en `address.service.ts`
- [x] 1.4 Añadir `WAITING_SAVE_ADDRESS_LABEL` al tipo `ConversationPhase` en `address.service.ts`

## 2. conversation.processor.ts — Helpers y handlers

- [x] 2.1 Implementar función `closeConversation(ctx)` que actualice `Conversation.status` a COMPLETED y llame a `publishConversationComplete`
- [x] 2.2 Implementar función `offerSaveAddress(ctx, confirmedAddress)` con detección de dirección nueva (compare `fullAddress` normalizado) y transición a WAITING_SAVE_ADDRESS o cierre si ya existe
- [x] 2.3 Implementar `sanitizeAddressLabel(input)` (trim, fallback `'Mi dirección'`, slice 80 chars) en el processor
- [x] 2.4 Reemplazar handler `handleWaitingSaveAddress`: CONFIRM → pedir alias y transicionar a WAITING_SAVE_ADDRESS_LABEL; REJECT → `buildAddressNotSavedMessage` + `closeConversation`
- [x] 2.5 Implementar handler `handleWaitingSaveAddressLabel`: extraer alias, sanitizar, `prisma.address.create` con label, `buildAddressSavedMessage`, `closeConversation`
- [x] 2.6 Añadir `WAITING_SAVE_ADDRESS_LABEL: handleWaitingSaveAddressLabel` al mapa `handlers`
- [x] 2.7 Añadir imports de `buildSaveAddressOfferMessage`, `buildSaveAddressLabelRequestMessage`, `buildAddressSavedMessage`, `buildAddressNotSavedMessage` en el processor

## 3. conversation.processor.ts — Integración en flujo existente

- [x] 3.1 Modificar `finalizeAddress()`: para `user.isRegistered === true`, reemplazar cierre directo por `return offerSaveAddress(ctx, pending)`
- [x] 3.2 Modificar `handleWaitingRegisterEmail()`: tras registro exitoso (email válido), llamar a `offerSaveAddress({ ...ctx, state: { ...state, confirmedAddress } }, confirmedAddress)` en lugar de solo `saveConversationState`

## 4. Tests unitarios address.service

- [x] 4.1 Tests para `buildSaveAddressOfferMessage` (ES/EN) en `address.service.spec.ts`
- [x] 4.2 Tests para `buildSaveAddressLabelRequestMessage`, `buildAddressSavedMessage`, `buildAddressNotSavedMessage` (ES/EN) en `address.service.spec.ts`

## 5. Tests unitarios conversation.processor

- [x] 5.1 Verificar mocks de Prisma/Redis/DynamoDB según worker-testing-patterns.md en `conversation.processor.spec.ts`
- [x] 5.2 Tests para `offerSaveAddress`: dirección nueva → ofrece; dirección ya guardada → cierra
- [x] 5.3 Tests para `handleWaitingSaveAddress`: CONFIRM → pide alias y transiciona; REJECT → cierra
- [x] 5.4 Tests para `handleWaitingSaveAddressLabel`: mensaje con alias → Address creada con ese label; mensaje vacío → Address con `'Mi dirección'`
- [x] 5.5 Tests de integración: `finalizeAddress` con usuario registrado llama a `offerSaveAddress`; `handleWaitingRegisterEmail` con email válido llama a `offerSaveAddress`

## 6. Verificación manual y documentación

- [x] 6.1 Verificar escenario: usuario registrado + sub-journey 2.1 (dirección ya guardada) → no ofrece guardar, cierra directamente
- [x] 6.2 Verificar escenario: usuario registrado + dirección nueva → ofrece → acepta → alias "Casa" → Address con label "Casa"
- [x] 6.3 Verificar escenario: usuario recién registrado → ofrece guardar → acepta → alias "Trabajo" → Address creada
- [x] 6.4 Aplicar delta spec a `openspec/specs/mock-conversations/spec.md` (sync desde change al spec principal)
- [x] 6.5 Registrar sesión en `memory-bank/sessions/` al completar
