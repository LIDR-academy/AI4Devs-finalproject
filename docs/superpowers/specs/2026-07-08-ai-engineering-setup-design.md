# AI Engineering Setup for Realista — Design

**Date**: 2026-07-08
**Author**: Daniel Miguel Margenta (DMM)
**Branch**: `feature-entrega2-DMM`
**Status**: Approved
**Related**: `specs/001-realista-mvp/spec.md` (Entrega 1), `readme.md`, `prompts.md`

## Purpose

Establish the AI engineering infrastructure for the second delivery of Realista:

1. **Scaffolds** of the application code (backend, frontend, e2e) — functional in local dev, not production-hardened.
2. **AI Technical Components** that govern how the model is invoked during the build: agents, subagents, commands, playbooks, prompt-runs, skills, hooks.
3. **Harness** documentation describing the technical support of the project.
4. **Self-documentation** system that produces evidence (prompt + what was done + deliverables) per task.
5. **Documentation refresh** of `readme.md` and `prompts.md` to reflect the new components.

## Scope

All 6 user stories from `specs/001-realista-mvp/spec.md` at MVP level (minimal functional complete):

- **US1** Listing Lens (P1)
- **US2** Mortgage Compass (P1)
- **US3** Dashboard (P2)
- **US4** Negotiation Assistant (P2, Should-Have)
- **US5** Timeline (P3)
- **US6** Checklist (P3)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Spec tooling | Keep `spec-kit` (GitHub SDD) | Already used in Entrega 1; OpenSpec/BeMac unrecognised, no migration value. |
| Implementation order | Story-by-story TDD | Matches tasks.md phasing; allows incremental validation. |
| External APIs | Real by default + mocks in tests | OpenRouter (real key), Nominatim (free), Catastro (real, fallback to mock on SEC failure). |
| Local DB | PostgreSQL 16 via Docker Compose | Most faithful to production; reproducible across team. |
| Self-documentation | OpenCode skill `auto-evidence` + `docs/evidence/` | Native to the tool, version-controlled, indexable. |
| AI components location | `.opencode/` at repo root | Native to OpenCode, isolated from app code. |
| Agent granularity | 4 high-level agents | Avoids over-decomposition; each agent has a clear contract. |
| Hooks | Documentation + optional scripts | OpenCode has no native hook runner; provide intent + example scripts. |
| Branch strategy | Single `feature-entrega2-DMM` branch | Cohort convention; sub-PRs per US possible. |

## Repository Structure

```
.
├── .opencode/                          # AI engineering components
│   ├── agents/                         # 4 high-level agents
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   ├── documenter.md
│   │   └── orchestrator.md
│   ├── commands/                       # Slash commands
│   │   ├── analyze-listing.md
│   │   ├── review-pr.md
│   │   ├── document-task.md
│   │   ├── check-architecture.md
│   │   ├── generate-adr.md
│   │   ├── scaffold-story.md
│   │   ├── sprint.md
│   │   └── evidence-report.md
│   ├── skills/                         # Encapsulated behaviours
│   │   ├── auto-evidence.md
│   │   ├── tdd-cycle.md
│   │   ├── hexagonal-check.md
│   │   ├── adr-suggest.md
│   │   ├── pwa-shell.md
│   │   └── prisma-migrate.md
│   ├── hooks/                          # Automation triggers
│   │   ├── post-commit.md
│   │   ├── pre-push.md
│   │   ├── post-merge.md
│   │   └── on-save-svelte.md
│   ├── playbooks/                      # Multi-step flows
│   │   ├── full-story.md
│   │   ├── adr-lifecycle.md
│   │   └── release.md
│   ├── prompts/                        # Prompt-runs (LLM templates)
│   │   ├── llm-system-listing.md
│   │   ├── llm-system-location.md
│   │   └── narrative-templates.md
│   ├── harness/                        # Technical support docs
│   │   ├── README.md
│   │   ├── stack.md
│   │   ├── env-vars.md
│   │   ├── test-strategy.md
│   │   ├── run-locally.md
│   │   └── troubleshooting.md
│   └── config.yaml
│
├── docs/
│   ├── evidence/                       # Per-task evidence
│   │   ├── INDEX.md
│   │   └── YYYY-MM-DD-HHMM-<task-id>.md
│   ├── superpowers/
│   │   ├── specs/                      # Brainstorming design docs
│   │   └── plans/                      # Implementation plans
│   ├── adr/                            # Existing ADRs
│   ├── constitution.md
│   └── domain-events.md
│
├── specs/001-realista-mvp/             # spec-kit artefacts (existing)
│
├── backend/                            # Hexagonal backend
│   ├── src/
│   │   ├── domain/
│   │   │   ├── aggregates/             # User, PurchaseProcess, AnalyzedListing, RedFlag, Checklist, PortalHealthCheck
│   │   │   ├── value-objects/          # TransparencyScore, RedFlags, Coordinates, FinancialProfile, HiddenCosts, BureaucraticMilestone, SnapshotHash
│   │   │   ├── ports/                  # ListingAnalyzerPort, LocationResolverPort, CatastroPort, MortgageCalculatorPort, NotificationPort
│   │   │   ├── services/               # AnalyzeListingUseCase, AutoAttachService, DiffService, HiddenCostsCalculator, AmortizationCalculator, InvestmentCalculator, NarrativeGenerator, ProgressEvents
│   │   │   └── errors/
│   │   ├── adapters/                   # OpenRouter, Cheerio, DeclaredLocation, Geocoding, Catastro, MiraTuZona, Notification
│   │   ├── api/                        # routes/, controllers/, middleware/, progressEmitter.ts
│   │   ├── infrastructure/             # prisma/, config/, utils/
│   │   └── index.ts
│   ├── tests/                          # unit/, integration/, contract/
│   ├── prisma/schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                           # SvelteKit PWA
│   ├── src/
│   │   ├── routes/                     # +layout, +page (dashboard), listing-lens/, mortgage-compass/, timeline/, checklist/
│   │   ├── lib/                        # stores/, api/, components/, utils/
│   │   ├── service-worker.ts
│   │   └── app.css
│   ├── static/                         # manifest, icons
│   ├── tests/                          # unit/, e2e/
│   ├── package.json
│   ├── vite.config.ts
│   ├── svelte.config.js
│   ├── vitest.config.ts
│   └── playwright.config.ts
│
├── e2e/                                # Playwright E2E
│   ├── flows/
│   └── playwright.config.ts
│
├── docker-compose.yml                  # postgres:16-alpine + adminer
├── .env.example
├── .github/workflows/ci.yml
├── readme.md
├── prompts.md
├── AGENTS.md
├── LICENSE
└── NOTICE.md
```

