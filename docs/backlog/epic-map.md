# Epic Map — Sport ITSM

> **Generated:** 2026-09-06 · **HEAD:** `aa1ea0e` · **PRD last modified:** `uncommitted (working tree)` · **Sources:** `docs/product/PRD.md` §5, §7, §8, §12, §14 · `CLAUDE.md` §3 · `docs/product/ARCHITECTURE.md` §4–§5
>
> Drilling an epic against a stale map produces stale counts. If the PRD has moved since the stamp above, **regenerate by invoking `sport-itsm-product-owner` in Mode 2**.

## Provenance & method deviations (greenfield)

This map was produced by the `epic-mapper` skill with the deviations mandated by the Product Owner agent's Mode 2 section. They are recorded here rather than silently applied.

| Skill step | Status in this run | Reason |
| --- | --- | --- |
| `CaptureStamp()` | Applied, with `prdLastCommit = uncommitted (working tree)` | `docs/product/PRD.md` is not yet tracked by git. A map without provenance is invalid, so the untracked state is stamped explicitly. |
| Read `docs/product/prd.md` | Applied against `docs/product/PRD.md` | Uppercase filename in this repository. |
| Read `docs/product/implementation-baseline.md` | **Not applicable** | The file does not exist; the workspace is greenfield. |
| Read `docs/standards/base-standards.md` §4 | Substituted by `CLAUDE.md` §3 + `docs/product/ARCHITECTURE.md` §4–§5 | This repository's authoritative Nx layer/boundary baseline. |
| `CrossCheckAgainstCode()` | **Skipped** | No implementation exists at `aa1ea0e`: no `package.json`, no `apps/`, no `libs/`. Nothing to spot-check, no baseline to disagree with. |
| PRD **Icon legend** (build states) | **Absent from the PRD — expected, not drift** | Nothing has been built, so no build-state legend is warranted. Every requirement is treated as 🔴 Not built. |
| `SizeEpics()` | Applied in **greenfield** mode | Size = full requirement count **plus** the Nx libraries the epic must create from nothing (`domain` / `application` / `infrastructure` / `contracts` backend, `feature` / `ui` / `data-access` frontend), not a remaining-work delta. |
| `RecommendOrder()` | Applied as an **architectural build sequence** | With everything unbuilt the order is driven by dependency depth, not by remaining-work deltas. |

**Build-state invariant.** `remaining == total requirement count` for every epic, and the 🟡 / ⚫ / 🟢 / 🔍 columns are `0` throughout. Those columns are retained for format stability with later refreshes. If a future refresh shows a requirement in any state other than 🔴 while the workspace is still empty, that is documentation drift and must be reported, never accepted.

## Foundation ownership (priced once)

Greenfield sizing double-counts unless shared scaffolding is assigned to exactly one epic. This map assigns it as follows; every other epic is sized assuming this work already exists.

| Foundation item | Priced in | Note |
| --- | --- | --- |
| Nx workspace bootstrap, pnpm, ESLint 9 flat config with `@nx/enforce-module-boundaries`, Prettier, the three-axis tag scheme | `C10` | `ARCHITECTURE.md` §5.2, §5.5 |
| `apps/api`, `apps/api-e2e`, `apps/web`, `apps/web-e2e` (4 applications) | `C10` | Composition root, shell and both Cypress/Cucumber E2E harnesses |
| `libs/shared/domain` (shared kernel: `Identity`, `TicketReference`, `ImpactLevel`, `UrgencyLevel`, `Priority`, `DomainEvent`, `StateModel`, `DateTimeRange`) | `C10` | `ARCHITECTURE.md` §4.2. The `StateModel` primitive is consumed by `C12`. |
| `libs/shared/contracts`, `libs/shared/util` | `C10` | The only FE↔BE coupling (ADR-007) |
| `libs/shared/ui` — the in-house design system (primitives, design tokens, a11y directives) | `C10` | ADR-010. `C10` ships the first authenticated frontend surface (login, role administration), so the design system must exist there. |
| PostgreSQL base schema + the TypeORM migration chain (`synchronize: false`, migrations only) | `C10` | `CLAUDE.md` §2, §3 |
| Identity, RBAC and least-privilege enforcement itself | `C10` | FR-IAM-01/02/03/05 |

Total target structure across all epics: **~80 libraries + 4 applications** (`ARCHITECTURE.md` §5.1). `C10` alone stands up 4 applications, 4 shared libraries and its own 5 context libraries — which is why it is XL and why it anchors the drill order.

## Summary

| # | Key | PRD | Title | FR | 🔴 | 🟡 | ⚫ | 🟢 | 🔍 | Remaining | Size | Depends on |
| --- | --- | --- | --- | --: | --: | --: | --: | --: | --: | --: | --- | --- |
| 1 | `C10` | §7.10 | Identity & Access Management | 7 | 7 | 0 | 0 | 0 | 0 | **7** | XL | — (anchor) · `C18` (co-phase-0) |
| 2 | `C18` | §7.17 | Audit Trail & Activity History | 6 | 6 | 0 | 0 | 0 | 0 | **6** | M | `C10` |
| 3 | `C12` | §7.12 | Workflow & Automation Engine | 6 | 6 | 0 | 0 | 0 | 0 | **6** | M | `C10`, `C18` |
| 4 | `C14` | §7.13 | Assignment & Queue Management | 5 | 5 | 0 | 0 | 0 | 0 | **5** | M | `C10` |
| 5 | `C7` | §7.7 | SLA Management & Escalation | 10 | 10 | 0 | 0 | 0 | 0 | **10** | L | `C10`, `C12`, `C8`, `C16` |
| 6 | `C1` | §7.1 | Incident Management | 18 | 18 | 0 | 0 | 0 | 0 | **18** | XL | `C10`, `C12`, `C14`, `C7`, `C18`, `C16`, `C9`, `C11` |
| 7 | `C13` | §7.1.1 | Major Incident Management | 6 | 6 | 0 | 0 | 0 | 0 | **6** | M | `C1`, `C16`, `C3`, `C9` |
| 8 | `C8` | §7.8 | Service Catalog Management | 6 | 6 | 0 | 0 | 0 | 0 | **6** | M | `C10`, `C7`, `C15` |
| 9 | `C15` | §7.14 | Approval Engine | 7 | 7 | 0 | 0 | 0 | 0 | **7** | M | `C10`, `C16`, `C18` |
| 10 | `C2` | §7.2 | Service Request Management | 11 | 11 | 0 | 0 | 0 | 0 | **11** | L | `C8`, `C15`, `C7`, `C10`, `C12`, `C14` |
| 11 | `C16` | §7.15 | Notification Framework | 8 | 8 | 0 | 0 | 0 | 0 | **8** | M | `C10`, `C1`, `C2`, `C7`, `C15`, `C13` |
| 12 | `C9` | §7.9 | Knowledge Management & Self-Service Portal | 10 | 10 | 0 | 0 | 0 | 0 | **10** | L | `C10`, `C1`, `C2`, `C3` |
| 13 | `C11` | §7.11 | Omnichannel Intake | 4 | 4 | 0 | 0 | 0 | 0 | **4** | S | `C1`, `C2`, `C10` |
| 14 | `C17` | §7.16 | Reporting, Dashboards & Analytics | 7 | 7 | 0 | 0 | 0 | 0 | **7** | L | `C1`, `C2`, `C7`, `C13`, `C15`, `C4`, `C5`, `C9` |
| 15 | `C6` | §7.6 | Asset & Configuration Management (CMDB) | 8 | 8 | 0 | 0 | 0 | 0 | **8** | L | `C10`, `C18`, `C1` |
| 16 | `C4` | §7.4 | Change Management | 11 | 11 | 0 | 0 | 0 | 0 | **11** | L | `C6`, `C15`, `C5`, `C1`, `C3`, `C12`, `C18` |
| 17 | `C5` | §7.5 | Release & Deployment Management | 8 | 8 | 0 | 0 | 0 | 0 | **8** | L | `C4`, `C6`, `C15`, `C12` |
| 18 | `C3` | §7.3 | Problem Management | 9 | 9 | 0 | 0 | 0 | 0 | **9** | L | `C1`, `C9`, `C4`, `C12` |
| 19 | `NFR` | §8 | Non-Functional Requirements | 38 | 38 | 0 | 0 | 0 | 0 | **38** | XL | all epics |

**Totals:** 19 epics · **185 requirements** (147 functional + 38 non-functional) · **185 remaining**.

> **Count note.** §7 declares 148 `FR-` IDs; **147 are active**. `FR-CHG-07` is explicitly retired in the PRD ("deployment freeze windows are out of scope; see §3.3. ID retained for traceability and not reused") and carries priority `—`, so it is excluded from the `C4` count and from all totals. The ID is preserved and never reused.

