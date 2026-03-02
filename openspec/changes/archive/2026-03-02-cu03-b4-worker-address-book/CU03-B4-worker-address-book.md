# CU03-B4 — Worker: Ofrecer guardar dirección en la libreta de Adresles

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-B3 completado (flujo de registro voluntario implementado)

---

## Contexto y Problema

Tras confirmar la dirección de entrega, el sistema actual cierra la conversación sin ofrecer al usuario la posibilidad de guardarla en su libreta de Adresles. Esto impide que usuarios registrados (o recién registrados) puedan beneficiarse de la confirmación automática en futuras compras.

**Estado actual del sistema**:
- `finalizeAddress()` para usuarios registrados: cierra directamente con `COMPLETED` sin ofrecer guardar.
- `handleWaitingRegisterEmail()`: tras registro exitoso, transiciona a `WAITING_SAVE_ADDRESS` con un handler temporal que cierra la conversación sin ofrecer guardar.
- La fase `WAITING_SAVE_ADDRESS` y el tipo `ConversationPhase` ya existen (CU03-B3); falta implementar la lógica real de oferta y persistencia en la tabla `Address`.

**Objetivo**: Extender el journey GET_ADDRESS para ofrecer guardar la dirección confirmada en la libreta del usuario cuando corresponda, creando registros en `prisma.address` y cerrando la conversación de forma coherente con ADR-006 (SSE).

---

## Historia de Usuario

**Como** agente Adresles,  
**quiero** preguntar al usuario (registrado o recién registrado) si quiere guardar la dirección de entrega usada en su libreta de Adresles,  
**para** que en futuras compras pueda beneficiarse de la confirmación automática con esa dirección.

---

## Descripción Funcional

### Cuándo se ofrece guardar la dirección

| Situación | ¿Se ofrece guardar? |
|-----------|---------------------|
| Usuario registrado, dirección usada es nueva (no está en su libreta) | Sí |
| Usuario registrado, dirección usada es una ya guardada (sub-journey 2.1) | No (ya la tiene) |
| Usuario no registrado que acaba de registrarse (CU03-B3) | Sí (justo después del registro) |
| Usuario no registrado que rechaza el registro | No |

### Mensaje de oferta de guardar dirección

```
¿Te gustaría guardar esta dirección en tu libreta de Adresles para usarla en el futuro?

**Calle Atocha 34, 2º B, 28012 Madrid**

(responde "Sí" o "No")
```

### Paso adicional: solicitar alias de la dirección

Cuando el usuario confirma que quiere guardar, **antes** de persistir la dirección se debe preguntar el alias con el que guardarla (p. ej. "Casa", "Trabajo"). Este valor se usa en el campo `label` de la tabla `Address`.

```
¿Cómo quieres llamar a esta dirección? (ej: Casa, Trabajo)

[El usuario responde con el nombre que prefiere]
```

Si el usuario no proporciona un alias válido (mensaje vacío o solo espacios tras trim), se usará el valor por defecto `'Mi dirección'`.

### Posición en el flujo

```
Conversación con usuario YA registrado:
  finalizeAddress()
    → Si usó dirección nueva → offerSaveAddress() → WAITING_SAVE_ADDRESS
      → Usuario responde Sí → pedir alias → WAITING_SAVE_ADDRESS_LABEL
      → Usuario responde No → closeConversation() → COMPLETED
    → Si usó dirección guardada (sub-journey 2.1) → closeConversation() → COMPLETED

Conversación con usuario NO registrado:
  finalizeAddress()
    → WAITING_REGISTER (CU03-B3)
      → Si acepta registro → handleWaitingRegisterEmail → offerSaveAddress() → WAITING_SAVE_ADDRESS
        → Usuario responde Sí → pedir alias → WAITING_SAVE_ADDRESS_LABEL
        → Usuario responde No → closeConversation() → COMPLETED
      → Si rechaza registro → closeConversation() → COMPLETED

WAITING_SAVE_ADDRESS_LABEL:
  → Usuario proporciona alias → crear Address con label = alias (o "Mi dirección" si vacío) → closeConversation() → COMPLETED
```

