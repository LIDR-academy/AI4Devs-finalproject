# EventFlow Skill — User Story to Development Tasks

## Purpose

This skill transforms an approved EventFlow User Story and, when available, its Technical Specification into implementation-ready Development Tasks.

Its purpose is to generate a complete, traceable, and actionable task breakdown for human developers and AI coding agents.

The preferred flow is:

```text
Approved User Story
→ Technical Specification
→ Development Tasks
```

This skill must treat the Technical Specification as the primary implementation source when it exists.

This skill must also use the Product Backlog Prioritized as the source of truth for execution order.

The User Story ID does not define execution order.

The Product Backlog ID defines execution order.

This skill does not approve User Stories.

This skill does not generate Technical Specifications.

This skill does not modify User Story files.

This skill does not modify Technical Specification files.

This skill does not modify Decision Resolution artifacts.

This skill does not write production code.

---

## When to Use This Skill

Use this skill after the User Story has been approved and, preferably, after a Technical Specification has been generated.

Recommended EventFlow workflow:

```text
1. eventflow-user-story-refinement
2. eventflow-po-ba-decision-resolver, if needed
3. eventflow-user-story-refinement, optional second pass
4. eventflow-user-story-approval
5. eventflow-user-story-technical-spec
6. eventflow-user-story-to-development-tasks
```

Typical usage with Technical Specification:

```text
Use the eventflow-user-story-to-development-tasks skill.

Generate Development Tasks from:

management/technical-specs/P0/PB-P0-001/US-099-technical-spec.md
```

Alternative usage with User Story:

```text
Use the eventflow-user-story-to-development-tasks skill.

Generate Development Tasks for:

management/user-stories/US-099.md
```

If the user provides a User Story path, this skill must check if the Technical Specification exists under the Product Backlog folder and use it if available.

---

## Key Ordering Principle

Do not order Development Tasks by User Story number alone.

Use this source as the canonical execution order:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

The correct execution order is:

```text
Priority → Backlog ID → User Story position inside Related User Stories → Task dependency order
```

Example:

```text
PB-P0-001 — Database Schema, Migrations & Constraints
Related User Stories: US-099, US-100, US-101, US-102
```

This means `US-099` is not being executed because it is numerically 099.

It is being executed because it belongs to the first prioritized backlog item:

```text
PB-P0-001
```

---

## Expected Input

The user may provide one of these inputs:

### Preferred Input

```text
management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
```

Example:

```text
management/technical-specs/P0/PB-P0-001/US-099-technical-spec.md
```

### Alternative Input

```text
management/user-stories/<USER_STORY_ID>.md
```

If the user provides a Technical Specification path:

1. Extract the User Story ID.
2. Extract Priority and Backlog ID from the path if present.
3. Validate against Product Backlog Prioritized.
4. Use the Technical Specification as the primary source.

If the user provides a User Story path:

1. Extract the User Story ID.
2. Search for the User Story inside Product Backlog Prioritized.
3. Resolve Priority and Backlog ID.
4. Check whether the Technical Specification exists at:

```text
management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
```

5. If found, use it as the primary source.
6. If not found, proceed from the User Story only if safe and warn:

```text
Technical Specification not found. Generating tasks directly from the User Story may produce less precise implementation tasks.
```

Fallback Technical Spec search path:

```text
management/technical-specs/unmapped/<USER_STORY_ID>-technical-spec.md
```

---

## Required Backlog Lookup

The skill must read:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

It must identify:

| Field                               | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| Priority                            | P0 / P1 / P2 / P3 / P4                                   |
| Backlog ID                          | Example: PB-P0-001                                       |
| Backlog Title                       | Title of the backlog item                                |
| Backlog Execution Order             | Numeric order derived from backlog position              |
| Epic                                | Epic listed in the backlog item                          |
| Related User Stories                | All US IDs grouped under the same backlog item           |
| User Story Position in Backlog Item | Position of the current US inside `Related User Stories` |
| Dependencies                        | Backlog dependencies                                     |
| Acceptance Summary                  | Acceptance summary from backlog item                     |
| Traceability                        | Traceability from backlog item                           |
| Notes                               | Notes from backlog item                                  |

