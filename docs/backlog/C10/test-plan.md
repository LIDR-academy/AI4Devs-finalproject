# Test Plan — C10 · Identity & Access Management

> Sources: `docs/backlog/C10/user-stories.md` (16 stories, all greenfield) · `docs/backlog/C10/tickets/` (67 tickets) · `docs/backlog/epic-map.md` · `CLAUDE.md` §2–§3 · `docs/product/ARCHITECTURE.md` §5, §9 · PRD §7.10, §4.3
> This document is both the **BDD specification** and the **test strategy** for the epic. Every scenario below is written to seed a `.feature` file or a `*.spec.ts` directly.

## Context

`C10` is the phase-0 anchor: authentication, RBAC, record visibility, role administration, session lifecycle and denied-authorization recording, on top of the entire workspace foundation. Nothing was read from the codebase because there is none — no `package.json`, no `apps/`, no `libs/`, no test. Every scenario below is therefore written from the user stories and the architecture, not from source.

**High-risk area.** This epic *is* the auth surface. `FR-IAM-01` states Sport ITSM exposes no anonymous surface at all, which makes the negative scenarios (`AT-C10-06`, `AT-C10-07`) the most valuable tests in the epic: they are the only ones that hold for routes that do not exist yet.

### What is deliberately not covered here

| Excluded | Why |
|---|---|
| The 18 **foundation** tickets (`story: —`) | They have no persona and no user-observable behavior. Their *done* is the mechanical check written in the ticket itself — `pnpm nx lint`, a `pnpm nx graph` with no illegal edge, a migration that runs and reverts. Turning a lint rule into a Gherkin scenario would add ceremony, not coverage. |
| End-to-end proof of `FR-IAM-03` over real tickets | Finding **F15**: the records the visibility predicates filter belong to `C1` and `C2`. This epic proves the **predicate and the scope restriction**; the ticket-level proof lands with those epics. |
| Persisting a role change as an `AuditEntry` | Finding **F5**: `C10` publishes the domain event, `C18` records it. `AT-C10-43` and `AT-C10-44` assert publication against a test subscriber and stop there. |
| Structured logging, health probes, i18n scaffolding, the a11y baseline | Priced into the `NFR` epic standalone slice by the epic map, not into `C10`. |

### Implementation handoff

| Level | Where it lives | Who implements |
|---|---|---|
| Unit | `*.spec.ts` co-located in the lib | `backend-engineer` (domain, application, infrastructure) · `frontend-engineer` (components, stores) |
| Integration | `*.spec.ts` against a real PostgreSQL from `T-C10-16` | `backend-engineer` |
| API-E2E | `.feature` + step definitions in `apps/api-e2e` (`platform:backend`, `type:e2e`) | No dev agent owns this; it is **e2e-harness work on the backend platform** — the same layer/platform naming used by `T-C10-29` |
| E2E | `.feature` + step definitions in `apps/web-e2e` (`platform:frontend`, `type:e2e`) | **e2e-harness work on the frontend platform** |

Test stack: **Jest 29** (unit, integration) · **jest-preset-angular** (components + signals) · **@nestjs/testing** (backend wiring) · **Cypress 15 + `@badeball/cypress-cucumber-preprocessor`** (`apps/api-e2e`, `apps/web-e2e`) · Nx targets `test` and `e2e`. Coverage floor 80% on changed libs (`ARCHITECTURE.md` §9).

**Shared test data.** One seed fixture serves the whole epic: the eight roles of PRD §4.3 seeded by `T-C10-36`; users `requester-a`, `requester-b`, `organizer-x` (grant over competition `X`), `league-admin-l` (grant over league `L` containing `X` and `Y`), `agent-l1`, `sysadmin-1`, `sysadmin-2`, `inactive-user`; scope grants from `T-C10-44`. Every backend scenario uses `FixedClock` from `T-C10-09` so no assertion depends on wall-clock time.

---

## Acceptance scenarios

### US-C10-01 · Sign in with credentials and obtain a session

#### AT-C10-01 — Successful sign-in issues a session token — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the registered active user `requester-a` with a known password
**When** they submit valid credentials to the sign-in endpoint
**Then** the response is `200` and carries a signed JWT whose claims hold the user identifier, the display name, the assigned role identifiers and an expiry, and the response body contains no password and no hash.

- Test data: seeded `requester-a` with a bcrypt hash · Dependencies: real DB · Covers: US-C10-01 (`T-C10-25`, `T-C10-26`, `T-C10-27`)
- Why API-E2E: the claim set is only observable across the full HTTP path; a unit test on the issuer cannot prove the controller returns it.

