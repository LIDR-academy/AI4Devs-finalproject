# Tickets — C1 · Incident Management

> Sources: `docs/backlog/C1/user-stories.md` (32 stories, all greenfield) · `docs/backlog/epic-map.md` (§ `C1`, § **Foundation ownership (priced once)**) · `docs/backlog/C10/tickets/` (the workspace foundation, already ticketed) · `CLAUDE.md` §3 · `docs/product/ARCHITECTURE.md` §5, §6.2, §8, §9 · PRD §7.1, §14
> Test plan: [`../test-plan.md`](../test-plan.md)

**98 tickets · 258.5h · none over the 3h cap.**
**2 tickets are foundation** work with `story: —` — the six `incident` libraries and the context schema/module wiring. Everything else in the workspace is **priced once into `C10`** and is not re-paid here.
**12 tickets are blocked** by six findings: **F24** (1), **F25** (2), **F27** (1), **F28** (2), **F29** (3), **F30** (3). None of those decisions is made in this backlog.

The numbering **is** the implementation order. `T-C1-01` is built first. Where the order departs from the story sequence, the reason is stated below the affected block.

## Reading a ticket

| Field | Meaning |
|---|---|
| `story` | The `US-C1-nn` it serves, or `—` for foundation work |
| `foundation` | `true` when no story backs it; the owning source is cited in its `## Context` |
| `layer` | DDD layer per `ARCHITECTURE.md` §5.3 |
| `platform` | `backend` / `frontend` / `shared` — stated for every ticket, and load-bearing where `agent` is `—` |
| `agent` | `backend-engineer`, `frontend-engineer`, or `—` for workspace scaffolding and E2E test code, which neither dev agent owns |
| `phase` | Copied verbatim from the story. Four values are in use: `disputed 0/1 (F6)`, `1 (MVP)`, `unphased (F9)`, `3 (§14.5)` |
| `blocked_by` | The finding that must be resolved before the ticket is real work |

**Phases are read, not derived.** Every `C1` story carries a `Phase:` field and it is copied verbatim. **The Phase 0/1 cut of finding F6 is not resolved here** — PRD §14.2 places `FR-INC-01/02/03` in Phase 0 while §14.3 places `FR-INC-01 → 13, 18` in the Phase 1 MVP, overlapping without stating the boundary. That is a Product Owner decision. `US-C1-01` → `US-C1-07`, and the foundation that must land with them, carry `disputed 0/1`.

## What this epic does **not** pay for

The epic map assigns shared scaffolding to exactly one epic. **`C10` owns all of it** and has already ticketed it at `T-C10-01` → `T-C10-17`: the Nx workspace, pnpm, the ESLint flat config with `@nx/enforce-module-boundaries`, Prettier, the three-axis tag scheme, the four applications, `libs/shared/{contracts,domain,ui,util}`, the in-house design system, and the PostgreSQL base schema with its TypeORM migration chain. **No ticket here rebuilds any of it.** What `C1` does own is the six `incident` libraries (`ARCHITECTURE.md` §5.1; epic map, *What actually remains*) and the context schema namespace and module wiring — block A.

## Context boundaries — the expensive mistake this epic could make

`C1` depends on nine epics and almost none of them exist. Every seam below delivers **only the Incident side**, declares the dependency in the ticket `## Context`, and implements none of the other half.

