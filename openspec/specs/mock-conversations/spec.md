# Spec: Mock Conversations API

> **Origen**: [`cu03-a2-sse-infrastructure`](../../changes/archive/2026-02-27-cu03-a2-sse-infrastructure/)  
> **Última actualización**: 2026-03-16 (actualizado en `fix-duplicate-user-messages`)

---

### Requirement: El controlador de conversaciones mock expone un endpoint SSE

`MockConversationsController` SHALL incluir un endpoint `GET :conversationId/events` anotado con `@Sse()` que retorna un `Observable<MessageEvent>` delegado a `MockSseService`.

#### Scenario: Petición GET al endpoint de eventos
- **WHEN** un cliente realiza `GET /api/mock/conversations/:conversationId/events`
- **THEN** el controlador retorna el Observable de `MockSseService.subscribe(conversationId)`
- **THEN** la respuesta es un stream SSE (`text/event-stream`)

### Requirement: MockSseService está inyectado y registrado en MockModule

`MockSseService` SHALL estar declarado como provider en `MockModule` y SHALL ser inyectado en `MockConversationsController` a través del constructor.

#### Scenario: Resolución de dependencias del módulo
- **WHEN** NestJS inicializa `MockModule`
- **THEN** `MockSseService` está disponible para inyección en `MockConversationsController`
- **THEN** `MockConversationsController` recibe la instancia correcta de `MockSseService`

### Requirement: El Worker usa un módulo dedicado `redis-publisher.ts` para pub/sub

El Worker SHALL publicar mensajes en Redis a través de `apps/worker/src/redis-publisher.ts`, un módulo independiente que encapsula el cliente `ioredis` y los helpers `publishConversationUpdate()` y `publishConversationComplete()`. Este módulo NO SHALL importarse desde `main.ts` ni exportarse desde él, para evitar imports circulares (ya que `main.ts` importa `conversation.processor.ts`, que a su vez importa `redis-publisher.ts`).

#### Scenario: Módulo redis-publisher creado sin circular import
- **WHEN** `conversation.processor.ts` importa de `redis-publisher.ts`
- **THEN** no existe ciclo de dependencias (`main.ts` → `processor` → `redis-publisher.ts`)
- **THEN** `redisPublisher` es una instancia válida de `ioredis.Redis` en runtime (no `undefined`)

#### Scenario: Verificación de ausencia de imports circulares
- **WHEN** se ejecuta `madge --circular apps/worker/src`
- **THEN** la salida no reporta ningún ciclo que involucre `redis-publisher.ts`, `main.ts` o `conversation.processor.ts`

### Requirement: El Worker publica mensajes del agente en Redis tras persistirlos

El processor de conversaciones del Worker SHALL llamar a `publishConversationUpdate(conversationId, role, content)` de `redis-publisher.ts` inmediatamente después de cada `saveMessage(conversationId, 'assistant', ...)` a lo largo de todos los handlers de fase.

#### Scenario: Mensaje del agente persistido y publicado
- **WHEN** el processor llama a `saveMessage(conversationId, 'assistant', mensaje)`
- **THEN** inmediatamente después llama a `publishConversationUpdate(conversationId, 'assistant', mensaje)`
- **THEN** Redis recibe el payload `{ role: 'assistant', content: mensaje, timestamp: <iso> }` en el canal `conversation:<id>:update`

### Requirement: El Worker publica eventos de fin de conversación mediante `publishConversationComplete`

Al actualizar el estado de la conversación a un estado terminal, el processor SHALL llamar a `publishConversationComplete(conversationId, status)` de `redis-publisher.ts`.

#### Scenario: Estado COMPLETED publicado
- **WHEN** el processor actualiza `Conversation.status` a `COMPLETED`
- **THEN** llama a `publishConversationComplete(conversationId, 'COMPLETED')`
- **THEN** Redis recibe `{ event: 'conversation:complete', status: 'COMPLETED' }` en el canal correspondiente

#### Scenario: Estado ESCALATED publicado
- **WHEN** el processor actualiza `Conversation.status` a `ESCALATED`
- **THEN** llama a `publishConversationComplete(conversationId, 'ESCALATED')`

### Requirement: El endpoint de historial excluye el item de estado interno `__state__`

`GET /api/mock/conversations/:conversationId/history` SHALL retornar únicamente los mensajes de conversación (`role: system | user | assistant`). El item DynamoDB con `messageId = '__state__'` (usado por el Worker para persistir la fase de la máquina de estados) SHALL ser filtrado y NO aparecer en la respuesta.

