# Tickets — C10 · Identity & Access Management

> Sources: `docs/backlog/C10/user-stories.md` (16 stories, all greenfield) · `docs/backlog/epic-map.md` (§ `C10`, § **Foundation ownership (priced once)**) · `CLAUDE.md` §3 · `docs/product/ARCHITECTURE.md` §5, §9 · PRD §7.10, §4.3, §14.2
> Test plan: [`../test-plan.md`](../test-plan.md)

**67 tickets · 170h · none over the 3h cap.**
18 tickets are **foundation** work with `story: —` — the whole workspace, priced into `C10` by the epic map and deliberately left storyless by the Business Analyst (finding **F14**).
5 tickets are **blocked**: 4 by **F16** (nobody has enumerated which operations are *privileged*), 1 by **F17** (nobody has decided where a denied authorization is recorded).

The numbering **is** the implementation order. `T-C10-01` is built first. Where the order departs from the story sequence, the reason is stated below the affected block.

## Reading a ticket

| Field | Meaning |
|---|---|
| `story` | The `US-C10-nn` it serves, or `—` for foundation work |
| `foundation` | `true` when no story backs it; the owning source is cited in its `## Context` |
| `layer` | DDD layer per `ARCHITECTURE.md` §5.3 |
| `platform` | `backend` / `frontend` / `shared` — stated for every ticket, and load-bearing where `agent` is `—` |
| `agent` | `backend-engineer`, `frontend-engineer`, or `—` for workspace tooling and E2E test code, which neither dev agent owns |
| `phase` | `0` per PRD §14.2, or `unphased` where the PRD assigns none (finding **F9**) |
| `blocked_by` | The finding that must be resolved before the ticket is real work |

---

## Block A · Workspace foundation — 17 tickets · 45h · all `foundation: true`, phase 0

Source: epic map, **Foundation ownership (priced once)**. Nothing else in this epic — or in the other 18 epics — compiles until this block lands.

| # | Title | Layer | Agent | Est. |
|---|---|---|---|---:|
| [T-C10-01](T-C10-01.md) | Bootstrap the Nx workspace with pnpm and strict TypeScript | workspace tooling | — (shared) | 3h |
| [T-C10-02](T-C10-02.md) | ESLint 9 flat config, Prettier 3 and the three-axis tag scheme | workspace tooling | — (shared) | 2h |
| [T-C10-03](T-C10-03.md) | Encode the type constraint matrix and the scope/platform rules | workspace tooling | — (shared) | 3h |
| [T-C10-04](T-C10-04.md) | Scaffold `apps/api` — NestJS 11 composition root with validated configuration | app | backend-engineer | 3h |
| [T-C10-05](T-C10-05.md) | Scaffold `apps/web` — Angular 20 standalone shell | app | frontend-engineer | 3h |
| [T-C10-06](T-C10-06.md) | Scaffold `apps/api-e2e` and `apps/web-e2e` — Cypress 15 + Cucumber harnesses | e2e harness | — (shared) | 3h |
| [T-C10-07](T-C10-07.md) | `libs/shared/util` — pure helper library | util | backend-engineer | 1h |
| [T-C10-08](T-C10-08.md) | `libs/shared/domain` — identity and ticket kernel primitives | domain | backend-engineer | 3h |
| [T-C10-09](T-C10-09.md) | `libs/shared/domain` — `DomainEvent`, `EventPublisherPort` and `ClockPort` | domain | backend-engineer | 2h |
| [T-C10-10](T-C10-10.md) | `libs/shared/domain` — `StateModel` and transition rules | domain | backend-engineer | 2.5h |
| [T-C10-11](T-C10-11.md) | `libs/shared/contracts` — baseline DTO, enum and error-code surface | contracts | backend-engineer | 2h |
| [T-C10-12](T-C10-12.md) | `libs/shared/ui` — design tokens and theming layer | ui | frontend-engineer | 3h |
| [T-C10-13](T-C10-13.md) | `libs/shared/ui` — form primitives | ui | frontend-engineer | 3h |
| [T-C10-14](T-C10-14.md) | `libs/shared/ui` — overlay primitive, focus trap/restore and `aria-live` announcer | ui | frontend-engineer | 3h |
| [T-C10-15](T-C10-15.md) | `libs/shared/ui` — table, badge and state primitives | ui | frontend-engineer | 3h |
| [T-C10-16](T-C10-16.md) | PostgreSQL 16 provisioning and the TypeORM data source | infrastructure | backend-engineer | 2.5h |
| [T-C10-17](T-C10-17.md) | Base migration chain and the bootstrap migration | infrastructure | backend-engineer | 3h |