| Seam | Owned elsewhere | What `C1` delivers |
|---|---|---|
| SLA clock (`US-C1-17`) | `C7` — the clock arithmetic, targets and schedules | Pause/resume **signals** (`T-C1-57`) and the `apps/api` adapter that is the only object knowing both contexts (`T-C1-58`). **`incident` never imports `sla`** (`ARCHITECTURE.md` §8), proved by a lint probe in `T-C1-01`. |
| Configurable transitions (`US-C1-15`) | `C12` — the configuration mechanism; `C10` — the `StateModel` primitive | An instantiation of `StateModel` for Incidents (`T-C1-49`). **No workflow engine is built** (ADR-001). |
| Major Incident (`US-C1-20`) | `C13` — declaration, protocol, cadence, closure | The parent reference only (`T-C1-84`). **No `FR-MIM-*` ticket exists in this epic.** |
| Problem / Change / Release / CI (`US-C1-21`) | `C3`, `C4`, `C5`, `C6` — all Phase 2, none deployed | The typed reference and its explicit degradation (`T-C1-81`, `T-C1-85`). |
| Resolver Groups and escalation trigger (`US-C1-24/25/26`) | `C14` — groups and membership; `C7`/`C12` — raising the SLA threshold event (`FR-SLA-07`, `FR-WFL-05`) | Groups are **referenced, never defined**; `C1` executes the escalation **action** on receiving the event (`T-C1-78`). |
| Incident ↔ Service Request conversion (`US-C1-27`) | `C2` — the Service Request side | The Incident side only (`T-C1-93` → `T-C1-95`). The two must ship together; `FR-INC-14` is not satisfied by this epic alone. |
| Knowledge suggestions and deflection (`US-C1-29/30`) | `C9` — search, ranking, article model | A port call and the deflection recording (`T-C1-89`, `T-C1-91`). |
| Notifications and audit entries | `C16`, `C18` | `C1` **publishes** domain events post-commit; those epics record and deliver. No `C16` or `C18` ticket is written here. |

---

## Block A · Incident context foundation — 2 tickets · 4.5h · phase disputed 0/1 (F6)

Source: `ARCHITECTURE.md` §5.1 and §5.5; epic map § `C1`, *What actually remains*. Nothing story-derived compiles until this lands.

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-01](T-C1-01.md) | Scaffold the six `incident` libraries with their three-axis tags | — (foundation) | workspace scaffolding | — (shared) | 2.5h |
| [T-C1-02](T-C1-02.md) | `incident` schema namespace and the `IncidentModule` composition root | — (foundation) | infrastructure + app | backend-engineer | 2h |

**Phase note.** These two carry `disputed 0/1` rather than a phase of their own: foundation must land with whichever slice ships first, and that slice is the disputed one. They do not resolve **F6**; they inherit it.

---

## Block B · Base record and intake — 17 tickets · 46.5h · phase disputed 0/1 (F6)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-03](T-C1-03.md) | `TicketReference` policy and the `nextReference()` repository port | US-C1-05 | domain | backend-engineer | 2h |
| [T-C1-04](T-C1-04.md) | Reference-number sequence, unique constraint, immutability and migration | US-C1-05 | infrastructure | backend-engineer | 3h |
| [T-C1-05](T-C1-05.md) | `Incident` aggregate root and its creation invariants | US-C1-01 | domain | backend-engineer | 3h |
| [T-C1-06](T-C1-06.md) | TypeORM `Incident` entity, mapper, repository adapter and migration | US-C1-01 | infrastructure | backend-engineer | 3h |
| [T-C1-07](T-C1-07.md) | `LogIncidentUseCase` for a requester, reporter taken from the session | US-C1-01 | application | backend-engineer | 3h |
| [T-C1-08](T-C1-08.md) | Intake contracts and server-side rejection of priority-bearing fields | US-C1-01 | contracts + infrastructure | backend-engineer | 2.5h |
| [T-C1-09](T-C1-09.md) | `incident/data-access` — Incident API service and signal store | US-C1-01 | data-access | frontend-engineer | 2.5h |
| [T-C1-10](T-C1-10.md) | Requester intake form — plain language, mobile, WCAG 2.1 AA | US-C1-01 | feature + ui | frontend-engineer | 3h |
| [T-C1-11](T-C1-11.md) | `LogIncidentOnBehalfUseCase` — reporter, contact channel and acting actor | US-C1-02 | application | backend-engineer | 2.5h |
| [T-C1-12](T-C1-12.md) | Agent single-flow intake surface with no loss of typed data | US-C1-02 | feature | frontend-engineer | 3h |
| [T-C1-13](T-C1-13.md) | Reporter lookup with an explicit reporter-must-exist path | US-C1-02 | feature + data-access | frontend-engineer | 2.5h |
| [T-C1-14](T-C1-14.md) | `CompetitionSubject` value object over the twelve-value closed subject type | US-C1-03 | domain | backend-engineer | 2.5h |
| [T-C1-15](T-C1-15.md) | `CompetitionSubjectLookupPort`, SCMS anti-corruption adapter and free-text fallback | US-C1-03 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-16](T-C1-16.md) | Competition subject picker with an explicit unresolved-reference mode | US-C1-03 | feature + ui | frontend-engineer | 2.5h |
| [T-C1-17](T-C1-17.md) | `Attachment` entity, `AttachmentStoragePort` and migration | US-C1-04 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-18](T-C1-18.md) | Attachment upload use case: configured limits and visibility inheritance | US-C1-04 | application | backend-engineer | 3h |
| [T-C1-19](T-C1-19.md) | Attachment upload and list UI | US-C1-04 | feature + ui | frontend-engineer | 2.5h |