#### Scenario: Historial sin item de estado
- **WHEN** un cliente solicita `GET /api/mock/conversations/:id/history`
- **THEN** la respuesta es un array JSON de `DynamoMessage[]`
- **AND** ningún elemento del array tiene `messageId = '__state__'`
- **AND** ningún elemento carece de los campos `role`, `content` o `timestamp`

#### Scenario: Historial con item de estado presente en DynamoDB
- **WHEN** DynamoDB contiene el item `{ conversationId, messageId: '__state__', state: '...', expiresAt: N }` para la conversación
- **THEN** ese item NO aparece en la respuesta del endpoint de historial
- **AND** los mensajes de conversación (role: system/user/assistant) sí aparecen

### Requirement: `REDIS_URL` está disponible en el entorno de la API

La variable de entorno `REDIS_URL` SHALL estar definida en `apps/api/.env` para que `MockSseService` pueda conectarse a Redis. Si no está presente, el servicio SHALL usar el fallback `redis://localhost:6379` y loguear un aviso.

#### Scenario: Variable de entorno presente
- **WHEN** `MockSseService` se inicializa con `REDIS_URL` definida en el entorno
- **THEN** se conecta a la URL proporcionada

#### Scenario: Variable de entorno ausente
- **WHEN** `MockSseService` se inicializa sin `REDIS_URL` en el entorno
- **THEN** usa el fallback `redis://localhost:6379`
- **THEN** loguea el aviso `[SSE] REDIS_URL not set — using fallback redis://localhost:6379`

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

### Requirement: buildSyncSuccessMessage incluye el nombre de la tienda en el mensaje de confirmación

`buildSyncSuccessMessage()` SHALL aceptar un tercer parámetro `storeName: string` y SHALL incluirlo en el mensaje de confirmación para comunicar al usuario que el pedido ha sido actualizado tanto en la tienda online como en Adresles.

#### Scenario: Mensaje de confirmación en español con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'Spanish', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"
- **THEN** el mensaje confirma la dirección y menciona que el pedido está listo para envío

#### Scenario: Mensaje de confirmación en inglés con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'English', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"

#### Scenario: Mensaje de confirmación en francés con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'French', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"

### Requirement: Sub-journey 2.1 propone dirección Adresles guardada cuando el usuario está registrado

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'` y el usuario tiene `isRegistered: true` con al menos una dirección en su libreta Adresles, el Worker SHALL proponer directamente esa dirección en lugar de preguntarla.

#### Scenario: Usuario registrado con dirección favorita

- **WHEN** `processGetAddressJourney` recibe un usuario con `isRegistered: true` y al menos una `Address` (isDeleted: false) asociada
- **THEN** selecciona la dirección con `isDefault: true` o la primera por `createdAt`
- **THEN** genera mensaje con `buildAddressProposalMessage(..., 'adresles', language)`
- **THEN** guarda estado con `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress`
- **THEN** publica el mensaje vía `publishConversationUpdate`

#### Scenario: Usuario registrado sin direcciones — fallback a pregunta estándar

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: true` pero sin direcciones en libreta
- **THEN** continúa con el flujo estándar (OpenAI pregunta la dirección)

### Requirement: Sub-journey 2.3 propone dirección eCommerce cuando el usuario no está registrado

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'` y el usuario tiene `isRegistered: false` pero `context.buyerRegisteredEcommerce === true` y `context.buyerEcommerceAddress` tiene valor, el Worker SHALL proponer esa dirección.

#### Scenario: Usuario no registrado con dirección eCommerce

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: false` y `context?.buyerRegisteredEcommerce` y `context.buyerEcommerceAddress` presentes
- **THEN** mapea `buyerEcommerceAddress` a `PendingAddress` (full_address → gmapsFormatted, snake_case → camelCase)
- **THEN** genera mensaje con `buildAddressProposalMessage(..., 'ecommerce', language)`
- **THEN** guarda estado con `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress`

#### Scenario: Usuario no registrado sin dirección eCommerce — fallback

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: false` y sin `context.buyerEcommerceAddress` válido
- **THEN** continúa con el flujo estándar

### Requirement: Fase WAITING_ADDRESS_PROPOSAL_CONFIRM y handler handleAddressProposalConfirm

