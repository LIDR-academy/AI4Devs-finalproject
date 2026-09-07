# User Stories — C18 · Audit Trail & Activity History

> Source: `docs/backlog/epic-map.md` (generated 2026-09-06, HEAD `815672f`; repository HEAD at drill time `57b3837`, epic map unchanged since the stamp) · PRD §7.17, §4 · `CLAUDE.md` §3 · `docs/product/ARCHITECTURE.md` §4.3, §5, ADR-008
> Scope: 6 requirements remaining · 12 stories · greenfield 12 · gap 0 · defect 0
> Requirements skipped as already built: none — every `FR-AUD-*` is 🔴 Not built, so the epic map's build-state invariant (`remaining == total`) holds.
> `ReadTheCode()` was a no-op: no requirement is 🟡 / ⚫ / 🔍 and the workspace contains no `package.json`, no `apps/` and no `libs/`. No story carries a **Today:** line — that field belongs exclusively to gap and defect stories.

### Scope boundary — C18 delivers the consumer, not the emitters

`ARCHITECTURE.md` §4.3 and ADR-008 make audit a **Published Language over domain events**: a context never calls audit, it publishes an event and audit subscribes post-commit. Consequently:

- **In scope (C18):** the four `audit` libraries (`domain`, `application`, `infrastructure`, `ui` — no `feature` and no `data-access`, per `ARCHITECTURE.md` §5.1), the append-only `AuditEntry` aggregate, the subscriber, the query use case and the embeddable activity-history component.
- **Out of scope (each emitting epic):** publishing the domain events themselves. The cost of `C1`, `C2`, `C7`, `C15`, `C16`, `C12`, `C6`, `C4`, `C5` and `C10` emitting their own events belongs to **those** epics and is not written here. `FR-AUD-01`'s "every record type" is therefore only fully verifiable once each emitter ships — see finding **F18**.
- **Not this epic at all:** `NFR-AUD-01` → `NFR-AUD-04` in PRD §8.4 are near-identically named but belong to the `NFR` epic. They are cited below **as constraints** on acceptance criteria; **no story traces to them**.

### Phase boundary (finding **F6**) and C10 co-delivery (finding **F5**)

| Stories | Phase per PRD §14 | Needs `C10` before it can start? |
| --- | --- | --- |
| `US-C18-01` → `US-C18-03`, `US-C18-06` → `US-C18-08`, `US-C18-12` | Phase 0 (`US-C18-12` unphased, see **F9**) | **No.** They need only the append-only aggregate, its port and the subscriber. They are the parallel track that can start on day one alongside `C10`. |
| `US-C18-04`, `US-C18-05`, `US-C18-09`, `US-C18-10` | Phase 0 | **Yes.** Actor identity, roles and requester identity come from `C10`. |
| `US-C18-11` | **Phase 1** (§14.3), not Phase 0 (§14.2) | **Yes.** Its subject includes role assignment (`FR-IAM-05`). |

---

## US-C18-01 · Every published domain event becomes an audit entry

- **Shape:** greenfield
- **Traces to:** `FR-AUD-01` · Service Owner / Service Manager · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** Service Owner / Service Manager **I want** the audit context to record an entry for every domain event published by any context **so that** the history of a record is complete without any context having to remember to call audit.

### Acceptance criteria

**Given** a context that publishes a domain event after committing its aggregate
**When** the in-process dispatcher delivers that event
**Then** the audit subscriber appends exactly one `AuditEntry` derived from it, and the publishing context makes no call to audit and holds no reference to it.

**Given** the audit subscriber
**When** it is inspected
**Then** it depends only on the `DomainEvent` base type from `libs/shared/domain` and on the audit context's own ports, with no import of any other context's domain library — the subscriber is generic over events, not a switch over known contexts.

**Given** the same domain event delivered twice by the dispatcher's retry
**When** the subscriber handles it
**Then** exactly one entry exists for that event identifier — appending is idempotent on the event identity, so retry cannot duplicate history.