If the User Story is not found in Product Backlog Prioritized:

* Continue only if the User Story or Technical Specification is otherwise valid.
* Mark `Backlog Alignment Status: Not Found`.
* Use fallback output path:

```text
management/development-tasks/unmapped/<USER_STORY_ID>-development-tasks.md
```

---

## Required Output File

If Product Backlog mapping is found, create or overwrite:

```text
management/development-tasks/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-development-tasks.md
```

Example:

```text
management/development-tasks/P0/PB-P0-001/US-099-development-tasks.md
```

If Product Backlog mapping is not found, create or overwrite:

```text
management/development-tasks/unmapped/<USER_STORY_ID>-development-tasks.md
```

If folders do not exist, create them.

Do not use the old flat path:

```text
management/development-tasks/<USER_STORY_ID>-development-tasks.md
```

unless explicitly requested by the user.

---

## Optional Consolidated Backlog Item Output

If the user explicitly asks to consolidate all tasks for a backlog item, create or overwrite:

```text
management/development-tasks/<PRIORITY>/<BACKLOG_ID>/tasks.md
```

Example:

```text
management/development-tasks/P0/PB-P0-001/tasks.md
```

This consolidated file must include or summarize tasks for all Related User Stories in the backlog item.

Do not create the consolidated file by default unless:

* The user asks for it.
* Or the skill is explicitly invoked with a Backlog ID instead of a single User Story.

---

## Source Priority

When generating Development Tasks, apply this source priority:

1. Technical Specification:

```text
management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
```

2. Decision Resolution artifact:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

3. Approved User Story:

```text
management/user-stories/<USER_STORY_ID>.md
```

4. Product Backlog Prioritized.
5. Accepted ADRs.
6. Epic Map.
7. Architecture and technical design documents.
8. Domain discovery and earlier analysis documents.

Do not reopen decisions already formalized in:

* Technical Specification.
* Decision Resolution artifact.
* Approved User Story.
* Accepted ADRs.

If the Technical Specification conflicts with older documentation but follows a formalized decision, keep the Technical Specification as the task-generation source and mark the conflict as:

```text
Documentation Alignment Required
```

Only block task generation if the conflict contradicts an accepted ADR, introduces scope creep, or creates implementation impossibility.

---

## Source of Truth

Use the official EventFlow documentation as source of truth:

```text
management/artifacts/Product-Backlog-Prioritized.md
management/artifacts/EventFlow-Epic-Map.md
management/templates/user-story.tpl.md
docs/1-Domain-Discovery-Report.md
docs/2-Product-Owner-Decisions.md
docs/3-MVP-Scope-Definition.md
docs/4-Business-Rules-Document.md
docs/5-User-Roles-Permissions-Matrix.md
docs/6-Domain-Data-Model.md
docs/7-AI-Features-Specification.md
docs/8-Use-Cases-Specification.md
docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md
docs/8.2-Documentation-Alignment-Review-Before-FRD.md
docs/9-Functional-Requirements-Document.md
docs/10-Non-Functional-Requirements.md
docs/11-Data-Seed-Strategy.md
docs/12-Architecture-Vision-and-Principles.md
docs/13-System-Architecture-Document.md
docs/14-Backend-Technical-Design.md
docs/15-Frontend-Architecture-Design.md
docs/16-API-Design-Specification.md
docs/17-AI-Architecture-and-PromptOps-Design.md
docs/18-Database-Physical-Design.md
docs/19-Security-and-Authorization-Design.md
docs/20-Testing-Strategy.md
docs/21-Deployment-and-DevOps-Design.md
docs/22-Architecture-Decision-Records.md
```

---

## Architecture Constraints

All Development Tasks must align with the established EventFlow architecture.

