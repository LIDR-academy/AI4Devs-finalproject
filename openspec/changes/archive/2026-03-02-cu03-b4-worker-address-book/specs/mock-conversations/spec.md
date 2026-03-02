# Delta Spec: mock-conversations — CU03-B4 Worker Libreta de direcciones

> **Change**: cu03-b4-worker-address-book  
> **Capability**: mock-conversations (modified)

---

## MODIFIED Requirements

### Requirement: finalizeAddress actualiza Order con syncedAt y statusSource tras confirmar dirección

Cuando el Worker completa exitosamente el flujo de confirmación de dirección, `finalizeAddress()` SHALL actualizar el pedido con `status = 'READY_TO_PROCESS'`, `addressConfirmedAt`, `syncedAt` y `statusSource = 'ADRESLES'` en una única operación `prisma.order.update()`. Tras la sincronización, `finalizeAddress()` SHALL bifurcar según `user.isRegistered`: si el usuario está registrado, llamará a `offerSaveAddress(ctx, pending)` para ofrecer guardar la dirección en la libreta (o cerrar si ya la tiene); si no está registrado, ofrecerá el registro y transicionará a `WAITING_REGISTER` sin marcar COMPLETED.

#### Scenario: Pedido actualizado con todos los campos de trazabilidad

- **WHEN** el usuario confirma su dirección de entrega y `simulateEcommerceSync()` retorna `{ success: true }`
- **THEN** `prisma.order.update()` se llama con `{ status: 'READY_TO_PROCESS', addressConfirmedAt: now, syncedAt: now, statusSource: 'ADRESLES' }`
- **THEN** el pedido en la DB tiene `status = 'READY_TO_PROCESS'`, `synced_at` y `status_source = 'ADRESLES'` con el timestamp de la confirmación

#### Scenario: Usuario registrado — llama a offerSaveAddress

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente y `user.isRegistered === true`
- **THEN** llama a `offerSaveAddress(ctx, pending)` en lugar de cerrar la conversación directamente
- **THEN** NO llama a `prisma.conversation.update` con COMPLETED ni a `publishConversationComplete` en este punto (offerSaveAddress decide si ofrecer guardar o cerrar)

#### Scenario: Usuario no registrado — oferta de registro y transición a WAITING_REGISTER

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente y `user.isRegistered === false`
- **THEN** envía mensaje de confirmación de dirección y mensaje de oferta de registro
- **THEN** llama a `saveConversationState` con `phase: 'WAITING_REGISTER'` y `confirmedAddress`
- **THEN** NO llama a `prisma.conversation.update` con COMPLETED
- **THEN** NO llama a `publishConversationComplete`

### Requirement: Fase WAITING_REGISTER_EMAIL y handler handleWaitingRegisterEmail

El processor SHALL incluir la fase `WAITING_REGISTER_EMAIL` y un handler que extraiga el email del mensaje del usuario, valide y actualice el User o re-pida el email.

#### Scenario: Email válido — User actualizado y llamada a offerSaveAddress

- **WHEN** el estado es `WAITING_REGISTER_EMAIL` y `extractEmailFromMessage(userMessage)` retorna un email válido
- **THEN** `prisma.user.update` se llama con `{ isRegistered: true, registeredAt: now, email: <email extraído> }`
- **THEN** genera mensaje con `buildRegistrationSuccessMessage(language)`
- **THEN** publica el mensaje vía `publishConversationUpdate`
- **THEN** llama a `offerSaveAddress({ ...ctx, state: { ...state, confirmedAddress } }, confirmedAddress)` en lugar de solo `saveConversationState(WAITING_SAVE_ADDRESS)`
- **THEN** NO marca la conversación como COMPLETED (offerSaveAddress envía la oferta de guardar y transiciona)

#### Scenario: Email inválido — re-pedir email

- **WHEN** el estado es `WAITING_REGISTER_EMAIL` y `extractEmailFromMessage(userMessage)` retorna `null`
- **THEN** reenvía el mensaje con `buildRegistrationEmailRequestMessage(language)`
- **THEN** mantiene `phase: 'WAITING_REGISTER_EMAIL'`
- **THEN** publica el mensaje vía `publishConversationUpdate`

### Requirement: ConversationPhase incluye WAITING_REGISTER y WAITING_REGISTER_EMAIL

El tipo `ConversationPhase` en `address.service.ts` SHALL incluir los valores `'WAITING_REGISTER'`, `'WAITING_REGISTER_EMAIL'`, `'WAITING_SAVE_ADDRESS'` y `'WAITING_SAVE_ADDRESS_LABEL'`.

#### Scenario: Handlers registrados para las fases de registro y libreta