**Given** a domain event the subscriber cannot map to an entry
**When** it is delivered
**Then** the failure is logged through pino with the event identifier and correlation identifier, and it is surfaced per `US-C18-03` rather than silently dropped.

---

## US-C18-02 · The seven auditable action families are covered

- **Shape:** greenfield
- **Traces to:** `FR-AUD-01` · Service Owner / Service Manager · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** Service Owner / Service Manager **I want** the audit model to cover the seven action families named in `FR-AUD-01` **so that** "complete history" is a checkable list rather than a good intention.

### Acceptance criteria

**Given** the audit domain library
**When** the auditable action taxonomy is inspected
**Then** it names, as stable identifiers with translatable labels, at least: state transition, field change, assignment, comment, approval, notification dispatch and automated rule execution.

**Given** an event carrying an action outside the taxonomy
**When** it reaches the subscriber
**Then** the entry is still appended with the action recorded verbatim, and the unknown action is logged — an unrecognized action is never a reason to lose history.

**Given** the taxonomy
**When** an emitting epic adds a new action family
**Then** it extends the taxonomy without any change to the subscriber, the aggregate or the query use case.

**Given** an audit entry
**When** its action is rendered
**Then** the label resolves through `nestjs-i18n` / Transloco; no user-facing action name is hardcoded.

---

## US-C18-03 · Audit dispatch is post-commit and cannot fail the originating operation

- **Shape:** greenfield
- **Traces to:** `FR-AUD-01` · System Administrator · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** System Administrator **I want** audit writes to happen after the originating transaction commits, with retry and a visible failure path **so that** a failing audit write never rolls back a logged Incident, and a lost entry never passes unnoticed.

### Acceptance criteria

**Given** a use case that mutates an aggregate and publishes an event
**When** the audit write fails
**Then** the aggregate change stays committed (ADR-008, constraint `NFR-AVL-03`), and the failure does not propagate to the caller.

**Given** a failed audit write
**When** the dispatcher retries
**Then** it retries with a bounded policy against the same database, and a subsequent success produces exactly one entry per `US-C18-01`.

**Given** an audit write that fails permanently after the retry budget is exhausted
**When** the budget runs out
**Then** the event is preserved in a dead-letter store with its payload and failure reason, and the condition is exposed as an operational signal — because a permanently lost entry contradicts the reconstructability constraint `NFR-AUD-01` and must never be discarded silently.

**Given** the dispatcher
**When** it is configured
**Then** the retry budget is read through `ConfigService` from validated configuration, with no raw `process.env` access.

---

## US-C18-04 · An audit entry captures the six mandatory attributes

- **Shape:** greenfield
- **Traces to:** `FR-AUD-02` · Service Owner / Service Manager · epic `C18`
- **Phase:** 0 · **needs `C10`** for actor identity

**As a** Service Owner / Service Manager **I want** every audit entry to carry actor, timestamp, record reference, action, previous value and new value **so that** any record can be reconstructed: what happened, when, by whom and in what order.

### Acceptance criteria

**Given** the `AuditEntry` aggregate
**When** it is constructed
**Then** it requires all six attributes of `FR-AUD-02` and refuses construction with a typed domain error if any is absent, so an incomplete entry cannot exist in the model.

**Given** an entry for an action that creates a record
**When** it is appended
**Then** the previous value is an explicit "none" marker rather than an empty string or `null` ambiguity, and the same holds symmetrically for deletion-shaped actions.

**Given** an entry
**When** its timestamp is set
**Then** it comes from `ClockPort` (ADR-009) as a UTC instant; domain and application code never call `new Date()`.

**Given** two entries for the same record with the same timestamp
**When** the history is read back
**Then** their relative order is deterministic through a monotonic sequence on the record reference, because `NFR-AUD-01` requires "in what order" and equal timestamps must not scramble it.

