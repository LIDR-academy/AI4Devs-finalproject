# Test Plan — C1 · Incident Management

> Sources: `docs/backlog/C1/user-stories.md` (32 stories, all greenfield) · `docs/backlog/C1/tickets/` (98 tickets) · `docs/backlog/epic-map.md` · `CLAUDE.md` §2–§3 · `docs/product/ARCHITECTURE.md` §5, §6.2, §8, §9 · PRD §7.1, §14
> This document is both the **BDD specification** and the **test strategy** for the epic. Every scenario below is written to seed a `.feature` file or a `*.spec.ts` directly.

## Context

`C1` is the core aggregate of the product: intake, reference numbering, categorization, the Impact × Urgency matrix, the competition-in-progress flag, the eight-state lifecycle, clock-stopping Pending states, closure, collaboration, assignment, escalation, linking, scope enforcement, knowledge deflection, duplicate detection and First Contact Resolution.

**Nothing was read from the codebase because there is none** — no `package.json`, no `apps/`, no `libs/`, no test. Every scenario below is written from the user stories and the architecture, not from source. All 32 stories are greenfield; no story carries a **Today:** line, so **no regression scenario is mandatory** in this epic.

**Where the risk concentrates.** `FR-INC-05` — the agent-only, justification-bearing competition-in-progress flag — is the one behavior the epic map calls domain-differentiating, and it is the only requirement in `C1` whose failure mode is **silent**: a flag that is set automatically, or accepted from a requester, produces a working system with a corrupted priority signal. `AT-C1-32` → `AT-C1-35` are therefore the highest-value scenarios in the plan, and `AT-C1-33` is a **permanent gate** rather than epic acceptance that can be retired.

### What is deliberately not covered here

| Excluded | Why |
|---|---|
| The 2 **foundation** tickets (`T-C1-01`, `T-C1-02`) | They have no persona and no user-observable behavior. Their *done* is the mechanical check written in the ticket itself — six projects with three tags each, a lint probe that fails on an illegal import, a migration that runs and reverts. |
| The whole workspace foundation | Priced once into `C10` (epic map, *Foundation ownership*) and covered by `docs/backlog/C10/test-plan.md`. Nx, the tag scheme, the four applications, the shared libraries, the design system and the base migration chain are **assumed working** here. |
| SLA clock arithmetic, targets and schedules | `C7`. `AT-C1-47` → `AT-C1-49` assert that the Incident side **publishes correct pause/resume signals** and that the `apps/api` adapter receives them. What `C7` then computes is its own acceptance. |
| Major Incident declaration, protocol, cadence and closure propagation | `C13` (`FR-MIM-01` → `FR-MIM-06`). `AT-C1-57` asserts the Incident-side parent reference and explicitly asserts that **nothing propagates** in this epic. |
| Resolver Group definition, membership and routing; management contacts | `C14` / `C10`. Referenced through a port, never defined here. |
| Notification delivery and audit-entry persistence | `C16`, `C18`. `C1` publishes domain events post-commit; scenarios assert **publication** against a test subscriber and stop there (ADR-008). |
| Knowledge search, ranking and the article model | `C9`. `AT-C1-78` and `AT-C1-79` assert the port contract and the degradation, not the relevance of results. |
| The Service Request side of conversion | `C2`. `AT-C1-73` and `AT-C1-74` assert the Incident side and the refusing stub; `FR-INC-14` is **not satisfied** by this epic alone. |
| Structured logging, health probes, i18n scaffolding, the a11y baseline | Priced into the `NFR` epic standalone slice by the epic map. Individual scenarios assert localized *messages* and per-screen a11y, not the platform baseline. |

### Implementation handoff

| Level | Where it lives | Who implements |
|---|---|---|
| Unit | `*.spec.ts` co-located in the lib | `backend-engineer` (domain, application, infrastructure) · `frontend-engineer` (components, stores) |
| Integration | `*.spec.ts` against a real PostgreSQL from `T-C10-16` | `backend-engineer` |
| API-E2E | `.feature` + step definitions in `apps/api-e2e` (`platform:backend`, `type:e2e`) | No dev agent owns this; it is **e2e-harness work on the backend platform**, the same layer/platform naming used by `T-C1-64` and `T-C1-71` |
| E2E | `.feature` + step definitions in `apps/web-e2e` (`platform:frontend`, `type:e2e`) | **e2e-harness work on the frontend platform** |

Test stack: **Jest 29** (unit, integration) · **jest-preset-angular** (components + signals) · **@nestjs/testing** (backend wiring) · **Cypress 15 + `@badeball/cypress-cucumber-preprocessor`** (`apps/api-e2e`, `apps/web-e2e`) · Nx targets `test` and `e2e`. Coverage floor 80% on changed libs (`ARCHITECTURE.md` §9).

**Shared test data.** One seed fixture serves the epic, layered on the `C10` fixture (roles of PRD §4.3, users, scope grants):

- **Actors** — `requester-a` (Player), `requester-b`, `referee-r` (Referee), `organizer-x` (Organizer, grant over competition `X`), `agent-l1`, `agent-l1-no-flag` (agent role without the flag permission), `analyst-l2`, `service-owner-1`, `sysadmin-1`, and the **system actor** of `FR-AUD-02`.
- **Taxonomy** — a three-level tree with one Item-level node in use (`cat/sub/item-A`), one deactivated node, and one node referenced by an existing Incident so the delete refusal is exercisable.
- **Matrix** — a complete Impact × Urgency matrix, version `1`, plus an incomplete one for the fail-fast scenarios; uplift configuration with the documented default.
- **Competition subjects** — one resolvable SCMS instance per subject type used, plus an unreachable-SCMS fixture for the fallback.
- **Clock** — every time-dependent scenario runs on `FixedClock` (`T-C10-09`, ADR-009). **No scenario sleeps and none asserts against wall-clock time.**

---

## Acceptance scenarios

### US-C1-01 · A requester logs an Incident from the portal

#### AT-C1-01 — A requester intake captures the record and takes the reporter from the session — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the authenticated requester `requester-a`
**When** they post a report carrying a short description, a detailed description and an affected service, and a `reporter` field naming `requester-b`
**Then** the response is `201` with a reference number, the persisted reporter is `requester-a`, the supplied `requester-b` is discarded, and the contact channel is recorded.

- Test data: `requester-a`, `requester-b` · Dependencies: running API, real DB · Covers: US-C1-01 (`T-C1-05`, `T-C1-07`, `T-C1-08`)
- Why API-E2E: the property is that the *session*, not the body, decides the reporter — only the full HTTP path can show that.

#### AT-C1-02 — Every priority-bearing field is rejected at requester intake — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the requester intake route
**When** a body is posted carrying, in turn, an Impact, an Urgency, a Priority and the competition-in-progress flag
**Then** each of the four is rejected with a validation failure naming the field, no Incident is created in any of the four cases, and **no field is silently stripped**.

- Test data: four crafted bodies · Dependencies: running API · Covers: US-C1-01, US-C1-12 (`T-C1-08`, `T-C1-44`) · `NFR-SEC-02`
- Why API-E2E: `NFR-SEC-02` is a claim about what the *server* accepts regardless of client, which a unit test on the DTO cannot demonstrate end to end.

#### AT-C1-03 — The requester form is plain-language, mobile and keyboard-complete — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** the intake form at a 360px viewport with a keyboard only
**When** a requester with no ITSM knowledge completes and submits it
**Then** no Impact, Urgency, Priority or competition-flag control exists anywhere in the page, no horizontal scrolling is required, every control is reachable without a pointer, and a validation failure states what happened and what to do next in the active language.

- Test data: `requester-a`, an incomplete submission · Dependencies: running API and web · Covers: US-C1-01 (`T-C1-10`) · `NFR-USE-01`, `NFR-USE-04`, `NFR-USE-05`
- Why E2E: viewport behavior, keyboard reachability and the live-region announcement are browser behaviors.

### US-C1-02 · An agent logs a phone-reported Incident in one flow

#### AT-C1-04 — Reporter, acting agent and channel are three separable facts — P0 — type: Unit — impl: `backend-engineer`

**Given** `agent-l1` logging on behalf of the caller `referee-r`
**When** `LogIncidentOnBehalfUseCase` executes against stubbed ports
**Then** the reporter is `referee-r`, the acting actor is `agent-l1`, the contact channel is recorded, and the three are readable independently; and **given** a caller who is not a registered user, the use case raises a typed error and creates nothing.

