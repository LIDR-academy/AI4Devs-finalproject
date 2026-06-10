# AAA Prompt — Generate EventFlow User Stories from Epic Map

## 1. ACT AS

Act as a **Senior Product Owner, Business Analyst, Agile Delivery Lead, and Technical Product Manager** for the EventFlow MVP.

You are working inside the EventFlow AI4Devs final project repository. Your responsibility is to generate a complete, traceable, implementation-ready set of **User Stories** based on the approved **Epic Map**.

You must think like a Product Owner who understands:

- MVP scope control.
- Agile backlog decomposition.
- User story quality.
- Acceptance criteria using Given / When / Then.
- Business rules and authorization constraints.
- Technical traceability.
- AI-assisted product workflows.
- Backend, frontend, API, data model, security, testing and DevOps implications.
- Academic evaluation requirements for an AI-assisted software development project.

The final output must be written in **Spanish LATAM neutral**, with professional product management language.

---

## 2. ACTION

Generate the complete set of **EventFlow User Stories** based on the following source artifact:

```text
management/artifacts/EventFlow-Epic-Map.md
````

Use the following template as the mandatory structure for every generated User Story:

```text
management/templates/user-story.tpl.md
```

The generated User Stories must be stored under:

```text
management/user-stories/
```

If the folder does not exist, create it.

---

## 3. AUTHORITATIVE INPUTS

Use these files as the primary source of truth:

```text
management/artifacts/EventFlow-Epic-Map.md
management/templates/user-story.tpl.md
```

Use the existing project documentation only as supporting context when needed for traceability and consistency:

```text
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

Do not invent features, roles, modules, entities, endpoints or architecture decisions that are not supported by the Epic Map or the approved documentation.

---

## 4. GOAL

Create a structured set of **implementation-ready User Stories** that can later be used to generate:

* Acceptance Criteria.
* Product Backlog.
* Development Tasks.
* QA Scenarios.
* Sprint Plan / Roadmap.
* Frontend tasks.
* Backend tasks.
* API tasks.
* Database tasks.
* Security tasks.
* AI / PromptOps tasks.
* Testing tasks.

Each User Story must be granular enough to be estimated and developed, but not so small that it becomes a technical task.

---

## 5. GENERATION RULES

### 5.1 Epic Map First

Read and analyze:

```text
management/artifacts/EventFlow-Epic-Map.md
```

For each Epic and Feature in the Epic Map:

1. Identify the user goals.
2. Identify the primary role.
3. Identify the business value.
4. Identify the functional boundary.
5. Derive one or more User Stories.
6. Preserve the Epic / Feature hierarchy from the Epic Map.

Do not create User Stories outside the Epic Map unless they are clearly required to make an Epic implementable and are supported by the source documentation.

---

### 5.2 Template Compliance

Every User Story must follow the structure from:

```text
management/templates/user-story.tpl.md
```

Do not remove sections from the template.

If a section does not apply, write:

```text
Not applicable for this story.
```

Do not leave placeholders unresolved.

---

### 5.3 File Output

Create one Markdown file per User Story using this naming convention:

```text
management/user-stories/US-XXX-short-kebab-title.md
```

Examples:

```text
management/user-stories/US-001-register-organizer-account.md
management/user-stories/US-002-create-event-wizard.md
management/user-stories/US-003-generate-ai-event-plan.md
```

Use sequential IDs:

```text
US-001
US-002
US-003
...
```

The sequence must follow the Epic Map order and MVP delivery logic.

---

### 5.4 User Story Quality Rules

Each User Story must follow this format:

```text
As a <role>
I want <goal/action>
So that <business value/outcome>
```

The story must be:

* Independent enough to be developed.
* Negotiable, not over-prescriptive.
* Valuable to a user or stakeholder.
* Estimable.
* Small enough for sprint planning.
* Testable with clear acceptance criteria.
* Traceable to source documentation.
* Aligned with MVP scope.

---

## 6. REQUIRED USER STORY CONTENT

Each generated User Story must include, at minimum:

### 6.1 Metadata

Complete all metadata fields:

* ID.
* Epic.
* Feature.
* Module / Domain.
* User Role.
* Priority.
* Status.
* Owner.
* Sprint / Milestone.
* Created Date.
* Last Updated.

