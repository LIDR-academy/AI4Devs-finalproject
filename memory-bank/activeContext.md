# Active Context

## Current Sprint
US-002: The Librarian (Async Validation) | 13 SP | IN PROGRESS

## Completed User Stories
- US-001: Upload Flow (5 SP) — DONE 2026-02-11 | [docs/US-001/](../docs/US-001/)

## Active Ticket
T-030-BACK: Get Validation Status Endpoint — ENRICHMENT PHASE COMPLETE ✅ (TDD-RED next)

## Technical Spec Generated
- `/docs/US-002/T-030-BACK-TechnicalSpec.md` — Complete API contract + 13 test cases + schemas + SQL query
- Endpoint: `GET /api/parts/{id}/validation` (returns ValidationStatusResponse with block metadata + validation_report JSONB)
- Dependencies verified: ValidationReport schema (T-028), blocks table (T-020), block_status ENUM (T-021)
- Reusable assets: ValidationReport, TABLE_BLOCKS constant, Supabase client singleton
- Next: TDD-RED phase (8 unit tests + 5 integration tests)

## Next Tickets
1. T-030-BACK: Get Validation Status Endpoint
2. T-031-FRONT: Real-Time Status Listener

## Blockers
None.

## Recently Completed (max 3)
- T-029-BACK: Trigger Validation from Confirm Endpoint — DONE 2026-02-14 (13/13 tests: 9 unit + 4 integration, celery_client singleton, block creation + enqueue) ✅
- T-028-BACK: Validation Report Service — DONE 2026-02-14 (13/13 tests: 10 unit + 3 integration, Clean Architecture service layer) ✅
- T-027-AGENT: Geometry Validator — DONE 2026-02-14 (9/9 tests, 4 checks geométricos secuenciales) ✅

## Risks
- T-024-AGENT: rhino3dm library compatibility with large files (testing needed)
- Binary .3dm fixtures: May require Rhino/Grasshopper for generation (not critical for schema contracts)

## Quick Links
- Full backlog: [docs/09-mvp-backlog.md](../docs/09-mvp-backlog.md)
- US-002 specs: [docs/US-002/](../docs/US-002/)
- Decisions log: [decisions.md](decisions.md)
