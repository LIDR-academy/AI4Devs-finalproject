# EPIC-11 — Audit Log
> Priority: 1.6 (after EPIC-10, before EPIC-01) | Status: 🔄 Partially implemented — remaining work defined below

---

## Architecture Note

### Resolved decisions

**`AppDbContext` inheritance (US-11.1):** ✅ Done. `AppDbContext` already inherits from `AuditDbContext` (from `Audit.EntityFramework.Core`). `AuditLog` is mapped as a regular `DbSet<AuditLog>` on `AppDbContext`, so audit rows are written within the same PostgreSQL transaction as the business operation. No second `DbContext` is needed.

**Data provider wiring (US-11.1):** `Audit.Core.Configuration.Setup()` must be called in `AddInfrastructure` (not in `Program.cs`) and target `AppDbContext` via `UseEntityFrameworkCoreProvider`. The `AuditTypeMapper` maps all audit events to the single `AuditLog` entity — no per-entity mapping required. **Not yet implemented.**

**User ID + IP injection (US-11.1):** `IAuditContextProvider` (interface in `Api.Application/Common/Interfaces/`) and `HttpAuditContextProvider` (in `Api.Infrastructure/Audit/`) already exist and are registered. The interface exposes `Guid? UserId` and `string? IpAddress` — nullable to handle unauthenticated requests and background jobs. `AppDbContext` still needs to receive it via constructor injection and call `AddAuditCustomField("UserId", ...)` + `AddAuditCustomField("IpAddress", ...)` per audit scope.

**`IAuditContextProvider` signature (resolved):** The interface uses `Guid? UserId` (not `string?`) for type safety — no claim parsing needed at the DbContext level. Both properties are nullable: `UserId` is null for anonymous/unauthenticated requests; `IpAddress` is null when there is no HTTP context (e.g. background jobs). The current implementation has non-nullable types and must be corrected.

**Sensitive field exclusion (US-11.3):** Audit.NET has no built-in global name-pattern filter. The correct approach is a `Audit.Core.Configuration.AddCustomAction(ActionType.OnEventSaving, ...)` that iterates all `EntityFrameworkEvent.Entries` → `Entry.ColumnValues`, finds keys whose name contains any of the redaction patterns (`Password`, `Token`, `Secret`, `Hash`, `Salt`, case-insensitive), and replaces the value with `"[REDACTED]"`. Registered once in `AddInfrastructure`. **Not yet implemented.**

**`identity` audit writes (US-11.2):** `identity` does **not** use `AuditDbContext`. Auth events are written explicitly from controllers via `IAuditWriter` (interface in `Identity.Infrastructure/Audit/`). `AuditWriterService` appends rows to `identity.audit_logs` using the existing `IdentityAppDbContext` with `AuditLog` added as a `DbSet`. No cross-service DB access. `OldData` and `NewData` are always null. The migration creating `identity.audit_logs` runs alongside existing Identity/OpenIddict migrations.

**Schema convention:** Both services follow snake_case and schema isolation. `api` writes to `api.audit_logs`; `identity` writes to `identity.audit_logs`.

**Audit failure behaviour:** If the audit write fails, the error is logged via Serilog at `Error` level but the business transaction is **not** rolled back. Audit failure is non-fatal.

**No UI in v1:** Both `api.audit_logs` and `identity.audit_logs` are DB-queryable only. No read endpoint is planned for this epic.

---

## Overview

Establishes a persistent, automatic audit trail for all database write operations and authentication events across both backend services. Every Insert, Update, and Delete on any tracked entity in the `api` service is recorded automatically via Audit.NET + EF Core integration. Authentication events (Login success, login failure, password reset, account activation) are recorded by the `identity` service.

**Each service owns its own audit log.** There is no shared audit table between `api` and `identity`. The `api` service writes to `api.audit_logs`. The `identity` service writes to `identity.audit_logs`. Both tables have an identical column structure. Each service owns and runs its own migration for its audit table. No cross-service DB access is required.

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

**Library:** `Audit.NET` + `Audit.EntityFramework.Core` (NuGet). Already referenced in `Api.Infrastructure.csproj`. The library hooks into EF Core's `SaveChanges` pipeline automatically — no per-use-case instrumentation required.

---

## User Stories

---

