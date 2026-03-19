## Context

El sistema Adresles procesa conversaciones de forma asíncrona mediante BullMQ (Worker). Cuando el agente genera un mensaje y lo persiste en DynamoDB, el frontend que mantiene abierta la sesión de `/simulate` no tiene forma de recibirlo sin hacer polling. La solución es un canal push nativo: Redis pub/sub en el Worker + Server-Sent Events (SSE) en la API.

Estado actual: la API tiene un `MockModule` con `MockConversationsController` y `MockConversationsService`. El Worker usa BullMQ con `ioredis` internamente (`main.ts` crea la conexión BullMQ y no se puede reutilizar para pub/sub). No existe ningún mecanismo de notificación en tiempo real.

## Goals / Non-Goals

**Goals:**
- Publicar cada mensaje `assistant` en Redis tras persistirlo en DynamoDB.
- Emitir un evento especial `conversation:complete` cuando la conversación finaliza.
- Exponer `GET /api/mock/conversations/:conversationId/events` como endpoint SSE.
- Mantener el SSE en el módulo `mock` (no en el dominio `conversations`).

**Non-Goals:**
- Implementación del consumidor frontend (queda para CU03-A6).
- Escalabilidad multi-instancia de la API (Redis ya la garantiza por diseño).
- Autenticación del endpoint SSE (fuera de alcance para el módulo mock).
- Soporte de reconexión automática con `Last-Event-ID`.

## Decisions

### 1. Redis pub/sub vs WebSockets

**Decisión**: SSE + Redis pub/sub.

Redis pub/sub es la elección natural dado que ya forma parte del stack (BullMQ lo usa internamente). SSE es suficiente para un canal unidireccional (servidor → cliente) y está soportado de forma nativa en todos los navegadores modernos sin librerías adicionales. WebSockets añaden complejidad de handshake bidireccional sin beneficio en este caso de uso.

**Alternativas descartadas**: Long-polling (latencia alta, carga extra), WebSockets (overkill para canal unidireccional).

### 2. Módulo dedicado `redis-publisher.ts` en el Worker

**Decisión**: Crear `apps/worker/src/redis-publisher.ts` como módulo independiente con el cliente `ioredis` y los helpers de publish. NO exportar desde `main.ts`.

**Por qué no `main.ts`**: `main.ts` importa `conversation.processor.ts`. Si el processor importase `main.ts` a su vez, se crearía un **import circular**. Node.js resuelve los circulares con `undefined` en el momento de la importación, lo que haría que `redisPublisher` fuera `undefined` en runtime y las llamadas a `publish()` fallarían silenciosamente sin error visible.

**Por qué no inyectar como parámetro**: `conversationProcessor` es una función que BullMQ invoca directamente, no una clase NestJS. No hay DI framework disponible en el Worker; un singleton exportado es el patrón correcto.

**Nota sobre ioredis**: Usar `new Redis(redisUrl)` directamente con la URL string. La función `parseRedisUrl()` de `main.ts` existe solo para el objeto `connection` de BullMQ (que requiere `{ host, port }`); `ioredis` acepta la URL directamente.

### 3. RxJS Subject para fan-out en la API

**Decisión**: `MockSseService` usa un `Subject<SsePayload>` de RxJS internamente. El cliente Redis se suscribe con `psubscribe('conversation:*:update')` y emite todos los mensajes al Subject. Cada llamada a `subscribe(conversationId)` filtra por ID.

Esto permite múltiples suscriptores SSE activos (múltiples pestañas / tests) sin crear una conexión Redis por cliente. El `Subject` actúa como bus interno. El `conversationId` se extrae del canal con `channel.split(':')[1]`; esto es seguro porque los IDs de conversación son UUIDs (sin caracteres `:`).

### 4. Gestión de errores de conexión Redis en MockSseService

**Decisión**: Registrar un listener `.on('error')` en el cliente Redis antes del `psubscribe`. Si Redis no está disponible al arrancar, la aplicación NO debe lanzar una excepción no controlada; debe loguear el error y continuar. `ioredis` reintenta la conexión automáticamente, por lo que el servicio se recuperará sin reiniciar la API.

