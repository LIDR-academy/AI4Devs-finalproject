# CU03-B2 — Worker: sub-journeys 2.1 y 2.3 (proponer dirección guardada)

**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU03-B1 completado, CU03-A3 completado (campos `context` disponibles en el job)

---

## Contexto y Problema

En el flujo GET_ADDRESS, el agente IA actualmente pregunta siempre la dirección al usuario, incluso cuando ya la conocemos. Esto genera fricción innecesaria:

1. **Usuarios registrados en Adresles** con direcciones guardadas en su libreta tienen que volver a escribir una dirección que el sistema ya posee.
2. **Usuarios no registrados pero con dirección en el eCommerce** —si la tienda envía `buyer_ecommerce_address` en el checkout— reciben la misma pregunta genérica en lugar de una propuesta directa.

El estado actual del sistema (tras CU03-B1 y CU03-A3) permite:
- Consultar direcciones de Prisma (`Address` con `userId`, `isDefault`, `fullAddress`)
- Recibir `context.buyerRegisteredEcommerce` y `context.buyerEcommerceAddress` en el job `process-conversation`

El cambio consiste en detectar estas dos situaciones y, en lugar de invocar OpenAI para pedir la dirección, **proponer directamente** la dirección conocida y pasar a una nueva fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` donde el usuario puede confirmar o dar otra.

---

## Especificaciones Técnicas

### Backend (Worker)

#### Endpoints y colas

- **Cola `process-conversation`**: Sin cambios en contrato. Ya recibe `context?: MockOrderContext` (definido en `@adresles/shared-types`).
- **Cola `process-response`**: Sin cambios en contrato. El handler para la nueva fase se invoca cuando `state.phase === 'WAITING_ADDRESS_PROPOSAL_CONFIRM'`.

#### Tipos y DTOs

- **`ConversationPhase`** (`address.service.ts`): Añadir literal `'WAITING_ADDRESS_PROPOSAL_CONFIRM'`.
- **`ConversationState`** (`address.service.ts`): Sin nuevos campos. Reutilizar `pendingAddress` para la dirección propuesta en esta fase (misma semántica que en `WAITING_CONFIRMATION`: "dirección pendiente de confirmación").
- **`MockOrderContext.buyerEcommerceAddress`** (`@adresles/shared-types`): Ya definido con `full_address`, `street`, `number`, `postal_code`, `city`, `country`, `floor`, `door`, etc. (snake_case). Sin cambios.
- **Mapeo Adresles → PendingAddress**: Usar `Address.fullAddress` (camelCase, Prisma) y resto de campos del modelo.
- **Mapeo eCommerce → PendingAddress**: Usar `addr.full_address`, `addr.postal_code`, etc. (snake_case del context).

#### Lógica de negocio

**Sub-journey 2.1** (usuario registrado Adresles con dirección guardada):
- Condición: `user.isRegistered === true` Y al menos una `Address` con `userId = user.id` y `isDeleted = false`.
- Consulta Prisma: `prisma.address.findMany({ where: { userId: user.id, isDeleted: false }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }], take: 1 })`.
- Selección: dirección con `isDefault=true` o, si ninguna, la primera por `createdAt`.
- Construcción de `PendingAddress` desde `Address` (fullAddress → gmapsFormatted; street, number, postalCode, city, province, country, block, staircase, floor, door; gmapsPlaceId, latitude, longitude null; couldBeBuilding: false; userConfirmedNoDetails: true).

**Sub-journey 2.3** (usuario no registrado con dirección eCommerce):
- Condición: `user.isRegistered === false` Y `context?.buyerRegisteredEcommerce === true` Y `context.buyerEcommerceAddress` truthy.
- Construcción de `PendingAddress` desde `context.buyerEcommerceAddress` (full_address → gmapsFormatted; street, number, postal_code, city, country, floor, door; province opcional; block, staircase, additionalInfo según existan).

**Función de mensaje**: `buildAddressProposalMessage(pending, storeName, source, language)`:
- `source`: `'adresles'` | `'ecommerce'`.
- Textos diferenciados por fuente (ej. "tu dirección guardada en Adresles" vs "tu dirección registrada en {storeName}").
- Idiomas soportados: Spanish, English (y fallback a Spanish para otros según `getLanguageName`).
- Incluir dirección formateada con `buildAddressDisplayText(pending)`.
- CTA: "Responde 'Sí' para confirmar o indícame otra dirección" / "Reply 'Yes' to confirm or give me a different address".

**Nueva fase `WAITING_ADDRESS_PROPOSAL_CONFIRM`**:
- Handler `handleAddressProposalConfirm`:
  - Si el usuario confirma (intent `CONFIRM` vía `interpretUserIntent`) → `finalizeAddress(ctx, state.pendingAddress!)`.
  - Si rechaza o da otra dirección → transicionar a `WAITING_ADDRESS`; si hay `intent.correction`, usarla como `userMessage` para el flujo estándar.

#### Cambios en DB

- **DynamoDB**: Estado de conversación (`__state__`) incluirá `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress` (dirección propuesta).
- **Supabase/Prisma**: Sin cambios de schema. Solo lecturas (`Address`, `User`, `Order`) y escrituras existentes en `finalizeAddress`.

### Frontend

- **Sin cambios de componentes.** La simulación en `/simulate` (CU03-A4, CU03-A6) y el modal de configuración de pedido (CU03-A5) ya permiten:
  - Seleccionar usuario con `isRegistered=true` y direcciones en libreta.
  - Activar toggles `buyerRegisteredEcommerce` y dirección eCommerce.
- **Verificación manual**: Ejecutar escenarios desde la simulación para validar que el agente propone la dirección correcta en 2.1 y 2.3, y que 2.2/2.4 siguen preguntando directamente.

---

## Arquitectura

| ADR | Relevancia |
|-----|------------|
| **ADR-005** (BullMQ Worker) | El Worker procesa jobs `process-conversation` y `process-response`; la nueva fase se integra en la máquina de estados del processor. |
| **ADR-002** (Supabase + DynamoDB) | Direcciones en Supabase (Prisma); estado de conversación en DynamoDB. |
| **ADR-004** (OpenAI GPT-4) | Solo se usa OpenAI en sub-journeys 2.2/2.4 (pregunta inicial). En 2.1/2.3 se usa `interpretUserIntent` para la respuesta en `WAITING_ADDRESS_PROPOSAL_CONFIRM`. |
| **ADR-007** (shared-types) | `ProcessConversationJobData`, `MockOrderContext` y `buyerEcommerceAddress` ya definidos en `@adresles/shared-types`. |
| **ADR-008/009** (Prisma schema) | Worker usa `@adresles/prisma-db` para `User`, `Order`, `Address`, `Store`. |

---

## Definición de Hecho (DoD)

- [ ] Añadir fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` al tipo `ConversationPhase` en `address.service.ts`.
- [ ] Implementar función `buildAddressProposalMessage(pending, storeName, source, language)` en `address.service.ts`.
- [ ] Modificar `processGetAddressJourney()` para detectar sub-journey 2.1 (cargar direcciones de Prisma con `user.isRegistered` y `include`/filtro adecuados).
- [ ] Implementar lógica sub-journey 2.3 en `processGetAddressJourney()` (leer `context.buyerEcommerceAddress` cuando `!user.isRegistered` y `context?.buyerRegisteredEcommerce`).
- [ ] Implementar `handleAddressProposalConfirm()` en el conversation processor.
- [ ] Añadir `WAITING_ADDRESS_PROPOSAL_CONFIRM` al mapa `handlers` en `processResponseProcessor()`.
- [ ] Pasar `context` de `job.data` a `processGetAddressJourney()` en `conversationProcessor()` (ya existe en firma; verificar que se propaga correctamente).
- [ ] Añadir tests unitarios para `buildAddressProposalMessage()` (Spanish, English, source adresles/ecommerce).
- [ ] Verificar sub-journey 2.1: simulación con usuario registrado y dirección en libreta → agente propone dirección.
- [ ] Verificar sub-journey 2.3: simulación con usuario no registrado, toggles eCommerce activos y dirección → agente propone dirección.
- [ ] Verificar sub-journey 2.2: usuario registrado sin direcciones → agente pregunta directamente.
- [ ] Verificar sub-journey 2.4: usuario no registrado sin datos eCommerce → agente pregunta directamente.

