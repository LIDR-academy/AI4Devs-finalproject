# Sesión 2026-03-02: CU03-B3 — Worker: Flujo de registro voluntario post-confirmación — Completado

> **Change**: `cu03-b3-worker-registration`  
> **Estado**: ✅ Completado y verificado (27/27 tareas)

## Resumen

Extensión del journey GET_ADDRESS para ofrecer registro voluntario a usuarios no registrados tras confirmar la dirección. El agente pide el email vía chat, actualiza el User en la BBDD y deja preparado el estado para CU03-B4 (ofrecer guardar la dirección en la libreta).

**Flujo implementado:**
- `finalizeAddress()` bifurca según `user.isRegistered`: si no registrado → oferta de registro, fase `WAITING_REGISTER`
- `handleWaitingRegister`: acepta → pide email; rechaza → mensaje despedida + COMPLETED + SSE
- `handleWaitingRegisterEmail`: email válido → `prisma.user.update` (isRegistered, registeredAt, email) → transición a `WAITING_SAVE_ADDRESS`; inválido → re-pide
- Handler temporal `handleWaitingSaveAddress` para despliegue independiente de B3 (CIERRE antes de B4)

---

## Completado

### address.service.ts

- Fases `WAITING_REGISTER`, `WAITING_REGISTER_EMAIL`, `WAITING_SAVE_ADDRESS` en `ConversationPhase`
- Campo `confirmedAddress?: PendingAddress` en `ConversationState`
- Funciones: `buildRegistrationOfferMessage`, `buildRegistrationEmailRequestMessage`, `buildRegistrationSuccessMessage`, `buildRegistrationDeclinedMessage`
- `extractEmailFromMessage(message)` con regex (RFC 5322 simplificado, max 254 chars)

### conversation.processor.ts

- Bifurcación en `finalizeAddress()`: `!user.isRegistered` → oferta registro, `saveConversationState(WAITING_REGISTER, confirmedAddress)`
- Handlers: `handleWaitingRegister`, `handleWaitingRegisterEmail`, `handleWaitingSaveAddress` (temporal)

### Tests

- `address.service.spec.ts`: 13 tests para mensajes de registro y `extractEmailFromMessage`
- `conversation.processor.spec.ts`: exports, fases; mocks de Prisma/Redis/DynamoDB para evitar open handles
- 27 tests totales en Worker pasando

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Regex para email** (no OpenAI) | Cubre la mayoría de casos sin latencia ni coste; mejora iterativa si hay fallos |
| **Handler temporal WAITING_SAVE_ADDRESS** | Permite desplegar B3 sin B4; B4 reemplazará al implementarse |
| **Mock Prisma/Redis/DynamoDB en processor spec** | Evita "worker process failed to exit gracefully"; conexiones no se crean |

---

## ADRs / Patrones

- **ADR-005** (BullMQ Worker): Extensión de la máquina de estados
- **ADR-006** (SSE): `publishConversationUpdate`, `publishConversationComplete`
- No se creó ADR nuevo
- **Patrón nuevo**: [worker-testing-patterns.md](../patterns/worker-testing-patterns.md) — mock de Prisma/Redis/DynamoDB para specs del processor

---

## Archivos Creados/Modificados

```
apps/worker/src/services/
├── address.service.ts           # WAITING_REGISTER*, confirmedAddress, buildRegistration*, extractEmailFromMessage
└── address.service.spec.ts      # +13 tests registro y email

apps/worker/src/processors/
├── conversation.processor.ts    # finalizeAddress bifurcación, handleWaitingRegister*, handlers
└── conversation.processor.spec.ts  # Nuevo: exports, fases, mocks para open handles

openspec/specs/mock-conversations/spec.md  # Requirements ADDED/MODIFIED
memory-bank/patterns/worker-testing-patterns.md  # Nuevo
```

---

**Duración estimada**: 1 sesión (artefactos + implementación + fix open handles)
