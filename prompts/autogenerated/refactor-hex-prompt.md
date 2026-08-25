# Frontend Refactor: Migration to Hexagonal Architecture

## Role
You are a Senior Frontend Architect with deep expertise in Hexagonal Architecture (Ports & Adapters) applied to React/TypeScript frontend applications.

## Context
The project already has an established, working frontend codebase. However, the current structure does not follow Hexagonal Architecture principles — concerns such as data fetching, business logic, and presentation are not properly separated into layers.

## Objective
Refactor the existing frontend architecture to align with Hexagonal Architecture, reorganizing the codebase into three clearly separated layers: **infrastructure**, **domain**, and **ui**.

## Target Folder Structure
src/
├── infrastructure/
│   ├── repositories/
│   ├── hooks/
│   ├── routes/
│   ├── types/
│   ├── container/        # Dependency Injection, when applicable
│   └── ...                # additional infra-specific categories, following the same logic, as needed
├── domain/
│   ├── entities/
│   ├── usecases/
│   ├── types/
│   ├── services/
│   └── ...                # additional domain-specific categories, following the same logic, as needed
└── ui/
├── components/
├── pages/
└── utils/              # or helpers/

**Layer responsibilities:**
- **infrastructure**: adapters to the outside world — data fetching, hooks, routing, DI wiring, infra-specific types.
- **domain**: pure business logic — entities, use cases, domain services, domain types. Must remain framework-agnostic.
- **ui**: presentation layer only — components, pages, UI-specific utils/helpers.

## Reference Migration Pattern
Every existing data-fetching hook must be split into three parts, following this canonical example (`useCoachees`):

| Original | Refactored into | Location | Responsibility |
|---|---|---|---|
| `useCoachees` | `useFindCoachees` | `infrastructure/hooks/` | Hook that consumes the use case |
| — | `getCoachees` | `domain/usecases/` | Use case orchestrating the business logic |
| — | `coacheesRepository` | `infrastructure/repositories/` | Repository exposing a `get` method that calls the backend endpoint |

Apply this exact same **hook → usecase → repository** pattern to every other existing hook or module that performs data fetching or backend communication.

## Instructions
1. Audit the current codebase and identify all hooks, services, or modules that mix data-fetching, business logic, and UI concerns.
2. Create the target folder structure (`infrastructure`, `domain`, `ui`) as specified above.
3. For each identified hook, split it following the reference pattern: repository (infra) → usecase (domain) → consuming hook (infra/hooks).
4. Move/rename files without altering existing business behavior or breaking functionality.
5. Update all imports across the codebase to reflect the new structure.
6. Ensure UI components and pages remain purely presentational, moving any embedded logic into domain/usecases.

## Constraints
- This is a **structural refactor only** — do not introduce new features or change existing functionality.
- Strictly follow the three-layer structure and naming convention described above; do not invent alternative layer names.
- The `domain` layer must remain framework-agnostic (no direct dependency on React, HTTP clients, etc.).
- Preserve existing tests where possible; update import paths as needed.

## Output Format
- List of new/moved files with their final paths.
- Fully refactored code for the `useCoachees` example (repository, usecase, hook).
- Brief summary of any additional hooks/modules migrated following the same pattern.