### Backend

Use and respect:

* Node.js.
* Express.js.
* TypeScript.
* Prisma.
* PostgreSQL.
* Modular Monolith.
* Clean / Hexagonal Architecture principles.
* Thin controllers.
* Application use cases.
* Repository layer through Prisma.
* DTOs and schemas where applicable.
* Zod validation.
* REST JSON API under `/api/v1`.

### Frontend

Use and respect:

* Next.js.
* TypeScript.
* App Router.
* Server Components for public/SEO flows where applicable.
* Client Components for authenticated workflows.
* TanStack Query.
* React Hook Form.
* Zod.
* Tailwind CSS / design tokens.
* next-intl.
* MSW for API mocking where applicable.

### AI / PromptOps

When applicable, align with:

* `LLMProvider` abstraction.
* `OpenAIProvider`.
* `MockAIProvider`.
* `AnthropicProvider` as stub/future only.
* Prompt versioning.
* `AIRecommendation`.
* Human-in-the-loop.
* Timeout/fallback behavior.
* JSON schema validation.
* Language propagation.
* No autonomous AI decisions.

### Security

When applicable, align with:

* HTTP-only cookies.
* Backend as authorization source of truth.
* RBAC.
* Ownership checks.
* Assignment-based authorization.
* Admin-scoped access.
* 401/403 negative scenarios.
* Audit through `AdminAction` where applicable.
* No tokens in localStorage.
* No secrets in repository.

### Testing

Align with:

* Vitest.
* Supertest.
* Playwright.
* MSW.
* MockAIProvider.
* Security negative tests.
* Accessibility tests where UI applies.
* Seed/demo verification where applicable.

---

## MVP Guardrails

Do not generate tasks that introduce:

* Real payments.
* Commissions.
* Signed contracts.
* E-signature.
* WhatsApp integration.
* Real-time chat.
* Native mobile app.
* Push notifications in MVP.
* Automatic currency conversion.
* Autonomous AI decisions.
* AI moderation of reviews.
* RAG / vector database.
* Enterprise multi-tenancy.
* Functional AnthropicProvider beyond approved stub.
* Google OAuth if marked Future.
* Vendor AI bio/package generation if marked Future.
* Vendor response to reviews if marked Future.
* Any other P4 / Future item unless explicitly promoted through ADR and PO approval.

If the Technical Specification or User Story references any of these items as out of scope, preserve them as out of scope and do not generate implementation tasks for them.

---

## Technical Specification Awareness

If a Technical Specification exists, every generated task must map back to one or more relevant Technical Specification sections.

Relevant sections include:

* Backlog Execution Context.
* Backend Technical Design.
* Frontend Technical Design.
* API Contract Design.
* Database / Prisma Design.
* AI / PromptOps Design.
* Security & Authorization Design.
* Testing Strategy.
* Observability & Audit.
* Seed / Demo Data Impact.
* Documentation Alignment Required.
* Technical Risks & Mitigations.
* Implementation Guidance for Coding Agents.
* Task Generation Notes.

The task output must explicitly include:

```text
Technical Spec Section(s)
```

for each task.

If no Technical Specification exists, use the User Story and decision artifacts as fallback sources and mark:

```text
Technical Specification used: No
```

---

## Task Categories

Generate tasks only in applicable categories:

* Product / Analysis.
* Backend.
* Frontend.
* API Contract.
* Database / Prisma.
* AI / PromptOps.
* Security / Authorization.
* QA / Testing.
* Seed / Demo Data.
* DevOps / Environment.
* Observability / Audit.
* Documentation / Traceability.

QA tasks are always required.

Security tasks are required when the story touches:

* Authenticated resources.
* Roles.
* Ownership.
* Assignment-based authorization.
* Admin actions.
* AI.
* File upload.
* Vendor data.
* Organizer data.
* Quote flows.
* Reviews.
* Notifications.
* Sensitive data.

Seed/demo tasks are required when the story affects:

