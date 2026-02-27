# Sesión 2026-02-27: CU03-A2 — Infraestructura SSE Real-Time — Completado

> **Change**: `cu03-a2-sse-infrastructure`  
> **Estado**: ✅ Completado y verificado (35/35 tareas) — pendiente de `/opsx-archive`

## Resumen

Implementación de la infraestructura SSE (Server-Sent Events) que permite al frontend `/simulate` recibir en tiempo real los mensajes que el Worker genera durante la conversación IA. El Worker publica en Redis Pub/Sub; el API suscribe y reenvía al cliente via SSE.

---

## Completado

### Worker — `apps/worker/src/`

- **`redis-publisher.ts`** (nuevo): cliente `ioredis` dedicado + helpers `publishConversationUpdate()` y `publishConversationComplete()`. Resuelve el problema de imports circulares al no importar nada del proyecto.
- **`processors/conversation.processor.ts`** (modificado):
  - Import de `publishConversationUpdate` y `publishConversationComplete` desde `redis-publisher.ts`
  - `publishConversationUpdate()` llamado después de cada `saveMessage('assistant', ...)`
  - `publishConversationComplete('COMPLETED')` al finalizar el journey satisfactoriamente
  - `publishConversationComplete('ESCALATED')` al escalar la conversación
- **`jest.config.js`** + script `test` en `package.json` (nuevos): Jest no estaba configurado en el worker; se añadió `ts-jest` y configuración equivalente a la del API.
- **`redis-publisher.spec.ts`** (nuevo): 5 tests unitarios para `publishConversationUpdate` y `publishConversationComplete`

### API — `apps/api/src/mock/`

- **`mock-sse.service.ts`** (nuevo):
  - `@Injectable()` + `OnModuleDestroy` (limpieza automática)
  - `psubscribe('conversation:*:update')` — un suscriptor para todas las conversaciones
  - RxJS `Subject` + `filter()` por `conversationId`
  - Error handling: `.on('error', ...)` + `console.warn` cuando `REDIS_URL` no está definida
- **`mock-conversations.controller.ts`** (modificado):
  - Inyección de `MockSseService`
  - Nuevo endpoint `@Sse(':conversationId/events')` devuelve `Observable<MessageEvent>`
- **`mock.module.ts`** (modificado): `MockSseService` añadido a `providers`
- **`mock-sse.service.spec.ts`** (nuevo): 6 tests (suscripción, filtrado, no-emit de otra conversación, `onModuleDestroy`, aviso de `REDIS_URL`, no-aviso cuando está definida)
- **`mock-conversations.controller.spec.ts`** (nuevo): 4 tests (delegación SSE, no-modificación del Observable, `reply()`, `history()`)
- **`apps/api/.env`** y `.env.example`: `REDIS_URL` añadida

---

## Tests

- **Worker**: 5/5 tests nuevos pasan (`redis-publisher.spec.ts`)
- **API**: 6/6 tests nuevos pasan (`mock-sse.service.spec.ts`) + 4/4 (`mock-conversations.controller.spec.ts`) = 10/10
- **Total nuevos**: 15 tests, todos pasan al 100%
- Sin regresión en tests preexistentes

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **`redis-publisher.ts` dedicado en Worker** | Evita imports circulares: `main.ts` ↔ `conversation.processor.ts` si se compartiera el cliente Redis desde `main.ts`. Ver [ADR-006](../architecture/006-sse-redis-pubsub.md) y patrón en `patterns/real-time-sse-patterns.md` |
| **`psubscribe` en lugar de N × `subscribe`** | Un único suscriptor Redis sirve todas las conversaciones activas; el filtrado ocurre en RxJS |
| **Mismo canal para mensajes y eventos terminales** | Simplifica la suscripción del cliente; distingue por campo `event` en el payload |
| **`OnModuleDestroy` para cleanup** | NestJS llama al hook al parar la aplicación; garantiza que el cliente Redis se desconecta limpiamente |
| **Estado `TIMEOUT` en firma pero sin implementar** | Infraestructura preparada; el mecanismo de expiración de conversaciones se implementará en un change futuro. Documentado en `design.md` sección "Trabajo Futuro" |

---

## Errores Encontrados y Resueltos

| Error | Causa | Solución |
|-------|-------|----------|
| `TypeError: ioredis_1.default is not a constructor` | `jest.mock` no respetaba el default export de ES module | Mock con `{ __esModule: true, default: jest.fn(() => new FakeRedis()) }` |
| `[SSE] Redis connection error: ECONNREFUSED` al arrancar API | API iniciada antes de que Docker levantara Redis | Verificar contenedores antes de arrancar servicios |
| SSE conectado pero sin `data:` al crear pedido | Pub/Sub fire-and-forget: Worker publicó antes de que el cliente conectara | Conectar SSE primero; usar `POST .../reply` para generar mensajes posteriores |
| PowerShell `>` copiado como parte del comando | Prompt de PowerShell incluido en el copy-paste | Copiar solo el texto del comando, sin el `>` inicial |

---

## Archivos Creados/Modificados

```
apps/worker/src/
├── redis-publisher.ts            # Nuevo — cliente Redis + helpers publish*()
├── redis-publisher.spec.ts       # Nuevo — 5 tests unitarios
├── jest.config.js                # Nuevo — configuración Jest para el worker
├── package.json                  # Modificado — +jest, +ts-jest, +@types/jest, +script test
└── processors/
    └── conversation.processor.ts # Modificado — publish* calls

apps/api/src/mock/
├── mock-sse.service.ts           # Nuevo — SSE service con Redis Pub/Sub + RxJS
├── mock-sse.service.spec.ts      # Nuevo — 6 tests
├── mock-conversations.controller.ts   # Modificado — @Sse endpoint + inject SSE service
├── mock-conversations.controller.spec.ts  # Nuevo — 4 tests
└── mock.module.ts                # Modificado — MockSseService en providers

apps/api/
├── .env                          # Modificado — REDIS_URL añadida
└── .env.example                  # Modificado — REDIS_URL documentada

openspec/changes/cu03-a2-sse-infrastructure/
├── design.md                     # Actualizado — sección "Trabajo Futuro" para TIMEOUT
└── (todos los artefactos: 35/35 tareas completadas)
```

---

## Post-verificación (post-sesión)

Tras `/opsx-verify`, se resolvieron 1 warning y 2 suggestions:

1. **WARNING TIMEOUT** → Documentado en `design.md` sección "Trabajo Futuro"
2. **SUGGESTION `console.warn` REDIS_URL** → Añadido en `MockSseService` constructor + test
3. **SUGGESTION tests `redis-publisher`** → Creado `redis-publisher.spec.ts` + Jest configurado en worker

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [CU03-A2 SSE Infrastructure](9984dec2-80ab-4261-bd8e-ea5420f2c83c)
