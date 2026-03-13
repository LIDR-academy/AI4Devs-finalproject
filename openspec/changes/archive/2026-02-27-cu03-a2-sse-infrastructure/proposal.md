## Why

El frontend de `/simulate` necesita mostrar los mensajes del agente Adresles en tiempo real durante la conversación. Sin un canal push, el frontend tiene que hacer polling continuo, lo que introduce latencia y carga innecesaria. La infraestructura SSE (Redis pub/sub + endpoint `text/event-stream`) resuelve esto de forma nativa en el navegador.

## What Changes

- Se crea `apps/worker/src/redis-publisher.ts`: módulo dedicado con cliente `ioredis` para pub/sub y los helpers `publishConversationUpdate()` y `publishConversationComplete()`. Separado de `main.ts` para evitar imports circulares.
- El Worker llama a los helpers de `redis-publisher.ts` tras cada `saveMessage('assistant', ...)` y al actualizar el estado a terminal (`COMPLETED`, `ESCALATED`, `TIMEOUT`).
- Se crea un nuevo servicio `MockSseService` en la API que se suscribe vía `psubscribe` a todos los canales de conversación, con gestión de errores de conexión Redis.
- Se añade el endpoint `GET /api/mock/conversations/:conversationId/events` (SSE) en `MockConversationsController`.
- `MockSseService` queda registrado como provider en `MockModule`.

## Capabilities

### New Capabilities

- `mock-sse-events`: Canal SSE en tiempo real para retransmitir mensajes de conversación del Worker al frontend vía Redis pub/sub.

### Modified Capabilities

- `mock-conversations`: El controlador existente añade el endpoint SSE `GET :conversationId/events`, inyecta `MockSseService`, y el Worker adopta el módulo `redis-publisher.ts` para publicar eventos sin imports circulares.

## Impact

- **apps/worker**: Nuevo `redis-publisher.ts` (cliente Redis + helpers de publish). Modificación de `conversation.processor.ts` (llamadas a helpers tras cada `saveMessage` de rol assistant y en estados terminales). `main.ts` sin cambios.
- **apps/api**: Nuevo `mock-sse.service.ts`. Modificación de `mock-conversations.controller.ts` y `mock.module.ts`. `REDIS_URL` debe estar disponible en el entorno de la API.
- **Dependencia**: `ioredis` debe estar disponible en `apps/api/package.json` (ya es transitiva de BullMQ; verificar disponibilidad directa).
- **Sin impacto en frontend**: El contrato del endpoint queda documentado para CU03-A6.
- **Rollback**: Eliminar `redis-publisher.ts` y `MockSseService`, revertir el endpoint SSE del controlador y quitar las llamadas `publish` del Worker. Sin migración de base de datos.
