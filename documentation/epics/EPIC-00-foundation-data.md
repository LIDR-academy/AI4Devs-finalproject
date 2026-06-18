# EPIC-00 — Foundation Data & Tenant Identity
> Priority: 1.1 | Status: ✅ Stories + tasks defined

---

## Overview

Establishes the minimum database schema and seed data that every subsequent epic depends on but that no single epic owns cleanly. Without this epic, EPIC-07 (Jira integration), EPIC-02 (ticket management), EPIC-08 (inbound webhooks), and EPIC-03 (comments/attachments) cannot be developed or tested end-to-end, because they all require:

1. A `client_id` claim in the JWT — which requires `ApplicationUser.ClientId` to be stored in `identity` and emitted by a `ClientIdClaimHandler`.
2. `Client`, `ClientUser`, and `ClientProject` tables in the `api` database — which are the FK targets for `Ticket.ClientId`, `Notification.ClientUserId`, and `JiraProjectKey` resolution.
3. At least one seeded `Client`, `ClientUser`, `ClientProject`, and matching `ApplicationUser` so every epic can be developed and tested with real data from day one.

**EPIC-00 delivers schema and seed data only.** It does not build any admin UI, invitation flows, or management endpoints — those are EPIC-05's responsibility. The entities created here are intentionally minimal stubs that EPIC-05 and EPIC-05B will layer their admin use cases on top of.

---

## Architecture Note

### Why this epic exists

The original backlog placed `Client`, `ClientUser`, and `ClientProject` entity ownership inside EPIC-05 (priority 8) and EPIC-05B (priority 9). However, EPIC-07 (priority 3) through EPIC-03 (priority 6) all depend on these tables being present and populated at runtime:

- `CreateTicketUseCase` (EPIC-07) resolves `JiraProjectKey` from `ClientProject` — the query fails if the table doesn't exist.
- `ListTicketsUseCase` (EPIC-02) filters by `clientId` extracted from the JWT `client_id` claim — the claim doesn't exist if `ApplicationUser.ClientId` isn't stored and emitted.
- `Notification` (EPIC-08) carries `ClientUserId` — the FK target doesn't exist if `ClientUser` isn't in the schema.
- Every `api` controller that reads `clientId` from the JWT claim (`TASK-07.1.6`, `TASK-02.1.4`, `TASK-02.2.2`, etc.) is untestable without this claim being present.

This epic breaks the circular dependency by delivering schema + seed data at priority 1.1 — immediately after the base infrastructure scaffolding (EPIC-09), and before EPIC-01 is fully exercised.

---

### Architectural decision: `ClientId` stored on `ApplicationUser` (Option A)

The `client_id` claim in the JWT must come from somewhere the `identity` server can read at token issuance time. Two options were considered:

**Option A (chosen):** Store `ClientId` as a nullable `Guid` on `ApplicationUser` in the `identity` database.
- `identity` already carries non-identity concerns (`PreferredLanguage`) — a bare Guid tenant identifier is no different in character.
- Login does not depend on `api` being healthy — no cross-service HTTP call at token issuance time.
- `ClientIdClaimHandler` reads from `UserManager<ApplicationUser>` directly; no extra round-trip.
- `null` for Admin users — the handler skips emitting the claim when null. `api` controllers that require `client_id` are `[Authorize(Roles = "Client")]` and will never be reached by Admin JWTs.

**Option B (rejected):** `identity` calls `GET /internal/users/{userId}/client-id` on `api` at token issuance time.
- Creates a circular failure mode: if `api` is down, login fails for all users.
- Adds latency to every token issuance.
- Couples the auth critical path to a business service.

---

### Entity ownership clarification

