## MODIFIED Requirements

### Requirement: finalizeAddress actualiza Order con syncedAt y statusSource tras confirmar dirección

Cuando el Worker completa exitosamente el flujo de confirmación de dirección, `finalizeAddress()` SHALL actualizar el pedido con `status = 'READY_TO_PROCESS'`, `addressConfirmedAt`, `syncedAt` y `statusSource = 'ADRESLES'` en una única operación `prisma.order.update()`. Tras la sincronización, `finalizeAddress()` SHALL bifurcar según `user.isRegistered`: si el usuario está registrado, marcará la conversación como COMPLETED y emitirá SSE complete; si no está registrado, ofrecerá el registro y transicionará a `WAITING_REGISTER` sin marcar COMPLETED.

#### Scenario: Pedido actualizado con todos los campos de trazabilidad

- **WHEN** el usuario confirma su dirección de entrega y `simulateEcommerceSync()` retorna `{ success: true }`
- **THEN** `prisma.order.update()` se llama con `{ status: 'READY_TO_PROCESS', addressConfirmedAt: now, syncedAt: now, statusSource: 'ADRESLES' }`
- **THEN** el pedido en la DB tiene `status = 'READY_TO_PROCESS'`, `synced_at` y `status_source = 'ADRESLES'` con el timestamp de la confirmación

#### Scenario: Usuario registrado — conversación marcada como COMPLETED

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente y `user.isRegistered === true`
- **THEN** `prisma.conversation.update()` se llama con `{ status: 'COMPLETED', completedAt: now }`
- **THEN** `publishConversationComplete(conversationId, 'COMPLETED')` es llamado

#### Scenario: Usuario no registrado — oferta de registro y transición a WAITING_REGISTER

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente y `user.isRegistered === false`
- **THEN** envía mensaje de confirmación de dirección y mensaje de oferta de registro
- **THEN** llama a `saveConversationState` con `phase: 'WAITING_REGISTER'` y `confirmedAddress`
- **THEN** NO llama a `prisma.conversation.update` con COMPLETED
- **THEN** NO llama a `publishConversationComplete`

## ADDED Requirements

### Requirement: Fase WAITING_REGISTER y handler handleWaitingRegister

El processor SHALL incluir la fase `WAITING_REGISTER` y un handler que interprete la respuesta del usuario a la oferta de registro (Sí/No).

#### Scenario: Usuario acepta registrarse

- **WHEN** el estado es `WAITING_REGISTER` y `interpretUserIntent('WAITING_CONFIRMATION', userMessage, language)` retorna `type: 'CONFIRM'`
- **THEN** genera mensaje con `buildRegistrationEmailRequestMessage(language)` pidiendo el email
- **THEN** guarda estado con `phase: 'WAITING_REGISTER_EMAIL'` y `confirmedAddress` preservado
- **THEN** publica el mensaje vía `publishConversationUpdate`

#### Scenario: Usuario rechaza el registro

- **WHEN** el estado es `WAITING_REGISTER` y el usuario rechaza (REJECT o UNKNOWN tratado como rechazo)
- **THEN** genera mensaje con `buildRegistrationDeclinedMessage(language)`
- **THEN** actualiza `Conversation.status` a `COMPLETED`
- **THEN** llama a `publishConversationComplete(conversationId, 'COMPLETED')`

### Requirement: Fase WAITING_REGISTER_EMAIL y handler handleWaitingRegisterEmail

El processor SHALL incluir la fase `WAITING_REGISTER_EMAIL` y un handler que extraiga el email del mensaje del usuario, valide y actualice el User o re-pida el email.

#### Scenario: Email válido — User actualizado y transición a WAITING_SAVE_ADDRESS

- **WHEN** el estado es `WAITING_REGISTER_EMAIL` y `extractEmailFromMessage(userMessage)` retorna un email válido
- **THEN** `prisma.user.update` se llama con `{ isRegistered: true, registeredAt: now, email: <email extraído> }`
- **THEN** genera mensaje con `buildRegistrationSuccessMessage(language)`
- **THEN** guarda estado con `phase: 'WAITING_SAVE_ADDRESS'` y `confirmedAddress`
- **THEN** publica el mensaje vía `publishConversationUpdate`
- **THEN** NO marca la conversación como COMPLETED (CU03-B4 continuará el flujo)

#### Scenario: Email inválido — re-pedir email

- **WHEN** el estado es `WAITING_REGISTER_EMAIL` y `extractEmailFromMessage(userMessage)` retorna `null`
- **THEN** reenvía el mensaje con `buildRegistrationEmailRequestMessage(language)`
- **THEN** mantiene `phase: 'WAITING_REGISTER_EMAIL'`
- **THEN** publica el mensaje vía `publishConversationUpdate`