**Given** the record reference
**When** it is modelled
**Then** it identifies both ticket-shaped records and configuration objects (as required by `US-C18-11`) through a context identifier plus an aggregate identifier, so audit needs no foreign key into any context's tables.

---

## US-C18-05 · Automated actions are attributed to the rule, not to a person

- **Shape:** greenfield
- **Traces to:** `FR-AUD-02` · Service Desk Agent (L1) · epic `C18`
- **Phase:** 0 · **needs `C10`** for user actor identity

**As a** Service Desk Agent (L1) **I want** automatic changes to be attributed to the system rule that made them **so that** I am not shown as the author of an escalation or a reassignment I did not perform.

### Acceptance criteria

**Given** the actor attribute
**When** it is modelled
**Then** it is a discriminated type with exactly two kinds — a user actor carrying the user identity from `identity-access`, and a system actor carrying the rule identifier — and never a free-text name.

**Given** an automated rule execution
**When** its entry is appended
**Then** the actor is the system actor for that rule, and the entry is distinguishable from a human action without parsing any text.

**Given** an action a user initiated that a rule then completed
**When** both entries are appended
**Then** they are two separate entries with their own actors, never one merged entry.

**Given** a system actor
**When** the activity history renders it
**Then** it is presented as an automated action with the rule identified, in the viewer's language through Transloco, and never as an anonymous or blank author.

---

## US-C18-06 · No mutation path to audit exists for any role

- **Shape:** greenfield
- **Traces to:** `FR-AUD-03` · System Administrator · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** System Administrator **I want** immutability to be a structural property rather than a permission setting **so that** nobody — including me — can edit or delete history, and the guarantee cannot be undone by a configuration mistake.

### Acceptance criteria

**Given** the `AuditRepositoryPort` in the audit domain library
**When** its interface is inspected
**Then** it declares an append operation and read operations only: **no** update method and **no** delete method exist to call. Immutability is by absence of capability, not by convention (`ARCHITECTURE.md` §4.3, `NFR-AUD-02`).

**Given** an authenticated System Administrator
**When** they attempt to modify or delete an audit entry through any exposed API route
**Then** no such route exists and the attempt is rejected; the role catalog of `FR-IAM-02` grants no permission over audit entries to any role, System Administrator included.

**Given** the `AuditEntry` aggregate
**When** it is inspected
**Then** its attributes are readonly after construction and it exposes no state-changing method, so an entry cannot be altered in memory before or after persistence.

**Given** any context other than `audit`
**When** its dependency graph is checked by `@nx/enforce-module-boundaries`
**Then** it has no dependency on the audit context at all — no context is handed a reference through which audit could be mutated, and the boundary check fails the build if one is introduced.

**Given** the persisted audit table
**When** the baseline migration is inspected
**Then** the application's database role holds `INSERT` and `SELECT` on it and no `UPDATE` or `DELETE`, so the guarantee survives a defect in the application layer.

---

## US-C18-07 · Corrections are recorded as new entries

- **Shape:** greenfield
- **Traces to:** `FR-AUD-03` · Service Desk Agent (L1) · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** Service Desk Agent (L1) **I want** a correction to appear as an additional entry rather than as a rewrite **so that** fixing my own mistake leaves an honest trail instead of hiding it.

### Acceptance criteria

**Given** a field an agent set incorrectly and then corrected
**When** the activity history is read
**Then** it contains both entries in order — the original change and the correction, each with its own previous and new value — and the original is unchanged (`NFR-AUD-02`).

**Given** a correction entry
**When** it is appended
**Then** it may reference the entry it corrects, and that reference is carried on the **new** entry; the corrected entry is never touched.

**Given** a record whose source aggregate is later deleted or archived by its own context
**When** its activity history is queried
**Then** the audit entries remain readable and complete, because audit holds a record reference rather than a foreign key with cascade behavior.

---

## US-C18-08 · Activity history as a reusable component embedded in host views