- Test data: in-memory actors, stub repository · Dependencies: none · Covers: US-C1-02 (`T-C1-11`) · `NFR-SEC-01`
- Why Unit: this is a use-case decision about attribution; routing it through HTTP would test the controller instead.

#### AT-C1-05 — The agent intake flow never loses typed data — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** `agent-l1` mid-call with a long description, a category and an assessment entered
**When** they perform a reporter lookup, then submit and hit a validation failure
**Then** no step navigates away from the page, every entered value survives both events, focus moves to the first field in error, and a caller with no match yields an explicit must-exist state with an offered path rather than a free-text fallback.

- Test data: `referee-r` registered, one unregistered caller · Dependencies: running API and web · Covers: US-C1-02 (`T-C1-12`, `T-C1-13`) · `NFR-USE-02`
- Why E2E: the requirement is about continuity across interactions, which only a browser session exhibits.

### US-C1-03 · Affected competition subject and instance as structured references

#### AT-C1-06 — The subject type is a closed set of exactly twelve values — P0 — type: Unit — impl: `backend-engineer`

**Given** the `SubjectType` union
**When** it is enumerated, and when a `CompetitionSubject` is constructed from a value outside it
**Then** the enumeration contains exactly the twelve values of `FR-INC-01` with stable identifiers, and the out-of-set construction raises a typed domain error.

- Test data: the twelve identifiers plus one invalid string · Dependencies: none · Covers: US-C1-03 (`T-C1-14`)
- Why Unit: it is a closed-set invariant; asserting it in the domain is what stops free text arriving through any adapter.

#### AT-C1-07 — SCMS vocabulary never reaches the Incident model, and unreachable SCMS never blocks a ticket — P0 — type: Integration — impl: `backend-engineer`

**Given** the SCMS lookup adapter reachable, and separately timing out
**When** an agent records a competition instance in each case
**Then** the first stores a stable reference, the second uses the free-text fallback and marks the reference **unresolved**, the Incident is created in both cases, and no SCMS field name, code or type appears anywhere in `libs/incident/domain`.

- Test data: a resolvable instance; an SCMS stub that times out · Dependencies: real DB, stubbed SCMS · Covers: US-C1-03 (`T-C1-15`) · risk **R10**
- Why Integration: the assertion spans the port, both adapters and what is persisted; a unit test on either adapter alone proves neither the swap nor the mark.

#### AT-C1-08 — The unresolved state is explicit in the response — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an Incident whose competition instance was recorded through the fallback
**When** it is read over the API
**Then** the unresolved state is a present field in the payload, not inferred from a missing or empty value.

- Test data: one fallback-created Incident · Dependencies: running API, real DB · Covers: US-C1-03 (`T-C1-15`, `T-C1-16`)

### US-C1-04 · Attachments on an Incident

#### AT-C1-09 — Attachments are optional and fully attributed — P1 — type: Integration — impl: `backend-engineer`

**Given** an Incident with no attachment and one with two attachments
**When** each is saved and reloaded
**Then** the first is valid, and the second round-trips filename, content type, size, uploading actor and upload time unchanged, with one `AttachmentAdded` event per file.

- Test data: two files of different types · Dependencies: real DB, storage adapter · Covers: US-C1-04 (`T-C1-17`)

#### AT-C1-10 — Oversized and disallowed files are rejected before storage — P0 — type: Unit — impl: `backend-engineer`

**Given** the configured size limit and content-type allow-list
**When** a file one byte over the limit and a file with a disallowed resolved content type are uploaded
**Then** each is rejected **before anything reaches the storage port**, the message names the limit and the accepted types, and the type check uses the resolved content type rather than the filename extension.

- Test data: a boundary-sized file; a file whose extension and content type disagree · Dependencies: none — stubbed storage port · Covers: US-C1-04 (`T-C1-18`) · `NFR-USE-05`
- Why Unit: the point is that nothing is written; a spy on the unbound port proves it, an integration test would merely not find a file.

#### AT-C1-11 — An attachment on an internal work note is invisible and unreachable to a requester — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an Incident with an attachment on an internal work note
**When** the requester lists the attachments and then requests that attachment by direct identifier
**Then** it is absent from the listing and the direct request is refused indistinguishably from a non-existent attachment; an agent making the same two calls receives it.

- Test data: `requester-a`, `agent-l1`, one internal-note attachment · Dependencies: running API, real DB · Covers: US-C1-04, US-C1-22 (`T-C1-18`, `T-C1-67`) · `NFR-SEC-04`
- Why API-E2E: the direct-identifier path bypasses the listing, and only the transport shows both are closed. The agent leg proves the test measures visibility rather than an empty fixture.

### US-C1-05 · A unique, human-readable reference number

#### AT-C1-12 — Concurrent creation never yields a duplicate reference, and the constraint is what enforces it — P0 — type: Integration — impl: `backend-engineer`

**Given** two Incidents created concurrently in separate transactions
**When** both commit, and again with the application-level uniqueness check removed
**Then** the references differ in both runs, proving the database constraint and not the code is the guarantee.

- Test data: two concurrent creations · Dependencies: real PostgreSQL · Covers: US-C1-05 (`T-C1-04`)
- Why Integration: a race is only observable against a real database; a mocked repository cannot lose it.

#### AT-C1-13 — A reference is never modified and never re-issued — P0 — type: Integration — impl: `backend-engineer`

**Given** an existing Incident, one cancelled Incident and one deleted Incident
**When** an update attempts to change the first reference, and the next reference is allocated after the other two
**Then** the update is rejected at the database level and the newly allocated reference is a value neither released number ever held.

- Test data: three Incidents · Dependencies: real PostgreSQL · Covers: US-C1-05 (`T-C1-04`) · `NFR-DAT-01`

#### AT-C1-14 — Every Incident has a reference from the moment it exists — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the intake routes
**When** an Incident is created through each of them
**Then** the response carries a reference matching the documented format, the format is free of characters that are ambiguous when spoken, and no query of the store finds an Incident without one.

- Test data: requester and agent intake · Dependencies: running API, real DB · Covers: US-C1-05 (`T-C1-03`, `T-C1-04`) · `FR-INC-02`

### US-C1-06 · A configurable Category → Subcategory → Item taxonomy

#### AT-C1-15 — The taxonomy is exactly three levels and none of it is hardcoded — P0 — type: Unit — impl: `backend-engineer`

**Given** the taxonomy aggregate
**When** a fourth level is attempted, and when a child is attached to a parent two levels above
**Then** each raises a typed domain error; and a search of the `incident` libraries finds no hardcoded category, subcategory or item name.

- Test data: a three-level fixture tree · Dependencies: none · Covers: US-C1-06 (`T-C1-20`)

#### AT-C1-16 — A renamed or deactivated node leaves history intact — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident created under `cat/sub/item-A`
**When** that node is renamed and then deactivated
**Then** the Incident still references the same identifier with unchanged historical grouping, the node is absent from the options offered for new Incidents, and it remains valid on the existing record.

- Test data: one Incident, one node · Dependencies: real DB · Covers: US-C1-06 (`T-C1-21`) · `NFR-DAT-03`
- Why Integration: the guarantee is about what is stored — an identifier rather than a copied label — which only the database can show.

#### AT-C1-17 — Deleting a node in use is refused and deactivation is offered — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a node referenced by an Incident, and a node whose descendant is referenced
**When** `sysadmin-1` attempts to delete each
**Then** both are refused with a typed error naming the constraint and pointing at deactivation, nothing changes, and the change takes effect for new Incidents without a restart once deactivation is used instead.

- Test data: two nodes, one Incident · Dependencies: running API, real DB · Covers: US-C1-06 (`T-C1-22`)

### US-C1-07 · Category is required before an Incident leaves `New`

#### AT-C1-18 — The gate refuses on every inbound path, at Item level — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident in `New` with no category, one categorized only to Category level, one only to Subcategory level, and one to Item level
**When** a transition out of `New` is attempted for each
**Then** the first three are refused with a typed domain error naming the missing category and the state is unchanged; the fourth proceeds subject to the other transition rules.

- Test data: four in-memory Incidents · Dependencies: none — no HTTP, no DB · Covers: US-C1-07 (`T-C1-25`)
- Why Unit: `US-C1-07` requires the gate to hold independently of any adapter; a domain test is the only assertion that proves that.

#### AT-C1-19 — Intake without a category still succeeds — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a requester submitting with no category
**When** the Incident is created
**Then** creation succeeds and the Incident rests in `New`; the gate applies at exit, not at intake.

