# ADR-006: SSE + Redis Pub/Sub como Canal Real-Time Worker → API → Frontend

**Estado**: ✅ Aceptada  
**Fecha**: 2026-02-27  
**Decidido en**: Implementación CU03-A2 SSE Infrastructure  
**Implementado en**: [`cu03-a2-sse-infrastructure`](../../openspec/changes/cu03-a2-sse-infrastructure/) (verificado)  
**Reemplaza a**: —

---

## Contexto

El Worker procesa conversaciones IA de forma asíncrona (via BullMQ — ver ADR-005). Cada vez que el Worker genera un mensaje del asistente, el frontend de `/simulate` necesita verlo en tiempo real sin esperar a que finalice la conversación completa.

**El problema**: el Worker no tiene acceso al API ni a las conexiones HTTP de los clientes. El API no sabe cuándo el Worker termina de procesar un turno.

**Restricciones**:
- El Worker es un proceso Node.js independiente (`apps/worker`) — sin conexión directa al API
- La comunicación debe ser unidireccional: Worker → API → Frontend (el frontend no necesita enviar datos por este canal)
- Redis ya es parte del stack (BullMQ lo requiere) — se puede reutilizar
- El módulo mock es el contexto inicial; la infraestructura debe ser extensible al módulo de producción

---

## Decisión

**SSE (Server-Sent Events) en la API + Redis Pub/Sub como bus de mensajes interno**:

> "El Worker publica eventos en Redis (Pub/Sub). La API suscribe a Redis y reenvía los mensajes al cliente via SSE. El frontend consume un `EventSource` HTTP."

**Flujo completo**:
```
Worker (genera mensaje IA)
  → redisPublisher.publish('conversation:{id}:update', payload)
    → MockSseService (suscrito via psubscribe)
      → Subject RxJS (filtrado por conversationId)
        → SSE endpoint (@Sse decorator NestJS)
          → Frontend EventSource
```

**Canales Redis**:
- `conversation:{conversationId}:update` — mensajes de turno (role, content, timestamp)
- El mismo canal para eventos terminales: `{ event: 'conversation:complete', status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT' }`

---

## Justificación

### Análisis de Alternativas

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| **SSE + Redis Pub/Sub** (elegida) | • Unidireccional (correcto para este caso)<br>• Redis ya disponible (reutilización)<br>• NestJS soporta SSE nativo (`@Sse`)<br>• RxJS integrado — filtrado natural por conversationId<br>• Sin estado en memoria (Redis gestiona el bus) | • Requiere suscriptor Redis adicional en el API<br>• Reconexión manual si cae Redis | ✅ Seleccionada |
| **Polling desde frontend** | • Implementación simple<br>• Sin infraestructura adicional | • Latencia inherente (1–3 s entre polls)<br>• Carga innecesaria en la API<br>• No escala con muchas conversaciones concurrentes | ❌ Descartada |
| **WebSockets** | • Bidireccional<br>• Baja latencia | • Bidireccional no necesario aquí<br>• Más complejo (handshake, estado conexión)<br>• NestJS Gateway añade complejidad para MVP | ❌ Descartada |
| **Long-polling** | • Compatible con cualquier cliente HTTP | • Peor que SSE para streaming continuo<br>• Gestión compleja de timeouts y reconexión | ❌ Descartada |
| **Webhook del Worker al API** | • Desacoplado | • El Worker necesitaría conocer la URL del API<br>• El API necesitaría mantener el estado de conexiones HTTP — peor que Pub/Sub | ❌ Descartada |

### Razones Principales

1. **Unidireccionalidad natural**: Los mensajes del asistente van siempre en una dirección (Worker → Frontend). SSE es exactamente el protocolo diseñado para este caso. WebSockets añadiría complejidad innecesaria.

2. **Redis como bus ya disponible**: BullMQ ya requiere Redis en el stack. Usar Redis Pub/Sub para el bus de eventos evita añadir nueva infraestructura (ej. un servicio de WebSockets dedicado, AWS SNS, etc.).

3. **RxJS + NestJS `@Sse` = integración nativa**: NestJS soporta SSE via `Observable<MessageEvent>`. RxJS `Subject` con `filter()` permite que un único suscriptor Redis (`psubscribe`) sirva a N conversaciones concurrentes sin un suscriptor por conversación.

4. **`psubscribe` vs N × `subscribe`**: Un único `psubscribe('conversation:*:update')` en `MockSseService` gestiona todas las conversaciones activas. El filtrado por `conversationId` ocurre en RxJS, no en Redis. Más eficiente para el MVP.

### Criterios de Evaluación

- ✅ **Latencia**: El mensaje llega al frontend en < 100ms desde que el Worker lo publica
- ✅ **Reutilización de infraestructura**: Redis ya estaba; sin servicio nuevo
- ✅ **Encapsulamiento**: `MockSseService` gestiona todo el ciclo (conexión, suscripción, limpieza via `OnModuleDestroy`)
- ⚠️ **Reconexión**: Si Redis cae, el `EventSource` del frontend pierde mensajes hasta reconectar. Mitigación: frontend gestiona `onerror` (responsabilidad CU03-A6)
- ⚠️ **Escalado horizontal**: Con múltiples réplicas del API, cada réplica tiene su propio suscriptor Redis. Funcional pero no óptimo en producción. Aceptable para MVP.

---

## Consecuencias

### ✅ Positivas