### Requirement distribution by MoSCoW (active functional requirements)

| Priority | Count | Share |
| --- | --: | --: |
| **M** — Must (MVP) | 95 | 65% |
| **S** — Should | 33 | 22% |
| **C** — Could | 11 | 7% |
| Compound (two or more priorities on one ID) | 2 | 1% |
| Retired (`FR-CHG-07`) | — | excluded |

The 2 compound-priority requirements (`FR-OMN-01`, `FR-NOT-06`) are counted once in the epic totals and are recorded as **F3** in the findings.

## Suggested drill order

This is an **architectural build sequence**, not a value ranking: with nothing built, dependency depth dominates. It is a recommendation; the Product Owner and the team pick.

1. **`C10` — Identity & Access Management.** The phase-0 anchor. It carries the entire workspace foundation (4 applications, 4 shared libraries, the design system, the base schema and migration chain) plus authentication and RBAC. `FR-IAM-01` ("The system MUST authenticate every user before granting access to any function") is a precondition of every other epic: Sport ITSM has no anonymous surface at all. Prerequisite of **18** epics. PRD §14.2 places it in Phase 0.
2. **`C18` — Audit Trail & Activity History.** `ARCHITECTURE.md` §4.1 places the `audit` context in **phase 0**, alongside `identity-access`. Audit is an append-only consumer of domain events; it must exist before any context begins emitting, otherwise every later epic retrofits event publication. `FR-IAM-05` requires role assignment to be "fully audited", so `C10` and `C18` are genuinely co-phase-0 (see finding **F5**).
3. **`C12` — Workflow & Automation Engine.** Realized as the `StateModel` / transition-rule primitive in `libs/shared/domain` plus per-context configuration (`ARCHITECTURE.md` §4.1 — a central workflow-engine context is explicitly rejected). Every lifecycle in the product instantiates it: `FR-INC-06`, `FR-SRQ-05`, `FR-CHG-04`, `FR-REL-03`, `FR-PRB-03`. Building it after the first lifecycle means rewriting that lifecycle.
4. **`C14` — Assignment & Queue Management.** Resolver Groups live in the `identity-access` context (`ARCHITECTURE.md` §4.1: `identity-access` = C10 **and** C14), so it creates no new libraries and follows `C10` naturally. Incident assignment (`FR-INC-12`), automatic routing (`FR-WFL-03`) and escalation (`FR-INC-13`, `FR-SLA-07`) all target groups that must already exist. PRD §14.2 places Resolver Groups in Phase 0.
5. **`C7` — SLA Management & Escalation.** The conscious **upstream supplier** to both ticket contexts (`ARCHITECTURE.md` §4.3, Customer-Supplier). `FR-SLA-02` requires exactly one applicable SLA policy to be attached to each ticket **at creation** — the policy registry, the support schedule and the timer semantics must exist before the first Incident can be logged correctly. Building `C1` first forces a stub port and a rework of `FR-INC-08` and `FR-SLA-04`.

Remaining sequence, for context: `C1` → `C8` → `C15` → `C2` → `C16` → `C13` → `C9` → `C11` (portal + agent-logged slice only) → `C17` · then Phase 2: `C6` → `C4` → `C5` → `C3` · `NFR` runs continuously as acceptance criteria on every epic above, with its own standalone slice (i18n scaffolding, a11y baseline, health/observability, retention, pseudonymization).

### Reconciliation with the PRD's own phasing (§14)

The suggested order **does not override** the PRD's phase plan; it sequences *within* it. Agreements and divergences:

| Item | PRD §14 | This map | Verdict |
| --- | --- | --- | --- |
| `C10` first | Phase 0 | Position 1 | **Agree** |
| `C18` audit trail | Phase 0 (`FR-AUD-01→04`), Phase 1 (`FR-AUD-05`) | Position 2 | **Agree**, but the epic is not phase-atomic (finding **F6**) |
| Resolver Groups (`C14`) | Phase 0 | Position 4 | **Agree** |
| Core ticket record, reference numbering, categorization taxonomy | Phase 0 | Inside `C1`, position 6 | **Divergence of granularity, not of order** — PRD §14.2 slices `FR-INC-01/02/03` into Phase 0 while the rest of `C1` is Phase 1 MVP. The epic `C1` is therefore **not phase-atomic**; a drill of `C1` must respect that split. Reported as finding **F6**. |
| `C7` SLA before `C1` | Both Phase 1; no intra-phase order stated | `C7` at position 5, `C1` at 6 | **Within-phase sequencing** — the PRD states no order inside Phase 1, so this is a refinement, not a contradiction. |
| `C12` Workflow before the first lifecycle | Phase 1 | Position 3 | **Within-phase sequencing** — justified by `ARCHITECTURE.md` §4.1 dissolving C12 into `shared/domain`. See finding **F8**. |
| `C11` Omnichannel | Portal + agent-logged in Phase 1 (§14.3 Incident row); email + in-app in Phase 3 | Single epic, position 13 | **Straddles two phases** — `FR-OMN-01` carries a compound priority for exactly this reason (finding **F3**). |
| Phase 2 block `C6` → `C4` → `C5` → `C3` | Phase 2, listed as Change, Release, CMDB, Problem | `C6` first, then `C4`, `C5`, `C3` | **Refinement** — `FR-CHG-02` and `FR-CHG-05` require affected CIs and CI criticality, so the CMDB must precede Change. The PRD's listing order is not a dependency claim. |

---

## Epics

### `C10` · Identity & Access Management (PRD §7.10)

- **Requirements:** `FR-IAM-01` 🔴 M · `FR-IAM-02` 🔴 M · `FR-IAM-03` 🔴 M · `FR-IAM-04` 🔴 S · `FR-IAM-05` 🔴 M · `FR-IAM-06` 🔴 S · `FR-IAM-07` 🔴 C
- **What actually remains:** Everything, plus the whole workspace. This epic stands up the Nx monorepo, the module-boundary enforcement, the four applications (`api`, `api-e2e`, `web`, `web-e2e`), the four shared libraries (`contracts`, `domain`, `ui`, `util`), the PostgreSQL base schema and the migration chain, and only then its own five `identity-access` libraries (`domain`, `application`, `infrastructure`, `feature`, `data-access` — no `ui` of its own per `ARCHITECTURE.md` §5.1). Functionally: Passport-JWT authentication with no anonymous surface anywhere (`FR-IAM-01`), persona-aligned RBAC with least privilege (`FR-IAM-02`), requester-scoped record visibility with the competition-scoped exception for Organizer and League Administrator (`FR-IAM-03`), an `IdentityProviderPort` anti-corruption layer for SCMS SSO (`FR-IAM-04`, assumption A2, dependency D1), audited role assignment (`FR-IAM-05`), session inactivity termination and step-up re-authentication (`FR-IAM-06`), and denied-authorization logging for privileged operations (`FR-IAM-07`).
- **Depends on:** `C18` (declared — `FR-IAM-05` requires role assignment to be "fully audited"; mutual, see **F5**)
- **Size:** **XL** — 7 requirements is modest, but this epic carries the entire foundation: 4 applications + 9 libraries created from nothing, the tag scheme, the boundary matrix, the design system and the migration chain. It is the single largest first-delivery in the map and everything else is sized assuming it is done.
- **Findings:** **F5** (mutual reference with `C18`), **F9** (`FR-IAM-04`, `FR-IAM-06`, `FR-IAM-07` are unphased in §14).

### `C18` · Audit Trail & Activity History (PRD §7.17)