#### AT-C10-02 — A wrong password and an unknown identifier are indistinguishable — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the registered user `requester-a` and an identifier that does not exist
**When** an incorrect password is submitted for the first, and any password for the second
**Then** both responses are `401` with the same error code and byte-identical bodies apart from the correlation identifier, and no token is issued in either case.

- Test data: `requester-a`, a random unknown identifier · Dependencies: real DB · Covers: US-C10-01
- Why API-E2E: the requirement is about what the *response* discloses, which only the transport can show.

#### AT-C10-03 — An inactive account cannot authenticate — P0 — type: Unit — impl: `backend-engineer`

**Given** the user `inactive-user` marked inactive and a correct password
**When** `AuthenticateUser` executes against a stubbed `IdentityProviderPort`
**Then** it returns the generic authentication failure, creates no session and issues no token.

- Test data: in-memory actor and stub port · Dependencies: none — no DB, no HTTP · Covers: US-C10-01 (`T-C10-25`)
- Why Unit: this is a use-case decision; running it through HTTP would test the guard, not the rule.

#### AT-C10-04 — Credentials are persisted only as a bcrypt hash — P0 — type: Integration — impl: `backend-engineer`

**Given** a user created through the credential-hashing helper
**When** the row is read directly from `identity_access.user`
**Then** the password column holds a bcrypt hash, no reversible representation exists anywhere in the row, and the same plaintext verifies through the local adapter.

- Test data: a freshly created user · Dependencies: real PostgreSQL · Covers: US-C10-01, US-C10-09 (`T-C10-21`, `T-C10-22`)
- Why Integration: the assertion is about what reaches the database, which a mocked repository cannot prove.

#### AT-C10-05 — The sign-in screen shows one generic failure and is keyboard operable — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** the sign-in route
**When** a keyboard-only user submits an incorrect password and then an unknown identifier
**Then** the identical generic message is shown both times, it is announced through the `aria-live` region, and every control was reached and activated without a pointer.

- Test data: `requester-a` · Dependencies: running API and web · Covers: US-C10-01 (`T-C10-31`)
- Why E2E: keyboard reachability and the live-region announcement are browser behaviors.

### US-C10-02 · No anonymous surface anywhere in the product

#### AT-C10-06 — Every route rejects an anonymous caller — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the running API and its complete route table
**When** every route is called with no `Authorization` header
**Then** each responds `401`, except exactly the declared exemption set — sign-in and the liveness/readiness probes — and the set of non-`401` routes equals that exemption set with no extra and no missing entry.

- Test data: none · Dependencies: running API · Covers: US-C10-02 (`T-C10-28`, `T-C10-29`)
- Why API-E2E: `FR-IAM-01` is a claim about *every* route including ones not yet written. Only an enumeration of the live route table can prove it, and this scenario becomes a standing regression check for every later epic.

#### AT-C10-07 — A route nobody annotated still denies — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a route added with no guard annotation of any kind
**When** it is called anonymously
**Then** it responds `401`, because the guard is global and exemption is opt-in; and **given** a route added *with* the `@Public()` marker, the enumeration of `AT-C10-06` fails until the exemption set is updated deliberately.

- Test data: a probe route registered by the test fixture · Dependencies: running API · Covers: US-C10-02
- Why API-E2E: the property under test is the default of the composition root, not of any one controller.

#### AT-C10-08 — Expired and tampered tokens are rejected without leaking the token — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an expired token and a token with an altered payload
**When** each is presented on a protected route
**Then** both are rejected with `401`, and the corresponding log entries carry the correlation identifier and contain no token material.

- Test data: tokens minted with `FixedClock` in the past and a re-signed payload · Dependencies: running API, log capture · Covers: US-C10-02 (`T-C10-28`)

#### AT-C10-09 — The router guard redirects and preserves the requested URL — P0 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** an unauthenticated visitor
**When** they request a deep authenticated route directly
**Then** the shell redirects to sign-in, and after a successful sign-in the shell navigates to the originally requested URL rather than the default route.

- Test data: `requester-a` · Dependencies: running API and web · Covers: US-C10-02 (`T-C10-30`)
- Why E2E: the whole value is the round trip through the router and back.

### US-C10-03 · Sign out and terminate the session

#### AT-C10-10 — Sign-out terminates the session and clears the client — P0 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** the agent `agent-l1` with an active session
**When** they choose sign out
**Then** the server session record is terminated, the client holds no token, the shell navigates to sign-in, and pressing the browser back button does not return an authenticated view.

- Test data: `agent-l1` · Dependencies: running API and web · Covers: US-C10-03 (`T-C10-33`, `T-C10-34`)

#### AT-C10-11 — A token from a signed-out session cannot be replayed — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a token whose session has been signed out, still inside its natural expiry
**When** it is presented on any protected route
**Then** the response is `401`, because the guard validates the session record and not only the signature.