---

## Requisitos No Funcionales

### Seguridad
- No se exponen datos sensibles adicionales. Las direcciones ya fluyen por el sistema (DynamoDB, Redis Pub/Sub).
- El Worker no recibe nuevos parámetros externos; usa contexto ya validado por el API (MockAddressDto con class-validator).

### Rendimiento
- Sub-journey 2.1: una query adicional a Prisma (`findMany` con `take: 1`). Impacto mínimo.
- Sub-journey 2.3: sin consultas extra; datos ya en `job.data.context`.

### Observabilidad
- Mantener logs estructurados en el Worker: `[GET_ADDRESS] Sub-journey 2.1|2.3|2.2|2.4` para trazabilidad.
- Estado visible en DynamoDB (`phase`, `pendingAddress`) para depuración.

---

## Historia de Usuario

**Como** agente Adresles,  
**quiero** proponer al usuario su dirección guardada cuando ya la tengo disponible (ya sea de su libreta Adresles o del eCommerce),  
**para** que el proceso sea más rápido y solo tenga que confirmar en lugar de escribirla de cero.

---

## Descripción funcional detallada

### Sub-journeys y condiciones

| Journey | Condición de activación | Comportamiento del agente |
|---------|-------------------------|---------------------------|
| **2.1** | `user.isRegistered=true` Y tiene al menos una dirección guardada en Adresles | Propone la dirección favorita (`isDefault=true`) o la primera si no hay favorita. El usuario puede confirmar o pedir una diferente. |
| **2.3** | `user.isRegistered=false` Y `context.buyerRegisteredEcommerce=true` Y `context.buyerEcommerceAddress` tiene valor | Propone la dirección del eCommerce recibida en el job. El usuario puede confirmar o dar una diferente. |
| **2.2** | Usuario registrado sin direcciones | Pregunta dirección directamente (flujo existente). |
| **2.4** | Usuario no registrado sin dirección eCommerce | Pregunta dirección directamente (flujo existente). |

