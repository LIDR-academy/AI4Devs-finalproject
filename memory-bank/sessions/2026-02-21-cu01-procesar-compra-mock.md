# Sesión 2026-02-21: CU-01 Procesar Compra Mock — Completado

> **Change**: `cu01-procesar-compra-mock`  
> **Estado**: ✅ Completado (23/23 tareas)

## Resumen

Implementación completa del Caso de Uso 1 (CU-01): Procesar Compra desde eCommerce (Mock). Continúa y cierra la sesión del [2026-02-18](./2026-02-18-cu01-progreso.md). Se completaron las tareas pendientes de DynamoDB, OpenAI en Worker, ResponseProcessor como máquina de estados, tests unitarios e integración, y documentación.

## Completado

### Infraestructura
- Monorepo configurado: `package.json` raíz, `pnpm-workspace.yaml`, `turbo.json`
- Migraciones Prisma para Supabase: modelos `Ecommerce`, `Store`, `User`, `Phone`, `Order`, `OrderAddress`, `GiftRecipient`, `Conversation` (3 migraciones versionadas)
- DynamoDB: tabla `adresles-messages` (PK: `conversation_id`, SK: `timestamp`, TTL 90 días)
- Redis + BullMQ: colas `process-conversation` y `process-response`
- Seeds ejecutables con ecommerce y store mock

### Backend API (`apps/api`)
- App NestJS con estructura modular: módulos `Mock`, `Orders`, `Users`, `Conversations`, `Stores`, `EcommerceSync`, `Queue`, `Prisma`
- `CreateMockOrderDto` con validación completa via `class-validator` + `ValidationPipe` global
- `MockOrdersController`: `POST /api/mock/orders`
- `UsersService.findOrCreateByPhone`: búsqueda/creación por número E.164; actualiza datos si usuario ya existe
- `OrdersService.createFromMock`: crea `Order` con cálculo de fee (fórmula 2.5%–5% según importe); crea `OrderAddress` en modo tradicional
- `ConversationsService.createAndEnqueue`: crea `Conversation` y encola job BullMQ
- `EcommerceSyncService.simulateSync`: log estructurado de sync mock
- `MockOrdersService`: orquestación por modo:
  - `adresles` → Order `PENDING_ADDRESS` + Conversation `GET_ADDRESS`
  - `tradicional` → Order `READY_TO_PROCESS` + `OrderAddress` + Conversation `INFORMATION` + simulateSync + Order `COMPLETED`

### Worker BullMQ (`apps/worker`)
- `ConversationProcessor`: consume cola `process-conversation`
- Journey `GET_ADDRESS`: llama a OpenAI para prompt inicial, guarda mensaje en DynamoDB
- Journey `INFORMATION`: mensaje confirmatorio de dirección para modo tradicional
- `ResponseProcessor`: máquina de estados para cola `process-response`:
  - Validación de dirección con Google Maps
  - Detección de edificios (solicita datos adicionales: escalera, piso, puerta)
  - Confirmación explícita del usuario
  - Sync mock + actualización de `Order` a `COMPLETED`

### Tests (37 tests, 100% pasan)
- `src/shared/fee.utils.spec.ts` — fórmula de fee (bordes y casos intermedios)
- `src/orders/orders.service.spec.ts` — `createFromMock`, `updateStatus`, `createAddressFromConversation`
- `src/users/users.service.spec.ts` — `findOrCreateByPhone` (crear/actualizar/preservar email, prefijos internacionales)
- `src/mock/mock-orders.service.spec.ts` — orquestación adresles y tradicional; `BadRequestException` sin dirección
- `src/mock/mock-orders.controller.spec.ts` — integración HTTP con `supertest`; 400 para campos inválidos, URL inválida, email inválido

### Documentación actualizada
- `openspec/specs/development_guide.md` — Variables `.env` reales (`DATABASE_URL`, `REDIS_URL`, `DYNAMODB_ENDPOINT`), `.env` del Worker, instrucción de seed, sección de pruebas con inventario de `.spec.ts`
- `openspec/specs/backend-standards.mdc` — Patrón `.spec.ts`, `pnpm` en lugar de `npm`, `supertest` y `@nestjs/testing` como deps de prueba
- `openspec/changes/cu01-procesar-compra-mock/spec.md` y `proposal.md` — Corregidos nombres de status: `ADDRESS_CONFIRMED` → `READY_TO_PROCESS`, `SYNCED` → `COMPLETED`

## Decisiones tomadas

| ID | Decisión | Alternativa rechazada | Justificación |
|----|----------|-----------------------|---------------|
| D1 | Store identificado por URL en JSON mock; buscar/crear por URL | `store_id` en JSON | Evita seeds previos obligatorios |
| D2 | BullMQ (Redis) para procesamiento asíncrono de conversaciones | Llamada síncrona desde API | No bloquear el hilo de la API; Worker escala independientemente → **ADR-005** |
| D3 | DynamoDB para mensajes de conversación | PostgreSQL/Supabase | Alta volumetría + TTL automático → ver **ADR-002** |
| D4 | Fórmula de fee lineal 2.5%–5% según importe | Fee fijo | Pricing variable proporcional al ticket del pedido |

## Archivos clave creados/modificados

```
apps/api/src/mock/                          — Módulo completo (controller, service, DTOs)
apps/api/src/orders/orders.service.ts       + orders.service.spec.ts
apps/api/src/users/users.service.ts         + users.service.spec.ts
apps/api/src/conversations/conversations.service.ts
apps/api/src/stores/stores.service.ts
apps/api/src/shared/fee.utils.ts            + fee.utils.spec.ts
apps/api/src/ecommerce-sync/ecommerce-sync.service.ts
apps/worker/src/processors/conversation.processor.ts
apps/worker/src/services/address.service.ts
apps/worker/src/dynamodb/dynamodb.service.ts
apps/api/prisma/migrations/                 — 3 migraciones (init + revision_incial + baseline)
apps/api/prisma/seed.ts
openspec/specs/development_guide.md
openspec/specs/backend-standards.mdc
```

## Notas para próxima sesión

- **Alertas de fallos**: Evaluar notificaciones (Slack/email) cuando los 3 reintentos del Worker fallen; considerar dead-letter queue en BullMQ
- **Multi-tenant**: `StoresService.findOrCreateStore` usa `findFirst()` para obtener el ecommerce — comportamiento no determinista en entorno multi-tenant; revisar antes de producción
- **Logger**: `EcommerceSyncService.simulateSync` usa `console.log`; migrar a `NestJS Logger` antes de producción
- **CU-02 pendiente**: Webhook real de eCommerce (WooCommerce) — change a iniciar

## Comandos útiles

```bash
# API (desde raíz del monorepo)
pnpm --filter api dev

# Worker
pnpm --filter worker dev

# Tests (desde apps/api)
cd apps/api && pnpm test
cd apps/api && pnpm test:cov

# Migraciones
cd apps/api && npx prisma migrate dev --name nombre_descriptivo

# Seed
cd apps/api && npx prisma db seed
```