### US-11.1 — All `api` database writes are automatically recorded in the audit log
> *As an administrator, I want every data modification in the system to be automatically captured in an audit log so that we have a complete, tamper-evident record of what changed, when, and by whom.*

**Acceptance Criteria:**
- [ ] Every `INSERT`, `UPDATE`, and `DELETE` operation on any EF Core-tracked entity in the `api` service is automatically recorded in `api.audit_logs`.
- [ ] Each audit record captures: timestamp (UTC), operation type, entity name, entity ID, old data as JSON (null for INSERT), new data as JSON (null for DELETE), the authenticated user's ID, and the client IP address.
- [ ] The user ID and IP address are injected automatically — no use case or controller needs to pass them explicitly.
- [ ] The audit log is written atomically within the same database transaction as the business operation — if the transaction rolls back, the audit record is not written.
- [ ] Sensitive fields (passwords, tokens, secrets) are excluded from the `OldData` / `NewData` JSON snapshots and never appear in the audit log.
- [ ] The audit log table is append-only from the application's perspective — no use case or controller may update or delete audit records.
- [ ] The mechanism requires no per-feature code changes — adding a new entity automatically falls under audit coverage.

**Story Points:** 3 *(reduced from 5 — entity, configuration, and migration already done)*

---

#### TASK-11.1.3 — Fix `IAuditContextProvider` nullability (`api`)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** none

**What to fix:**
`IAuditContextProvider` and `HttpAuditContextProvider` already exist and are registered. The interface currently exposes non-nullable types (`Guid UserId`, `string IpAddress`) which do not handle unauthenticated requests or background jobs correctly. Both must be made nullable.

**Constraints:**
- Change `IAuditContextProvider` in `Api.Application/Common/Interfaces/IAuditContextProvider.cs` to:
  ```csharp
  Guid? UserId { get; }
  string? IpAddress { get; }
  ```
- Change `HttpAuditContextProvider` in `Api.Infrastructure/Audit/HttpAuditContextProvider.cs` to return `null` (not `Guid.Empty` or `string.Empty`) when there is no authenticated user or no HTTP context.
- `UserId` must be null for unauthenticated requests — do not fall back to `Guid.Empty`.
- `IpAddress` must return `null` when `HttpContext` is null (background job path) — do not fall back to `string.Empty`.
- No other callers of `IAuditContextProvider` exist yet — no downstream changes required beyond the two files above.
- File-scoped namespaces remain unchanged: `Api.Application.Common.Interfaces` and `Api.Infrastructure.Audit`.

**Definition of Done:**
- [ ] `IAuditContextProvider.UserId` is `Guid?` and `IAuditContextProvider.IpAddress` is `string?`.
- [ ] `HttpAuditContextProvider` returns `null` for both properties when no user is authenticated / no HTTP context is present.
- [ ] `dotnet build` succeeds for `Api.Application` and `Api.Infrastructure`.

---

#### TASK-11.1.5 — Wire `IAuditContextProvider` into `AppDbContext` custom fields (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-11.1.3

**What to fix:**
`AppDbContext` already inherits `AuditDbContext` and `Audit.EntityFramework.Core` is already referenced. What is missing is constructor injection of `IAuditContextProvider` and the per-scope call to `AddAuditCustomField` so that every audit event carries the user's identity and client IP.

**Constraints:**
- Add `IAuditContextProvider` as a constructor parameter in `AppDbContext` alongside the existing `DbContextOptions<AppDbContext>`.
- Override `OnScopeCreated(AuditScope auditScope)` to call:
  ```csharp
  auditScope.SetCustomField("UserId", _auditContextProvider.UserId?.ToString());
  auditScope.SetCustomField("IpAddress", _auditContextProvider.IpAddress);
  ```
- Custom fields are set per audit scope — not globally — so concurrent requests do not bleed values across scopes.
- Null values from `IAuditContextProvider` must be passed through as-is (pass `null` to `SetCustomField`, do not throw or substitute).
- `AddDbContext<AppDbContext>` registration in `AddInfrastructure` requires no change — EF Core's DI will resolve `IAuditContextProvider` from the scope automatically.

**Definition of Done:**
- [ ] `AppDbContext` constructor accepts `IAuditContextProvider`.
- [ ] `OnScopeCreated` is overridden and calls `SetCustomField` for `UserId` and `IpAddress`.
- [ ] `dotnet build` succeeds for `Api.Infrastructure` and `Api.API`.