El processor SHALL incluir un handler para la fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` que interprete la respuesta del usuario y confirme o rechace la dirección propuesta.

#### Scenario: Usuario confirma la dirección propuesta

- **WHEN** el estado es `WAITING_ADDRESS_PROPOSAL_CONFIRM` y `interpretUserIntent` retorna `type: 'CONFIRM'`
- **THEN** llama a `finalizeAddress(ctx, state.pendingAddress!)` sin pasar por extracción ni Google Maps

#### Scenario: Usuario rechaza o da otra dirección

- **WHEN** el estado es `WAITING_ADDRESS_PROPOSAL_CONFIRM` y el usuario rechaza o proporciona corrección
- **THEN** transiciona a `WAITING_ADDRESS`
- **AND** si hay `intent.correction`, la usa como `userMessage` para el handler estándar

### Requirement: buildAddressProposalMessage genera mensajes bilingües según fuente

`buildAddressProposalMessage(pending, storeName, source, language)` SHALL generar mensajes que incluyan la dirección formateada y un CTA para confirmar o dar otra dirección, diferenciando entre fuente Adresles y eCommerce.

#### Scenario: Mensaje en español fuente Adresles

- **WHEN** `buildAddressProposalMessage(pending, 'TiendaX', 'adresles', 'Spanish')` es llamado
- **THEN** retorna string que contiene "tu dirección guardada en Adresles" y "Responde 'Sí' para confirmar"

#### Scenario: Mensaje en inglés fuente eCommerce

- **WHEN** `buildAddressProposalMessage(pending, 'StoreY', 'ecommerce', 'English')` es llamado
- **THEN** retorna string que contiene "your address registered at StoreY" y "Reply \"Yes\" to confirm"

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

### Requirement: ConversationPhase incluye WAITING_REGISTER, WAITING_REGISTER_EMAIL, WAITING_SAVE_ADDRESS y WAITING_SAVE_ADDRESS_LABEL

El tipo `ConversationPhase` en `address.service.ts` SHALL incluir los valores `'WAITING_REGISTER'`, `'WAITING_REGISTER_EMAIL'`, `'WAITING_SAVE_ADDRESS'` y `'WAITING_SAVE_ADDRESS_LABEL'`.

#### Scenario: Handlers registrados para las fases de registro y libreta

- **WHEN** el mapa de handlers en `processResponseProcessor` se consulta
- **THEN** incluye `WAITING_REGISTER: handleWaitingRegister`
- **THEN** incluye `WAITING_REGISTER_EMAIL: handleWaitingRegisterEmail`
- **THEN** incluye `WAITING_SAVE_ADDRESS: handleWaitingSaveAddress`
- **THEN** incluye `WAITING_SAVE_ADDRESS_LABEL: handleWaitingSaveAddressLabel`

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

### Requirement: Primer mensaje del journey GET_ADDRESS usa externalOrderId

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'`, el Worker SHALL generar el prompt al LLM usando `order.externalOrderId` (NOT NULL, siempre presente) en lugar de `order.externalOrderNumber` (nullable). Esto elimina el caso en el que el prompt incluía `"N/A"` cuando `externalOrderNumber` era `null`.

El tipo del parámetro `order` en `processGetAddressJourney` SHALL ser `{ externalOrderId: string; store: { name: string } }`. El campo `externalOrderNumber` ya no forma parte del tipo de este parámetro.

#### Scenario: Prompt al LLM incluye externalOrderId real

- **WHEN** `processGetAddressJourney` recibe un pedido con `externalOrderId: "100"` y `store.name: "ModaMujer"`
- **THEN** `buildGetAddressUserPrompt` recibe `orderNumber: "100"` (no `null`, no `"N/A"`)
- **AND** el prompt enviado al LLM contiene el valor `"100"` como referencia del pedido

#### Scenario: Eliminación del fallback N/A

- **WHEN** `processGetAddressJourney` se ejecuta para cualquier pedido de simulación
- **THEN** el parámetro `orderNumber` del prompt nunca es `null` ni `"N/A"`
- **AND** el prompt menciona el identificador real del pedido

#### Scenario: Order cargada incluye externalOrderId en el select

- **WHEN** `conversationProcessor` carga la Order para el journey GET_ADDRESS
- **THEN** la consulta Prisma incluye `externalOrderId` en los campos seleccionados (o usa `findUnique` sin `select` explícito)
- **AND** `order.externalOrderId` está disponible como `string` (nunca `undefined`)

---

### Requirement: Primer mensaje del journey INFORMATION tiene formato correcto en compra tradicional

