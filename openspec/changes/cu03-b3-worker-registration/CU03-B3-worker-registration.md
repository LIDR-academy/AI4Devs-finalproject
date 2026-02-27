# CU03-B3 — Worker: flujo de registro voluntario al final de la conversación

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-B1 completado (`finalizeAddress()` actualiza Order a COMPLETED)

---

## Historia de Usuario

**Como** agente Adresles,  
**quiero** ofrecer al usuario no registrado la posibilidad de registrarse en Adresles al final del proceso de obtención de dirección,  
**para** que en futuras compras pueda beneficiarse de la confirmación automática con su dirección guardada.

---

## Descripción funcional

Después de confirmar y sincronizar la dirección (al final de `finalizeAddress()`), si el usuario tiene `isRegistered = false`, el agente añade un mensaje adicional ofreciendo el registro. La conversación **no** termina ahí: pasa a una nueva fase `WAITING_REGISTER` en la que espera la respuesta del usuario.

La conversación solo se marca como `COMPLETED` y se emite el evento SSE `conversation:complete` después de:
1. Que el usuario acepte o rechace el registro
2. Y, si aceptó y aceptó guardar la dirección (CU03-B4), tras esa acción

Si el usuario rechaza el registro, la conversación finaliza con un mensaje de despedida.

### Mensaje de oferta de registro

```
"¡Todo listo! Por cierto, ¿sabías que puedes registrarte en Adresles de forma gratuita?
Así, en tu próxima compra confirmaré tu dirección automáticamente sin que tengas que
escribirla de nuevo. ¿Te gustaría registrarte ahora? (responde 'Sí' o 'No')"
```

### Flujo completo tras dirección confirmada

```
finalizeAddress()
  ├─ Si user.isRegistered = true
  │    → Mensaje de confirmación + COMPLETED + SSE complete  (igual que antes)
  │    → (CU03-B4 puede añadir el ofrecimiento de guardar dirección aquí)
  │
  └─ Si user.isRegistered = false
       → Mensaje de dirección confirmada (sin marcar COMPLETED todavía)
       → Mensaje de oferta de registro
       → Estado → WAITING_REGISTER (con pendingAddress guardado en el estado)
       → (No se emite SSE conversation:complete todavía)
```

### Handler `WAITING_REGISTER`

El usuario responde a la oferta de registro:

- **Acepta (`CONFIRM`)**: 
  - Worker ejecuta `User.isRegistered = true`, `User.registeredAt = now()` en Prisma
  - Responde: "¡Perfecto! Ya estás registrado en Adresles. [CU03-B4 continúa preguntando por guardar dirección]"
  - Transiciona a `WAITING_SAVE_ADDRESS` (CU03-B4) o `CONVERSATION_END`

- **Rechaza (`REJECT`)**: 
  - Responde: "Sin problema. ¡Hasta pronto! 😊"
  - Marca `Conversation.status = 'COMPLETED'`
  - Publica SSE `conversation:complete`

---

## Arquitectura de la solución

### `apps/worker/src/services/address.service.ts`

**Añadir la nueva fase:**

```typescript
export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_ADDRESS_PROPOSAL_CONFIRM'
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION'
  | 'WAITING_REGISTER';             // NUEVO
```

**Añadir campo `confirmedAddress` al estado (para pasarlo a B4):**

```typescript
export interface ConversationState {
  phase: ConversationPhase;
  pendingAddress?: PendingAddress;
  proposedAddress?: PendingAddress;
  confirmedAddress?: PendingAddress;  // NUEVO: dirección ya confirmada para B4
  gmapsOptions?: GmapsResult[];
  failedAttempts?: number;
}
```

**Nuevas funciones de mensaje:**

```typescript
export function buildRegistrationOfferMessage(language: string): string {
  if (language === 'English') {
    return (
      `By the way, did you know you can register with Adresles for free? ` +
      `Next time you shop, I'll confirm your address automatically without you having to type it again. ` +
      `Would you like to register now? (reply "Yes" or "No")`
    );
  }
  return (
    `Por cierto, ¿sabías que puedes registrarte en Adresles de forma gratuita? ` +
    `Así, en tu próxima compra confirmaré tu dirección automáticamente sin que tengas que escribirla de nuevo. ` +
    `¿Te gustaría registrarte ahora? (responde "Sí" o "No")`
  );
}

export function buildRegistrationSuccessMessage(language: string): string {
  if (language === 'English') return `Great! You're now registered with Adresles. 🎉`;
  return `¡Perfecto! Ya estás registrado en Adresles. 🎉`;
}