- **Shape:** greenfield
- **Traces to:** `FR-AUD-04` · Service Desk Agent (L1) · epic `C18`
- **Phase:** 0 · can start before `C10`

**As a** Service Desk Agent (L1) **I want** the activity history to appear inside the record I am working on **so that** I can see what happened without leaving the ticket, and every context shows that history the same way.

### Acceptance criteria

**Given** the audit context
**When** its libraries are generated
**Then** it has `domain`, `application`, `infrastructure` and `ui` and **no** `feature` and **no** `data-access` library — the activity history is not a screen of its own and has no route (`ARCHITECTURE.md` §5.1).

**Given** the activity-history component in `libs/audit/ui`
**When** it is inspected
**Then** it is state-in / events-out: entries arrive as an input, it injects no service, no store and no `HttpClient`, it is `OnPush`, and its template is hand-written HTML with SCSS design tokens and no third-party component library.

**Given** a host context's `type:feature` library (for example the Incident detail view)
**When** it embeds the component
**Then** the host fetches the entries through its own `data-access` layer and passes them in; the boundary matrix (`ARCHITECTURE.md` §5.3) is satisfied because a `type:feature` may depend on a `type:ui`.

**Given** the rendered history
**When** it is operated with a keyboard and a screen reader
**Then** entries form a semantic, ordered list with accessible names, the ordering is announced, and newly appended entries are announced through the shared `aria-live` announcer, to WCAG 2.1 AA.

**Given** a record with no entries yet, or entries that failed to load
**When** the component renders
**Then** it shows an explicit empty state and an explicit error state respectively — never a blank area and never a silently swallowed error.

---

## US-C18-09 · A requester sees only requester-visible entries

- **Shape:** greenfield
- **Traces to:** `FR-AUD-04` · Player / Competitor · epic `C18`
- **Phase:** 0 · **needs `C10`** for requester identity and roles

**As a** Player / Competitor **I want** to follow what happened on my ticket without seeing the internal working notes **so that** I get transparency on progress without exposure to internal diagnosis.

### Acceptance criteria

**Given** an audit entry
**When** it is appended
**Then** it carries an explicit requester-visible / internal marking supplied by the emitting event, defaulting to **internal** when the event does not state it — the safe default is to withhold, never to expose.

**Given** a requester viewing the activity history of their own ticket
**When** the history is returned
**Then** it contains only requester-visible entries, and internal entries are absent from the payload rather than hidden by the client.

**Given** an agent or analyst viewing the same record
**When** the history is returned
**Then** it contains both requester-visible and internal entries, and each is visually and semantically distinguishable so an agent can tell at a glance what the requester can see.

**Given** a requester viewing a record they did not raise and hold no competition-scoped grant over
**When** they request its activity history
**Then** it is denied by the visibility predicate of `FR-IAM-03`, and the response does not reveal whether the record exists.

---

## US-C18-10 · Activity-history query with server-side visibility filtering

- **Shape:** greenfield
- **Traces to:** `FR-AUD-04` · Application Support Analyst (L2/L3) · epic `C18`
- **Phase:** 0 · **needs `C10`** for roles

**As an** Application Support Analyst (L2/L3) **I want** a single query use case that returns a record's history already filtered for the caller **so that** every context surfaces the same history under the same rules and no filtering depends on the client.

### Acceptance criteria

**Given** the audit application library
**When** it is inspected
**Then** it exposes one query use case taking a record reference and the calling actor, and the visibility decision is made there — never in the `type:ui` component, which cannot inject a service, and never only in the HTTP adapter.

**Given** a caller whose role does not authorize reading that record
**When** the use case executes
**Then** it denies with a typed authorization error mapped to `403`, evaluated through the same domain predicate used by the owning context.

**Given** a record with a long history
**When** the history is queried
**Then** results are returned newest-first with stable pagination that cannot skip or duplicate an entry when new entries are appended between pages.

