# EPIC-11 — Audit Log
> Priority: 1.6 (after EPIC-10, before EPIC-01) | Status: ✅ Stories + tasks defined

---

## Architecture Note

### Resolved decisions

**`AppDbContext` inheritance (US-11.1):** `AppDbContext` inherits from `AuditDbContext` (from `Audit.EntityFramework.Core`). This is the lowest-friction approach: all `SaveChangesAsync` calls are automatically intercepted with zero per-feature code. `AuditLog` is mapped as a regular `DbSet<AuditLog>` on `AppDbContext`, so audit rows are written within the same PostgreSQL transaction as the business operation. No second `DbContext` is needed.

**Data provider wiring (US-11.1):** `Audit.Core.Configuration.Setup()` is called in `AddInfrastructure` (not in `Program.cs`) and targets `AppDbContext` via `UseEntityFrameworkCoreProvider`. The `AuditTypeMapper` maps all audit events to the single `AuditLog` entity — no per-entity mapping required.

**User ID + IP injection (US-11.1):** `IAuditContextProvider` (interface in `Api.Application/Common/Interfaces/`) exposes `CurrentUserId` and `CurrentIpAddress`. `HttpAuditContextProvider` (in `Api.Infrastructure/Audit/`) implements it via `IHttpContextAccessor`. Registered `Scoped`. `AppDbContext` receives it via constructor injection and calls `AddAuditCustomField("UserId", ...)` + `AddAuditCustomField("IpAddress", ...)` before each save via an override of `OnScopeCreated` or via a custom action on `AuditEventType`.

**Sensitive field exclusion (US-11.3):** Audit.NET's fluent API provides per-entity `Ignore`/`Override`/`Format` but has no built-in global name-pattern filter. The correct approach is a `Audit.Core.Configuration.AddCustomAction(ActionType.OnEventSaving, ...)` that iterates all `EntityFrameworkEvent.Entries` → `Entry.ColumnValues`, finds keys whose name contains any of the redaction patterns (`Password`, `Token`, `Secret`, `Hash`, `Salt`, case-insensitive), and replaces the value with `"[REDACTED]"`. This is registered once in `AddInfrastructure` and applies globally to every entity without per-entity configuration.

**`identity` audit writes (US-11.2):** `identity` does **not** use `AuditDbContext`. Auth events are written explicitly from controllers via `IAuditWriter` (interface in `Identity.Infrastructure/Audit/`). `AuditWriterService` appends rows to `identity.AuditLogs` using the existing `IdentityAppDbContext` with `AuditLog` added as a `DbSet`. No cross-service DB access. `OldData` and `NewData` are always null. The migration creating `identity.AuditLogs` runs alongside existing Identity/OpenIddict migrations.