- Test data: `requester-a` · Dependencies: running API, real DB · Covers: US-C1-07 (`T-C1-07`, `T-C1-25`)

### US-C1-08 · Priority derived server-side from the Impact × Urgency matrix

#### AT-C1-20 — Derivation is a pure total function over the matrix — P0 — type: Unit — impl: `backend-engineer`

**Given** a complete matrix
**When** `PriorityCalculator.derive` is called for every Impact × Urgency pair, repeatedly
**Then** each result equals the mapping the matrix declares, repeated calls return the same value, and nothing is mutated; the calculator performs no I/O, reads no configuration and calls no clock.

- Test data: the fixture matrix, full cross-product · Dependencies: none · Covers: US-C1-08 (`T-C1-29`)

#### AT-C1-21 — An unassessed Incident reports Priority as not-yet-derived — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an Incident whose Impact or Urgency is unassessed
**When** it is read
**Then** Priority is the explicit not-yet-derived value and never a middle level that could be mistaken for an assessment.

- Test data: one partially assessed Incident · Dependencies: running API, real DB · Covers: US-C1-08 (`T-C1-30`)

#### AT-C1-22 — A client-posted Priority is ignored and the change publishes its cause — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an assessed Incident
**When** an assessment change is posted carrying a `priority` field
**Then** the persisted Priority is the derived value, the posted one is ignored, and exactly one `PriorityChanged` event is published after commit carrying previous, new, the derivation reason and the matrix version.

- Test data: `agent-l1`, a test event subscriber · Dependencies: running API, real DB, in-process publisher · Covers: US-C1-08 (`T-C1-30`) · `NFR-SEC-02`, consumed later by `FR-SLA-04`

### US-C1-09 · Configure the Impact × Urgency matrix

#### AT-C1-23 — An incomplete matrix cannot exist and cannot boot — P0 — type: Integration — impl: `backend-engineer`

**Given** a matrix with one combination unmapped, one mapping a pair to two Priorities, and an absent matrix
**When** each is saved, and when the application boots against each
**Then** the save is refused with the missing or duplicated combination named, and the boot fails fast with a message naming the problem and does not start — no default matrix is ever assumed.

- Test data: three matrix fixtures · Dependencies: `@nestjs/testing` container, real DB · Covers: US-C1-09 (`T-C1-26`, `T-C1-27`)

#### AT-C1-24 — In-flight Incidents keep the matrix version they were created under — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident created under matrix version `1`
**When** the matrix is changed to version `2` and both that Incident and a new one are derived
**Then** the first resolves version `1` and the second version `2`.

- Test data: two matrix versions, two Incidents · Dependencies: real DB · Covers: US-C1-09 (`T-C1-27`) · `NFR-CFG-02`

#### AT-C1-25 — The matrix grid is keyboard-navigable and states what is unmapped — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** the matrix configuration screen showing an incomplete matrix, operated by keyboard only
**When** the administrator traverses the grid and attempts to save
**Then** every cell is reachable by arrow keys with its Impact and Urgency context announced, unmapped cells are identifiable without relying on color, saving is refused with the missing combinations named, and the page imports no third-party component library.

- Test data: an incomplete matrix · Dependencies: running API and web · Covers: US-C1-09 (`T-C1-28`) · ADR-010, WCAG 2.1 AA

### US-C1-10 · Agent override of the derived Priority, with mandatory justification

#### AT-C1-26 — An override without a justification is refused in the domain — P0 — type: Unit — impl: `backend-engineer`

**Given** an assessed Incident
**When** an override is applied with an absent, blank and whitespace-only justification in turn
**Then** each raises a typed domain error and the Priority is unchanged — the rule holds with no form and no DTO present.

- Test data: three justification values · Dependencies: none · Covers: US-C1-10 (`T-C1-32`)
- Why Unit: `US-C1-10` requires the justification to be mandatory *in the domain*, not by a required form field; only a domain test distinguishes the two.

#### AT-C1-27 — An override retains the derived value and is denied without the permission — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** `agent-l1` with the prioritization permission and `requester-a` without it
**When** each submits an override with a justification, directly and through the HTTP route
**Then** the agent override commits with the overridden value, the derived value and the justification all readable, and one event carries actor, previous, new and justification; every attempt by the requester is denied with `403` with nothing persisted and no event published.

- Test data: `agent-l1`, `requester-a`, a test subscriber · Dependencies: running API, real DB · Covers: US-C1-10 (`T-C1-33`)

#### AT-C1-28 — The override survives an assessment change until explicitly returned — P0 — type: Unit — impl: `backend-engineer` — **blocked: F30**

**Given** an Incident with an overridden Priority
**When** its Impact or Urgency changes, and separately when an agent returns it to the derived value
**Then** the first leaves the effective Priority at the override with the newly derived value recorded alongside, and the second makes the derived value effective and publishes the clearing event; both outcomes come from the single precedence predicate.

- Test data: an overridden Incident · Dependencies: none · Covers: US-C1-10 (`T-C1-32`, `T-C1-34`) · Blocked on: which of override and re-derivation wins (**F30**)

### US-C1-11 · Agent flags that the Incident affects a competition in progress

#### AT-C1-29 — The flag cannot exist without a justification, an actor and a timestamp — P0 — type: Unit — impl: `backend-engineer`

**Given** the `CompetitionImpactFlag` value object
**When** it is constructed with an absent, blank and whitespace-only justification in turn, and then with a valid one
**Then** the first three raise a typed domain error and no flag exists; the fourth carries the justification, the setting actor and the `ClockPort` timestamp, and no read model exposes the flag without its justification.

- Test data: four constructions, `FixedClock` · Dependencies: none · Covers: US-C1-11 (`T-C1-39`)

#### AT-C1-30 — The flag raises Impact and Priority comes back through the matrix — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident at every Impact × Urgency pair in the cross-product
**When** the flag is set with the configured uplift
**Then** the effective Impact is the assessed Impact raised by the uplift, the resulting Priority equals the matrix mapping for that raised pair in every case, the underlying assessed Impact is still readable, and **the flag handler contains no direct Priority assignment**.

- Test data: the fixture matrix and uplift, full cross-product · Dependencies: none · Covers: US-C1-11 (`T-C1-40`)
- Why Unit: this is the mechanism that keeps `FR-INC-05` consistent with `FR-INC-04`. An E2E on one example would pass while the general rule was broken.

#### AT-C1-31 — The ceiling case is deterministic and never a silent no-op — P0 — type: Unit — impl: `backend-engineer` — **blocked: F24**

**Given** an Incident whose assessed Impact is already at the top of the scale
**When** the flag is set
**Then** the result is an explicit typed outcome — either the flag recorded without further uplift, or the flag refused because Impact is at maximum, per the decided behavior — and **never** an unchanged Incident returned as success with no statement of what happened.

- Test data: a maximum-Impact Incident · Dependencies: none · Covers: US-C1-11 (`T-C1-41`) · Blocked on: clamp versus refuse (**F24**)
- Both candidate behaviors are written; the one not chosen stays pending, so the decision is a switch rather than a rewrite.

### US-C1-12 · The flag is agent-only and never automatic

> These four scenarios are the highest-value tests in the epic. `FR-INC-05` is the differentiating behavior of the product, and its failure mode is silent: a flag set automatically or accepted from a requester yields a working system with a corrupted priority signal.

#### AT-C1-32 — Setting the flag with a system actor is refused — P0 — type: Unit — impl: `backend-engineer`

**Given** the flag write path
**When** it is invoked with the **system/rule actor** of `FR-AUD-02`, and separately with a human actor lacking the flag permission
**Then** the first is refused with a typed error distinct from an authorization denial, the second is denied with `403`, in both cases the flag is unchanged and no event is published, and the two refusals are separately reportable.

- Test data: the system actor, `agent-l1-no-flag` · Dependencies: none · Covers: US-C1-12 (`T-C1-43`, `T-C1-45`)
- Why Unit: `US-C1-12` names this test explicitly as what makes *never automatically* falsifiable rather than a comment.

#### AT-C1-33 — Exactly one code path writes the flag, and no automated source reaches it — P0 — type: Unit (static enumeration) — impl: `backend-engineer`

**Given** the `incident` libraries and the `apps/api` incident wiring
**When** the callers of the flag mutator are enumerated, and when every scheduled, imported, workflow-driven and SLA-threshold-driven handler is traced
**Then** there is exactly one caller — the agent use case — no automated handler reaches a flag mutator, and adding a second caller fails the test.