**Order note — `US-C1-05` before `US-C1-01`.** Reference numbering is built first even though it is the fifth story. `US-C1-05` requires the reference to be assigned **in the same transaction** as creation, so no Incident can ever exist without one; building intake first would create records that then need a retrofitted number and a data migration to give them one.

**Blocked — F29.** `T-C1-10`, `T-C1-14` and `T-C1-16` carry `blocked_by: F29`. `FR-INC-01` is ambiguous about whether a requester may set the **structured** competition subject. This backlog reads it as *requesters supply free text, agents set the structured reference*. If the Product Owner confirms the opposite, the requester form, the picker placement and the permission on the subject write all change. Everything else in the block is unaffected.

---

## Block C · Categorization — 6 tickets · 15.5h · phase disputed 0/1 (F6)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-20](T-C1-20.md) | Category → Subcategory → Item taxonomy aggregate | US-C1-06 | domain | backend-engineer | 2.5h |
| [T-C1-21](T-C1-21.md) | Taxonomy persistence, translatable labels, historical integrity and migration | US-C1-06 | infrastructure | backend-engineer | 3h |
| [T-C1-22](T-C1-22.md) | Taxonomy administration use cases and the in-use delete refusal | US-C1-06 | application | backend-engineer | 3h |
| [T-C1-23](T-C1-23.md) | Taxonomy administration screen | US-C1-06 | feature | frontend-engineer | 3h |
| [T-C1-24](T-C1-24.md) | Category picker on the intake and triage surfaces | US-C1-06 | ui + data-access | frontend-engineer | 2h |
| [T-C1-25](T-C1-25.md) | Categorization gate on exit from `New` | US-C1-07 | domain | backend-engineer | 2h |

**Order note — historical integrity ships with the schema.** `NFR-DAT-03` requires an Incident to keep the category identifier it was created with when a node is renamed. That is a persistence property — a reference to a stable identifier rather than a copied label — so it belongs to `T-C1-21` rather than to a later ticket that could only fix it by migration.

---

## Block D · Prioritization — 10 tickets · 26h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-26](T-C1-26.md) | Impact × Urgency matrix aggregate with the total-coverage invariant | US-C1-09 | domain | backend-engineer | 2.5h |
| [T-C1-27](T-C1-27.md) | Matrix persistence, configuration versioning, migration and fail-fast boot validation | US-C1-09 | infrastructure + app | backend-engineer | 3h |
| [T-C1-28](T-C1-28.md) | Matrix configuration screen | US-C1-09 | feature | frontend-engineer | 3h |
| [T-C1-29](T-C1-29.md) | `PriorityCalculator` domain service | US-C1-08 | domain | backend-engineer | 2.5h |
| [T-C1-30](T-C1-30.md) | Server-side derivation, the not-yet-derived state and `PriorityChanged` | US-C1-08 | domain + application | backend-engineer | 3h |
| [T-C1-31](T-C1-31.md) | Server-authoritative Priority in the web client | US-C1-08 | data-access + feature | frontend-engineer | 2h |
| [T-C1-32](T-C1-32.md) | Priority override domain rule: mandatory justification, derived value retained | US-C1-10 | domain | backend-engineer | 2.5h |
| [T-C1-33](T-C1-33.md) | `OverridePriorityUseCase`, permission gate, persistence and contracts | US-C1-10 | application + infrastructure | backend-engineer | 3h |
| [T-C1-34](T-C1-34.md) | Return to the derived value and the documented precedence rule | US-C1-10 | application | backend-engineer | 2h |
| [T-C1-35](T-C1-35.md) | Priority override UI with justification capture | US-C1-10 | feature + ui | frontend-engineer | 2.5h |