---

#### TASK-11.1.6 — Audit.NET data provider configuration in `AddInfrastructure` (`api`)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-11.1.5

**What to build:**
Configure `Audit.Core.Configuration.Setup()` in `AddInfrastructure` to route all EF Core audit events to the `AppDbContext`-backed `AuditLog` entity. This wires Audit.NET's data provider to write audit rows into `api.audit_logs` atomically within the same EF Core transaction as the triggering operation.

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
- [ ] A manual insert to any tracked entity (verified via `dotnet run` + direct DB query) produces a row in `api.audit_logs`.

---

### US-11.2 — Authentication events in `identity` are recorded in the audit log
> *As an administrator, I want login attempts, password resets, and account activations to appear in the audit log so that security-relevant authentication events are traceable alongside data changes.*

**Acceptance Criteria:**
- [ ] A successful login records an audit entry with operation `LOGIN`, the user's ID, timestamp, and IP address.
- [ ] A failed login records an audit entry with operation `LOGIN_FAILED`, the attempted email (as `EntityId`), timestamp, and IP address. `UserId` is null (unauthenticated request).
- [ ] A successful password reset records an audit entry with operation `PASSWORD_RESET_COMPLETED`, the user's ID, timestamp, and IP address.
- [ ] A failed/expired password reset token records an audit entry with operation `PASSWORD_RESET_FAILED`, `UserId` null.
- [ ] A successful account activation records an audit entry with operation `ACCOUNT_ACTIVATION`, the user's ID, timestamp, and IP address.
- [ ] `identity` writes these records to its own `audit_logs` table in the `identity` PostgreSQL schema — no cross-service DB access and no HTTP call to `api`.
- [ ] `OldData` and `NewData` are null for all auth events.
- [ ] The `identity.audit_logs` table has an identical column structure to `api.audit_logs`, and is created by a migration owned by the `identity` repo.
- [ ] **Controller wiring is implemented as part of EPIC-01** (SH-105, SH-107, SH-113) — not in this epic. TASK-11.2.1/2/3 deliver the infrastructure (`AuditLog` entity, migration, `IAuditWriter`); EPIC-01 tasks consume it.

**Story Points:** 3

---

#### TASK-11.2.1 — `AuditLog` entity and EF Core configuration (`identity`)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** none

**What to build:**
Create the `AuditLog` entity class in `Identity.Infrastructure/Audit/` and its `IEntityTypeConfiguration<AuditLog>` in `Identity.Infrastructure/Persistence/Configurations/`. The entity maps to the `audit_logs` table in the `identity` PostgreSQL schema. Add `DbSet<AuditLog>` to `IdentityAppDbContext`. The column structure is identical to the `api` service's `AuditLog`.

**Constraints:**
- `AuditLog` in `identity` has an identical column structure to the one in `api` (same fields, same types, same nullability rules).
- Maps to `identity."audit_logs"` — schema is `identity`, not `api`.
- `OldData` and `NewData` map to `jsonb` column type.
- No foreign key constraints, no navigation properties.
- `IdentityAppDbContext` is **not** changed to inherit from `AuditDbContext` — the `identity` service writes audit rows explicitly, not via library interception.
- File-scoped namespace: `Identity.Infrastructure.Audit`.

**Definition of Done:**
- [ ] `Identity.Infrastructure/Audit/AuditLog.cs` exists with all columns from the epic schema.
- [ ] `Identity.Infrastructure/Persistence/Configurations/AuditLogConfiguration.cs` maps the entity to `identity."audit_logs"`.
- [ ] `IdentityAppDbContext` has `DbSet<AuditLog> AuditLogs`.
- [ ] `dotnet build` succeeds for `Identity.Infrastructure`.

---

#### TASK-11.2.2 — EF Core migration: `identity.audit_logs` table
**Layer:** DB
**Repo:** identity
**Depends on:** TASK-11.2.1

**What to build:**
Generate and verify the EF Core migration that creates the `identity.audit_logs` table. The migration runs alongside existing Identity and OpenIddict table migrations.

**Constraints:**
- Migration lives in `Identity.Infrastructure/Persistence/Migrations/`.
- The `Up()` method creates `audit_logs` in the `identity` schema with all columns matching the entity configuration from TASK-11.2.1.
- `OldData` and `NewData` columns must be `jsonb`.
- No foreign key constraints in the migration.
- Migration is additive — it must not modify any existing Identity or OpenIddict tables.

