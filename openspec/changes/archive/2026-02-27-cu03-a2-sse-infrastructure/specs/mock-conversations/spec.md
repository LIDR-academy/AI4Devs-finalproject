## ADDED Requirements

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

### Requirement: `REDIS_URL` está disponible en el entorno de la API

La variable de entorno `REDIS_URL` SHALL estar definida en `apps/api/.env` para que `MockSseService` pueda conectarse a Redis. Si no está presente, el servicio SHALL usar el fallback `redis://localhost:6379` y loguear un aviso.

#### Scenario: Variable de entorno presente
- **WHEN** `MockSseService` se inicializa con `REDIS_URL` definida en el entorno
- **THEN** se conecta a la URL proporcionada

#### Scenario: Variable de entorno ausente
- **WHEN** `MockSseService` se inicializa sin `REDIS_URL` en el entorno
- **THEN** usa el fallback `redis://localhost:6379`
