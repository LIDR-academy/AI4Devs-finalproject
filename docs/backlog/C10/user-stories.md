# User Stories — C10 · Identity & Access Management

> Source: `docs/backlog/epic-map.md` (generated 2026-09-06, HEAD `815672f`; repository HEAD at drill time `57b3837`, epic map unchanged since the stamp) · PRD §7.10, §4 · `CLAUDE.md` §3 · `docs/product/ARCHITECTURE.md` §5, §9
> Scope: 7 requirements remaining · 16 stories · greenfield 16 · gap 0 · defect 0
> Requirements skipped as already built: none — every `FR-IAM-*` is 🔴 Not built, so the epic map's build-state invariant (`remaining == total`) holds and no requirement is discarded.
> `ReadTheCode()` was a no-op: no requirement is 🟡 / ⚫ / 🔍 and the workspace contains no `package.json`, no `apps/` and no `libs/`. No story carries a **Today:** line, because that field belongs exclusively to gap and defect stories.

---

## US-C10-01 · Sign in with credentials and obtain a session

- **Shape:** greenfield
- **Traces to:** `FR-IAM-01` · Player / Competitor · epic `C10`

**As a** Player / Competitor **I want** to sign in to Sport ITSM with my credentials and receive a session **so that** I can reach the Self-Service Portal and my own tickets under a verified identity.

### Acceptance criteria

**Given** a registered, active user with a known password
**When** they submit valid credentials to the sign-in endpoint
**Then** the response returns a signed JWT access token whose claims carry the user identifier, the display name, the assigned role identifiers and an expiry, and the password is never present in the response body or in any log line.

**Given** a registered user
**When** they submit an incorrect password or an unknown identifier
**Then** authentication fails with a single generic failure response that does not disclose whether the identifier exists, and no token is issued.

**Given** a user account marked inactive
**When** they submit otherwise valid credentials
**Then** authentication fails and no token is issued.

**Given** stored user credentials
**When** any credential is persisted
**Then** it is stored only as a bcrypt hash, never in reversible form, and password comparison happens through the identity port rather than in the controller.

---

## US-C10-02 · No anonymous surface anywhere in the product

- **Shape:** greenfield
- **Traces to:** `FR-IAM-01` · System Administrator · epic `C10`

**As a** System Administrator **I want** every API route and every web route to reject unauthenticated callers by default **so that** Sport ITSM exposes no anonymous surface at all, including the Knowledge Base and the Self-Service Portal.

### Acceptance criteria

**Given** the API composition root
**When** any HTTP route other than sign-in and the liveness/readiness probes is called without a valid token
**Then** the request is rejected with `401` before reaching any use case, because the JWT guard is registered globally and exemption is opt-in per route rather than opt-out.

**Given** a route that a developer forgot to annotate
**When** it is called anonymously
**Then** it is still rejected — the default is deny, and an unannotated route inherits the global guard.

**Given** an expired or tampered token
**When** it is presented on any protected route
**Then** the request is rejected with `401` and the failure is logged with the correlation identifier but without the token itself.

**Given** the Angular shell
**When** an unauthenticated visitor requests any route other than the sign-in route
**Then** the router guard redirects to sign-in and preserves the requested URL for post-authentication return.

---

## US-C10-03 · Sign out and terminate the session

- **Shape:** greenfield
- **Traces to:** `FR-IAM-01`, `FR-IAM-06` · Service Desk Agent (L1) · epic `C10`

**As a** Service Desk Agent (L1) **I want** to sign out explicitly **so that** my session cannot be reused on a shared service-desk workstation after I leave it.

### Acceptance criteria

**Given** an agent with an active session
**When** they choose sign out
**Then** the server-side session record is terminated, the client discards the token, and the shell navigates to the sign-in route.

**Given** a token belonging to a session that has been signed out
**When** it is replayed on any protected route before its natural expiry
**Then** the request is rejected with `401`, because the guard validates the session record and not only the token signature.

**Given** a signed-out session
**When** the user signs in again
**Then** a new session record and a new token are issued; the previous ones are never revived.

---

## US-C10-04 · Role catalog aligned with the PRD personas

- **Shape:** greenfield
- **Traces to:** `FR-IAM-02` · System Administrator · epic `C10`

**As a** System Administrator **I want** the platform to ship with the roles named in PRD §4.3 and their permission sets **so that** access control speaks the same vocabulary as the personas rather than an ad-hoc invention.

### Acceptance criteria