- **WHEN** el mapa de handlers en `processResponseProcessor` se consulta
- **THEN** incluye `WAITING_REGISTER: handleWaitingRegister`
- **THEN** incluye `WAITING_REGISTER_EMAIL: handleWaitingRegisterEmail`
- **THEN** incluye `WAITING_SAVE_ADDRESS: handleWaitingSaveAddress`
- **THEN** incluye `WAITING_SAVE_ADDRESS_LABEL: handleWaitingSaveAddressLabel`

---

## ADDED Requirements

### Requirement: offerSaveAddress ofrece guardar dirección cuando es nueva

La función `offerSaveAddress(ctx, confirmedAddress)` SHALL consultar las direcciones existentes del usuario (`prisma.address.findMany` con `where: { userId, isDeleted: false }`), comparar `fullAddress` normalizado (trim + lowercase), y si la dirección no está en la libreta SHALL enviar el mensaje de oferta con `buildSaveAddressOfferMessage`, guardar estado con `phase: 'WAITING_SAVE_ADDRESS'` y `confirmedAddress`, y retornar. Si la dirección ya existe SHALL llamar a `closeConversation(ctx)` y retornar.

#### Scenario: Dirección nueva — oferta enviada y transición a WAITING_SAVE_ADDRESS

- **WHEN** `offerSaveAddress(ctx, confirmedAddress)` se ejecuta y ninguna dirección del usuario coincide con `confirmedAddress.gmapsFormatted` (normalizado)
- **THEN** llama a `saveMessage` y `publishConversationUpdate` con el mensaje de `buildSaveAddressOfferMessage`
- **THEN** llama a `saveConversationState` con `phase: 'WAITING_SAVE_ADDRESS'` y `confirmedAddress`
- **THEN** NO llama a `closeConversation`

#### Scenario: Dirección ya en libreta — cierre directo

- **WHEN** `offerSaveAddress(ctx, confirmedAddress)` se ejecuta y existe una Address del usuario con `fullAddress` que coincide (trim + lowercase) con `confirmedAddress.gmapsFormatted`
- **THEN** llama a `closeConversation(ctx)`
- **THEN** NO envía mensaje de oferta
- **THEN** NO llama a `saveConversationState` con WAITING_SAVE_ADDRESS

### Requirement: closeConversation cierra la conversación con COMPLETED y SSE

La función `closeConversation(ctx)` SHALL actualizar `Conversation.status` a `COMPLETED` con `completedAt: now` y SHALL llamar a `publishConversationComplete(conversationId, 'COMPLETED')`.

#### Scenario: Cierre correcto

- **WHEN** `closeConversation(ctx)` se ejecuta
- **THEN** `prisma.conversation.update` se llama con `{ status: 'COMPLETED', completedAt: now }`
- **THEN** `publishConversationComplete(conversationId, 'COMPLETED')` es llamado

### Requirement: Fase WAITING_SAVE_ADDRESS y handler handleWaitingSaveAddress

El processor SHALL incluir un handler para `WAITING_SAVE_ADDRESS` que interprete la respuesta del usuario (Sí/No) con `interpretUserIntent('WAITING_CONFIRMATION', ...)`. Si `CONFIRM`, SHALL pedir el alias con `buildSaveAddressLabelRequestMessage`, guardar estado con `phase: 'WAITING_SAVE_ADDRESS_LABEL'` y `confirmedAddress`, y retornar. Si no CONFIRM, SHALL enviar `buildAddressNotSavedMessage` y llamar a `closeConversation`.

#### Scenario: Usuario acepta guardar — pide alias

- **WHEN** el estado es `WAITING_SAVE_ADDRESS` y `interpretUserIntent('WAITING_CONFIRMATION', userMessage, language)` retorna `type: 'CONFIRM'`
- **THEN** genera mensaje con `buildSaveAddressLabelRequestMessage(language)`
- **THEN** guarda estado con `phase: 'WAITING_SAVE_ADDRESS_LABEL'` y `confirmedAddress` preservado
- **THEN** publica el mensaje vía `publishConversationUpdate`
- **THEN** NO llama a `closeConversation`

#### Scenario: Usuario rechaza guardar

- **WHEN** el estado es `WAITING_SAVE_ADDRESS` y el usuario no confirma (REJECT o UNKNOWN)
- **THEN** genera mensaje con `buildAddressNotSavedMessage(language)`
- **THEN** publica el mensaje vía `publishConversationUpdate`
- **THEN** llama a `closeConversation(ctx)`

### Requirement: Fase WAITING_SAVE_ADDRESS_LABEL y handler handleWaitingSaveAddressLabel

