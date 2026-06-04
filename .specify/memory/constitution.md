# Realista Constitution

## Core Principles

### I. Hexagonal Architecture (NON-NEGOTIABLE)
Domain logic must have zero framework dependencies. Ports define interfaces; adapters implement them. Aggregates, value objects, and domain services live in the domain layer. Infrastructure (DB, HTTP, external APIs) lives in adapters. No domain code imports from Express, Prisma, SvelteKit, or any infrastructure concern.

### II. Test-First (NON-NEGOTIABLE)
TDD mandatory: tests written → tests fail → implement → green → refactor. Feature-slice TDD: each feature slice (Listing Lens, Mortgage Compass, Dashboard) follows the full red-green-refactor cycle. Coverage target: 80%+ for domain layer. Tests co-located with source files (`*.test.ts` next to `*.ts`).

### III. Educational, Not Commercial
Realista is an educational tool for Spanish first-time home buyers. It never provides financial advice, broker recommendations, or commercial referrals. All outputs are educational narratives — never prescriptive. The user decides; we illuminate options.

### IV. Privacy & Legal Compliance
No storage of third-party content (listing HTML, scraped text). Only analysis results persisted. User-Agent: `Realista/1.0 (analizador educativo)`. Rate limiting: max 20 analyses/day per user. MIT license with NOTICE.md attribution for `@avena/score`.

### V. Mobile-First PWA
SvelteKit PWA, installable, responsive. Target: mobile (primary), desktop (secondary). Zero app store friction. Service worker for offline capability where possible.

### VI. YAGNI & Future-Proof
No auth for MVP — anonymous sessions with UUID. Data model includes nullable `userId` for future auth. No premature optimization. No speculative features. Build what's needed now, design for what's likely next.

## Technical Constraints

- **Stack:** SvelteKit (frontend + BFF) → Node.js/Express (backend) → PostgreSQL + Prisma ORM
- **Testing:** Vitest (unit + integration), Playwright (E2E)
- **CI/CD:** Lint → typecheck → unit tests → integration tests → build → E2E → deploy
- **Secrets:** Environment variables via GitHub Actions secrets. No secrets in code.
- **AI:** LLM-driven listing analysis via system prompt. Fallback chain: LLM → `@avena/score` → manual text paste.

## Development Workflow

- Feature branches from `main`
- `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
- Each feature slice is independently testable and deployable
- Code review required before merge to main
- CI must pass (lint + typecheck + tests) before merge

## Governance

This constitution supersedes all other development practices. Amendments require documentation in `.specify/memory/` and a migration plan for affected code. All PRs must verify compliance with Core Principles I-VI. Complexity must be justified against the YAGNI principle.

**Version**: 1.0.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-04