- Test data: none — a static caller enumeration over the source graph · Dependencies: none · Covers: US-C1-12 (`T-C1-45`), with `T-C1-78` explicitly in scope
- **Treat this as a permanent gate, not as `C1` acceptance that can be retired.** It is the only assertion that keeps holding as later epics add automation, and ADR-006 already removes the tempting sources (no competition calendar, no live windows, no freeze windows).

#### AT-C1-34 — Every requester-reachable route rejects the flag field — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the live route table
**When** the flag is posted to the intake route and to every update route, including with a client that hides the field in its UI
**Then** exactly one route accepts it — the dedicated agent route — every other rejects it with a validation failure naming the field, the stored flag is unchanged in each case, and a silently stripped field fails the suite.

- Test data: crafted bodies per route · Dependencies: running API, real DB · Covers: US-C1-12 (`T-C1-43`, `T-C1-44`) · `NFR-SEC-02`
- Why API-E2E: like `AT-C10-06`, this is an *enumeration* rather than an example — it is what stops a later epic quietly opening a second door.

#### AT-C1-35 — The agent path works and is the only one that does — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** `agent-l1` holding the flag permission
**When** they set the flag with a justification through its dedicated route
**Then** it succeeds, the uplift and re-derivation apply, and the causal event is published — proving `AT-C1-34` measures the control rather than a broken feature.

- Test data: `agent-l1`, an assessed Incident · Dependencies: running API, real DB · Covers: US-C1-12 (`T-C1-43`)

### US-C1-13 · Changing and clearing the flag re-derives Priority

#### AT-C1-36 — Clearing removes the uplift and re-derives from the underlying assessment — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident with the flag set and the uplift applied
**When** an agent clears it with a justification
**Then** the effective Impact returns exactly to the underlying assessed value, Priority is re-derived through the matrix, and one event carries actor, justification, previous and new Impact and previous and new Priority.

- Test data: a flagged Incident, `FixedClock` · Dependencies: none · Covers: US-C1-13 (`T-C1-46`)

#### AT-C1-37 — Clearing removes the uplift, never the record — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident whose flag was set and later cleared, and one where only the justification was amended
**When** the activity history is read
**Then** it shows the set, its reason, its actor, the clear and the interval the flag was held; the amendment appears as its own entry; and no past entry is modifiable.

- Test data: one flagged-then-cleared Incident, one amended · Dependencies: real DB · Covers: US-C1-13 (`T-C1-46`) · `NFR-AUD-02`

#### AT-C1-38 — Flag and override cannot disagree — P0 — type: Unit — impl: `backend-engineer` — **blocked: F30**

**Given** the four combinations of override present or absent crossed with flag set or cleared
**When** each is exercised
**Then** every outcome comes from the single precedence predicate, the effective, derived and overridden Priorities remain separately readable, and no combination is left unasserted.

- Test data: four Incident fixtures · Dependencies: none · Covers: US-C1-13, US-C1-10 (`T-C1-47`) · Blocked on: **F30**
- The story records why this matters: two independently reasonable implementations exist and **they produce different P1 counts**.

### US-C1-14 · Configure the Impact uplift applied by the flag

#### AT-C1-39 — A meaningless uplift is refused with its valid range named — P1 — type: Unit — impl: `backend-engineer`

**Given** an uplift of zero, a negative uplift, one exceeding the scale, and a valid one
**When** each is constructed
**Then** the first three raise a typed error naming the valid range, the fourth is expressed in Impact levels rather than an opaque number, and the boundary values one below, at and one above the range are all asserted.

- Test data: four uplift values · Dependencies: none · Covers: US-C1-14 (`T-C1-36`)

#### AT-C1-40 — The uplift is versioned, audited and boot-validated — P1 — type: Integration — impl: `backend-engineer`

**Given** an Incident created under uplift version `1` and absent uplift configuration
**When** the uplift changes to version `2` and the flag is applied to that Incident, and separately when the application boots with the configuration absent
**Then** version `1` is applied to the in-flight Incident and version `2` to a new one, one `ImpactUpliftChanged` event was published on the change, and the boot fails fast naming the key.

- Test data: two uplift versions, one absent-config fixture · Dependencies: real DB, `@nestjs/testing` · Covers: US-C1-14 (`T-C1-37`) · `NFR-CFG-02`, `FR-AUD-05`

### US-C1-15 · The Incident lifecycle with configurable transitions

#### AT-C1-41 — The state set is exactly `FR-INC-06`, with three distinguishable Pending reasons — P0 — type: Unit — impl: `backend-engineer`

**Given** the Incident state model
**When** it is enumerated
**Then** it contains exactly `New`, `Assigned`, `In Progress`, `Pending` with the customer, third-party and change reasons distinguishable from one another, `Resolved`, `Closed` and `Cancelled`; and a search of the `incident` libraries finds no bespoke state machine — only the shared `StateModel` primitive.

- Test data: none · Dependencies: none · Covers: US-C1-15 (`T-C1-49`) · ADR-001

#### AT-C1-42 — A disallowed transition is refused, and terminal states are protected — P0 — type: Unit — impl: `backend-engineer`

**Given** a transition the configuration does not allow, and an Incident in `Closed` and in `Cancelled`
**When** each transition is attempted
**Then** every one is refused with a typed domain error naming the current state and the attempted target, nothing changes, and a reopen succeeds only because the configuration explicitly names it.

- Test data: a transition-rule fixture · Dependencies: none · Covers: US-C1-15 (`T-C1-49`, `T-C1-51`)

#### AT-C1-43 — A transition-rule change takes effect without a restart, and the client follows it — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** an Incident in a given state and a running application
**When** an administrator changes the transition configuration and the agent view is reloaded
**Then** the offered transitions change with no application restart and no frontend deployment, the frontend libraries contain no hardcoded transition list, and each state change is announced through the live region.

- Test data: two transition-rule versions · Dependencies: running API and web, real DB · Covers: US-C1-15 (`T-C1-50`, `T-C1-52`)

### US-C1-16 · Resolution requires a resolution code and notes

#### AT-C1-44 — Resolution without a code or with blank notes is refused — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident being transitioned to `Resolved` with no code, with a code and blank notes, with a code and whitespace-only notes, and with both valid
**When** each is attempted
**Then** the first three are refused with a typed domain error and the state is unchanged; the fourth enters `Resolved`, records the resolution with actor and timestamp, and opens the confirmation window.

- Test data: four commands, `FixedClock` · Dependencies: none — no HTTP, no DB · Covers: US-C1-16 (`T-C1-54`)

#### AT-C1-45 — Resolution codes are categorical, versioned reference data — P1 — type: Integration — impl: `backend-engineer`

**Given** the resolution code list and a deactivated code
**When** the list is read in two locales, when new-resolution options are read, and when free text is submitted as a code
**Then** identifiers are identical across locales with only labels differing, the deactivated code is absent from the options while remaining valid on an Incident already resolved under it, and free text is refused.

- Test data: the seeded code list, one deactivated code · Dependencies: real DB · Covers: US-C1-16 (`T-C1-53`) · `NFR-I18N-05`

#### AT-C1-46 — Re-resolution after a reopen requires fresh data and preserves the old — P1 — type: Unit — impl: `backend-engineer`

**Given** a resolved Incident that has been reopened
**When** resolution is attempted with no new code or notes, and then with fresh ones
**Then** the first is refused exactly as a first resolution would be, the second commits, and both resolutions are readable in order with the first unchanged and unmodifiable.

- Test data: one reopened Incident · Dependencies: none · Covers: US-C1-16 (`T-C1-55`) · `NFR-AUD-02`

### US-C1-17 · Pending states stop and resume the SLA clock

#### AT-C1-47 — A clock-stopping Pending state publishes pause and resume; a non-stopping one publishes neither — P0 — type: Unit — impl: `backend-engineer`

**Given** one `Pending` state configured as clock-stopping and one configured as not
**When** an Incident enters and leaves each
**Then** the first publishes exactly one pause and one resume signal, each carrying the state, the reason and the `ClockPort` timestamp; the second publishes neither.

- Test data: two pause-behavior fixtures, `FixedClock` · Dependencies: none · Covers: US-C1-17 (`T-C1-57`)

#### AT-C1-48 — A restart between pause and resume does not lose the interval — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident paused, the process restarted, and the Incident then resumed
**When** the interval is reconstructed
**Then** it is derived from the two persisted UTC events and is identical to the no-restart case, with no reliance on in-memory state.

