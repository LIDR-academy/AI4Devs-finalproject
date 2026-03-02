# CU03-B1 — Worker: sincronización real en DB tras confirmar dirección

**App**: `apps/worker` (BullMQ Worker) + `apps/api` (schema + OrdersService)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-A6 completado (chat SSE funcional end-to-end) ✅  
**ADRs afectados**: [ADR-005 (BullMQ Worker)](../../../memory-bank/architecture/005-bullmq-worker-conversations.md), [ADR-006 (SSE + Redis Pub/Sub)](../../../memory-bank/architecture/006-sse-redis-pubsub.md)

---

## Historia de Usuario

**Como** sistema Adresles,  
**quiero** actualizar el estado del pedido a `READY_TO_PROCESS` con `syncedAt` y el campo `statusSource = 'ADRESLES'` tras confirmar la dirección del usuario,  
**para** que el pedido refleje correctamente su estado final en el MVP (dirección confirmada, lista para que la tienda procese el envío) y podamos trazabilidad del origen de cada cambio de estado.

---

## Contexto y Problema

### Semántica de estados del pedido (MVP)

El enum `OrderStatus` en `apps/api/prisma/schema.prisma` define los estados del ciclo de vida de un pedido:

| Estado | Significado |
|--------|-------------|
| `PENDING_PAYMENT` | Pedido recibido, pendiente de pago |
| `PENDING_ADDRESS` | Pedido ADRESLES recibido, esperando dirección del usuario |
| `READY_TO_PROCESS` | **Estado final del MVP** — dirección confirmada y disponible para envío |
| `COMPLETED` | Reservado para el futuro: la tienda online confirmó que el pedido fue tramitado (fuera del alcance del MVP mock) |
| `CANCELED` | Pedido cancelado |

**Flujo de estados por modo:**
- **ADRESLES**: `PENDING_ADDRESS` → *(conversación IA)* → `READY_TO_PROCESS`
- **TRADITIONAL**: `READY_TO_PROCESS` desde la creación (dirección incluida en el webhook)

### Fuente única de verdad para el schema

El worker (`apps/worker`) tiene su propio `prisma/schema.prisma` con valores de `OrderStatus` distintos al del API (`ADDRESS_CONFIRMED`, `SYNCED`, `FAILED`…). Ambas apps apuntan a la misma base de datos Supabase, por lo que **el schema del worker está desincronizado**. El worker debe usar exactamente el mismo schema que el API.

### Campos nuevos necesarios

El modelo `Order` en el API ya tiene `syncedAt DateTime?` pero **no tiene un campo que indique el origen del cambio de estado**. Se necesita añadir:

- `statusSource StatusSource?` — quién desencadenó el último cambio de estado (`ADRESLES` o `STORE`)

Este campo, junto con `syncedAt`, debe actualizarse en cada cambio de estado del pedido.

### Estado actual del código relevante

| Archivo | Situación |
|---------|-----------|
| `apps/worker/src/processors/conversation.processor.ts` — `finalizeAddress()` | Usa `status: 'READY_TO_PROCESS'` ✅ correcto, pero **no setea `syncedAt`** ni `statusSource` |
| `apps/worker/prisma/schema.prisma` | Schema desincronizado del API — enum `OrderStatus` tiene valores distintos |
| `apps/api/src/mock/mock-orders.service.ts` — `processTraditionalOrder()` | Llama a `updateStatus(COMPLETED)` tras crear el pedido — **incorrecto** para el MVP (READY_TO_PROCESS es el estado final) |
| `apps/api/src/orders/orders.service.ts` — `updateStatus()` | No acepta `statusSource` como parámetro |
| `apps/worker/src/services/address.service.ts` — `buildSyncSuccessMessage()` | No recibe `storeName`, el mensaje no menciona la tienda explícitamente |

---

## Especificaciones Técnicas

### Cambio 1 — Schema: nuevo enum `StatusSource` + campo en `Order`

**Archivo**: `apps/api/prisma/schema.prisma`

Añadir el enum después de `OrderStatus`:

```prisma
enum StatusSource {
  ADRESLES
  STORE
}
```

Añadir el campo al modelo `Order` (entre `syncedAt` y `createdAt`):

```prisma
model Order {
  // ... campos existentes sin cambios ...
  addressConfirmedAt  DateTime?     @map("address_confirmed_at")
  syncedAt            DateTime?     @map("synced_at")
  statusSource        StatusSource? @map("status_source")   // ← NUEVO
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")
  // ...
}
```

Generar y aplicar la migración:

```bash
# En apps/api/
npx prisma migrate dev --name add-order-status-source
npx prisma generate
```

### Cambio 2 — Schema del worker: sincronizar con el API

**Archivo**: `apps/worker/prisma/schema.prisma`