export function buildRegistrationDeclinedMessage(language: string): string {
  if (language === 'English') return `No problem! Have a great day! 😊`;
  return `¡Sin problema! ¡Hasta pronto! 😊`;
}
```

### `apps/worker/src/processors/conversation.processor.ts`

**Modificar `finalizeAddress()` para bifurcar según `user.isRegistered`:**

```typescript
async function finalizeAddress(ctx: HandlerContext, pending: PendingAddress) {
  const { conversationId, orderId, language, user } = ctx;

  const syncResult = await simulateEcommerceSync(orderId, pending);
  if (!syncResult.success) { /* sin cambios */ }

  // Crear OrderAddress (sin cambios)
  const now = new Date();
  await prisma.orderAddress.create({ /* sin cambios */ });

  // Actualizar Order a COMPLETED (CU03-B1)
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED', addressConfirmedAt: now, syncedAt: now },
  });

  // Mensaje de confirmación de dirección
  const successMsg = buildSyncSuccessMessage(pending, language, ctx.order.store.name);
  await saveMessage(conversationId, 'assistant', successMsg);
  await publishConversationUpdate(conversationId, 'assistant', successMsg);

  // ─── Bifurcación según registro ──────────────────────────────────────────
  if (!user.isRegistered) {
    // Ofrecer registro (no marcar COMPLETED todavía)
    const registerMsg = buildRegistrationOfferMessage(language);
    await saveMessage(conversationId, 'assistant', registerMsg);
    await publishConversationUpdate(conversationId, 'assistant', registerMsg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_REGISTER',
      confirmedAddress: pending,
    });
    return { conversationId, status: 'waiting_register' };
  }

  // Usuario ya registrado → cerrar conversación (CU03-B4 puede añadir aquí el ofrecimiento de libreta)
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
  );
  return { conversationId, status: 'address_confirmed' };
}
```

**Nuevo handler `handleWaitingRegister()`:**

```typescript
async function handleWaitingRegister(ctx: HandlerContext) {
  const { conversationId, userId, userMessage, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const intent = await interpretUserIntent('WAITING_CONFIRMATION', userMessage, language);
  const now = new Date();

  if (intent.type === 'CONFIRM') {
    // Registrar usuario
    await prisma.user.update({
      where: { id: userId },
      data: { isRegistered: true, registeredAt: now },
    });

    const msg = buildRegistrationSuccessMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);

    // Transicionar a WAITING_SAVE_ADDRESS (CU03-B4)
    // Por ahora (antes de B4), cerrar la conversación aquí
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'COMPLETED', completedAt: now },
    });
    await redisPublisher.publish(
      `conversation:${conversationId}:update`,
      JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
    );
    return { conversationId, status: 'registered' };
  }

  // Rechaza el registro
  const msg = buildRegistrationDeclinedMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
  );
  return { conversationId, status: 'registration_declined' };
}
```

**Añadir al mapa `handlers`:**

```typescript
const handlers = {
  WAITING_ADDRESS: handleWaitingAddress,
  WAITING_ADDRESS_PROPOSAL_CONFIRM: handleAddressProposalConfirm,
  WAITING_DISAMBIGUATION: handleDisambiguation,
  WAITING_BUILDING_DETAILS: handleBuildingDetails,
  WAITING_CONFIRMATION: handleConfirmation,
  WAITING_REGISTER: handleWaitingRegister,  // NUEVO
};
```

---

## Nota sobre compatibilidad con CU03-B4

En `handleWaitingRegister()`, cuando el usuario acepta el registro, hay un comentario `// Transicionar a WAITING_SAVE_ADDRESS (CU03-B4)`. La implementación provisional cierra la conversación ahí. CU03-B4 modificará este punto para transicionar a la nueva fase en lugar de cerrar.

---

## Lista de tareas

- [ ] Añadir fase `WAITING_REGISTER` al tipo `ConversationPhase` en `address.service.ts`
- [ ] Añadir campo `confirmedAddress` a `ConversationState` en `address.service.ts`
- [ ] Implementar funciones `buildRegistrationOfferMessage()`, `buildRegistrationSuccessMessage()`, `buildRegistrationDeclinedMessage()` en `address.service.ts`
- [ ] Modificar `finalizeAddress()`: bifurcar según `user.isRegistered` (ofrecer registro si no registrado, cerrar directamente si ya registrado)
- [ ] Implementar `handleWaitingRegister()`: actualizar `User.isRegistered=true` si acepta, cerrar conversación en ambos casos
- [ ] Añadir `WAITING_REGISTER` al mapa `handlers` en `processResponseProcessor()`
- [ ] Verificar que la conversación no se marca COMPLETED hasta que el usuario responda a la oferta de registro
- [ ] Verificar que el evento SSE `conversation:complete` se emite solo después de la respuesta del usuario
- [ ] Verificar caso: usuario rechaza → conversación termina con mensaje de despedida
- [ ] Verificar caso: usuario acepta → `User.isRegistered=true` en DB y conversación termina
