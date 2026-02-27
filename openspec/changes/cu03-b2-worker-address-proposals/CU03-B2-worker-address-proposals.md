# CU03-B2 — Worker: sub-journeys 2.1 y 2.3 (proponer dirección guardada)

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-B1 completado, CU03-A3 completado (campos `context` disponibles en el job)

---

## Historia de Usuario

**Como** agente Adresles,  
**quiero** proponer al usuario su dirección guardada cuando ya la tengo disponible (ya sea de su libreta Adresles o del eCommerce),  
**para** que el proceso sea más rápido y solo tenga que confirmar en lugar de escribirla de cero.

---

## Descripción funcional

### Sub-journeys implementados

| Journey | Condición de activación | Comportamiento del agente |
|---|---|---|
| **2.1** | `user.isRegistered=true` Y tiene al menos una dirección guardada en Adresles | Propone la dirección favorita (la marcada como `isDefault=true`, o la primera si no hay favorita). El usuario puede confirmarla o pedir una diferente. |
| **2.3** | `user.isRegistered=false` Y `context.buyerRegisteredEcommerce=true` Y `context.buyerEcommerceAddress` tiene valor | Propone la dirección del eCommerce recibida en el job. El usuario puede confirmarla o dar una diferente. |

Los journeys 2.2 y 2.4 ya están implementados (el worker básico pregunta la dirección sin proponer nada).

### Flujo sub-journey 2.1 (dirección Adresles guardada)

```
1. Worker carga las direcciones del usuario de Prisma
2. Selecciona la dirección por defecto (isDefault=true) o la primera disponible
3. Genera mensaje: "Hola {nombre}, hemos recibido tu pedido en {tienda}.
   ¿Quieres que te lo enviemos a tu dirección habitual?
   {dirección formateada}
   Responde 'Sí' para confirmar o indícame otra dirección."
4. Estado → nueva fase: WAITING_ADDRESS_PROPOSAL_CONFIRM
   con pendingAddress precargado con la dirección Adresles
```

### Flujo sub-journey 2.3 (dirección eCommerce)

```
1. Worker recupera buyerEcommerceAddress del job.data.context
2. Genera mensaje equivalente al 2.1 pero mencionando que es la dirección
   registrada en la tienda
3. Estado → WAITING_ADDRESS_PROPOSAL_CONFIRM
   con pendingAddress precargado con la dirección eCommerce
```

### Nueva fase: `WAITING_ADDRESS_PROPOSAL_CONFIRM`

Se añade esta fase a la máquina de estados. El handler:
- Si el usuario confirma (`CONFIRM`) → pasa directamente a `advanceFromPending()` con la dirección precargada (saltando extracción y GMaps)
- Si el usuario rechaza / da otra dirección → transiciona a `WAITING_ADDRESS` (flujo estándar)

---

## Arquitectura de la solución

### `apps/worker/src/services/address.service.ts`

**Añadir la nueva fase al tipo `ConversationPhase`:**

```typescript
export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_ADDRESS_PROPOSAL_CONFIRM'   // NUEVO
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION';
```

**Añadir campo `proposedAddress` a `ConversationState`:**

```typescript
export interface ConversationState {
  phase: ConversationPhase;
  pendingAddress?: PendingAddress;
  proposedAddress?: PendingAddress;    // NUEVO: dirección propuesta al usuario
  gmapsOptions?: GmapsResult[];
  failedAttempts?: number;
}
```

**Nuevas funciones de mensaje:**