Cuando el job `process-conversation` tiene `conversationType: 'INFORMATION'`, el Worker SHALL generar un primer mensaje que: (1) salude al usuario solo por su nombre (o «Cliente» si no hay `firstName`), (2) muestre el número de pedido con el valor de `order.externalOrderId` (nunca #N/A cuando la Order tiene ese campo), (3) incluya la dirección de entrega formateada usando `order.orderAddress.fullAddress` cuando exista la relación `order.orderAddress`, y (4) esté formateado con saltos de línea entre frases. El Worker SHALL cargar la Order con `include: { store: true, orderAddress: true }` para disponer del nombre de la tienda y de la OrderAddress.

#### Scenario: Saludo solo por nombre

- **WHEN** `processInformationJourney` se ejecuta con un usuario con `firstName: 'Carmen'` y `lastName: 'Martínez'`
- **THEN** el mensaje comienza con un saludo que usa solo «Carmen» (p. ej. «¡Hola Carmen!»)
- **AND** el mensaje NO incluye el apellido en el saludo

#### Scenario: Fallback cuando no hay nombre

- **WHEN** `processInformationJourney` se ejecuta con un usuario con `firstName: null`
- **THEN** el mensaje usa el fallback «Cliente» (o equivalente) en el saludo

#### Scenario: Número de pedido con external_order_id

- **WHEN** `processInformationJourney` se ejecuta con una Order con `externalOrderId: 'EXT-12345'`
- **THEN** el mensaje incluye el número de pedido visible para el usuario (p. ej. «Tu pedido #EXT-12345»)
- **AND** el mensaje NO muestra #N/A cuando `externalOrderId` está presente

#### Scenario: Dirección de entrega incluida cuando existe OrderAddress

- **WHEN** `processInformationJourney` se ejecuta con una Order que tiene `orderAddress` con `fullAddress: 'Calle Mayor 1, 3º A, 28001 Madrid'`
- **THEN** el mensaje incluye una frase con la dirección de entrega (p. ej. «La dirección de entrega es: Calle Mayor 1, 3º A, 28001 Madrid.»)
- **AND** el texto usa el valor de `order.orderAddress.fullAddress`

#### Scenario: Mensaje sin dirección cuando no hay OrderAddress

- **WHEN** `processInformationJourney` se ejecuta con una Order sin `orderAddress` (null)
- **THEN** el mensaje puede no incluir una línea explícita con la dirección o usar una variante neutra
- **AND** no se produce error por acceso a `order.orderAddress.fullAddress`

#### Scenario: Order cargada con store y orderAddress

- **WHEN** `conversationProcessor` procesa un job con `conversationType: 'INFORMATION'`
- **THEN** la Order se obtiene con `prisma.order.findUnique` con `include: { store: true, orderAddress: true }`
- **THEN** el objeto `order` tiene disponible `order.store.name` y opcionalmente `order.orderAddress`

### Requirement: El mensaje de usuario del reply se persiste exactamente una vez (por la API)

Cada mensaje enviado por el usuario vía `POST /api/mock/conversations/:conversationId/reply` SHALL ser persistido en DynamoDB exactamente una vez. La API SHALL ser la única responsable de esa persistencia: al recibir el reply, el servicio SHALL llamar a `saveUserMessage` (o equivalente) antes de encolar el job `process-response`. El Worker SHALL NOT llamar a `saveMessage(conversationId, 'user', userMessage)` para el mensaje recibido en el payload del job `process-response`, de modo que no se generen duplicados en el historial.

#### Scenario: API persiste el mensaje de usuario al recibir el reply
- **WHEN** un cliente envía `POST /api/mock/conversations/:id/reply` con cuerpo `{ message: "texto del usuario" }`
- **THEN** el servicio de la API persiste un ítem en DynamoDB con `role: 'user'` y el contenido recibido
- **THEN** el servicio encola un job `process-response` con `userMessage` en el payload

#### Scenario: El Worker no persiste de nuevo el mensaje de usuario del job
- **WHEN** el Worker procesa un job `process-response` con `userMessage` en el payload
- **THEN** el Worker NO llama a `saveMessage(conversationId, 'user', userMessage)` al inicio del processor
- **THEN** el Worker puede seguir leyendo el historial con `getMessages(conversationId)` y el mensaje ya está presente (persistido por la API)

#### Scenario: Historial sin duplicados de mensajes de usuario
- **WHEN** un usuario ha enviado un único mensaje en una conversación y el job `process-response` ha sido procesado
- **THEN** `GET /api/admin/conversations/:id/messages` (o el endpoint de historial equivalente) devuelve un único ítem con `role: 'user'` para ese mensaje
- **AND** no aparecen dos ítems con el mismo contenido y rol `user` para la misma interacción