### Detección de "dirección nueva"

Una dirección se considera nueva si no coincide con ninguna de las ya guardadas en la libreta del usuario. La comparación se hace por `fullAddress` normalizado (trim + lowercase):

```typescript
const isNewAddress = !existingAddresses.some(
  (a) => a.fullAddress.trim().toLowerCase() === confirmedAddress.gmapsFormatted.trim().toLowerCase()
);
```

---

## Especificaciones Técnicas

### Backend (Worker)

Este change es exclusivamente Worker; no hay endpoints REST nuevos ni DTOs de API. La lógica reside en `apps/worker`.

#### 1. `apps/worker/src/services/address.service.ts`

**Funciones de mensaje a implementar** (bilingüe ES/EN):

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

export function buildSaveAddressLabelRequestMessage(language: string): string {
  if (language === 'English') {
    return `What would you like to call this address? (e.g. Home, Work)`;
  }
  return `¿Cómo quieres llamar a esta dirección? (ej: Casa, Trabajo)`;
}
```

**Nueva fase en `ConversationPhase`**:

```typescript
export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_ADDRESS_PROPOSAL_CONFIRM'
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION'
  | 'WAITING_REGISTER'
  | 'WAITING_REGISTER_EMAIL'
  | 'WAITING_SAVE_ADDRESS'
  | 'WAITING_SAVE_ADDRESS_LABEL';   // NUEVO — para solicitar alias antes de persistir
