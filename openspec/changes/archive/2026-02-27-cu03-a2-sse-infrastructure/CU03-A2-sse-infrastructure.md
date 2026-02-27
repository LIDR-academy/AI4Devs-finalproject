# CU03-A2 — Infraestructura SSE: Redis pub/sub + endpoint de eventos

**App**: `apps/api` (NestJS — MockModule) + `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU-01 completado ✅

---

## Historia de Usuario

**Como** frontend de la sección `/simulate`,  
**quiero** recibir en tiempo real los mensajes que el agente Adresles genera durante la conversación,  
**para** mostrarlos en el chat sin necesidad de recargar ni hacer polling manual.

---

## Descripción funcional

El Worker procesa la conversación de forma asíncrona (BullMQ). Cuando genera un mensaje y lo guarda en DynamoDB, debe notificar a la API mediante Redis pub/sub. La API expone un endpoint SSE que el frontend mantiene abierto y retransmite cada evento recibido desde Redis como un Server-Sent Event.

### Flujo completo

```
Worker genera mensaje
  → saveMessage(conversationId, role, content)            [DynamoDB]
  → redis.publish(`conversation:${id}:update`, payload)   [Redis]
  → API SseService.emit()                                  [SSE stream]
  → EventSource en el frontend recibe el evento            [UI]
```

### Formato del evento SSE

El payload publicado en Redis (y emitido como SSE) es un objeto JSON:

```json
{
  "role": "assistant",
  "content": "Hola Ana, hemos recibido tu pedido...",
  "timestamp": "2026-02-27T18:35:00.000Z"
}
```

El cliente SSE lo recibe como:
```
data: {"role":"assistant","content":"...","timestamp":"..."}
```

### Evento especial: `conversation:complete`

Cuando la conversación finaliza (estado `COMPLETED`, `ESCALATED` o `TIMEOUT`), el Worker publica un evento adicional de tipo `conversation:complete` para que el frontend pueda deshabilitar el input.

```json
{ "event": "conversation:complete", "status": "COMPLETED" }
```

---

## Arquitectura de la solución

### Worker (`apps/worker`)

El Worker ya tiene acceso a Redis via BullMQ (`connection`). Para pub/sub se necesita una instancia `ioredis` separada (BullMQ bloquea la conexión para su uso interno).

#### `apps/worker/src/main.ts` — crear cliente Redis para pub/sub

```typescript
import Redis from 'ioredis';

const redisPublisher = new Redis(redisUrl);
// Pasar a los procesadores como parámetro o exportar como singleton
export { redisPublisher };
```

#### `apps/worker/src/processors/conversation.processor.ts` — publicar tras saveMessage

Añadir una función helper `publishConversationUpdate()`:

```typescript
import { redisPublisher } from '../main';

async function publishConversationUpdate(
  conversationId: string,
  role: string,
  content: string,
): Promise<void> {
  const payload = JSON.stringify({ role, content, timestamp: new Date().toISOString() });
  await redisPublisher.publish(`conversation:${conversationId}:update`, payload);
}
```

Llamar a `publishConversationUpdate()` **después** de cada `saveMessage(..., 'assistant', msg)` a lo largo de todo el processor (tanto en `conversationProcessor` como en `processResponseProcessor` y todos sus handlers de fase).

Puntos donde se añade la llamada (uno por cada `saveMessage` de rol `assistant`):
- `processGetAddressJourney` — mensaje inicial
- `processInformationJourney` — mensaje informativo
- `handleWaitingAddress` — mensaje de dirección no entendida
- `handleDisambiguation` — mensaje de desambiguación
- `handleBuildingDetails` — mensaje pidiendo detalles del edificio
- `handleConfirmation` — mensaje de confirmación / sync

Al finalizar la conversación (update `status: 'COMPLETED'` en Prisma), publicar también el evento de cierre:

```typescript
await redisPublisher.publish(
  `conversation:${conversationId}:update`,
  JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
);
```

---

### API (`apps/api`)

#### Paquetes requeridos

`ioredis` ya es una dependencia transitiva de BullMQ. Verificar que está disponible en `apps/api/package.json`. Si no, añadir:

```bash
pnpm add ioredis --filter api
```

#### `apps/api/src/mock/mock-sse.service.ts` (nuevo)

```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import Redis from 'ioredis';

interface SsePayload {
  conversationId: string;
  data: string;
}

@Injectable()
export class MockSseService implements OnModuleDestroy {
  private readonly subscriber: Redis;
  private readonly subject = new Subject<SsePayload>();