**Given** a freshly migrated database
**When** the baseline migration has run
**Then** exactly the eight roles of PRD §4.3 exist — Requester, Organizer / League Admin, Agent (L1), Analyst (L2/L3), Change/Release Manager, Approver, Service Manager, System Administrator — each with a stable identifier and a translatable label, and none carries a hardcoded user-facing string.

**Given** the seeded role catalog
**When** a role's permission set is inspected
**Then** it matches the key permissions listed for that role in PRD §4.3, expressed as named permissions in the `identity-access` domain rather than as free text.

**Given** the System Administrator role
**When** its permission set is inspected
**Then** it grants configuration of catalog, taxonomy, SLA policies, workflows, notifications, roles and CMDB schema, and grants **no** permission to modify or delete audit entries.

**Given** the role catalog
**When** a schema change to roles or permissions is required
**Then** it is delivered as a TypeORM migration; `synchronize` remains `false`.

---

## US-C10-05 · Least-privilege enforcement inside the use cases

- **Shape:** greenfield
- **Traces to:** `FR-IAM-02` · Application Support Analyst (L2/L3) · epic `C10`

**As an** Application Support Analyst (L2/L3) **I want** authorization to be decided in domain terms by the use case, not by a controller decorator alone **so that** least privilege holds on every entry path and stays unit-testable without HTTP.

### Acceptance criteria

**Given** an application-layer use case that performs a privileged operation
**When** it executes
**Then** it evaluates an authorization predicate expressed in domain vocabulary (for example `actor may assign roles`) against the actor passed into the use case, and denies by default when no permission grants it.

**Given** the authorization predicates
**When** they are exercised
**Then** they are covered by Jest unit tests that construct actors and permissions directly, with no HTTP layer, no database and no framework import in `type:domain` or `type:application`.

**Given** an actor whose roles do not include the required permission
**When** they invoke the use case
**Then** it raises a typed authorization error that the HTTP adapter maps to `403`, and no side effect and no state change occurs.

**Given** the same operation reached through a different inbound path
**When** it is invoked
**Then** the identical predicate decides it, because the check lives in the use case and not in the adapter.

---

## US-C10-06 · A requester sees only their own records

- **Shape:** greenfield
- **Traces to:** `FR-IAM-03` · Player / Competitor · epic `C10`

**As a** Player / Competitor **I want** my visibility to be limited to the records I raised **so that** other people's support records are never exposed to me.

### Acceptance criteria

**Given** an actor holding only the Requester role
**When** the record-visibility predicate is evaluated for a record they raised
**Then** it grants visibility.

**Given** the same actor
**When** the predicate is evaluated for a record raised by another user
**Then** it denies visibility, and it denies it identically for read and for act-upon (comment, confirm resolution, submit CSAT).

**Given** a requester issuing a list query
**When** the visibility predicate is applied
**Then** it yields a scope restriction the consuming context can push into its repository query, so denied records are never fetched and then filtered in memory.

**Given** a requester requesting a record they may not see by direct identifier
**When** the use case evaluates visibility
**Then** the outcome is indistinguishable from the record not existing, so the response does not confirm its existence.

---

## US-C10-07 · Competition-scoped visibility for a Tournament Organizer / Admin

- **Shape:** greenfield
- **Traces to:** `FR-IAM-03` · Tournament Organizer / Admin · epic `C10`

**As a** Tournament Organizer / Admin **I want** visibility of the records affecting the competitions I own, on top of my own records **so that** I can follow issues that impact my tournament without being able to browse unrelated records.

### Acceptance criteria

**Given** an actor holding the Organizer role with an explicit grant over competition `X`
**When** the visibility predicate is evaluated for a record whose affected competition is `X`
**Then** it grants visibility, even though the actor is not the requester of that record.

**Given** the same actor
**When** the predicate is evaluated for a record whose affected competition is `Y`, over which they hold no grant
**Then** it denies visibility.

**Given** an Organizer with no competition grants at all
**When** the predicate is evaluated
**Then** it behaves exactly as the plain requester rule of `US-C10-06`, granting nothing beyond their own records.

**Given** a competition grant
**When** it is inspected
**Then** it is a persisted, explicitly scoped grant in the `identity-access` domain — never inferred from a name match, a text field or a role label.

---

## US-C10-08 · Cross-competition visibility for a League Administrator

- **Shape:** greenfield
- **Traces to:** `FR-IAM-03` · League Administrator · epic `C10`

**As a** League Administrator **I want** visibility across the set of competitions in the leagues I oversee **so that** I can act as the escalation contact without being granted read-all.

### Acceptance criteria

**Given** an actor holding the League Admin role with a grant over a league containing competitions `X` and `Y`
**When** the visibility predicate is evaluated for records affecting `X` or `Y`
**Then** it grants visibility for both.