| Entity | Owner | Created in | Admin UI |
|---|---|---|---|
| `ApplicationUser.ClientId` | `identity` repo | **EPIC-00** (TASK-00.1) | Set during invite (EPIC-05) |
| `Client` | `api` repo | **EPIC-00** (TASK-00.2) | EPIC-05 (CRUD) |
| `ClientUser` | `api` repo | **EPIC-00** (TASK-00.2) | EPIC-05 (invite, edit, deactivate) |
| `ClientProject` | `api` repo | **EPIC-00** (TASK-00.3) | EPIC-05B (upsert Jira key) |
| Seed data | both repos | **EPIC-00** (TASK-00.4) | n/a |

EPIC-05 and EPIC-05B do **not** create migrations for these entities — they add use cases, repositories, and controllers on top of the schema EPIC-00 already owns.

---

### `ClientProject` stub fields

EPIC-00 creates `ClientProject` with only the fields needed before EPIC-05B:

| Field | Type | Notes |
|---|---|---|
| `Id` | Guid | `BaseEntity` |
| `ClientId` | Guid | Unique FK → `Clients` |
| `JiraProjectKey` | string? | Max 20, nullable until admin configures it |
| `JiraWebhookSecretHash` | string? | Nullable — added here so EPIC-08 doesn't need its own migration for this column |

EPIC-05B adds `IClientProjectRepository` methods and the admin use cases on top of this schema without any migration changes.

EPIC-08 (TASK-08.1.1) described itself as the owner of the `ClientProject` stub — that task is superseded by EPIC-00. EPIC-08 retains ownership only of the `JiraWebhookController` and webhook-handling use cases.

---

### Seed data strategy

A `DataSeeder` class is run automatically in `Development` mode on startup (both `identity` and `api`). It is **idempotent** — it checks for existing records before inserting and is safe to run on every startup. It produces:

**`identity` seed (via `UserManager`):**
- 1 Admin user: `admin@supporthub.dev` / `Admin123!` — role `Admin`, `ClientId: null`
- 1 Client user: `alice@acmecorp.dev` / `Client123!` — role `Client`, `ClientId: <AcmeCorp Guid>`

**`api` seed (via `AppDbContext`):**
- 1 `Client`: `{ Id: <AcmeCorp Guid>, Name: "Acme Corp" }`
- 1 `ClientUser`: `{ UserId: <alice's identity Guid>, ClientId: <AcmeCorp Guid>, Email: "alice@acmecorp.dev", FirstName: "Alice", LastName: "Demo", Status: Active }`
- 1 `ClientProject`: `{ ClientId: <AcmeCorp Guid>, JiraProjectKey: null }` — admin fills in the real key via EPIC-05B UI

The `AcmeCorp Guid` is a **well-known fixed Guid** hardcoded in both seeders so the cross-service reference is consistent without any inter-service call at seed time.

---

## User Stories

---

### US-00.1 — Foundation schema and tenant identity claim
> *As a developer, I need the Client, ClientUser, and ClientProject tables to exist in the database and the client_id claim to be present in the JWT so that all subsequent epics can be developed and tested against a real schema with real data.*

This story has no user-facing acceptance criteria — it is a pure technical prerequisite. Its "done" state is: a developer can log in as `alice@acmecorp.dev`, receive a JWT containing `client_id`, and use that claim to call any `api` endpoint without errors.

**Story Points:** 5

---

#### TASK-00.1 — `ApplicationUser.ClientId`, `ClientIdClaimHandler`, and migration (`identity`)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-01.A (ApplicationUser entity and migration must exist — this task adds a column to it)

> **Note on ordering:** TASK-00.1 depends on TASK-01.A because it adds a migration on top of `AspNetUsers`. In practice, TASK-00.1 should be executed immediately after TASK-01.A in the same sprint. Alternatively, if the team prefers, TASK-00.1 can be merged into TASK-01.A by the implementer to produce a single migration — the constraint is logical, not rigid.

**What to build:**

1. **`ApplicationUser.ClientId`** — add a nullable `Guid?` property `ClientId` to `ApplicationUser` (`Identity.Infrastructure/Identity/ApplicationUser.cs`). No navigation property. No FK constraint in `identity` — this is a bare identifier that mirrors a `Client` record in the `api` database.

