# Project Context

## Source Alignment

This project context is consolidated from:

- `README.md` for scope, architecture decisions, tickets, and traceability
- `prompts.md` for prompt iteration history and product shaping decisions
- `planning/local-kanban.md` and `planning/plan-inicial-mvp.md` for sprint sequencing and execution policy

---

## Product Definition

ProjectScope AI is an MVP platform for software project estimation that combines:

- human effort estimation by role and phase
- AI usage estimation through projected token consumption
- roadmap generation with phases and deliverables
- cost projection for planning decisions

The product is intentionally scoped to one complete E2E flow.

---

## Users and Value

| User Type | Main Value |
|---|---|
| Developer | Better technical scope framing before implementation |
| Tech Lead | Role-based effort planning and delivery sequencing |
| Project Manager | Roadmap and budget visibility |
| Consulting Team | Repeatable estimation baseline across projects |

---

## MVP Scope (From README and Prompts)

Must-have flow:

1. create project
2. add use cases
3. select roles
4. trigger estimation
5. review report

Output expectations:

- roadmap phases and deliverables
- hours by role
- projected tokens and cost
- assumptions and risks

Scope exclusions for MVP:

- no heavy external integrations in core flow
- no complex asynchronous orchestration
- no advanced enterprise controls in first increment

---

## Prompt-Driven Product Decisions

From `prompts.md`, key decisions captured and kept in scope:

- one high-value E2E flow to avoid scope creep
- architecture simplification (no microservices, no queue-first design)
- practical output over theoretical precision
- roadmap-first estimation narrative for business usability

---

## Planning Baseline (From Local Planning)

Execution plan is organized in 3 sprints:

### Sprint 1 - Base functionality

- T01 data model and migrations
- T02 core project API
- T05 project form
- T06 use-case form

Goal: project and use cases persisted end-to-end.

### Sprint 2 - Estimation core

- T03 estimation endpoint with Azure OpenAI
- T04 prompt contract and parse reliability
- T07 role selection and estimation trigger
- T08 report view

Goal: complete estimation generation and display.

### Sprint 3 - Quality and deploy

- T09 unit tests
- T10 integration tests
- T11 E2E flow test
- T12 deploy and environment setup

Goal: stable validated MVP in public environment.

---

## Business Rules

| Rule ID | Rule |
|---|---|
| BR-001 | Project requires name and description before estimation |
| BR-002 | At least one use case is required |
| BR-003 | At least one role must be selected |
| BR-004 | Estimation output must include phases, effort, tokens, assumptions, and risks |
| BR-005 | Token and cost are projected values, not exact provider billing |
| BR-006 | AI output must be understandable and reviewable by users |

---

## Technical Constraints

- implementation window around 30 hours
- Node + React fullstack TypeScript
- PostgreSQL as source of truth
- functional code style (no class-based architecture)
- backend-owned prompt and AI integration
- frontend test IDs required for future automation framework

---

## Quality and Security Expectations

- validate all API payloads
- normalize and validate AI output before persistence
- safe error responses for provider failures/timeouts
- no secrets in repository or frontend
- coverage for critical path through unit, integration, and E2E testing

---

## Current Risks

| Risk | Impact |
|---|---|
| AI output variability | inconsistent estimate quality |
| prompt drift | parser failures or missing fields |
| scope pressure | delayed delivery or unfinished critical flow |
| projected token mismatch | budget expectation gaps |

---

## Next Evolution

After MVP validation, likely next increments:

1. async estimation processing
2. real token metering from API usage
3. integration adapters via MCP boundary
4. historical estimate comparison and recalibration

---

## Final Context Statement

ProjectScope AI is a pragmatic MVP focused on delivering one reliable estimation workflow with functional code, clean boundaries, and clear traceability from prompts to planning to implementation.