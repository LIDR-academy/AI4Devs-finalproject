# Active Context

## Current Sprint
Sprint 0 - Foundation Setup | IN PROGRESS (Week 1: Feb 3-9, 2026)

## Completed User Stories
- US-001: Upload Flow (5 SP) — DONE 2026-02-11 | [docs/US-001/](../docs/US-001/)

## Active Ticket
**T-0500-INFRA: Setup React Three Fiber Stack** — ✅ DONE (TDD-GREEN completado 2026-02-19)

### DoD Status (T-0500-INFRA)
- ✅ Technical Specification — [docs/US-005/T-0500-INFRA-TechnicalSpec.md](../docs/US-005/T-0500-INFRA-TechnicalSpec.md)
- ✅ TDD-Red: 10 tests escritos (T2×3, T13×2, T4×5)
- ✅ TDD-Green: 10/10 tests pasan + 77 tests existentes intactos
- ⏳ DoD final: verificar `make front-install` limpio + smoke visual (pendiente)

### What was implemented
- **Deps**: `@react-three/fiber@^8.15`, `@react-three/drei@^9.92`, `three@^0.160`, `zustand@^4.4.7`, `@types/three@^0.160`
- **vite.config.ts**: `assetsInclude GLB/GLTF`, `manualChunks three-vendor`, `resolve.alias @`
- **vitest.config.ts**: `resolve.alias @` + `coverage.include`
- **setup.ts**: `vi.mock @react-three/fiber` (Canvas→div) + `vi.mock @react-three/drei` (useGLTF stub)
- **Stubs**: `stores/parts.store.ts`, `types/parts.ts`, `constants/dashboard3d.constants.ts`, `hooks/usePartsSpatialLayout.ts`, `components/Dashboard/index.ts`

## Current Phase
**US-005 Dashboard 3D** — Next ticket: T-0503-DB

**Next Steps:**
1. Close T-0500-INFRA: update progress.md
2. Start T-0503-DB: Database schema for parts (PostgreSQL tables + migrations)

## Next Tickets (orden de dependencia)
**US-005 (35 SP total):**
T-0500-INFRA (✅) → T-0503-DB → T-0501-BACK → T-0504-FRONT → T-0505-FRONT → T-0506-FRONT → T-0502-AGENT → T-0507-FRONT → T-0508-FRONT → T-0509/T-0510-TEST

## Blockers
- Ninguno activo
- T-0502-AGENT depende de rhino3dm compatibility con archivos grandes (riesgo conocido)

## Recently Completed (max 3)
- T-0500-INFRA: React Three Fiber stack setup (deps + mocks + stubs + configs) — DONE 2026-02-19 ✅
- Security: Credential leak cleanup + GitGuardian setup + new Supabase DB migration — DONE 2026-02-19 ✅
- DevSecOps P1 Improvements: Resource Limits + /ready Endpoint + CI/CD Hardening + SSL + axios CVE — DONE 2026-02-18 ✅

## Risks
- T-0502-AGENT: rhino3dm library compatibility with large files (testing needed)
- T-0507-FRONT: LOD system complexity — first time implementing distance-based geometry swapping
- Binary .3dm fixtures: May require Rhino/Grasshopper for generation

## Quick Links
- Full backlog: [docs/09-mvp-backlog.md](../docs/09-mvp-backlog.md)
- US-005 specs: [docs/US-005/](../docs/US-005/)
- T-0500 Tech Spec: [T-0500-INFRA-TechnicalSpec.md](../docs/US-005/T-0500-INFRA-TechnicalSpec.md)
- Decisions log: [decisions.md](decisions.md)
