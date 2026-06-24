## Context

The repository has no .gitignore, .editorconfig, or CI pipeline. The codebase has extensive documentation (architecture, data model, style guide, conventions) but no actual code or build infrastructure. PSRP-001 was originally scoped as a single massive ticket — this change is Phase A of a 5-phase decomposition.

## Goals / Non-Goals

**Goals:**
- Establish repo hygiene (.gitignore, .editorconfig) that all subsequent PRs inherit
- Create a CI pipeline skeleton that passes on main — the "golden path" where each phase adds a validation step
- Keep this change small (< 5 files) for fast review and merge

**Non-Goals:**
- No application code
- No build steps beyond the skeleton echo
- No Docker, K8s, or language-specific CI configuration (those come in later phases)

## Decisions

### 1. Single CI workflow file (not split)
The CI workflow starts as a skeleton and grows incrementally. Each phase adds jobs to the same `.github/workflows/ci.yml` file rather than creating separate workflow files. This keeps the pipeline visible as a single unit and avoids cross-workflow dependency complexity.

### 2. .gitignore covers all layers upfront
The .gitignore includes patterns for .NET, Node.js, Docker, K8s, IDE (VS Code, Visual Studio, Rider), and OS files — even though not all layers exist yet. This prevents future PRs from accidentally committing generated files.

### 3. .editorconfig covers C# 14 + TypeScript strict
Single .editorconfig at repo root with sections for `*.cs` (C# 14, file-scoped namespaces, nullable enabled) and `*.ts` (strict mode, no implicit any). This follows conventions from `conventions/technical-conventions.md`.

### 4. CI triggers on push to main AND pull_request
Both triggers ensure: (a) main branch stays green after every merge, (b) PRs are validated before merge.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| CI skeleton passes without doing anything real | Acceptable — Phase B adds the first real validation (dotnet build) |
| .gitignore patterns may need tuning as projects grow | Can be updated in later PRs; better to start comprehensive |
| .editorconfig may conflict with team IDE preferences | Based on project conventions doc; can be adjusted if needed |