2. **`ApplicationUserConfiguration`** — extend the existing configuration (or create it if not yet present from TASK-01.A) to configure `ClientId` as `uuid NULL` with no FK. Column name: `ClientId`.

3. **EF Core migration** — generate `AddClientIdToApplicationUser` migration in `Identity.Infrastructure/Migrations/`. The migration adds a single nullable `uuid` column to `AspNetUsers` in the `identity` schema.

4. **`ClientIdClaimHandler`** (`Identity.Infrastructure/OpenIddict/ClientIdClaimHandler.cs`) — implement `IOpenIddictServerHandler<ProcessSignInContext>`. Reads `ApplicationUser.ClientId` via `UserManager<ApplicationUser>.FindByIdAsync(subject)`. If `ClientId` is not null, emits a `client_id` claim to the access token only (`Destinations.AccessToken`). If `ClientId` is null (Admin user), no claim is emitted — the handler exits without error. Register via `.AddServer(opts => opts.AddEventHandler<ProcessSignInContext>(ClientIdClaimHandler.Descriptor))` in `DependencyInjection.cs`.

**Constraints:**
- `ClientId` is nullable — Admin users have `null`, Client users have a value. Never throw or error on null.
- Claim name: `"client_id"` (lowercase, consistent with OAuth2 conventions and how EPIC-07/02 controllers read it).
- Destination: `AccessToken` only — not the identity token.
- `ClientIdClaimHandler` follows the exact same pattern as `LocaleClaimHandler` from TASK-01.A. Use it as a reference implementation.
- Use Context7 to look up the current OpenIddict `IOpenIddictServerHandler<ProcessSignInContext>` API before implementing.
- All DI registration goes in `AddInfrastructure` / `DependencyInjection.cs`.
- No raw SQL in the migration.

**Definition of Done:**
- [ ] `ApplicationUser` has `ClientId` (`Guid?`, no navigation property).
- [ ] `ApplicationUserConfiguration` configures `ClientId` as `uuid NULL`.
- [ ] Migration `AddClientIdToApplicationUser` exists in `Identity.Infrastructure/Migrations/` and applies cleanly.
- [ ] `ClientIdClaimHandler` exists at `Identity.Infrastructure/OpenIddict/ClientIdClaimHandler.cs` and is registered in `AddInfrastructure`.
- [ ] A Client user's JWT contains a `client_id` claim whose value matches their `ApplicationUser.ClientId`.
- [ ] An Admin user's JWT contains no `client_id` claim (the handler does not emit one when null).
- [ ] `dotnet build` succeeds.

---

#### TASK-00.2 — `Client`, `ClientUser` domain entities, EF Core config, and migration (`api`)
**Layer:** Domain + Infrastructure
**Repo:** api
**Depends on:** TASK-01.6.1 (AppDbContext must exist)

**What to build:**

**`Client` entity** (`Api.Domain/Clients/Client.cs`):
- Inherits `BaseEntity`.
- Fields: `Name` (string, max 200, unique), `Description` (string?, max 1000), `IsDeleted` (bool, default false).
- No navigation properties — EPIC-05 adds those when it builds the repository layer.

**`ClientUser` entity** (`Api.Domain/Clients/ClientUser.cs`):
- Inherits `BaseEntity`.
- Fields: `UserId` (Guid — bare, no FK to identity), `ClientId` (Guid, FK → `Clients`), `Email` (string, max 256), `FirstName` (string, max 100), `LastName` (string, max 100), `Status` (`ClientUserStatus` enum: `PendingActivation | Active | Inactive`), `InvitedAt` (DateTimeOffset), `ActivatedAt` (DateTimeOffset?), `IsDeleted` (bool, default false).
- Static factory method `ClientUser.Create(Guid clientId, string email, string firstName, string lastName)` — sets `Status = PendingActivation`, `InvitedAt = DateTimeOffset.UtcNow`.

**`ClientUserStatus` enum** (`Api.Domain/Clients/ClientUserStatus.cs`):
```
PendingActivation = 0
Active = 1
Inactive = 2
```