**Order note.** The tag scheme (`T-C10-02`) precedes the boundary matrix (`T-C10-03`) because the matrix is expressed in those tags, and both precede every project so that the first illegal import fails the build rather than review. `libs/shared/ui` is four tickets because with no third-party component library every primitive is hand-built; it lands before the first screen (`T-C10-31`), which is exactly why the epic map prices the design system into `C10`.

**Not priced here.** Structured logging, health probes, Swagger, the `nestjs-i18n` bootstrap, the Transloco catalogue and the a11y baseline belong to the `NFR` epic standalone slice (epic map, *Suggested drill order*). Tickets that consume them declare the dependency instead of rebuilding it.

---

## Block B · Identity core — 17 tickets · 41.5h · phase 0

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C10-18](T-C10-18.md) | Scaffold the five `identity-access` libraries with their tags | — (foundation) | workspace scaffolding | — (shared) | 2h |
| [T-C10-19](T-C10-19.md) | `User` aggregate and identity value objects | US-C10-01 | domain | backend-engineer | 3h |
| [T-C10-20](T-C10-20.md) | `IdentityProviderPort` and the domain identity result | US-C10-09 | domain | backend-engineer | 2h |
| [T-C10-21](T-C10-21.md) | `UserRepositoryPort`, the TypeORM user entity, mapper and migration | US-C10-01 | infrastructure | backend-engineer | 3h |
| [T-C10-22](T-C10-22.md) | Local-credential adapter with bcrypt verification | US-C10-09 | infrastructure | backend-engineer | 2.5h |
| [T-C10-23](T-C10-23.md) | Bind exactly one `IdentityProviderPort` adapter from validated configuration | US-C10-09 | app | backend-engineer | 2h |
| [T-C10-24](T-C10-24.md) | `Session` aggregate, `SessionRepositoryPort`, entity and migration | US-C10-03 | domain + infrastructure | backend-engineer | 3h |
| [T-C10-25](T-C10-25.md) | `AuthenticateUser` use case | US-C10-01 | application | backend-engineer | 3h |
| [T-C10-26](T-C10-26.md) | `TokenIssuerPort` and the `@nestjs/jwt` adapter | US-C10-01 | domain port + infrastructure | backend-engineer | 2.5h |
| [T-C10-27](T-C10-27.md) | Sign-in HTTP adapter and the sign-in contracts | US-C10-01 | infrastructure + contracts | backend-engineer | 2.5h |
| [T-C10-28](T-C10-28.md) | Global JWT guard with opt-in exemption and session validation | US-C10-02 | infrastructure | backend-engineer | 3h |
| [T-C10-29](T-C10-29.md) | API-E2E proof that the API exposes no anonymous surface | US-C10-02 | e2e (`apps/api-e2e`) | — (backend) | 2h |
| [T-C10-30](T-C10-30.md) | Angular auth interceptor, token store and router guard | US-C10-02 | data-access + app | frontend-engineer | 3h |
| [T-C10-31](T-C10-31.md) | Sign-in screen | US-C10-01 | feature | frontend-engineer | 3h |
| [T-C10-32](T-C10-32.md) | `SignOutSession` use case | US-C10-03 | application | backend-engineer | 2h |
| [T-C10-33](T-C10-33.md) | Sign-out HTTP adapter and contract | US-C10-03 | infrastructure + contracts | backend-engineer | 1.5h |
| [T-C10-34](T-C10-34.md) | Web sign-out action | US-C10-03 | feature + data-access | frontend-engineer | 1.5h |

**Order note — `T-C10-24` before sign-in.** `US-C10-03` requires the guard to validate a **session record**, not just a token signature. Building sign-in first would issue tokens with no session to validate and force a rewrite of both the use case and the guard, so the `Session` aggregate is pulled forward ahead of its own story.

**Order note — the port before the adapter.** `US-C10-09` is scheduled inside phase 0 even though `FR-IAM-04` is unphased, because the story also traces `FR-IAM-01`: the port and the **local** adapter are what make phase-0 authentication work. Only the SSO half (`US-C10-10`, block H) stays unphased.

---

## Block C · RBAC — 6 tickets · 15h · phase 0

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C10-35](T-C10-35.md) | `Role` and `Permission` domain model with the PRD §4.3 catalog | US-C10-04 | domain | backend-engineer | 3h |
| [T-C10-36](T-C10-36.md) | Role and permission persistence and the eight-role seed migration | US-C10-04 | infrastructure | backend-engineer | 3h |
| [T-C10-37](T-C10-37.md) | Translatable role labels with stable identifiers | US-C10-04 | infrastructure (i18n) | backend-engineer | 1.5h |
| [T-C10-38](T-C10-38.md) | Deny-by-default authorization predicates | US-C10-05 | domain | backend-engineer | 3h |
| [T-C10-39](T-C10-39.md) | `Actor` assembly with per-request server-side permission resolution | US-C10-05 | application + app | backend-engineer | 3h |
| [T-C10-40](T-C10-40.md) | Map `AuthorizationError` to `403` in the API exception filter | US-C10-05 | infrastructure | backend-engineer | 1.5h |

