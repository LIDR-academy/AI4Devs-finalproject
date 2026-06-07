---
name: realsavefooding-full-stack-engineer
description: 'Full-stack workflow for RealSaveFooding. Use when working across the project frontend, backend, Prisma schema, AWS integrations, MVP architecture, repository structure, README/docs alignment, or end-to-end feature delivery in this codebase.'
argument-hint: 'Feature, bug, module, or architecture task to handle in ConsuRealSaveFoodingmeSmart'
user-invocable: true
disable-model-invocation: false
---

# RealSaveFooding Full-Stack Engineer

Use this skill when the task requires project-aware work across the RealSaveFooding stack: React frontend in `front/`, NestJS backend in `back/`, Prisma/PostgreSQL data model, AWS integrations, MVP repository structure, and architecture/documentation alignment.

## When to Use
- Implement or modify a feature that touches both frontend and backend.
- Add or change NestJS modules, controllers, services, DTOs, Prisma schema, or AWS integration adapters.
- Reorganize the frontend safely toward the MVP feature-based structure.
- Update architecture or README documentation to match the actual implementation.
- Validate that repository structure, dependencies, and MVP scope remain consistent.
- Review whether a task belongs to MVP scope or future-work scope.

## Project Context
Load these references when needed:
- [Project Context](./references/project-context.md)
- [Validation Checks](./references/validation-checks.md)

## Default Working Mode
1. Start from the most concrete anchor available.
   - Prefer the named file, route, module, schema, failing command, or documented architecture section.
   - If the request is broad, identify the owning slice first: `front`, `back`, `docs`, `infra`, or `tests`.
2. Classify the task.
   - Frontend-only
   - Backend-only
   - Full-stack feature
   - Architecture/documentation alignment
   - Infrastructure/configuration
3. Keep the task inside MVP scope unless the user explicitly asks for future architecture.
4. Make the smallest change that advances the requested outcome without breaking the current app.
5. Validate immediately after the first substantive edit with the narrowest executable check available.

## Workflow

### 1. Establish Scope and Affected Slices
- Determine which parts of the repository are involved.
- For frontend work, decide whether existing code stays in place or should be wrapped/migrated into the new `app`, `features`, and `shared` structure.
- For backend work, map the request to the responsible NestJS module under `back/src/modules`.
- For data work, confirm whether the change affects `back/prisma/schema.prisma`, seed data, environment variables, or API contracts.
- For docs work, update the corresponding architecture, product, API, or README section instead of duplicating conflicting information.

### 2. Choose the Implementation Path
- Frontend-only:
  - Prefer feature-based organization under `front/src/features/<feature>`.
  - Keep shared concerns under `front/src/shared`.
  - Do not move working routes or components unless the task benefits from it directly.
- Backend-only:
  - Prefer modular monolith boundaries.
  - Put transport and business logic in the owning module.
  - Keep Prisma access in the backend data layer.
  - Keep AWS-specific behavior behind `back/src/integrations/*`.
- Full-stack feature:
  - Define the data shape first.
  - Implement backend contract next.
  - Connect frontend last.
  - Finish by syncing docs and examples if user-facing behavior changed.
- Documentation or architecture:
  - Align docs to what exists in the repository.
  - Clearly separate MVP from future-work design.

### 3. Backend Implementation Rules
- Use NestJS modules as the primary domain boundary:
  - `auth`
  - `users`
  - `pantry`
  - `receipts`
  - `expiration`
  - `notifications`
  - `dashboard`
- Keep `common` for cross-cutting concerns such as guards, interceptors, decorators, and filters.
- Keep `database` for Prisma service/module wiring.
- Keep external systems under `integrations`.
- Add dependencies only when they support the requested MVP outcome.
- Prefer straightforward DTO/service/controller structure over early abstraction.

### 4. Frontend Implementation Rules
- Use feature-based organization for new work.
- Prefer these locations for new code:
  - `front/src/features/<feature>` for feature-specific pages, hooks, components, API bindings, and types.
  - `front/src/shared/*` for truly reusable pieces.
  - `front/src/app/*` for composition-root concerns such as router wrappers and providers.
- Preserve existing working routes and UI components when reorganization is not necessary.
- If migration is needed, do it incrementally and keep imports compatible until the old path is no longer used.

### 5. Data and Infrastructure Rules
- Treat Prisma schema changes as contract changes.
- Update `.env.example` or backend `.env.example` when new configuration is required.
- Keep infrastructure minimal for MVP:
  - Terraform dev environment only
  - local Docker support only where useful
  - no premature production hardening unless explicitly requested

### 6. Validation Rules
- After frontend edits, prefer a narrow route/component check, then `npm run build` or the repo-standard equivalent.
- After backend edits, prefer `npm run build`, focused tests, and Prisma generation when schema changes.
- After schema changes, run Prisma generation before backend build.
- After documentation changes, verify the paths, folder names, and architectural claims match the repository.

## Decision Points
- If the task only changes UI wording or presentation, avoid backend edits.
- If the task changes persisted data, inspect Prisma schema and API boundaries before touching UI forms.
- If the task introduces AWS usage, isolate it in `back/src/integrations` and document required env vars.
- If a requested change is future-work only, keep it out of MVP implementation unless the user explicitly wants design-only output.
- If reorganization risks breaking working frontend code, prefer wrappers and new folders over large moves.

## Completion Criteria
A task is complete when all relevant items are true:
- The affected slice is implemented in the correct part of the repository.
- MVP boundaries are respected or explicitly documented when exceeded.
- Dependencies and configuration are added only where needed.
- The narrowest relevant build/test/validation step passes.
- Documentation is updated if repository structure, architecture, setup, or behavior changed.
- The final result is consistent across `front`, `back`, `docs`, `infra`, and `readme.md` when those surfaces are touched.

## Output Expectations
When using this skill:
- State which slices are affected.
- Explain whether the work is frontend-only, backend-only, or full-stack.
- Mention MVP vs future-work reasoning when relevant.
- Report the validation actually executed, not just intended checks.