- Test data: `agent-l1`, a captured pre-sign-out token · Dependencies: running API · Covers: US-C10-03 (`T-C10-24`, `T-C10-28`, `T-C10-32`)
- Why API-E2E: this is the single scenario that proves session validation is wired into the global guard rather than into one controller.

#### AT-C10-12 — Signing in again creates a new session and never revives the old one — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a user who has signed out
**When** they sign in again
**Then** a new session record and a new token are issued, the previous session stays terminated, and the previous token is still rejected.

- Test data: `agent-l1` · Dependencies: running API · Covers: US-C10-03

### US-C10-04 · Role catalog aligned with the PRD personas

#### AT-C10-13 — A freshly migrated database holds exactly the eight PRD §4.3 roles — P0 — type: Integration — impl: `backend-engineer`

**Given** an empty database
**When** the migration chain has run
**Then** `identity_access.role` holds exactly eight rows with the stable identifiers of PRD §4.3 — Requester, Organizer / League Admin, Agent (L1), Analyst (L2/L3), Change/Release Manager, Approver, Service Manager, System Administrator — and re-running the seed adds nothing.

- Test data: none beyond the seed · Dependencies: real PostgreSQL · Covers: US-C10-04 (`T-C10-36`)

#### AT-C10-14 — Each permission set matches PRD §4.3 — P0 — type: Unit — impl: `backend-engineer`

**Given** the role catalog declared in `identity-access/domain`
**When** each role permission set is inspected
**Then** it matches the key permissions listed for that role in PRD §4.3, expressed as enumerated `Permission` values and never as free text.

- Test data: the domain catalog itself · Dependencies: none · Covers: US-C10-04 (`T-C10-35`)
- Why Unit: the catalog is a domain declaration; asserting it through the database would test the seed twice and the model not at all.

#### AT-C10-15 — The System Administrator cannot touch the audit trail — P0 — type: Unit — impl: `backend-engineer`

**Given** the System Administrator role
**When** its permission set is inspected
**Then** it grants configuration of catalog, taxonomy, SLA policies, workflows, notifications, roles and CMDB schema, and grants **no** permission to modify or delete an audit entry — and no such permission exists anywhere in the enumeration.

- Test data: the domain catalog · Dependencies: none · Covers: US-C10-04, and the ADR-001 immutability property `C18` depends on

#### AT-C10-16 — Role labels are translatable, with stable identifiers — P2 — type: Integration — impl: `backend-engineer`

**Given** requests carrying `Accept-Language` for a supported locale and for an unsupported one
**When** the role catalog is returned for each
**Then** labels render in the supported locale and fall back to the documented default for the other, the identifiers are identical across both, and no English role name appears outside the translation resources.

- Test data: two locale headers · Dependencies: the `NFR` epic i18n scaffolding · Covers: US-C10-04 (`T-C10-37`)
- P2 because the identifiers — the part other epics depend on — are already proven by `AT-C10-13`.

### US-C10-05 · Least-privilege enforcement inside the use cases

#### AT-C10-17 — Authorization denies by default — P0 — type: Unit — impl: `backend-engineer`

**Given** an actor whose roles carry no granting permission, and an operation for which no predicate has been declared at all
**When** authorization is evaluated for each
**Then** both outcomes are deny, and the denial carries a reason.

- Test data: actors constructed directly with explicit permission sets · Dependencies: none — no HTTP, no DB, no framework import · Covers: US-C10-05 (`T-C10-38`)
- Why Unit: deny-by-default is only provable by asking about something nobody configured, which is trivial in a unit test and awkward anywhere else.

#### AT-C10-18 — A denied privileged call returns `403` and changes nothing — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an actor lacking the required permission
**When** they invoke a privileged operation over HTTP
**Then** the response is `403` with the `FORBIDDEN` code, nothing was persisted, no domain event was emitted, and the body discloses no permission name.

- Test data: `agent-l1` attempting a role assignment · Dependencies: running API, real DB · Covers: US-C10-05 (`T-C10-40`)

#### AT-C10-19 — The same predicate decides on every inbound path — P1 — type: Unit — impl: `backend-engineer`

**Given** two different callers reaching the same operation
**When** each invokes it with an `Actor` built by the same resolver
**Then** the identical predicate produces the identical decision, because the check lives in the use case and not in the adapter.

- Test data: two actor fixtures · Dependencies: none · Covers: US-C10-05 (`T-C10-39`)

### US-C10-06 · A requester sees only their own records

> Finding **F15**: these are predicate tests. No Incident or Service Request aggregate exists in `C10`, and none is needed to prove the rule.

#### AT-C10-20 — Own records allowed, other records denied identically for view and act — P0 — type: Unit — impl: `backend-engineer`