**Order note — `US-C1-09` before `US-C1-08`.** The matrix is configured before the derivation is written, reversing the story order. `US-C1-08` requires the derivation to fail fast when the matrix is missing or incomplete; writing the calculator first would mean writing it against a hardcoded matrix and then removing that matrix, which is the exact fallback `US-C1-09` forbids.

**Blocked — F30.** `T-C1-32` and `T-C1-34` carry `blocked_by: F30`. The override of `FR-INC-04` and the re-derivation of `FR-INC-05` can contradict each other and the PRD does not say which wins. The stories assume the override stands until an agent explicitly returns the Incident to the derived value. `T-C1-32` puts that rule in **one named predicate** so the decision is a one-line change, not a rewrite.

---

## Block E · Competition-in-progress flag — 13 tickets · 33h · phase 1 (MVP)

The signature behavior of the product. The epic map calls `C1` *the only epic that owns a domain-differentiating behavior* and names this one. `FR-INC-05` has five falsifiable properties and each has its own ticket: mandatory justification forced in the domain (`T-C1-39`), a configurable Impact uplift that **re-derives** Priority through the matrix and never writes a Priority (`T-C1-36`, `T-C1-40`), deterministic ceiling behavior (`T-C1-41`), set/change/clear audited with the causal chain in **one** event (`T-C1-42`, `T-C1-46`), and agent-only-never-automatic (`T-C1-43` → `T-C1-45`).

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-36](T-C1-36.md) | Configurable Impact uplift expressed against the Impact scale | US-C1-14 | domain | backend-engineer | 2h |
| [T-C1-37](T-C1-37.md) | Uplift persistence, version pinning, boot validation and audit event | US-C1-14 | infrastructure | backend-engineer | 2.5h |
| [T-C1-38](T-C1-38.md) | Uplift administration screen | US-C1-14 | feature | frontend-engineer | 2.5h |
| [T-C1-39](T-C1-39.md) | `CompetitionImpactFlag` value object with mandatory justification | US-C1-11 | domain | backend-engineer | 2.5h |
| [T-C1-40](T-C1-40.md) | The uplift raises assessed Impact and Priority is re-derived through the matrix | US-C1-11 | domain | backend-engineer | 2.5h |
| [T-C1-41](T-C1-41.md) | Deterministic behavior at the Impact-scale ceiling | US-C1-11 | domain | backend-engineer | 2h |
| [T-C1-42](T-C1-42.md) | One causal event carrying flag, justification, Impact and Priority transitions | US-C1-11 | domain + application | backend-engineer | 2.5h |
| [T-C1-43](T-C1-43.md) | `SetCompetitionInProgressFlagUseCase` — the only write path, agent-authorized | US-C1-12 | application | backend-engineer | 3h |
| [T-C1-44](T-C1-44.md) | Server-side rejection of the flag field on every requester-reachable path | US-C1-12 | contracts + infrastructure | backend-engineer | 2.5h |
| [T-C1-45](T-C1-45.md) | No automated write path exists — the system-actor refusal proof | US-C1-12 | domain + application | backend-engineer | 3h |
| [T-C1-46](T-C1-46.md) | Clearing the flag removes the uplift and re-derives Priority | US-C1-13 | domain + application | backend-engineer | 3h |
| [T-C1-47](T-C1-47.md) | Flag and Priority-override interaction rule, with its explicit test | US-C1-13 | domain | backend-engineer | 2h |
| [T-C1-48](T-C1-48.md) | Flag set, change and clear UI with justification and visible history | US-C1-13 | feature + ui | frontend-engineer | 3h |

**Order note — `US-C1-14` before `US-C1-11`.** The uplift is configured before the flag applies it. `US-C1-11` requires the assessed Impact to be raised **by the configured amount**; with no configuration the flag would be written against a constant and then rewritten, and the ceiling question of **F24** would not even be well-posed.

