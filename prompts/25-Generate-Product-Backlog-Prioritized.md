# AAA Prompt — Generate Product Backlog Prioritized for EventFlow

## 1. ACT AS

Act as a **Senior Product Owner + Business Analyst + Agile Delivery Lead** for the EventFlow MVP.

You are responsible for transforming the existing Epic Map, User Stories Coverage Matrix, and Product Backlog Prioritization Input into an actionable, prioritized product backlog.

Your goal is to generate a formal backlog artifact that can be used by:

- Product Owner
- Business Analyst
- Scrum Master / Agile Delivery Lead
- Tech Lead
- Backend Engineers
- Frontend Engineers
- AI Engineers
- QA Engineers
- DevOps
- Academic evaluators of the AI4Devs final project
- AI coding agents that will later generate development tasks

The output document must be written in **Spanish LATAM neutral**, but all reasoning, prioritization logic, and structure must follow professional product management and agile delivery practices.

---

## 2. ANALYZE

Analyze the following source documents:

### Primary sources

1. `management/artifacts/EventFlow-Epic-Map.md`
2. `management/artifacts/User-Stories-Coverage-Matrix.md`
3. `management/artifacts/Product-Backlog-Prioritization-Input.md`

### Supporting sources, only when needed for traceability or validation

4. `docs/3-MVP-Scope-Definition.md`
5. `docs/4-Business-Rules-Document.md`
6. `docs/5-User-Roles-Permissions-Matrix.md`
7. `docs/8-Use-Cases-Specification.md`
8. `docs/9-Functional-Requirements-Document.md`
9. `docs/10-Non-Functional-Requirements.md`
10. `docs/11-Data-Seed-Strategy.md`
11. `docs/12-Architecture-Vision-and-Principles.md`
12. `docs/13-System-Architecture-Document.md`
13. `docs/14-Backend-Technical-Design.md`
14. `docs/15-Frontend-Architecture-Design.md`
15. `docs/16-API-Design-Specification.md`
16. `docs/17-AI-Architecture-and-PromptOps-Design.md`
17. `docs/18-Database-Physical-Design.md`
18. `docs/19-Security-and-Authorization-Design.md`
19. `docs/20-Testing-Strategy.md`
20. `docs/21-Deployment-and-DevOps-Design.md`
21. `docs/22-Architecture-Decision-Records.md`

---

## 3. CONTEXT

EventFlow is an **AI-assisted event planning workspace** with a simplified vendor quote flow.

The MVP must remain focused on:

- Event planning workspace
- AI-assisted planning
- Checklist and budget generation
- Vendor discovery through seed/curated data
- Structured quote requests and quote responses
- Quote comparison
- Simulated booking intent
- Verified reviews
- Admin governance
- Seed/demo readiness
- Academic traceability

The MVP must **not** become a full transactional marketplace.

Explicitly keep out of scope:

- Real payments
- Commissions
- Real contracts
- E-signature
- WhatsApp integration
- Real-time chat
- Native mobile app
- Push notifications
- Multi-user collaboration per event
- Currency conversion
- AI autonomous decisions
- AI autonomous vendor approval
- AI autonomous review moderation
- RAG / vector database
- Marketplace billing

---

## 4. PRODUCT OWNER DECISIONS TO APPLY

Apply these backlog prioritization decisions:

### 4.1 Scope decisions

- `US-008 — Login with Google` must be moved to **P4 / Future / v1.1**, unless explicitly required later.
- `US-023 — Vendor generates bio/packages with AI` must be moved to **P4 / Future / v1.1**, unless explicitly required later.
- `US-022 — AI quote comparison summary` remains **P2 / Should Have**.
- `US-024 — AI top 3 urgent tasks` remains **P2 / Should Have**.
- `US-026 — Regenerate AI suggestion with feedback` remains **P2 / Should Have**.

### 4.2 Operational decisions

Use these defaults unless a source document explicitly says otherwise:

| Decision | Default |
|---|---:|
| Max AI regenerations per suggestion | 5 |
| Max IDs per bulk task confirmation | 50 |
| Max quote validity | 90 calendar days |
| Default quote validity when vendor does not specify | 15 calendar days |
| Quote Request expiration without response | 30 calendar days |
| Session cookie lifetime | 30 days |
| Password reset token lifetime | 30 minutes |
| AutoCompleteEventsJob schedule | daily at 00:30 UTC |
| T-7 notification job schedule | daily at 08:00 event local time |
| Quote expiration job schedule | daily |
| QuoteRequest expiration job schedule | daily |

### 4.3 Functional decisions

Apply these rules:

- When event date changes, preserve manual task overrides and only recalculate AI/system-generated relative tasks when safe.
- When an event is cancelled, related active quote requests and booking intents should be cancelled or marked inactive according to the business rules; notify affected users through in-app notification and simulated email where applicable.
- Do not allow cancelling a quote request if it already has a confirmed booking intent.
- All AI-generated outputs remain human-in-the-loop.
- Backend remains the source of truth for authorization.
- Seed/demo features must be available only in safe/demo contexts.