**Given** an actor holding only the Requester role
**When** the visibility predicate is evaluated for a record they raised and for a record raised by `requester-b`
**Then** the first is granted and the second denied, and the denial is identical for `mayView` and for `mayActUpon` — comment, confirm resolution, submit CSAT.

- Test data: two record descriptors in `identity-access` vocabulary · Dependencies: none · Covers: US-C10-06 (`T-C10-41`)

#### AT-C10-21 — The predicate yields a pushable scope restriction, not a filtered list — P1 — type: Unit — impl: `backend-engineer`

**Given** a requester issuing a list query
**When** the predicate is applied
**Then** it returns a `ScopeRestriction` naming the restriction declaratively, so the consuming repository can push it into the query and never fetch a denied record into memory.

- Test data: an actor with no grants · Dependencies: none · Covers: US-C10-06
- Why this matters: it is the difference between a security rule and a display filter, and it is the contract `C1` and `C2` will build their queries on.

#### AT-C10-22 — A denied direct read is indistinguishable from a missing record — P0 — type: Integration — impl: `backend-engineer`

**Given** a record that does not exist and a record that exists but is denied
**When** the same requester reads each by direct identifier
**Then** both outcomes are identical including the error code, and neither path performs work the other does not, so timing does not disclose existence.

- Test data: one existing record descriptor owned by `requester-b` · Dependencies: real DB for the timing comparison · Covers: US-C10-06 (`T-C10-42`)

### US-C10-07 · Competition-scoped visibility for a Tournament Organizer / Admin

#### AT-C10-23 — A granted competition is visible, an ungranted one is not — P0 — type: Unit — impl: `backend-engineer`

**Given** `organizer-x` holding the Organizer role with an explicit grant over competition `X`
**When** the predicate is evaluated for a record affecting `X` and then for one affecting `Y`
**Then** the first is granted even though they did not raise it, and the second is denied.

- Test data: `organizer-x` with one competition grant · Dependencies: none · Covers: US-C10-07 (`T-C10-45`)

#### AT-C10-24 — An Organizer with no grants is exactly a requester — P1 — type: Unit — impl: `backend-engineer`

**Given** an actor holding the Organizer role and no competition grants at all
**When** the predicate is evaluated
**Then** it behaves exactly as the plain requester rule of `US-C10-06`, granting nothing beyond their own records.

- Test data: Organizer role, empty grant collection · Dependencies: none · Covers: US-C10-07
- Why it earns a test: it is the scenario where a role-label shortcut would silently pass, and this is the assertion that catches it.

#### AT-C10-25 — The grant is a persisted, explicit record — P1 — type: Integration — impl: `backend-engineer`

**Given** the scope-grant table
**When** a grant is written and read back
**Then** it carries an explicit kind and target identifier, a duplicate is rejected by the unique constraint, and nothing about the grant is inferred from a name match, a text field or a role label.

- Test data: one competition grant · Dependencies: real PostgreSQL · Covers: US-C10-07 (`T-C10-44`)

### US-C10-08 · Cross-competition visibility for a League Administrator

#### AT-C10-26 — The league scope is a union, never a wildcard — P0 — type: Unit — impl: `backend-engineer`

**Given** `league-admin-l` with a grant over league `L` containing competitions `X` and `Y`
**When** the predicate is evaluated for records affecting `X`, `Y` and a competition outside `L`
**Then** the first two are granted and the third denied.

- Test data: one league grant, three record descriptors · Dependencies: none · Covers: US-C10-08 (`T-C10-46`)

#### AT-C10-27 — A competition added to the league is included with no change to the grant — P0 — type: Integration — impl: `backend-engineer`

**Given** `league-admin-l` and a competition `Z` newly added to league `L`
**When** the predicate is evaluated again
**Then** `Z` is included, and the scope-grant row was not written to, because the scope resolves through the league at evaluation time.

- Test data: league `L`, competitions `X`, `Y`, then `Z` · Dependencies: real PostgreSQL · Covers: US-C10-08 (`T-C10-44`, `T-C10-46`)
- Why Integration: the point is that resolution happens per evaluation against stored membership; an in-memory stub could not distinguish that from a snapshot.

#### AT-C10-28 — League scope and Service Manager read-all stay distinct — P1 — type: Unit — impl: `backend-engineer`

**Given** the Service Manager read-all permission and the League Admin scope
**When** both are exercised over the same record set
**Then** read-all is a permission on the role, the League Admin scope is a bounded competition set, and neither is implemented in terms of the other.

- Test data: two actors · Dependencies: none · Covers: US-C10-08

### US-C10-09 · `IdentityProviderPort` as the anti-corruption boundary

#### AT-C10-29 — The domain declares the port with no framework import — P0 — type: Unit — impl: `backend-engineer`