- Test data: one Incident, a simulated restart · Dependencies: real DB, `FixedClock` · Covers: US-C1-17 (`T-C1-57`, `T-C1-58`) · ADR-009

#### AT-C1-49 — `incident` never imports `sla`, and the adapter is the only object that knows both — P0 — type: Unit (boundary) + Integration — impl: `backend-engineer`

**Given** the workspace dependency graph and the running composition root
**When** lint and the graph are inspected, and when an Incident is paused and resumed with the SLA side absent (null adapter selected)
**Then** no `scope:incident` project depends on `scope:sla`, `apps/api` is the only project depending on both, and every Incident operation succeeds with no error surfaced to the caller.

- Test data: the null adapter configuration · Dependencies: `pnpm nx graph`, running API · Covers: US-C1-17 (`T-C1-01`, `T-C1-58`) · `ARCHITECTURE.md` §8, `NFR-AVL-03`
- The SLA computation itself is `C7` acceptance and is deliberately absent from this plan.

### US-C1-18 · The requester confirms or rejects the resolution

#### AT-C1-50 — Confirmation closes; rejection reopens and is marked as a reopen — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a `Resolved` Incident inside its confirmation window
**When** the requester confirms, and separately when another such Incident is rejected with a reason
**Then** the first moves to `Closed` with the confirmation recorded, the second returns to `In Progress` with the reason recorded, and the rejection event carries an explicit **reopen** marker identifiable without reconstructing the state history.

- Test data: two resolved Incidents, `requester-a`, a test subscriber · Dependencies: running API, real DB, `FixedClock` · Covers: US-C1-18 (`T-C1-60`)

#### AT-C1-51 — A non-requester is refused indistinguishably from not-found — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** `requester-b`, who did not raise the Incident and holds no competition-scoped grant, and an Incident identifier that does not exist
**When** each is used to confirm or reject
**Then** the two responses are identical apart from the correlation identifier, nothing is persisted and no event is published; an agent attempting to confirm on the requester behalf is likewise denied.

- Test data: `requester-a`, `requester-b`, `agent-l1`, a non-existent identifier · Dependencies: running API, real DB · Covers: US-C1-18 (`T-C1-61`) · `FR-IAM-03`, `NFR-SEC-03`
- **This discharges `C10` finding F15**, which deferred end-to-end proof of `FR-IAM-03` to the epics that own the records.

#### AT-C1-52 — An expired window refuses explicitly, never silently — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** a resolved Incident whose confirmation window has elapsed, at a 360px viewport with a keyboard only
**When** the requester submits confirm and then reject
**Then** both are refused with a message stating that the Incident is closed and what to do instead, the message is announced, the offered next step is actionable, and both actions were reachable without a pointer.

- Test data: an expired-window Incident on `FixedClock` · Dependencies: running API and web · Covers: US-C1-18 (`T-C1-61`, `T-C1-62`) · `NFR-USE-04`, `NFR-USE-05`

### US-C1-19 · Auto-close after the confirmation period

#### AT-C1-53 — The auto-close boundary is deterministic and restart-safe — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a `Resolved` Incident and the clock advanced to just inside, exactly at, and just beyond the confirmation period, plus a process restart spanning the boundary
**When** the rule runs in each case
**Then** the just-inside case remains `Resolved`, the at and beyond cases follow the defined boundary behavior explicitly asserted, and the restart case qualifies exactly the same Incidents as the no-restart case.

- Test data: four resolved Incidents, `FixedClock` · Dependencies: running API, real DB · Covers: US-C1-19 (`T-C1-63`, `T-C1-64`) · ADR-009
- The suite contains **no sleep** and no wall-clock assertion, and passes repeatedly with identical results.

#### AT-C1-54 — Auto-closure is attributed to the system actor and skips rejected Incidents — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an auto-closed Incident and one the requester rejected before the period elapsed
**When** the activity history of each is read after the rule runs
**Then** the first is `Closed` with the closing actor the **system actor** — not the last agent who touched it — and the reason "auto-closed, no response" recorded; the second is untouched, because it is no longer in `Resolved`.

- Test data: two resolved Incidents, one rejected · Dependencies: running API, real DB, `FixedClock` · Covers: US-C1-19 (`T-C1-63`) · `FR-AUD-02`
- Boot behavior — absent, zero, negative and non-numeric periods failing fast — is asserted by an integration test on the configuration, inside `T-C1-63`.

### US-C1-20 · Link an Incident to other Incidents and to a parent Major Incident

#### AT-C1-55 — A duplicate link has an explicit direction and cannot form a cycle — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident, and a duplicate chain A→B→C
**When** the Incident is linked as a duplicate of itself, and when C is linked as a duplicate of A
**Then** both are refused with typed domain errors; a valid duplicate link states which record is the duplicate and which the original, not inferred from creation order.

- Test data: three Incidents · Dependencies: none · Covers: US-C1-20 (`T-C1-81`)

#### AT-C1-56 — A link is visible from both ends, cannot be duplicated, and its removal is permissioned — P1 — type: Integration — impl: `backend-engineer`

**Given** a link created from Incident A to Incident B
**When** B is loaded, when the same link is created again, and when an actor without the link permission removes it
**Then** the link appears on B with direction intact, the second creation is refused by the constraint, the removal is denied with `403`, and an authorized removal leaves both records otherwise unchanged with an unlink event published.

- Test data: two Incidents, `analyst-l2`, `requester-a` · Dependencies: real DB · Covers: US-C1-20 (`T-C1-82`, `T-C1-83`)

#### AT-C1-57 — The parent Major Incident reference is stored, and nothing propagates — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident attached to a parent Major Incident
**When** a second parent is attached, and when the Major Incident is resolved and closed
**Then** the second attachment is refused with a typed error, and **nothing happens to the child** — propagation is `FR-MIM-03` and belongs to `C13`; a search of the `incident` libraries finds no Major Incident declaration, protocol, cadence or closure-gate behavior.

- Test data: one Incident, one Major Incident · Dependencies: none · Covers: US-C1-20 (`T-C1-84`)
- Why this is asserted as an *absence*: the scope boundary of `user-stories.md` is that no `FR-MIM-*` behavior exists in this epic. A test that proves nothing propagates is what keeps `C13` work out of `C1`.

### US-C1-21 · Link to Problems, Changes, Releases and Configuration Items

#### AT-C1-58 — A link is a typed reference that needs no model change per target kind — P1 — type: Unit — impl: `backend-engineer`

**Given** the link model
**When** a Problem, Change, Release and Configuration Item link is expressed
**Then** each is a target-kind plus identifier pair, enabling a new kind requires no change to the `Incident` aggregate, and lint fails if any `incident` project imports another context domain library.

- Test data: four target kinds · Dependencies: none plus `pnpm nx lint` · Covers: US-C1-21 (`T-C1-81`)

#### AT-C1-59 — An undeployed target kind degrades explicitly, never into a broken link — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** target kinds whose contexts (`C3`, `C4`, `C5`, `C6`) are not deployed, and an Incident with no links
**When** the links panel renders
**Then** no unavailable kind appears as an actionable option that would fail, any shown kind states why it is unavailable, the no-links case shows an explicit empty state rather than a blank region, and enabling a kind in configuration surfaces it with no frontend code change.

- Test data: a configuration with kinds disabled and then enabled · Dependencies: running API and web · Covers: US-C1-21 (`T-C1-85`) · `NFR-USE-05`

### US-C1-22 · Public comments and internal work notes are distinct

#### AT-C1-60 — An entry with no stated type is internal — P0 — type: Unit — impl: `backend-engineer`

**Given** an entry created with no stated visibility
**When** it is read, and when the persistence schema is inspected
**Then** its visibility is internal, asserted in the domain with no database round trip, and the visibility column is non-nullable with no default resolving to public.

- Test data: one entry · Dependencies: none for the domain half; schema inspection for the second · Covers: US-C1-22 (`T-C1-65`)
- Why this is P0: a nullable column defaulting to public is the single change that would turn every unlabelled entry into a disclosure.

#### AT-C1-61 — A requester cannot create an internal entry, and is refused rather than coerced — P0 — type: Unit — impl: `backend-engineer`

**Given** `requester-a` adding a comment with an internal visibility in the request
**When** the use case executes
**Then** it is refused rather than silently coerced to public, so the caller cannot believe an internal note was created; a comment with no visibility supplied is created public and attributed to them.