Reemplazar el contenido del schema del worker para que sea idéntico al del API. El worker no necesita schema propio — ambas apps usan la misma base de datos PostgreSQL (Supabase). Tras sincronizar, regenerar el cliente:

```bash
# En apps/worker/
npx prisma generate
```

> **Nota**: El worker no ejecuta migraciones. Las migraciones son responsabilidad exclusiva de `apps/api`. El worker solo necesita el cliente Prisma generado con el schema correcto.

### Cambio 3 — `OrdersService.updateStatus()`: añadir `statusSource`

**Archivo**: `apps/api/src/orders/orders.service.ts` — líneas 128–137

```typescript
// ANTES:
async updateStatus(
  orderId: string,
  status: OrderStatus,
  timestamps?: { addressConfirmedAt?: Date; syncedAt?: Date },
) {
  return this.prisma.order.update({
    where: { id: orderId },
    data: { status, ...timestamps },
  });
}

// DESPUÉS:
async updateStatus(
  orderId: string,
  status: OrderStatus,
  options?: {
    addressConfirmedAt?: Date;
    syncedAt?: Date;
    statusSource?: StatusSource;
  },
) {
  return this.prisma.order.update({
    where: { id: orderId },
    data: { status, ...options },
  });
}
```

Añadir el import del nuevo enum:

```typescript
import { OrderStatus, StatusSource } from '@prisma/client';
```

### Cambio 4 — `createFromMock()` en `OrdersService`: setear `syncedAt` y `statusSource` para TRADITIONAL

**Archivo**: `apps/api/src/orders/orders.service.ts` — función `createFromMock()`

Los pedidos TRADITIONAL se crean directamente en `READY_TO_PROCESS`. Deben registrar también `syncedAt` y `statusSource` en el momento de creación:

```typescript
// En la lógica de createFromMock():
const isAddressReady = options.initialStatus === 'READY_TO_PROCESS';

const order = await this.prisma.order.create({
  data: {
    // ... campos existentes ...
    status: options.initialStatus,
    addressConfirmedAt: isAddressReady ? now : undefined,
    syncedAt: isAddressReady ? now : undefined,                   // ← NUEVO
    statusSource: isAddressReady ? 'STORE' : undefined,           // ← NUEVO (TRADITIONAL viene de la tienda)
  },
});
```

### Cambio 5 — `processTraditionalOrder()` en MockOrdersService: eliminar `updateStatus(COMPLETED)`

**Archivo**: `apps/api/src/mock/mock-orders.service.ts` — líneas 90–99

El pedido TRADITIONAL ya se crea con `READY_TO_PROCESS`. Llamar luego a `updateStatus(COMPLETED)` es incorrecto para el MVP (COMPLETED está reservado para cuando la tienda online confirme el envío en producción).

```typescript
// ANTES (líneas 90–99):
this.ecommerceSync.simulateSync(order.id, { ... });

await this.orders.updateStatus(order.id, 'COMPLETED', {
  syncedAt: new Date(),
});

// DESPUÉS:
this.ecommerceSync.simulateSync(order.id, { ... });
// No se actualiza el estado: READY_TO_PROCESS es el estado final del MVP
```

### Cambio 6 — `finalizeAddress()` en el Worker: añadir `syncedAt` y `statusSource`

**Archivo**: `apps/worker/src/processors/conversation.processor.ts` — función `finalizeAddress()`, líneas 461–464

```typescript
// ANTES:
await prisma.order.update({
  where: { id: orderId },
  data: { status: 'READY_TO_PROCESS', addressConfirmedAt: now },
});

// DESPUÉS:
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'READY_TO_PROCESS',
    addressConfirmedAt: now,
    syncedAt: now,
    statusSource: 'ADRESLES',
  },
});
```

### Cambio 7 — `buildSyncSuccessMessage()`: añadir `storeName`

**Archivo**: `apps/worker/src/services/address.service.ts` — líneas 473–483

El mensaje de confirmación debe mencionar explícitamente ambas actualizaciones (la tienda simulada y Adresles), usando el nombre real de la tienda:

```typescript
// ANTES (firma actual):
export function buildSyncSuccessMessage(pending: PendingAddress, language: string): string

// DESPUÉS:
export function buildSyncSuccessMessage(
  pending: PendingAddress,
  language: string,
  storeName: string,
): string {
  const addr = buildAddressDisplayText(pending);

  if (language === 'English') {
    return (
      `Perfect! 🎉 Your delivery address has been confirmed:\n📍 ${addr}\n\n` +
      `I've updated your order in both ${storeName} and Adresles. ` +
      `Your order is now ready to be shipped. Thank you!`
    );
  }
  if (language === 'French') {
    return (
      `Parfait ! 🎉 Votre adresse de livraison a été confirmée :\n📍 ${addr}\n\n` +
      `J'ai mis à jour votre commande dans ${storeName} et Adresles. ` +
      `Votre commande est prête à être expédiée. Merci !`
    );
  }
  return (
    `¡Perfecto! 🎉 Tu dirección de entrega ha sido confirmada:\n📍 ${addr}\n\n` +
    `He actualizado tu pedido tanto en ${storeName} como en Adresles. ` +
    `Tu pedido está listo para ser enviado. ¡Gracias!`
  );
}
```

Actualizar la llamada en `finalizeAddress()` (línea 471):

```typescript
// ANTES:
const successMsg = buildSyncSuccessMessage(pending, language);