**Order note — one deliberate departure from the story blocks.** `US-C10-12` requires a revoked role to lose its power immediately *because permissions are resolved server-side per request*. That is the same mechanism `US-C10-05` needs in order to hand a fully resolved `Actor` to a use case. Built in block E it would mean writing the guard twice — once trusting token claims, then rewriting it — so it is built once here, in `T-C10-39`, which is why that ticket carries `FR-IAM-05` alongside `FR-IAM-02`. Block E then owns only the revocation itself and its safeguard.

---

## Block D · Record visibility — 6 tickets · 14.5h · phase 0

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C10-41](T-C10-41.md) | Requester-scoped visibility predicate and the `ScopeRestriction` result | US-C10-06 | domain | backend-engineer | 3h |
| [T-C10-42](T-C10-42.md) | Not-found-indistinguishable outcome on direct-identifier access | US-C10-06 | application | backend-engineer | 1.5h |
| [T-C10-43](T-C10-43.md) | Competition and league scope grants in the domain | US-C10-07 | domain | backend-engineer | 2h |
| [T-C10-44](T-C10-44.md) | TypeORM persistence and migration for scope grants | US-C10-07 | infrastructure | backend-engineer | 2.5h |
| [T-C10-45](T-C10-45.md) | Organizer competition-scoped visibility rule | US-C10-07 | domain | backend-engineer | 2.5h |
| [T-C10-46](T-C10-46.md) | League Administrator scope resolved through the league | US-C10-08 | domain | backend-engineer | 3h |

**Scope note — finding F15.** `FR-IAM-03` is observable only through records that `C10` does not own. Every ticket here is written against the **predicate and the scope restriction it yields**, provable by Jest unit tests with no ticket aggregate present. End-to-end proof over real Incidents and Service Requests lands with `C1` and `C2` and must not be expected of this epic acceptance run.

---

## Block E · Role administration — 9 tickets · 23.5h · phase 0

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C10-47](T-C10-47.md) | `AssignRoleToUser` use case, idempotent and authorization-guarded | US-C10-11 | application | backend-engineer | 3h |
| [T-C10-48](T-C10-48.md) | Role-assignment contract and validated API adapter | US-C10-11 | infrastructure + contracts | backend-engineer | 2.5h |
| [T-C10-49](T-C10-49.md) | `identity-access/data-access` — users and roles store | US-C10-11 | data-access | frontend-engineer | 2.5h |
| [T-C10-50](T-C10-50.md) | Role administration screen | US-C10-11 | feature | frontend-engineer | 3h |
| [T-C10-51](T-C10-51.md) | `RevokeRoleFromUser` use case with the last-administrator safeguard | US-C10-12 | application | backend-engineer | 3h |
| [T-C10-52](T-C10-52.md) | Role-revocation API adapter and contract | US-C10-12 | infrastructure + contracts | backend-engineer | 1.5h |
| [T-C10-53](T-C10-53.md) | Web revoke action and the explicit no-entitlements state | US-C10-12 | feature + data-access | frontend-engineer | 2.5h |
| [T-C10-54](T-C10-54.md) | `RoleAssigned` and `RoleRevoked` domain events | US-C10-13 | domain | backend-engineer | 2.5h |
| [T-C10-55](T-C10-55.md) | Post-commit event dispatch with failure isolation | US-C10-13 | application + app | backend-engineer | 3h |

**Boundary with `C18` — finding F5.** `US-C10-13` stops at **publishing** the domain event. Persisting and rendering it as an `AuditEntry` is `C18` (`FR-AUD-01`, `FR-AUD-02`) and **no `C18` ticket is written here**. `T-C10-54` and `T-C10-55` declare the event shape and the post-commit dispatch that `C18` subscribes to, and are complete without that subscriber — their acceptance scenarios use a test subscriber. `C10` publishes; `C18` records.

---

## Block F · Session lifecycle — 6 tickets · 16h · unphased (F9)