**EF Core configurations:**
- `ClientConfiguration` (`Api.Infrastructure/Persistence/Configurations/ClientConfiguration.cs`): table `Clients`, `public` schema; unique index on `Name`; `IsDeleted` global query filter; `Description` max 1000; `Name` max 200 not null.
- `ClientUserConfiguration` (`Api.Infrastructure/Persistence/Configurations/ClientUserConfiguration.cs`): table `ClientUsers`, `public` schema; `ClientId` FK → `Clients.Id` `ON DELETE RESTRICT`; unique index on `UserId`; `IsDeleted` global query filter; `Email` max 256; `FirstName` max 100; `LastName` max 100; `Status` stored as `int`.

Add `DbSet<Client>` and `DbSet<ClientUser>` to `AppDbContext`.

**EF Core migration** — generate `AddClientAndClientUser` in `Api.Infrastructure/Persistence/Migrations/`.

**Constraints:**
- No repository interfaces yet — EPIC-05 owns `IClientRepository` and `IClientUserRepository`. This task only creates the entities, configurations, and migration.
- No use cases, no controllers.
- No Data Annotations on entities — Fluent API only.
- `IsDeleted` global query filters must be applied in the EF Core configurations (not `OnModelCreating`).
- Migration must not contain raw SQL.
- Auto-migration on startup in `Development` only (already configured in `Program.cs` from EPIC-09 scaffolding — nothing to change here).

**Definition of Done:**
- [ ] `Client` entity exists at `Api.Domain/Clients/Client.cs`.
- [ ] `ClientUser` entity exists at `Api.Domain/Clients/ClientUser.cs` with factory method.
- [ ] `ClientUserStatus` enum exists at `Api.Domain/Clients/ClientUserStatus.cs`.
- [ ] `ClientConfiguration` and `ClientUserConfiguration` exist in `Api.Infrastructure/Persistence/Configurations/`.
- [ ] `AppDbContext` has `DbSet<Client>` and `DbSet<ClientUser>`.
- [ ] Migration `AddClientAndClientUser` exists and applies cleanly.
- [ ] `dotnet build` succeeds.

---

#### TASK-00.3 — `ClientProject` stub entity, EF Core config, and migration (`api`)
**Layer:** Domain + Infrastructure
**Repo:** api
**Depends on:** TASK-00.2 (Client table must exist — ClientProject has a FK to Clients)

**What to build:**

**`ClientProject` entity** (`Api.Domain/Clients/ClientProject.cs`):
- Inherits `BaseEntity`.
- Fields: `ClientId` (Guid, FK → `Clients`), `JiraProjectKey` (string?, max 20, nullable), `JiraWebhookSecretHash` (string?, nullable).
- This is a 1:1 extension of `Client`. `ClientId` carries a unique index.

**`ClientProjectConfiguration`** (`Api.Infrastructure/Persistence/Configurations/ClientProjectConfiguration.cs`):
- Table `ClientProjects`, `public` schema.
- `ClientId`: FK → `Clients.Id`, `ON DELETE CASCADE`, unique index.
- `JiraProjectKey`: max 20, nullable.
- `JiraWebhookSecretHash`: max 256, nullable.
- No `IsDeleted` — `ClientProject` follows the lifecycle of its `Client`; cascade delete handles cleanup.

Add `DbSet<ClientProject>` to `AppDbContext`.

**EF Core migration** — generate `AddClientProject` in `Api.Infrastructure/Persistence/Migrations/`.

**Constraints:**
- No repository interface yet — EPIC-05B owns `IClientProjectRepository`. This task only creates the entity, configuration, and migration.
- No use cases, no controllers.
- `JiraWebhookSecretHash` is included here so EPIC-08 does not need its own migration for this column. EPIC-08's TASK-08.1.1 is superseded by this task — the column already exists.
- No Data Annotations on the entity — Fluent API only.
- No raw SQL in the migration.

