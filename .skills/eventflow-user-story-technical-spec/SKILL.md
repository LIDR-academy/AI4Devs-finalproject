# EventFlow Skill — User Story Technical Specification

## Purpose

This skill generates a Technical Specification for an approved EventFlow User Story.

The Technical Specification explains how the User Story should be implemented technically before Development Tasks are generated.

This skill acts as:

* Technical Lead.
* Software Architect.
* Backend Architect.
* Frontend Architect.
* QA Strategist.
* Security Reviewer.
* AI / PromptOps Reviewer when applicable.
* Backlog execution alignment reviewer.

This skill must not generate production code.

This skill must not generate Development Tasks.

This skill must not approve or modify the User Story.

---

## Workflow Position

Use this skill after:

```text
eventflow-user-story-approval
```

And before:

```text
eventflow-user-story-to-development-tasks
```

Recommended workflow:

```text
1. eventflow-user-story-refinement
2. eventflow-po-ba-decision-resolver, if needed
3. eventflow-user-story-refinement, optional second pass
4. eventflow-user-story-approval
5. eventflow-user-story-technical-spec
6. eventflow-user-story-to-development-tasks
```

---

## Key Ordering Principle

The User Story ID does not define execution order.

Execution order must come from:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

A User Story such as `US-099` may be executed first if it belongs to the first prioritized backlog item, for example:

```text
PB-P0-001 — Database Schema, Migrations & Constraints
Related User Stories: US-099, US-100, US-101, US-102
```

Therefore, all generated technical specifications must include the associated:

* Priority.
* Backlog ID.
* Backlog title.
* Backlog execution order.
* Position of the User Story within the backlog item.
* Related User Stories from the same backlog item.

---

## Expected Input

The user must provide the path to an approved User Story file.

Example:

```text
management/user-stories/US-099.md
```

The skill must read the User Story directly from the provided path.

---

## Required Source Lookup

After extracting the User Story ID, the skill must locate the User Story inside:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

The skill must identify:

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

If the User Story cannot be found in the Product Backlog Prioritized, the skill may still generate a draft technical spec, but must mark:

```text
Backlog Alignment Status: Not Found
Technical Spec Status: Needs Technical Clarification
```

---

## Decision Resolution Lookup

The skill must check whether this file exists:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

If it exists, read it and treat it as a formal decision source.

---

## Output File

The skill must create or overwrite the Technical Specification at:

```text
management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
```

Example:

```text
management/technical-specs/P0/PB-P0-001/US-099-technical-spec.md
```

If the folders do not exist, create them.

Do not use the old flat path:

```text
management/technical-specs/<USER_STORY_ID>-technical-spec.md
```

unless the User Story cannot be mapped to a Backlog ID.

Fallback path when backlog mapping fails:

```text
management/technical-specs/unmapped/<USER_STORY_ID>-technical-spec.md
```

---

## Source Priority

Apply this source priority:

1. Accepted ADRs.
2. Decision Resolution artifact:

```text
management/user-stories/decision-resolutions/<USER_STORY_ID>-decision-resolution.md
```

3. User Story section `PO/BA Decisions Applied`.
4. Approved User Story content.
5. Product Backlog Prioritized.
6. Epic Map.
7. Architecture and technical design documents.
8. Domain discovery and earlier analysis documents.

Do not reopen decisions already formalized in the Decision Resolution artifact or in `PO/BA Decisions Applied`.

If a formalized decision conflicts with older documentation, mark it as:

```text
Documentation Alignment Required
```

Do not treat it as a blocker unless it contradicts an accepted ADR, introduces scope creep, or creates implementation impossibility.

---

## Source of Truth

Use these official EventFlow documents:

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

The Technical Specification must align with the established EventFlow architecture.

### Backend

Use and respect:

* Node.js.
* Express.js.
* TypeScript.
* Prisma.
* PostgreSQL.
* Modular Monolith.
* Clean / Hexagonal Architecture principles.
* REST JSON API under `/api/v1`.
* Zod validation.
* Thin controllers.
* Application use cases.
* Repository layer through Prisma.