Use today’s date for Created Date and Last Updated.

Set initial Status as:

```text
Draft
```

Set Owner as:

```text
Product Owner / Business Analyst
```

Set Sprint / Milestone as one of:

```text
MVP
Demo
Future
```

Only use `Future` when the Epic Map or documentation explicitly marks the capability as future.

---

### 6.2 Business Context

Explain:

* Why the story exists.
* What user problem it solves.
* How it supports the EventFlow MVP.
* Which domain concepts are involved.
* Any assumptions.
* Any dependencies.

The context must be specific to EventFlow, not generic SaaS language.

---

### 6.3 Traceability

Fill the traceability table with all known references:

* FRD Requirement(s).
* Use Case(s).
* Business Rule(s).
* Permission Rule(s).
* Data Entity / Entities.
* API Endpoint(s).
* NFR Reference(s).
* Related ADR(s).
* Related Document(s).

If an exact reference cannot be identified, write:

```text
To be confirmed during refinement.
```

Do not fabricate exact IDs.

---

### 6.4 Scope Guardrails

Each story must explicitly state:

* Whether it is In Scope, Future, Out of Scope, or Requires PO Decision.
* MVP relevance.
* What it must not introduce.

Apply EventFlow MVP guardrails:

* Do not introduce real payments.
* Do not introduce commissions.
* Do not introduce contracts or e-signature.
* Do not introduce real-time chat.
* Do not introduce WhatsApp integration.
* Do not introduce SMS or push notifications.
* Do not introduce native mobile app functionality.
* Do not introduce automatic currency conversion.
* Do not introduce autonomous AI decisions.
* Do not introduce AI moderation of reviews.
* Do not introduce vendor auto-approval by AI.
* Do not introduce multi-user collaboration per event unless explicitly marked as future.
* Do not introduce multi-role users in MVP.

---

### 6.5 Acceptance Criteria

Generate clear acceptance criteria using:

```text
Given / When / Then
```

Include:

* Happy path.
* Edge cases.
* Validation errors.
* Authorization errors.
* Empty states when relevant.
* AI fallback behavior when relevant.
* Audit or traceability expectations when relevant.
* Demo-readiness criteria when relevant.

Each User Story should usually have:

* 2 to 5 Happy Path acceptance criteria.
* 1 to 4 Edge Cases.
* Validation Rules table.
* Authorization & Security Rules table.

---

### 6.6 Authorization & Security

For every story, define:

* Who can perform the action.
* Whether ownership applies.
* Whether role-based access applies.
* What happens if an unauthorized user attempts the action.
* Whether the backend must enforce the rule.
* Whether the frontend only provides UX guards.
* Whether audit logging is required.
* Whether captcha, rate limiting, session validation, secure cookie, or input validation applies.

Use the EventFlow security model:

```text
RBAC + ownership + contextual policies
```

---

### 6.7 AI Rules

If the story involves AI:

* Mark the output as suggestion, not final data.
* Require human validation before materialization.
* Persist traceability through AIRecommendation.
* Include prompt version reference when applicable.
* Include fallback behavior.
* Include timeout behavior.
* Include invalid JSON / invalid output behavior.
* Include data minimization expectations.
* Confirm that AI cannot approve, reject, hire, book, moderate, pay, or make autonomous decisions.

If the story does not involve AI, state:

```text
This story does not invoke AI directly.
```

---

### 6.8 Data and Entities

Identify involved entities from the EventFlow data model, such as:

* User.
* Event.
* EventType.
* EventTask.
* Budget.
* BudgetItem.
* VendorProfile.
* VendorService.
* ServiceCategory.
* QuoteRequest.
* Quote.
* BookingIntent.
* Review.
* Notification.
* AIRecommendation.
* Attachment.
* AdminAction.
* AIPromptVersion.

Do not introduce new entities unless the existing documentation supports them.

---

### 6.9 API and Backend Notes

When possible, identify likely API endpoints from the API Design Specification.

If exact endpoint is known, include it.

If not known, write:

```text
Endpoint to be confirmed during API refinement.
```

Include backend behavior expectations, such as:

* Validate request DTO.
* Enforce RBAC.
* Enforce ownership.
* Apply business rules.
* Persist entity changes.
* Emit notification when applicable.
* Register AdminAction when applicable.
* Persist AIRecommendation when applicable.