* Demo flows.
* Seeded users.
* Events.
* Vendors.
* Quotes.
* Bookings.
* Reviews.
* Notifications.
* Admin metrics.
* AI outputs.
* E2E scenarios.

Observability/audit tasks are required when the story touches:

* Admin actions.
* AI actions.
* Security-sensitive flows.
* Critical backend operations.
* Error-prone integration flows.
* Business events relevant for audit/demo.

Documentation tasks are required when the story introduces or modifies:

* API contracts.
* Database schema.
* AI prompts.
* Security behavior.
* Seed/demo data.
* Architecture decisions.
* Documentation alignment issues.

---

## Task ID Format

Use this format:

```text
TASK-<BACKLOG_ID>-<USER_STORY_ID>-<AREA>-<NNN>
```

Examples:

```text
TASK-PB-P0-001-US-099-DB-001
TASK-PB-P0-001-US-099-QA-001
TASK-PB-P0-001-US-099-DOC-001
```

If the User Story cannot be mapped to a Backlog ID, use:

```text
TASK-UNMAPPED-<USER_STORY_ID>-<AREA>-<NNN>
```

Allowed area codes:

| Area                         | Code |
| ---------------------------- | ---- |
| Product / Analysis           | PO   |
| Backend                      | BE   |
| Frontend                     | FE   |
| API Contract                 | API  |
| Database / Prisma            | DB   |
| AI / PromptOps               | AI   |
| Security / Authorization     | SEC  |
| QA / Testing                 | QA   |
| Seed / Demo Data             | SEED |
| DevOps / Environment         | OPS  |
| Observability / Audit        | OBS  |
| Documentation / Traceability | DOC  |

---

## Task Ordering Rules

Tasks must be ordered by implementation dependency, not only by area.

Use this ordering when applicable:

1. Product / analysis clarification tasks.
2. Database / Prisma tasks.
3. Backend foundation tasks.
4. API contract tasks.
5. Security / authorization tasks.
6. AI / PromptOps tasks.
7. Frontend tasks.
8. Seed / demo tasks.
9. Observability / audit tasks.
10. QA / testing tasks.
11. Documentation / traceability tasks.

For foundation backlog items, respect the ordering defined in the Product Backlog.

For example, in P0 the suggested order is:

```text
DB → Backend → API → Security → AI → Frontend → Seed → DevOps base
```

Within a backlog item, also respect the position of the User Story in `Related User Stories`.

---

## Estimate Rules

Use this estimate scale:

| Estimate | Meaning                                       |
| -------- | --------------------------------------------- |
| XS       | Very small, focused change                    |
| S        | Small task, clear implementation              |
| M        | Medium task, meaningful implementation effort |
| L        | Large task, should be reviewed for splitting  |

Avoid generating tasks larger than `L`.

If a task would be larger than `L`, split it into smaller tasks.

---

## Task Quality Rules

Each task must be:

* Actionable.
* Specific.
* Testable.
* Small enough for sprint planning.
* Clear enough for a developer or coding agent.
* Mapped to at least one Acceptance Criterion.
* Mapped to at least one Technical Spec section when a Technical Specification exists.
* Clear about what is included and excluded.
* Clear about Definition of Done.
* Free of implementation code.
* Free of scope creep.

Every Acceptance Criterion must map to at least one task.

Every required QA scenario must map to at least one QA task.

Every required security scenario must map to at least one security or QA task.

Every required seed/demo scenario must map to at least one seed/demo or QA task.

---

## File Safety Rules

Before writing the Development Tasks file:

1. Verify that the input file exists.
2. Extract the User Story ID.
3. Read Product Backlog Prioritized.
4. Resolve Priority and Backlog ID when possible.
5. If the input is a User Story path, check whether a Technical Specification exists under:

```text
management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
```