### 5. Ubicación en MockModule

**Decisión**: `MockSseService` se registra únicamente en `MockModule`, no en el `AppModule` global.

El módulo mock es el contexto correcto para este change (CU03). La migración al módulo de producción `conversations` queda fuera de alcance y se planificará en un change posterior.

## Risks / Trade-offs

- **[Risk] Import circular en Worker — RESUELTO** → Usando `redis-publisher.ts` como módulo independiente, `main.ts` no necesita importarlo y el processor puede importarlo sin crear ciclos.

- **[Risk] Pérdida de conexión Redis** → `ioredis` reconecta automáticamente. Si cae durante una conversación, el frontend perderá eventos hasta reconectar el `EventSource`. Mitigación: el frontend gestiona `onerror` del `EventSource` y reconecta (responsabilidad de CU03-A6).

- **[Trade-off] psubscribe vs subscribe** → `psubscribe` con wildcard implica que el servicio recibe mensajes de TODAS las conversaciones. El filtrado se hace en RxJS. Con muchas conversaciones concurrentes esto es eficiente (un solo suscriptor Redis), pero el bus RxJS tendrá mayor tráfico. Aceptable para el alcance del módulo mock.

- **[Risk] Desconexión del cliente SSE** → NestJS gestiona el ciclo de vida del Observable por el pipe HTTP; cuando la conexión se cierra, el framework cancela la suscripción RxJS automáticamente.

- **[Risk] `REDIS_URL` no disponible en la API** → La variable existe en `apps/worker/.env` (BullMQ la usa) pero puede no estar en `apps/api/.env`. Si falta, `MockSseService` usará el fallback `redis://localhost:6379`, que puede no ser correcto en entornos distintos de local. Mitigación: verificar y documentar en `.env.example`.

## Migration Plan

1. Verificar/instalar `ioredis` en `apps/api/package.json`.
2. Verificar que `REDIS_URL` está en `apps/api/.env`; añadir si falta.
3. Crear `apps/worker/src/redis-publisher.ts` con cliente Redis y helpers `publishConversationUpdate()` / `publishConversationComplete()`.
4. Actualizar `conversation.processor.ts`: importar desde `redis-publisher.ts` y añadir llamadas tras cada `saveMessage('assistant', ...)` y en estados terminales.
5. Crear `apps/api/src/mock/mock-sse.service.ts`.
6. Actualizar `MockConversationsController` con el endpoint `@Sse`.
7. Registrar `MockSseService` en `MockModule`.
8. Verificación manual end-to-end + verificación de ausencia de imports circulares.

**Rollback**: Eliminar `redis-publisher.ts`, revertir `conversation.processor.ts`, eliminar `mock-sse.service.ts` y revertir `MockConversationsController` y `MockModule`. No hay migraciones de base de datos.

## Open Questions

_(Resueltas)_
- `REDIS_URL` vs `REDIS_HOST`/`REDIS_PORT` → Usar `REDIS_URL` consistentemente.
- Import circular en Worker → Resuelto con `redis-publisher.ts`.

## Trabajo Futuro

### Estado terminal `TIMEOUT` en Redis pub/sub

`publishConversationComplete()` acepta `'TIMEOUT'` en su firma de tipos, pero el processor actual (`conversation.processor.ts`) no implementa ningún mecanismo de expiración de conversaciones que actualice el estado a `TIMEOUT` en Prisma. Por lo tanto, esta ruta de código nunca se ejecuta en la implementación presente.

**Pendiente para change futuro**: cuando se implemente el mecanismo de expiración de conversaciones (ej. un job periódico de BullMQ que detecte conversaciones sin actividad), ese change deberá:
1. Añadir la lógica que actualiza `Conversation.status = 'TIMEOUT'` en Prisma.
2. Llamar a `publishConversationComplete(conversationId, 'TIMEOUT')` inmediatamente después.
3. Añadir el escenario de test correspondiente.

La infraestructura SSE ya está preparada para emitir este evento sin cambios adicionales.