| # | Title | Story | Layer | Agent | Est. | Blocked |
|---|---|---|---|---|---:|---|
| [T-C10-56](T-C10-56.md) | Configurable inactivity window with fail-fast validation | US-C10-14 | infrastructure | backend-engineer | 1.5h | |
| [T-C10-57](T-C10-57.md) | Sliding inactivity expiry through `ClockPort` | US-C10-14 | domain + application | backend-engineer | 3h | |
| [T-C10-58](T-C10-58.md) | Web inactivity warning with a stay-signed-in action | US-C10-14 | feature + data-access | frontend-engineer | 3h | |
| [T-C10-59](T-C10-59.md) | Privileged-operation declaration and the step-up validity window | US-C10-15 | domain + application | backend-engineer | 3h | **F16** |
| [T-C10-60](T-C10-60.md) | Step-up re-authentication use case and outcome | US-C10-15 | application + infrastructure | backend-engineer | 3h | **F16** |
| [T-C10-61](T-C10-61.md) | Web step-up re-authentication prompt | US-C10-15 | feature + data-access | frontend-engineer | 2.5h | **F16** |

**Phase note — finding F9.** `FR-IAM-06` is assigned to no phase in PRD §14, even though it is a security control (inactivity termination and step-up re-authentication). That is a sequencing decision for the Product Owner; it is not made here, so these tickets carry `phase: unphased`.

**Blocking note — finding F16.** Neither the PRD nor the architecture enumerates which operations are *privileged*. `US-C10-15` proposes a set — role assignment and revocation, plus Admin Console configuration of catalog, taxonomy, SLA policies, workflows and notification templates — explicitly as an assumption of this backlog. The **Product Owner** must confirm or replace it. The mechanism (`T-C10-59` to `T-C10-61`) is buildable against a provisional registry; the membership is not decided here, and `FR-IAM-06` is not testable end to end until it is.

---

## Block G · Denied-authorization recording — 2 tickets · 5h · unphased (F9)

| # | Title | Story | Layer | Agent | Est. | Blocked |
|---|---|---|---|---|---:|---|
| [T-C10-62](T-C10-62.md) | `AuthorizationDenial` record produced by the deciding predicate | US-C10-16 | domain + application | backend-engineer | 2.5h | **F16** |
| [T-C10-63](T-C10-63.md) | Denial sink adapter and its destination | US-C10-16 | infrastructure — destination undecided | backend-engineer | 2.5h | **F17** |

**`T-C10-63` is not implementable as written.** `FR-IAM-07` never says where a denial is recorded, and it does not fit the `AuditEntry` shape of `FR-AUD-02` — no previous value, no new value, no natural record reference. The **Architect** must choose between a `C18` audit entry and a dedicated `identity-access` security log, with the Product Owner confirming retention and access. If the decision is deferred, `US-C10-16` ships only as far as `T-C10-62` — record produced, port unbound — and `FR-IAM-07` remains unsatisfied. That state must be reported, not silently accepted.

---

## Block H · SCMS SSO — 4 tickets · 9.5h · unphased (F9)

| # | Title | Story | Layer | Agent | Est. |
|---|---|---|---|---|---:|
| [T-C10-64](T-C10-64.md) | SCMS SSO adapter behind `IdentityProviderPort` | US-C10-10 | infrastructure | backend-engineer | 3h |
| [T-C10-65](T-C10-65.md) | Just-in-time provisioning with the default least-privilege role | US-C10-10 | application | backend-engineer | 3h |
| [T-C10-66](T-C10-66.md) | Profile refresh preserving locally assigned roles | US-C10-10 | application | backend-engineer | 2h |
| [T-C10-67](T-C10-67.md) | Typed identity-provider-unreachable error | US-C10-10 | infrastructure + apps/api | backend-engineer | 1.5h |

**Last by design.** `FR-IAM-04` is a `S` (Should) requirement, is unphased in PRD §14 (finding **F9**), and depends on the SCMS identity provider being available (PRD assumption A2, dependency D1). Block B already built the seam, so this block is an adapter swap selected by configuration — no use case changes.

---

## Totals

| Block | Tickets | Hours | Phase |
|---|--:|--:|---|
| A · Workspace foundation | 17 | 45.0 | 0 |
| B · Identity core | 17 | 41.5 | 0 |
| C · RBAC | 6 | 15.0 | 0 |
| D · Record visibility | 6 | 14.5 | 0 |
| E · Role administration | 9 | 23.5 | 0 |
| F · Session lifecycle | 6 | 16.0 | unphased |
| G · Denied-authorization recording | 2 | 5.0 | unphased |
| H · SCMS SSO | 4 | 9.5 | unphased |
| **Total** | **67** | **170.0** | |

Foundation (`story: —`): **18 tickets · 47h** — all of block A plus `T-C10-18`. Phase 0: 55 tickets · 139.5h. Unphased: 12 tickets · 30.5h.

By agent: `backend-engineer` 48 · `frontend-engineer` 13 · `—` 6. The six are three workspace-tooling tickets, the two scaffolding tickets that span both platforms, and one API-E2E spec — work that belongs to neither dev agent, so each names its layer and platform instead.