  constructor() {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.subscriber = new Redis(redisUrl);
    this.subscriber.psubscribe('conversation:*:update', (err) => {
      if (err) console.error('[SSE] Redis psubscribe error:', err);
    });
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      const conversationId = channel.split(':')[1];
      this.subject.next({ conversationId, data: message });
    });
  }

  subscribe(conversationId: string): Observable<MessageEvent> {
    return this.subject.pipe(
      filter((payload) => payload.conversationId === conversationId),
      map((payload) => ({ data: payload.data }) as MessageEvent),
    );
  }

  onModuleDestroy() {
    this.subscriber.disconnect();
  }
}
```

#### `apps/api/src/mock/mock-conversations.controller.ts` — nuevo endpoint SSE

```typescript
import { Controller, Post, Get, Param, Body, Sse, HttpCode, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MockConversationsService } from './mock-conversations.service';
import { MockSseService } from './mock-sse.service';
import { MockConversationReplyDto } from './dto/mock-conversation-reply.dto';

@Controller('mock/conversations')
export class MockConversationsController {
  constructor(
    private readonly service: MockConversationsService,
    private readonly sseService: MockSseService,
  ) {}

  @Post(':conversationId/reply')
  @HttpCode(HttpStatus.ACCEPTED)
  async reply(
    @Param('conversationId') conversationId: string,
    @Body() dto: MockConversationReplyDto,
  ) {
    return this.service.replyToConversation(conversationId, dto.message);
  }

  @Get(':conversationId/history')
  async history(@Param('conversationId') conversationId: string) {
    return this.service.getConversationHistory(conversationId);
  }

  @Sse(':conversationId/events')
  events(@Param('conversationId') conversationId: string): Observable<MessageEvent> {
    return this.sseService.subscribe(conversationId);
  }
}
```

#### `apps/api/src/mock/mock.module.ts` — registrar `MockSseService`

Añadir `MockSseService` al array `providers` del módulo.

---

### Frontend — verificación de tipos

El endpoint SSE se consumirá en CU03-A6. No hay cambios de frontend en este ticket, pero se documenta el contrato para que CU03-A6 pueda construir sobre él:

- **URL**: `GET /api/mock/conversations/:conversationId/events`
- **Tipo de contenido**: `text/event-stream`
- **Eventos**: objetos JSON con campos `role`, `content`, `timestamp` (y opcionalmente `event: 'conversation:complete'`)
- **Cierre**: el cliente debe cerrar el `EventSource` cuando recibe `event: 'conversation:complete'`

---

## Lista de tareas

- [ ] Verificar que `ioredis` está disponible en `apps/api/package.json`; añadirlo si falta
- [ ] Crear cliente Redis `redisPublisher` en `apps/worker/src/main.ts`
- [ ] Implementar función `publishConversationUpdate()` en `apps/worker/src/processors/conversation.processor.ts`
- [ ] Añadir llamada a `publishConversationUpdate()` tras cada `saveMessage(..., 'assistant', ...)` en todos los handlers del processor
- [ ] Publicar evento `conversation:complete` al actualizar `Conversation.status` a `COMPLETED` / `ESCALATED`
- [ ] Crear `apps/api/src/mock/mock-sse.service.ts` con suscripción Redis psubscribe y Subject RxJS
- [ ] Añadir endpoint `@Sse(':conversationId/events')` en `MockConversationsController`
- [ ] Inyectar `MockSseService` en `MockConversationsController`
- [ ] Registrar `MockSseService` en `MockModule` providers
- [ ] Verificar manualmente que al crear una conversación mock el SSE emite el mensaje inicial del agente

---

## [ENHANCED] Historia enriquecida

### Problema crítico: Import circular en el Worker

El ticket original propone exportar `redisPublisher` desde `apps/worker/src/main.ts`. Esto crea un **import circular**: `main.ts` importa `conversation.processor.ts`, y el processor importaría `main.ts`. Node.js resuelve los circulares con `undefined` en runtime, rompiendo el publisher silenciosamente.

**Solución correcta**: crear un archivo dedicado `apps/worker/src/redis-publisher.ts`:

```typescript
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const redisPublisher = new Redis(redisUrl);

export async function publishConversationUpdate(
  conversationId: string,
  role: string,
  content: string,
): Promise<void> {
  const payload = JSON.stringify({ role, content, timestamp: new Date().toISOString() });
  await redisPublisher.publish(`conversation:${conversationId}:update`, payload);
}