**Definition of Done:**
- [ ] `ClientProject` entity exists at `Api.Domain/Clients/ClientProject.cs` with all four fields.
- [ ] `ClientProjectConfiguration` exists in `Api.Infrastructure/Persistence/Configurations/`.
- [ ] `AppDbContext` has `DbSet<ClientProject>`.
- [ ] Migration `AddClientProject` exists and applies cleanly.
- [ ] `dotnet build` succeeds.

---

#### TASK-00.4 — Dev seed data (`identity` + `api`)
**Layer:** Infrastructure
**Repos:** identity, api
**Depends on:** TASK-00.1 (identity schema), TASK-00.3 (api schema complete)

**What to build:**

**`identity` — `IdentityDataSeeder`** (`Identity.Infrastructure/Persistence/IdentityDataSeeder.cs`):

Idempotent seeder called from `Program.cs` after `app.MigrateDatabase()` in `Development` mode only. Uses `UserManager<ApplicationUser>` and `RoleManager<IdentityRole<Guid>>`.

Seeds:
1. Roles: ensure `"Admin"` and `"Client"` roles exist.
2. Admin user: email `admin@supporthub.dev`, password `Admin123!`, role `Admin`, `ClientId: null`, `PreferredLanguage: "es"`, `EmailConfirmed: true`.
3. Client user: email `alice@acmecorp.dev`, password `Client123!`, role `Client`, `ClientId: Guid("11111111-1111-1111-1111-111111111111")` (the well-known Acme Corp Guid), `PreferredLanguage: "es"`, `EmailConfirmed: true`.

Idempotency: check `await userManager.FindByEmailAsync(email) != null` before creating. If the user already exists, skip — do not update.

**`api` — `ApiDataSeeder`** (`Api.Infrastructure/Persistence/ApiDataSeeder.cs`):

Idempotent seeder called from `Program.cs` after `app.MigrateDatabase()` in `Development` mode only. Uses `AppDbContext` directly (no repository layer yet).

Seeds (skip each if already present — check by `Id` or `Name`):
1. `Client`: `{ Id: Guid("11111111-1111-1111-1111-111111111111"), Name: "Acme Corp", Description: "Demo client for development", IsDeleted: false }`.
2. `ClientUser`: `{ UserId: <alice's UserId from identity — resolved by querying identity DB or hardcoded as a well-known Guid — see constraint below>, ClientId: Guid("11111111-1111-1111-1111-111111111111"), Email: "alice@acmecorp.dev", FirstName: "Alice", LastName: "Demo", Status: Active, InvitedAt: UtcNow, ActivatedAt: UtcNow, IsDeleted: false }`.
3. `ClientProject`: `{ ClientId: Guid("11111111-1111-1111-1111-111111111111"), JiraProjectKey: null, JiraWebhookSecretHash: null }`.

**Constraints:**
- Both seeders are idempotent — safe to run on every app startup. Never throw if data already exists.
- Called only when `app.Environment.IsDevelopment()` — never in Production or Staging.
- The well-known Acme Corp Guid `11111111-1111-1111-1111-111111111111` is defined as a `public static readonly Guid` constant in a shared file per repo (e.g. `SeedConstants.cs` in `Identity.Infrastructure/Persistence/` and `Api.Infrastructure/Persistence/`) so it is never a magic string.
- **Alice's `UserId`**: since `identity` and `api` run as separate services with no shared DB context, Alice's identity `UserId` must also be a well-known fixed Guid. Define `SeedConstants.AliceUserId = Guid("22222222-2222-2222-2222-222222222222")`. The `identity` seeder sets this as the user's `Id` when creating Alice (requires creating `ApplicationUser` with a predetermined Id via `userManager.CreateAsync` — pass the pre-constructed entity). The `api` seeder uses the same constant for `ClientUser.UserId`.
- Seed passwords (`Admin123!`, `Client123!`) are **only for Development**. Document this clearly with a comment in both seeder files.
- No seed data for Production — the `if (!app.Environment.IsDevelopment()) return;` guard is mandatory.
- Seeder classes are `internal`.

