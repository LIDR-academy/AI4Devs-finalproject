# CLAUDE.md

This file provides guidance to Code agents when working with code in this repository.
In all interactions, be extremely concise and sacrifice grammar for the sake of concision.

## Project

AI Study Buddy — AI4Devs bootcamp final project. Turns an uploaded PDF into an AI-generated lesson of alternating instructional and activity slides (multiple choice, fill-in-the-blank, flashcards, etc.). Product spec lives in `PRD.md`; `readme.md` is the course deliverable template (Spanish) to be filled in for submission.

Canonical agent rules live in `.agents/rules/` and take precedence:
- `global.mdc` — monorepo spec (folders, libs, naming, tooling, Supabase)
- `hooks-service-dao.mdc` — hook/service/DAO layering (read before adding hooks, services, or DAOs)
- `atomic-design.mdc` — component structure methodology

## Commands

pnpm workspaces + Turborepo (workspaces declared in `pnpm-workspace.yaml`; internal `@helsoft/*` deps use the `workspace:*` protocol). Run from the repo root:

```bash
pnpm dev           # turbo run dev (app + storybooks)
pnpm build         # turbo run build
pnpm lint          # turbo run lint
pnpm check-types   # turbo run check-types (tsc --noEmit per workspace)
pnpm clean         # remove node_modules/.turbo/dist/.expo everywhere + watchman
```

Target a single workspace:

```bash
pnpm --filter app-study-buddy dev         # Expo dev server (also: web / ios / android)
pnpm --filter @helsoft/components dev     # Storybook on port 6007 (lib-with-storybook uses 6006)
pnpm turbo run check-types --filter=@helsoft/services
```

There is a `test` turbo task but no workspace defines a `test` script yet — no test runner is installed. When adding one, wire the workspace's `test` script so `pnpm test` picks it up.

pnpm blocks dependency build scripts by default; if an install reports ignored builds, approve the package in the `allowBuilds` section of `pnpm-workspace.yaml`.

Supabase (hosted project, linked via `supabase/`):

```bash
npx supabase migration new <name>   # schema changes go through migrations
npx supabase db push
```

## Architecture

Turborepo monorepo with three top-level areas:

- **`apps/app-study-buddy`** — universal Expo app (SDK 57, Expo Router, React Native 0.86, React 19; ships web + iOS + Android from one codebase). App code stays minimal — screens in `src/app/` (file-based routing) should mostly compose from libs. **Expo SDK 57 changed significantly: consult https://docs.expo.dev/versions/v57.0.0/ before writing Expo code** (see `apps/app-study-buddy/AGENTS.md`).
- **`libs/*`** — all shared/business code, published as `@helsoft/*` workspace packages: `types` (plain TS types, one `type-name.ts` file each), `components` (shared UI + Storybook stories, atomic design), `hooks`, `services` (services + DAOs + Supabase client), `study-buddy` (the app's feature lib — business logic for the app lives here, not in the app), `lib-with-storybook` (template for new Storybook-enabled libs; copy its story patterns).
- **`supabase/`** — backend is Supabase (auth, Postgres, storage, edge functions). CLI config and migrations only.

### Data-flow layering (enforced — see `hooks-service-dao.mdc`)

```
Component → Hook → Service → DAO → Supabase / external API
```

- **DAOs** (`libs/services/src/dao/{feature}.dao.ts`, `{Feature}Dao` abstract class, static methods): raw data access only. Two kinds — Supabase DAOs use `getSupabase()` from `libs/services/src/supabase/supabase-client.ts`; external-API DAOs (e.g. AI provider with the user's own key) use `fetch`. One DAO class per data source.
- **Services** (`libs/services/src/services/{feature}.service.ts`, `{Feature}Service` abstract class): validation + business logic; call DAOs, never fetch directly; no React.
- **Hooks** (`libs/hooks/src/hooks/use-{feature}.ts`): React integration wrapping services (never DAOs directly). tanstack-query is the intended pattern for data-fetching hooks but is not installed yet — add it to `@helsoft/hooks` when first needed.
- Each layer exports through its `index.ts` barrel files.

### Supabase client wiring

`initSupabase()`/`getSupabase()` live in `@helsoft/services`. The app initializes the client at startup in `apps/app-study-buddy/src/lib/supabase.ts` from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (copy `apps/app-study-buddy/.env.example` to `.env`). Anything in libs just calls `getSupabase()` — it throws if init was skipped. Session state comes from `useSession()` in `@helsoft/hooks`.

## Conventions

- Functional React only; no Redux. Always declare a Props type for components.
- Kebab-case filenames: `component-name/component-name.tsx` (+ `component-name.stories.tsx` for every shared component), `{feature}.dao.ts`, `{feature}.service.ts`, `use-{feature}.ts`.
- Platform-specific files use the `.web.tsx` suffix convention (see `apps/app-study-buddy/src/components/`).
- New apps `app-{feature}` should pair with a feature lib `libs/{feature}`.

## Agentic orchestrator

Feature work runs through a gated agentic orchestrator. To build a feature from a user story:

```
/ticket-orchestrator <story>        # story = a file in user-stories/<story>.md
```

The pipeline: `spec_partner` (spec **and** Gherkin contract, approved together at one human gate) → `tdd_craftsman` (strict TDD, vertical slices) → `reviews_lead` (6 parallel reviewers: code, design, architecture, security/OWASP, accessibility/WCAG, performance) → `mutation_tester` (StrykerJS) → `dod_validator` (Definition of Done). All state lives in `docs/features/<name>/`; session state in `progress/`.

**Source of truth: `.agents/ORCHESTRATOR.md`.** Roles in `.agents/agents/`, rules in `.agents/rules/{tdd,review-standards}.md`, skills in `.agents/skills/{gherkin-authoring,mutation-testing,storybook-e2e-tests}/`, templates in `.agents/templates/`. Full design + rationale: `/ORCHESTRATOR_PLAN.md`.