export async function publishConversationComplete(
  conversationId: string,
  status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT',
): Promise<void> {
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status }),
  );
}
```

`main.ts` no importa este archivo. `conversation.processor.ts` lo importa directamente. No hay ciclo.

> **Nota sobre ioredis vs parseRedisUrl**: `ioredis` acepta la URL string directamente (`new Redis(url)`). No usar `parseRedisUrl()` — esa función existe solo para el objeto `connection` de BullMQ que requiere `{ host, port }`.

---

### Variables de entorno requeridas

Verificar que `REDIS_URL` está presente en:

| Archivo | Estado esperado |
|---------|----------------|
| `apps/worker/.env` | Ya existente (lo usa BullMQ) |
| `apps/api/.env` | Añadir si no está → `REDIS_URL=redis://localhost:6379` |
| `.env.example` (raíz) | Documentar la variable |

---

### MockSseService: error handling al arrancar

Si Redis no está disponible en el arranque, el `psubscribe` lanza un error pero la app no debe caerse. El handler de error en el constructor es suficiente, pero añadir también el evento `error` de la conexión:

```typescript
constructor() {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  this.subscriber = new Redis(redisUrl);
  this.subscriber.on('error', (err) =>
    console.error('[SSE] Redis connection error:', err.message),
  );
  this.subscriber.psubscribe('conversation:*:update', (err) => {
    if (err) console.error('[SSE] Redis psubscribe error:', err);
  });
  this.subscriber.on('pmessage', (_pattern, channel, message) => {
    // Canal format: "conversation:<uuid>:update" → split(':')[1] es seguro con UUIDs
    const conversationId = channel.split(':')[1];
    this.subject.next({ conversationId, data: message });
  });
}
```

---

### Archivos a modificar / crear

| Archivo | Acción |
|---------|--------|
| `apps/worker/src/redis-publisher.ts` | **Nuevo** — cliente Redis + helpers de publish |
| `apps/worker/src/main.ts` | Sin cambios (no exportar redisPublisher desde aquí) |
| `apps/worker/src/processors/conversation.processor.ts` | Modificar — importar desde `redis-publisher.ts` y llamar tras cada `saveMessage('assistant', ...)` |
| `apps/api/src/mock/mock-sse.service.ts` | **Nuevo** — `MockSseService` con psubscribe + Subject RxJS |
| `apps/api/src/mock/mock-conversations.controller.ts` | Modificar — añadir `@Sse` endpoint e inyectar `MockSseService` |
| `apps/api/src/mock/mock.module.ts` | Modificar — añadir `MockSseService` a `providers` |
| `apps/api/.env` | Verificar / añadir `REDIS_URL` |

---

### Puntos exactos en `conversation.processor.ts` donde añadir publish

Tras cada `saveMessage(conversationId, 'assistant', msg)` añadir:

```typescript
await publishConversationUpdate(conversationId, 'assistant', msg);
```

Handlers afectados:
- `processGetAddressJourney` — mensaje inicial del agente
- `processInformationJourney` — mensaje informativo
- `handleWaitingAddress` — dirección no entendida
- `handleDisambiguation` — mensaje de desambiguación
- `handleBuildingDetails` — solicitud de detalles del edificio
- `handleConfirmation` — mensaje de confirmación / sync

Tras actualizar `status` a estado terminal en Prisma:

```typescript
await publishConversationComplete(conversationId, 'COMPLETED'); // o 'ESCALATED' / 'TIMEOUT'
```

---

### Tests requeridos

Seguir el patrón de `mock-orders.controller.spec.ts` (NestJS Testing + supertest).

#### `apps/api/src/mock/mock-sse.service.spec.ts`

```typescript
describe('MockSseService', () => {
  it('subscribe() retorna Observable filtrado por conversationId', (done) => {
    // Mock del cliente Redis, simular pmessage
    // Verificar que solo llegan mensajes de la conversación correcta
  });

  it('onModuleDestroy() llama a subscriber.disconnect()', () => {
    // Verificar que se llama disconnect al destruir el módulo
  });
});
```

#### `apps/api/src/mock/mock-conversations.controller.spec.ts` — añadir caso SSE

```typescript
it('GET /:conversationId/events retorna Observable de MockSseService', () => {
  // Verificar que el método events() delega a sseService.subscribe(conversationId)
});
```

---

### Criterios de aceptación

- [ ] El endpoint `GET /api/mock/conversations/:conversationId/events` responde con `Content-Type: text/event-stream`
- [ ] Al crear una conversación mock (`POST /mock/orders`), el SSE emite el mensaje inicial del agente dentro de los 5 segundos siguientes
- [ ] El mensaje SSE tiene el formato `data: {"role":"assistant","content":"...","timestamp":"..."}`
- [ ] Al finalizar la conversación, el SSE emite `data: {"event":"conversation:complete","status":"COMPLETED"}`
- [ ] Si Redis no está disponible, la API arranca sin excepción y loguea el error de conexión
- [ ] No hay import circular en el Worker (verificar con `madge --circular apps/worker/src`)
- [ ] Tests unitarios pasan: `pnpm test --filter api`