**Given** the returned entries
**When** they cross the API boundary
**Then** they use a DTO declared in `libs/shared/contracts`, and the internal / requester-visible marking is applied before serialization so an internal entry is never present in a requester's payload.

**Given** the query use case
**When** it is unit-tested
**Then** it runs with a test double of `AuditRepositoryPort` — no database, no HTTP, no framework import in `type:domain` or `type:application`.

---

## US-C18-11 · Administrative configuration changes are audited

- **Shape:** greenfield
- **Traces to:** `FR-AUD-05` · System Administrator · epic `C18`
- **Phase:** **1** (§14.3), not Phase 0 — see finding **F6** · **needs `C10`**

**As a** System Administrator **I want** my configuration changes recorded in the audit trail like any other change **so that** safe, auditable configuration is possible without code changes and without an unaccountable back door.

### Acceptance criteria

**Given** a configuration change to the service catalog, an SLA policy, a workflow state model or a role assignment
**When** it commits
**Then** its context publishes a domain event and the subscriber of `US-C18-01` appends an entry carrying the administrator as actor, the configuration object as record reference, the action, and the previous and new configuration values.

**Given** a configuration audit entry
**When** it is queried
**Then** it is addressable by the configuration object rather than by a ticket, using the generalized record reference of `US-C18-04`, so a policy's own change history can be read.

**Given** a configuration change that alters a value in flight
**When** the entry is read later
**Then** the previous and new values are captured as they were at the time, so `NFR-DAT-03` holds: renaming reference data does not retroactively rewrite what the history says happened.

**Given** a bulk administrative operation
**When** it commits
**Then** every affected object produces its own entry (`NFR-DAT-05`), not one summary entry.

**Given** configuration entries
**When** they are rendered in the activity history
**Then** they are marked internal by default per `US-C18-09` — configuration history is never requester-visible.

---

## US-C18-12 · Configurable audit retention with a floor at the record's own retention

- **Shape:** greenfield
- **Traces to:** `FR-AUD-06` · System Administrator · epic `C18`
- **Phase:** **unphased in §14** — see finding **F9** · can start before `C10`

**As a** System Administrator **I want** audit retention to be configurable but never shorter than the retention of the record it describes **so that** history cannot expire out from under a record that is still operationally accessible.

### Acceptance criteria

**Given** an audit retention period in validated configuration
**When** the application boots
**Then** the value is read through `ConfigService`, and boot fails fast if it is absent, not a positive duration, or shorter than the configured record retention (default 24 months per `NFR-DAT-02`).

**Given** audit entries whose retention period has not elapsed
**When** any retention process runs
**Then** they are retained, and no operation in the system can remove them earlier — expiry is the only path out, and `US-C18-06`'s immutability still forbids editing them while they exist.

**Given** entries for records subject to a longer retention (Change and Release authorization evidence, `NFR-AUD-03`, `NFR-DAT-02`)
**When** the retention floor is evaluated
**Then** the longer of the two periods applies, per record reference rather than globally.

**Given** the retention configuration
**When** an administrator changes it
**Then** the change is itself audited per `US-C18-11`, and shortening it below the floor is refused with a typed error rather than silently clamped.

---

## Findings

Observations raised while writing these stories. **F5**, **F6** and **F9** are carried over from `docs/backlog/epic-map.md`; the rest are new.