**Given** `libs/identity-access/domain`
**When** its imports and the port signature are inspected
**Then** it declares `IdentityProviderPort` with no framework, HTTP or ORM import, and no parameter or return field carries a provider-specific name, claim shape or driver type.

- Test data: none — an assertion over the module graph plus `pnpm nx lint` · Dependencies: none · Covers: US-C10-09 (`T-C10-20`)

#### AT-C10-30 — Exactly one adapter is bound, from validated configuration — P0 — type: Integration — impl: `backend-engineer`

**Given** the configured provider set to `local`, and then to an unrecognized value
**When** the application boots in each case
**Then** the first resolves `LocalCredentialIdentityProvider` and nothing else for the port token, and the second fails fast naming the key and the allowed values.

- Test data: two configuration fixtures · Dependencies: `@nestjs/testing` container · Covers: US-C10-09 (`T-C10-23`)

#### AT-C10-31 — The authentication use case runs against a port double — P0 — type: Unit — impl: `backend-engineer`

**Given** a test double of `IdentityProviderPort`
**When** the authentication suite runs
**Then** it covers success, wrong credential, unknown identifier, inactive account and provider unavailable, with no database and no HTTP server anywhere in the suite.

- Test data: stub port responses · Dependencies: none · Covers: US-C10-09, US-C10-01 (`T-C10-25`)
- This is the scenario that proves the hexagon is real rather than decorative.

### US-C10-10 · Sign in through SCMS SSO behind the anti-corruption layer

#### AT-C10-32 — SCMS vocabulary never crosses the boundary — P0 — type: Unit — impl: `backend-engineer`

**Given** the SSO adapter bound as the `IdentityProviderPort` implementation
**When** an SCMS identity is translated
**Then** the adapter returns a domain identity and a normalized profile map, and `type:domain` and `type:application` contain no SCMS-specific claim name, shape or type; a missing claim fails with a typed mapping error naming it rather than producing a partial identity.

- Test data: a recorded SCMS provider response · Dependencies: stubbed SCMS client · Covers: US-C10-10 (`T-C10-64`)

#### AT-C10-33 — A first SSO sign-in provisions a least-privilege user and emits an event — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** an SCMS identity that has never signed in
**When** it authenticates successfully
**Then** a local user is provisioned with exactly the configured default least-privilege role and no elevated permission, a `UserProvisioned` event is published post-commit, and a second sign-in provisions nothing further.

- Test data: a new SCMS identity in the provider stub · Dependencies: running API with the SSO adapter bound, real DB, test subscriber · Covers: US-C10-10 (`T-C10-65`)

#### AT-C10-34 — Profile refresh never touches local roles — P0 — type: Unit — impl: `backend-engineer`

**Given** an existing SSO user whose upstream attributes have changed, and a provider response carrying a role-like or group-like claim
**When** they sign in again
**Then** the mapped profile attributes are refreshed, the local role assignments are unchanged, the role-like claim is ignored for authorization, and an unchanged profile writes nothing.

- Test data: two provider responses for the same identity · Dependencies: none · Covers: US-C10-10 (`T-C10-66`)
- Why it is P0 despite an unphased requirement: this is the rule that stops SSO from silently undoing an administrator decision made under `FR-IAM-05`.

#### AT-C10-35 — A provider outage is never reported as invalid credentials — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** the SCMS identity provider unreachable, and then unresponsive past the configured timeout
**When** a sign-in is attempted in each case
**Then** both surface as `503` with a distinct error code and an actionable message, never as the invalid-credential failure, and one structured pino entry carries the correlation identifier and no credential material.

- Test data: provider stub configured to refuse and to hang · Dependencies: running API, log capture · Covers: US-C10-10 (`T-C10-67`)

### US-C10-11 · Assign a role to a user

#### AT-C10-36 — An administrator assigns a role and sees it immediately — P0 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** `sysadmin-1` on the role-administration screen
**When** they assign a role to `requester-a`
**Then** the assignment is persisted, the user row shows the new role without a manual reload, a confirmation is announced through the `aria-live` region, and the whole flow was completed by keyboard.

- Test data: `sysadmin-1`, `requester-a` · Dependencies: running API and web, seeded roles · Covers: US-C10-11 (`T-C10-49`, `T-C10-50`)

#### AT-C10-37 — A non-administrator is denied by every path — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** `agent-l1`, who holds no role-administration permission
**When** the role-assignment operation is invoked over HTTP
**Then** the response is `403` and no assignment exists afterwards.

- Test data: `agent-l1`, `requester-a` · Dependencies: running API, real DB · Covers: US-C10-11, US-C10-05

#### AT-C10-38 — A repeat assignment is idempotent and emits nothing — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a user who already holds the role
**When** the same role is assigned again
**Then** the call succeeds, exactly one assignment row exists, and no `RoleAssigned` event was emitted.