### Flujo sub-journey 2.1 (dirección Adresles guardada)

1. Worker carga direcciones del usuario desde Prisma (`Address` donde `userId`, `isDeleted: false`).
2. Selecciona la dirección por defecto (`isDefault=true`) o la primera disponible.
3. Genera mensaje con `buildAddressProposalMessage(proposedPending, storeName, 'adresles', language)`.
4. Estado → `WAITING_ADDRESS_PROPOSAL_CONFIRM` con `pendingAddress` precargado.
5. Guarda mensajes y publica actualización SSE.

### Flujo sub-journey 2.3 (dirección eCommerce)

1. Worker recupera `buyerEcommerceAddress` de `job.data.context`.
2. Genera mensaje equivalente al 2.1 con `source: 'ecommerce'`.
3. Estado → `WAITING_ADDRESS_PROPOSAL_CONFIRM` con `pendingAddress` precargado.

### Handler `WAITING_ADDRESS_PROPOSAL_CONFIRM`

- Si el usuario confirma (`CONFIRM`) → `finalizeAddress(ctx, state.pendingAddress)` (salta extracción y GMaps).
- Si rechaza o da otra dirección → transiciona a `WAITING_ADDRESS`; si hay corrección en el intent, la pasa como `userMessage` al handler estándar.

---

## Detalle de implementación (referencia)

### `apps/worker/src/services/address.service.ts`

```typescript
export type ConversationPhase =
  | 'WAITING_ADDRESS'
  | 'WAITING_ADDRESS_PROPOSAL_CONFIRM'   // NUEVO
  | 'WAITING_DISAMBIGUATION'
  | 'WAITING_BUILDING_DETAILS'
  | 'WAITING_CONFIRMATION';

export interface ConversationState {
  phase: ConversationPhase;
  pendingAddress?: PendingAddress;   // Reutilizado en WAITING_ADDRESS_PROPOSAL_CONFIRM para la dirección propuesta
  gmapsOptions?: GmapsResult[];
  failedAttempts?: number;
}

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

- Extender `processGetAddressJourney` para recibir `context?: MockOrderContext`.
- Añadir ramas condicionales para 2.1 y 2.3 antes del flujo por defecto 2.2/2.4; en ambas, guardar estado con `pendingAddress: proposedPending` (no `proposedAddress`).
- Añadir `handleAddressProposalConfirm`: usar `state.pendingAddress!` para obtener la dirección propuesta; si confirma → `finalizeAddress(ctx, state.pendingAddress!)`.
- Registrarlo en `handlers` y pasar `context` desde `conversationProcessor` a `processGetAddressJourney`.