**Given** the same actor
**When** the predicate is evaluated for a record affecting a competition outside their leagues
**Then** it denies visibility — the League Admin scope is a union of competition scopes, not a wildcard.

**Given** a competition that is added to a league the actor oversees
**When** the predicate is next evaluated
**Then** the new competition is included without any change to the actor's grants, because the scope resolves through the league at evaluation time.

**Given** the Service Manager read-all permission of PRD §4.3
**When** it is compared with the League Admin scope
**Then** they are distinct: read-all is a permission on the role, whereas the League Admin scope is a bounded set of competitions.

---

## US-C10-09 · `IdentityProviderPort` as the anti-corruption boundary

- **Shape:** greenfield
- **Traces to:** `FR-IAM-04`, `FR-IAM-01` · System Administrator · epic `C10`

**As a** System Administrator **I want** authentication to be resolved through a port with a local-credential adapter behind it **so that** adding SCMS SSO later is an adapter swap in the composition root and not a redesign of the domain.

### Acceptance criteria

**Given** the `identity-access` domain library
**When** it is inspected
**Then** it declares an `IdentityProviderPort` with no framework, HTTP or ORM import, and the authentication use case depends on that port only.

**Given** the composition root in `apps/api`
**When** the application boots
**Then** exactly one adapter is bound to the `IdentityProviderPort` injection token, selected from validated configuration through `ConfigService` with no raw `process.env` access in feature code.

**Given** the local-credential adapter
**When** it verifies a credential
**Then** it performs the bcrypt comparison and returns a domain identity; the domain never sees a hash, a request object or a driver type.

**Given** the authentication use case
**When** it is unit-tested
**Then** it runs against a test double of the port with no database and no HTTP server.

---

## US-C10-10 · Sign in through SCMS SSO behind the anti-corruption layer

- **Shape:** greenfield
- **Traces to:** `FR-IAM-04` · Player / Competitor · epic `C10`

**As a** Player / Competitor **I want** to sign in to Sport ITSM with my existing SCMS identity **so that** I do not maintain a second password to report a problem with the platform I already use.

### Acceptance criteria

**Given** the SSO adapter is the bound `IdentityProviderPort` implementation
**When** a user authenticates through the SCMS identity provider
**Then** the adapter translates the external identity and its profile attributes into the local `User` model, and no SCMS-specific field name, claim shape or type crosses into `type:domain` or `type:application`.

**Given** an SCMS identity that has never signed in before
**When** it authenticates successfully
**Then** a local user is provisioned with the default least-privilege role and no elevated permission, and the provisioning is recorded as a domain event.

**Given** an SCMS identity whose profile attributes have changed upstream
**When** it signs in again
**Then** the mapped profile attributes are refreshed while locally assigned roles are preserved — SSO supplies identity and profile, never Sport ITSM authorization.

**Given** the SCMS identity provider is unreachable
**When** a sign-in is attempted
**Then** the failure is surfaced as a typed error with an actionable message and is logged through pino; it is never reported as invalid credentials.

---

## US-C10-11 · Assign a role to a user

- **Shape:** greenfield
- **Traces to:** `FR-IAM-05` · System Administrator · epic `C10`

**As a** System Administrator **I want** to assign roles to a user from the Admin Console **so that** entitlements follow people's actual responsibilities without a code change.

### Acceptance criteria

**Given** an administrator on the role-administration screen
**When** they assign a role to a user
**Then** the assignment is persisted, is visible on the user's profile immediately, and the screen renders through the in-house design system with keyboard operation and an `aria-live` confirmation, using no third-party component library.

**Given** a non-administrator actor
**When** they invoke the role-assignment use case by any path
**Then** it is denied by the authorization predicate of `US-C10-05` and nothing is persisted.

**Given** a role already assigned to that user
**When** the same role is assigned again
**Then** the operation is idempotent: no duplicate assignment is created and no spurious change event is emitted.

**Given** the assignment request
**When** it reaches the API
**Then** its body is validated by a `class-validator` DTO defined in `libs/shared/contracts`; an unvalidated or `any`-typed body is never accepted.

---

## US-C10-12 · Revoke a role, with immediate effect

- **Shape:** greenfield
- **Traces to:** `FR-IAM-05` · System Administrator · epic `C10`

**As a** System Administrator **I want** a revoked role to stop granting access at once **so that** removing an entitlement is effective immediately rather than at the next token expiry.

### Acceptance criteria

**Given** a user holding a role and an active session
**When** the administrator revokes that role
**Then** the next request made with the existing token no longer carries the revoked permissions, because permissions are resolved server-side per request rather than trusted from the token claims alone.