```typescript
export function buildAddressProposalMessage(
  pending: PendingAddress,
  storeName: string,
  source: 'adresles' | 'ecommerce',
  language: string,
): string {
  const addressText = buildAddressDisplayText(pending);
  const sourceText = source === 'adresles'
    ? (language === 'English' ? 'your saved Adresles address' : 'tu dirección guardada en Adresles')
    : (language === 'English' ? `your address registered at ${storeName}` : `tu dirección registrada en ${storeName}`);

  if (language === 'English') {
    return (
      `Hi! We've received your order from ${storeName}. ` +
      `Shall we send it to ${sourceText}?\n\n**${addressText}**\n\n` +
      `Reply "Yes" to confirm or give me a different address.`
    );
  }
  return (
    `¡Hola! Hemos recibido tu pedido de ${storeName}. ` +
    `¿Te lo enviamos a ${sourceText}?\n\n**${addressText}**\n\n` +
    `Responde "Sí" para confirmar o indícame otra dirección.`
  );
}
```

### `apps/worker/src/processors/conversation.processor.ts`

**Extender `ProcessConversationJobData` para acceder al contexto:**

Ya definido en CU03-A3. Aquí se usa.

**Modificar `processGetAddressJourney()` para detectar el sub-journey:**

```typescript
async function processGetAddressJourney(
  conversationId: string,
  user: { id: string; firstName: string | null; isRegistered: boolean; preferredLanguage: string | null },
  order: { externalOrderNumber: string | null; store: { name: string } },
  context?: ProcessConversationJobData['context'],
) {
  const language = getLanguageName(user.preferredLanguage);
  const systemPrompt = buildGetAddressSystemPrompt(language);

  // ─── Sub-journey 2.1: usuario registrado Adresles con dirección guardada ──
  if (user.isRegistered) {
    const savedAddresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      take: 1,
    });

    if (savedAddresses.length > 0) {
      const saved = savedAddresses[0];
      const proposedPending: PendingAddress = {
        gmapsFormatted: saved.fullAddress,
        gmapsPlaceId: null,
        latitude: null, longitude: null,
        street: saved.street,
        number: saved.number ?? null,
        postalCode: saved.postalCode,
        city: saved.city,
        province: saved.province ?? null,
        country: saved.country,
        block: saved.block ?? null,
        staircase: saved.staircase ?? null,
        floor: saved.floor ?? null,
        door: saved.door ?? null,
        additionalInfo: null,
        couldBeBuilding: false,
        userConfirmedNoDetails: true,
      };

      const msg = buildAddressProposalMessage(
        proposedPending, order.store.name, 'adresles', language
      );
      await saveMessage(conversationId, 'system', systemPrompt);
      await saveMessage(conversationId, 'assistant', msg);
      await saveConversationState(conversationId, {
        phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM',
        proposedAddress: proposedPending,
        failedAttempts: 0,
      });
      await publishConversationUpdate(conversationId, 'assistant', msg);
      return { conversationId, message: msg, conversationType: 'GET_ADDRESS' };
    }
  }

  // ─── Sub-journey 2.3: usuario NO registrado pero registrado en eCommerce ──
  if (!user.isRegistered && context?.buyerRegisteredEcommerce && context.buyerEcommerceAddress) {
    const addr = context.buyerEcommerceAddress;
    const proposedPending: PendingAddress = {
      gmapsFormatted: addr.full_address,
      gmapsPlaceId: null,
      latitude: null, longitude: null,
      street: addr.street,
      number: addr.number ?? null,
      postalCode: addr.postal_code,
      city: addr.city,
      province: null,
      country: addr.country,
      block: null, staircase: null,
      floor: addr.floor ?? null,
      door: addr.door ?? null,
      additionalInfo: null,
      couldBeBuilding: false,
      userConfirmedNoDetails: true,
    };

    const msg = buildAddressProposalMessage(
      proposedPending, order.store.name, 'ecommerce', language
    );
    await saveMessage(conversationId, 'system', systemPrompt);
    await saveMessage(conversationId, 'assistant', msg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM',
      proposedAddress: proposedPending,
      failedAttempts: 0,
    });
    await publishConversationUpdate(conversationId, 'assistant', msg);
    return { conversationId, message: msg, conversationType: 'GET_ADDRESS' };
  }

  // ─── Sub-journey 2.2 / 2.4: pregunta dirección directamente (ya existente) ──
  const name = user.firstName ?? 'Cliente';
  const userPrompt = buildGetAddressUserPrompt({ name, storeName: order.store.name, orderNumber: order.externalOrderNumber, language });
  const assistantMessage = await generateWithOpenAI(systemPrompt, userPrompt);
  await saveMessage(conversationId, 'system', systemPrompt);
  await saveMessage(conversationId, 'user', userPrompt);
  await saveMessage(conversationId, 'assistant', assistantMessage);
  await saveConversationState(conversationId, { phase: 'WAITING_ADDRESS', failedAttempts: 0 });
  await publishConversationUpdate(conversationId, 'assistant', assistantMessage);
  return { conversationId, message: assistantMessage, conversationType: 'GET_ADDRESS' };
}
```

**Añadir handler `handleAddressProposalConfirm()` en la máquina de estados:**

```typescript
const handlers = {
  WAITING_ADDRESS: handleWaitingAddress,
  WAITING_ADDRESS_PROPOSAL_CONFIRM: handleAddressProposalConfirm,  // NUEVO
  WAITING_DISAMBIGUATION: handleDisambiguation,
  WAITING_BUILDING_DETAILS: handleBuildingDetails,
  WAITING_CONFIRMATION: handleConfirmation,
};