### Frontend

Use and respect:

* Next.js.
* TypeScript.
* App Router.
* Server Components where applicable.
* Client Components for authenticated workflows.
* TanStack Query.
* React Hook Form.
* Zod.
* Tailwind CSS / design tokens.
* next-intl.
* MSW where applicable.

### AI / PromptOps

When applicable:

* `LLMProvider` abstraction.
* `OpenAIProvider`.
* `MockAIProvider`.
* `AnthropicProvider` as future/stub only.
* Prompt versioning.
* `AIRecommendation`.
* Human-in-the-loop.
* Timeout/fallback.
* JSON schema validation.
* No autonomous AI decisions.

### Security

When applicable:

* HTTP-only cookies.
* Backend as authorization source of truth.
* RBAC.
* Ownership checks.
* Assignment-based authorization.
* Admin-scoped access.
* 401/403 negative paths.
* `AdminAction` audit where applicable.
* No tokens in localStorage.
* No secrets in repository.

### Testing

Use and respect:

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

Do not include technical design for:

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

---

## Preconditions

Before generating the Technical Specification, validate:

* The User Story file exists.
* The User Story ID can be extracted.
* The Product Backlog mapping was attempted.
* The User Story status is `Approved`, `Approved with Minor Notes`, or explicitly ready for technical specification.
* The story does not contain unresolved blocking questions.
* The story has Acceptance Criteria.
* The story has enough traceability to generate a technical solution.

If the User Story is not approved, the skill may still generate a draft technical spec only if the user explicitly requests it, but it must mark:

```text
Draft Technical Specification — User Story not formally approved
```

---

## Required Technical Specification Structure

Generate the Technical Specification using this structure:

```markdown
# Technical Specification — <USER_STORY_ID>: <TITLE>

## 1. Metadata

| Field | Value |
|---|---|
| User Story ID |  |
| Source User Story |  |
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
| User Story Status |  |
| Backlog Alignment Status | Found / Not Found |
| Technical Spec Status | Draft / Ready for Task Breakdown / Needs Technical Clarification / Blocked |
| Created Date |  |
| Last Updated |  |

---

## 2. Backlog Execution Context

### Product Backlog Item

Describe the parent backlog item.

### Execution Order Rationale

Explain why this User Story is being worked at this point based on the Product Backlog order.

### Related User Stories in Same Backlog Item

| User Story | Role in Backlog Item | Suggested Order |
|---|---|---|

---

## 3. Executive Technical Summary

Summarize what must be implemented technically and why.

---

## 4. Scope Boundary

### In Scope

### Out of Scope

### Explicit Non-Goals

---

## 5. Architecture Alignment

### Backend Architecture

### Frontend Architecture

### Database Architecture

### API Architecture

### AI / PromptOps Architecture

### Security Architecture

### Testing Architecture

For non-applicable areas, write `No aplica`.

---

## 6. Functional Interpretation

| Acceptance Criterion | Technical Interpretation | Impacted Layer(s) |
|---|---|---|

---

## 7. Backend Technical Design

### Modules / Bounded Contexts

### Use Cases / Application Services

### Controllers / Routes

### DTOs / Schemas

### Repository / Persistence

### Validation Rules

### Error Handling

### Transactions

### Observability

If backend does not apply, write `No aplica`.

---

## 8. Frontend Technical Design

### Routes / Pages

### Components

### Forms

### State Management

### Data Fetching

### Loading / Empty / Error / Success States

### Accessibility

### i18n

If frontend does not apply, write `No aplica`.

---

## 9. API Contract Design

| Method | Endpoint | Purpose | Auth Required | Request | Response | Error Cases |
|---|---|---|---|---|---|---|

If API does not apply, write `No aplica`.

---

## 10. Database / Prisma Design

### Models Impacted

### Fields / Columns

### Relations

### Indexes

### Constraints

### Migrations Impact

### Seed Impact

If database does not apply, write `No aplica`.

---

## 11. AI / PromptOps Design

### AI Feature

### Provider

### Prompt Version

### Input Schema

### Output Schema

### Human-in-the-loop

### Fallback

### Persistence

### Safety Rules

If AI does not apply, write `No aplica`.

---

## 12. Security & Authorization Design

### Authentication

### Authorization

### Ownership Rules

### Role Rules

### Negative Authorization Scenarios

### Audit Requirements

### Sensitive Data Handling

If security does not apply, write `No aplica`.

---

## 13. Testing Strategy

### Unit Tests

### Integration Tests

### API Tests

### E2E Tests

### Security Tests

### Accessibility Tests

### AI Tests

### Seed / Demo Tests

### CI Checks

Only include applicable tests.

---

## 14. Observability & Audit

### Logs

### Correlation ID

### AdminAction

### Error Tracking

### Metrics

If observability does not apply, write `No aplica`.

---

## 15. Seed / Demo Data Impact

### Seed Data Required

### Demo Scenario Supported

### Reset / Isolation Notes

If seed/demo does not apply, write `No aplica`.

---

## 16. Documentation Alignment Required

| Document / Source | Conflict | Current Decision | Recommended Action | Blocks Implementation? |
|---|---|---|---|---|

If there are no alignment issues, write:

`No documentation alignment issues detected.`

---

## 17. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|

---

## 18. Implementation Guidance for Coding Agents

Provide implementation guidance without writing production code.

Include:

- Files or folders likely impacted.
- Recommended order of implementation.
- Decisions that must not be reopened.
- What must not be implemented.
- Assumptions to preserve.

---

## 19. Task Generation Notes

Provide guidance for the Development Tasks skill.

Include:

- Suggested task groups.
- Required QA tasks.
- Required security tasks.
- Required seed/demo tasks.
- Required documentation tasks.
- Dependencies between tasks.
- Whether the parent backlog item should later generate a consolidated `tasks.md`.

---

## 20. Technical Spec Readiness

| Check | Status |
|---|---|
| User Story approved or explicitly allowed for draft spec | Pass / Fail |
| Product Backlog mapping found | Pass / Fail |
| Decision Resolution reviewed if present | Pass / Fail / N/A |
| Scope clear | Pass / Fail |
| Architecture alignment clear | Pass / Fail |
| API impact clear | Pass / Fail / N/A |
| DB impact clear | Pass / Fail / N/A |
| AI impact clear | Pass / Fail / N/A |
| Security impact clear | Pass / Fail / N/A |
| Testing strategy clear | Pass / Fail |
| Ready for Development Task Breakdown | Yes / No |

---

## 21. Final Recommendation

Choose one:

- `Ready for Task Breakdown`
- `Needs Technical Clarification`
- `Blocked`
- `Split Required`

Explain why.
```

---

## Output Language

Generate the Technical Specification in Spanish LATAM neutral.

Keep technical identifiers, file paths, endpoints, enums, and architecture concepts in English.

---

## Expected Final Response

After generating the Technical Specification file, respond in Spanish LATAM with:

```text
Technical Specification created: Yes
Path: management/technical-specs/<PRIORITY>/<BACKLOG_ID>/<USER_STORY_ID>-technical-spec.md
Status: Ready for Task Breakdown / Needs Technical Clarification / Blocked
Backlog ID: <BACKLOG_ID>
Execution Order: <ORDER>
Next step: Run eventflow-user-story-to-development-tasks.
```

Also include:

* Whether Product Backlog mapping was found.
* Whether a Decision Resolution artifact was used.
* Any blockers or documentation alignment warnings.

---

## Quality Rules

Before finalizing:

* Generate a Technical Specification, not Development Tasks.
* Do not approve the User Story.
* Do not modify the User Story file.
* Do not write production code.
* Do not invent unsupported architecture.
* Do not reopen decisions already formalized.
* Do not introduce scope creep.
* Always attempt Product Backlog mapping.
* Use Product Backlog order as execution order.
* Store the file under `<PRIORITY>/<BACKLOG_ID>/`.
* Keep output in Spanish LATAM neutral.
* Keep technical identifiers in English.
* Clearly mark non-applicable sections as `No aplica`.
