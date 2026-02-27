# CU03-B4 — Worker: ofrecer guardar dirección en la libreta de Adresles

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-B3 completado (flujo de registro voluntario implementado)

---

## Historia de Usuario

**Como** agente Adresles,  
**quiero** preguntar al usuario (registrado o recién registrado) si quiere guardar la dirección de entrega usada en su libreta de Adresles,  
**para** que en futuras compras pueda beneficiarse de la confirmación automática con esa dirección.

---

## Descripción funcional

### Cuándo se ofrece guardar la dirección

| Situación | ¿Se ofrece guardar? |
|---|---|
| Usuario registrado, dirección usada es nueva (no está en su libreta) | Sí |
| Usuario registrado, dirección usada es una ya guardada (sub-journey 2.1) | No (ya la tiene) |
| Usuario no registrado que acaba de registrarse (CU03-B3) | Sí (justo después del registro) |
| Usuario no registrado que rechaza el registro | No |

### Mensaje de oferta de guardar dirección

```
"¿Te gustaría guardar esta dirección en tu libreta de Adresles para usarla en
el futuro?
  Calle Atocha 34, 2º B, 28012 Madrid
(responde 'Sí' o 'No')"
```

### Posición en el flujo

```
Conversación con usuario YA registrado:
  finalizeAddress()
    → Si usó dirección nueva → ofrecer guardar (WAITING_SAVE_ADDRESS)
    → Si usó dirección guardada → cerrar directamente (COMPLETED)

Conversación con usuario NO registrado:
  finalizeAddress()
    → WAITING_REGISTER (CU03-B3)
      → Si acepta registro → ofrecer guardar (WAITING_SAVE_ADDRESS)
      → Si rechaza registro → cerrar (COMPLETED)
```

### Detección de "dirección nueva"

Una dirección se considera nueva si no coincide con ninguna de las ya guardadas en la libreta del usuario. La comparación se hace por `fullAddress` normalizado (trim + lowercase):

```typescript
const isNewAddress = !existingAddresses.some(
  (a) => a.fullAddress.trim().toLowerCase() === confirmedAddress.gmapsFormatted.trim().toLowerCase()
);
```

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
  | 'WAITING_REGISTER'
  | 'WAITING_SAVE_ADDRESS';   // NUEVO
```

**Nuevas funciones de mensaje:**

```typescript
export function buildSaveAddressOfferMessage(
  pending: PendingAddress,
  language: string,
): string {
  const addressText = buildAddressDisplayText(pending);
  if (language === 'English') {
    return (
      `Would you like to save this address in your Adresles address book for future use?\n\n` +
      `**${addressText}**\n\n(reply "Yes" or "No")`
    );
  }
  return (
    `¿Te gustaría guardar esta dirección en tu libreta de Adresles para usarla en el futuro?\n\n` +
    `**${addressText}**\n\n(responde "Sí" o "No")`
  );
}

export function buildAddressSavedMessage(language: string): string {
  if (language === 'English') return `Done! Address saved to your Adresles address book. 📋`;
  return `¡Listo! Dirección guardada en tu libreta de Adresles. 📋`;
}