El processor SHALL incluir la fase `WAITING_SAVE_ADDRESS_LABEL` y un handler que tome el mensaje del usuario como alias, lo sanitice (trim; si vacío usar `'Mi dirección'`; truncar a 80 caracteres), cree un registro en `prisma.address` con `userId`, `label`, y los campos de `confirmedAddress`, envíe `buildAddressSavedMessage` y llame a `closeConversation`.

#### Scenario: Usuario proporciona alias válido — Address creada

- **WHEN** el estado es `WAITING_SAVE_ADDRESS_LABEL` y el usuario envía un mensaje no vacío (ej. "Casa")
- **THEN** `sanitizeAddressLabel(userMessage)` retorna el alias truncado (trim, max 80 chars)
- **THEN** `prisma.address.create` se llama con `userId`, `label: <alias>`, `fullAddress`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country`, `isDefault: false`
- **THEN** genera mensaje con `buildAddressSavedMessage(language)`
- **THEN** publica el mensaje vía `publishConversationUpdate`
- **THEN** llama a `closeConversation(ctx)`

#### Scenario: Usuario proporciona mensaje vacío — fallback a Mi dirección

- **WHEN** el estado es `WAITING_SAVE_ADDRESS_LABEL` y `userMessage.trim()` es vacío
- **THEN** `prisma.address.create` se llama con `label: 'Mi dirección'`
- **THEN** genera mensaje con `buildAddressSavedMessage(language)` y llama a `closeConversation`

### Requirement: buildSaveAddressOfferMessage ofrece guardar en la libreta

`buildSaveAddressOfferMessage(pending, language)` SHALL retornar mensajes bilingües que ofrezcan guardar la dirección en la libreta de Adresles, incluyan la dirección formateada y pidan responder Sí o No.

#### Scenario: Mensaje en español

- **WHEN** `buildSaveAddressOfferMessage(pending, 'Spanish')` es llamado
- **THEN** retorna string que contiene "libreta de Adresles" y "Sí" o "No"

#### Scenario: Mensaje en inglés

- **WHEN** `buildSaveAddressOfferMessage(pending, 'English')` es llamado
- **THEN** retorna string que contiene "address book" y "Yes" o "No"

### Requirement: buildSaveAddressLabelRequestMessage pide el alias

`buildSaveAddressLabelRequestMessage(language)` SHALL retornar mensajes que pidan al usuario indicar cómo quiere llamar a la dirección (ej: Casa, Trabajo).

#### Scenario: Mensaje en español

- **WHEN** `buildSaveAddressLabelRequestMessage('Spanish')` es llamado
- **THEN** retorna string que menciona "cómo quieres llamar" o equivalente

#### Scenario: Mensaje en inglés

- **WHEN** `buildSaveAddressLabelRequestMessage('English')` es llamado
- **THEN** retorna string que menciona "call this address" o equivalente

### Requirement: buildAddressSavedMessage confirma que la dirección se guardó

`buildAddressSavedMessage(language)` SHALL retornar mensajes de confirmación indicando que la dirección fue guardada en la libreta.

#### Scenario: Mensaje en español

- **WHEN** `buildAddressSavedMessage('Spanish')` es llamado
- **THEN** retorna string que contiene "guardada" y "libreta"

#### Scenario: Mensaje en inglés

- **WHEN** `buildAddressSavedMessage('English')` es llamado
- **THEN** retorna string que contiene "saved" y "address book"

### Requirement: buildAddressNotSavedMessage despedida al rechazar guardar

`buildAddressNotSavedMessage(language)` SHALL retornar mensajes de despedida cuando el usuario rechaza guardar la dirección.

#### Scenario: Mensaje en español

- **WHEN** `buildAddressNotSavedMessage('Spanish')` es llamado
- **THEN** retorna string amable de despedida (ej. "Sin problema", "Hasta pronto")

#### Scenario: Mensaje en inglés

- **WHEN** `buildAddressNotSavedMessage('English')` es llamado
- **THEN** retorna string amable de despedida (ej. "No problem")

### Requirement: sanitizeAddressLabel normaliza el alias para Address.label

La función `sanitizeAddressLabel(input: string)` SHALL retornar `input.trim()`; si el resultado es vacío SHALL retornar `'Mi dirección'`; en caso contrario SHALL retornar el string truncado a 80 caracteres.

#### Scenario: Alias con contenido

- **WHEN** `sanitizeAddressLabel('  Casa  ')` es llamado
- **THEN** retorna `'Casa'`

#### Scenario: Mensaje vacío

- **WHEN** `sanitizeAddressLabel('')` o `sanitizeAddressLabel('   ')` es llamado
- **THEN** retorna `'Mi dirección'`

#### Scenario: Alias muy largo

- **WHEN** `sanitizeAddressLabel(<string de más de 80 caracteres>)` es llamado
- **THEN** retorna el string truncado a 80 caracteres
