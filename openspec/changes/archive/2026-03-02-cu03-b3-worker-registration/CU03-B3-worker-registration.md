# CU03-B3 — Worker: flujo de registro voluntario al final de la conversación

**ID**: CU03-B3  
**App**: `apps/worker` (BullMQ Worker)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Última actualización**: 2026-03-02 (enriquecido)

---

## Contexto y Problema

Tras completar CU03-B1 (DB sync) y CU03-B2 (sub-journeys de propuesta de dirección), el flujo GET_ADDRESS confirma la dirección, crea OrderAddress, actualiza Order a `READY_TO_PROCESS` y cierra la conversación emitiendo SSE `conversation:complete`. Sin embargo, el **Journey 3** (usuario no registrado) requiere ofrecer el registro en Adresles al final del proceso para que en futuras compras el usuario pueda beneficiarse de la confirmación automática con su dirección guardada.

**Estado actual**: `finalizeAddress()` trata igual a usuarios registrados y no registrados — cierra la conversación tras confirmar la dirección.

**Problema**: Los usuarios no registrados no tienen oportunidad de registrarse en Adresles tras una compra exitosa, perdiendo conversión y adopción de la libreta de direcciones.

**Objetivo**: Si `user.isRegistered === false`, tras confirmar y sincronizar la dirección, el agente debe ofrecer el registro voluntario. La conversación solo se marca `COMPLETED` y emite `conversation:complete` después de que el usuario responda (acepte o rechace). Si acepta, se pide el email (no viene del contexto), se guarda el usuario como registrado con ese correo, se envía mensaje de confirmación agradeciendo la confianza, y se deja preparado para CU03-B4 (ofrecer guardar la dirección en la libreta). Si rechaza, se cierra con mensaje de despedida.

---

## Especificaciones Técnicas

### Backend (Worker exclusivamente)

**Scope**: No hay endpoints REST nuevos ni DTOs. Todo el cambio reside en `apps/worker`.

#### 1. `address.service.ts` — Tipos y mensajes

| Cambio | Descripción |
|--------|-------------|
| **ConversationPhase** | Añadir `'WAITING_REGISTER'` y `'WAITING_REGISTER_EMAIL'` al union type |
| **ConversationState** | Añadir campo opcional `confirmedAddress?: PendingAddress` (dirección ya confirmada, para pasarla a CU03-B4) |
| **buildRegistrationOfferMessage(language)** | Retorna mensaje bilingüe (ES/EN) ofreciendo registro gratuito y CTA "responde Sí o No" |
| **buildRegistrationEmailRequestMessage(language)** | Retorna mensaje pidiendo el email para completar el registro |
| **buildRegistrationSuccessMessage(language)** | Retorna mensaje de confirmación tras registro, agradeciendo la confianza en Adresles |
| **buildRegistrationDeclinedMessage(language)** | Retorna mensaje de despedida cuando el usuario rechaza |
| **extractEmailFromMessage(message)** | Extrae/valida email del mensaje del usuario (regex o OpenAI). Retorna `string \| null` |

**Mensaje de oferta (español)**:
```
¡Todo listo! Por cierto, ¿sabías que puedes registrarte en Adresles de forma gratuita?
Así, en tu próxima compra confirmaré tu dirección automáticamente sin que tengas que
escribirla de nuevo. ¿Te gustaría registrarte ahora? (responde 'Sí' o 'No')
```

**Mensaje pidiendo email (español)**:
```
Para completar tu registro, indícame tu correo electrónico.
```

**Mensaje de confirmación tras registro (español)**:
```
¡Perfecto! Ya estás registrado en Adresles. ¡Gracias por confiar en nosotros!
```
*(CU03-B4 añadirá a continuación el ofrecimiento de guardar la dirección en la libreta.)*

#### 2. `conversation.processor.ts` — Lógica de negocio

**Modificar `finalizeAddress()`** — Bifurcación según `user.isRegistered`:

| Rama | Condición | Acciones |
|------|-----------|----------|
| **Usuario registrado** | `user.isRegistered === true` | Mensaje confirmación → `Conversation.status = 'COMPLETED'` → `publishConversationComplete` → retorno |
| **Usuario no registrado** | `user.isRegistered === false` | Mensaje confirmación → Mensaje oferta registro → `saveConversationState({ phase: 'WAITING_REGISTER', confirmedAddress: pending })` → **no** marcar COMPLETED ni publicar complete |

**Nota**: `HandlerContext` debe incluir `user.isRegistered`. Verificar que `prisma.user.findUnique` en `processResponseProcessor` y `processGetAddressJourney` cargue el campo (ya existe en schema).

**Nuevo handler `handleWaitingRegister()`**:

| Caso | Intent (`interpretUserIntent('WAITING_CONFIRMATION', ...)`) | Acciones |
|------|------------------------------------------------------------|----------|
| **Acepta** | `CONFIRM` | Mensaje pidiendo email (`buildRegistrationEmailRequestMessage`) → `saveConversationState({ phase: 'WAITING_REGISTER_EMAIL', confirmedAddress })` → return |
| **Rechaza** | `REJECT` o `UNKNOWN` tratado como rechazo | Mensaje despedida → COMPLETED + SSE complete |

**Nuevo handler `handleWaitingRegisterEmail()`**:

| Caso | Condición | Acciones |
|------|-----------|----------|
| **Email válido** | `extractEmailFromMessage(userMessage)` retorna email | `prisma.user.update({ isRegistered: true, registeredAt: now, email })` → mensaje confirmación (agradeciendo la confianza) → `saveConversationState({ phase: 'WAITING_SAVE_ADDRESS', confirmedAddress })` → return. *(CU03-B4 implementará el handler de `WAITING_SAVE_ADDRESS`)* |
| **Email inválido** | `extractEmailFromMessage` retorna `null` | Reenviar mensaje pidiendo email (repetir `buildRegistrationEmailRequestMessage`) → mantener fase `WAITING_REGISTER_EMAIL` |

**Mapeo de handlers**:
```typescript
handlers = {
  ...
  WAITING_REGISTER: handleWaitingRegister,
  WAITING_REGISTER_EMAIL: handleWaitingRegisterEmail,
};
```

#### 3. Base de datos

| Modelo | Operación | Campos |
|--------|-----------|--------|
| **User** | `update` (cuando el usuario proporciona email válido) | `isRegistered: true`, `registeredAt: now`, `email: <indicado vía chat>` |
| **Conversation** | `update` (al cerrar) | `status: 'COMPLETED'`, `completedAt: now` |

Sin cambios en schema Prisma — los campos `isRegistered`, `registeredAt` y `email` ya existen en el modelo `User`.

---

### Frontend

**No aplica**. Este change es exclusivamente backend (Worker). El chat de simulación (`/simulate`) ya consume SSE y mostrará los mensajes del agente sin cambios. Los mensajes adicionales (oferta de registro, éxito, despedida) se renderizan como cualquier otro mensaje `assistant`.

---

## Arquitectura

| ADR | Relevancia |
|-----|------------|
| **ADR-005** (BullMQ Worker) | Extensión de la máquina de estados del journey GET_ADDRESS. Nueva fase `WAITING_REGISTER` y handler en la cola `process-response`. |
| **ADR-006** (SSE + Redis Pub/Sub) | `publishConversationUpdate` y `publishConversationComplete` ya usados. El evento `conversation:complete` se emite solo tras la respuesta del usuario (aceptar/rechazar registro). |
| **ADR-008/009** (Prisma) | El Worker usa `@adresles/prisma-db`. `User.isRegistered` y `User.registeredAt` existen en el schema. |

---

## Flujo de datos (diagrama)

**Orden previo (común a ambas ramas)**: La dirección se confirma y sincroniza *antes* de revisar el registro: `simulateEcommerceSync` (tienda) → `OrderAddress.create` + `Order.update` (Adresles) → mensaje de confirmación. Solo después se bifurca según `user.isRegistered`.

```
finalizeAddress()
  ├─ user.isRegistered === true
  │    → Mensaje confirmación
  │    → Conversation.status = COMPLETED
  │    → publishConversationComplete
  │    → (CU03-B4 puede añadir ofrecimiento de guardar dirección aquí)
  │
  └─ user.isRegistered === false
       → Mensaje confirmación (saveMessage + publishConversationUpdate)
       → Mensaje oferta registro (saveMessage + publishConversationUpdate)
       → saveConversationState({ phase: 'WAITING_REGISTER', confirmedAddress: pending })
       → return { status: 'waiting_register' }
       → [Usuario responde → job process-response → handleWaitingRegister]
```

**Flujo cuando el usuario acepta registrarse (handleWaitingRegister → handleWaitingRegisterEmail)**:

```
handleWaitingRegister — usuario responde "Sí"
  → Mensaje pidiendo email (buildRegistrationEmailRequestMessage)
  → saveConversationState({ phase: 'WAITING_REGISTER_EMAIL', confirmedAddress })
  → [Usuario indica email vía chat → job process-response → handleWaitingRegisterEmail]

handleWaitingRegisterEmail — usuario indica email
  → extractEmailFromMessage(userMessage)
  ├─ Email válido:
  │    → prisma.user.update({ isRegistered: true, registeredAt: now, email })
  │    → Mensaje confirmación (agradeciendo la confianza en Adresles)
  │    → saveConversationState({ phase: 'WAITING_SAVE_ADDRESS', confirmedAddress })
  │    → [CU03-B4: handleWaitingSaveAddress ofrecerá guardar en libreta]
  │
  └─ Email inválido:
       → Reenviar mensaje pidiendo email
       → Mantener WAITING_REGISTER_EMAIL
```

