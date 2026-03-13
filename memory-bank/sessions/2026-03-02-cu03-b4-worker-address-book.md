# Sesión 2026-03-02: CU03-B4 — Worker: Libreta de direcciones — Completado

> **Change**: `cu03-b4-worker-address-book`  
> **Estado**: ✅ Completado (25/25 tareas)

## Resumen

Extensión del journey GET_ADDRESS para ofrecer guardar la dirección confirmada en la libreta de Adresles. Reemplaza el handler temporal de `WAITING_SAVE_ADDRESS` (B3) por la lógica completa: oferta, pedido de alias y persistencia en `prisma.address`.

**Flujo implementado:**
- `finalizeAddress()` para usuarios registrados: llama a `offerSaveAddress()` en lugar de cerrar directamente
- `handleWaitingRegisterEmail()`: tras registro exitoso, llama a `offerSaveAddress()` en lugar de solo `saveConversationState`
- `offerSaveAddress()`: detecta dirección nueva (compare fullAddress normalizado) → ofrece; si ya en libreta → `closeConversation()`
- `handleWaitingSaveAddress`: CONFIRM → pide alias → WAITING_SAVE_ADDRESS_LABEL; REJECT → mensaje despedida + close
- `handleWaitingSaveAddressLabel`: alias del usuario → `sanitizeAddressLabel` → `prisma.address.create` con label → close

---

## Completado

### address.service.ts

- Fase `WAITING_SAVE_ADDRESS_LABEL` en `ConversationPhase`
- Funciones: `buildSaveAddressOfferMessage`, `buildSaveAddressLabelRequestMessage`, `buildAddressSavedMessage`, `buildAddressNotSavedMessage`

### conversation.processor.ts

- `closeConversation(ctx)` — helper compartido
- `offerSaveAddress(ctx, confirmedAddress)` — detección dirección nueva, oferta, transición
- `sanitizeAddressLabel(input)` — trim, fallback 'Mi dirección', slice 80 chars
- Handler real `handleWaitingSaveAddress` (reemplaza temporal de B3)
- Handler `handleWaitingSaveAddressLabel`
- Modificaciones: `finalizeAddress()` (user registrado → offerSaveAddress), `handleWaitingRegisterEmail()` (email válido → offerSaveAddress)

### Tests

- `address.service.spec.ts`: +8 tests para mensajes libreta (buildSaveAddressOfferMessage, buildSaveAddressLabelRequestMessage, buildAddressSavedMessage, buildAddressNotSavedMessage)
- `conversation.processor.spec.ts`: mock `interpretUserIntent` para evitar OpenAI; tests WAITING_SAVE_ADDRESS (CONFIRM/REJECT), WAITING_SAVE_ADDRESS_LABEL (alias/vacío/largo 80 chars); offerSaveAddress "dirección ya en libreta"; address.create en mock Prisma; mockClear para aislamiento
- 40 tests totales en Worker pasando

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Nueva fase WAITING_SAVE_ADDRESS_LABEL** | Pedir alias antes de persistir; usuario elige nombre (Casa, Trabajo) |
| **sanitizeAddressLabel: fallback "Mi dirección"** | Evitar re-pedir si mensaje vacío; UX más fluida |
| **Mock interpretUserIntent en processor spec** | Tests fallaban con OpenAI (quota); mock local para Sí/No |

---

## ADRs / Patrones

- **ADR-005** (BullMQ Worker): Fases WAITING_SAVE_ADDRESS, WAITING_SAVE_ADDRESS_LABEL
- **ADR-006** (SSE): publishConversationUpdate, publishConversationComplete
- **worker-testing-patterns.md**: mocks Prisma/Redis/DynamoDB + address.service (interpretUserIntent) para specs

---

## Archivos Modificados

```
apps/worker/src/services/
├── address.service.ts           # WAITING_SAVE_ADDRESS_LABEL, buildSaveAddress*, buildAddressSaved/NotSaved
└── address.service.spec.ts      # +8 tests libreta

apps/worker/src/processors/
├── conversation.processor.ts   # offerSaveAddress, closeConversation, handleWaitingSaveAddress*, finalizeAddress, handleWaitingRegisterEmail
└── conversation.processor.spec.ts  # mock interpretUserIntent, tests WAITING_SAVE_ADDRESS*, address.create

openspec/specs/mock-conversations/spec.md  # Requirements MODIFIED + ADDED (delta aplicado)
```

---

## Post-verificación (opsx-verify)

Tras el informe de verificación, se añadieron dos tests adicionales:

| Issue | Test añadido |
|-------|--------------|
| offerSaveAddress "dirección ya en libreta" → close directo | `offerSaveAddress when address already in libreta closes conversation without offering` (mock address.findMany con match) |
| sanitizeAddressLabel truncación 80 chars | `WAITING_SAVE_ADDRESS_LABEL with long alias truncates to 80 chars` |

Patrones documentados en `worker-testing-patterns.md`: mock `interpretUserIntent`, `mockClear` para aserciones "no fue llamado".