**`T-C1-45` is the most important ticket in the epic.** `US-C1-12` makes *never automatically* a falsifiable property rather than a comment: no automated code path writes the flag, the write is refused for a system actor, and a caller enumeration proves there is exactly one caller. `T-C1-78` — the SLA-threshold escalation, the one automated path in this epic that touches an Incident — is explicitly covered by that assertion.

**Blocked — F24 (`T-C1-41`) and F30 (`T-C1-47`).** The ceiling behavior is undefined at the top of the Impact scale: nobody has said whether the uplift clamps or the flag is refused. The ticket forbids a silent no-op and forces a deterministic typed outcome, but **does not choose** — that is a Product Owner decision. `T-C1-47` consumes the same disputed precedence predicate as block D.

---

## Block F · Lifecycle — 10 tickets · 27h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-49](T-C1-49.md) | Incident state model over the shared `StateModel` primitive | US-C1-15 | domain | backend-engineer | 3h |
| [T-C1-50](T-C1-50.md) | Transition-rule configuration: persistence, migration and hot reload | US-C1-15 | infrastructure | backend-engineer | 3h |
| [T-C1-51](T-C1-51.md) | `TransitionIncidentUseCase` with typed refusal and terminal-state protection | US-C1-15 | application | backend-engineer | 2.5h |
| [T-C1-52](T-C1-52.md) | Lifecycle actions on the agent Incident view | US-C1-15 | feature + ui | frontend-engineer | 3h |
| [T-C1-53](T-C1-53.md) | Resolution-code list: configurable, stable identifiers, translatable labels | US-C1-16 | domain + infrastructure | backend-engineer | 2.5h |
| [T-C1-54](T-C1-54.md) | `ResolveIncidentUseCase` gated on resolution code and notes | US-C1-16 | domain + application | backend-engineer | 2.5h |
| [T-C1-55](T-C1-55.md) | Re-resolution after a reopen, with the previous resolution retained | US-C1-16 | domain | backend-engineer | 2h |
| [T-C1-56](T-C1-56.md) | Resolution form with code selection and notes | US-C1-16 | feature + ui | frontend-engineer | 2.5h |
| [T-C1-57](T-C1-57.md) | Clock pause and resume signals, with per-state pause-behavior configuration | US-C1-17 | domain + application + infrastructure | backend-engineer | 3h |
| [T-C1-58](T-C1-58.md) | `SlaPolicyAdapter` pause/resume wiring and restart-safe accounting | US-C1-17 | app | backend-engineer | 3h |

**Boundary note — the `sla` seam.** `T-C1-57` publishes **signals only**; `T-C1-58` is the `apps/api` adapter, *the only object that knows both contexts* (`ARCHITECTURE.md` §8). The clock arithmetic, the support schedule and the target recalculation are `C7` and **are not written here**. `T-C1-01` includes a lint probe asserting that no `scope:incident` project can import `scope:sla`, so the boundary is enforced by the build rather than by review.

---

## Block G · Closure — 6 tickets · 15h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-59](T-C1-59.md) | Confirmation window opened at resolution through `ClockPort` | US-C1-18 | domain | backend-engineer | 2h |
| [T-C1-60](T-C1-60.md) | Confirm and reject use cases, with rejection marked as a reopen | US-C1-18 | application | backend-engineer | 3h |
| [T-C1-61](T-C1-61.md) | Requester-only authorization and the expired-window refusal | US-C1-18 | application | backend-engineer | 2.5h |
| [T-C1-62](T-C1-62.md) | Requester confirm / reject surface on the portal | US-C1-18 | feature + data-access | frontend-engineer | 2.5h |
| [T-C1-63](T-C1-63.md) | Auto-close rule, configurable period and system-actor attribution | US-C1-19 | application + infrastructure | backend-engineer | 3h |
| [T-C1-64](T-C1-64.md) | API-E2E: the auto-close boundary on a deterministic clock | US-C1-19 | e2e (`apps/api-e2e`) | — (backend) | 2h |

**Note — this block discharges a `C10` deferral.** `C10` finding **F15** recorded that `FR-IAM-03` could only be proved at predicate level there, because the records it filters belong to `C1` and `C2`. `T-C1-61` is the Incident-side end-to-end proof.

---