- **Requirements:** `FR-AUD-01` 🔴 M · `FR-AUD-02` 🔴 M · `FR-AUD-03` 🔴 M · `FR-AUD-04` 🔴 M · `FR-AUD-05` 🔴 M · `FR-AUD-06` 🔴 S
- **What actually remains:** Everything. Four libraries in the `audit` context (`domain`, `application`, `infrastructure`, `ui` — no `feature`/`data-access` per `ARCHITECTURE.md` §5.1; audit history is surfaced inside other contexts' views). An append-only `AuditEntry` with actor, timestamp, record reference, action, previous value and new value (`FR-AUD-02`), immutable to every role including System Administrator (`FR-AUD-03`), a requester-visible vs. internal split on the activity history view (`FR-AUD-04`), coverage of administrative configuration changes (`FR-AUD-05`) and a configurable retention floor (`FR-AUD-06`). Structurally, `FR-AUD-03`'s immutability is made true by construction: contexts publish domain events and audit subscribes post-commit — no context ever receives a handle to mutate audit (`ARCHITECTURE.md` §4.3, ADR-008).
- **Depends on:** `C10` (declared — `FR-AUD-02` requires actor identity; mutual, see **F5**)
- **Size:** **M** — 6 requirements, 4 new libraries, a deliberately simple append-only aggregate. The real cost is distributed: every other epic must emit its own domain events, and that cost belongs to those epics, not to this one.
- **Findings:** **F5**, **F6** (`FR-AUD-01→04` Phase 0 vs `FR-AUD-05` Phase 1 — not phase-atomic), **F9** (`FR-AUD-06` unphased).

### `C12` · Workflow & Automation Engine (PRD §7.12)

- **Requirements:** `FR-WFL-01` 🔴 M · `FR-WFL-02` 🔴 M · `FR-WFL-03` 🔴 M · `FR-WFL-04` 🔴 S · `FR-WFL-05` 🔴 M · `FR-WFL-06` 🔴 M
- **What actually remains:** Everything, but **no new context and no new libraries**. `ARCHITECTURE.md` §4.1 explicitly refuses a central workflow-engine context ("it would become a god context every other context depends on, violating isolation") and instead places a `StateModel` / transition-rule primitive in `libs/shared/domain`, with each context owning its own configured lifecycle. So this epic delivers: the shared state-model and transition primitive, the business-rule evaluation model on record events (`FR-WFL-02`), the category/subject/channel → Resolver Group routing rules (`FR-WFL-03`), assignment strategies including round-robin and skill-based (`FR-WFL-04`), the scheduled/time-based rule runner used by auto-close, SLA warnings and stale-ticket reminders (`FR-WFL-05`), and rule-execution recording in the activity history (`FR-WFL-06`).
- **Depends on:** `C10` (inferred — the primitive lives in `libs/shared/domain`, which `C10` creates) · `C18` (declared — `FR-WFL-06` requires rule execution to be recorded in the record's activity history)
- **Size:** **M** — 6 requirements, 0 new libraries, but the primitive must be right the first time because five lifecycles instantiate it. Getting it wrong is a cross-cutting rewrite.
- **Findings:** **F8** (PRD models C12 as a capability; ARCHITECTURE dissolves it — the epic is real but its libraries land elsewhere).

### `C14` · Assignment & Queue Management (PRD §7.13)

- **Requirements:** `FR-QUE-01` 🔴 M · `FR-QUE-02` 🔴 M · `FR-QUE-03` 🔴 M · `FR-QUE-04` 🔴 C · `FR-QUE-05` 🔴 S
- **What actually remains:** Everything, but **no new libraries**: `ARCHITECTURE.md` §4.1 maps both C10 and C14 onto the `identity-access` context, whose `ResolverGroup` aggregate root is listed there. Delivers Resolver Groups with members, group manager and coverage schedule (`FR-QUE-01`), the prioritized agent work list ordered by priority, SLA time remaining and age and filterable by group, state and affected competition (`FR-QUE-02`), queue self-assignment (`FR-QUE-03`), category-entitlement guarding on assignment (`FR-QUE-04`), and group workload visibility for managers (`FR-QUE-05`). Note that `FR-QUE-02`'s work-list surface consumes SLA remaining time (`FR-SLA-10`) and therefore renders inside a ticket-context frontend, not inside `identity-access`.
- **Depends on:** `C10` (declared in `ARCHITECTURE.md` §4.1 — same bounded context; inferred from the PRD, which does not state it) · `C7` (inferred — `FR-QUE-02` orders by SLA time remaining, which only `FR-SLA-10` can supply)
- **Size:** **M** — 5 requirements, 0 new libraries, but the work list is the agent's primary surface and its ordering/filtering semantics are non-trivial.
- **Findings:** **F9** (`FR-QUE-04`, `FR-QUE-05` unphased in §14).

### `C7` · SLA Management & Escalation (PRD §7.7)

- **Requirements:** `FR-SLA-01` 🔴 M · `FR-SLA-02` 🔴 M · `FR-SLA-03` 🔴 M · `FR-SLA-04` 🔴 M · `FR-SLA-05` 🔴 M · `FR-SLA-06` 🔴 M · `FR-SLA-07` 🔴 M · `FR-SLA-08` 🔴 M · `FR-SLA-09` 🔴 S · `FR-SLA-10` 🔴 M
- **What actually remains:** Everything. Three libraries only (`domain`, `application`, `infrastructure` — `ARCHITECTURE.md` §5.1 gives `sla` no UI of its own; it is surfaced inside ticket views), but the domain is the most computationally exacting in the product: `SlaPolicy` definition per record type, service, Service Offering and priority (`FR-SLA-01`); exactly-one policy attachment with re-evaluation on priority or service change (`FR-SLA-02`); timers running against a configurable support schedule with business hours, 24×7 and holidays (`FR-SLA-03`); recalculation **from original creation time** on agent-driven priority change including the competition-in-progress Impact flag, preserving previous targets in the audit trail (`FR-SLA-04`); threshold breach warnings (`FR-SLA-05`); immutable breach records (`FR-SLA-06`); automatic functional and hierarchical escalation (`FR-SLA-07`); clock pause/resume on configured pending states (`FR-SLA-08`); OLA and underpinning-contract targets measured separately (`FR-SLA-09`); and remaining-time-to-target exposure on the work list and ticket view (`FR-SLA-10`).
- **Depends on:** `C10` (inferred — shared kernel and schema) · `C12` (declared — `FR-SLA-07` escalation rules are workflow rules; `FR-WFL-05` owns the time-based rule runner that raises warnings) · `C8` (declared — `FR-SLA-01` defines targets "per Service Offering"; mutual, see **F4**) · `C16` (declared — `FR-NOT-02` requires agent notification on SLA warning/breach) · `C18` (declared — `FR-SLA-04`/`FR-SLA-06` require audit-trail preservation)
- **Size:** **L** — 10 requirements (9 Must) against only 3 new libraries, but time-zone-correct schedule arithmetic (`NFR-I18N-03`), pause/resume semantics, restart-safe timers (`NFR-AVL-05`) and sub-minute warning latency (`NFR-PRF-04`) make this the highest-risk domain per requirement in the map. Time is a port (ADR-009), which makes it testable but adds design work.
- **Findings:** **F4** (mutual reference with `C8`).

### `C1` · Incident Management (PRD §7.1)

- **Requirements:** `FR-INC-01` 🔴 M · `FR-INC-02` 🔴 M · `FR-INC-03` 🔴 M · `FR-INC-04` 🔴 M · `FR-INC-05` 🔴 M · `FR-INC-06` 🔴 M · `FR-INC-07` 🔴 M · `FR-INC-08` 🔴 M · `FR-INC-09` 🔴 M · `FR-INC-10` 🔴 M · `FR-INC-11` 🔴 M · `FR-INC-12` 🔴 M · `FR-INC-13` 🔴 M · `FR-INC-14` 🔴 S · `FR-INC-15` 🔴 S · `FR-INC-16` 🔴 S · `FR-INC-17` 🔴 S · `FR-INC-18` 🔴 M
- **What actually remains:** Everything. Six libraries in the `incident` context (`domain`, `application`, `infrastructure`, `feature`, `ui`, `data-access`). This is the product's core aggregate and the richest lifecycle: intake with affected competition subject and instance (`FR-INC-01`), never-reused human-readable reference numbers (`FR-INC-02`, `NFR-DAT-01`), the configurable Category → Subcategory → Item taxonomy gating exit from `New` (`FR-INC-03`), Priority derived from the configurable Impact × Urgency matrix with justified override (`FR-INC-04`), and the product's signature behavior — the **agent-only, justification-bearing competition-in-progress flag** that raises assessed Impact and re-derives Priority, never automatic and never requester-set, fully audited (`FR-INC-05`). Then the eight-state lifecycle with configurable transitions (`FR-INC-06`), resolution-code gating (`FR-INC-07`), clock-stopping pending states (`FR-INC-08`), auto-close with a requester rejection window counted as a reopen (`FR-INC-09`), linking to Incidents/Major Incident/Problem/Change/Release/CIs (`FR-INC-10`), the public-comment vs. internal-work-note split (`FR-INC-11`, `NFR-SEC-04`), assignment history (`FR-INC-12`), functional and hierarchical escalation (`FR-INC-13`), Incident↔Service Request conversion preserving reference and history (`FR-INC-14`), scope-rule enforcement at intake (`FR-INC-15`), knowledge suggestion and deflection recording (`FR-INC-16`), duplicate/related detection (`FR-INC-17`) and FCR recording (`FR-INC-18`).
- **Depends on:** `C10` (declared — `FR-IAM-01`/`FR-IAM-03`) · `C12` (declared — `FR-INC-06` configurable transitions) · `C14` (declared — `FR-INC-12` reassignment between Resolver Groups) · `C7` (declared — `FR-INC-08` clock stopping, `FR-SLA-04` cross-reference) · `C18` (declared — `FR-INC-04`/`FR-INC-05` audit-trail recording) · `C16` (declared — `FR-NOT-01`) · `C9` (declared — `FR-INC-16` knowledge suggestion at intake) · `C11` (declared — `FR-OMN-01`/`FR-OMN-02` origin channel on the ticket) · `C6` (inferred — `FR-INC-10` links to Configuration Items, which only `C6` creates; deferrable, since `C6` is Phase 2 and CI linking can be added then) · `C3` (inferred — `FR-INC-10` links to a Problem; same deferral)
- **Size:** **XL** — 18 requirements (14 Must), the largest active requirement count in §7, 6 new libraries, the product's core aggregate, and the only epic that owns a domain-differentiating behavior (`FR-INC-05`). It is also **not phase-atomic** (see **F6**).
- **Findings:** **F6** (§14.2 places `FR-INC-01/02/03` in Phase 0 while §14.3 places `FR-INC-01→13, 18` in Phase 1 MVP — overlapping, so the Phase 0/1 boundary inside `C1` must be settled before drilling), **F9** (`FR-INC-15`, `FR-INC-16` are assigned to no phase at all, despite `FR-INC-15` being cited as the mitigation for risk R1).

### `C13` · Major Incident Management (PRD §7.1.1)

- **Requirements:** `FR-MIM-01` 🔴 M · `FR-MIM-02` 🔴 M · `FR-MIM-03` 🔴 M · `FR-MIM-04` 🔴 S · `FR-MIM-05` 🔴 S · `FR-MIM-06` 🔴 C
- **What actually remains:** Everything, but **no new libraries**: `ARCHITECTURE.md` §4.1 places C1 and C13 in the same `incident` context, with the `MajorIncident` declaration modelled on the `Incident` root. Delivers authorized declaration with declaration time, declarer and justification (`FR-MIM-01`); the Major Incident protocol — accelerated SLA targets, immediate stakeholder-list notification and resolver-group engagement (`FR-MIM-02`); parent/child linking with resolution and closure propagation under a shared resolution code (`FR-MIM-03`); the configurable stakeholder communication cadence with every communication audited (`FR-MIM-04`); the post-review record plus mandatory linked Problem as a closure gate (`FR-MIM-05`); and the portal service-status message (`FR-MIM-06`).
- **Depends on:** `C1` (declared — it is a sub-capability of §7.1 and operates on the `Incident` aggregate) · `C16` (declared — `FR-MIM-02`/`FR-MIM-04`, `FR-NOT-04`) · `C7` (declared — `FR-MIM-02` accelerated SLA targets) · `C3` (declared — `FR-MIM-05` requires a Problem record before closure; note `C3` is Phase 2 while `FR-MIM-05` is Phase 3, so the ordering holds) · `C9` (declared — `FR-MIM-06` portal status message)
- **Size:** **M** — 6 requirements, 0 new libraries, but the protocol touches SLA recalculation, the notification framework and closure gating across three other epics.
- **Findings:** **F1** (C13 is present in §7 as a nested sub-capability, not as a top-level §7.x subsection — it is keyed as its own epic and this map records why).

### `C8` · Service Catalog Management (PRD §7.8)

- **Requirements:** `FR-CAT-01` 🔴 M · `FR-CAT-02` 🔴 M · `FR-CAT-03` 🔴 M · `FR-CAT-04` 🔴 M · `FR-CAT-05` 🔴 M · `FR-CAT-06` 🔴 C
- **What actually remains:** Everything. Six libraries in the `service-catalog` context. Services and Service Offerings in browsable categories (`FR-CAT-01`); per-offering definition of description, **request form definition**, eligibility rules, approval requirements, fulfillment workflow, assignment target and SLA policy (`FR-CAT-02`); the `Draft → Published → Retired` publication lifecycle with only `Published` visible (`FR-CAT-03`); eligibility-filtered presentation per requester (`FR-CAT-04`); catalog search and filtering (`FR-CAT-05`); and cost/effort metadata with expected fulfillment time (`FR-CAT-06`).
- **Depends on:** `C10` (declared — `FR-CAT-04` filters by role and entitlement tier) · `C7` (declared — `FR-CAT-02` names an SLA policy; mutual, see **F4**) · `C15` (declared — `FR-CAT-02` names approval requirements) · `C12` (inferred — `FR-CAT-02` names a fulfillment workflow, which is a configured lifecycle owned by `C12`'s primitive)
- **Size:** **M** — only 6 requirements, but 6 new libraries and one genuinely deep sub-problem: `FR-CAT-02`'s **dynamic request form definition** is a metadata-driven form builder that `FR-SRQ-03` then renders and validates. If that form model is scoped ambitiously, this epic becomes **L**; flag it at refinement.
- **Findings:** **F4** (mutual reference with `C7`), **F9** (`FR-CAT-06` unphased).

### `C15` · Approval Engine (PRD §7.14)

- **Requirements:** `FR-APR-01` 🔴 M · `FR-APR-02` 🔴 M · `FR-APR-03` 🔴 M · `FR-APR-04` 🔴 S · `FR-APR-05` 🔴 S · `FR-APR-06` 🔴 C · `FR-APR-07` 🔴 M
- **What actually remains:** Everything. Six libraries in the `approval` generic supporting context (ADR-001). Configurable sequential and/or parallel approval stages (`FR-APR-01`); approver resolution by role, group, **competition ownership** or named user (`FR-APR-02`); `Approved`/`Rejected` decisions with mandatory rejection comment, approver identity and timestamp (`FR-APR-03`); time-bounded delegation recording both delegate and original approver (`FR-APR-04`); reminders and non-response escalation (`FR-APR-05`); CAB quorum rules (`FR-APR-06`); and decision immutability (`FR-APR-07`).
- **Depends on:** `C10` (declared — `FR-APR-02` resolves approvers by role, group and competition ownership) · `C16` (declared — `FR-NOT-03` notifies approvers of pending tasks and reminders; `FR-APR-05`) · `C18` (declared — `FR-APR-07` immutability is realized by the audit/event discipline) · `C12` (inferred — `FR-APR-05` escalation on non-response is a time-based rule owned by `FR-WFL-05`)
- **Size:** **M** — 7 requirements and 6 new libraries, but the aggregate is shallow (`ApprovalRequest` with an immutable `ApprovalDecision`, `ARCHITECTURE.md` §4.1) and it is exposed to three consumers through a single published port (Open Host Service, §4.3). Sized M rather than L because domain depth, not library count, drives the risk here.
- **Findings:** none beyond the shared set.

### `C2` · Service Request Management (PRD §7.2)

- **Requirements:** `FR-SRQ-01` 🔴 M · `FR-SRQ-02` 🔴 M · `FR-SRQ-03` 🔴 M · `FR-SRQ-04` 🔴 M · `FR-SRQ-05` 🔴 M · `FR-SRQ-06` 🔴 M · `FR-SRQ-07` 🔴 M · `FR-SRQ-08` 🔴 M · `FR-SRQ-09` 🔴 M · `FR-SRQ-10` 🔴 S · `FR-SRQ-11` 🔴 M
- **What actually remains:** Everything. Six libraries in the `service-request` context, with a `ServiceRequest` root owning `FulfillmentTask` entities. Catalog-only origination (`FR-SRQ-01`); eligibility enforcement by role, entitlement tier and relationship to the affected competition (`FR-SRQ-02`); dynamic form rendering and mandatory-field validation (`FR-SRQ-03`); approval gating before fulfillment starts (`FR-SRQ-04`); the seven-state lifecycle plus `Cancelled` (`FR-SRQ-05`); fulfillment decomposition into ordered or parallel tasks across groups with parent closure gated on mandatory tasks (`FR-SRQ-06`); the offering-level fulfillment-target SLA, distinct from Incident SLA policies (`FR-SRQ-07`); requester cancellation before fulfillment (`FR-SRQ-08`); the six MVP catalog request types — account creation, role/organizer-access provisioning, password reset/recovery/unlock, data export, billing & registration-payment support, reactivation (`FR-SRQ-09`); fully automated fulfillment for designated offerings (`FR-SRQ-10`); and mandatory rejection reasons (`FR-SRQ-11`).
- **Depends on:** `C8` (declared — `FR-SRQ-01`; Conformist relationship per `ARCHITECTURE.md` §4.3) · `C15` (declared — `FR-SRQ-04`; Customer-Supplier via Open Host Service) · `C7` (declared — `FR-SRQ-07`; Customer-Supplier) · `C10` (declared — `FR-SRQ-02` eligibility) · `C12` (declared — `FR-SRQ-05` configured lifecycle) · `C14` (declared — `FR-SRQ-06` tasks assigned to different groups) · `C16` (inferred — `FR-SRQ-11` requires the rejection reason to be "communicated to the requester")
- **Size:** **L** — 11 requirements (10 Must), 6 new libraries, plus the task-decomposition sub-aggregate and three upstream integrations (catalog, approval, SLA). `FR-SRQ-09` is a container for six distinct offerings and will decompose heavily at story level.
- **Findings:** none beyond the shared set.

### `C16` · Notification Framework (PRD §7.15)

- **Requirements:** `FR-NOT-01` 🔴 M · `FR-NOT-02` 🔴 M · `FR-NOT-03` 🔴 M · `FR-NOT-04` 🔴 M · `FR-NOT-05` 🔴 M · `FR-NOT-06` 🔴 **M (in-app) / S (email) / C (push)** · `FR-NOT-07` 🔴 C · `FR-NOT-08` 🔴 M
- **What actually remains:** Everything. Four libraries in the `notification` context (`domain`, `application`, `infrastructure`, `data-access` — no `feature`/`ui`; in-app notifications surface inside the shell). Requester notifications on acknowledgment-with-reference, assignment, information request, resolution and closure (`FR-NOT-01`); agent/group notifications on assignment, escalation and SLA warning/breach (`FR-NOT-02`); approver task and reminder notifications (`FR-NOT-03`); Major Incident stakeholder notifications (`FR-NOT-04`); configurable, **localizable** templates per event type (`FR-NOT-05`, `NFR-I18N-04`); in-app and email channels with optional push (`FR-NOT-06`); user preferences within policy limits, where mandatory notifications cannot be disabled (`FR-NOT-07`); and dispatch recording against the source record (`FR-NOT-08`). Architecturally this is a post-commit domain-event subscriber (ADR-008), which is what guarantees `NFR-AVL-03`: a failing notification adapter must not fail a ticket transaction.
- **Depends on:** `C10` (inferred — recipient resolution needs users, roles and groups) · `C1`, `C2`, `C7`, `C15`, `C13` (declared — each is an event source named in `FR-NOT-01→04`) · `C18` (inferred — `FR-NOT-08` records dispatch against the source record, i.e. into the activity history) · D5, D7 (external — participant notification channels and the email gateway)
- **Size:** **M** — 8 requirements, 4 new libraries, a simple `NotificationDispatch` aggregate. The template localization surface and the per-channel adapters add breadth, not depth.
- **Findings:** **F3** (`FR-NOT-06` carries a compound M/S/C priority and cannot be scheduled atomically), **F9** (`FR-NOT-06` is not explicitly phased in §14, though §14.3 implies the in-app slice).

### `C9` · Knowledge Management & Self-Service Portal (PRD §7.9)

- **Requirements:** `FR-KNW-01` 🔴 M · `FR-KNW-02` 🔴 M · `FR-KNW-03` 🔴 M · `FR-KNW-04` 🔴 M · `FR-KNW-05` 🔴 M · `FR-KNW-06` 🔴 S · `FR-KNW-07` 🔴 S · `FR-KNW-08` 🔴 M · `FR-KNW-09` 🔴 S · `FR-KNW-10` 🔴 S
- **What actually remains:** Everything. Six libraries in the `knowledge` context. Five article types (`FR-KNW-01`); the `Draft → Review → Published → Retired` authoring lifecycle with a publication approver (`FR-KNW-02`); audience visibility, requester-facing vs. internal, with **no public or anonymous Knowledge Base at all** (`FR-KNW-03`, `FR-IAM-01`, `NFR-SEC-01`); entitlement-filtered full-text search (`FR-KNW-04`); article-as-resolution-source with knowledge-assisted-resolution counting (`FR-KNW-05`); deflection measurement over a configurable window (`FR-KNW-06`); article rating with stale-article surfacing (`FR-KNW-07`); create-from-resolution drafting (`FR-KNW-10`); and competition-scoped ticket visibility for Organizers and League Administrators (`FR-KNW-09`). **`FR-KNW-08` is the entire Self-Service Portal** — search, Incident submission, catalog request, own-ticket list with status and SLA, comments and attachments, resolution confirm/reject, CSAT submission — which makes this epic substantially larger than its article-management requirements suggest.
- **Depends on:** `C10` (declared — `FR-KNW-03`/`FR-KNW-04` visibility entitlement) · `C1` and `C2` (declared — `FR-KNW-08` submits and lists tickets) · `C7` (declared — `FR-KNW-08` shows ticket SLA status) · `C3` (declared — `FR-PRB-06` publishes workarounds as articles; `FR-KNW-10`) · `C15` (inferred — `FR-KNW-02` names an approver role for publication, which the approval engine can serve)
- **Size:** **L** — 10 requirements and 6 new libraries, but the driver is `FR-KNW-08`: the requester-facing portal is a complete second frontend surface with its own mobile (`NFR-USE-04`), accessibility (`NFR-USE-03`) and plain-language (`NFR-USE-01`) obligations. Full-text search is a further distinct capability.
- **Findings:** none beyond the shared set.

### `C11` · Omnichannel Intake (PRD §7.11)

- **Requirements:** `FR-OMN-01` 🔴 **M (portal + agent-logged) / S (email, in-app)** · `FR-OMN-02` 🔴 M · `FR-OMN-03` 🔴 S · `FR-OMN-04` 🔴 M
- **What actually remains:** Everything, but **no new libraries and no bounded context**: `ARCHITECTURE.md` §4.1 classifies omnichannel intake as an *adapter concern*. Portal and agent-logged intake are the same inbound HTTP adapter over the same use case; email-to-ticket becomes an additional inbound adapter in Phase 3. Only `originChannel` (`FR-OMN-02`) enters the domain, as a value object in `libs/shared/domain`. Delivers channel normalization into one ticket model with a unique reference (`FR-OMN-01`), origin-channel recording for reporting (`FR-OMN-02`), email-reply threading appended as public comments rather than new tickets (`FR-OMN-03`), and identity capture with no anonymous submission (`FR-OMN-04`).
- **Depends on:** `C1` and `C2` (declared — normalization targets the ticket model these epics own) · `C10` (declared — `FR-OMN-04` requires requester identity) · D7 email gateway (external, `FR-OMN-01` email slice and `FR-OMN-03`)
- **Size:** **S** — 4 requirements, 0 new libraries, 0 new aggregates. The email adapter is real work but is a Phase 3 slice with an external dependency.
- **Findings:** **F3** (`FR-OMN-01` carries a compound M/S priority and straddles Phase 1 and Phase 3 — it must be split before it can be scheduled), **F9** (`FR-OMN-02`, `FR-OMN-04` are not explicitly phased, though §14.3 implies them via the MVP Incident row).

### `C17` · Reporting, Dashboards & Analytics (PRD §7.16)

- **Requirements:** `FR-RPT-01` 🔴 M · `FR-RPT-02` 🔴 M · `FR-RPT-03` 🔴 S · `FR-RPT-04` 🔴 S · `FR-RPT-05` 🔴 M · `FR-RPT-06` 🔴 S · `FR-RPT-07` 🔴 M
- **What actually remains:** Everything. Six libraries in the `reporting` generic supporting context, which owns **read models only, no aggregate** (`ARCHITECTURE.md` §4.1) and reads its own denormalized projections rather than joining into other contexts' tables (§4.3, Open Host / read models). The operational dashboard for agents and group managers (`FR-RPT-01`); the management dashboard covering FCR, MTTA, MTTR, SLA Compliance, Reopen Rate, backlog volume and ageing, CSAT and volume by category/channel/service (`FR-RPT-02`); the Change and Release process dashboards (`FR-RPT-03`); the competition-domain KPIs including time-to-restore for competition-impacting Incidents and the deflection rate (`FR-RPT-04`); filtering by period, service, category, competition, priority and Resolver Group (`FR-RPT-05`); export (`FR-RPT-06`); and **reproducibility** — same filters over the same period must return the same values (`FR-RPT-07`), which is the requirement that forces the projection design.
- **Depends on:** `C1`, `C2`, `C7` (declared — every §9.1 KPI is computed from these) · `C13` (declared — Major Incident rate, `FR-RPT-04`) · `C15` (declared — approval evidence) · `C4`, `C5` (declared — `FR-RPT-03` Change Success Rate, change-induced Incident rate, emergency change ratio, release lead time) · `C9` (declared — `FR-RPT-04` deflection rate, sourced from `FR-KNW-06`) · `C6` (inferred — `NFR-AUD-04` requires producing the full list of Incidents, Changes and Releases affecting a competition)
- **Size:** **L** — 7 requirements and 6 new libraries, but the real cost is the projection/read-model layer feeding from every other context plus the reproducibility guarantee. It is also the epic most exposed to upstream churn: any change to a ticket model invalidates a projection.
- **Findings:** **F7** (`FR-REL-08` release lead time and `FR-CHG-11` change-induced Incident attribution are unphased, yet `FR-RPT-03` depends on both).

### `C6` · Asset & Configuration Management — CMDB (PRD §7.6)

- **Requirements:** `FR-CMD-01` 🔴 M · `FR-CMD-02` 🔴 M · `FR-CMD-03` 🔴 M · `FR-CMD-04` 🔴 M · `FR-CMD-05` 🔴 M · `FR-CMD-06` 🔴 M · `FR-CMD-07` 🔴 C · `FR-CMD-08` 🔴 C
- **What actually remains:** Everything. Six libraries in the `asset-config` context (Phase 2 — not scaffolded in Phase 1 per `ARCHITECTURE.md` §5.1), with a `ConfigurationItem` root owning typed `CiRelationship` entities. A CMDB of SCMS services, environments, application components, integrations and data stores (`FR-CMD-01`); per-CI identifier, name, type, criticality, environment, owner, operational status and current version (`FR-CMD-02`); directed typed relationships — `depends on`, `runs on`, `part of`, `connects to` (`FR-CMD-03`); **impact analysis** traversing those relationships to list affected services, competitions and open records (`FR-CMD-04`); linking to Incidents, Problems, Changes and Releases (`FR-CMD-05`); CI change history in the audit trail (`FR-CMD-06`); configuration drift flagging (`FR-CMD-07`); and asset lifecycle states for non-service assets (`FR-CMD-08`).
- **Depends on:** `C10` (inferred — schema, RBAC and CI ownership) · `C18` (declared — `FR-CMD-06`) · `C1` (declared — `FR-CMD-05`, `FR-INC-10` CI linkage) · D6 CI/CD and environment tooling (external, manual fallback acceptable in MVP per §12)
- **Size:** **L** — 8 requirements and 6 new libraries, with one hard sub-problem: `FR-CMD-04`'s relationship-graph traversal under `FR-CMD-03`'s typed, directed edges, returning services **and competitions** and open records of four types. Risk R4 (CMDB decay) argues for a deliberately small MVP CI model, which should be settled at refinement.
- **Findings:** none beyond the shared set.

### `C4` · Change Management (PRD §7.4)

- **Requirements:** `FR-CHG-01` 🔴 M · `FR-CHG-02` 🔴 M · `FR-CHG-03` 🔴 M · `FR-CHG-04` 🔴 M · `FR-CHG-05` 🔴 M · `FR-CHG-06` 🔴 M · **`FR-CHG-07` — retired, excluded from counts** · `FR-CHG-08` 🔴 S · `FR-CHG-09` 🔴 M · `FR-CHG-10` 🔴 M · `FR-CHG-11` 🔴 S · `FR-CHG-12` 🔴 S
- **What actually remains:** Everything. Six libraries in the `change` context (Phase 2). Three Change types with distinct workflows — Standard, Normal, Emergency (`FR-CHG-01`); the full Change record including affected CIs and services, implementation, test and **rollback** plans and a risk & impact assessment (`FR-CHG-02`); the hard authorization gate before `Scheduled` (`FR-CHG-03`, constraint K5); the seven-state lifecycle plus `Rejected`/`Cancelled` (`FR-CHG-04`); computed risk level from impact scope, CI count and criticality, rollback feasibility, complexity and past CI failure history (`FR-CHG-05`); the change schedule filterable by service, environment and CI (`FR-CHG-06`); CI-level scheduling-conflict detection (`FR-CHG-08`); the mandatory Post-Implementation Review outcome as a closure gate (`FR-CHG-09`); linking to originating Incidents/Problems and the delivering Release (`FR-CHG-10`); change-induced Incident attribution (`FR-CHG-11`); and pre-approved Standard Change templates (`FR-CHG-12`). **`FR-CHG-07` is retired** — deployment freeze windows are out of scope (§3.3, ADR-006); the ID is retained for traceability and never reused, and no work exists for it.
- **Depends on:** `C6` (declared — `FR-CHG-02` affected CIs, `FR-CHG-05` CI criticality and failure history, `FR-CHG-08` CI-level conflicts) · `C15` (declared — `FR-CHG-03` authorization decision) · `C5` (declared — `FR-CHG-10` links to the delivering Release; mutual with `FR-REL-02`) · `C1` and `C3` (declared — `FR-CHG-10` originating records, `FR-CHG-11` attribution, `FR-PRB-07` raises a Change as permanent fix) · `C12` (declared — `FR-CHG-04` configured lifecycle) · `C18` (declared — authorization evidence, `NFR-AUD-03`)
- **Size:** **L** — 11 active requirements (8 Must) and 6 new libraries, with two distinct sub-engines: the configurable risk-scoring model (`FR-CHG-05`) and the change schedule with CI-level conflict detection (`FR-CHG-06`, `FR-CHG-08`), the latter shared with `C5`'s release schedule.
- **Findings:** **F2** (`FR-CHG-07` retired — counted as an ID, excluded as work), **F7** (`FR-CHG-11` is assigned to no phase, yet §14.7 makes the change-induced Incident rate a Phase 2 KPI).

### `C5` · Release & Deployment Management (PRD §7.5)

- **Requirements:** `FR-REL-01` 🔴 M · `FR-REL-02` 🔴 M · `FR-REL-03` 🔴 M · `FR-REL-04` 🔴 M · `FR-REL-05` 🔴 M · `FR-REL-06` 🔴 M · `FR-REL-07` 🔴 S · `FR-REL-08` 🔴 S
- **What actually remains:** Everything. Six libraries in the `release` context (Phase 2). The Release record with version identifier, release type, scope, target environments, planned deployment window and rollout/rollback plans (`FR-REL-01`); association of authorized Changes with a hard gate against approving a Release containing unauthorized Changes (`FR-REL-02`, constraint K5); the seven-state lifecycle plus `Rolled Back`/`Cancelled` (`FR-REL-03`); the **release schedule integrated with the change schedule** with overlap warnings per environment (`FR-REL-04`, shares `FR-CHG-06`'s schedule model); per-environment deployment execution recording that updates CI versions on success (`FR-REL-05`); rollback recording with trigger reason and post-rollback CI state (`FR-REL-06`); verification results as a closure gate (`FR-REL-07`); and release lead time computation (`FR-REL-08`).
- **Depends on:** `C4` (declared — `FR-REL-02` requires authorized Changes; mutual with `FR-CHG-10`) · `C6` (declared — `FR-REL-05` updates CI versions, `FR-REL-06` records post-rollback CI state) · `C15` (declared in `ARCHITECTURE.md` §4.2/§4.3 — `release → approval` Customer-Supplier; **inferred from the PRD**, which states no explicit Release approval requirement beyond `FR-REL-02`) · `C12` (declared — `FR-REL-03` configured lifecycle) · D6 CI/CD tooling (external, assumption A6)
- **Size:** **L** — 8 requirements and 6 new libraries, with the schedule-integration requirement (`FR-REL-04`) creating a hard coupling to `C4` that must be designed jointly, and the CI-version write-back (`FR-REL-05`) creating a second one to `C6`.
- **Findings:** **F7** (`FR-REL-07` and `FR-REL-08` are assigned to no phase — §14.4 lists only `FR-REL-01 → 06` — yet `FR-REL-08` feeds the release lead time KPI in §9.2 and `FR-REL-07` is a closure gate).

### `C3` · Problem Management (PRD §7.3)

- **Requirements:** `FR-PRB-01` 🔴 M · `FR-PRB-02` 🔴 M · `FR-PRB-03` 🔴 M · `FR-PRB-04` 🔴 M · `FR-PRB-05` 🔴 M · `FR-PRB-06` 🔴 M · `FR-PRB-07` 🔴 S · `FR-PRB-08` 🔴 S · `FR-PRB-09` 🔴 C
- **What actually remains:** Everything. Six libraries in the `problem` context (Phase 2), with `Problem` and `KnownError` roots. Problem creation manually, from an Incident, or from Major Incident closure (`FR-PRB-01`); multi-Incident linking with aggregated count and impact (`FR-PRB-02`); the six-state lifecycle (`FR-PRB-03`); structured RCA — symptom, investigation, root cause, corrective action, preventive action — as a gate on `Root Cause Identified` (`FR-PRB-04`); the **Known Error Database** searchable by agents and linkable to Incidents (`FR-PRB-05`); workaround publication as a Knowledge Article (`FR-PRB-06`); raising a Change as the permanent fix with a closure gate on that Change (`FR-PRB-07`); recurrence-pattern detection proposing Problem creation (`FR-PRB-08`); and proactive Problems from trend analysis with no triggering Incident (`FR-PRB-09`).
- **Depends on:** `C1` (declared — `FR-PRB-01`/`FR-PRB-02`, `FR-INC-10`) · `C13` (declared — `FR-MIM-05` requires a Problem before Major Incident closure; `FR-PRB-01` creation from Major Incident closure) · `C9` (declared — `FR-PRB-06` publishes the workaround as an article) · `C4` (declared — `FR-PRB-07` raises a Change) · `C12` (declared — `FR-PRB-03` configured lifecycle) · `C17` (inferred — `FR-PRB-09` proactive Problems are created "from trend analysis", which only the reporting read models can supply)
- **Size:** **L** — 9 requirements (6 Must) and 6 new libraries, with the KEDB as a second searchable knowledge surface alongside `C9` and the recurrence-detection rule (`FR-PRB-08`) requiring pattern analysis over Incident history.
- **Findings:** none beyond the shared set.

### `NFR` · Non-Functional Requirements (PRD §8)

- **Requirements (all 🔴, all 38):**
  - **§8.1 Availability & continuity:** `NFR-AVL-01` · `NFR-AVL-02` · `NFR-AVL-03` · `NFR-AVL-04` · `NFR-AVL-05`
  - **§8.2 Performance & responsiveness:** `NFR-PRF-01` · `NFR-PRF-02` · `NFR-PRF-03` · `NFR-PRF-04`
  - **§8.3 Security & access:** `NFR-SEC-01` · `NFR-SEC-02` · `NFR-SEC-03` · `NFR-SEC-04` · `NFR-SEC-05` · `NFR-SEC-06` · `NFR-SEC-07`
  - **§8.4 Auditability & compliance:** `NFR-AUD-01` · `NFR-AUD-02` · `NFR-AUD-03` · `NFR-AUD-04`
  - **§8.5 Internationalization & localization:** `NFR-I18N-01` · `NFR-I18N-02` · `NFR-I18N-03` · `NFR-I18N-04` · `NFR-I18N-05`
  - **§8.6 Usability & accessibility:** `NFR-USE-01` · `NFR-USE-02` · `NFR-USE-03` · `NFR-USE-04` · `NFR-USE-05`
  - **§8.7 Data quality, retention & scalability:** `NFR-DAT-01` · `NFR-DAT-02` · `NFR-DAT-03` · `NFR-DAT-04` · `NFR-DAT-05`
  - **§8.8 Configurability & operability:** `NFR-CFG-01` · `NFR-CFG-02` · `NFR-CFG-03`
  > §8 carries no MoSCoW column — non-functional requirements in this PRD are stated as unconditional obligations. Recorded as a characteristic, not a defect.
- **What actually remains:** Everything, split into two very different kinds of work. **Standalone build:** the i18n scaffolding on both platforms (`nestjs-i18n` driven by `Accept-Language`, Transloco plus the locale interceptor) with per-language template and article variants and a fallback language (`NFR-I18N-01/02/04/05`); time-zone-correct storage and SLA computation (`NFR-I18N-03`); the WCAG 2.1 AA baseline in `libs/shared/ui` (`NFR-USE-03`) and the responsive requester surfaces (`NFR-USE-04`); health and self-monitoring endpoints so Sport ITSM outages are detectable independently of user reports (`NFR-CFG-03`, `NFR-AVL-02`); degraded-mode intake when knowledge, reporting or notifications are down (`NFR-AVL-03`); restart-safe SLA timers (`NFR-AVL-05`); retention jobs (`NFR-DAT-02`, `NFR-AUD-03`); transactional audited bulk operations (`NFR-DAT-05`); and GDPR pseudonymization that erases personal data without destroying audit integrity (`NFR-SEC-07`, constraint K9). **Absorbed as acceptance criteria:** roughly two-thirds of §8 — the security posture (`NFR-SEC-01→06`), auditability (`NFR-AUD-01→04`), performance budgets (`NFR-PRF-01→04`), configurability (`NFR-CFG-01/02`) and data-quality rules (`NFR-DAT-01/03/04`) — is verified inside the epic that implements the behavior, not built separately. See finding **F10**.
- **Depends on:** all 18 capability epics (inferred — cross-cutting by definition; §8 constrains behavior that the other epics implement)
- **Size:** **XL** — by raw count the largest epic in the map (38 requirements) and it touches every library in the workspace, including two platform-wide mechanisms (i18n on both stacks, the a11y baseline in the design system) and one legally-driven feature (pseudonymization). Sized XL on count and reach, with the explicit caveat in **F10** that a large share of it must be scheduled as acceptance criteria on other epics rather than as standalone stories — otherwise this epic is double-counted against the rest of the map.
- **Findings:** **F10** (absorption / double-count risk).

---

## Epic key map

The key **is** the PRD's own capability ID from the §7 subsection title (`### 7.1 C1 — Incident Management`). No mnemonic is minted, no PRD ID is renumbered, and every key is ≤4 characters. §8 is the single `NFR` epic.

| Key | PRD section | Bounded context (`ARCHITECTURE.md` §4.1) | New Nx libraries | Story/ticket ID prefix |
| --- | --- | --- | --: | --- |
| `C1` | §7.1 | `incident` | 6 | `US-C1-nn` / `T-C1-nn` |
| `C13` | §7.1.1 | `incident` (shared with C1) | 0 | `US-C13-nn` / `T-C13-nn` |
| `C2` | §7.2 | `service-request` | 6 | `US-C2-nn` / `T-C2-nn` |
| `C3` | §7.3 | `problem` (phase 2) | 6 | `US-C3-nn` / `T-C3-nn` |
| `C4` | §7.4 | `change` (phase 2) | 6 | `US-C4-nn` / `T-C4-nn` |
| `C5` | §7.5 | `release` (phase 2) | 6 | `US-C5-nn` / `T-C5-nn` |
| `C6` | §7.6 | `asset-config` (phase 2) | 6 | `US-C6-nn` / `T-C6-nn` |
| `C7` | §7.7 | `sla` | 3 | `US-C7-nn` / `T-C7-nn` |
| `C8` | §7.8 | `service-catalog` | 6 | `US-C8-nn` / `T-C8-nn` |
| `C9` | §7.9 | `knowledge` | 6 | `US-C9-nn` / `T-C9-nn` |
| `C10` | §7.10 | `identity-access` + **`shared` kernel + 4 applications** | 5 + 9 | `US-C10-nn` / `T-C10-nn` |
| `C11` | §7.11 | none — inbound adapter concern (§4.1) | 0 | `US-C11-nn` / `T-C11-nn` |
| `C12` | §7.12 | none — `StateModel` primitive in `shared/domain` (§4.1) | 0 | `US-C12-nn` / `T-C12-nn` |
| `C14` | §7.13 | `identity-access` (shared with C10) | 0 | `US-C14-nn` / `T-C14-nn` |
| `C15` | §7.14 | `approval` | 6 | `US-C15-nn` / `T-C15-nn` |
| `C16` | §7.15 | `notification` | 4 | `US-C16-nn` / `T-C16-nn` |
| `C17` | §7.16 | `reporting` | 6 | `US-C17-nn` / `T-C17-nn` |
| `C18` | §7.17 | `audit` | 4 | `US-C18-nn` / `T-C18-nn` |
| `NFR` | §8 | cross-cutting — no context of its own | 0 | `US-NFR-nn` / `T-NFR-nn` |

> Library counts for the four Phase-2 contexts (`problem`, `change`, `release`, `asset-config`) are **inferred**: `ARCHITECTURE.md` §5.1 lists them without a per-lib breakdown ("phase 2 — not scaffolded in phase 1"). Six libraries each is assumed by analogy with `incident` and `service-request`. Confirm with the architect before these epics are sized for delivery.

## Findings — PRD vs code

**Not applicable — greenfield, no implementation exists at `aa1ea0e`.** There is no `package.json`, no `apps/`, no `libs/` and no `docs/product/implementation-baseline.md`. `CrossCheckAgainstCode()` was skipped as mandated, no requirement was spot-checked, and no PRD-vs-code disagreement can exist. Any PRD-vs-code table printed for this run would be fabricated.

## Findings — PRD internal consistency

These are reported, not fixed. `docs/product/PRD.md` was not modified.

| # | Severity | Epic(s) | Finding | Impact |
| --- | --- | --- | --- | --- |
| **F1** | Info | `C13` | **C13 is present in §7**, nested as `#### 7.1.1 C13 — Major Incident Management (sub-capability)` under §7.1, not as a top-level §7.x subsection. It carries its own capability ID, its own `FR-MIM-*` requirement family and its own row in §5. | Keyed as its own epic (`C13`, `US-C13-nn`) with a declared dependency on `C1`. It creates no new libraries — `ARCHITECTURE.md` §4.1 puts C1 and C13 in the same `incident` context. No blocker. |
| **F2** | Info | `C4` | **`FR-CHG-07` is retired** with priority `—` and the note "ID retained for traceability and not reused" (deployment freeze windows are out of scope, §3.3, ADR-006). | Correct PRD hygiene. Excluded from all counts: `C4` shows 12 declared IDs and **11 active** requirements. No work exists for this ID and none must be generated. |
| **F3** | **Blocker for scheduling** | `C11`, `C16` | **Two requirements carry compound MoSCoW priorities on a single ID:** `FR-OMN-01` = `M (portal + agent-logged) / S (email, in-app)`, and `FR-NOT-06` = `M (in-app) / S (email) / C (push)`. A single requirement with two or three priorities cannot be scheduled atomically, and `FR-OMN-01` straddles Phase 1 and Phase 3. | The Product Owner must split these into per-channel requirement IDs in the PRD (Mode 1), **or** the Business Analyst must split them at story level and record the split. Do not drill `C11` or `C16` until this is resolved. |
| **F4** | Medium | `C7`, `C8` | **Mutual reference:** `FR-SLA-01` defines SLA targets "per record type, service, **Service Offering** and priority", while `FR-CAT-02` requires each Service Offering to define "…and **SLA policy**". Each capability's requirement names the other as its own content. | Not a true cycle at implementation level — the offering holds an SLA policy *identifier* and the policy registry (`C7`) is authored first. But the build sequence must be explicit, or two teams will each wait for the other. Reflected in the suggested order (`C7` at 5, `C8` at 8). |
| **F5** | Medium | `C10`, `C18` | **Mutual reference at phase 0:** `FR-IAM-05` requires role assignment/revocation to be "fully audited" (needs `C18`), while `FR-AUD-02` requires every audit entry to capture an actor (needs `C10`). `ARCHITECTURE.md` §4.1 places `audit` at phase 0 and `identity-access` at phase 0/1. | The two must be **co-delivered** as a single phase-0 increment. Do not sequence them as two independent epics; treat `C18` as an early parallel track inside the `C10` foundation rather than a strict successor. |
| **F6** | Medium | `C1`, `C18`, `NFR` | **Three epics are not phase-atomic.** §14.2 Phase 0 pulls "core ticket record and reference numbering, categorization taxonomy" out of `C1` (i.e. `FR-INC-01/02/03`) while §14.3 lists `FR-INC-01 → 13, 18` in Phase 1 MVP — the two lists overlap without stating where the boundary falls. The same split applies to `C18` (`FR-AUD-01→04` Phase 0 vs `FR-AUD-05` Phase 1) and `NFR` (`NFR-I18N-01/02` Phase 0, the rest unphased). | The epic map keys and counts remain correct, but a drill of `C1`, `C18` or `NFR` must first settle the Phase 0/Phase 1 cut with the Product Owner, or Phase 0 stories will be written twice. |
| **F7** | Medium | `C4`, `C5`, `C17` | **Two KPI-bearing requirements are unphased.** §14.4 lists Change as `FR-CHG-01 → 06, 08 → 10, 12` — **omitting `FR-CHG-11`** (change-induced Incident attribution) — and Release as `FR-REL-01 → 06` — **omitting `FR-REL-07`** (verification as a closure gate) **and `FR-REL-08`** (release lead time). Yet §9.2 defines the change-induced Incident rate and release lead time as tracked KPIs, and §14.7 assigns both to Phase 2. | Phase 2's stated exit KPIs cannot be computed from Phase 2's stated requirement set. `FR-RPT-03` (process dashboards, Phase 2) therefore depends on requirements that no phase schedules. Assign `FR-CHG-11`, `FR-REL-07` and `FR-REL-08` to Phase 2 before drilling `C4`, `C5` or `C17`. |
| **F8** | Info | `C12` | **PRD/architecture modelling divergence, deliberate and documented.** The PRD models C12 as a capability with its own requirement family; `ARCHITECTURE.md` §4.1 explicitly refuses a `workflow` bounded context ("it would become a god context every other context depends on") and realizes C12 as a `StateModel` primitive in `libs/shared/domain` plus per-context configuration. | Not a contradiction — the PRD is behavior, the architecture is structure. But the epic `C12` creates **zero libraries of its own**: its code lands in `shared/domain` (owned by `C10`) and in each consuming context. Sizing and ticket placement must account for that, or `C12` will look empty and its consumers will look over-sized. |
| **F9** | Low | `C1`, `C8`, `C10`, `C11`, `C14`, `C16`, `C18` | **Eleven further requirements are assigned to no phase in §14:** `FR-INC-15`, `FR-INC-16`, `FR-CAT-06`, `FR-IAM-04`, `FR-IAM-06`, `FR-IAM-07`, `FR-OMN-02`, `FR-OMN-04`, `FR-QUE-04`, `FR-QUE-05`, `FR-AUD-06`. (`FR-NOT-06` is arguably covered by §14.3's parenthetical "in-app mandatory, email if available".) Notably, `FR-INC-15` is the stated mitigation for risk **R1** (scope creep into sport operations) and `FR-IAM-06` (session timeout, step-up authentication) is a security control. | Mostly Should/Could items, so low urgency — but `FR-INC-15` guards the product's non-negotiable scope rule and `FR-OMN-02`/`FR-OMN-04` are Must requirements implied by the MVP without being listed. Recommend a §14 pass in Mode 1 to phase all 147 active requirements explicitly. |
| **F10** | Medium | `NFR` | **NFR absorption / double-count risk.** The `NFR` epic carries 38 requirements — 20% of the map — but roughly two-thirds of them (`NFR-SEC-01→06`, `NFR-AUD-01→04`, `NFR-PRF-01→04`, `NFR-CFG-01/02`, `NFR-DAT-01/03/04`) are constraints verified *inside* the epic that implements the behavior, not standalone deliverables. Counting them once in `NFR` and again as acceptance criteria on `C1`…`C18` inflates the backlog. | Before drilling, decide the policy: either (a) `NFR` produces only the standalone-build stories (i18n scaffolding, a11y baseline, health/observability, retention, pseudonymization) and the rest become a Definition-of-Done checklist applied to every epic, or (b) `NFR` produces verification stories and the other epics reference them. Option (a) is recommended and is consistent with §15.2 Definition of Done items 3–8. |

## Findings — drift against upstream sources

| # | Severity | Finding | Impact |
| --- | --- | --- | --- |
| **F11** | Medium | **`readme.md` §1.2 vs PRD §3.3 — event-aware SLA drift.** The upstream capability list (echoed in the Product Owner agent's domain anchor) describes "SLA Management & Escalation (**event-aware around live windows**)" and names "event protection during critical live windows (registration deadlines, match days, finals)" as a value driver. The PRD explicitly reverses this: §3.3 places "competition calendar management and time-based service policies" **out of scope** — "Sport ITSM does not maintain, import or reason over a competition calendar. It defines no 'live window', no event-driven SLA modulation and no deployment freeze period." `FR-CHG-07` was retired for exactly this reason, and `ARCHITECTURE.md` **ADR-006** ratifies it. | The PRD, the retired ID and the ADR agree with each other and disagree with `readme.md` §1.2. The PRD is the more recent and more specific decision, so this map follows it: **no epic in this map contains live-window, calendar or freeze-window work.** Recommend updating `readme.md` §1.2 (and the agent's domain anchor) so the upstream text stops advertising a capability the product has decided not to build. Competition impact is an agent judgment on the ticket (`FR-INC-05`), not a calendar lookup. |
| **F12** | Info | **`docs/product/PRD.md` is untracked.** The file is not committed, so `prdLastCommit` is stamped `uncommitted (working tree)` rather than a sha. | This map cannot be reliably compared against a future PRD revision until the PRD is committed. Commit `docs/product/PRD.md`, then regenerate this map so the provenance stamp carries a real sha and date. |
