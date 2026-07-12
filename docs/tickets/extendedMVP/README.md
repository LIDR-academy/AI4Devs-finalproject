# Extended MVP — Development Tickets

This folder contains implementation-ready tickets for the Extended MVP phase, derived from the [Extended Non-MVP PRD](../../product/5_Extended-Non-MVP-PRD.md).

## Ticketing convention

Same as MVP: single unified sequence `EXT-XXX`. Technology is metadata within each ticket, not an ID prefix.

## Delivery order

### Phase 1 — GA Readiness (implement last, after all Phase 2 features)

| Ticket | Title | Priority | Effort |
|---|---|---|---|
| [EXT-001](./EXT-001-notification-delivery.md) | Real Notification Delivery (Email + Web Push) | P1 | Medium |
| [EXT-002](./EXT-002-cicd-pipeline.md) | ~~CI/CD Deployment Pipeline~~ **(Out of scope — will not be implemented)** | ~~P1~~ | ~~Medium~~ |
| [EXT-003](./EXT-003-production-infrastructure.md) | Production Infrastructure (IaC: Staging + Production) | P1 | High |
| [EXT-004](./EXT-004-observability-logging.md) | Application Observability (Structured Logging + Metrics) | P1 | Medium |

> **Note on P1 order:** EXT-001 (notification delivery) should be implemented first — it unblocks retention measurement. EXT-003 and EXT-004 are built last after all Phase 2 features are complete, since infrastructure scope is clearest when the feature surface is stable. **EXT-002 is out of scope and will not be implemented** — project scope was reduced (see [EXT-002](./EXT-002-cicd-pipeline.md)).

### Phase 2 — Growth (implement in order shown)

| Ticket | Title | Priority | Effort |
|---|---|---|---|
| [EXT-005](./EXT-005-recipe-suggestions.md) | Recipe Suggestions Based on Current Pantry | P2 | Medium |
| [EXT-006](./EXT-006-barcode-scan.md) | Barcode Scan for Item Entry | P2 | Medium |
| [EXT-007](./EXT-007-expiry-learning.md) | Automatic Expiry Learning from User Overrides | P2 | Medium |
| [EXT-009](./EXT-009-gamification.md) | Gamification and Achievement System | P2 | Medium |
| [EXT-010](./EXT-010-consumption-automation.md) | Consumption Automation for Long-Expired Items | P2 | Medium |

## Recommended implementation sequence (Phase 2)

```
EXT-005 (recipes)         ← no external dependencies beyond MVP
EXT-006 (barcode scan)    ← independent, free tools
EXT-007 (expiry learning) ← extends existing expiration module
EXT-009 (gamification)    ← new module, hooks into pantry events
EXT-010 (automation)      ← hooks into pantry + notifications
```

Then Phase 1:
```
EXT-001 (notifications)   ← SES + web push wiring
EXT-004 (observability)   ← structured logging + metrics
EXT-003 (infrastructure)  ← Terraform IaC for staging + prod
EXT-002 (CI/CD)           ← OUT OF SCOPE — will not be implemented
```

## Source traceability

- PRD: [docs/product/5_Extended-Non-MVP-PRD.md](../../product/5_Extended-Non-MVP-PRD.md)
- Future capabilities (out of scope): [docs/product/6_Future-Capabilities.md](../../product/6_Future-Capabilities.md)
- MVP tickets: [docs/tickets/README.md](../README.md)
- User stories (MVP): [docs/product/4_User-stories.md](../../product/4_User-stories.md)