6. If a Technical Specification exists, use it as primary source.
7. If a Decision Resolution artifact exists, read it.
8. Verify that the User Story ID is consistent across available artifacts.
9. Do not write tasks if the story/spec is marked `Blocked` or `Split Required`.
10. Do not write tasks if unresolved blockers remain.
11. Do not modify the User Story file.
12. Do not modify the Technical Specification file.
13. Do not modify the Decision Resolution artifact.

If the input file does not exist, return:

```text
Development Tasks created: No
Reason: Input file path not found.
```

If the User Story ID cannot be extracted, return:

```text
Development Tasks created: No
Reason: User Story ID not found or ambiguous.
```

If the Technical Specification is marked `Blocked`, return:

```text
Development Tasks created: No
Reason: Technical Specification is blocked.
```

If the Technical Specification is marked `Split Required`, return:

```text
Development Tasks created: No
Reason: Technical Specification requires story split before task generation.
```

---

## Output File Rules

Create or overwrite the Development Tasks file at:

```text
management/development-tasks/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-development-tasks.md
```

Example:

```text
management/development-tasks/P0/PB-P0-001/US-099-development-tasks.md
```

If backlog mapping is not found, use:

```text
management/development-tasks/unmapped/<USER_STORY_ID>-development-tasks.md
```

If folders do not exist, create them.

Do not write to any other path unless the user explicitly provides a different output path.

The Development Tasks file must be complete enough to be used for:

* Sprint Planning.
* Roadmap planning.
* Developer handoff.
* QA planning.
* AI coding agent execution.
* Academic evidence.

---

## Required Output Structure

The Development Tasks file must use this structure:

````markdown
# Development Tasks — <BACKLOG_ID> / <USER_STORY_ID>: <TITLE>

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID |  |
| Source User Story |  |
| Source Technical Specification |  |
| Decision Resolution Artifact |  |
| Priority | P0 / P1 / P2 / P3 / P4 |
| Backlog ID |  |
| Backlog Title |  |
| Backlog Execution Order |  |
| User Story Position in Backlog Item |  |
| Related User Stories in Backlog Item |  |
| Epic |  |
| Backlog Item Dependencies |  |
| Feature |  |
| Module / Domain |  |
| Backlog Alignment Status | Found / Not Found |
| Task Breakdown Status | Ready for Sprint Planning / Needs Clarification / Blocked |
| Created Date |  |
| Last Updated |  |

---

## 2. Source Validation

| Source | Found | Used | Notes |
|---|---|---|
| User Story | Yes / No | Yes / No |  |
| Technical Specification | Yes / No | Yes / No |  |
| Decision Resolution Artifact | Yes / No | Yes / No |  |
| Product Backlog Prioritized | Yes / No | Yes / No |  |
| ADRs | Yes / No | Yes / No |  |

---

## 3. Backlog Execution Context

### Parent Backlog Item

### Execution Order Rationale

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|

---

## 4. Task Breakdown Summary

| Area | Number of Tasks | Notes |
|---|---:|---|

---

## 5. Traceability Matrix

| Acceptance Criterion | Technical Spec Section | Task IDs |
|---|---|---|

Every Acceptance Criterion must map to at least one task.

---

## 6. Development Tasks

For each task, use this format:

### TASK-<BACKLOG_ID>-<USER_STORY_ID>-<AREA>-<NNN> — <Task Title>

| Field | Value |
|---|---|
| Area |  |
| Type | Implementation / Test / Documentation / Setup / Review |
| Priority | Must / Should / Could |
| Estimate | XS / S / M / L |
| Depends On |  |
| Source AC(s) |  |
| Technical Spec Section(s) |  |
| Backlog ID |  |
| User Story ID |  |
| Owner Role | Backend / Frontend / QA / DevOps / AI / Tech Lead |
| Status | To Do |

#### Objective

#### Scope

##### Include

##### Exclude

#### Implementation Notes

#### Acceptance Criteria Covered

#### Definition of Done

- [ ] 
- [ ] 
- [ ] 

---

## 7. Required QA Tasks

| Task ID | Test Type | Purpose |
|---|---|---|