## Block H · Collaboration — 7 tickets · 18.5h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-65](T-C1-65.md) | `IncidentEntry`, `NoteVisibility` and the internal-by-default rule, with persistence | US-C1-22 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-66](T-C1-66.md) | Add-entry use cases for agent and requester, with visibility authorization | US-C1-22 | application | backend-engineer | 3h |
| [T-C1-67](T-C1-67.md) | Internal work notes absent from every outbound payload | US-C1-22 | application + infrastructure | backend-engineer | 3h |
| [T-C1-68](T-C1-68.md) | Entry-type immutability after creation | US-C1-22 | domain | backend-engineer | 1.5h |
| [T-C1-69](T-C1-69.md) | Agent entry timeline with a visible public / internal distinction | US-C1-22 | feature + ui | frontend-engineer | 3h |
| [T-C1-70](T-C1-70.md) | Requester comment thread — mobile, WCAG 2.1 AA | US-C1-23 | feature + ui | frontend-engineer | 3h |
| [T-C1-71](T-C1-71.md) | API-E2E: a requester never receives an internal work note on any channel | US-C1-22 | e2e (`apps/api-e2e`) | — (backend) | 2h |

**Blocked — F27 (`T-C1-68`).** Nothing says whether an entry type can be changed after creation. Internal made public is a **disclosure**; public made internal is a **retraction** of something the requester may already have been notified about. The story recommends immutability with correction by a new entry; the ticket builds that recommendation in one place and names the finding, but the rule is the Product Owner call.

---

## Block I · Assignment and escalation — 7 tickets · 18.5h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-72](T-C1-72.md) | `ResolverAssignment` and the append-only assignment history | US-C1-24 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-73](T-C1-73.md) | `ReassignIncidentUseCase` and the `IncidentAssigned` event | US-C1-24 | application + domain | backend-engineer | 2.5h |
| [T-C1-74](T-C1-74.md) | Reassignment UI showing the full assignment path | US-C1-24 | feature + ui | frontend-engineer | 2.5h |
| [T-C1-75](T-C1-75.md) | Functional escalation as a distinct kind, with its permission gate | US-C1-25 | domain + application | backend-engineer | 3h |
| [T-C1-76](T-C1-76.md) | Escalated state visible in the agent work list | US-C1-25 | feature + ui | frontend-engineer | 2h |
| [T-C1-77](T-C1-77.md) | Hierarchical escalation to the management contact | US-C1-26 | domain + application | backend-engineer | 2.5h |
| [T-C1-78](T-C1-78.md) | SLA-threshold escalation as a system-actor action, idempotent per threshold | US-C1-26 | application | backend-engineer | 3h |

**Boundary note.** Resolver Groups and management contacts are `C14` / `C10` and are **referenced through a port bound at the composition root, never imported**. Raising the SLA threshold event is `FR-SLA-07` (`C7`) and `FR-WFL-05` (`C12`); `T-C1-78` only performs the **action** on receiving it — and is one of the automated paths `T-C1-45` asserts can never touch the competition flag.

---

## Block J · First Contact Resolution — 2 tickets · 5.5h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-79](T-C1-79.md) | FCR derived from assignment history and resolving tier | US-C1-32 | domain | backend-engineer | 2.5h |
| [T-C1-80](T-C1-80.md) | FCR recorded at resolution as a derived, non-settable fact, including the reopen rule | US-C1-32 | application + infrastructure | backend-engineer | 3h |

**Order note — FCR after block I, not at its story number.** `US-C1-32` is the last story but FCR is **derived from the assignment history** of `US-C1-24`. It cannot be built before `T-C1-72` exists, so it sits here rather than at the end of the epic.

**Blocked — F28.** `FR-INC-18` never defines *the first interaction*, so FCR has no testable definition. Both tickets deliver the two unambiguous conditions — no reassignment, resolved by L1 — and isolate the interaction boundary behind one predicate that returns an explicit **undefined** outcome rather than a guessed one. `FR-INC-18` cannot be claimed satisfied until the Product Owner settles it.

---