## The Four Agents

| Agent | File | Contract |
|---|---|---|
| **implementer** | `.opencode/agents/implementer.md` | Input: task-id + US context. Output: tests (failing first), then domain code, adapters, endpoints, UI. Invokes: `tdd-cycle`, `auto-evidence`. |
| **reviewer** | `.opencode/agents/reviewer.md` | Input: diff or branch. Output: findings categorised (critical/important/minor) + proposed fixes. Invokes: `hexagonal-check`, `adr-suggest`. |
| **documenter** | `.opencode/agents/documenter.md` | Input: change set. Output: updates to `readme.md`, `prompts.md`, new ADR proposal, evidence index refresh. |
| **orchestrator** | `.opencode/agents/orchestrator.md` | Input: US id. Output: sequenced plan, handoffs between agents, state tracking against `tasks.md`. |

## Skills

| Skill | Purpose | Trigger |
|---|---|---|
| `auto-evidence` | Generate `docs/evidence/<timestamp>-<task-id>.md` with prompt, actions, deliverables, test results, commits | End of each task |
| `tdd-cycle` | Enforce red→green→refactor with 80% domain coverage target | Each `implementer` invocation |
| `hexagonal-check` | Verify `domain/` has zero framework dependencies (no Express, Prisma, SvelteKit, fetch) | Pre-commit + `reviewer` |
| `adr-suggest` | Detect undocumented architectural decisions and propose ADR | In `reviewer` and `documenter` |
| `pwa-shell` | Generate PWA manifest, service worker, icons for SvelteKit | Initial setup |
| `prisma-migrate` | Create safe Prisma migrations with naming convention and rollback procedure | Schema changes |

## Commands

| Command | Usage |
|---|---|
| `/analyze-listing <url>` | Full Listing Lens flow (fetch + LLM + location + catastro + progress events) |
| `/review-pr` | Run `reviewer` on staged diff |
| `/document-task <task-id>` | Generate evidence for a specific task |
| `/check-architecture` | Run `hexagonal-check` over the repo |
| `/generate-adr <title>` | Draft a new ADR following the template |
| `/scaffold-story <us-id>` | Create folder structure for a US (empty tests + domain + adapters + UI) |
| `/sprint <us-id>` | Orchestrate `scaffold-story` → `implementer` → `reviewer` → `documenter` → evidence |
| `/evidence-report` | Generate aggregate report of `docs/evidence/` for final delivery |

## Playbooks

Multi-step orchestrations that chain agents:

- **`full-story.md`** — `scaffold-story` → `implementer` (with `tdd-cycle`) → `reviewer` (with `hexagonal-check`) → `documenter` (with `auto-evidence`) → `git commit`
- **`adr-lifecycle.md`** — Detection → proposal → review → commit → mention in evidence
- **`release.md`** — Tag → CHANGELOG → version bump in `package.json` → note in `readme.md`

## Prompt-Runs

LLM instruction templates that the agents send to models:

- **`llm-system-listing.md`** — System prompt for the Listing Lens analyzer (red flag detection, JSON output with `reasoning: string` per flag, FR-025)
- **`llm-system-location.md`** — Reference: original vision-location prompt, removed per FR-016. Kept for historical context.
- **`narrative-templates.md`** — Mortgage Compass narrative templates indexed by `(persona, scenario)` (FR-013)

## Hooks

Event triggers (with intent + script snippets — OpenCode has no native hook runner, so these are documented as runnable commands):

- **`post-commit`** — `npm run lint && npm run typecheck && npm test` in `backend/` and `frontend/`
- **`pre-push`** — Full test suite + Playwright E2E
- **`post-merge`** — Regenerate `docs/evidence/INDEX.md`
- **`on-save-svelte`** — `svelte-check` on `.svelte` files

## Harness Documentation

Located in `.opencode/harness/`:

- **`README.md`** — Harness overview
- **`stack.md`** — Exact versions, compatibility matrix
- **`env-vars.md`** — `OPENROUTER_API_KEY`, `DATABASE_URL`, `PORT`, `FRONTEND_URL`, etc.
- **`test-strategy.md`** — TDD workflow, 80% domain coverage, Vitest + Playwright
- **`run-locally.md`** — `docker compose up -d && npm install && npm run db:migrate && npm run dev`
- **`troubleshooting.md`** — Common errors (CORS, Catastro throttling, LLM rate limit, etc.)

## Self-Documentation System

Each task produces an evidence file at `docs/evidence/YYYY-MM-DD-HHMM-<task-id>.md` with:

```markdown
# Evidence: <task-id> — <title>

**Date**: 2026-07-08 14:30
**Agent**: implementer
**Story**: US1
**Branch**: feature-entrega2-DMM

## Prompt (verbatim)
> The exact user prompt that triggered this work.

## What was done
- Bulleted actions

## Deliverables
- `path/to/file.ts` (new)
- `path/to/file.test.ts` (new)

## Tests
- Unit: 5/5 passing
- Integration: 2/2 passing
- Domain coverage: 92%

## Commits
- `abc1234 feat(domain): add TransparencyScore value object with 0-100 validation`

## Notes
- Anything relevant for future reference
```

`docs/evidence/INDEX.md` is auto-updated with each new evidence file.

## Documentation Updates

### `readme.md` new/updated sections
- 0. Ficha — update URL, branch
- 1.4 Instalación — quickstart with Docker Compose
- 1.3 UX — screenshots once UI exists
- **New section 8: AI Engineering Setup** — pointer to `.opencode/`
- 5/6/7 Tickets & PRs — add Entrega 2 entries

### `prompts.md` new/updated sections
- 2. Subagentes — catalogue of 4 agents
- 3. Workflows — add `full-story`, `adr-lifecycle`, `release`
- 4. Herramientas — add OpenCode agents/commands/skills/hooks
- 5. Procesos — add self-documentation process
- **New section 9: Componentes de IA (Entrega 2)** — describes `.opencode/`, `docs/evidence/`, harness

## Branch and Versioning

- All work on `feature-entrega2-DMM` (current)
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- Optional sub-PRs per US into the feature branch
- Final tag: `entrega2-DMM` when complete

## Execution Order (story-by-story TDD)

1. Scaffold base — structure, docker-compose, .env.example, package.json, tsconfig, vitest configs
2. Foundational — Prisma schema, migrations, session middleware, rate limiter, error handler, layout shell, API client, session store (T002–T022)
3. US1 Listing Lens — value objects, ports, adapters, use case, route, UI (T023–T044)
4. US2 Mortgage Compass — value objects, calculators, use cases, route, UI (T045–T068)
5. US3 Dashboard — aggregate endpoint, integration, UI (T069–T081)
6. US4 Negotiation Assistant — endpoint, templates, UI (T082–T094)
7. US5 Timeline — templates, route, UI (T095–T107)
8. US6 Checklist — model, endpoint, route, UI (T108–T127)

Each step generates evidence with `auto-evidence` skill.

## Out of Scope (Explicit)

- Production deployment
- Authentication (userId nullable for future)
- Internationalisation beyond Spanish (per Constitution Principle III)
- Native mobile apps (PWA only, per Constitution Principle V)
- Real-time notifications (FR future)
- Any new external API beyond the three already used

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Scope creep from 6 US in one delivery | Story-by-story TDD; each story independently shippable; skip stories if time-constrained. |
| OpenRouter API cost in dev | Use cheaper models during development; cache LLM responses in tests; mock in CI. |
| Catastro SEC throttling | Documented in `troubleshooting.md`; FR-027 portal health monitoring in place. |
| OpenCode hook runner absence | Hooks documented as runnable scripts; CI pipeline covers post-commit/pre-push behaviour. |
| E2E flakiness on real APIs | E2E uses mocks by default; real API E2E runs in nightly only. |