---

## 8. Required Security Tasks

| Task ID | Security Concern | Purpose |
|---|---|---|

If security does not apply, write:

`No aplica`.

---

## 9. Required Seed / Demo Tasks

| Task ID | Seed/Demo Concern | Purpose |
|---|---|---|

If seed/demo does not apply, write:

`No aplica`.

---

## 10. Observability / Audit Tasks

| Task ID | Concern | Purpose |
|---|---|---|

If observability does not apply, write:

`No aplica`.

---

## 11. Documentation / Traceability Tasks

| Task ID | Document / Artifact | Purpose |
|---|---|---|

---

## 12. Dependency Graph

Use Mermaid syntax.

```mermaid
flowchart TD
  TASK_A[TASK-PB-PX-000-US-XXX-AREA-001] --> TASK_B[TASK-PB-PX-000-US-XXX-AREA-002]
````

---

## 13. Suggested Implementation Order

### Phase 1 — Foundation

### Phase 2 — Core Implementation

### Phase 3 — Validation / Security / QA

### Phase 4 — Documentation / Review

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation | Related Task |
| ---- | ------ | ---------- | ------------ |

---

## 15. Out of Scope Confirmation

List what must not be implemented as part of this User Story.

---

## 16. Readiness for Sprint Planning

| Check                                      | Status            |
| ------------------------------------------ | ----------------- |
| Product Backlog mapping found              | Pass / Fail       |
| Every AC maps to tasks                     | Pass / Fail       |
| Technical Spec used when available         | Pass / Fail / N/A |
| QA tasks included                          | Pass / Fail       |
| Security tasks included if applicable      | Pass / Fail / N/A |
| Seed/demo tasks included if applicable     | Pass / Fail / N/A |
| Observability tasks included if applicable | Pass / Fail / N/A |
| Documentation tasks included if applicable | Pass / Fail / N/A |
| Task dependencies clear                    | Pass / Fail       |
| Tasks small enough                         | Pass / Fail       |
| Ready for Sprint Planning                  | Yes / No          |

---

## 17. Final Recommendation

Choose one:

* `Ready for Sprint Planning`
* `Needs Clarification`
* `Blocked`
* `Split Required`

Explain why.

````

---

## Expected Final Response

After generating the Development Tasks file, respond in Spanish LATAM with:

```text
Development Tasks created: Yes
Path: management/development-tasks/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-development-tasks.md
Status: Ready for Sprint Planning / Needs Clarification / Blocked
Technical Specification used: Yes / No
Backlog ID: <BACKLOG_ID>
Execution Order: <ORDER>
Next step: Sprint Planning / Roadmap.
````

Also include:

* A concise summary of generated task groups.
* Whether Technical Specification was used.
* Whether Product Backlog mapping was found.
* Any blockers or warnings.

---

## Quality Rules

Before finalizing:

* Prefer Technical Specification over raw User Story when available.
* Never ignore the Technical Specification if it exists.
* Always attempt Product Backlog mapping.
* Use Product Backlog order as execution order.
* Do not order tasks by User Story number alone.
* Use task ID format `TASK-<BACKLOG_ID>-<USER_STORY_ID>-<AREA>-<NNN>`.
* Store output under `<PRIORITY>/<BACKLOG_ID>/`.
* Do not reopen decisions already formalized.
* Do not modify User Story files.
* Do not modify Technical Specification files.
* Do not modify Decision Resolution artifacts.
* Create or overwrite only the Development Tasks output file.
* Always include QA tasks.
* Include security tasks when applicable.
* Include seed/demo tasks when applicable.
* Include observability/audit tasks when applicable.
* Include documentation/traceability tasks when applicable.
* Ensure every Acceptance Criterion maps to at least one task.
* Ensure every task maps to at least one Technical Spec section when the spec exists.
* Avoid generating implementation code.
* Avoid scope creep.
* Keep output in Spanish LATAM neutral.
* Keep technical identifiers in English.