## Block K · Linking — 5 tickets · 13h · phase 1 (MVP)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-81](T-C1-81.md) | `IncidentLink` — typed reference, direction and cycle prevention | US-C1-20 | domain | backend-engineer | 3h |
| [T-C1-82](T-C1-82.md) | Link persistence, migration and bidirectional read | US-C1-20 | infrastructure | backend-engineer | 2.5h |
| [T-C1-83](T-C1-83.md) | Link and unlink use cases with permission and audit events | US-C1-20 | application | backend-engineer | 2.5h |
| [T-C1-84](T-C1-84.md) | Parent Major Incident reference — Incident side only | US-C1-20 | domain + application | backend-engineer | 2h |
| [T-C1-85](T-C1-85.md) | Link surface with explicit degradation for undeployed target kinds | US-C1-21 | feature + ui | frontend-engineer | 3h |

**Boundary note — `C13` and the Phase 2 contexts.** `T-C1-84` stores the parent Major Incident reference and nothing else: declaration, protocol, cadence, propagation and closure gating are `FR-MIM-01` → `FR-MIM-06` and belong to `C13`. **No `FR-MIM-*` ticket exists in this epic.** `T-C1-85` degrades explicitly for Problem, Change, Release and Configuration Item targets, whose contexts (`C3`, `C4`, `C5`, `C6`) are Phase 2 and undeployed.

---

## Block L · Scope rule at intake — 3 tickets · 8.5h · phase unphased (F9)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-86](T-C1-86.md) | Scope-detection rules as configuration data | US-C1-28 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-87](T-C1-87.md) | Intake evaluation: reject or flag before the record is created, with the redirection recorded | US-C1-28 | application | backend-engineer | 3h |
| [T-C1-88](T-C1-88.md) | Redirect surface at intake with the offered path | US-C1-28 | feature + ui | frontend-engineer | 2.5h |

**Blocked — F25.** `FR-INC-15` says *reject **or** flag* without deciding, and never says where the detection rules live. This backlog assumes both are configuration; the assumption needs Product Owner confirmation, and hardcoding either would make the mitigation of risk **R1** unmaintainable.

**Sequence risk — F23, carried into the risk list below.** This block is the declared mitigation of the highest-rated product risk, and it is **unphased while the intake it protects is Phase 1**.

---

## Block M · Knowledge suggestions and deflection — 4 tickets · 11h · phase unphased (F9)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-89](T-C1-89.md) | `KnowledgeSuggestionPort` and its degraded-availability contract | US-C1-29 | domain + infrastructure | backend-engineer | 2.5h |
| [T-C1-90](T-C1-90.md) | Suggestions at intake — keyboard-navigable, announced, non-blocking | US-C1-29 | feature + ui | frontend-engineer | 3h |
| [T-C1-91](T-C1-91.md) | `DeflectionRecord` — domain, persistence, minimal-data rule and the recording use case | US-C1-30 | domain + application + infrastructure | backend-engineer | 3h |
| [T-C1-92](T-C1-92.md) | Abandonment detection at intake and the suggestions-shown marker | US-C1-30 | feature + data-access | frontend-engineer | 2.5h |

**Boundary note.** Search, ranking and the article model are `C9`. `C1` calls a port and records the deflection; **no `C9` ticket is written here**, and the null adapter of `T-C1-89` keeps intake working while `C9` does not exist (`NFR-AVL-03`).

---

## Block N · Phase 3 — 6 tickets · 16h · phase 3 (§14.5)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C1-93](T-C1-93.md) | Conversion domain rule: reference and history preserved, state-equivalence refusal | US-C1-27 | domain | backend-engineer | 3h |
| [T-C1-94](T-C1-94.md) | `ConvertIncidentUseCase` — Incident side only, with the conversion event | US-C1-27 | application | backend-engineer | 3h |
| [T-C1-95](T-C1-95.md) | Conversion action in the agent UI, with the `C2` dependency declared | US-C1-27 | feature + ui | frontend-engineer | 2h |
| [T-C1-96](T-C1-96.md) | Duplicate-detection query: same service and subject inside a configurable window | US-C1-31 | domain + infrastructure | backend-engineer | 3h |
| [T-C1-97](T-C1-97.md) | Detection as proposals: agent accept and dismiss recorded, dismissals not repeated | US-C1-31 | application | backend-engineer | 2.5h |
| [T-C1-98](T-C1-98.md) | Duplicate-proposal UI at logging and triage | US-C1-31 | feature + ui | frontend-engineer | 2.5h |