---

## 5. PRIORITIZATION MODEL

Use the following priority model:

| Priority | Meaning |
|---|---|
| P0 | Foundation / blocking. Required before most product work can be implemented. |
| P1 | MVP critical. Required for the end-to-end demo and core user value. |
| P2 | MVP important. Needed for a complete MVP, QA, observability, or stronger product quality. |
| P3 | Demo polish / academic evidence. Improves presentation, traceability, and evaluation readiness. |
| P4 | Future / Out of Scope. Not included in the MVP implementation backlog. |

Use this distribution as baseline:

### P0 — Foundation / blocking

Include technical and platform-enabling stories from:

- Backend foundation
- Database foundation
- API foundation
- Frontend foundation
- Security foundation
- AI provider foundation
- Seed foundation
- DevOps/deployment foundation
- Testing foundation where it blocks reliable delivery

### P1 — MVP critical path

Include stories required for the first complete demo path:

1. Register/login
2. Create organizer event
3. Generate AI event plan
4. Accept/edit AI suggestions
5. Generate/manage checklist
6. Generate/manage budget
7. Browse approved vendors
8. Send quote request
9. Vendor receives/responds quote
10. Organizer compares quote
11. Organizer marks preferred/booking intent
12. Organizer leaves review
13. Admin approves vendor / moderates core data where necessary
14. i18n/currency basics required by MVP

### P2 — MVP important

Include:

- Notifications
- Observability
- Additional QA gates
- AI comparison summary
- AI urgent tasks
- AI regeneration
- Admin metrics
- Academic traceability support that is not blocking
- Frontend UX hardening
- Error states and fallback flows

### P3 — Demo polish / academic

Include:

- Demo script
- Pre-demo checklist
- Smoke demo URL
- Prompt examples
- ADR index
- Academic evidence report
- Final traceability polish

### P4 — Future / Out of Scope

Include but clearly exclude from MVP implementation:

- OAuth Google
- Vendor AI bio/packages
- Payments
- Contracts
- WhatsApp
- Chat
- Push
- Native mobile
- Multi-user collaboration
- RAG/vector DB
- AI autonomous moderation
- AI autonomous booking
- Currency conversion
- Subscriptions billing

---

## 6. BACKLOG ITEM STRUCTURE

For every backlog item, include:

| Field | Description |
|---|---|
| Backlog ID | Use format `PB-PX-###`, where `PX` is P0, P1, P2, P3, or P4. |
| Priority | P0 / P1 / P2 / P3 / P4 |
| Epic | Epic ID from Epic Map |
| Related User Stories | One or more User Story IDs |
| Title | Short product-oriented title |
| Description | Clear explanation of what must be delivered |
| User Value / Delivery Value | Why this item matters |
| Primary Role | Organizer / Vendor / Admin / System / Anonymous |
| Type | Product / Technical / AI / Security / QA / DevOps / Demo / Academic |
| MoSCoW | Must Have / Should Have / Could Have / Future / Out of Scope |
| Dependencies | Other backlog IDs or epic dependencies |
| Acceptance Summary | 3–6 high-level acceptance bullets |
| Traceability | FR / UC / BR / NFR / ADR references when available |
| Notes | Scope clarifications, PO decisions, risks, or implementation warnings |

---

## 7. OUTPUT DOCUMENT REQUIREMENTS

Generate the document at:

```text
management/artifacts/Product-Backlog-Prioritized.md
````

The document must be titled:

```md
# EventFlow — Product Backlog Prioritized
```

The document must include the following sections:

## 1. Propósito del documento

Explain that this artifact transforms the Epic Map and User Stories Coverage Matrix into an actionable prioritized backlog for MVP planning, sprint planning, task generation, QA, and academic delivery.

## 2. Fuentes utilizadas

List all primary and supporting sources used.

## 3. Principios de priorización

Explain the prioritization logic:

* MVP-first
* Demo-first
* Foundation before product flow
* Human-in-the-loop for AI
* Backend as authorization source of truth
* Seed-first demo
* Avoid scope creep
* Traceability required
* No transactional marketplace in MVP

## 4. Decisiones PO aplicadas

Document all scope, operational, and functional decisions applied from `Product-Backlog-Prioritization-Input.md`.

## 5. Modelo de prioridad

Include the P0–P4 table.

## 6. Vista ejecutiva del backlog

Create an executive summary table:

| Priority | Count | Focus | Expected Delivery Value |
| -------- | ----: | ----- | ----------------------- |

Also include a second table:

| Type | Count | Notes |
| ---- | ----: | ----- |

Types should include Product, Technical, AI, Security, QA, DevOps, Demo, Academic.

## 7. Backlog P0 — Foundation / Blocking

Create prioritized backlog items for all P0 work.

The order should generally be:

1. Database foundation
2. Backend modular monolith foundation
3. API foundation
4. Security foundation
5. AI foundation
6. Frontend foundation
7. Seed foundation
8. QA foundation
9. DevOps foundation

Each item must follow the backlog item structure.

## 8. Backlog P1 — MVP Critical Path

Create prioritized backlog items for the core end-to-end MVP journey.

The order should generally follow:

1. Auth and profile
2. Event creation and management
3. AI planning
4. Checklist/tasks
5. Budget
6. Vendor onboarding/admin approval
7. Vendor discovery
8. Quote request
9. Quote response
10. Quote comparison
11. Booking intent
12. Review
13. Admin governance
14. i18n/currency baseline

Each item must follow the backlog item structure.

## 9. Backlog P2 — MVP Important

Create prioritized backlog items for important but non-blocking MVP capabilities:

* AI comparison summary
* AI urgent task prioritization
* AI regeneration
* Notifications
* Admin metrics
* Observability
* QA hardening
* Accessibility/i18n hardening
* Error/fallback states

Each item must follow the backlog item structure.

## 10. Backlog P3 — Demo Polish / Academic Evidence

Create backlog items for:

* Guided demo script
* Demo readiness checklist
* Demo seed verification
* Smoke test on demo URL
* ADR index
* User Story traceability validation
* Prompt examples and outputs
* Academic evidence report

Each item must follow the backlog item structure.

## 11. Backlog P4 — Future / Out of Scope

Create a clearly separated table of deferred items:

| Backlog ID | Related US / Epic | Title | Reason for deferral | Recommended target |
| ---------- | ----------------- | ----- | ------------------- | ------------------ |

Include at least:

* OAuth Google
* Vendor AI bio/packages
* Payments
* Contracts
* WhatsApp
* Real-time chat
* Native mobile
* Push notifications
* Multi-user event collaboration
* Currency conversion
* RAG/vector DB
* AI autonomous moderation
* AI autonomous booking
* Vendor billing/subscriptions

## 12. Dependency map

Include a Mermaid dependency diagram showing how P0 enables P1, how P1 enables P2, and how P3 depends on QA/Seed/DevOps readiness.

Use a simple and readable flowchart.

## 13. Suggested release slicing

Suggest a release slicing model:

### Release 0 — Technical Foundation

P0 items.

### Release 1 — Organizer Planning Loop

Auth, event, AI plan, tasks, budget.

### Release 2 — Vendor Quote Loop

Vendor profile, admin approval, discovery, quote request, quote response.

### Release 3 — Decision & Closure Loop

Comparison, booking intent, review, notifications.

### Release 4 — Demo & Academic Readiness

Seed, smoke, evidence, ADR index, prompt examples.

For each release include:

| Release | Goal | Included Priorities | Key Backlog Items | Exit Criteria |
| ------- | ---- | ------------------- | ----------------- | ------------- |

## 14. MVP cutline

Clearly state what is required for the MVP demo to be considered complete.

Include:

* Minimum P0 completion
* Minimum P1 completion
* Selected P2 items required for robustness
* P3 items required for academic delivery
* P4 excluded

## 15. Risks and mitigations

Create a table:

| Risk | Impact | Probability | Mitigation | Related Backlog Items |
| ---- | ------ | ----------- | ---------- | --------------------- |

Include risks around:

* AI provider instability
* Seed inconsistency
* Authorization bugs
* Scope creep
* Overengineering
* Demo environment failure
* Missing traceability
* Incomplete quote flow
* Frontend/backend contract drift

## 16. Readiness checklist

Create a checklist grouped by:

* Product readiness
* Technical readiness
* QA readiness
* Demo readiness
* Academic readiness

## 17. Final recommendation

Conclude with a PO/BA recommendation on how to use this backlog to generate:

1. Development Tasks
2. Acceptance Criteria
3. Sprint Plan / Roadmap

---

## 8. QUALITY RULES

Follow these rules strictly:

1. Do not invent user stories outside the existing coverage matrix unless they are clearly marked as derived backlog grouping items.
2. Do not introduce scope outside the MVP.
3. Do not convert Future or Out-of-Scope features into MVP backlog items.
4. Preserve traceability to Epic IDs and User Story IDs.
5. Keep the output realistic for an academic MVP.
6. Prefer fewer, well-structured backlog items over excessive fragmentation.
7. Technical foundation items may group multiple user stories if they are delivery-enabling.
8. Product items should remain user-value oriented.
9. Security and authorization must be treated as P0/P1, not as late polish.
10. AI features must keep human-in-the-loop as mandatory.
11. Seed/demo readiness must be prioritized because the MVP depends on reproducible academic evaluation.
12. The document must be actionable enough to generate development tasks afterward.

---

## 9. EXPECTED OUTPUT

Return only the full markdown content for:

```text
management/artifacts/Product-Backlog-Prioritized.md
```

Do not include explanations before or after the document.

The final document must be in **Spanish LATAM neutral**.