- Test data: two requester commands · Dependencies: none · Covers: US-C1-22, US-C1-23 (`T-C1-66`)

#### AT-C1-62 — Internal notes are absent from every requester-reachable payload — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an Incident with both public and internal entries
**When** the requester calls **every** requester-reachable read path — detail, entry list, list and search projections, any export — and then requests an internal entry and an internal attachment by direct identifier
**Then** no internal entry text or identifier appears in any response body, both direct requests are refused indistinguishably from not-found, and an agent reading the same Incident **does** receive the internal entries.

- Test data: `requester-a`, `agent-l1`, one mixed-entry Incident · Dependencies: running API, real DB · Covers: US-C1-22, US-C1-23 (`T-C1-67`, `T-C1-71`) · `NFR-SEC-04`
- Why API-E2E and why an enumeration: the requirement is "any channel". The agent leg is the negative control that proves the assertion measures visibility rather than an empty fixture. A newly added requester-facing route with no filtering must fail this scenario.

#### AT-C1-63 — An entry type cannot be changed after creation — P1 — type: Unit — impl: `backend-engineer` — **blocked: F27**

**Given** an existing entry
**When** any code attempts to change its visibility
**Then** no such operation exists on the aggregate and the attempt does not compile; a correction adds a new entry referencing the original, which remains intact.

- Test data: one entry · Dependencies: none · Covers: US-C1-22 (`T-C1-68`) · Blocked on: whether reclassification is permitted at all (**F27**)
- Internal made public is a disclosure; public made internal is a retraction of something already seen. The recommended immutable rule is built; the decision is the Product Owner call.

### US-C1-23 · The requester reads and adds public comments

#### AT-C1-64 — The requester thread renders exactly what the API returned — P1 — type: Unit (component) — impl: `frontend-engineer`

**Given** an API response containing only public entries, and a crafted response containing an internal one
**When** the thread component renders each
**Then** the rendered entries equal the response exactly in both cases — the client applies **no** visibility filter of its own, so a server-side leak would surface rather than be masked.

- Test data: two response fixtures · Dependencies: none — `jest-preset-angular` · Covers: US-C1-23 (`T-C1-70`)
- Why Unit and why the crafted case: client-side filtering would hide the very bug `AT-C1-62` exists to catch.

#### AT-C1-65 — The thread is usable and accessible from a venue — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** the requester thread at a 360px viewport with a keyboard only
**When** the requester reads the conversation and posts a comment
**Then** no horizontal scrolling is required, every control is operable by touch and keyboard, the new entry is announced, and contrast, focus visibility, target size and reading order pass WCAG 2.1 AA.

- Test data: an Incident with several public entries · Dependencies: running API and web · Covers: US-C1-23 (`T-C1-70`) · `NFR-USE-04`

### US-C1-24 · Reassignment preserving full assignment history

#### AT-C1-66 — Assignment history is append-only and fully reconstructable — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident reassigned three times
**When** the history is read, and when any operation attempts to edit or remove a past assignment
**Then** four entries exist in order, each with target, actor and timestamp, none overwritten, no edit or removal operation exists on the aggregate, and the current assignee is derived from the latest entry rather than stored twice.

- Test data: one Incident, three reassignments · Dependencies: real DB · Covers: US-C1-24 (`T-C1-72`)
- This history is also the input to FCR (`AT-C1-85`), which is why append-only matters beyond audit.

#### AT-C1-67 — Reassignment publishes its event and references groups it does not own — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an assigned Incident, a valid Resolver Group reference and one that does not resolve
**When** each reassignment is attempted
**Then** the first changes the assignee, appends history and publishes exactly one `IncidentAssigned` event after commit; the second is refused with a typed error and appends nothing; and no `scope:incident` project depends on `scope:identity-access`.

- Test data: `agent-l1`, two group references, a test subscriber · Dependencies: running API, real DB, `pnpm nx graph` · Covers: US-C1-24 (`T-C1-73`)

### US-C1-25 · Manual functional escalation to a higher support tier

#### AT-C1-68 — A functional escalation is distinguishable from an ordinary reassignment — P0 — type: Unit — impl: `backend-engineer`

**Given** a functional escalation and a plain reassignment to the same Resolver Group
**When** both are recorded
**Then** they produce different event kinds and the history entry marks the escalation, so reporting can separate them **without inspecting the reason text**; the escalation records actor, reason and timestamp.

- Test data: two operations on one Incident · Dependencies: none · Covers: US-C1-25 (`T-C1-75`)

#### AT-C1-69 — Escalation is permissioned, and escalated Incidents stand out in the work list — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** a work list containing escalated and ordinary Incidents, and `agent-l1-no-flag` lacking the escalation permission
**When** the list renders and an escalation is attempted without a reason and by the unpermitted actor
**Then** escalated rows are identifiable without relying on color with the state in the accessible name, functional and hierarchical escalations are distinguishable, the missing-reason refusal is surfaced, and the unpermitted attempt is denied with `403`.

- Test data: a mixed work list, two actors · Dependencies: running API and web · Covers: US-C1-25 (`T-C1-75`, `T-C1-76`)

### US-C1-26 · Hierarchical escalation, and automatic escalation on SLA thresholds

#### AT-C1-70 — Hierarchical escalation targets management and refuses when there is none — P1 — type: Unit — impl: `backend-engineer`

**Given** an Incident with a resolvable management contact and one without
**When** hierarchical escalation is attempted for each
**Then** the first targets the management contact rather than a support tier and carries the hierarchical kind; the second is refused with a typed error naming the reason rather than silently escalating to nobody.

- Test data: two contact-resolution fixtures · Dependencies: none · Covers: US-C1-26 (`T-C1-77`)

#### AT-C1-71 — A threshold-driven escalation is a system-actor action, never a person — P0 — type: Unit — impl: `backend-engineer`

**Given** an SLA warning event and a manual escalation on the same Incident
**When** both are recorded
**Then** the automatic one carries the **system rule** actor per `FR-AUD-02` and the manual one a person, the triggering threshold is recorded on the automatic escalation, and reporting distinguishes them without inspecting free text.

- Test data: one threshold event, one manual escalation · Dependencies: none · Covers: US-C1-26 (`T-C1-78`)
- Raising the threshold event is `FR-SLA-07` / `FR-WFL-05` and is **not** asserted here; this scenario begins at the event arriving.

#### AT-C1-72 — A retrying dispatcher cannot spam management — P0 — type: Integration — impl: `backend-engineer`

**Given** the same threshold event delivered three times, and then a different threshold
**When** each is handled
**Then** exactly one escalation exists for the repeated threshold with the second and third recorded as ignored duplicates rather than silently dropped, and the different threshold produces a second escalation.

- Test data: four event deliveries · Dependencies: real DB · Covers: US-C1-26 (`T-C1-78`)
- Why Integration: idempotence keyed by Incident and threshold is a persistence property; an in-memory handler test would pass with no key at all.

### US-C1-27 · Convert a mis-classified record between Incident and Service Request

#### AT-C1-73 — Conversion preserves the reference and the whole history — P0 — type: Integration — impl: `backend-engineer`

**Given** an Incident with entries, assignments and a resolution, in a state with a defined Service Request equivalent
**When** it is converted
**Then** the reference is the original with no new one allocated, every prior entry, assignment and resolution is present and unmodified, and one `TicketTypeConverted` event carries source type, target type, actor and reason.

- Test data: one fully populated Incident · Dependencies: real DB · Covers: US-C1-27 (`T-C1-93`, `T-C1-94`) · `NFR-DAT-01`, `NFR-AUD-02`

#### AT-C1-74 — No half-converted record can exist — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident in a state with no defined equivalent, and separately the `C2` side not deployed
**When** conversion is attempted in each case
**Then** the first is refused with a typed error naming the state, the second with a typed error naming the unavailable target type, and in both cases nothing is changed.

- Test data: two conversion attempts, a refusing target stub · Dependencies: none · Covers: US-C1-27 (`T-C1-93`, `T-C1-94`)
- **`FR-INC-14` is not satisfied by this epic.** The Service Request side is `C2`; the two must ship together, and that must be reported at the epic review.

### US-C1-28 · Scope-rule enforcement at intake

#### AT-C1-75 — A scope-matched submission is decided before any record exists — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a description matching a rule configured to reject, and one matching a rule configured to flag
**When** each is submitted
**Then** the reject case creates **no Incident** and returns a refusal naming the offered path, and the flag case creates an Incident carrying the scope flag and the matched category so the false-positive rate is measurable.

