## Why

PSRP-001 is a P0 chore scoped as a single L-sized (4-5 day) ticket that bundles 7 independent concerns: .NET solution, Angular workspace, Dockerfiles, K8s manifests, Kustomize overlays, GitHub Actions CI/CD, and repo configuration. This creates a massive PR (~100+ files) where any failure blocks all 22 downstream tickets. Decomposing into sequential phases enables incremental validation, parallel work, and faster feedback — each phase produces working artifacts and keeps CI green on main.

## What Changes

- **Phase A (this change)**: Repository hygiene files (.gitignore, .editorconfig) and CI pipeline skeleton. Establishes the "golden path" — every subsequent PR adds a CI step.
- Establishes the decomposition pattern for PSRP-001 into 5 sequential changes (A through E)
- No application code — purely infrastructure and configuration

## Capabilities

### New Capabilities
- `ci-pipeline`: GitHub Actions CI workflow that validates builds incrementally. Starts as a skeleton that passes, grows with each subsequent phase (dotnet build → ng build → docker build → kustomize validate).
- `repo-configuration`: Root-level .gitignore and .editorconfig that enforce consistent code style across .NET 10 (C# 14) and Angular 22 (TypeScript strict) codebases.

### Modified Capabilities
<!-- none -->

## Impact

- **New files**: `.gitignore`, `.editorconfig`, `.github/workflows/ci.yml`
- **Downstream**: All 22 subsequent tickets inherit the CI pipeline and code style rules
- **No breaking changes**: Purely additive — no existing files modified