**Nota sobre `confirmedAddress`**: `pending` es el parámetro de `finalizeAddress` que en este punto ya representa la dirección confirmada y sincronizada. Se guarda como `confirmedAddress` en el estado para que, tras el registro con email, CU03-B4 pueda ofrecer guardarla en la libreta del usuario.

---

## Definición de Hecho (DoD)

- [ ] Añadir fases `WAITING_REGISTER` y `WAITING_REGISTER_EMAIL` al tipo `ConversationPhase` en `address.service.ts`
- [ ] Añadir campo `confirmedAddress` a `ConversationState` en `address.service.ts`
- [ ] Implementar `buildRegistrationOfferMessage`, `buildRegistrationEmailRequestMessage`, `buildRegistrationSuccessMessage`, `buildRegistrationDeclinedMessage` en `address.service.ts`
- [ ] Implementar `extractEmailFromMessage(message)` (regex o OpenAI) en `address.service.ts`
- [ ] Modificar `finalizeAddress()`: bifurcar según `user.isRegistered` (ofrecer registro si no registrado, cerrar directamente si ya registrado)
- [ ] Implementar `handleWaitingRegister()`: CONFIRM → pedir email y transicionar a `WAITING_REGISTER_EMAIL`; rechaza → mensaje despedida + COMPLETED + SSE complete
- [ ] Implementar `handleWaitingRegisterEmail()`: email válido → actualizar User (isRegistered, registeredAt, email) → mensaje confirmación → transicionar a `WAITING_SAVE_ADDRESS`; email inválido → re-pedir email
- [ ] Añadir `WAITING_REGISTER` y `WAITING_REGISTER_EMAIL` al mapa `handlers` en `processResponseProcessor()`
- [ ] Asegurar que `HandlerContext.user` incluya `isRegistered` (incluir en el `findUnique` de Prisma)
- [ ] Tests unitarios: mensajes de registro (ES/EN) y `extractEmailFromMessage`
- [ ] Tests unitarios/integración: `finalizeAddress` con usuario no registrado → no marca COMPLETED; con usuario registrado → marca COMPLETED
- [ ] Tests: `handleWaitingRegister` acepta → pide email; rechaza → conversación cerrada
- [ ] Tests: `handleWaitingRegisterEmail` email válido → User actualizado + transición a WAITING_SAVE_ADDRESS; email inválido → re-pide
- [ ] Actualizar `openspec/specs/mock-conversations/spec.md` con requirements de WAITING_REGISTER, WAITING_REGISTER_EMAIL y flujo de registro con email

---

## Requisitos No Funcionales

### Seguridad
- Sin exposición de datos sensibles. Los mensajes son texto plano informativo.
- La actualización de `User` (isRegistered, email) solo ocurre cuando el usuario responde "Sí" a la oferta, indica su email vía chat y este se valida correctamente.

### Rendimiento
- Una operación `prisma.user.update` adicional en el camino de aceptación. Latencia despreciable.
- El estado `confirmedAddress` en DynamoDB tiene tamaño acotado (objeto PendingAddress ~500 bytes).

### Observabilidad
- Mantener `console.log` existentes en el processor para fase y transiciones.
- Considerar log al registrar usuario: `[PROCESS_RESPONSE] User ${userId} registered in Adresles`.

### Compatibilidad
- **CU03-B4** (libreta direcciones): Tras completar el registro con email, B3 transiciona a `WAITING_SAVE_ADDRESS` con `confirmedAddress` en el estado. CU03-B4 implementará el handler `handleWaitingSaveAddress` que ofrecerá guardar la dirección en la libreta del usuario. *Si B4 no está implementado al desplegar B3, puede añadirse un handler temporal para `WAITING_SAVE_ADDRESS` que cierre la conversación tras el mensaje de confirmación.*

---

## Prerrequisitos

- **CU03-B1** completado: `finalizeAddress()` actualiza Order a `READY_TO_PROCESS` con `syncedAt` y `statusSource`, crea OrderAddress, marca Conversation COMPLETED y emite SSE complete.
- **CU03-B2** completado: Sub-journeys 2.1 y 2.3 (propuesta de dirección Adresles/eCommerce), fase `WAITING_ADDRESS_PROPOSAL_CONFIRM`.

---

## Referencias

- [memory-bank/README.md](../../../memory-bank/README.md) — Contexto del proyecto
- [memory-bank/sessions/2026-03-02-cu03-b2-worker-address-proposals.md](../../../memory-bank/sessions/2026-03-02-cu03-b2-worker-address-proposals.md) — Estado actual del Worker
- [openspec/specs/mock-conversations/spec.md](../../../openspec/specs/mock-conversations/spec.md) — Spec de conversaciones mock
- [memory-bank/patterns/real-time-sse-patterns.md](../../../memory-bank/patterns/real-time-sse-patterns.md) — Patrón Redis Pub/Sub
