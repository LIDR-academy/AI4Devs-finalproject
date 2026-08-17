<!--
  Sync Impact Report — v0.0.0 → v1.0.0
  - Initial population from template (all placeholders replaced)
  - Principles added: 5 core (Domain Purity, Test-First, Security-by-Default,
    UX Consistency, Observability) + 2 additional sections (Security Requirements,
    Development Workflow & Quality Gates)
  - Templates reviewed: plan-template.md, spec-template.md, tasks-template.md —
    all compatible with new constitution; no changes needed
  - No templates required updates
  - Version bump: MAJOR (initial populated version)
-->

# Coacher Constitution

## Core Principles

### I. Domain Purity (NON-NEGOTIABLE)

The domain layer (`src/domain/`) MUST contain zero infrastructure dependencies — no Express,
no Prisma, no Zod, no HTTP concepts. Domain entities and domain services MUST be pure TypeScript
classes and functions. Business rules (capacity validation, overlap checking, level reach
calculation, waiting-list engine) MUST live in domain services, NOT in application use cases
or infrastructure adapters. Any import from Prisma, Express, or Zod in the domain layer is an
automatic review rejection.

### II. Test-First for Domain Logic (NON-NEGOTIABLE)

Every domain service MUST have its acceptance scenarios specified as Given/When/Then in the
feature spec BEFORE implementation begins. Tests MUST be written and confirmed failing before
the corresponding production code is written (Red-Green-Refactor). Minimum coverage:
- Domain services: 100% branch coverage (all business rule branches — capacity limits,
  overlap scenarios, level reach boundaries, waiting list full/join/leave)
- Application use cases: happy path + every error code path (each 4xx/5xx response)
- Integration (API): every endpoint in the API spec MUST have at least one happy-path test
  and one validation-error test via Supertest

Coverage below 90% overall on `vitest run --coverage` MUST be justified in writing.

### III. Security-by-Default

Every API endpoint MUST enforce authentication and authorization at the middleware level —
no endpoint (except `POST /auth/login` and `GET /health`) MAY be accessible without a valid JWT,
and every protected endpoint MUST have a `requireRole` guard for its minimal required role. The
OWASP Top 10 2025 is the reference threat model (see PRD Section 10 for per-risk mitigations).
Specific MUST items:
- Passwords hashed with bcrypt cost factor 12
- All Zod schemas MUST reject unexpected fields (`strict()` or `.strip()` only with explicit
  justification)
- No secrets, stack traces, or internal paths in error responses
- Google Calendar event titles identify the class: individual classes use "coachee name - level", group classes use "Group class - level"; the event description includes the assigned coach, recurrence status, user notes, and (for group classes) the enrolled coachees
- Coach financial data MUST be AES-256-GCM encrypted at rest

### IV. API Contract Consistency

Every API response MUST use the standard envelope: success arrays use `{ data: [...], meta: {...} }`,
single resources return the resource object directly, and errors use
`{ error: { code, message, ref } }`. All endpoints live under `/api/v1/` prefix. New endpoints
MUST be documented in `docs/api-specifications.md` before implementation. Breaking changes to the
API contract MUST be reviewed and version-bumped.

### V. Dependency Integrity

All npm dependencies MUST be pinned to exact versions (no `^` or `~` ranges committed to `main`).
The lockfile MUST be committed. Every PR MUST pass `npm audit --audit-level=high` (or equivalent)
before merge. No raw SQL — all database access MUST use Prisma's parameterized queries.
No vendored tarballs, git dependencies, or unpublished packages.

## Security Requirements

These controls are mandatory and are derived from the PRD Section 10 (OWASP Top 10 2025) threat
analysis:

1. **Rate limiting**: `express-rate-limit` at 100 req/min globally, 10 req/min on `/auth/login`.
2. **Security headers**: All 7 headers from PRD Section 10.7 (HSTS, X-Content-Type-Options,
   X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy) MUST be set on every response.
3. **Error handling**: No information leakage — 401 always says "Invalid credentials" regardless
   of whether the email exists. 503 for external dependency failures. Stack traces NEVER exposed.
4. **Secrets management**: Every non-public value (Service Account key, DB URL, JWT secret,
   encryption key) MUST be injected via environment variable — never committed, never in code.
5. **Security event logging**: Every auth attempt (success + failure), class creation/cancellation,
   waiting list join/leave, role/level change, and access to coach financial data MUST be logged
   with actor ID, action, resource, and outcome.

## Performance & UX Requirements

1. Google Calendar is the scheduling single source of truth, accessed EXCLUSIVELY server-side via
   a Service Account. No Google Calendar API call MAY originate from the browser.
2. Calendar "free/busy" queries for the Add Class modal MUST respond within 500ms p95. If Google
   Calendar latency exceeds this, implement server-side caching before degrading the user
   experience.
3. The Coachee experience MUST be mobile-first and installable as a PWA.
4. All class durations are ALWAYS 60 minutes — this is a hard domain invariant, not a configurable
   value.
5. Gym capacity limits (max 2 individual + 1 group simultaneous) MUST be enforced by domain
   services, not by the database or application layer.

## Governance

The Constitution is the highest governing document of this project. It supersedes all other
conventions, style guides, and local practices. Any deviation from a MUST requirement MUST be
documented with written justification in the relevant spec's `plan.md` under "Complexity
Tracking". All AI-generated code and AI-assisted PRs MUST pass a constitution compliance review
before merge.

**Amendment process**:
- Propose changes as a PR to `.specify/memory/constitution.md`.
- Changes must be reviewed by at least one other team member.
- MAJOR version (breaking governance or principle removals): requires team consensus.
- MINOR version (new principle/section): requires one approving review.
- PATCH version (clarifications, typos): may be self-merged.

**Version**: 1.0.0 | **Ratified**: 2026-07-09 | **Last Amended**: 2026-07-09