**Audit failure behaviour:** If the audit write fails, the error is logged via Serilog at `Error` level but the business transaction is **not** rolled back. Audit failure is non-fatal (this is enforced by the library's internal exception handling when using the EF provider with try/catch on `SaveChangesAsync`).

**No UI in v1:** Both `public.AuditLogs` and `identity.AuditLogs` are DB-queryable only. No read endpoint is planned for this epic.

---

## Overview

Establishes a persistent, automatic audit trail for all database write operations and authentication events across both backend services. Every Insert, Update, and Delete on any tracked entity in the `api` service is recorded automatically via Audit.NET + EF Core integration. Authentication events (Login success, login failure, password reset, account activation) are recorded by the `identity` service.

**Each service owns its own audit log.** There is no shared audit table between `api` and `identity`. The `api` service writes to `public.AuditLogs` (within its own schema). The `identity` service writes to `identity.AuditLogs` (within its own schema). Both tables have an identical column structure. Each service owns and runs its own migration for its audit table. No cross-service DB access is required.

**This is infrastructure-level work.** No UI is planned for v1 — audit records are queryable directly from the database. The audit log is a cross-cutting, foundational concern and must be in place before any domain feature data is written to the database.

**Audit record schema:**

| Field | Type | Notes |
|---|---|---|
| `Id` | UUID | Primary key |
| `Timestamp` | timestamptz | UTC date and time of the operation |
| `Operation` | varchar | `INSERT`, `UPDATE`, `DELETE`, `LOGIN`, `LOGIN_FAILED`, `PASSWORD_RESET`, `ACCOUNT_ACTIVATION` |
| `EntityName` | varchar | Name of the entity/table affected (e.g. `User`, `Ticket`). Null for auth events. |
| `EntityId` | varchar | Primary key of the affected record. Null for auth events. |
| `OldData` | jsonb | Snapshot of data **before** the operation. Null for INSERT and auth events. |
| `NewData` | jsonb | Snapshot of data **after** the operation. Null for DELETE. |
| `UserId` | varchar | Identifier of the authenticated user who triggered the operation. Null for anonymous events (e.g. failed login). |
| `IpAddress` | varchar | IP address of the client at the time of the operation. |

**Library:** `Audit.NET` + `Audit.EntityFramework.Core` (NuGet). The library hooks into EF Core's `SaveChanges` pipeline automatically — no per-use-case instrumentation required.

---

## User Stories

---

### US-11.1 — All `api` database writes are automatically recorded in the audit log
> *As an administrator, I want every data modification in the system to be automatically captured in an audit log so that we have a complete, tamper-evident record of what changed, when, and by whom.*

**Acceptance Criteria:**
- [ ] Every `INSERT`, `UPDATE`, and `DELETE` operation on any EF Core-tracked entity in the `api` service is automatically recorded in the `AuditLogs` table in the `public` PostgreSQL schema (owned by `api`).
- [ ] Each audit record captures: timestamp (UTC), operation type, entity name, entity ID, old data as JSON (null for INSERT), new data as JSON (null for DELETE), the authenticated user's ID, and the client IP address.
- [ ] The user ID and IP address are injected automatically — no use case or controller needs to pass them explicitly.
- [ ] The audit log is written atomically within the same database transaction as the business operation — if the transaction rolls back, the audit record is not written.
- [ ] Sensitive fields (passwords, tokens, secrets) are excluded from the `OldData` / `NewData` JSON snapshots and never appear in the audit log.
- [ ] The audit log table is append-only from the application's perspective — no use case or controller may update or delete audit records.
- [ ] The mechanism requires no per-feature code changes — adding a new entity automatically falls under audit coverage.

**Story Points:** 5

---

#### TASK-11.1.1 — `AuditLog` entity and EF Core configuration (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** none

**What to build:**
Create the `AuditLog` entity class in `Api.Infrastructure/Audit/` and its EF Core `IEntityTypeConfiguration<AuditLog>` in `Api.Infrastructure/Persistence/Configurations/`. The entity maps to the `AuditLogs` table in the `public` schema and has no navigation properties or foreign key constraints — it is a pure append log. Add `DbSet<AuditLog>` to `AppDbContext`.

**Constraints:**
- `AuditLog` does **not** inherit from `BaseEntity` — it has its own `Id` (UUID, PK), `Timestamp` (timestamptz, UTC), and the remaining columns listed in the epic schema table.
- All string columns (`Operation`, `EntityName`, `EntityId`, `OldData`, `NewData`, `UserId`, `IpAddress`) are nullable except `Operation` and `Timestamp`.
- `OldData` and `NewData` map to PostgreSQL `jsonb` column type (`.HasColumnType("jsonb")`).
- No foreign key constraints on any column — `AuditLog` is fully decoupled from the entity graph.
- No EF Core navigation properties. No `IsDeleted` soft-delete filter.
- File-scoped namespace: `Api.Infrastructure.Audit`.
- `AuditLog` uses `init`-only properties and no public constructor (align with the shape in `backend-guidelines.md` section 15).

**Definition of Done:**
- [ ] `Api.Infrastructure/Audit/AuditLog.cs` exists with all columns from the epic schema.
- [ ] `Api.Infrastructure/Persistence/Configurations/AuditLogConfiguration.cs` exists and maps the entity to `public."AuditLogs"` with correct column types.
- [ ] `AppDbContext` has `DbSet<AuditLog> AuditLogs`.
- [ ] `dotnet build` succeeds for `Api.Infrastructure`.

---

#### TASK-11.1.2 — EF Core migration: `public.AuditLogs` table
**Layer:** DB
**Repo:** api
**Depends on:** TASK-11.1.1

**What to build:**
Generate and verify the EF Core migration that creates the `public.AuditLogs` table in the `api` database schema. The migration is produced by running `dotnet ef migrations add CreateAuditLogs` from `Api.Infrastructure` targeting `AppDbContext`.

**Constraints:**
- Migration lives in `Api.Infrastructure/Persistence/Migrations/`.
- The `Up()` method creates table `AuditLogs` in the `public` schema with all columns matching the entity configuration from TASK-11.1.1.
- `OldData` and `NewData` columns must be `jsonb`, not `text`.
- No foreign key constraints in the migration — audit rows are not referenced by any other table.
- Auto-migration on startup is Development-only (guarded by `app.Environment.IsDevelopment()`); this guard already exists from EPIC-09 — do not introduce a second call.

**Definition of Done:**
- [ ] Migration file exists under `Api.Infrastructure/Persistence/Migrations/` with `CreateAuditLogs` in its name.
- [ ] `dotnet ef migrations script` produces valid SQL that includes `CREATE TABLE "AuditLogs"` with a `jsonb` column for `OldData` and `NewData`.
- [ ] `dotnet build` succeeds for `Api.Infrastructure`.

---

#### TASK-11.1.3 — `IAuditContextProvider` interface, `HttpAuditContextProvider` implementation, and DI registration (`api`)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** none

**What to build:**
Define the `IAuditContextProvider` interface in `Api.Application/Common/Interfaces/` and implement `HttpAuditContextProvider` in `Api.Infrastructure/Audit/` using `IHttpContextAccessor`. Register both `IHttpContextAccessor` and `IAuditContextProvider → HttpAuditContextProvider` as `Scoped` in `AddInfrastructure`. This is a cohesive interface-plus-implementation unit — the interface is meaningless without the infrastructure implementation that fulfils it.

**Constraints:**
- Interface lives in `Api.Application/Common/Interfaces/IAuditContextProvider.cs` with two nullable string properties: `CurrentUserId` and `CurrentIpAddress`.
- No EF Core, no `HttpContext`, no ASP.NET Core references in `Api.Application` — the interface must stay framework-free.
- `HttpAuditContextProvider` lives in `Api.Infrastructure/Audit/HttpAuditContextProvider.cs`.
- `CurrentUserId` reads the `sub` claim via `FindFirstValue("sub")` — not `ClaimTypes.NameIdentifier`.
- `CurrentIpAddress` reads `HttpContext.Connection.RemoteIpAddress?.ToString()` — returns null gracefully if no connection.
- Both registrations are `Scoped`. `IHttpContextAccessor` registered via `services.AddHttpContextAccessor()` (idempotent).
- File-scoped namespaces: `Api.Application.Common.Interfaces` and `Api.Infrastructure.Audit` respectively.

**Definition of Done:**
- [ ] `Api.Application/Common/Interfaces/IAuditContextProvider.cs` exists with `string? CurrentUserId` and `string? CurrentIpAddress`.
- [ ] `Api.Infrastructure/Audit/HttpAuditContextProvider.cs` exists and implements `IAuditContextProvider`.
- [ ] `AddInfrastructure` registers `IAuditContextProvider` → `HttpAuditContextProvider` as `Scoped`.
- [ ] `Api.Application` has zero references to ASP.NET Core or EF Core assemblies.
- [ ] `dotnet build` succeeds for `Api.Application` and `Api.Infrastructure`.

---

#### TASK-11.1.5 — `AppDbContext` inherits `AuditDbContext` and wires custom fields (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-11.1.1, TASK-11.1.3

**What to build:**
Change `AppDbContext`'s base class from `DbContext` to `AuditDbContext` (from `Audit.EntityFramework.Core`). Inject `IAuditContextProvider` into the `AppDbContext` constructor. Override `OnScopeCreated` (or use a pre-save hook) to call `AddAuditCustomField("UserId", ...)` and `AddAuditCustomField("IpAddress", ...)` so every audit scope carries the authenticated user's identity and client IP automatically.

**Constraints:**
- `AppDbContext` constructor receives `IAuditContextProvider` via constructor injection alongside `DbContextOptions<AppDbContext>`.
- Base class changes to `AuditDbContext` — no other `DbContext` superclass.
- Custom fields are set per audit scope, not globally, so concurrent requests do not bleed values across scopes.
- `IAuditContextProvider` may return null values (unauthenticated request) — null values must be handled gracefully (pass null to `AddAuditCustomField`, do not throw).
- `AuditDbContext` must be registered via `AddDbContext<AppDbContext>` in `AddInfrastructure` as before — no change to registration style.
- NuGet package `Audit.EntityFramework.Core` added to `Api.Infrastructure`.

**Definition of Done:**
- [ ] `AppDbContext` base class is `AuditDbContext`.
- [ ] `AppDbContext` constructor accepts `IAuditContextProvider` and calls `AddAuditCustomField` for `UserId` and `IpAddress`.
- [ ] `dotnet build` succeeds for `Api.Infrastructure` and `Api.API`.
- [ ] `Audit.EntityFramework.Core` appears in `Api.Infrastructure.csproj` package references.

---

#### TASK-11.1.6 — Audit.NET data provider configuration in `AddInfrastructure` (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-11.1.5

**What to build:**
Configure `Audit.Core.Configuration.Setup()` in `AddInfrastructure` to route all EF Core audit events to the `AppDbContext`-backed `AuditLog` entity. This wires Audit.NET's data provider to write audit rows into `public.AuditLogs` atomically within the same EF Core transaction as the triggering operation.

**Constraints:**
- Call `Audit.Core.Configuration.Setup().UseEntityFrameworkCoreProvider(x => x.UseDbContext<AppDbContext>().AuditTypeMapper(t => typeof(AuditLog)))` inside `AddInfrastructure` after `AddDbContext`.
- The `AuditTypeMapper` must map **all** entity types (wildcard) to `AuditLog` — no per-entity mapping.
- `Audit.NET` and `Audit.EntityFramework.Core` NuGet packages are referenced in `Api.Infrastructure` only — not in `Api.Application` or `Api.Domain`.
- Configuration is called once at startup — do not call inside a request pipeline or middleware.
- `Audit.EntityFramework.Configuration.Setup().ForContext<AppDbContext>().UseOptOut()` is set so all tracked entities are audited by default (opt-out mode); new entities are automatically included without configuration.

**Definition of Done:**
- [ ] `AddInfrastructure` contains `Audit.Core.Configuration.Setup()` with `UseEntityFrameworkCoreProvider` targeting `AppDbContext`.
- [ ] `Audit.EntityFramework.Configuration.Setup().ForContext<AppDbContext>().UseOptOut()` is configured.
- [ ] `dotnet build` succeeds.
- [ ] A manual insert to any tracked entity (verified via `dotnet run` + direct DB query) produces a row in `public.AuditLogs`.

---

### US-11.2 — Authentication events in `identity` are recorded in the audit log
> *As an administrator, I want login attempts, password resets, and account activations to appear in the audit log so that security-relevant authentication events are traceable alongside data changes.*

**Acceptance Criteria:**
- [ ] A successful login records an audit entry with operation `LOGIN`, the user's ID, timestamp, and IP address.
- [ ] A failed login records an audit entry with operation `LOGIN_FAILED`, the attempted email (as `EntityId`), timestamp, and IP address. `UserId` is null (unauthenticated request).
- [ ] A successful password reset records an audit entry with operation `PASSWORD_RESET`, the user's ID, timestamp, and IP address.
- [ ] A successful account activation records an audit entry with operation `ACCOUNT_ACTIVATION`, the user's ID, timestamp, and IP address.
- [ ] `identity` writes these records to its own `AuditLogs` table in the `identity` PostgreSQL schema — no cross-service DB access and no HTTP call to `api`.
- [ ] `OldData` and `NewData` are null for all auth events.
- [ ] The `identity.AuditLogs` table has an identical column structure to `public.AuditLogs`, and is created by a migration owned by the `identity` repo.

**Story Points:** 3

---

#### TASK-11.2.1 — `AuditLog` entity and EF Core configuration (`identity`)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** none

**What to build:**
Create the `AuditLog` entity class in `Identity.Infrastructure/Audit/` and its `IEntityTypeConfiguration<AuditLog>` in `Identity.Infrastructure/Persistence/Configurations/`. The entity maps to the `AuditLogs` table in the `identity` PostgreSQL schema. Add `DbSet<AuditLog>` to `IdentityAppDbContext`. The column structure is identical to the `api` service's `AuditLog`.

**Constraints:**
- `AuditLog` in `identity` has an identical column structure to the one in `api` (same fields, same types, same nullability rules).
- Maps to `identity."AuditLogs"` — schema is `identity`, not `public`.
- `OldData` and `NewData` map to `jsonb` column type.
- No foreign key constraints, no navigation properties.
- `IdentityAppDbContext` is **not** changed to inherit from `AuditDbContext` — the `identity` service writes audit rows explicitly, not via library interception.
- File-scoped namespace: `Identity.Infrastructure.Audit`.

**Definition of Done:**
- [ ] `Identity.Infrastructure/Audit/AuditLog.cs` exists with all columns from the epic schema.
- [ ] `Identity.Infrastructure/Persistence/Configurations/AuditLogConfiguration.cs` maps the entity to `identity."AuditLogs"`.
- [ ] `IdentityAppDbContext` has `DbSet<AuditLog> AuditLogs`.
- [ ] `dotnet build` succeeds for `Identity.Infrastructure`.

---

#### TASK-11.2.2 — EF Core migration: `identity.AuditLogs` table
**Layer:** DB
**Repo:** identity
**Depends on:** TASK-11.2.1

**What to build:**
Generate and verify the EF Core migration that creates the `identity.AuditLogs` table in the `identity` database schema. The migration runs alongside existing Identity and OpenIddict table migrations.

**Constraints:**
- Migration lives in `Identity.Infrastructure/Persistence/Migrations/`.
- The `Up()` method creates `AuditLogs` in the `identity` schema with all columns matching the entity configuration from TASK-11.2.1.
- `OldData` and `NewData` columns must be `jsonb`.
- No foreign key constraints in the migration.
- Migration is additive — it must not modify any existing Identity or OpenIddict tables.

**Definition of Done:**
- [ ] Migration file exists under `Identity.Infrastructure/Persistence/Migrations/` with `CreateAuditLogs` in its name.
- [ ] `dotnet ef migrations script` produces valid SQL that includes `CREATE TABLE identity."AuditLogs"` with `jsonb` columns.
- [ ] `dotnet build` succeeds for `Identity.Infrastructure`.

---

#### TASK-11.2.3 — `IAuditWriter` interface and `AuditWriterService` implementation (`identity`)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-11.2.1

**What to build:**
Define the `IAuditWriter` interface and implement `AuditWriterService` in `Identity.Infrastructure/Audit/`. The service appends a single `AuditLog` row to `identity.AuditLogs` via `IdentityAppDbContext`. Register `IAuditWriter → AuditWriterService` as `Scoped` in `AddInfrastructure`.

**Constraints:**
- Interface: `Task WriteAsync(string operation, string? entityId, string? userId, string? ipAddress, CancellationToken ct)`.
- Implementation appends a new `AuditLog` row and calls `SaveChangesAsync` — it does not share a transaction with an outer operation (auth events are fire-and-observe, not part of a business transaction).
- `OldData` and `NewData` are always `null` for auth events — do not accept or write these fields.
- `Timestamp` is always `DateTimeOffset.UtcNow`.
- If `WriteAsync` throws, the exception is **not** re-thrown to the caller — it is caught and logged via `ILogger<AuditWriterService>` at `Error` level. Audit failure is non-fatal.
- File-scoped namespace: `Identity.Infrastructure.Audit`.
- Registered as `Scoped` in `Identity.Infrastructure/DependencyInjection.cs`.

**Definition of Done:**
- [ ] `Identity.Infrastructure/Audit/IAuditWriter.cs` exists with the `WriteAsync` signature.
- [ ] `Identity.Infrastructure/Audit/AuditWriterService.cs` exists and implements `IAuditWriter`.
- [ ] `AddInfrastructure` registers `IAuditWriter → AuditWriterService` as `Scoped`.
- [ ] `dotnet build` succeeds for `Identity.Infrastructure`.

---

#### TASK-11.2.4 — Inject `IAuditWriter` into auth controllers and emit audit events (`identity`)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-11.2.3

**What to build:**
Inject `IAuditWriter` into the auth controllers in `Identity.API` and call `WriteAsync` after each auditable authentication outcome: successful login (`LOGIN`), failed login (`LOGIN_FAILED`), successful password reset (`PASSWORD_RESET`), and successful account activation (`ACCOUNT_ACTIVATION`). IP address is read from `HttpContext.Connection.RemoteIpAddress`.

**Constraints:**
- `IAuditWriter.WriteAsync` is called **after** the auth operation succeeds or is determined to have failed — not before.
- For `LOGIN_FAILED`: `userId` is `null`; `entityId` is the attempted email address.
- For `LOGIN`, `PASSWORD_RESET`, `ACCOUNT_ACTIVATION`: `userId` is the `ApplicationUser.Id`; `entityId` is `null`.
- IP address is extracted from `HttpContext.Connection.RemoteIpAddress?.ToString()` in the controller — not from a header.
- Audit write failures must not cause the HTTP response to change — the controller returns its normal response regardless. Wrap the `WriteAsync` call in a try/catch or rely on `AuditWriterService`'s internal swallowing per TASK-11.2.3.
- No `await`-on-fire-and-forget — always `await WriteAsync(...)` but do not propagate its exceptions.

**Definition of Done:**
- [ ] Auth controllers inject `IAuditWriter` via constructor.
- [ ] A successful login call produces a `LOGIN` row in `identity.AuditLogs` (verifiable by direct DB query).
- [ ] A failed login call produces a `LOGIN_FAILED` row with `UserId = null` and `EntityId = <attempted email>`.
- [ ] `dotnet build` succeeds for `Identity.API`.

---

### US-11.3 — Sensitive fields are excluded from audit snapshots
> *As a security officer, I want passwords, tokens, and other sensitive values to be automatically stripped from audit log JSON snapshots so that the audit log never becomes a source of credential leakage.*

**Acceptance Criteria:**
- [ ] The following fields are globally excluded from `OldData` / `NewData` snapshots across all entities: any field whose name contains `Password`, `Token`, `Secret`, `Hash`, or `Salt` (case-insensitive matching).
- [ ] Exclusion is configured centrally — not repeated per entity. Adding a new sensitive field name to the exclusion list applies to all entities immediately.
- [ ] A test or documentation confirms that `ApplicationUser.PasswordHash` does not appear in any audit record.
- [ ] Fields excluded from the snapshot are replaced with a placeholder string (e.g. `"[REDACTED]"`) rather than being silently omitted, so the presence of the field is still visible in the audit record.

**Story Points:** 2

---

#### TASK-11.3.1 — Global sensitive field redaction via `OnEventSaving` custom action (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-11.1.6

**What to build:**
Register a global `Audit.Core.Configuration.AddCustomAction(ActionType.OnEventSaving, ...)` in `AddInfrastructure` that iterates every `EntityFrameworkEvent` entry and replaces any column value whose name matches a sensitive pattern with the string `"[REDACTED]"`. The pattern list (`Password`, `Token`, `Secret`, `Hash`, `Salt`) is defined as a `private static readonly` constant array in the same class, making it a single central place to add future patterns.

**Constraints:**
- The custom action is registered in `AddInfrastructure`, immediately after the `Audit.Core.Configuration.Setup()` call from TASK-11.1.6.
- Pattern matching is **case-insensitive** `string.Contains` — not a prefix/suffix check. A field named `ResetPasswordToken` must also be redacted.
- The field key is preserved in the snapshot — only the **value** is replaced with `"[REDACTED]"`. The key must not be removed.
- The redaction applies to both `ColumnValues` (current values) and `Changes` (old/new value pairs) within each `EventEntry` — both snapshots must be sanitised.
- Redaction patterns are defined once as `private static readonly string[] SensitiveFieldPatterns = ["Password", "Token", "Secret", "Hash", "Salt"]` — no magic strings scattered across the method body.
- This action applies to all entities globally — no per-entity configuration required.

**Definition of Done:**
- [ ] `AddInfrastructure` registers an `OnEventSaving` custom action performing pattern-based redaction.
- [ ] The sensitive pattern list is defined as a single constant array in the registration class.
- [ ] After applying this task, a write to any entity with a `PasswordHash` property produces an audit row where `OldData`/`NewData` contains `"PasswordHash": "[REDACTED]"` — not the real value and not an absent key.
- [ ] `dotnet build` succeeds.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-11.1 | All `api` DB writes automatically audited | 5 |
| US-11.2 | Authentication events audited in `identity` | 3 |
| US-11.3 | Sensitive fields excluded from snapshots | 2 |
| **Total** | | **10** |

---

## Task Breakdown

| Task | Title | Story | Layer | Repo | Depends on |
|---|---|---|---|---|---|
| TASK-11.1.1 | `AuditLog` entity and EF Core configuration | US-11.1 | Infrastructure | api | none |
| TASK-11.1.2 | EF Core migration: `public.AuditLogs` table | US-11.1 | DB | api | TASK-11.1.1 |
| TASK-11.1.3 | `IAuditContextProvider` interface, `HttpAuditContextProvider` impl, and DI registration | US-11.1 | Application + Infrastructure | api | none |
| TASK-11.1.5 | `AppDbContext` inherits `AuditDbContext` and wires custom fields | US-11.1 | Infrastructure | api | TASK-11.1.1, TASK-11.1.3 |
| TASK-11.1.6 | Audit.NET data provider configuration in `AddInfrastructure` | US-11.1 | Infrastructure | api | TASK-11.1.5 |
| TASK-11.2.1 | `AuditLog` entity and EF Core configuration (`identity`) | US-11.2 | Infrastructure | identity | none |
| TASK-11.2.2 | EF Core migration: `identity.AuditLogs` table | US-11.2 | DB | identity | TASK-11.2.1 |
| TASK-11.2.3 | `IAuditWriter` interface and `AuditWriterService` implementation | US-11.2 | Infrastructure | identity | TASK-11.2.1 |
| TASK-11.2.4 | Inject `IAuditWriter` into auth controllers | US-11.2 | API | identity | TASK-11.2.3 |
| TASK-11.3.1 | Global sensitive field redaction via `OnEventSaving` custom action | US-11.3 | Infrastructure | api | TASK-11.1.6 |

---

> **Note for Architect:**
>
> **Schema ownership (resolved):** Each service owns its own audit table. `api` creates and owns `public.AuditLogs` via its own EF Core migration. `identity` creates and owns `identity.AuditLogs` via its own migration. Both tables are identical in structure. No cross-service DB access. No shared migration dependency. This eliminates the dual-`DbContext` cross-schema concern entirely.
>
> **Library wiring — `api` (US-11.1):** `AppDbContext` must inherit from `AuditDbContext` (provided by `Audit.EntityFramework.Core`) so Audit.NET intercepts all `SaveChangesAsync` calls automatically. Configure `Audit.Core.Configuration.Setup()` in `AddInfrastructure` to target `public.AuditLogs` within the same `AppDbContext`/connection. Confirm whether to use (a) a single `AppDbContext` that both runs business queries and writes audit rows (simplest, same transaction), or (b) a separate `AuditWriteDbContext` within the same schema. Option (a) is preferred — same schema means no cross-context transaction concern.
>
> **Atomic write concern (US-11.1):** Because both the business data and `AuditLogs` live in the same PostgreSQL schema (`public`) and can share the same `DbContext`, the audit row can be written within the same `SaveChangesAsync` transaction — no eventual consistency issue. Confirm this is achieved by having `AppDbContext` inherit `AuditDbContext` and map `AuditLog` as a regular entity in the same context.
>
> **User ID and IP injection (US-11.1):** Define `IAuditContextProvider` in `Api.Application/Common/Interfaces/` with `CurrentUserId` and `CurrentIpAddress` properties. Implement `HttpAuditContextProvider` in `Api.Infrastructure/Audit/` using `IHttpContextAccessor`. Register as `Scoped`. `AppDbContext` receives it via constructor injection and applies it as custom fields on every audit scope.
>
> **`identity` audit writes (US-11.2):** The `identity` repo uses a 2-project structure with no Application layer. Auth events are written explicitly from controllers via an `IAuditWriter` service in `Identity.Infrastructure`. Because `identity.AuditLogs` lives in the same schema as the rest of the `identity` tables, `IAuditWriter` can use the existing `IdentityAppDbContext` — simply add `AuditLog` as a `DbSet` to it. No separate `AuditWriteDbContext` is needed in `identity`. The `identity` migration that creates `identity.AuditLogs` runs alongside the Identity and OpenIddict table migrations.
>
> **Sensitive field exclusion (US-11.3):** Audit.NET supports `IgnoreProperty` and property filters via `AuditDbContext` configuration. Define a global exclusion list in `AddInfrastructure` (in `api`) covering field name patterns containing `Password`, `Token`, `Secret`, `Hash`, `Salt`. The `[REDACTED]` placeholder requires a custom value transformer — confirm whether Audit.NET's `PropertyFilter` supports value replacement or only omission. If omit-only, emit the key explicitly in a post-processing step.
>
> **No UI in v1:** No read endpoint is planned. Both audit tables are queryable directly from the database. A future EPIC (or EPIC-06 stretch goal) may add a backoffice viewer.