// DESPUÉS:
const successMsg = buildSyncSuccessMessage(pending, language, ctx.order.store.name);
```

### Cambio 8 — `simulateEcommerceSync()`: mejorar logs y aceptar `storeName`

**Archivo**: `apps/worker/src/services/address.service.ts` — función `simulateEcommerceSync()`, líneas 487–496

```typescript
export async function simulateEcommerceSync(
  orderId: string,
  pending: PendingAddress,
  storeName?: string,
): Promise<{ success: boolean; statusCode: number }> {
  const addr = buildAddressDisplayText(pending);
  const now = new Date().toISOString();

  console.log(`[SYNC_SIMULATED] ✅ Order ${orderId} synced with store ${storeName ?? 'unknown'}:`);
  console.log(`  - Address: ${addr}`);
  console.log(`  - Status: READY_TO_PROCESS → syncedAt: ${now}`);
  console.log(`  - (This is a simulation — no actual eCommerce API was called)`);

  return { success: true, statusCode: 200 };
}
```

Actualizar la llamada en `finalizeAddress()` (línea 418):

```typescript
const syncResult = await simulateEcommerceSync(orderId, pending, ctx.order.store.name);
```

### Cambio 9 — Publicación SSE de cierre: YA IMPLEMENTADO ✅

`publishConversationComplete(conversationId, 'COMPLETED')` ya existe en línea 474 de `finalizeAddress()`. Publica el evento `conversation:complete` correctamente según el patrón ADR-006. **No requiere ningún cambio.**

---

## Función `finalizeAddress()` completa — estado post-cambios

```typescript
async function finalizeAddress(ctx: HandlerContext, pending: PendingAddress) {
  const { conversationId, orderId, language, user } = ctx;

  const syncResult = await simulateEcommerceSync(orderId, pending, ctx.order.store.name);

  if (!syncResult.success) {
    const msg = language === 'English'
      ? `There was an issue saving your address. Please try again later.`
      : `Ha ocurrido un error al guardar tu dirección. Por favor, inténtalo de nuevo más tarde.`;
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    return { conversationId, status: 'sync_failed' };
  }

  const recipientPhoneId = user.phone?.id;
  if (!recipientPhoneId) throw new Error(`User ${user.id} has no associated phone record`);

  const recipientName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Cliente';
  const now = new Date();
  const addrText = buildAddressDisplayText(pending);

  await prisma.orderAddress.create({ /* sin cambios */ });

  // Cambio 6: añadir syncedAt + statusSource
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'READY_TO_PROCESS',
      addressConfirmedAt: now,
      syncedAt: now,
      statusSource: 'ADRESLES',
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });

  // Cambio 7: mensaje mejorado con storeName
  const successMsg = buildSyncSuccessMessage(pending, language, ctx.order.store.name);
  await saveMessage(conversationId, 'assistant', successMsg);
  await publishConversationUpdate(conversationId, 'assistant', successMsg);

  // Ya implementado (ADR-006): publica conversation:complete
  await publishConversationComplete(conversationId, 'COMPLETED');

  console.log(`[PROCESS_RESPONSE] ✅ Order ${orderId}: status=READY_TO_PROCESS, syncedAt=${now.toISOString()}, statusSource=ADRESLES, address="${addrText}"`);
  return { conversationId, orderId, status: 'address_confirmed', address: addrText, message: successMsg };
}
```

---

## Arquitectura

**ADRs afectados:**
- **[ADR-005](../../../memory-bank/architecture/005-bullmq-worker-conversations.md)**: Cambios en `finalizeAddress()` dentro del Worker BullMQ (cola `process-response`). El estado final del flujo ADRESLES pasa a ser `READY_TO_PROCESS` con trazabilidad completa.
- **[ADR-006](../../../memory-bank/architecture/006-sse-redis-pubsub.md)**: El evento `conversation:complete` ya se publica correctamente. Sin cambios en el canal SSE.

**Sin cambios en:**
- `apps/web-admin/` — El frontend ya gestiona `conversation:complete` (CU03-A6 ✅)
- `packages/shared-types/` — Los tipos de jobs no cambian
- Lógica de colas BullMQ — No hay cambios en el encolado

---

## Definición de Hecho (DoD)

### Bloque 1: Schema y migración (apps/api)
- [ ] Añadir enum `StatusSource { ADRESLES STORE }` a `apps/api/prisma/schema.prisma`
- [ ] Añadir campo `statusSource StatusSource? @map("status_source")` al modelo `Order`
- [ ] Ejecutar `npx prisma migrate dev --name add-order-status-source` en `apps/api`
- [ ] Ejecutar `npx prisma generate` en `apps/api`
- [ ] Verificar que la migración se aplica correctamente en la DB de desarrollo

### Bloque 2: Schema del worker (apps/worker)
- [ ] Reemplazar `apps/worker/prisma/schema.prisma` con el contenido actualizado de `apps/api/prisma/schema.prisma`
- [ ] Ejecutar `npx prisma generate` en `apps/worker`
- [ ] Verificar que `npx tsc --noEmit` en `apps/worker` pasa sin errores

### Bloque 3: Cambios en el API (apps/api)
- [ ] Actualizar `OrdersService.updateStatus()` para aceptar `statusSource?: StatusSource`
- [ ] Actualizar `OrdersService.createFromMock()` para setear `syncedAt` y `statusSource: 'STORE'` en pedidos TRADITIONAL (`READY_TO_PROCESS`)
- [ ] Eliminar la llamada a `updateStatus('COMPLETED')` en `MockOrdersService.processTraditionalOrder()` (READY_TO_PROCESS es el estado final del MVP)
- [ ] Actualizar tests de `orders.service.spec.ts` y `mock-orders.service.spec.ts` afectados por estos cambios
- [ ] Ejecutar `npx tsc --noEmit` en `apps/api` sin errores

### Bloque 4: Cambios en el Worker (apps/worker)
- [ ] Actualizar `finalizeAddress()`: añadir `syncedAt: now` y `statusSource: 'ADRESLES'` al `prisma.order.update()`
- [ ] Actualizar `buildSyncSuccessMessage()`: añadir parámetro `storeName: string`, actualizar mensajes ES/EN/FR
- [ ] Actualizar la llamada a `buildSyncSuccessMessage()` en `finalizeAddress()` para pasar `ctx.order.store.name`
- [ ] Actualizar `simulateEcommerceSync()`: añadir parámetro opcional `storeName?`, mejorar logs
- [ ] Actualizar la llamada a `simulateEcommerceSync()` en `finalizeAddress()` para pasar `ctx.order.store.name`
- [ ] Verificar visualmente que `publishConversationComplete()` se llama correctamente (no requiere cambio)

### Bloque 5: Verificación end-to-end
- [ ] Ejecutar simulación completa desde `/simulate` en el Dashboard Admin (flujo ADRESLES):
  - El chat muestra el mensaje de confirmación con el nombre de la tienda
  - El chat se cierra correctamente tras el evento `conversation:complete`
  - El pedido aparece en el panel de administración con estado `READY_TO_PROCESS`
- [ ] Verificar logs del Worker:
  ```
  [SYNC_SIMULATED] ✅ Order {id} synced with store {storeName}:
    - Address: {fullAddress}
    - Status: READY_TO_PROCESS → syncedAt: {timestamp}
    - (This is a simulation — no actual eCommerce API was called)
  [PROCESS_RESPONSE] ✅ Order {id}: status=READY_TO_PROCESS, syncedAt=..., statusSource=ADRESLES, address="..."
  ```
- [ ] Verificar en DB que el pedido tiene `status=READY_TO_PROCESS`, `synced_at` y `status_source='ADRESLES'` correctamente poblados

### Tests unitarios mínimos
- [ ] `buildSyncSuccessMessage()`: test con ES/EN/FR verificando que `storeName` aparece en el mensaje
- [ ] `updateStatus()` en `OrdersService`: test verificando que `statusSource` se pasa al `prisma.order.update`

---

## Requisitos No Funcionales

### Trazabilidad de estados
El campo `statusSource` permite auditar quién cambió el estado de cada pedido. Reglas de uso:
- Pedidos TRADITIONAL creados vía mock: `statusSource = 'STORE'` (origen: la tienda online)
- Pedidos ADRESLES tras conversación: `statusSource = 'ADRESLES'` (origen: el sistema Adresles)
- Futuros cambios desde integración real eCommerce: `statusSource = 'STORE'`

### Atomicidad
Las escrituras en `Order` y `Conversation` en `finalizeAddress()` ocurren secuencialmente sin transacción Prisma explícita. Aceptable para MVP. Considerar `prisma.$transaction()` antes de producción.

### Tipado estricto
Tras sincronizar el schema del worker con el del API, todos los valores de `OrderStatus` y `StatusSource` deben usar los literales del enum generado por Prisma. Verificar con `npx tsc --noEmit` en ambas apps.