**Given** the same user
**When** they retry an operation that the revoked role permitted
**Then** it is denied with `403` and the denial is recorded per `US-C10-16`.

**Given** a user whose last role is revoked
**When** they sign in
**Then** authentication succeeds but every privileged operation is denied, and the shell renders an explicit "no entitlements" state rather than an empty screen or a silent error.

**Given** an administrator attempting to revoke their own last System Administrator role
**When** the use case executes
**Then** it is refused with a typed error, so the platform cannot be left with no administrator.

---

## US-C10-13 · Role changes are emitted as auditable events

- **Shape:** greenfield
- **Traces to:** `FR-IAM-05` · Service Owner / Service Manager · epic `C10`

**As a** Service Owner / Service Manager **I want** every role assignment and revocation to be published as a domain event carrying the acting administrator **so that** entitlement changes are fully auditable and cannot be made silently.

### Acceptance criteria

**Given** a successful role assignment
**When** the transaction commits
**Then** a `RoleAssigned` domain event is published carrying the actor identity, the target user, the role, the timestamp from `ClockPort` and the previous and new role sets.

**Given** a successful role revocation
**When** the transaction commits
**Then** a `RoleRevoked` domain event is published with the same shape.

**Given** the audit subscriber fails
**When** the event is dispatched post-commit
**Then** the role change stays committed and the dispatch failure is logged; audit is never allowed to roll back an entitlement change.

**Given** a failed or denied role change
**When** the use case returns
**Then** no `RoleAssigned` / `RoleRevoked` event is emitted, so the audit trail records only effective changes.

> **Dependency:** persisting and rendering these events as audit entries belongs to `C18` (`FR-AUD-01`, `FR-AUD-02`) and is out of scope here. `C10` publishes; `C18` records. See finding **F5**.

---

## US-C10-14 · Session terminates after a configurable inactivity period

- **Shape:** greenfield
- **Traces to:** `FR-IAM-06` · Service Desk Agent (L1) · epic `C10`

**As a** Service Desk Agent (L1) **I want** my session to end automatically after a configured period of inactivity **so that** an unattended service-desk workstation does not leave the ticket queue open.

### Acceptance criteria

**Given** an inactivity period defined in validated configuration
**When** the application boots
**Then** the value is read through `ConfigService` with a documented default, and boot fails fast if the value is missing or is not a positive duration.

**Given** an active session
**When** no request is made for longer than the configured period
**Then** the next request is rejected with `401` and the session record is terminated; the elapsed time is computed through `ClockPort`, never through `new Date()` in domain or application code.

**Given** an active session
**When** requests continue within the period
**Then** the inactivity window slides and the session is not terminated.

**Given** a session about to expire
**When** the remaining time crosses a warning threshold
**Then** the web client shows a localized warning through Transloco with an explicit "stay signed in" action, and losing the session mid-form does not discard the entered data silently.

---

## US-C10-15 · Step-up re-authentication for privileged administrative actions

- **Shape:** greenfield
- **Traces to:** `FR-IAM-06` · System Administrator · epic `C10`

**As a** System Administrator **I want** to re-enter my credentials before a privileged administrative action **so that** a hijacked or borrowed session cannot silently reconfigure the platform.

### Acceptance criteria

**Given** an operation declared privileged (at minimum: role assignment and revocation, and configuration of catalog, taxonomy, SLA policies, workflows and notification templates)
**When** it is invoked with a session that has not been re-authenticated within the step-up validity window
**Then** it is refused with a distinct, machine-readable "re-authentication required" outcome — not a generic `403` — and nothing is persisted.

**Given** that refusal
**When** the administrator re-enters valid credentials
**Then** the session is marked step-up-verified for the configured window and the original operation can be retried and succeeds.

**Given** invalid credentials at the step-up prompt
**When** they are submitted
**Then** the session keeps its existing privileges but gains no step-up mark, and the attempt is logged.

**Given** the set of privileged operations
**When** a new one is added
**Then** it is declared through the same explicit marker used by the operations above, so the requirement is satisfied by declaration rather than by remembering to add a check.

---

## US-C10-16 · Denied authorizations on privileged operations are recorded

- **Shape:** greenfield
- **Traces to:** `FR-IAM-07` · System Administrator · epic `C10`

**As a** System Administrator **I want** every denied authorization on a privileged operation to be recorded **so that** attempts to exceed entitlements are visible after the fact instead of vanishing into a `403`.

### Acceptance criteria

