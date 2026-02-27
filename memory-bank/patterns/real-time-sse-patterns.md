# Patrones Real-Time — SSE, Redis Pub/Sub y Testing

> **Última actualización**: 2026-02-27  
> **Origen**: Implementación CU03-A2 SSE Infrastructure  
> **ADR relacionado**: [ADR-006 — SSE + Redis Pub/Sub](../architecture/006-sse-redis-pubsub.md)

---

## Patrón 1: Módulo Dedicado para Redis Publisher (Evitar Circular Imports)

### Problema

Cuando un proceso Worker necesita un cliente Redis para pub/sub Y ya usa `ioredis` para BullMQ (via `main.ts`), importar el cliente desde `main.ts` en un processor crea una **dependencia circular**:

```
main.ts → imports Worker (BullMQ)
Worker → imports main.ts (para el Redis client)   ← CIRCULAR
```

Node.js resuelve los módulos en tiempo de ejecución y los circulares producen valores `undefined` en el momento del import. El error puede ser silencioso o manifestarse como `TypeError: redisClient is not defined`.

### Solución: Módulo independiente `redis-publisher.ts`

Extraer el cliente Redis y los helpers de pub/sub a un módulo que **no importa nada del proyecto**:

```typescript
// apps/worker/src/redis-publisher.ts
import Redis from 'ioredis';

export const redisPublisher = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

redisPublisher.on('error', (err) =>
  console.error('[RedisPublisher] Connection error:', err.message),
);

export async function publishConversationUpdate(
  conversationId: string,
  role: string,
  content: string,
): Promise<void> {
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ role, content, timestamp: new Date().toISOString() }),
  );
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

**Uso en el processor**:
```typescript
// apps/worker/src/processors/conversation.processor.ts
import { publishConversationUpdate, publishConversationComplete } from '../redis-publisher';

// Después de cada saveMessage('assistant', ...):
await saveMessage(conversationId, 'assistant', assistantMessage);
await publishConversationUpdate(conversationId, 'assistant', assistantMessage);

// En estados terminales:
await publishConversationComplete(conversationId, 'COMPLETED');
```

### Regla de Aplicación

> Siempre que un módulo de infraestructura (Redis, DB client, etc.) sea importado por múltiples archivos del mismo proyecto, extraerlo a un archivo dedicado que solo importa dependencias externas (npm packages).

### Verificación de Ausencia de Circulares

```bash
# Con madge instalado globalmente o via npx:
cd apps/worker
npx madge --circular --extensions ts src/
# Resultado esperado: "No circular dependency found!"
```

---

## Patrón 2: Mock de `ioredis` en Jest (ES Modules)

### Problema

`ioredis` exporta su clase Redis como **default export** de un módulo ES. El siguiente mock **NO funciona**:

```typescript
// ❌ Falla con: TypeError: ioredis_1.default is not a constructor
jest.mock('ioredis', () => class FakeRedis { ... });
```

### Solución: `__esModule: true` + `default` property

```typescript
// ✅ Correcto — simula la estructura de módulo ES compilada por TypeScript
jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    publish: jest.fn().mockResolvedValue(1),
    psubscribe: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  })),
}));
```

### Cuando el mock necesita ser un EventEmitter

Para probar listeners de eventos (`on('pmessage', ...)`) el fake Redis debe extender `EventEmitter`:

```typescript
jest.mock('ioredis', () => {
  const { EventEmitter: EE } = require('events');
  class FakeRedis extends EE {
    psubscribe = jest.fn((_pattern: string, cb?: (err: Error | null) => void) => {
      if (cb) cb(null);
    });
    disconnect = jest.fn();
  }
  return { __esModule: true, default: jest.fn(() => new FakeRedis()) };
});
```

**Acceder a la última instancia creada** (cuando el constructor se llama en el constructor del servicio):

```typescript
function getLastRedisInstance() {
  const Redis = require('ioredis').default as jest.Mock;
  return Redis.mock.results[Redis.mock.results.length - 1].value;
}
```

**Emitir eventos en tests**:

```typescript
it('filtra mensajes por conversationId', async () => {
  const redis = getLastRedisInstance();
  
  // Emitir mensaje de otra conversación (debe ser ignorado)
  redis.emit('pmessage', 'conversation:*:update', 'conversation:other:update', 'payload-wrong');
  
  // Emitir mensaje de la conversación objetivo (debe recibirse)
  redis.emit('pmessage', 'conversation:*:update', 'conversation:target:update', 'payload-ok');
});
```

### Regla de Aplicación

> **Siempre** usar `{ __esModule: true, default: jest.fn(...) }` al mockear módulos que usan `export default class` o son módulos ES compilados. Si el mock debe emitir eventos, extender `EventEmitter` de Node.js.

> **Orden crítico**: `jest.mock(...)` debe declararse **antes** de los imports del módulo bajo test. Jest hoisting lo maneja automáticamente, pero declarar el mock al inicio del archivo evita confusión.

---

## Patrón 3: Aviso Explícito para Variables de Entorno con Fallback

### Problema

Un servicio con fallback silencioso puede enmascarar errores de configuración en entornos donde el fallback no es válido (staging, producción).

### Solución: `console.warn` cuando se usa el fallback

```typescript
constructor() {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  if (!process.env.REDIS_URL) {
    console.warn('[SSE] REDIS_URL not set — using fallback redis://localhost:6379');
  }
  this.subscriber = new Redis(redisUrl);
}
```

**Regla**: cualquier variable de entorno requerida que tenga un fallback para desarrollo local debe loguearse con `warn` cuando se activa el fallback.

**Test del aviso**:
```typescript
it('loguea un aviso cuando REDIS_URL no está definida', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const original = process.env.REDIS_URL;
  delete process.env.REDIS_URL;

  new MockSseService();

  expect(warnSpy).toHaveBeenCalledWith(
    '[SSE] REDIS_URL not set — using fallback redis://localhost:6379',
  );

  process.env.REDIS_URL = original;
  warnSpy.mockRestore();
});
```

---

## Patrón 4: Convención de Canales Redis Pub/Sub

### Convención de nombrado

```
conversation:{conversationId}:{tipo}
```

| Canal | Payload | Cuándo |
|-------|---------|--------|
| `conversation:{id}:update` | `{ role, content, timestamp }` | Mensaje del asistente generado |
| `conversation:{id}:update` | `{ event: 'conversation:complete', status }` | Estado terminal (COMPLETED/ESCALATED/TIMEOUT) |

**Nota**: Se usa el mismo canal para mensajes y eventos terminales para simplificar la suscripción. El frontend distingue por la presencia del campo `event`.

### Extracción del conversationId desde el canal

```typescript
this.subscriber.on('pmessage', (_pattern, channel, message) => {
  // channel = 'conversation:abc-123:update'
  // split(':')[1] es seguro solo si conversationId NO contiene ':'
  // Los UUIDs (formato 8-4-4-4-12) no contienen ':', por lo que es seguro
  const conversationId = channel.split(':')[1];
  this.subject.next({ conversationId, data: message });
});
```

> **Precaución**: Si `conversationId` pudiera contener `:`, usar `channel.split(':').slice(1, -1).join(':')` o un separador diferente en el canal.

---

## Historial

| Fecha | Evento |
|-------|--------|
| 2026-02-27 | Patrones 1–4 identificados en CU03-A2 SSE Infrastructure |
| 2026-02-27 | Patrón de circular imports resuelto con `redis-publisher.ts` dedicado |
| 2026-02-27 | Patrón de mock `ioredis` ES module documentado tras error `ioredis_1.default is not a constructor` |
