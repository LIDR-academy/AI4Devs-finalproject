## ADDED Requirements

### Requirement: El servicio SSE se suscribe a Redis para recibir mensajes de conversación

`MockSseService` SHALL suscribirse al patrón Redis `conversation:*:update` usando `psubscribe` en el momento de inicialización del módulo. Cada mensaje recibido SHALL ser emitido internamente a través de un `Subject` RxJS como `{ conversationId, data }`. El `conversationId` SHALL extraerse del nombre del canal mediante `channel.split(':')[1]` (seguro con UUIDs, que no contienen `:`).

#### Scenario: Inicialización correcta del servicio
- **WHEN** el módulo `MockModule` arranca
- **THEN** `MockSseService` establece una conexión Redis con la URL de `REDIS_URL` (fallback: `redis://localhost:6379`)
- **THEN** activa la suscripción `psubscribe('conversation:*:update')`

#### Scenario: Mensaje recibido de Redis
- **WHEN** el Worker publica en el canal `conversation:<id>:update`
- **THEN** `MockSseService` extrae el `conversationId` del nombre del canal (`split(':')[1]`) y emite el payload al Subject interno

### Requirement: El servicio SSE gestiona errores de conexión Redis sin interrumpir la aplicación

`MockSseService` SHALL registrar un listener `.on('error')` en el cliente Redis antes de llamar a `psubscribe`. Si la conexión falla o Redis no está disponible, la aplicación SHALL continuar funcionando y SHALL loguear el error con el prefijo `[SSE]`. `ioredis` reintentará la conexión automáticamente.

#### Scenario: Redis no disponible al arrancar
- **WHEN** `MockSseService` se inicializa y Redis no está disponible
- **THEN** la aplicación arranca sin lanzar excepción no controlada
- **THEN** se loguea el error con formato `[SSE] Redis connection error: <mensaje>`
- **THEN** `ioredis` reintenta la conexión en background automáticamente

#### Scenario: Error en psubscribe
- **WHEN** el `psubscribe` falla (ej. permisos denegados en Redis)
- **THEN** se loguea el error con formato `[SSE] Redis psubscribe error: <error>`
- **THEN** la API continúa respondiendo al resto de endpoints

### Requirement: El endpoint SSE retransmite mensajes filtrados por conversación

El endpoint `GET /api/mock/conversations/:conversationId/events` SHALL retornar un stream `text/event-stream`. Cada evento SHALL tener el formato `data: <json>` donde `<json>` es el payload JSON publicado por el Worker. Solo los mensajes de la `conversationId` indicada SHALL llegar al cliente.

#### Scenario: Cliente se conecta al endpoint SSE
- **WHEN** un cliente HTTP se conecta a `GET /api/mock/conversations/:conversationId/events`
- **THEN** la respuesta tiene `Content-Type: text/event-stream`
- **THEN** la conexión se mantiene abierta hasta que el cliente la cierre o se reciba `conversation:complete`

#### Scenario: Mensaje del agente recibido mientras el cliente está conectado
- **WHEN** el Worker publica `{ role: 'assistant', content: '...', timestamp: '...' }` en Redis para esa conversación
- **THEN** el cliente SSE recibe `data: {"role":"assistant","content":"...","timestamp":"..."}`

#### Scenario: No llegan mensajes de otras conversaciones
- **WHEN** el Worker publica un mensaje para una `conversationId` diferente
- **THEN** el cliente SSE conectado a otra conversación NO recibe ese evento

### Requirement: Evento especial de fin de conversación

Cuando la conversación alcanza estado terminal (`COMPLETED`, `ESCALATED` o `TIMEOUT`), el Worker SHALL publicar un evento especial en el mismo canal Redis. El cliente SSE SHALL recibir este evento y podrá usarlo para cerrar el `EventSource`.

#### Scenario: Conversación completada
- **WHEN** el Worker actualiza el estado de la conversación a `COMPLETED`
- **THEN** publica `{ event: 'conversation:complete', status: 'COMPLETED' }` en `conversation:<id>:update`
- **THEN** el cliente SSE recibe `data: {"event":"conversation:complete","status":"COMPLETED"}`

#### Scenario: Conversación escalada
- **WHEN** el Worker actualiza el estado de la conversación a `ESCALATED`
- **THEN** publica `{ event: 'conversation:complete', status: 'ESCALATED' }` en `conversation:<id>:update`
- **THEN** el cliente SSE recibe el evento con `status: 'ESCALATED'`

#### Scenario: Conversación por timeout
- **WHEN** el Worker actualiza el estado de la conversación a `TIMEOUT`
- **THEN** publica `{ event: 'conversation:complete', status: 'TIMEOUT' }` en `conversation:<id>:update`
- **THEN** el cliente SSE recibe el evento con `status: 'TIMEOUT'`

### Requirement: Liberación de recursos al destruir el módulo

`MockSseService` SHALL desconectar el cliente Redis cuando el módulo NestJS se destruya, implementando `OnModuleDestroy`.

#### Scenario: Módulo destruido
- **WHEN** la aplicación NestJS se cierra o el módulo se destruye
- **THEN** `MockSseService` llama a `subscriber.disconnect()`