**Boundary note — `FR-INC-14` is not deliverable by this epic alone.** `US-C1-27` states that the Service Request side belongs to `C2` and *the two must ship together*. `T-C1-94` binds a refusing stub when `C2` is absent, so no operator can convert into nothing; the requirement stays unsatisfied until `C2` ships its half, and that must be reported at the epic review rather than quietly closed.

---

## Sequencing risks carried forward

Two findings are about **phasing**, not implementation. They block nothing, and they are recorded here because the sequence they imply is a Product Owner decision that this backlog cannot make.

| Finding | Risk to the sequence |
|---|---|
| **F23** | **The mitigation of the top product risk is unphased while the thing it protects ships in Phase 1.** `FR-INC-15` (block L) guards the intake surface against sport-operations demand; intake itself (block B) is Phase 1. If the scope rule arrives after intake, risk **R1** has already materialized — the demand is in the backlog and the precedent is set. `US-C1-28` is written to ship **with** intake. Recommendation to the Product Owner: phase `FR-INC-15` into Phase 1 alongside `FR-INC-01`. |
| **F26** | **Deflection recording is being phased apart from deflection measurement.** `FR-INC-16` requires recording at intake (block M), while §14.5 places `FR-KNW-06` deflection *measurement* in Phase 3 and the intake-facing `C9` articles in Phase 1. `T-C1-89`/`T-C1-90` (suggestions) and `T-C1-91`/`T-C1-92` (recording) are separate tickets under separate stories so the two halves can be phased independently. The Product Owner decides whether recording rides with Phase 1 suggestions or waits for Phase 3 measurement. |

---

## Totals

| Block | Tickets | Hours | Phase |
|---|--:|--:|---|
| A · Incident context foundation | 2 | 4.5 | disputed 0/1 |
| B · Base record and intake | 17 | 46.5 | disputed 0/1 |
| C · Categorization | 6 | 15.5 | disputed 0/1 |
| D · Prioritization | 10 | 26.0 | 1 (MVP) |
| E · Competition-in-progress flag | 13 | 33.0 | 1 (MVP) |
| F · Lifecycle | 10 | 27.0 | 1 (MVP) |
| G · Closure | 6 | 15.0 | 1 (MVP) |
| H · Collaboration | 7 | 18.5 | 1 (MVP) |
| I · Assignment and escalation | 7 | 18.5 | 1 (MVP) |
| J · First Contact Resolution | 2 | 5.5 | 1 (MVP) |
| K · Linking | 5 | 13.0 | 1 (MVP) |
| L · Scope rule at intake | 3 | 8.5 | unphased |
| M · Knowledge suggestions and deflection | 4 | 11.0 | unphased |
| N · Phase 3 | 6 | 16.0 | 3 (§14.5) |
| **Total** | **98** | **258.5** | |

**By phase.** disputed 0/1 (**F6**): 25 tickets · 66.5h · **the cut is not made here.** Phase 1 (MVP): 60 tickets · 156.5h. Unphased (**F9**): 7 tickets · 19.5h. Phase 3 (§14.5): 6 tickets · 16h.

**Foundation** (`story: —`): 2 tickets · 4.5h — the six `incident` libraries and the context schema/module wiring. Everything else is `C10`.

**Blocked:** 12 tickets — **F24** `T-C1-41` · **F25** `T-C1-86`, `T-C1-87` · **F27** `T-C1-68` · **F28** `T-C1-79`, `T-C1-80` · **F29** `T-C1-10`, `T-C1-14`, `T-C1-16` · **F30** `T-C1-32`, `T-C1-34`, `T-C1-47`.

**By agent:** `backend-engineer` 69 · `frontend-engineer` 26 · `—` 3. The three are the six-library scaffolding, which spans both platforms, and two API-E2E specs (`T-C1-64`, `T-C1-71`) — e2e-harness work on the backend platform (`apps/api-e2e`, `platform:backend`, `type:e2e`), which neither dev agent owns.
