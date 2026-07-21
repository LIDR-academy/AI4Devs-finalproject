# Documentation Index

Technical documentation for this Laravel 13 + Livewire 4 application, kept in sync with the real code by the [`docs-maintainer`](../.claude/skills/docs-maintainer/SKILL.md) skill. If something here contradicts the code, the code is right — flag it or fix the doc.

## Contracts

- [Contracts](contracts.md) — behavioral contracts governing what the AI agent may or may not do, and how it should make decisions, while working in this repository.

## Workflow

- [Workflow](workflow.md) — the required multi-agent orchestration process (Three Amigos + TDD + security audit + code review + continuous docs) the project's Claude Code agents follow to carry a task from definition to closure, phase by phase.

## Product Requirements

- [PRD](PRD/PRD.md) — product-level requirements for the Arospe backoffice (Users/Roles, Products/Taxes/Shipping, Blog, Internationalization): per-epic Gherkin scenarios, acceptance criteria, roadmap, and scope boundaries; feeds the Three Amigos process for individual tasks.

## Architecture

- [Overview](architecture/overview.md) — what this app is today, the real request lifecycle (routes → Livewire → actions → models → DB), and runtime dependencies (MySQL, database-backed session/cache/queue).
- [Authentication](architecture/authentication.md) — Fortify-based registration, login, password reset, two-factor authentication, and passkeys; the single source of truth for how auth works.
- [Authorization](architecture/authorization.md) — `spatie/laravel-permission` roles & permissions: `HasRoles` is attached to `User` (API callable), but no roles/permissions are seeded, assigned, or checked anywhere in the app yet.

## Database

- [Schema](database/schema.md) — ER diagram and column-level description of every table (`users`, `passkeys`, `sessions`, the permission tables) and how they relate.
- [Migrations](database/migrations.md) — this repo's real migration conventions (naming, `down()` symmetry, adding columns), with examples pulled from `database/migrations/`.

## API

- [Routes](api/routes.md) — the real contract surface today: app-owned web/Livewire routes plus the Fortify- and Passkeys-vendored auth routes. There is no REST API yet; this file explains what replaces it once one exists.

## Conventions

- [Base standards](conventions/base-standards.md) — stack versions, directory layout, model conventions (attribute-based `#[Fillable]`/`#[Hidden]`, `casts()`), the class-based Livewire component convention, and the artisan-first/test-first quality gates.
- [Code style](conventions/code-style.md) — line-level conventions (explicit types, braces, shared validation traits, PHPDoc array shapes, per-method action injection), each with a real ✅/❌ pair.
- [Naming](conventions/naming.md) — class/file naming, Livewire component ↔ view naming, validation-trait naming, route naming, boolean property naming.

## Testing

- [Testing index](testing/README.md) — how to write, review, and run tests in this repo: testing philosophy and anti-patterns, a QA risk-based thinking guide, Pest 4 backend conventions, and CI commands/coverage. Start there; it links out to `.claude/skills/pest-testing/SKILL.md` for basic Pest syntax rather than duplicating it.
- [Frontend / browser testing guide](testing/frontend/README.md) — QA-oriented guide for browser-level tests: the tooling decision (Pest 4 browser testing, not a separate Playwright/BDD runner), the user-story → Gherkin → Pest workflow and reference prompt, setup status, Gherkin guidelines + domain glossary, a browser-specific quality checklist, the frontend coverage policy, and worked scenario/test examples.

## Decisions

- [Decision records](decisions/README.md) — ADR format and folder purpose. First ADR recorded: [0001 — UUID primary keys](decisions/0001-uuid-primary-keys.md) (UUIDv7 via `HasUuids` for `users` and PRD Epic 2/4 domain entities).

## Errors log

- [Errors log](errors-log.md) — structured record of real mistakes and the rule adopted to avoid repeating them. Empty so far.

_Last updated: 2026-07-21 — Referenced the new ADR 0001 (UUID primary keys) in Decisions; corrected the Authorization index line — `HasRoles` is attached to `User` today._