| ID | Source | Finding | Effect on this backlog |
| --- | --- | --- | --- |
| **F5** | Epic map (carried) | **`C10` and `C18` are mutually dependent at phase 0.** `FR-IAM-05` requires role assignment to be "fully audited" (needs `C18`); `FR-AUD-02` requires every entry to capture an actor (needs `C10`). `C18` is **not** a successor of `C10` — it is a parallel track inside the same phase-0 increment. | The split is stated in the phase table above. `US-C18-01` → `03`, `06` → `08` and `12` need only the append-only aggregate and can start on day one; `US-C18-04`, `05`, `09`, `10`, `11` need actor identity, roles or requester identity from `C10`. Co-deliver, do not sequence. |
| **F6** | Epic map (carried) | **This epic is not phase-atomic.** PRD §14.2 places `FR-AUD-01` → `04` in Phase 0 while §14.3 places `FR-AUD-05` in Phase 1 (its MVP table reads "Audit FR-AUD-01 → 05", overlapping §14.2 without stating where the cut falls). | Marked, not resolved: every story carries a **Phase** field, and `US-C18-11` is flagged Phase 1. The Product Owner must settle the Phase 0 / Phase 1 cut before these are ticketed, or the Phase 0 stories will be written twice. |
| **F9** | Epic map (carried) | **`FR-AUD-06` (retention) is assigned to no phase in §14.** | `US-C18-12` exists and is traced, but its phase is undecided. Note that it is the one story with a hard dependency on a value the `NFR` epic owns (`NFR-DAT-02`), so phasing it late risks shipping audit with no retention policy at all. |
| **F18** | New | **`FR-AUD-01` cannot be verified inside `C18`.** It demands an entry for "every state transition, field change, assignment, comment, approval, notification and automated rule execution on **every record type**", but under ADR-008 audit only records what contexts publish. `C18` delivers the consumer; the emitters are each epic's cost. | Stories `US-C18-01` and `US-C18-02` are written against the **consumer contract** — generic over events, complete over the action taxonomy — and are testable with synthetic events alone. Per-record-type completeness is a Definition-of-Done item on every emitting epic (`C1`, `C2`, `C7`, `C15`, `C16`, `C12`, `C6`, `C4`, `C5`, `C10`), consistent with the epic map's option (a) in **F10**. It must not be expected of `C18`'s acceptance run. |
| **F19** | New | **Nothing specifies who decides an entry is requester-visible.** `FR-AUD-04` requires the split but never says whether visibility is a property of the action type, of the individual entry, or a choice the emitting context makes (an agent's public reply versus an internal work note). | `US-C18-09` assumes the **emitting event carries the marking, defaulting to internal when absent** — the safe default. This is an assumption made by this backlog and **needs Product Owner confirmation**; if visibility is instead derived per action type, `US-C18-02`'s taxonomy has to carry it and `US-C18-09` changes shape. |
| **F20** | New | **ADR-008 leaves a completeness hole that `NFR-AUD-01` does not tolerate.** The audit write is deliberately outside the originating transaction, so a permanently failed dispatch yields a committed record with missing history — while `NFR-AUD-01` requires every record to be fully reconstructable. ADR-008's stated mitigation is retry plus acceptance assertions, which reduces the probability without closing it. | `US-C18-03` specifies a dead-letter store and an operational signal for exhausted retries so the loss is at least detectable and replayable. Whether that is sufficient, or whether audit must move into the transaction for a subset of records (Change authorization evidence, `NFR-AUD-03`), is an **architecture decision still open** and should be recorded as an ADR before `US-C18-03` is ticketed. |
| **F21** | New | **`FR-AUD-06`'s floor is defined by a value this epic does not own.** "Not shorter than the record's own retention" resolves to `NFR-DAT-02` (24 months default, longer for Change/Release authorization evidence per `NFR-AUD-03`) — both in the `NFR` epic. | `US-C18-12` reads the record retention from configuration and fails fast rather than hardcoding 24 months, so `C18` stays correct whichever value the `NFR` epic settles on. The dependency is real and must be declared when sequencing. |
| **F22** | New | **`NFR-AUD-04` is a reporting query wearing an audit name.** "Produce, for any competition, the complete list of Incidents, Changes and Releases that affected it in a period" reads as audit but is a cross-context read model, which `ARCHITECTURE.md` §4.3 assigns to `reporting` (`C17`), not to `audit`. | No story here traces to it, by rule. Flagged so that a later drill of `C17` or `NFR` picks it up rather than assuming `C18` covered it — the naming makes silent omission likely. |