- **Sin polling**: Frontend recibe mensajes en tiempo real sin peticiones periódicas
- **Un suscriptor Redis para N conversaciones**: `psubscribe` + filtro RxJS es eficiente
- **Limpieza automática**: `OnModuleDestroy` desconecta el cliente Redis al parar el API
- **Extensible**: El mismo patrón se puede replicar en el módulo de producción `conversations` en un change futuro
- **Sin estado adicional**: Redis gestiona el bus; el API no mantiene estado de mensajes

### ❌ Negativas (Trade-offs)

- **Mensajes previos a la conexión SSE se pierden**: Pub/Sub es fire-and-forget. Si el cliente conecta después de que el Worker publica, no recupera los mensajes anteriores. Mitigación: el frontend debe conectar el `EventSource` antes de enviar el primer mensaje, y puede cargar el historial via `GET .../history` al montar el componente.

- **Reconexión de Redis no automática en SSE**: Si Redis cae y reconecta, `psubscribe` debe re-suscribirse. `ioredis` reconecta automáticamente la conexión TCP, pero la re-suscripción al patrón requiere manejo explícito (pendiente para hardening de producción).

- **Escalado horizontal del API**: Cada réplica del API suscribe independientemente a Redis. Con N réplicas, hay N suscriptores. No problemático en MVP (tráfico bajo, 1 réplica).

### 🔧 Deuda Técnica Introducida

- **Re-suscripción automática en reconexión Redis**: Pendiente para hardening de producción. `ioredis` tiene `autoResubscribe: true` por defecto, pero conviene verificar el comportamiento.
- **Estado TIMEOUT no implementado**: `publishConversationComplete()` acepta `'TIMEOUT'` pero el procesador no tiene mecanismo de expiración. Se implementará en un change futuro cuando se añada el job de expiración de conversaciones.
- **Propagación al módulo de producción**: `MockSseService` vive en el módulo mock. Migrar al módulo `conversations` (producción) está fuera de alcance de CU03-A2.

---

## Implementación

### Estructura

```
apps/worker/src/
└── redis-publisher.ts           — Cliente Redis dedicado + helpers publish*()

apps/api/src/mock/
├── mock-sse.service.ts          — Suscriptor Redis, Subject RxJS, OnModuleDestroy
├── mock-conversations.controller.ts  — @Sse(':conversationId/events')
└── mock.module.ts               — MockSseService registrado como provider
```

### Módulo Worker: `redis-publisher.ts`

```typescript
import Redis from 'ioredis';

export const redisPublisher = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

export async function publishConversationUpdate(
  conversationId: string, role: string, content: string,
): Promise<void> {
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ role, content, timestamp: new Date().toISOString() }),
  );
}

export async function publishConversationComplete(
  conversationId: string, status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT',
): Promise<void> {
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status }),
  );
}
```

### Servicio API: `mock-sse.service.ts`

```typescript
@Injectable()
export class MockSseService implements OnModuleDestroy {
  private readonly subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  private readonly subject = new Subject<{ conversationId: string; data: string }>();

  constructor() {
    this.subscriber.psubscribe('conversation:*:update');
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      const conversationId = channel.split(':')[1];
      this.subject.next({ conversationId, data: message });
    });
  }

  subscribe(conversationId: string): Observable<MessageEvent> {
    return this.subject.pipe(
      filter((p) => p.conversationId === conversationId),
      map((p) => ({ data: p.data }) as MessageEvent),
    );
  }

  onModuleDestroy() { this.subscriber.disconnect(); }
}
```

### Endpoint SSE en Controller

```typescript
@Sse(':conversationId/events')
events(@Param('conversationId') conversationId: string): Observable<MessageEvent> {
  return this.sseService.subscribe(conversationId);
}
```

---

## Métricas de Éxito

- 📊 **Latencia SSE**: Mensaje visible en frontend < 200ms desde que Worker publica
- 📊 **Conexiones concurrentes**: 1 suscriptor Redis sirve N conversaciones simultáneas
- 📊 **Tests**: 11 tests unitarios cubren publisher, servicio SSE y controller (100% pass)
- 📊 **Sin memory leaks**: `OnModuleDestroy` verificado — `disconnect()` llamado al parar el API

---

## Referencias

- **Change implementado**: [`cu03-a2-sse-infrastructure`](../../openspec/changes/cu03-a2-sse-infrastructure/)
- **ADRs relacionados**:
  - [ADR-005](./005-bullmq-worker-conversations.md) — Arquitectura async Worker (contexto que requiere este canal)
  - [ADR-003](./003-nestjs-backend.md) — NestJS Backend (soporte nativo `@Sse` y RxJS)
- **Documentación externa**:
  - [NestJS SSE Docs](https://docs.nestjs.com/techniques/server-sent-events)
  - [ioredis Pub/Sub](https://github.com/redis/ioredis#pubsub)

---

## Notas de Revisión

### 2026-02-27: Implementado en CU03-A2

- Validado end-to-end: `curl --no-buffer` recibe `data:` al publicar via `POST .../reply`
- Circular import resuelto con `redis-publisher.ts` dedicado (ver patrón en `patterns/real-time-sse-patterns.md`)
- Estado `TIMEOUT` pendiente: infraestructura lista, falta mecanismo de expiración de conversaciones

---

**Creado por**: Sergio  
**Última actualización**: 2026-02-27  
**Próxima revisión**: Al implementar módulo de producción (migrar de mock a `conversations`)
