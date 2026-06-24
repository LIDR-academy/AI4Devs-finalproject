<!--
Sync Impact Report
==================
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections:
  - Core Principles (7): Spec-First, Clean Architecture, API-First,
    Domain-Driven Design, Testing Discipline, Security by Default, Observability
  - Technology Constraints
  - Development Workflow
  - Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (already aligned — Constitution Check section present)
  - .specify/templates/spec-template.md ✅ (already aligned — requirements use MUST language)
  - .specify/templates/tasks-template.md ✅ (already aligned — phased delivery matches principles)
- Follow-up TODOs: None
-->

# StayHub Constitution

## Core Principles

### I. Specification-First

Every feature MUST begin with a written specification before any
implementation work starts. Specifications define user stories,
acceptance scenarios, functional requirements, and success criteria.
Code without a corresponding spec is considered unauthorized work.

Rationale: AI-assisted development workflows depend on clear,
unambiguous specifications to produce correct implementations.
Specifications also serve as the single source of truth for
scope and acceptance.

### II. Clean Architecture

The system MUST follow a layered architecture with explicit
dependency rules:

- **Domain layer**: Pure business logic, no framework dependencies
- **Application layer**: Use cases orchestrating domain objects
- **Infrastructure layer**: Framework adapters, persistence, external services
- **Presentation layer**: Controllers, views, API endpoints

Dependencies MUST point inward only (outer layers depend on inner
layers, never the reverse). Each layer communicates through
well-defined interfaces/ports.

### III. API-First Design

All service boundaries MUST be defined by API contracts before
implementation begins. Contracts include:

- Endpoint paths, HTTP methods, and status codes
- Request/response schemas with types and validation rules
- Error response formats
- Authentication/authorization requirements

Backend and frontend teams MAY work in parallel once contracts
are agreed upon. Contract changes require explicit versioning.

### IV. Domain-Driven Design

The system MUST model its core domain explicitly with:

- Bounded contexts separating Host, Guest, Booking, Property,
  and Review concerns
- Ubiquitous language shared between specifications, code, and
  team communication
- Aggregates protecting invariants at transactional boundaries
- Domain events for cross-context communication

Rationale: A vacation rental marketplace has complex domain rules
around availability, pricing, booking lifecycle, and multi-party
interactions that require explicit modeling.

### V. Testing Discipline

Every feature MUST include tests that verify acceptance scenarios
from the specification. The testing strategy follows:

- **Unit tests**: Domain logic and use cases (fast, isolated)
- **Integration tests**: Repository adapters, external service
  clients (real dependencies via containers)
- **Contract tests**: API endpoint compliance with defined contracts
- **E2E tests**: Critical user journeys through the full stack

Tests MUST be written for the acceptance scenarios defined in the
spec. Test coverage is measured by scenario coverage, not line
coverage.

### VI. Security by Default

All features MUST implement security controls appropriate to a
platform handling user PII and financial transactions:

- Authentication required for all non-public endpoints
- Authorization enforced at the use-case level (not just controllers)
- Input validation at system boundaries (API layer)
- Secrets MUST NOT appear in code, logs, or version control
- OWASP Top 10 vulnerabilities MUST be addressed by design

### VII. Observability

Production systems MUST emit structured, queryable signals:

- **Structured logging**: JSON format with correlation IDs across
  service boundaries
- **Health checks**: Readiness and liveness endpoints for all services
- **Error tracking**: Unhandled exceptions reported with full context
- **Request tracing**: Every API request MUST carry a trace ID
  through all layers

Rationale: AI-assisted development can produce correct code quickly,
but production debugging requires visibility into runtime behavior.

## Technology Constraints

The following technology choices are binding for this project:

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React / Next.js | Latest stable |
| Backend | Spring Boot / Kotlin | 4.x |
| Database | PostgreSQL | 16+ |
| Build (BE) | Gradle (Kotlin DSL) | Latest stable |
| Build (FE) | npm / pnpm | Latest stable |
| Containerization | Docker + Docker Compose | Latest stable |
| CI/CD | GitHub Actions | N/A |

Additional constraints:

- TypeScript MUST be used for all frontend code (no plain JS)
- Kotlin coroutines MUST be used for async operations on the backend
- Database migrations MUST use Flyway or Liquibase
- All services MUST be containerized for local development

## Development Workflow

All work MUST follow this sequence:

1. **Specify** — Write or update the feature spec (`/speckit-specify`)
2. **Clarify** — Resolve ambiguities via structured questions (`/speckit-clarify`)
3. **Plan** — Produce implementation plan with contracts and data model (`/speckit-plan`)
4. **Tasks** — Generate ordered task list from the plan (`/speckit-tasks`)
5. **Implement** — Execute tasks following plan structure (`/speckit-implement`)

Additional workflow rules:

- Every feature MUST live on a dedicated branch
- Commits MUST be atomic and reference the task ID
- Pull requests MUST use the template at `.github/pull_request_template.md`,
  which requires: a clear title, what/why/impact description, and a reference
  to the corresponding user story or task
- Pull requests MUST pass all automated checks before merge
- Code review is mandatory for all changes to `main`

## Governance

This constitution is the highest-authority document for project
development decisions. When in conflict with other guidance,
the constitution prevails.

### Amendment Process

1. Propose amendment with rationale in writing
2. Assess impact on existing specifications and implementations
3. Update constitution with new version number
4. Propagate changes to affected templates and artifacts
5. Document the change in the Sync Impact Report

### Versioning Policy

Constitution versions follow semantic versioning:

- **MAJOR**: Principle removed, redefined, or made backward-incompatible
- **MINOR**: New principle or section added, material expansion
- **PATCH**: Wording clarification, typo fix, non-semantic refinement

### Compliance

- All specifications MUST reference applicable principles
- Plan Constitution Check MUST verify alignment before implementation
- Pull request reviews MUST verify principle compliance

**Version**: 1.0.1 | **Ratified**: 2025-05-17 | **Last Amended**: 2025-05-17