---

### 6.10 Frontend Notes

Include frontend expectations:

* Page or route involved.
* Form behavior.
* Loading state.
* Empty state.
* Error state.
* Success confirmation.
* Role-based navigation visibility.
* Human-in-the-loop UX when AI is involved.
* i18n support.
* Responsive behavior.

---

### 6.11 QA Notes

Each User Story must include QA guidance:

* Positive scenarios.
* Negative scenarios.
* Authorization scenarios.
* Validation scenarios.
* Regression scenarios.
* Seed/demo data requirements.
* E2E testing notes when relevant.
* Accessibility checks when relevant.
* i18n checks when relevant.

---

## 7. PRIORITIZATION RULES

Assign priority based on the Epic Map and MVP criticality.

Use:

```text
Must Have
Should Have
Could Have
Won't Have
```

Default rules:

* Authentication, role access, event creation, event dashboard, IA plan/checklist/budget, vendor approval, quote flow, booking intent simulated, review verified, admin governance, seed/demo readiness = Must Have.
* AI comparison summary, AI task prioritization, richer filters, optional AI vendor bio = Should Have or Could Have depending on the Epic Map.
* Payments, WhatsApp, chat, contracts, mobile native, RSVP, automatic currency conversion, AI moderation = Won’t Have / Out of Scope unless explicitly marked Future.

---

## 8. EXPECTED OUTPUT

Create the following:

### 8.1 User Story Files

One file per User Story under:

```text
management/user-stories/
```

Each file must fully comply with:

```text
management/templates/user-story.tpl.md
```

---

### 8.2 User Stories Index

Create an index file:

```text
management/user-stories/README.md
```

The README must include:

1. Purpose of the folder.
2. Source artifact used.
3. Generation date.
4. Summary by Epic.
5. Table of all User Stories.

The table must include:

| ID | Title | Epic | Feature | Role | Priority | Status | File |
| -- | ----- | ---- | ------- | ---- | -------- | ------ | ---- |

---

### 8.3 Coverage Matrix

Create:

```text
management/user-stories/User-Stories-Coverage-Matrix.md
```

The matrix must show:

| Epic | Feature | User Story ID | User Story Title | Priority | Status | Notes |
| ---- | ------- | ------------- | ---------------- | -------- | ------ | ----- |

Also include a section called:

```text
Potential Gaps / Requires Product Owner Review
```

List any missing, ambiguous, duplicated or conflicting items found during generation.

---

## 9. QUALITY CHECKLIST BEFORE FINALIZING

Before finishing, verify:

* [ ] Every Epic from the Epic Map has at least one User Story.
* [ ] Every Feature from the Epic Map is covered or explicitly marked as Deferred / Future / Out of Scope.
* [ ] No User Story introduces out-of-scope MVP capabilities.
* [ ] Every User Story uses the required template.
* [ ] Every User Story has acceptance criteria.
* [ ] Every User Story has traceability.
* [ ] Every User Story has authorization/security rules.
* [ ] Every AI-related User Story includes human-in-the-loop validation.
* [ ] Every AI-related User Story includes fallback/error behavior.
* [ ] Stories are stored in `management/user-stories/`.
* [ ] `README.md` is created.
* [ ] `User-Stories-Coverage-Matrix.md` is created.
* [ ] IDs are sequential and unique.
* [ ] File names are consistent and kebab-case.
* [ ] No placeholders remain unresolved.

---

## 10. IMPORTANT CONSTRAINTS

Do not generate development tasks yet.

Do not generate sprint plan yet.

Do not generate product backlog yet.

Do not generate story point estimates yet unless the Epic Map already includes them.

Do not modify the Epic Map.

Do not modify the template.

Do not rewrite existing source documentation.

Only create the User Story artifacts under:

```text
management/user-stories/
```

---

## 11. FINAL RESPONSE FORMAT

After generating the files, respond with:

```markdown
## User Stories Generated

Created folder:

- `management/user-stories/`

Created files:

| File | Purpose |
|---|---|

## Summary

| Epic | Number of User Stories |
|---|---:|

## Potential Gaps / PO Review

- <gap or "No blocking gaps found.">