async function handleAddressProposalConfirm(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;
  const proposed = state.proposedAddress!;

  const intent = await interpretUserIntent('WAITING_CONFIRMATION', userMessage, language);

  if (intent.type === 'CONFIRM') {
    // Usuario acepta la dirección propuesta → finalizar directamente
    return finalizeAddress(ctx, proposed);
  }

  // Usuario rechaza o da otra dirección → flujo estándar
  const newCtx: HandlerContext = {
    ...ctx,
    state: { phase: 'WAITING_ADDRESS', failedAttempts: 0 },
    userMessage: intent.type === 'REJECT_AND_CORRECT' && intent.correction
      ? intent.correction
      : userMessage,
  };
  return handleWaitingAddress(newCtx);
}
```

**Pasar `context` a `processGetAddressJourney()` desde `conversationProcessor()`:**

```typescript
export async function conversationProcessor(job: Job<ProcessConversationJobData>) {
  const { conversationId, orderId, userId, conversationType, context } = job.data;
  // ...
  if (conversationType === 'GET_ADDRESS') {
    return processGetAddressJourney(conversationId, user, order, context);
  }
}
```

---

## Lista de tareas

- [ ] Añadir fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` al tipo `ConversationPhase` en `address.service.ts`
- [ ] Añadir campo `proposedAddress` a `ConversationState` en `address.service.ts`
- [ ] Implementar función `buildAddressProposalMessage()` en `address.service.ts`
- [ ] Modificar `processGetAddressJourney()` para detectar sub-journey 2.1 (cargar direcciones de Prisma)
- [ ] Implementar lógica sub-journey 2.3 en `processGetAddressJourney()` (leer `context.buyerEcommerceAddress`)
- [ ] Implementar `handleAddressProposalConfirm()` en el processor
- [ ] Añadir `WAITING_ADDRESS_PROPOSAL_CONFIRM` al mapa `handlers` en `processResponseProcessor()`
- [ ] Pasar `context` de `job.data` a `processGetAddressJourney()` en `conversationProcessor()`
- [ ] Verificar sub-journey 2.1: seleccionar usuario registrado con dirección en la simulación y confirmar que el agente la propone directamente
- [ ] Verificar sub-journey 2.3: activar toggles de eCommerce en el modal con dirección, confirmar que el agente la propone
- [ ] Verificar sub-journey 2.2: usuario registrado sin direcciones → agente pregunta directamente
- [ ] Verificar sub-journey 2.4: usuario no registrado sin datos eCommerce → agente pregunta directamente