**Definition of Done:**
- [ ] Migration file exists under `Identity.Infrastructure/Persistence/Migrations/` with `CreateAuditLogs` in its name.
- [ ] `dotnet ef migrations script` produces valid SQL that includes `CREATE TABLE identity."audit_logs"` with `jsonb` columns.
- [ ] `dotnet build` succeeds for `Identity.Infrastructure`.

---

#### TASK-11.2.3 — `IAuditWriter` interface and `AuditWriterService` implementation (`identity`)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-11.2.1

**What to build:**
Define the `IAuditWriter` interface and implement `AuditWriterService` in `Identity.Infrastructure/Audit/`. The service appends a single `AuditLog` row to `identity.audit_logs` via `IdentityAppDbContext`. Register `IAuditWriter → AuditWriterService` as `Scoped` in `AddInfrastructure`.

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

### US-11.3 — Sensitive fields are excluded from audit snapshots
> *As a security officer, I want passwords, tokens, and other sensitive values to be automatically stripped from audit log JSON snapshots so that the audit log never becomes a source of credential leakage.*

**Acceptance Criteria:**
- [ ] The following fields are globally excluded from `OldData` / `NewData` snapshots across all entities: any field whose name contains `Password`, `Token`, `Secret`, `Hash`, or `Salt` (case-insensitive matching).
- [ ] Exclusion is configured centrally — not repeated per entity. Adding a new sensitive field name to the exclusion list applies to all entities immediately.
- [ ] A test or documentation confirms that `ApplicationUser.PasswordHash` does not appear in any audit record.
- [ ] Fields excluded from the snapshot are replaced with a placeholder string (`"[REDACTED]"`) rather than being silently omitted, so the presence of the field is still visible in the audit record.

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

| Story | Title | Points | Status |
|---|---|---|---|
| US-11.1 | All `api` DB writes automatically audited | 3 | 🔄 Partial |
| US-11.2 | Authentication events audited in `identity` | 3 | ❌ Not started |
| US-11.3 | Sensitive fields excluded from snapshots | 2 | ❌ Not started |
| **Total** | | **8** | |

---

## Task Breakdown

| Task | Title | Story | Layer | Repo | Depends on | Status |
|---|---|---|---|---|---|---|
| ~~TASK-11.1.1~~ | ~~`AuditLog` entity and EF Core configuration~~ | ~~US-11.1~~ | ~~Infrastructure~~ | ~~api~~ | ~~none~~ | ✅ Done |
| ~~TASK-11.1.2~~ | ~~EF Core migration: `api.audit_logs` table~~ | ~~US-11.1~~ | ~~DB~~ | ~~api~~ | ~~TASK-11.1.1~~ | ✅ Done |
| TASK-11.1.3 | Fix `IAuditContextProvider` nullability | US-11.1 | Application + Infrastructure | api | none | 🔄 Fix needed |
| TASK-11.1.5 | Wire `IAuditContextProvider` into `AppDbContext` custom fields | US-11.1 | Infrastructure | api | TASK-11.1.3 | 🔄 Partial |
| TASK-11.1.6 | Audit.NET data provider configuration in `AddInfrastructure` | US-11.1 | Infrastructure | api | TASK-11.1.5 | ❌ Missing |
| TASK-11.2.1 | `AuditLog` entity and EF Core configuration (`identity`) | US-11.2 | Infrastructure | identity | none | ❌ Missing |
| TASK-11.2.2 | EF Core migration: `identity.audit_logs` table | US-11.2 | DB | identity | TASK-11.2.1 | ❌ Missing |
| TASK-11.2.3 | `IAuditWriter` interface and `AuditWriterService` implementation | US-11.2 | Infrastructure | identity | TASK-11.2.1 | ❌ Missing |
| ~~TASK-11.2.4~~ | ~~Inject `IAuditWriter` into auth controllers~~ | ~~US-11.2~~ | ~~API~~ | ~~identity~~ | ~~TASK-11.2.3~~ | 🚫 Absorbed into EPIC-01 tasks (SH-105, SH-107, SH-113) |
| TASK-11.3.1 | Global sensitive field redaction via `OnEventSaving` custom action | US-11.3 | Infrastructure | api | TASK-11.1.6 | ❌ Missing |