**Definition of Done:**
- [ ] `IdentityDataSeeder` exists at `Identity.Infrastructure/Persistence/IdentityDataSeeder.cs` and is called from `identity`'s `Program.cs` in Development.
- [ ] `ApiDataSeeder` exists at `Api.Infrastructure/Persistence/ApiDataSeeder.cs` and is called from `api`'s `Program.cs` in Development.
- [ ] `SeedConstants.cs` exists in each repo with the well-known Guids.
- [ ] Starting both services in Development mode produces the seed records if they don't already exist.
- [ ] `admin@supporthub.dev` can log in and receive a JWT with `role: "Admin"` and no `client_id` claim.
- [ ] `alice@acmecorp.dev` can log in and receive a JWT with `role: "Client"` and `client_id: "11111111-1111-1111-1111-222222222222"`.

  > **Correction:** `client_id` claim value is `alice`'s `ClientId` on `ApplicationUser`, which is the Acme Corp Guid `11111111-1111-1111-1111-111111111111`.

- [ ] `Clients`, `ClientUsers`, and `ClientProjects` tables exist in `api`'s `public` schema and have the seed rows.
- [ ] `dotnet build` succeeds for both repos.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-00.1 | Foundation schema and tenant identity claim | 5 |
| **Total** | | **5** |

### Task breakdown

| Task | Title | Repo | Depends on |
|---|---|---|---|
| TASK-00.1 | `ApplicationUser.ClientId` + `ClientIdClaimHandler` + migration | identity | TASK-01.A |
| TASK-00.2 | `Client` + `ClientUser` entities, config, migration | api | TASK-01.6.1 |
| TASK-00.3 | `ClientProject` stub entity, config, migration | api | TASK-00.2 |
| TASK-00.4 | Dev seed data (identity + api) | identity + api | TASK-00.1, TASK-00.3 |

---

> **Note for Tech Lead:**
>
> - **Execution order within the sprint:** TASK-00.1 can run in parallel with TASK-00.2 (different repos). TASK-00.3 runs after TASK-00.2. TASK-00.4 runs last (requires all schema to be in place).
> - **EPIC-05 impact:** EPIC-05's TASK-05.9.1 (`Client` domain entity) and TASK-05.5.2 (`ClientUser` domain entity) are **superseded** by TASK-00.2. EPIC-05 developers should skip those tasks and proceed directly to the repository and use-case tasks that build on the entities EPIC-00 already delivered. The EPIC-05 architecture note stating "The `Client` entity does not exist yet — EPIC-05 creates it" is superseded by this epic.
> - **EPIC-08 impact:** EPIC-08's TASK-08.1.1 described creating a `ClientProject` stub entity and adding `JiraWebhookSecretHash`. That is superseded by TASK-00.3 here. EPIC-08 developers do not need to run any migration — the column already exists.
> - **`ClientIdClaimHandler` ordering in OpenIddict pipeline:** Multiple `IOpenIddictServerHandler<ProcessSignInContext>` handlers can be registered and will all execute in registration order. `LocaleClaimHandler` (TASK-01.A) and `ClientIdClaimHandler` (TASK-00.1) are independent — registration order does not matter between them.
> - **Admin users never receive `client_id`:** Any `api` controller action that reads `CurrentClientId` from the JWT and requires it to be non-null must be `[Authorize(Roles = "Client")]`. Admin-scoped actions (`[Authorize(Roles = "Admin")]`) must never read `client_id` — they operate without a tenant scope.
> - **`ApiControllerBase.CurrentClientId`:** TASK-01.6.1 defines `ApiControllerBase`. It must include `protected Guid CurrentClientId` as a helper that reads the `client_id` claim and throws `UnauthorizedAccessException` if absent (this case cannot occur for `[Authorize(Roles = "Client")]` endpoints, but is a safety net). See the EPIC-01 update note.
