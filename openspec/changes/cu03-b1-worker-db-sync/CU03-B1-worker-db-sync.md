# CU03-B1 — Worker: sincronización real en DB tras confirmar dirección

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-A6 completado (chat SSE funcional end-to-end)

---

## Historia de Usuario

**Como** sistema Adresles,  
**quiero** actualizar el estado del pedido a COMPLETED y añadir `syncedAt` en la base de datos real tras confirmar la dirección y simular con éxito el sync con la tienda,  
**para** que el pedido refleje su estado correcto en el panel de administración y la conversación sea visible como completada desde el inicio.

---

## Descripción funcional

### Estado actual del Worker

La función `finalizeAddress()` ya realiza varias acciones tras confirmar la dirección:
1. `simulateEcommerceSync()` → log simulado (sigue igual)
2. Crea `OrderAddress` en Prisma con `addressOrigin: 'USER_CONVERSATION'`
3. Actualiza `Order.status = 'READY_TO_PROCESS'` y `addressConfirmedAt`
4. Actualiza `Conversation.status = 'COMPLETED'`
5. Genera y guarda el mensaje de confirmación

### Cambios necesarios

**Cambio 1**: Modificar la actualización del `Order` para poner `COMPLETED` + `syncedAt` una vez que el sync simulado ha tenido éxito:

```typescript
// Antes:
await prisma.order.update({
  where: { id: orderId },
  data: { status: 'READY_TO_PROCESS', addressConfirmedAt: now },
});

// Después:
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'COMPLETED',
    addressConfirmedAt: now,
    syncedAt: now,
  },
});
```

**Cambio 2**: Mejorar el mensaje de confirmación para comunicar explícitamente al usuario que tanto la tienda como Adresles han sido actualizados. Crear o modificar `buildSyncSuccessMessage()` en `address.service.ts`:

```typescript
// Ejemplo de mensaje resultante (en español):
// "¡Perfecto! 🎉 Tu dirección de entrega ha sido confirmada:
// Calle Atocha 34, 2º B, 28012 Madrid
//
// He actualizado tu pedido tanto en ModaMujer como en Adresles.
// Tu pedido está ahora listo para ser enviado. ¡Gracias!"
```

El mensaje debe:
1. Mostrar la dirección confirmada
2. Mencionar explícitamente AMBAS actualizaciones (la tienda simulada y Adresles)
3. Indicar que el pedido está listo para envío

**Cambio 3**: Publicar evento SSE `conversation:complete` tras actualizar la Conversación a COMPLETED (ya cubierto en CU03-A2, verificar que se está llamando):

```typescript
await prisma.conversation.update({
  where: { id: conversationId },
  data: { status: 'COMPLETED', completedAt: now },
});

// Publicar cierre de la conversación por SSE
await redisPublisher.publish(
  `conversation:${conversationId}:update`,
  JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
);
```

### Mensaje de sync simulado en consola

`simulateEcommerceSync()` actualmente ya genera un log. Mejorar el log para que sea más descriptivo:

```
[SYNC_SIMULATED] ✅ Order {orderId} synced with store {storeName}:
  - Address: {fullAddress}
  - Status: COMPLETED → syncedAt: {timestamp}
  - (This is a simulation — no actual eCommerce API was called)
```

---

## Arquitectura de la solución

### `apps/worker/src/processors/conversation.processor.ts`

**Función `finalizeAddress()`** — cambios:

```typescript
async function finalizeAddress(ctx: HandlerContext, pending: PendingAddress) {
  const { conversationId, orderId, language, user } = ctx;

  const syncResult = await simulateEcommerceSync(orderId, pending);

  if (!syncResult.success) {
    // (sin cambios)
  }

  // ... creación de OrderAddress sin cambios ...

  const now = new Date();

  // CAMBIO: COMPLETED + syncedAt (antes era READY_TO_PROCESS sin syncedAt)
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'COMPLETED',
      addressConfirmedAt: now,
      syncedAt: now,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });

  // CAMBIO: mensaje mejorado que menciona AMBAS actualizaciones
  const successMsg = buildSyncSuccessMessage(pending, language, ctx.order.store.name);
  await saveMessage(conversationId, 'assistant', successMsg);
  await publishConversationUpdate(conversationId, 'assistant', successMsg);

  // CAMBIO: publicar cierre de la conversación
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
  );

  console.log(`[PROCESS_RESPONSE] ✅ Address confirmed & synced for order ${orderId}: ${addrText}`);
  return { conversationId, orderId, status: 'address_confirmed', address: addrText, message: successMsg };
}
```

### `apps/worker/src/services/address.service.ts`

**Función `buildSyncSuccessMessage()`** — añadir parámetro `storeName`:

```typescript
export function buildSyncSuccessMessage(
  pending: PendingAddress,
  language: string,
  storeName: string,
): string {
  const addressText = buildAddressDisplayText(pending);

  if (language === 'English') {
    return (
      `Perfect! 🎉 Your delivery address has been confirmed:\n${addressText}\n\n` +
      `I've updated your order in both ${storeName} and Adresles. ` +
      `Your order is now ready to be shipped. Thank you!`
    );
  }
  return (
    `¡Perfecto! 🎉 Tu dirección de entrega ha sido confirmada:\n${addressText}\n\n` +
    `He actualizado tu pedido tanto en ${storeName} como en Adresles. ` +
    `Tu pedido está listo para ser enviado. ¡Gracias!`
  );
}
```

---

## Lista de tareas

- [ ] Modificar `finalizeAddress()`: cambiar `Order.status` de `READY_TO_PROCESS` a `COMPLETED` y añadir `syncedAt: now`
- [ ] Actualizar firma de `buildSyncSuccessMessage()` para aceptar `storeName` y generar mensaje que mencione ambas actualizaciones
- [ ] Pasar `ctx.order.store.name` a `buildSyncSuccessMessage()` en la llamada desde `finalizeAddress()`
- [ ] Verificar que `publishConversationUpdate()` se llama tras el mensaje de confirmación (CU03-A2)
- [ ] Añadir publicación del evento `conversation:complete` tras actualizar `Conversation.status = 'COMPLETED'`
- [ ] Mejorar el log de `simulateEcommerceSync()` para reflejar que el pedido quedó COMPLETED con syncedAt
- [ ] Verificar en el panel de admin que el pedido creado desde la simulación aparece en estado COMPLETED tras confirmar la dirección