- Test data: two descriptions, two rule configurations · Dependencies: running API, real DB · Covers: US-C1-28 (`T-C1-87`) · Blocked assumption: **F25**

#### AT-C1-76 — The decision is deterministic and the rules are data — P1 — type: Unit — impl: `backend-engineer` — **blocked: F25**

**Given** the same submission and configuration
**When** it is evaluated repeatedly, and when the `incident` libraries are searched
**Then** the outcome is identical every time — not heuristic-dependent — and no detection pattern is hardcoded; every pattern is persisted configuration.

- Test data: one submission, repeated evaluation · Dependencies: none · Covers: US-C1-28 (`T-C1-86`) · Blocked on: whether the rules are configuration and whether reject-versus-flag is configured (**F25**)

#### AT-C1-77 — The redirect is plain-language, actionable and recorded — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** a Tournament Organizer describing a reschedule request
**When** the intake form evaluates the description before submission
**Then** the explanation states in plain language what happened and what to do next with no untranslated ITSM vocabulary, the offered Knowledge Article or Service Catalog item is actionable, the message is announced, the typed description survives following the path and returning, and the redirection is recorded.

- Test data: `organizer-x`, a reschedule description, a configured offered path · Dependencies: running API and web · Covers: US-C1-28 (`T-C1-87`, `T-C1-88`) · `NFR-USE-01`, `NFR-USE-05`, risk **R1**

### US-C1-29 · Knowledge Article suggestions at intake

#### AT-C1-78 — A degraded knowledge service never blocks logging — P0 — type: Unit — impl: `backend-engineer`

**Given** the knowledge port with the service available, unavailable, timing out, and returning nothing
**When** suggestions are requested in each case
**Then** the last three are indistinguishable to the caller — an empty result, no error propagated to intake — and with the null adapter selected an Incident is logged with no suggestion request attempted.

- Test data: four port stubs · Dependencies: none · Covers: US-C1-29 (`T-C1-89`) · `NFR-AVL-03`
- Search, ranking and relevance are `C9` acceptance and are deliberately not asserted here.

#### AT-C1-79 — Suggestions are non-blocking, navigable and announced — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** a requester typing a description and choosing a category, with suggestions slow, failing and empty in turn
**When** the form renders and the requester submits
**Then** submission is never gated on the suggestion request, no error blocks the flow, returned suggestions are keyboard-navigable with the count announced, and opening a suggestion and returning preserves every entered value.

- Test data: three suggestion-service states · Dependencies: running API and web · Covers: US-C1-29 (`T-C1-90`)

### US-C1-30 · Record deflection when a suggestion ends the submission

#### AT-C1-80 — Deflection is recorded where no Incident exists, and not where one does — P1 — type: Integration — impl: `backend-engineer`

**Given** a requester who opened a suggestion and abandoned, and one who viewed suggestions and submitted
**When** each is processed
**Then** the first produces exactly one deflection record with article, category and timestamp and **no Incident**, the second produces no deflection record and an Incident marked as having been shown suggestions, and the deflection table has no non-nullable reference to an Incident.

- Test data: two intake sessions · Dependencies: real DB, `FixedClock` · Covers: US-C1-30 (`T-C1-91`)

#### AT-C1-81 — A deflection carries no more personal data than support needs, and is written once — P1 — type: Unit — impl: `frontend-engineer`

**Given** a requester who opens a suggestion, leaves, returns and leaves again in one session
**When** abandonment detection runs
**Then** exactly one deflection signal is sent for the session and article, and its payload contains the article reference and the category and nothing further identifying the requester.

- Test data: one simulated session · Dependencies: none — `jest-preset-angular` · Covers: US-C1-30 (`T-C1-92`) · `NFR-SEC-07`

### US-C1-31 · Duplicate and related Incident detection

#### AT-C1-82 — Detection requires both attributes and respects the window — P1 — type: Integration — impl: `backend-engineer`

**Given** two Incidents sharing affected service and competition subject inside the window, two matching on only one attribute, and one matching but outside the window
**When** detection runs
**Then** only the first pair is proposed, and the window boundary is asserted at, just inside and just outside on `FixedClock`.

- Test data: five Incidents, one window configuration · Dependencies: real DB, `FixedClock` · Covers: US-C1-31 (`T-C1-96`)

#### AT-C1-83 — No link is ever created without an agent decision — P0 — type: Unit — impl: `backend-engineer`

**Given** a completed detection run
**When** the links are inspected, and when the callers of link creation are enumerated
**Then** no link exists, and no code path reaches link creation without passing through an agent accept — accepting one creates the duplicate link through the same use case as a manual link.

- Test data: one detection run · Dependencies: none · Covers: US-C1-31 (`T-C1-97`)
- Why this is P0 despite being a Phase 3 story: an automatic link is a system-made judgement about which report is real, and the story rules it out.

#### AT-C1-84 — A dismissed pair does not keep reappearing — P1 — type: Integration — impl: `backend-engineer`

**Given** a proposal an agent dismissed
**When** detection runs again for the same pair
**Then** the pair is not proposed, and the dismissal is readable with its actor and timestamp so proposal precision is measurable.

- Test data: one dismissed pair · Dependencies: real DB · Covers: US-C1-31 (`T-C1-97`)

### US-C1-32 · First Contact Resolution is recorded automatically

#### AT-C1-85 — Reassignment and a non-L1 resolver both disqualify, with the reason derivable — P0 — type: Unit — impl: `backend-engineer`

**Given** an Incident reassigned at least once, and one resolved by a tier other than L1
**When** FCR is derived for each
**Then** neither qualifies, and the reason names the reassignment and the resolving tier respectively, derivable from the assignment history.

- Test data: two Incidents with distinct histories · Dependencies: none · Covers: US-C1-32 (`T-C1-79`)
- These are the two **unambiguous** conditions; they are testable today.

#### AT-C1-86 — FCR is never settable by an agent — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the live route table
**When** every route is called with an FCR value in the body
**Then** none accepts it, and the enumeration fails if a route accepting it is added later.

- Test data: crafted bodies per route · Dependencies: running API · Covers: US-C1-32 (`T-C1-80`)
- Why an enumeration: the whole point of `FR-INC-18` is that the metric cannot be inflated by an agent ticking a box.

#### AT-C1-87 — The interaction boundary is undefined, and the reopen cycle cannot inflate the metric — P0 — type: Unit — impl: `backend-engineer` — **blocked: F28**

**Given** an Incident with no reassignment resolved by L1, and one that qualified, was reopened and was resolved again
**When** FCR is derived for each
**Then** the first consults the single interaction-boundary predicate and, while **F28** is unresolved, returns the explicit **undefined** outcome — never a default true; and the second follows the documented reopen rule, asserted explicitly so a reopen-and-reclose cycle cannot produce a qualification it did not earn.

- Test data: two Incidents · Dependencies: none · Covers: US-C1-32 (`T-C1-79`, `T-C1-80`) · Blocked on: what ends "the first interaction" (**F28**)

---

## Coverage summary

| Type | Count | Priority split | Impl owner |
| --- | --: | --- | --- |
| Unit | 39 | P0:31 P1:8 | `backend-engineer` — 37 · `frontend-engineer` — 2 (`AT-C1-64`, `AT-C1-81`) |
| Integration | 18 | P0:11 P1:7 | `backend-engineer` |
| API-E2E | 20 | P0:17 P1:3 | `apps/api-e2e` — e2e-harness work, backend platform, `type:e2e` |
| E2E | 10 | P0:0 P1:10 | `apps/web-e2e` — e2e-harness work, frontend platform, `type:e2e` |
| **Total** | **87** | **P0:59 P1:28** | |

`AT-C1-49` is counted once, under Unit, although it has an Integration half: the boundary assertion is a lint and graph check and the degradation assertion needs a running API.

**Blocked:** 6 scenarios — `AT-C1-28` and `AT-C1-38` (**F30**), `AT-C1-31` (**F24**), `AT-C1-63` (**F27**), `AT-C1-76` (**F25**), `AT-C1-87` (**F28**). **Runnable acceptance today: 81 scenarios.** Two more run but must be read with a caveat: `AT-C1-75` and `AT-C1-77` rest on the **F25** assumption, and `AT-C1-74` passes on the Incident side while `FR-INC-14` stays unsatisfied without `C2`.

No scenario is unwritable. That differs from `C10`, where `AT-C10-54` could not be specified at all: every open decision in `C1` constrains an *outcome* the scenario can still name, rather than a destination nobody has chosen.

