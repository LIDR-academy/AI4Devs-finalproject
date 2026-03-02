# Sesión 2026-03-02: CU03-B2 — Worker: Sub-journeys 2.1 y 2.3 (proponer dirección guardada) — Completado

> **Change**: `cu03-b2-worker-address-proposals`  
> **Estado**: ✅ Completado y verificado (13/13 tareas)

## Resumen

Extensión del journey GET_ADDRESS en el Worker para proponer la dirección guardada cuando ya la conocemos (Adresles o eCommerce), reduciendo fricción para el usuario.

**Sub-journeys implementados:**
- **2.1**: Usuario registrado con dirección en libreta Adresles → propone la favorita (`isDefault`) o primera
- **2.3**: Usuario no registrado con dirección en eCommerce (`context.buyerEcommerceAddress`) → propone esa dirección
- **2.2 / 2.4**: Sin dirección conocida → pregunta estándar (OpenAI)

---

## Completado

### address.service.ts

- Nueva fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` en `ConversationPhase`
- Función `buildAddressProposalMessage(pending, storeName, source, language)` — mensajes bilingües (ES/EN) diferenciando fuente adresles vs ecommerce
- Sin nuevos campos en `ConversationState`: se reutiliza `pendingAddress` (misma semántica que `WAITING_CONFIRMATION`)

### conversation.processor.ts

- `processGetAddressJourney()` recibe `context?: MockOrderContext`
- Rama 2.1: `user.isRegistered` → `prisma.address.findMany` con `orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]`
- Rama 2.3: `!user.isRegistered && context?.buyerRegisteredEcommerce && context.buyerEcommerceAddress` → mapeo `ecommerceAddressToPending`
- Helpers `addressToPendingAddress()` y `ecommerceAddressToPending()` para mapear Address/eCommerce → `PendingAddress`
- Handler `handleAddressProposalConfirm`: CONFIRM → `finalizeAddress`; rechazo → transición a `WAITING_ADDRESS` con `intent.correction` si existe
- `context` propagado desde `conversationProcessor` a `processGetAddressJourney`

### Tests

- `address.service.spec.ts`: 4 tests para `buildAddressProposalMessage` (ES/EN × adresles/ecommerce)
- 13 tests totales en Worker pasando

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Reutilizar `pendingAddress`** (no añadir `proposedAddress`) | Ambas fases (`WAITING_CONFIRMATION` y `WAITING_ADDRESS_PROPOSAL_CONFIRM`) representan "dirección pendiente de confirmación". Un solo campo evita redundancia y posibles bugs |
| **Orden evaluación 2.1 → 2.3 → 2.2/2.4** | Sub-journeys mutuamente excluyentes; el orden simplifica la lógica |
| **eCommerce sin GMaps** | `PendingAddress` desde `context.buyerEcommerceAddress` tiene `gmapsPlaceId`, `latitude`, `longitude` en `null` — la dirección viene presuntamente validada del eCommerce |

---

## ADRs / Patrones

- **ADR-005** (BullMQ Worker): Extensión de la máquina de estados
- **ADR-007** (shared-types): `MockOrderContext`, `buyerEcommerceAddress` ya definidos
- No se creó ADR nuevo — cambio de implementación, no decisión arquitectural
- No se documentó patrón nuevo — decisión específica del Worker

---

## Archivos Creados/Modificados

```
apps/worker/src/services/
├── address.service.ts           # + WAITING_ADDRESS_PROPOSAL_CONFIRM, buildAddressProposalMessage
└── address.service.spec.ts      # + 4 tests buildAddressProposalMessage

apps/worker/src/processors/
└── conversation.processor.ts   # processGetAddressJourney 2.1/2.3, handleAddressProposalConfirm

openspec/changes/cu03-b2-worker-address-proposals/
├── proposal.md, design.md, specs/, tasks.md
├── CU03-B2-worker-address-proposals.md
└── VERIFICATION.md
```

---

**Duración estimada**: 1 sesión (artefactos + implementación)