export function buildAddressNotSavedMessage(language: string): string {
  if (language === 'English') return `No problem! Have a great day! 😊`;
  return `¡Sin problema! ¡Hasta pronto! 😊`;
}
```

### `apps/worker/src/processors/conversation.processor.ts`

**Nueva función `offerSaveAddress()`** — encapsula el ofrecimiento y la transición:

```typescript
async function offerSaveAddress(
  ctx: HandlerContext,
  confirmedAddress: PendingAddress,
) {
  const { conversationId, userId, language } = ctx;

  // Verificar si la dirección ya está en la libreta
  const existingAddresses = await prisma.address.findMany({ where: { userId } });
  const isNewAddress = !existingAddresses.some(
    (a) => a.fullAddress.trim().toLowerCase() ===
           confirmedAddress.gmapsFormatted.trim().toLowerCase(),
  );

  if (!isNewAddress) {
    // Ya tiene esta dirección guardada → cerrar conversación
    return closeConversation(ctx);
  }

  const msg = buildSaveAddressOfferMessage(confirmedAddress, language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  await saveConversationState(conversationId, {
    phase: 'WAITING_SAVE_ADDRESS',
    confirmedAddress,
  });
  return { conversationId, status: 'waiting_save_address' };
}

async function closeConversation(ctx: HandlerContext) {
  const { conversationId } = ctx;
  const now = new Date();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'COMPLETED', completedAt: now },
  });
  await redisPublisher.publish(
    `conversation:${conversationId}:update`,
    JSON.stringify({ event: 'conversation:complete', status: 'COMPLETED' }),
  );
  return { conversationId, status: 'completed' };
}
```

**Nuevo handler `handleWaitingSaveAddress()`:**

```typescript
async function handleWaitingSaveAddress(ctx: HandlerContext) {
  const { conversationId, userId, userMessage, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const intent = await interpretUserIntent('WAITING_CONFIRMATION', userMessage, language);

  if (intent.type === 'CONFIRM') {
    // Guardar la dirección en la libreta
    await prisma.address.create({
      data: {
        userId,
        label: 'Mi dirección',
        fullAddress: confirmedAddress.gmapsFormatted,
        street: confirmedAddress.street,
        number: confirmedAddress.number ?? undefined,
        block: confirmedAddress.block ?? undefined,
        staircase: confirmedAddress.staircase ?? undefined,
        floor: confirmedAddress.floor ?? undefined,
        door: confirmedAddress.door ?? undefined,
        postalCode: confirmedAddress.postalCode,
        city: confirmedAddress.city,
        province: confirmedAddress.province ?? undefined,
        country: confirmedAddress.country,
        isDefault: false,
      },
    });

    const msg = buildAddressSavedMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
  } else {
    const msg = buildAddressNotSavedMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
  }

  return closeConversation(ctx);
}
```

**Modificar `finalizeAddress()` para bifurcar según registro + dirección nueva:**

Reemplazar el bloque de cierre para usuarios ya registrados:

```typescript
// Usuario ya registrado → verificar si dirección es nueva y ofrecer guardar
if (user.isRegistered) {
  return offerSaveAddress(ctx, pending);
}
// No registrado → flujo de registro (CU03-B3)
// (la llamada a offerSaveAddress se hace desde handleWaitingRegister si acepta)
```

**Modificar `handleWaitingRegister()` para transicionar a `WAITING_SAVE_ADDRESS`:**

Reemplazar el bloque provisional de CU03-B3:

```typescript
if (intent.type === 'CONFIRM') {
  await prisma.user.update({
    where: { id: userId },
    data: { isRegistered: true, registeredAt: now },
  });

  const msg = buildRegistrationSuccessMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);

  // CAMBIO (respecto al placeholder de B3): ofrecer guardar dirección
  return offerSaveAddress({ ...ctx, state: { ...state, confirmedAddress } }, confirmedAddress);
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
  WAITING_REGISTER: handleWaitingRegister,
  WAITING_SAVE_ADDRESS: handleWaitingSaveAddress,  // NUEVO
};
```

---

## Lista de tareas

- [ ] Añadir fase `WAITING_SAVE_ADDRESS` al tipo `ConversationPhase` en `address.service.ts`
- [ ] Implementar funciones `buildSaveAddressOfferMessage()`, `buildAddressSavedMessage()`, `buildAddressNotSavedMessage()` en `address.service.ts`
- [ ] Implementar función `offerSaveAddress()` en el processor (detección de dirección nueva + transición a WAITING_SAVE_ADDRESS)
- [ ] Implementar función `closeConversation()` como helper compartido para cerrar la conversación con COMPLETED + SSE
- [ ] Implementar handler `handleWaitingSaveAddress()`: crear `Address` en Prisma si acepta, cerrar en ambos casos
- [ ] Modificar `finalizeAddress()` para usuarios ya registrados: llamar a `offerSaveAddress()` en lugar de cerrar directamente
- [ ] Modificar `handleWaitingRegister()`: al aceptar registro, llamar a `offerSaveAddress()` en lugar del cierre provisional
- [ ] Añadir `WAITING_SAVE_ADDRESS` al mapa `handlers`
- [ ] Verificar caso: usuario registrado + sub-journey 2.1 (dirección ya guardada) → no ofrece guardar, cierra directamente
- [ ] Verificar caso: usuario registrado + dirección nueva → ofrece guardar → acepta → `Address` creada en DB
- [ ] Verificar caso: usuario registrado + dirección nueva → ofrece guardar → rechaza → cierra sin crear Address
- [ ] Verificar caso: usuario recién registrado (CU03-B3) → ofrece guardar → acepta → `Address` creada en DB
- [ ] Verificar que el label por defecto de la dirección guardada es `'Mi dirección'`