- Test data: `requester-a` already holding the role · Dependencies: running API, real DB, test subscriber · Covers: US-C10-11, US-C10-13

#### AT-C10-39 — An unvalidated body never reaches the use case — P1 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a request body with a missing field, an extra field and a wrongly typed field
**When** each is submitted
**Then** each is rejected with `400` by the global `ValidationPipe` before the use case executes.

- Test data: three malformed bodies · Dependencies: running API · Covers: US-C10-11 (`T-C10-48`)

### US-C10-12 · Revoke a role, with immediate effect

#### AT-C10-40 — Revocation takes effect on the next request with the same token — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a user holding a role, an active session and an unexpired token
**When** the administrator revokes that role and the user immediately retries an operation the role permitted, using the same token
**Then** the retry is denied with `403` — no sign-out, no token refresh and no waiting for expiry — because permissions are resolved server-side per request.

- Test data: `requester-a` with a granted role, a captured token · Dependencies: running API, real DB · Covers: US-C10-12 (`T-C10-39`, `T-C10-51`, `T-C10-52`)
- The single most important scenario in block E: it is what makes `T-C10-39` worth building where it was built.

#### AT-C10-41 — The platform cannot be left with no administrator — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** `sysadmin-1` as the only remaining System Administrator
**When** they attempt to revoke their own System Administrator role
**Then** it is refused with a distinct machine-readable error code, not a generic `FORBIDDEN`, and the assignment remains; **and** given `sysadmin-2` also exists, the same revocation succeeds.

- Test data: one administrator, then two · Dependencies: running API, real DB · Covers: US-C10-12 (`T-C10-51`)

#### AT-C10-42 — A user with no entitlements sees an explicit state — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** a user whose last role has been revoked
**When** they sign in
**Then** authentication succeeds and the shell renders an explicit localized no-entitlements state — not an empty screen and not a silent error.

- Test data: a user stripped of all roles · Dependencies: running API and web · Covers: US-C10-12 (`T-C10-53`)

### US-C10-13 · Role changes are emitted as auditable events

> Finding **F5**: `C10` publishes, `C18` records. These scenarios assert publication against a **test subscriber**; no `AuditEntry` is asserted here.

#### AT-C10-43 — Both events are published post-commit with the full payload — P0 — type: Integration — impl: `backend-engineer`

**Given** a successful role assignment and a successful role revocation
**When** each transaction commits
**Then** `RoleAssigned` and `RoleRevoked` are each published exactly once, **after** the commit, carrying the actor identity, the target user, the role, the `ClockPort` timestamp and both the previous and the new role set — and the two payload shapes are structurally identical, so one `C18` subscriber can handle both.

- Test data: `sysadmin-1`, `requester-a`, `FixedClock` · Dependencies: real DB, in-process dispatcher, test subscriber · Covers: US-C10-13 (`T-C10-54`, `T-C10-55`)

#### AT-C10-44 — A failing subscriber never rolls back an entitlement change — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a subscriber registered to throw
**When** a role assignment commits and the event is dispatched post-commit
**Then** the role change stays committed, the caller receives success, and the dispatch failure is logged with the correlation identifier.

- Test data: a deliberately failing test subscriber · Dependencies: running API, real DB, log capture · Covers: US-C10-13, ADR-008
- Why API-E2E: the property is about transaction ordering across the whole request, which a unit test on the publisher cannot show.

#### AT-C10-45 — A denied or failed change emits nothing — P0 — type: Unit — impl: `backend-engineer`

**Given** a role change denied by authorization, one that fails validation, and an idempotent repeat that changes nothing
**When** each use case returns
**Then** no `RoleAssigned` and no `RoleRevoked` event is emitted, so the audit trail records only effective changes.

- Test data: three use-case invocations against stubbed repositories · Dependencies: none · Covers: US-C10-13

### US-C10-14 · Session terminates after a configurable inactivity period

#### AT-C10-46 — The inactivity window terminates an idle session and slides for an active one — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform)

**Given** a configured inactivity period and an active session
**When** no request is made for longer than that period, and separately when requests continue inside it
**Then** the first case is rejected with `401` on the next request and the session record is terminated, and the second case slides the window and is not terminated.

- Test data: `agent-l1`, `FixedClock` advanced deterministically past and short of the boundary · Dependencies: running API, real DB, injectable clock · Covers: US-C10-14 (`T-C10-57`)
- The boundary itself — at, just below and just above — is covered by unit tests on the aggregate; this scenario proves the guard applies it.

#### AT-C10-47 — Boot fails fast on a missing or invalid window — P1 — type: Integration — impl: `backend-engineer`

