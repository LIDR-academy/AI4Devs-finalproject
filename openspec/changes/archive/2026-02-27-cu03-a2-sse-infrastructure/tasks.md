## 1. Preparación de dependencias y entorno

- [x] 1.1 Verificar que `ioredis` está listado como dependencia directa en `apps/api/package.json`; añadirlo con `pnpm add ioredis --filter api` si solo está como transitiva
- [x] 1.2 Confirmar que `ioredis` ya está disponible en `apps/worker/package.json` (instalado por BullMQ)
- [x] 1.3 Verificar que `REDIS_URL` está definida en `apps/api/.env`; añadir `REDIS_URL=redis://localhost:6379` si falta
- [x] 1.4 Documentar `REDIS_URL` en `.env.example` de raíz si no está ya presente

## 2. Worker — módulo redis-publisher

- [x] 2.1 Crear `apps/worker/src/redis-publisher.ts` con un cliente `ioredis` singleton (`new Redis(REDIS_URL)`) y la función `publishConversationUpdate(conversationId, role, content)`
- [x] 2.2 Añadir en `redis-publisher.ts` la función `publishConversationComplete(conversationId, status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT')`
- [x] 2.3 Verificar que `main.ts` NO importa `redis-publisher.ts` (el processor lo importa directamente, sin pasar por `main.ts`)

## 3. Worker — publicación de mensajes del agente

- [x] 3.1 Importar `publishConversationUpdate` desde `../redis-publisher` en `conversation.processor.ts`
- [x] 3.2 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `processGetAddressJourney`
- [x] 3.3 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `processInformationJourney`
- [x] 3.4 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `handleWaitingAddress`
- [x] 3.5 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `handleDisambiguation`
- [x] 3.6 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `handleBuildingDetails`
- [x] 3.7 Añadir llamada a `publishConversationUpdate()` tras `saveMessage('assistant', ...)` en `handleConfirmation`

## 4. Worker — eventos de fin de conversación

- [x] 4.1 Importar `publishConversationComplete` desde `../redis-publisher` en `conversation.processor.ts`
- [x] 4.2 Llamar a `publishConversationComplete(conversationId, 'COMPLETED')` al actualizar el estado a `COMPLETED`
- [x] 4.3 Llamar a `publishConversationComplete(conversationId, 'ESCALATED')` al actualizar el estado a `ESCALATED`
- [x] 4.4 Llamar a `publishConversationComplete(conversationId, 'TIMEOUT')` al actualizar el estado a `TIMEOUT` (si aplica en el processor actual)

## 5. API — MockSseService

- [x] 5.1 Crear el archivo `apps/api/src/mock/mock-sse.service.ts` con la clase `MockSseService` que implementa `OnModuleDestroy`
- [x] 5.2 En el constructor de `MockSseService`, registrar `.on('error')` en el cliente Redis antes de `psubscribe` para loguear errores con prefijo `[SSE]` sin crashear la app
- [x] 5.3 Activar `psubscribe('conversation:*:update')` con handler de error en el callback
- [x] 5.4 Implementar el manejador `pmessage` que extrae el `conversationId` con `channel.split(':')[1]` y emite al `Subject` interno
- [x] 5.5 Implementar el método `subscribe(conversationId)` que retorna un `Observable<MessageEvent>` filtrado por `conversationId` y mapeado a `{ data: payload.data }`
- [x] 5.6 Implementar `onModuleDestroy()` que llama a `subscriber.disconnect()`

## 6. API — Endpoint SSE en el controlador

- [x] 6.1 Inyectar `MockSseService` en el constructor de `MockConversationsController`
- [x] 6.2 Añadir el método `events(@Param('conversationId') conversationId: string)` anotado con `@Sse(':conversationId/events')` que delega a `sseService.subscribe(conversationId)`

## 7. API — Registro en MockModule

- [x] 7.1 Añadir `MockSseService` al array `providers` en `apps/api/src/mock/mock.module.ts`

## 8. Tests

- [x] 8.1 Crear `apps/api/src/mock/mock-sse.service.spec.ts`: test de que `subscribe()` solo emite mensajes de la `conversationId` correcta (mock del cliente Redis, simular evento `pmessage`)
- [x] 8.2 Crear `apps/api/src/mock/mock-sse.service.spec.ts`: test de que `onModuleDestroy()` llama a `subscriber.disconnect()`
- [x] 8.3 Añadir caso en `mock-conversations.controller.spec.ts` (o crear nuevo spec): `GET /:conversationId/events` delega correctamente a `sseService.subscribe(conversationId)`
- [x] 8.4 Ejecutar `pnpm test --filter api` y verificar que todos los tests pasan

## 9. Verificación de calidad

- [x] 9.1 Verificar ausencia de imports circulares en el Worker: `npx madge --circular apps/worker/src` no debe reportar ciclos
- [x] 9.2 Levantar el stack con `docker-compose up` y comprobar que la API arranca sin errores de inyección ni de conexión Redis
- [x] 9.3 Crear una conversación mock y conectar un cliente SSE (`curl -N http://localhost:3000/api/mock/conversations/<id>/events`) y verificar que se reciben los mensajes del agente
- [x] 9.4 Verificar que al finalizar la conversación llega el evento `data: {"event":"conversation:complete","status":"COMPLETED"}` al cliente SSE