**Given** a privileged operation
**When** the authorization predicate denies it
**Then** a denial record is produced carrying the actor identity, the attempted operation, the target record reference where one exists, the reason for denial and the timestamp from `ClockPort`.

**Given** a denial on a non-privileged operation
**When** it occurs
**Then** no denial record is produced — the requirement is scoped to privileged operations and the volume of ordinary visibility denials must not drown it.

**Given** an unauthenticated request
**When** it is rejected by the global guard
**Then** it is an authentication failure, not an authorization denial, and it produces no denial record.

**Given** a denial record
**When** it is inspected
**Then** it contains no credential, no token and no password, and it is produced by the same use-case-level predicate that made the decision, so it cannot disagree with the outcome the caller received.

---

## Findings

Observations raised while writing these stories. The first two are carried over from `docs/backlog/epic-map.md`; the rest are new.

| ID | Source | Finding | Effect on this backlog |
| --- | --- | --- | --- |
| **F5** | Epic map (carried) | **Mutual reference at phase 0.** `FR-IAM-05` requires role assignment and revocation to be "fully audited", which needs `C18`; `FR-AUD-02` requires every audit entry to carry an actor, which needs `C10`. | `C10` and `C18` are one phase-0 increment, not two sequenced epics. `US-C10-13` stops at publishing the domain events; the audit entry itself is `C18` (`FR-AUD-01`, `FR-AUD-02`) and **no `C18` story is written here**. |
| **F9** | Epic map (carried) | **`FR-IAM-04`, `FR-IAM-06` and `FR-IAM-07` are assigned to no phase in PRD §14**, even though `FR-IAM-06` (inactivity timeout, step-up re-authentication) is a security control. | Stories `US-C10-09`, `US-C10-10` and `US-C10-14` → `US-C10-16` exist and are traced, but their phase is undecided. Whoever sequences these must resolve the phasing; a security control landing "sometime after MVP" is a decision, not an omission. |
| **F13** | New | **The PRD has no persona identifiers.** §4.1 and §4.2 name personas in tables with no `PER-n` column, so the skill's `PER-n` trace field cannot be honoured without inventing PRD IDs. | Every story traces to the persona's **exact PRD name** instead. Stated once, here. If `PER-` IDs are wanted, the Product Owner must add them to PRD §4 and this file must be re-traced — they are not minted here. |
| **F14** | New | **`C10` carries foundation work that is not user stories.** The epic map prices the whole workspace foundation into `C10`: Nx bootstrap with pnpm, ESLint 9 flat config with `@nx/enforce-module-boundaries`, Prettier, the three-axis tag scheme, the four applications (`api`, `api-e2e`, `web`, `web-e2e`), `libs/shared/{contracts,domain,ui,util}` including the in-house design system, and the PostgreSQL base schema with its TypeORM migration chain. | Deliberately **not** written as user stories — scaffolding has no persona and no user-observable behavior. It is enabling technical work, belongs in `T-C10-nn` tickets and must be sequenced before `US-C10-01`. It is also why the epic is sized XL while holding only 7 requirements: the 16 stories above do not represent the epic's full cost. |
| **F15** | New | **`FR-IAM-03` is observable only through a record that `C10` does not own.** Requester-scoped and competition-scoped visibility are `identity-access` domain predicates (`ARCHITECTURE.md` §9), but the tickets they filter belong to `C1` and `C2`. | `US-C10-06` → `US-C10-08` are written against the **predicate and the scope restriction it yields**, verifiable by Jest unit tests with no ticket aggregate present. End-to-end proof over real tickets lands with `C1` / `C2` and must not be expected of `C10`'s acceptance run. |
| **F16** | New | **Neither the PRD nor the architecture defines which operations are "privileged".** `FR-IAM-06` requires re-authentication for "privileged administrative actions" and `FR-IAM-07` requires recording denials "when it concerns privileged operations", but the set is never enumerated. | `US-C10-15` proposes the set — role assignment and revocation plus Admin Console configuration of catalog, taxonomy, SLA policies, workflows and notification templates — as an explicit, extensible declaration, and `US-C10-16` reuses it. **This is an assumption made by this backlog and needs Product Owner confirmation**; neither requirement is testable until the set is agreed. |
| **F17** | New | **`FR-IAM-07`'s recording destination is unspecified.** A denied authorization is not a change to a record, so it does not fit the `AuditEntry` shape of `FR-AUD-02` (previous value / new value) and it has no natural record reference. | `US-C10-16` specifies the content of the denial record but deliberately not its store. Choosing between a `C18` audit entry and a dedicated security log is an architecture decision that must be made before `US-C10-16` is ticketed. |
