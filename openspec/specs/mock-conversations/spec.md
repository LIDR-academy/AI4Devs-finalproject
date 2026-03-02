# Spec: Mock Conversations API

> **Origen**: [`cu03-a2-sse-infrastructure`](../../changes/archive/2026-02-27-cu03-a2-sse-infrastructure/)  
> **Última actualización**: 2026-03-02 (actualizado en `cu03-b2-worker-address-proposals`)

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

Cuando el Worker completa exitosamente el flujo de confirmación de dirección, `finalizeAddress()` SHALL actualizar el pedido con `status = 'READY_TO_PROCESS'`, `addressConfirmedAt`, `syncedAt` y `statusSource = 'ADRESLES'` en una única operación `prisma.order.update()`.

#### Scenario: Pedido actualizado con todos los campos de trazabilidad

- **WHEN** el usuario confirma su dirección de entrega y `simulateEcommerceSync()` retorna `{ success: true }`
- **THEN** `prisma.order.update()` se llama con `{ status: 'READY_TO_PROCESS', addressConfirmedAt: now, syncedAt: now, statusSource: 'ADRESLES' }`
- **THEN** el pedido en la DB tiene `status = 'READY_TO_PROCESS'`, `synced_at` y `status_source = 'ADRESLES'` con el timestamp de la confirmación

#### Scenario: Estado de la conversación marcada como COMPLETED

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente
- **THEN** `prisma.conversation.update()` se llama con `{ status: 'COMPLETED', completedAt: now }`
- **THEN** `publishConversationComplete(conversationId, 'COMPLETED')` es llamado

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
