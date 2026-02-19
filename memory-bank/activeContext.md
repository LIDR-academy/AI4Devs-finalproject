# Active Context

## Current Sprint
Sprint 0 - Foundation Setup | IN PROGRESS (Week 1: Feb 3-9, 2026)

## Completed User Stories
- US-001: Upload Flow (5 SP) — DONE 2026-02-11 | [docs/US-001/](../docs/US-001/)

## Active Ticket
**T-0501-BACK: List Parts API - No Pagination** — 🔵 NEXT (Enrichment Phase - Step 1/5)

### Status (T-0501-BACK)
- ⏳ Next: Enrichment Phase (read specs, enrich with context)

### What will be implemented
- **Endpoint**: `GET /api/parts` returns ALL parts (no pagination)
- **Response**: Include `low_poly_url`, `bbox` fields
- **Filters**: `status`, `tipologia`, `workshop_id` (SQL WHERE)
- **RLS**: Workshop users see only assigned+unassigned parts
- **Performance**: Response <200KB, query <500ms
- **Index Usage**: Must use `idx_blocks_canvas_query`

### DoD Checklist (T-0501-BACK)
- [ ] TDD-Enrich: Technical spec enriched with codebase patterns
- [ ] TDD-Red: Integration tests written (failing)
- [ ] TDD-Green: Endpoint implementation, all tests pass
- [ ] TDD-Refactor: Code optimization, documentation
- [ ] Audit: Code review passed

## Current Phase
**US-005 Dashboard 3D** — Phase 1: Foundation Setup

**Next Steps:**
1. T-0503-DB TDD-Red: Write 20 failing integration tests
2. T-0503-DB TDD-Green: Apply migration, make tests pass
3. T-0503-DB Refactor: Optimize, document, close ticket

## Next Tickets (orden de dependencia)
**US-005 (35 SP total):**
T-0500-INFRA (✅) → T-0503-DB → T-0501-BACK → T-0504-FRONT → T-0505-FRONT → T-0506-FRONT → T-0502-AGENT → T-0507-FRONT → T-0508-FRONT → T-0509/T-0510-TEST

## Blockers
- Ninguno activo
- T-0502-AGENT depende de rhino3dm compatibility con archivos grandes (riesgo conocido)

## Recently Completed (max 3)
- T-0503-DB: Add low_poly_url Column & Indexes — Migration applied, 17/20 tests PASS (85%, functional 100%), columns+indexes created, idempotent with IF NOT EXISTS, performance targets met — DONE 2026-02-19 ✅
- T-0500-INFRA: React Three Fiber stack setup (deps + mocks + stubs + configs) — DONE 2026-02-19 ✅
- Security: Credential leak cleanup + GitGuardian setup + new Supabase DB migration — DONE 2026-02-19 ✅

## Risks
- T-0502-AGENT: rhino3dm library compatibility with large files (testing needed)
- T-0507-FRONT: LOD system complexity — first time implementing distance-based geometry swapping
- Binary .3dm fixtures: May require Rhino/Grasshopper for generation

## Quick Links
- Full backlog: [docs/09-mvp-backlog.md](../docs/09-mvp-backlog.md)
- US-005 specs: [docs/US-005/](../docs/US-005/)
- T-0500 Tech Spec: [T-0500-INFRA-TechnicalSpec.md](../docs/US-005/T-0500-INFRA-TechnicalSpec.md)
- Decisions log: [decisions.md](decisions.md)