Component-level Jest tests for the Angular pieces (`T-C1-09`, `T-C1-10`, `T-C1-12`, `T-C1-13`, `T-C1-16`, `T-C1-19`, `T-C1-23`, `T-C1-24`, `T-C1-28`, `T-C1-31`, `T-C1-35`, `T-C1-38`, `T-C1-48`, `T-C1-52`, `T-C1-56`, `T-C1-62`, `T-C1-69`, `T-C1-74`, `T-C1-76`, `T-C1-85`, `T-C1-88`, `T-C1-90`, `T-C1-95`, `T-C1-98`) are specified inside those tickets and owned by `frontend-engineer`; they are not repeated here, because a component test is a ticket-completion check rather than an epic acceptance scenario.

## Coverage by requirement

| Requirement | Stories | Scenarios | Runnable today |
|---|---|---|---|
| `FR-INC-01` | US-C1-01, 02, 03, 04 | AT-C1-01 → 11 | ✅ 11 |
| `FR-INC-02` | US-C1-05 | AT-C1-12 → 14 | ✅ 3 |
| `FR-INC-03` | US-C1-06, 07 | AT-C1-15 → 19 | ✅ 5 |
| `FR-INC-04` | US-C1-08, 09, 10 | AT-C1-20 → 28 | ⚠ 8 of 9 — `AT-C1-28` blocked by **F30** |
| `FR-INC-05` | US-C1-11, 12, 13, 14 | AT-C1-29 → 40 | ⚠ 10 of 12 — `AT-C1-31` (**F24**), `AT-C1-38` (**F30**) |
| `FR-INC-06` | US-C1-15 | AT-C1-41 → 43 | ✅ 3 |
| `FR-INC-07` | US-C1-16 | AT-C1-44 → 46 | ✅ 3 |
| `FR-INC-08` | US-C1-17 | AT-C1-47 → 49 | ✅ 3, Incident side only — the clock arithmetic is `C7` |
| `FR-INC-09` | US-C1-18, 19 | AT-C1-50 → 54 | ✅ 5 |
| `FR-INC-10` | US-C1-20, 21 | AT-C1-55 → 59 | ✅ 5, Incident side only — targets are `C13`, `C3`, `C4`, `C5`, `C6` |
| `FR-INC-11` | US-C1-22, 23 | AT-C1-60 → 65 | ⚠ 5 of 6 — `AT-C1-63` blocked by **F27** |
| `FR-INC-12` | US-C1-24 | AT-C1-66 → 67 | ✅ 2 |
| `FR-INC-13` | US-C1-25, 26 | AT-C1-68 → 72 | ✅ 5, escalation action only — the threshold event is `C7` / `C12` |
| `FR-INC-14` | US-C1-27 | AT-C1-73 → 74 | ⚠ 2 runnable, but the requirement is **unsatisfiable without `C2`** |
| `FR-INC-15` | US-C1-28 | AT-C1-75 → 77 | ⚠ 2 of 3 — `AT-C1-76` blocked by **F25**; all three rest on the F25 assumption |
| `FR-INC-16` | US-C1-29, 30 | AT-C1-78 → 81 | ✅ 4, recording only — measurement is `C17` / `C9` |
| `FR-INC-17` | US-C1-31 | AT-C1-82 → 84 | ✅ 3 |
| `FR-INC-18` | US-C1-32 | AT-C1-85 → 87 | ⚠ 2 of 3 — **not testable to a definition** until **F28** is settled |

## Risk-based notes

**Where the depth is spent.** `FR-INC-05` carries twelve scenarios, four of them on `US-C1-12` alone, because it is the one requirement in this epic whose failure is silent and the one the epic map singles out as domain-differentiating. `AT-C1-33` is a **static caller enumeration**, not an example: it is the only assertion that keeps holding as later epics add automation, and it should be treated as a permanent gate rather than as `C1` acceptance that can be retired. `AT-C1-34` and `AT-C1-62` are enumerations for the same reason — one over the write surface, one over the read surface.

**Where depth was deliberately not spent.** Nothing in this plan asserts SLA arithmetic, notification delivery, audit persistence, knowledge relevance, Resolver Group membership or any Major Incident behavior. Each of those is another epic acceptance, and a shallow scenario over a stub here would prove the stub and then rot when the real context lands — the same reasoning `C10` recorded for `FR-IAM-03` in its finding **F15**, which `AT-C1-51` now discharges from the Incident side.

**Determinism.** Every time-dependent scenario — the confirmation window, auto-close, clock pause and resume, the duplicate-detection window, flag timestamps — runs on `FixedClock` (`T-C10-09`, ADR-009). **No scenario in this plan sleeps, and none asserts against wall-clock time.**

**Regression posture.** All 32 stories are greenfield, so **no mandatory regression scenario applies** — there is no ⚫ Broken requirement whose old behavior must be proven gone. The nearest equivalents are the three enumeration scenarios: once `AT-C1-33`, `AT-C1-34` and `AT-C1-62` pass, any later change that opens a second flag-write path, accepts the flag on a new route, or leaks an internal note through a new read path fails immediately.

**Accessibility and language.** WCAG 2.1 AA and plain-language obligations are asserted per surface (`AT-C1-03`, `AT-C1-25`, `AT-C1-43`, `AT-C1-52`, `AT-C1-65`, `AT-C1-69`, `AT-C1-77`, `AT-C1-79`) rather than once globally, because they are properties of each screen. The platform a11y baseline itself belongs to the `NFR` epic.

## Open decisions this plan cannot resolve

| Finding | Decision needed | Owner | Blocks |
|---|---|---|---|
| **F6** | Settle the Phase 0/1 cut inside `C1`. PRD §14.2 places `FR-INC-01/02/03` in Phase 0; §14.3 places `FR-INC-01 → 13, 18` in the Phase 1 MVP. The lists overlap and neither states the boundary. | Product Owner | Sequencing of blocks A, B and C — 25 tickets · 66.5h. Nothing is unbuildable; the risk is building the Phase 0 slice twice. |
| **F24** | Decide the ceiling behavior when the flag is set on an Incident already at maximum Impact: clamp and record, or refuse the flag. A silent no-op is forbidden either way. | Product Owner | `T-C1-41` · `AT-C1-31` |
| **F25** | Confirm that the scope-detection rules are configuration data, and decide whether detection rejects or flags — `FR-INC-15` says "reject **or** flag" and names no location for the patterns. | Product Owner | `T-C1-86`, `T-C1-87` · `AT-C1-76`, and the assumption under `AT-C1-75` and `AT-C1-77` |
| **F27** | Decide whether an entry visibility can be changed after creation. Internal made public is a disclosure; public made internal is a retraction. Recommended: immutable, correction by a new entry. | Product Owner | `T-C1-68` · `AT-C1-63` |
| **F28** | Define "the first interaction" for FCR. Until it is defined, `FR-INC-18` has **no testable definition** and must not be reported as delivered. | Product Owner | `T-C1-79`, `T-C1-80` · `AT-C1-87`, and the completeness of `AT-C1-85` |
| **F29** | Confirm whether a requester may set the **structured** competition subject. This backlog reads `FR-INC-01` as free text for requesters, structured for agents. | Product Owner | `T-C1-10`, `T-C1-14`, `T-C1-16` · the form and permission halves of `AT-C1-03`, `AT-C1-06` and `AT-C1-08` |
| **F30** | Decide whether a Priority override or the flag-driven re-derivation wins. The stories assume the override stands until explicitly returned; **two reasonable implementations produce different P1 counts**. | Product Owner | `T-C1-32`, `T-C1-34`, `T-C1-47` · `AT-C1-28`, `AT-C1-38` |

**Sequencing risks, not blockers.** **F23** — the mitigation of risk R1 (`FR-INC-15`, block L) is unphased while the intake it protects is Phase 1; if it lands after intake, R1 has already materialized. **F26** — `FR-INC-16` deflection recording is being phased apart from `FR-KNW-06` deflection measurement. Both are recorded in [`tickets/README.md`](tickets/README.md) and both are Product Owner sequencing calls.

**Cross-epic completeness.** Two requirements cannot be closed by `C1` alone regardless of any decision above: **`FR-INC-14`** needs the `C2` Service Request side (`US-C1-27` says the two must ship together), and **`FR-INC-08`** is only half-proved here because the clock arithmetic is `C7`. Both must be reported as partial at the epic review rather than quietly closed.