**Given** the inactivity key absent, zero, negative and non-numeric in turn
**When** the application boots for each
**Then** it fails fast with a message naming the key and does not start; with a valid positive duration it starts and the value is available through `ConfigService`.

- Test data: four configuration fixtures · Dependencies: `@nestjs/testing` container · Covers: US-C10-14 (`T-C10-56`)

#### AT-C10-48 — The warning offers stay-signed-in and never loses form data — P1 — type: E2E — impl: `apps/web-e2e` (frontend platform)

**Given** an agent with a partially completed form and a session approaching expiry
**When** the remaining time crosses the warning threshold
**Then** a localized warning appears with an explicit stay-signed-in action, choosing it slides the window server-side, and if the session is lost instead, the entered data is retained, restored after re-authentication, and the user is told so.

- Test data: a short window fixture, a form with entered data · Dependencies: running API and web · Covers: US-C10-14 (`T-C10-58`)

### US-C10-15 · Step-up re-authentication for privileged administrative actions

> ⚠ **Blocked by finding F16.** The set of *privileged* operations is defined nowhere in the PRD or the architecture. `US-C10-15` proposes one as an explicit assumption of this backlog. The scenarios below are written against that proposed set and are **not runnable as acceptance for `FR-IAM-06`** until the Product Owner confirms or replaces it. The mechanism can be built and unit-tested meanwhile.

#### AT-C10-49 — A privileged operation without a step-up mark is refused distinctly — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform) — **blocked: F16**

**Given** a declared privileged operation and a session not re-authenticated within the step-up window
**When** it is invoked
**Then** it is refused with a distinct machine-readable re-authentication-required outcome — not a generic `403` — nothing is persisted, and the error code differs from `FORBIDDEN`.

- Test data: `sysadmin-1` with a stale step-up mark · Dependencies: running API, `FixedClock` · Covers: US-C10-15 (`T-C10-60`) · Blocked on: which operations are privileged

#### AT-C10-50 — Re-authentication unblocks the retry — P0 — type: API-E2E — impl: `apps/api-e2e` (backend platform) — **blocked: F16**

**Given** that refusal
**When** the administrator re-enters valid credentials and retries the original operation
**Then** the session is marked step-up-verified for the configured window, the retry succeeds, and a second privileged operation inside the window proceeds without a further prompt.

- Test data: `sysadmin-1` and a valid credential · Dependencies: running API, `FixedClock` · Covers: US-C10-15

#### AT-C10-51 — A failed step-up grants nothing and is logged — P1 — type: Unit — impl: `backend-engineer` — **blocked: F16**

**Given** invalid credentials at the step-up prompt
**When** they are submitted
**Then** the session keeps its existing privileges, gains no step-up mark, and the attempt is logged.

- Test data: stub identity provider returning `InvalidCredential` · Dependencies: none · Covers: US-C10-15

### US-C10-16 · Denied authorizations on privileged operations are recorded

> ⚠ **Blocked by findings F16 and F17.** F16 leaves the scoping condition undefined, exactly as above. F17 leaves the **destination** undefined: a denial has no previous value, no new value and no natural record reference, so it does not fit the `AuditEntry` shape of `FR-AUD-02`, and the alternative — a dedicated `identity-access` security log — has not been chosen. `AT-C10-52` and `AT-C10-53` are writable now against the record and the port; `AT-C10-54` is not writable at all.

#### AT-C10-52 — A privileged denial produces a complete record — P0 — type: Unit — impl: `backend-engineer` — **blocked: F16**

**Given** a privileged operation
**When** the authorization predicate denies it
**Then** exactly one `AuthorizationDenial` is produced carrying the actor identity, the attempted operation, the target record reference where one exists, the denial reason and the `ClockPort` timestamp; it contains no credential, no token and no password; and the reason matches the one the predicate returned to the caller.

- Test data: an actor lacking the permission, `FixedClock` · Dependencies: none · Covers: US-C10-16 (`T-C10-62`) · Blocked on: which operations are privileged

#### AT-C10-53 — Ordinary denials and anonymous rejections produce nothing — P1 — type: Unit — impl: `backend-engineer` — **blocked: F16**

**Given** a visibility denial on a non-privileged operation, and an unauthenticated request rejected by the global guard
**When** each occurs
**Then** neither produces a denial record — the first because the requirement is scoped to privileged operations, the second because it is an authentication failure, not an authorization denial.

- Test data: a requester denied on another record; an anonymous request · Dependencies: none · Covers: US-C10-16

#### AT-C10-54 — A denial record is durably recorded and readable — P0 — **NOT WRITABLE** — **blocked: F17**

This scenario cannot be specified until the Architect chooses the destination — a `C18` audit entry or a dedicated `identity-access` security log — and the Product Owner confirms retention and access. Writing it against either option now would encode a guess as an acceptance criterion.

