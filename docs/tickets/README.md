# Development Tickets (MVP)

This folder contains implementation-ready tickets derived from the engineering user stories.

## Ticketing strategy

- Single unified sequence: TKT-XXX.
- Technology is represented as metadata in each ticket (Type/Domain), not as ID prefix.
- This keeps prioritization and delivery order simple for a solo full-stack workflow.

## Main tickets highlighted in README

1. **Consolidated hardening**: [TKT-014 - MVP Hardening: Database Schema, Backend Receipts, and Frontend Pantry](./TKT-014-mvp-hardening-schema-receipts-pantry.md)
   - Consolidates TKT-011, TKT-012, TKT-013 (see below — kept for traceability)

## Full tickets list by user story

1. US-001: [TKT-001 - Register and Login](./TKT-001-auth-register-login.md)
2. US-002: [TKT-002 - Pantry Manual Add Item](./TKT-002-pantry-manual-add-item.md)
3. US-003: [TKT-003 - Receipt Upload and OCR Extraction](./TKT-003-receipt-upload-ocr.md)
4. US-004: [TKT-004 - Expiration Suggestion with Confidence](./TKT-004-expiration-confidence-flow.md)
5. US-005: [TKT-005 - Expiring Soon Notifications](./TKT-005-expiring-notifications.md)
6. US-006: [TKT-006 - Price Comparison with MVP Dataset](./TKT-006-price-comparison-mvp-dataset.md)
7. US-007: [TKT-007 - Dashboard Summary and Use-Next](./TKT-007-dashboard-summary-use-next.md)
8. US-008: [TKT-008 - Household Sharing Invite and Accept](./TKT-008-household-sharing-invite-accept.md)
9. US-009: [TKT-009 - Consumption and Waste Events](./TKT-009-consumption-waste-events.md)
10. US-010: [TKT-010 - Use-Next Prioritization](./TKT-010-use-next-prioritization.md)

## Hardening and gap tickets (Deliverable 2)

11. [TKT-011 - Backend Receipt Pipeline gaps](./TKT-011-backend-receipt-ocr-pipeline.md) — consolidated into TKT-014
12. [TKT-012 - Frontend Pantry Add Item gaps](./TKT-012-frontend-pantry-add-item-flow.md) — consolidated into TKT-014
13. [TKT-013 - Database Core Schema](./DISCARDED-TKT-013-database-core-schema-household-pantry-events.md) — consolidated into TKT-014
14. **[TKT-014 - MVP Hardening: Database Schema, Backend Receipts, and Frontend Pantry](./TKT-014-mvp-hardening-schema-receipts-pantry.md)** ← active

## Extended MVP tickets

Implementation-ready tickets for the Extended MVP phase (post-Deliverable 2) are in a separate folder:

- [Extended MVP Tickets Index](./extendedMVP/README.md)

These use the `EXT-XXX` sequence and cover: notification delivery, CI/CD, production infrastructure, observability, recipe suggestions, barcode scan, expiry learning, gamification, and consumption automation.

## Source traceability
- User stories (MVP): [../product/4_User-stories.md](./../product/4_User-stories.md)
- PRD (MVP): [../product/3_PRD.md](./../product/3_PRD.md)
- Extended MVP PRD: [../product/5_Extended-Non-MVP-PRD.md](./../product/5_Extended-Non-MVP-PRD.md)
- Architecture: [../architecture/architecture.md](./../architecture/architecture.md)
- Data model: [../db/database-model.md](./../db/database-model.md)

- Governance
- - Ticketing strategy decision: [ticketing-strategy.md](./ticketing-strategy.md)