```

#### 2. `apps/worker/src/processors/conversation.processor.ts`

**Función `offerSaveAddress()`** — encapsula el ofrecimiento y la transición:

```typescript
async function offerSaveAddress(
  ctx: HandlerContext,
  confirmedAddress: PendingAddress,
) {
  const { conversationId, userId, language } = ctx;

  const existingAddresses = await prisma.address.findMany({
    where: { userId, isDeleted: false },
  });
  const isNewAddress = !existingAddresses.some(
    (a) => a.fullAddress.trim().toLowerCase() ===
           confirmedAddress.gmapsFormatted.trim().toLowerCase(),
  );

  if (!isNewAddress) {
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
  await publishConversationComplete(conversationId, 'COMPLETED');
  return { conversationId, status: 'completed' };
}
```

**Handler `handleWaitingSaveAddress()`** — reemplaza el temporal de B3:

```typescript
async function handleWaitingSaveAddress(ctx: HandlerContext) {
  const { conversationId, userMessage, state, language } = ctx;

  const intent = await interpretUserIntent('WAITING_CONFIRMATION', userMessage, language);

  if (intent.type === 'CONFIRM') {
    // Pedir alias antes de guardar
    const msg = buildSaveAddressLabelRequestMessage(language);
    await saveMessage(conversationId, 'assistant', msg);
    await publishConversationUpdate(conversationId, 'assistant', msg);
    await saveConversationState(conversationId, {
      phase: 'WAITING_SAVE_ADDRESS_LABEL',
      confirmedAddress: state.confirmedAddress,
    });
    return { conversationId, status: 'waiting_save_address_label' };
  }

  const msg = buildAddressNotSavedMessage(language);
  await saveMessage(conversationId, 'assistant', msg);
  await publishConversationUpdate(conversationId, 'assistant', msg);
  return closeConversation(ctx);
}
```

**Handler `handleWaitingSaveAddressLabel()`** — recibe el alias y persiste la dirección:

```typescript
function sanitizeAddressLabel(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'Mi dirección';
  return trimmed.slice(0, 80); // límite razonable para el campo label
}

async function handleWaitingSaveAddressLabel(ctx: HandlerContext) {
  const { conversationId, userId, userMessage, state, language } = ctx;
  const confirmedAddress = state.confirmedAddress!;

  const label = sanitizeAddressLabel(userMessage);

  await prisma.address.create({
    data: {
      userId,
      label,
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
  return closeConversation(ctx);
}
```

**Añadir al mapa `handlers`**:

```typescript
WAITING_SAVE_ADDRESS: handleWaitingSaveAddress,
WAITING_SAVE_ADDRESS_LABEL: handleWaitingSaveAddressLabel,
```

**Modificaciones en `finalizeAddress()`**:

Reemplazar el bloque de cierre para usuarios registrados:

```typescript
if (user.isRegistered) {
  return offerSaveAddress(ctx, pending);
}
```

**Modificaciones en `handleWaitingRegisterEmail()`**:

Tras registro exitoso, en lugar de solo transicionar a `WAITING_SAVE_ADDRESS`, llamar a `offerSaveAddress()` para enviar el mensaje de oferta y guardar el estado:

```typescript
if (email) {
  await prisma.user.update({ ... });
  const msg = buildRegistrationSuccessMessage(language);
  await saveMessage(...);
  await publishConversationUpdate(...);
  return offerSaveAddress({ ...ctx, state: { ...state, confirmedAddress } }, confirmedAddress);
}
```

**Imports a añadir** en el processor:

```typescript
import {
  // ... existentes
  buildSaveAddressOfferMessage,
  buildSaveAddressLabelRequestMessage,
  buildAddressSavedMessage,
  buildAddressNotSavedMessage,
} from '../services/address.service';
```

#### 3. Cambios en base de datos

- **Tabla `Address`** (ya existe en Prisma): se crean nuevos registros con `prisma.address.create()`.
- Campos usados: `userId`, `label`, `fullAddress`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country`, `isDefault`.
- No se requieren migraciones; el schema ya soporta estos campos.

### Frontend

No aplica. Este change es exclusivamente Worker.

---

## Arquitectura

| ADR | Relevancia |
|-----|------------|
| **ADR-005** (BullMQ Worker) | Extensión de la máquina de estados del processor; fases `WAITING_SAVE_ADDRESS` y `WAITING_SAVE_ADDRESS_LABEL` con handlers reales. |
| **ADR-006** (SSE + Redis Pub/Sub) | `publishConversationUpdate` y `publishConversationComplete` en cada mensaje y cierre. |
| **ADR-008** (Worker → Prisma API schema) | Worker usa `prisma.address` y `prisma.conversation` del schema compartido. |
| **ADR-009** (packages/prisma-db) | Schema en `packages/prisma-db`; Worker importa `@adresles/prisma-db`. |

---

## Definición de Hecho (DoD)

### Implementación

- [ ] Implementar `buildSaveAddressOfferMessage()`, `buildSaveAddressLabelRequestMessage()`, `buildAddressSavedMessage()`, `buildAddressNotSavedMessage()` en `address.service.ts`
- [ ] Añadir fase `WAITING_SAVE_ADDRESS_LABEL` al tipo `ConversationPhase` en `address.service.ts`
- [ ] Implementar función `offerSaveAddress()` en el processor (detección de dirección nueva + transición a WAITING_SAVE_ADDRESS)
- [ ] Implementar función `closeConversation()` como helper compartido para cerrar la conversación con COMPLETED + SSE
- [ ] Reemplazar handler temporal `handleWaitingSaveAddress()`: si CONFIRM → pedir alias y transicionar a WAITING_SAVE_ADDRESS_LABEL; si rechaza → close
- [ ] Implementar handler `handleWaitingSaveAddressLabel()`: extraer alias del mensaje, sanitizar (`sanitizeAddressLabel`), crear `Address` con `label` = alias (o `'Mi dirección'` si vacío), cerrar
- [ ] Modificar `finalizeAddress()` para usuarios ya registrados: llamar a `offerSaveAddress()` en lugar de cerrar directamente
- [ ] Modificar `handleWaitingRegisterEmail()`: tras registro exitoso, llamar a `offerSaveAddress()` en lugar de solo `saveConversationState(WAITING_SAVE_ADDRESS)`
- [ ] Añadir `WAITING_SAVE_ADDRESS_LABEL` al mapa `handlers`
- [ ] Añadir imports de las nuevas funciones en el processor

### Tests unitarios

- [ ] `address.service.spec.ts`: tests para `buildSaveAddressOfferMessage`, `buildSaveAddressLabelRequestMessage`, `buildAddressSavedMessage`, `buildAddressNotSavedMessage` (ES/EN)
- [ ] `conversation.processor.spec.ts`: tests para `offerSaveAddress` (dirección nueva vs ya guardada), `handleWaitingSaveAddress` (CONFIRM pide alias y transiciona a WAITING_SAVE_ADDRESS_LABEL, REJECT cierra), `handleWaitingSaveAddressLabel` (crea Address con label del usuario; con mensaje vacío usa `'Mi dirección'`), integración con `finalizeAddress` y `handleWaitingRegisterEmail`
- [ ] Usar mocks de Prisma/Redis/DynamoDB según [worker-testing-patterns.md](../../memory-bank/patterns/worker-testing-patterns.md) para evitar open handles

### Verificación manual / escenarios

- [ ] Usuario registrado + sub-journey 2.1 (dirección ya guardada) → no ofrece guardar, cierra directamente
- [ ] Usuario registrado + dirección nueva → ofrece guardar → acepta → pide alias → usuario responde "Casa" → `Address` creada con `label: 'Casa'`
- [ ] Usuario registrado + dirección nueva → ofrece guardar → acepta → pide alias → usuario responde vacío/espacios → `Address` creada con `label: 'Mi dirección'`
- [ ] Usuario registrado + dirección nueva → ofrece guardar → rechaza → cierra sin crear Address
- [ ] Usuario recién registrado (CU03-B3) → ofrece guardar → acepta → pide alias → usuario responde "Trabajo" → `Address` creada con `label: 'Trabajo'`

### Documentación

- [ ] Actualizar `openspec/specs/mock-conversations/spec.md` con requirements para el flujo de libreta (offerSaveAddress, handleWaitingSaveAddress, handleWaitingSaveAddressLabel, pedido de alias, closeConversation)
- [ ] Registrar sesión en `memory-bank/sessions/` al completar

---

## Requisitos No Funcionales

### Seguridad

- La creación de `Address` se realiza con `userId` del contexto de la conversación (ya validado por el job BullMQ).
- No se exponen datos sensibles en logs; evitar loguear direcciones completas.

### Rendimiento

- `prisma.address.findMany` con `where: { userId, isDeleted: false }` — índice por `userId` recomendado.
- Una única operación `prisma.address.create` por aceptación; sin N+1.

### Observabilidad

- Logs estructurados en transiciones clave: `[PROCESS_RESPONSE] offerSaveAddress: new address offered`, `[PROCESS_RESPONSE] handleWaitingSaveAddress: asking for label`, `[PROCESS_RESPONSE] handleWaitingSaveAddressLabel: address saved` / `address not saved`.
- Mantener coherencia con el patrón de logs existente en el processor.

---

## Notas de Implementación

- La fase `WAITING_SAVE_ADDRESS` ya existe (CU03-B3); B4 añade `WAITING_SAVE_ADDRESS_LABEL` para solicitar el alias antes de persistir.
- El handler actual de `handleWaitingSaveAddress` es temporal (cierra sin ofrecer); B4 lo reemplaza por la lógica completa (pedir alias en CONFIRM, transicionar a `WAITING_SAVE_ADDRESS_LABEL`).
- `interpretUserIntent('WAITING_CONFIRMATION', ...)` interpreta Sí/No correctamente (CONFIRM = Sí, REJECT/UNKNOWN = No).
- El campo `label` de `Address` se rellena con el alias proporcionado por el usuario; si está vacío tras sanitizar, usar `'Mi dirección'`.
- El modelo `Address` en Prisma usa `isDeleted: false` para direcciones activas; la consulta en `offerSaveAddress` debe filtrar por `isDeleted: false` si el schema lo soporta.