**Consequence if the decision is deferred:** `US-C10-16` ships only as far as `AT-C10-52` and `AT-C10-53` — the record is produced and handed to an unbound port — and **`FR-IAM-07` remains unsatisfied**. That must be reported at the epic review, not quietly closed.

---

## Coverage summary

| Type | Count | Priority split | Impl owner |
| --- | --- | --- | --- |
| Unit | 19 | P0:13 P1:6 | `backend-engineer` — all 19; Angular component tests are ticket-level, see below |
| Integration | 9 | P0:6 P1:2 P2:1 | `backend-engineer` |
| API-E2E | 19 | P0:15 P1:4 | `apps/api-e2e` — e2e-harness work, backend platform, `type:e2e` |
| E2E | 6 | P0:3 P1:3 | `apps/web-e2e` — e2e-harness work, frontend platform, `type:e2e` |
| **Total** | **53** | **P0:37 P1:15 P2:1** | plus `AT-C10-54`, not writable (F17) |

Five of the 53 are **blocked** — `AT-C10-49` to `AT-C10-53` — and `AT-C10-54` cannot be written at all. Runnable acceptance today: **48 scenarios**.

Component-level Jest tests for the Angular pieces (`T-C10-13` to `T-C10-15`, `T-C10-30`, `T-C10-49`, `T-C10-50`, `T-C10-53`, `T-C10-58`, `T-C10-61`) are specified inside those tickets and owned by `frontend-engineer`; they are not repeated here, because a component test is a ticket-completion check rather than an epic acceptance scenario.

## Coverage by requirement

| Requirement | Stories | Scenarios | Runnable today |
|---|---|---|---|
| `FR-IAM-01` | US-C10-01, 02, 03, 09 | AT-C10-01 → 12, 29 → 31 | ✅ 15 |
| `FR-IAM-02` | US-C10-04, 05 | AT-C10-13 → 19 | ✅ 7 |
| `FR-IAM-03` | US-C10-06, 07, 08 | AT-C10-20 → 28 | ✅ 9, at predicate level only (**F15**) |
| `FR-IAM-04` | US-C10-09, 10 | AT-C10-29 → 35 | ✅ 7 |
| `FR-IAM-05` | US-C10-11, 12, 13 | AT-C10-36 → 45 | ✅ 10, publication only (**F5**) |
| `FR-IAM-06` | US-C10-14, 15 | AT-C10-46 → 51 | ⚠ 3 of 6 — step-up blocked by **F16** |
| `FR-IAM-07` | US-C10-16 | AT-C10-52 → 54 | ⛔ 0 — blocked by **F16** and **F17** |

## Risk-based notes

**Where the depth is spent.** `FR-IAM-01` carries 15 scenarios because it is the precondition of all 18 other epics and the one requirement whose failure is silent: an anonymous route does not throw, it just answers. `AT-C10-06` and `AT-C10-07` are enumerations rather than examples for that reason — they are the only assertions that keep holding as routes are added by later epics, and they should be treated as a permanent gate, not as `C10` acceptance that can be retired.

**Where depth was deliberately not spent.** The visibility predicates (`FR-IAM-03`) get nine tight unit scenarios rather than an E2E sweep, because the records they filter do not exist in this epic (**F15**). Adding a shallow E2E over a stub ticket would create a test that proves the stub, then rots the moment `C1` lands.

**Determinism.** Every time-dependent scenario — session expiry, step-up window, event timestamps — runs on `FixedClock` (`T-C10-09`, ADR-009). No scenario in this plan sleeps, and none asserts against wall-clock time.

**Regression posture.** No defect story exists in this epic, so no mandatory regression scenario applies. The nearest equivalent is `AT-C10-40`: once permissions are resolved per request, any later change that reintroduces trust in token claims fails it immediately.

## Open decisions this plan cannot resolve

| Finding | Decision needed | Owner | Blocks |
|---|---|---|---|
| **F16** | Enumerate which operations are *privileged*. `US-C10-15` proposes role assignment and revocation plus Admin Console configuration of catalog, taxonomy, SLA policies, workflows and notification templates — an assumption, not a decision. | Product Owner | `T-C10-59`, `T-C10-60`, `T-C10-61`, `T-C10-62` · `AT-C10-49` → `AT-C10-53` |
| **F17** | Choose where a denied authorization is recorded: a `C18` audit entry or a dedicated `identity-access` security log, with its immutability guarantee and retention. | Architect, with the Product Owner confirming retention and access | `T-C10-63` · `AT-C10-54` |
| **F9** | Assign a phase to `FR-IAM-04`, `FR-IAM-06` and `FR-IAM-07`. `FR-IAM-06` is a security control landing at no stated point. | Product Owner | Sequencing of blocks F, G, H — 12 tickets, 30.5h |
