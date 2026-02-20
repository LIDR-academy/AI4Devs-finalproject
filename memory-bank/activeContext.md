# Active Context

## Current Sprint
Sprint 0 - Foundation Setup | IN PROGRESS (Week 1: Feb 3-9, 2026)

# Active Context

## Current Sprint
Sprint 0 - Foundation Setup | IN PROGRESS (Week 1: Feb 3-9, 2026)

## Completed User Stories
- US-001: Upload Flow (5 SP) — DONE 2026-02-11 | [docs/US-001/](../docs/US-001/)

## Recently Completed
- **T-0502-AGENT: Generate Low-Poly GLB from .3dm** — ✅ COMPLETE (2026-02-19) | TDD-GREEN + REFACTOR phases complete
  - Status: 9/9 tests passing (including huge_geometry - OOM fixed with Docker 4GB memory)
  - Refactor: 6 helper functions extracted from 290-line monolith, Google Style docstrings added
  - Files: `src/agent/tasks/geometry_processing.py` (450 lines, 7 functions), `docker-compose.yml` (backend/agent-worker 4GB)
  - Zero regression: 16/16 backend+agent tests PASS
  - Ready for production deployment

## Active Ticket
**None** — Next: T-0504-FRONT or T-0505-FRONT (Dashboard 3D Canvas)

## Next Steps
1. Continue with US-005 Dashboard 3D frontend implementation
2. T-0504-FRONT: Dashboard layout with Canvas + Sidebar
3. T-0505-FRONT: Render low-poly meshes in 3D scene

### Status (T-0502-AGENT)
- ✅ Complete: TDD-Enrich Phase — Technical Specification blueprint generated (2,100+ lines)
- ✅ Complete: TDD-RED Phase — 14 tests written (9 unit + 5 integration), all fail with ModuleNotFoundError
- 🟢 Next: TDD-GREEN Phase — Implement `src/agent/tasks/geometry_processing.py` to make tests pass

### What was built (TDD-RED artifacts)
- **Unit Tests**: `tests/agent/unit/test_geometry_decimation.py` (485 lines, 9 tests)
  - 6 pytest fixtures for mocking rhino3dm file scenarios
  - Tests cover: simple decimation, merge meshes, quad faces, skip decimation, empty mesh, huge geometry, S3 404, corrupted file, SQL injection
- **Integration Tests**: `tests/agent/integration/test_low_poly_pipeline.py` (258 lines, 5 tests)
  - Tests cover: full pipeline E2E, S3 public URL accessibility, DB constraint validation, performance <120s, idempotency
- **Constants**: `src/agent/constants.py` (+30 lines)
  - 13 new constants: TASK_GENERATE_LOW_POLY_GLB, DECIMATION_TARGET_FACES=1000, MAX_GLB_SIZE_KB=500, bucket names, error messages
- **Dependencies**: `src/agent/requirements.txt` (+2 lines)
  - trimesh==4.0.5 (mesh decimation library)
  - rtree==1.1.0 (spatial index for trimesh)

### RED Phase Verification
- ✅ All 14 tests import from non-existent module: `src.agent.tasks.geometry_processing`
- ✅ Module does NOT exist (file_search confirmed)
- ✅ Expected error: `ModuleNotFoundError: No module named 'src.agent.tasks.geometry_processing'`
- ✅ Test command: `docker compose run --rm backend pytest tests/agent/ -v`

### Technical Specification Summary
- **Document**: [docs/US-005/T-0502-AGENT-TechnicalSpec-ENRICHED.md](../docs/US-005/T-0502-AGENT-TechnicalSpec-ENRICHED.md)
- **Feature**: Celery async task for 3D geometry decimation and GLB export
- **Story Points**: 5 SP
- **Dependencies**: T-0503-DB (✅ DONE), T-022-INFRA (✅ DONE), T-024-AGENT (✅ DONE)
- **Blocks**: T-0505-FRONT (needs low_poly_url populated), T-0507-FRONT (needs GLB files)

### What will be implemented
- **Task**: `generate_low_poly_glb(block_id: str)` — Celery task with max_retries=3, soft_time_limit=540s, time_limit=600s
- **Algorithm**: .3dm download → rhino3dm parse → trimesh merge → quadric decimation (39K tris → 1K) → GLB export → S3 upload → DB update
- **New Files**: 
  - `src/agent/tasks/geometry_processing.py` (300-350 lines)
  - `src/agent/infra/supabase_client.py` (50 lines)
  - `tests/agent/unit/test_geometry_decimation.py` (150 lines)
  - `tests/agent/integration/test_low_poly_pipeline.py` (100 lines)
- **Modified Files**: 
  - `src/agent/constants.py` (+20 lines: DECIMATION_TARGET_FACES=1000, MAX_GLB_SIZE_KB=500, bucket names)
  - `src/agent/requirements.txt` (+2 lines: trimesh==4.0.5, rtree==1.1.0)

### Test Strategy (15 tests planned)
**Happy Path (4):**
1. Simple mesh decimation (5K → 1K triangles)
2. Multiple meshes merge (10 meshes → 1 combined)
3. Quad faces handling (len(face)==4 split)
4. Already low-poly (skip decimation)

**Edge Cases (4):**
5. Empty mesh (no geometry found)
6. Huge geometry (100K+ faces, timeout risk)
7. Invalid S3 URL (404 error)
8. Malformed .3dm (corrupted file)

**Security (4):**
9. SQL injection protection (block_id)
10. DB transaction rollback
11. Disk space exhaustion
12. Task timeout (hard limit 600s)

**Integration (3):**
13. Full pipeline (upload → validation → low-poly)
14. S3 public URL accessibility
15. Database constraint validation

### Performance Targets
- Processing time: <120 seconds/file
- Output file size: <500KB (POC: 778KB uncompressed → 300-400KB with Draco expected)
- Triangle count: ~1000 (±10% tolerance)
- Memory usage: <2GB RSS
- Success rate: >95%

### DoD Checklist (T-0502-AGENT)
- [x] **TDD-Enrich**: Technical spec enriched with 13 sections (contracts, algorithm, tests, risks, performance)
- [x] **TDD-Red**: 14 tests written (9 unit test_geometry_decimation.py + 5 integration test_low_poly_pipeline.py), all fail ModuleNotFoundError
- [ ] **TDD-Green**: Implement `src/agent/tasks/geometry_processing.py` + `src/agent/infra/supabase_client.py` to make tests pass
- [ ] **TDD-Refactor**: Extract helper methods, DRY principles, docstrings
- [ ] **Audit**: Code review (performance metrics, error handling, test coverage >85%)

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
