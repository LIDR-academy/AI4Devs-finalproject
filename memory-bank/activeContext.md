# Active Context

## Current Sprint
Sprint 0 - Foundation Setup | IN PROGRESS (Week 1: Feb 3-9, 2026)

## Completed User Stories
- US-001: Upload Flow (5 SP) — DONE 2026-02-11 | [docs/US-001/](../docs/US-001/)

## Active Ticket
**T-0504-FRONT: Dashboard 3D Canvas Layout** — 🔵 READY FOR TDD-ENRICH (Step 1/5)

### Status (T-0504-FRONT)
- 🔵 Next: TDD-Enrich Phase (analyze technical spec, enrich with codebase patterns, verify contracts with backend)

### Technical Specification Summary
- **Document**: [docs/US-005/T-0504-FRONT-TechnicalSpec.md](../docs/US-005/T-0504-FRONT-TechnicalSpec.md)
- **Feature**: Canvas layout component for 3D visualization (filter panel + viewport + toolbar + loading states)
- **Architecture**: React component with custom hooks, Canvas component will manage Three.js scene
- **Backend Dependency**: T-0501-BACK (✅ DONE) provides GET /api/parts endpoint
- **DB Dependency**: T-0503-DB (✅ DONE) provides low_poly_url column + bbox JSONB

### What will be implemented
- **Component**: `CanvasLayout.tsx` (filter panel + viewport container + toolbar)
- **Layout**: CSS Grid with responsive breakpoints (desktop: 250px sidebar + flex canvas, mobile: stacked)
- **Filters**: Status dropdown, Tipologia dropdown, Workshop selector (GET /api/parts query params)
- **Empty States**: Loading spinner, error messages, "No parts" message
- **Toolbar**: Placeholder buttons (Camera Reset, View Mode, Export — wired in later tickets)

### DoD Checklist (T-0504-FRONT)
- [ ] **TDD-Enrich**: Technical spec enriched with codebase patterns (component structure, hooks pattern, API integration)
- [ ] **TDD-Red**: Write 15 integration tests (filters, layout, loading states) — ALL FAILING
- [ ] **TDD-Green**: Implement CanvasLayout component — Make tests PASS with minimal code
- [ ] **TDD-Refactor**: Extract custom hooks, optimize re-renders, add docstrings
- [ ] **Audit**: Code review (responsive layout, accessibility, performance, test coverage >85%)

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
- **T-0501-BACK: List Parts API - No Pagination** — TDD RED→GREEN→REFACTOR cycle complete ✅. Endpoint `GET /api/parts` with dynamic filtering (status, tipologia, workshop_id). PartsService with NULL-safe transformations (low_poly_url, bbox, workshop_id). RLS enforcement + validations (status enum HTTP 400, UUID format HTTP 400, query errors HTTP 500). Query optimization: composite index idx_blocks_canvas_query, ordering created_at DESC. Refactor: constants extraction (ERROR_MSG_FETCH_PARTS_FAILED), helper methods (_transform_row_to_part_item, _build_filters_applied), validation helpers (_validate_status_enum, _validate_uuid_format). Tests: **32/32 PASS** (20 integration + 12 unit including Sprint 016 sanity fixes). Files: parts_service.py (138 lines), parts.py (117 lines), constants.py (+16 lines). Clean Architecture pattern maintained. — DONE 2026-02-20 ✅ [Prompts #106 RED #107 GREEN #108 REFACTOR #109 Sprint 016]
- **Sprint 016 - Tech Debt Cleanup:** T-0501-BACK Unit Tests Fixed — 12/12 unit tests PASS ✅ (improved from 2/12), mocks synchronized with .order() call added in GREEN phase, 2 assertion corrections, 1 test redesigned (UUID validation at API layer), total test suite: 32/32 PASS (20 integration + 12 unit) — DONE 2026-02-19 ✅ [Prompt #109]
- T-0503-DB: Add low_poly_url Column & Indexes — Migration applied, 17/20 tests PASS (85%, functional 100%), columns+indexes created, idempotent with IF NOT EXISTS, performance targets met — DONE 2026-02-19 ✅ [Prompts #101-105]

## Risks
- T-0502-AGENT: rhino3dm library compatibility with large files (testing needed)
- T-0507-FRONT: LOD system complexity — first time implementing distance-based geometry swapping
- Binary .3dm fixtures: May require Rhino/Grasshopper for generation

## Quick Links
- Full backlog: [docs/09-mvp-backlog.md](../docs/09-mvp-backlog.md)
- US-005 specs: [docs/US-005/](../docs/US-005/)
- T-0500 Tech Spec: [T-0500-INFRA-TechnicalSpec.md](../docs/US-005/T-0500-INFRA-TechnicalSpec.md)
- Decisions log: [decisions.md](decisions.md)