### Requirement: buildRegistrationOfferMessage genera mensajes bilingües

`buildRegistrationOfferMessage(language)` SHALL retornar mensajes que ofrezcan el registro gratuito en Adresles y pidan responder Sí o No.

#### Scenario: Mensaje en español

- **WHEN** `buildRegistrationOfferMessage('Spanish')` es llamado
- **THEN** retorna string que contiene "registrarte en Adresles" y "Sí" o "No"

#### Scenario: Mensaje en inglés

- **WHEN** `buildRegistrationOfferMessage('English')` es llamado
- **THEN** retorna string que contiene "register with Adresles" y "Yes" o "No"

### Requirement: buildRegistrationEmailRequestMessage pide el email

`buildRegistrationEmailRequestMessage(language)` SHALL retornar mensajes que pidan el correo electrónico para completar el registro.

#### Scenario: Mensaje en español

- **WHEN** `buildRegistrationEmailRequestMessage('Spanish')` es llamado
- **THEN** retorna string que menciona "correo electrónico" o equivalente

#### Scenario: Mensaje en inglés

- **WHEN** `buildRegistrationEmailRequestMessage('English')` es llamado
- **THEN** retorna string que menciona "email" o "e-mail"

### Requirement: buildRegistrationSuccessMessage agradece la confianza

`buildRegistrationSuccessMessage(language)` SHALL retornar mensajes de confirmación tras el registro, agradeciendo la confianza en Adresles.

#### Scenario: Mensaje en español

- **WHEN** `buildRegistrationSuccessMessage('Spanish')` es llamado
- **THEN** retorna string que contiene "registrado" y "confiar" o "gracias"

#### Scenario: Mensaje en inglés

- **WHEN** `buildRegistrationSuccessMessage('English')` es llamado
- **THEN** retorna string que contiene "registered" y "thank" o "trust"

### Requirement: buildRegistrationDeclinedMessage despedida al rechazar

`buildRegistrationDeclinedMessage(language)` SHALL retornar mensajes de despedida cuando el usuario rechaza el registro.

#### Scenario: Mensaje en español

- **WHEN** `buildRegistrationDeclinedMessage('Spanish')` es llamado
- **THEN** retorna string amable de despedida (ej. "Sin problema", "Hasta pronto")

#### Scenario: Mensaje en inglés

- **WHEN** `buildRegistrationDeclinedMessage('English')` es llamado
- **THEN** retorna string amable de despedida (ej. "No problem", "See you")

### Requirement: extractEmailFromMessage extrae y valida email

`extractEmailFromMessage(message: string)` SHALL extraer un email válido del mensaje del usuario. SHALL retornar `string` si encuentra un email válido o `null` si no.

#### Scenario: Mensaje con email válido estándar

- **WHEN** `extractEmailFromMessage('mi correo es juan@gmail.com')` es llamado
- **THEN** retorna `'juan@gmail.com'` o equivalente normalizado

#### Scenario: Mensaje con solo email

- **WHEN** `extractEmailFromMessage('user@domain.org')` es llamado
- **THEN** retorna `'user@domain.org'`

#### Scenario: Mensaje sin email válido

- **WHEN** `extractEmailFromMessage('no tengo correo')` es llamado
- **THEN** retorna `null`

#### Scenario: Mensaje vacío o solo espacios

- **WHEN** `extractEmailFromMessage('')` o `extractEmailFromMessage('   ')` es llamado
- **THEN** retorna `null`

### Requirement: ConversationState incluye confirmedAddress

`ConversationState` en `address.service.ts` SHALL incluir un campo opcional `confirmedAddress?: PendingAddress` para almacenar la dirección confirmada y sincronizada, usada al transicionar a `WAITING_SAVE_ADDRESS` (CU03-B4).

#### Scenario: Estado con confirmedAddress en WAITING_REGISTER

- **WHEN** `finalizeAddress` se ejecuta con `user.isRegistered === false` y dirección confirmada `pending`
- **THEN** `saveConversationState` recibe `{ phase: 'WAITING_REGISTER', confirmedAddress: pending }`
- **THEN** el estado persistido en DynamoDB incluye `confirmedAddress` con la estructura `PendingAddress`

### Requirement: ConversationPhase incluye WAITING_REGISTER y WAITING_REGISTER_EMAIL

El tipo `ConversationPhase` en `address.service.ts` SHALL incluir los valores `'WAITING_REGISTER'` y `'WAITING_REGISTER_EMAIL'`.

#### Scenario: Handlers registrados para las nuevas fases

- **WHEN** el mapa de handlers en `processResponseProcessor` se consulta
- **THEN** incluye `WAITING_REGISTER: handleWaitingRegister`
- **THEN** incluye `WAITING_REGISTER_EMAIL: handleWaitingRegisterEmail`
