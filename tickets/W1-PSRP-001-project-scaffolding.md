## PSRP-001: chore(infra): project-scaffolding — DECOMPOSED

**Type:** chore
**Priority:** P0 (Must)
**Status:** DECOMPOSED into 5 sequential changes
**Original Estimated Effort:** L (4-5d)
**Decomposed Effort:** ~3.5 days (with parallel B+C)
**Sprint Week:** W1
**Dependencies:** None

## Decomposition Summary

This ticket has been decomposed into 5 sequential changes to enable incremental validation, parallel work, and faster feedback. Each change produces working artifacts and keeps CI green on main.

| Phase | Change | Effort | Dependency | Openspec Change |
|-------|--------|--------|------------|-----------------|
| A | #29 | 0.5d | None | `openspec/changes/psrp-001a-repo-hygiene-and-ci-skeleton/` |
| B | #30 | 1d | A | `openspec/changes/psrp-001b-dotnet-solution-scaffolding/` |
| C | #31 | 1d | A (PARALLEL with B) | `openspec/changes/psrp-001c-angular-workspace-scaffolding/` |
| D | #32 | 0.5d | B + C | `openspec/changes/psrp-001d-worker-projects-and-dockerfiles/` |
| E | #33 | 1.5d | D | `openspec/changes/psrp-001e-k8s-manifests-and-deploy-pipeline/` |

## Dependency Graph

```
         ┌─────┐
         │  A  │  Repo + CI skeleton
         └──┬──┘
      ┌─────┴─────┐
      ▼           ▼
   ┌─────┐     ┌─────┐
   │  B  │     │  C  │  ← PARALLEL
   └──┬──┘     └──┬──┘
      └─────┬─────┘
            ▼
         ┌─────┐
         │  D  │  Workers + Dockerfiles
         └──┬──┘
            ▼
         ┌─────┐
         │  E  │  K8s + Deploy
         └─────┘
```

## CI Pipeline Growth (Golden Path)

Each phase ADDS a CI step. Main stays green after every merge.

```
Phase A:  [validate]                          ← skeleton passes
Phase B:  [validate] + dotnet build + test    ← .NET validated
Phase C:  [previous] + ng build               ← Angular validated
Phase D:  [previous] + docker build × 6 + push GHCR  ← containers validated
Phase E:  [previous] + kustomize validate     ← K8s manifests validated
```

## What Was Decomposed

The original PSRP-001 bundled 7 concerns into one L-sized ticket:
- ~~.NET solution (6 projects)~~ → PSRP-001B
- ~~Angular workspace~~ → PSRP-001C
- ~~Dockerfiles for 5 services~~ → PSRP-001D
- ~~K8s manifests (StatefulSets, Deployments)~~ → PSRP-001E
- ~~Kustomize overlays (local + production)~~ → PSRP-001E
- ~~GitHub Actions CI/CD~~ → PSRP-001A (skeleton), PSRP-001B/C/D/E (incremental)
- ~~.editorconfig, .gitignore~~ → PSRP-001A

## Rationale

- **Smaller blast radius**: Each PR is < 20 files instead of 100+
- **Parallel work**: Backend (B) and Frontend (C) can be developed simultaneously
- **Incremental validation**: CI catches failures at each layer, not all at once
- **Faster feedback**: Phase A merges in hours, not days
- **Worker projects deferred**: Workers have no business logic yet — scaffolded when Dockerfiles need them (Phase D)

## Blockers

None

## Branch Names

- `feature/PSRP-001A-repo-hygiene`
- `feature/PSRP-001B-dotnet-scaffolding`
- `feature/PSRP-001C-angular-scaffolding`
- `feature/PSRP-001D-dockerfiles`
- `feature/PSRP-001E-k8s-manifests`


