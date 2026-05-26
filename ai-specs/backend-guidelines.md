# Backend Guidelines — SupportHub

> These are binding conventions for all backend code across the `identity` and `api` repositories.
> The architect-agent must follow these when generating technical tasks.
> If a scenario is not covered here, flag it rather than invent a convention.

---

## 1. Solution & Project Structure

### Clean Architecture layers (both `identity` and `api`)

```
SupportHub.{Service}.sln
├── {Service}.Domain/           # Entities, value objects, domain interfaces. Zero dependencies.
├── {Service}.Application/      # Use cases, DTOs, validators, service interfaces. Depends only on Domain.
├── {Service}.Infrastructure/   # EF Core, S3, SES, HTTP clients. Implements Application interfaces.
└── {Service}.API/              # Controllers, middleware, DI wiring, Program.cs. Depends on Application.
```

**Dependency rule:** Dependencies flow inward only. `Domain` ← `Application` ← `Infrastructure` / `API`. No layer may reference a layer outside this chain.

### Repository naming & project count

| Repo | Solution root | Projects | Rationale |
|---|---|---|---|
| `identity` | `SupportHub.Identity.sln` | `Identity.Infrastructure`, `Identity.API` | Thin OIDC infrastructure service — no domain business logic. 4 layers would add noise without benefit. |
| `api` | `SupportHub.Api.sln` | `Api.Domain`, `Api.Application`, `Api.Infrastructure`, `Api.API` | Full business domain — 4-layer Clean Architecture applies here. |

**`identity` project placement rules:**
- `ApplicationUser : IdentityUser` → `Identity.Infrastructure/Identity/` (framework type, cannot be in a Domain project)
- `IdentityAppDbContext` → `Identity.Infrastructure/Persistence/`
- All DI registration (OpenIddict, Identity, DbContext) → `Identity.Infrastructure/DependencyInjection.cs` via `AddInfrastructure`
- No `Domain` or `Application` projects in `identity` — these would be empty shells

### Scheduler sub-projects

> **Defer to architect-agent.** The need for a scheduler (Jira polling, background sync) and its shape (Worker Service, Hangfire, Quartz.NET) must be evaluated during EPIC-07/08 decomposition. Do not assume a pattern here.

---

## 2. Use Cases (Application Layer)

- Each use case is a single class in `Application/UseCases/{Feature}/{Action}UseCase.cs`
- **No MediatR.** Use direct constructor injection of interfaces.
- Use case classes are `internal` and injected via their interface.
- One public method: `ExecuteAsync(TCommand cmd, CancellationToken ct)`.
- Return type is always `Task<Result<TDto>>` (void use cases return `Task<Result>`).

```csharp
// Application/UseCases/Tickets/CreateTicketUseCase.cs
internal class CreateTicketUseCase(
    ITicketRepository ticketRepo,
    IUnitOfWork uow,
    IValidator<CreateTicketCommand> validator) : ICreateTicketUseCase
{
    public async Task<Result<TicketDto>> ExecuteAsync(CreateTicketCommand cmd, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(cmd, ct);
        if (!validation.IsValid)
            return Result.Fail(validation.Errors.Select(e => e.ErrorMessage));

        var ticket = Ticket.Create(cmd.Title, cmd.ClientId);
        await ticketRepo.AddAsync(ticket, ct);
        await uow.CommitAsync(ct);
        return Result.Ok(ticket.ToDto());
    }
}
```

---

## 3. Result Pattern (FluentResults)

**NuGet:** `FluentResults`

- All use cases return `Result` (void) or `Result<T>` (with value).
- Never throw exceptions for expected failures (not found, conflict, validation error, unauthorized).
- Use typed error classes in `Application/Common/Errors/` for known failure categories.
- Controllers map `Result` to HTTP via a shared extension method (see api-conventions.md).

```csharp
// Application/Common/Errors/NotFoundError.cs
public sealed class NotFoundError(string resource, object id)
    : Error($"{resource} with id '{id}' was not found.");

// Application/Common/Errors/ConflictError.cs
public sealed class ConflictError(string message) : Error(message);

// Application/Common/Errors/ForbiddenError.cs
public sealed class ForbiddenError(string message) : Error(message);
```

**When to throw exceptions:** Only for truly unexpected, unrecoverable conditions (infrastructure failure, programming error). These bubble up to global error middleware.

---

## 4. Validation (FluentValidation)

**NuGet:** `FluentValidation` + `FluentValidation.DependencyInjectionExtensions`

- One validator per command/DTO, co-located in `Application/UseCases/{Feature}/`.
- Registered automatically via `services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>()` in the `AddInfrastructure` / DI extension method.
- Validators are injected into use cases via constructor — not invoked automatically by ASP.NET Core model binding pipeline.
- Use `ValidateAsync` inside the use case (not the controller).

```csharp
// Application/UseCases/Tickets/CreateTicketCommand.cs
public record CreateTicketCommand(string Title, Guid ClientId, string? Description);

// Application/UseCases/Tickets/CreateTicketValidator.cs
internal sealed class CreateTicketValidator : AbstractValidator<CreateTicketCommand>
{
    public CreateTicketValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientId).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(2000).When(x => x.Description is not null);
    }
}
```

---

## 5. Domain Layer Rules

- Entities inherit from `BaseEntity` (defined in `Domain/Common/`).
- `BaseEntity` carries: `Id` (Guid), `CreatedAt` (DateTimeOffset), `UpdatedAt` (DateTimeOffset).
- Use private setters and domain factory methods (`Ticket.Create(...)`) — no public setters on entities.
- Value objects are `record` types with validation in the constructor.
- Domain interfaces (`ITicketRepository`, `IUnitOfWork`) live in `Domain/Interfaces/`.
- No EF Core, no HTTP, no framework references in `Domain`.

```csharp
// Domain/Common/BaseEntity.cs
public abstract class BaseEntity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    protected void Touch() => UpdatedAt = DateTimeOffset.UtcNow;
}
```

---

## 6. Infrastructure Layer Rules

- All Infrastructure concerns implement interfaces from `Application` or `Domain`.
- DI registration lives in a single `AddInfrastructure(IServiceCollection services, IConfiguration config)` extension method per project. `Program.cs` calls this and nothing else from Infrastructure.
- EF Core `DbContext` is registered inside `AddInfrastructure`. Never registered in `Program.cs` directly.
- Repository pattern: one repository interface per aggregate root. Generic repository is **not** used.
- `IUnitOfWork` wraps `DbContext.SaveChangesAsync`. Use cases call it at the end of write operations.

```csharp
// Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(config.GetConnectionString("Default")));

        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>();

        // AWS, Jira, etc. registered here
        return services;
    }
}
```

---

## 7. EF Core Conventions

- **PostgreSQL 17** via `Npgsql.EntityFrameworkCore.PostgreSQL`.
- All entity configurations use the Fluent API in separate `IEntityTypeConfiguration<T>` classes inside `Infrastructure/Persistence/Configurations/`.
- No Data Annotations on domain entities.
- Every schema change requires an EF Core migration — never edit the database directly.
- Migration commands run from the `Infrastructure` project, targeting `AppDbContext`.
- Soft delete is implemented via a `IsDeleted` bool + global query filter — not physical row deletion for auditable entities.
- `DateTimeOffset` (not `DateTime`) for all timestamps. PostgreSQL stores as `timestamptz`.
- `decimal` columns: always specify precision/scale in Fluent API (`HasPrecision(18, 4)`).
- **Auto-migration on startup is Development only.** Guard with `if (app.Environment.IsDevelopment())`. Production migrations are applied manually via `dotnet ef database update` before deployment — never auto-applied in a running container.

---

## 8. OpenIddict — Identity Server (`identity` repo only)

**NuGet:** `OpenIddict.AspNetCore` + `OpenIddict.EntityFrameworkCore`

- OpenIddict manages all OIDC flows. Do not hand-roll JWT generation or signing.
- `IdentityAppDbContext` must call `builder.UseOpenIddict()` in `OnModelCreating`.
- Development: `AddDevelopmentSigningCertificate()` + `AddDevelopmentEncryptionCertificate()`. Never a raw `JWT_SECRET`.
- Production: real X.509 certificates loaded from environment/secrets — not committed to repo.
- SPA clients (`client-portal`, `backoffice`) use **authorization_code + PKCE**. `RequireProofKeyForCodeExchange()` is mandatory.
- OpenIddict adds 4 tables to the `identity` schema: `OpenIddictApplications`, `OpenIddictAuthorizations`, `OpenIddictScopes`, `OpenIddictTokens`.
- Client registration (SPA redirect URIs, scopes) is seeded via a hosted service at startup — not hardcoded in `Program.cs`.

```csharp
// Identity/Infrastructure/DependencyInjection.cs (excerpt)
services.AddOpenIddict()
    .AddCore(opts => opts.UseEntityFrameworkCore().UseDbContext<IdentityAppDbContext>())
    .AddServer(opts =>
    {
        opts.SetAuthorizationEndpointUris("connect/authorize")
            .SetTokenEndpointUris("connect/token")
            .SetUserinfoEndpointUris("connect/userinfo")
            .SetLogoutEndpointUris("connect/logout");

        opts.AllowAuthorizationCodeFlow()
            .RequireProofKeyForCodeExchange();

        opts.AddDevelopmentEncryptionCertificate()
            .AddDevelopmentSigningCertificate();

        opts.UseAspNetCore()
            .EnableAuthorizationEndpointPassthrough()
            .EnableTokenEndpointPassthrough()
            .EnableUserinfoEndpointPassthrough()
            .EnableLogoutEndpointPassthrough();
    })
    .AddValidation(opts =>
    {
        opts.UseLocalServer();
        opts.UseAspNetCore();
    });
```

---

## 9. JWT Validation — `api` repo

- `api` does **not** issue tokens. It validates JWTs via OpenIddict's discovery endpoint.
- No shared secret between `identity` and `api`. JWKS resolution only.
- `IDENTITY_AUTHORITY` environment variable holds the base URL of the `identity` server.

```csharp
// Api/Infrastructure/DependencyInjection.cs (excerpt)
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.Authority = config["IDENTITY_AUTHORITY"];
        opts.Audience = "supporthub-api";
        opts.RequireHttpsMetadata = !env.IsDevelopment();
    });
```

---

## 10. Logging (Serilog)

**NuGet:** `Serilog.AspNetCore` + `Serilog.Formatting.Compact`

- Configured once in `Program.cs` before `builder.Build()`.
- Structured JSON output in all environments (compact JSON format).
- `UseSerilogRequestLogging()` replaces ASP.NET Core's default request logging middleware.
- Correlation ID enriched via middleware using `LogContext.PushProperty`.
- Never log sensitive data: passwords, tokens, PII, API keys.
- Log levels by environment: `Debug` in Development, `Information` in Production.

```csharp
// Program.cs
builder.Host.UseSerilog((ctx, services, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "SupportHub.Api")
    .WriteTo.Console(new CompactJsonFormatter()));

// After builder.Build():
app.UseSerilogRequestLogging(opts =>
{
    opts.EnrichDiagnosticContext = (diag, http) =>
    {
        diag.Set("RequestHost", http.Request.Host.Value);
        diag.Set("UserId", http.User.FindFirst("sub")?.Value ?? "anonymous");
    };
});
```

---

## 11. Unit Testing (xUnit)

**NuGet:** `xunit`, `xunit.runner.visualstudio`, `Moq` (or `NSubstitute`), `FluentAssertions`

- Test project per source project: `{Service}.Application.Tests`, `{Service}.Infrastructure.Tests`, `{Service}.API.Tests`.
- Unit tests cover use cases and domain logic exclusively — never test EF Core queries directly in unit tests.
- Integration tests use `WebApplicationFactory<Program>` + Testcontainers PostgreSQL for real DB.
- No mocked `DbContext` — use real DB via Testcontainers in integration tests.
- Naming: `{Method}_When{Condition}_Should{Expectation}`.
- All test methods are `async Task`.
- Use `FluentAssertions` for assertions (`result.Should().BeSuccessful()`).

```csharp
// Example: Application.Tests/UseCases/Tickets/CreateTicketUseCaseTests.cs
public class CreateTicketUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_WhenTitleIsEmpty_ShouldReturnFailedResult()
    {
        var repo = Substitute.For<ITicketRepository>();
        var uow = Substitute.For<IUnitOfWork>();
        var validator = new CreateTicketValidator();
        var useCase = new CreateTicketUseCase(repo, uow, validator);

        var result = await useCase.ExecuteAsync(
            new CreateTicketCommand("", Guid.NewGuid(), null), CancellationToken.None);

        result.IsFailed.Should().BeTrue();
    }
}
```

---

## 12. Security (OWASP Top 10)

| Threat | Mitigation |
|---|---|
| Injection (SQL) | EF Core parameterized queries only. Raw SQL via `FromSqlRaw` requires explicit parameter objects — never string interpolation. |
| Broken Auth | OpenIddict OIDC + PKCE. JWT validated via JWKS discovery. No long-lived tokens stored client-side in localStorage. |
| Sensitive Data Exposure | HTTPS enforced in production (`UseHttpsRedirection`). No PII or secrets in logs. `.env` never committed (`.gitignore`). |
| IDOR | All resource lookups filter by the authenticated user's tenant/client claim. Never trust client-supplied IDs without ownership check. |
| Security Misconfiguration | CORS locked to known origins via `CORS_ALLOWED_ORIGINS` env var. Swagger disabled in production. `Server` response header removed. |
| Vulnerable Components | Dependabot or `dotnet list package --vulnerable` in CI. |
| CSRF | SPAs use `Authorization: Bearer` header — not cookies — so CSRF is not applicable for API calls. |
| Rate Limiting (webhooks) | `[AllowAnonymous]` webhook endpoints must apply a rate limiter policy. Use ASP.NET Core's built-in `AddRateLimiter` (`UseRateLimiter` middleware). Default: fixed-window 60 req/min per IP on the `POST /api/webhooks/jira` endpoint. Register the named policy `"webhook"` in `AddInfrastructure`. |
| Input Validation | FluentValidation on all inbound commands. Max lengths enforced. Reject unknown properties (`[ApiController]` + `AllowEmptyInputInBodyModelBinding = false`). |
| Secrets Management | All secrets via environment variables. No hardcoded keys, passwords, or connection strings in source. |

---

## 13. Docker

- Each service has its own `Dockerfile` at repo root.
- Dev `Dockerfile`: uses `dotnet watch` for hot-reload. Exposes a single port.
- Production `Dockerfile`: multi-stage build (`sdk` → `runtime`). Non-root user. No dev certs.
- No secrets in `Dockerfile` or `docker-compose.yml` — use `.env` file (not committed).
- Health check endpoint (`GET /health`) required in every service and referenced in `docker-compose.yml`.

```dockerfile
# Dev Dockerfile example (api service — adjust project path and port per repo)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /app
COPY . .
RUN dotnet restore
EXPOSE 5000
# api:   ENTRYPOINT ["dotnet", "watch", "--project", "Api.API/SupportHub.Api.API.csproj", "--no-hot-reload"]
# identity: ENTRYPOINT ["dotnet", "watch", "--project", "Identity.API/SupportHub.Identity.API.csproj", "--no-hot-reload"]
ENTRYPOINT ["dotnet", "watch", "--project", "Api.API/SupportHub.Api.API.csproj", "--no-hot-reload"]
```

---

## 14. Internal Service-to-Service Calls (`api` → `identity`)

Some operations span both services — for example, the invitation flow (EPIC-05) where `api` must create a user record in `identity`. These calls use an internal HTTP endpoint on `identity` authenticated with a pre-shared `INTERNAL_API_KEY` header, never with a JWT.

### Rules

- Internal endpoints on `identity` are prefixed `/internal/` and are **never publicly routable** (blocked at the Nginx/ALB layer in production).
- All internal endpoints validate the `X-Internal-Api-Key` request header against `INTERNAL_API_KEY` env var. A missing or wrong key returns `401` immediately.
- Internal endpoints do **not** use `[Authorize]` (JWT Bearer). They use a dedicated `InternalApiKeyMiddleware` or `ActionFilter` instead.
- The `api` service injects `IIdentityUserService` (defined in `Api.Application/Common/Interfaces/`) which wraps the HTTP call. The implementation lives in `Api.Infrastructure/Identity/`.
- No business logic lives in `identity` internal endpoints beyond what Identity/OpenIddict needs — orchestration logic stays in `api` use cases.
- `INTERNAL_API_KEY` is a random 256-bit value generated at deploy time and shared between `api` and `identity` via environment variables. It is never committed to source.

### Internal endpoints (identity)

| Endpoint | Description |
|---|---|
| `POST /internal/users` | Create `ApplicationUser`, generate invitation token, dispatch invitation email |
| `PUT /internal/users/{userId}/email` | Update `ApplicationUser.Email` (for admin email-change flow) |

---

## 15. Code Style Rules

- `async`/`await` all the way — no `.Result` or `.Wait()`.
- `CancellationToken ct` as last parameter in every async method.
- `record` types for commands, DTOs, value objects.
- `sealed` on classes that are not designed for inheritance.
- No `public` constructors on entities — use static factory methods.
- Prefer `IReadOnlyList<T>` over `List<T>` in return types.
- File-scoped namespaces (`namespace SupportHub.Api.Controllers;`).
- One class per file. Filename matches class name exactly.
- No magic strings — use `const` or `static readonly` in a dedicated constants class.

---

## 15. Audit Log (Audit.NET)

**NuGet:** `Audit.NET` + `Audit.EntityFramework.Core` (in `Api.Infrastructure` and `Identity.Infrastructure`)

### Scope

| Service | Audited events |
|---|---|
| `api` | All EF Core `INSERT`, `UPDATE`, `DELETE` on any tracked entity |
| `identity` | `LOGIN`, `LOGIN_FAILED`, `PASSWORD_RESET`, `ACCOUNT_ACTIVATION` — written explicitly from controllers |

### Database location

Each service owns its own `AuditLogs` table with an identical column structure. There is no shared audit table and no cross-service DB access.

| Service | Schema | Table | Migration owner |
|---|---|---|---|
| `api` | `public` | `public.AuditLogs` | `api` repo |
| `identity` | `identity` | `identity.AuditLogs` | `identity` repo |

### `AuditLog` entity shape

```csharp
// Api.Infrastructure/Audit/AuditLog.cs
public sealed class AuditLog
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTimeOffset Timestamp { get; init; } = DateTimeOffset.UtcNow;
    public string Operation { get; init; } = default!;   // INSERT | UPDATE | DELETE | LOGIN | LOGIN_FAILED | PASSWORD_RESET | ACCOUNT_ACTIVATION
    public string? EntityName { get; init; }
    public string? EntityId { get; init; }
    public string? OldData { get; init; }                // JSON snapshot — null for INSERT and auth events
    public string? NewData { get; init; }                // JSON snapshot — null for DELETE
    public string? UserId { get; init; }                 // null for anonymous events (LOGIN_FAILED)
    public string? IpAddress { get; init; }
}
```

### `AppDbContext` wiring (`api`)

`AppDbContext` must inherit from `AuditDbContext` (provided by `Audit.EntityFramework.Core`) so that Audit.NET intercepts all `SaveChangesAsync` calls automatically. Because `AuditLog` lives in the same `public` schema as all other `api` entities, it is mapped as a regular `DbSet` on `AppDbContext` — no separate `AuditWriteDbContext` is needed. Configuration goes in `AddInfrastructure`:

```csharp
Audit.Core.Configuration.Setup()
    .UseEntityFrameworkCoreProvider(x => x
        .UseDbContext<AppDbContext>()
        .AuditTypeMapper(t => typeof(AuditLog)));
```

### User ID and IP address injection

Define `IAuditContextProvider` in `Api.Application/Common/Interfaces/`:

```csharp
public interface IAuditContextProvider
{
    string? CurrentUserId { get; }
    string? CurrentIpAddress { get; }
}
```

Implement `HttpAuditContextProvider : IAuditContextProvider` in `Api.Infrastructure/Audit/` using `IHttpContextAccessor`. Register as `Scoped`. `AppDbContext` receives it via constructor injection and applies it as `ExtraFields` on every audit scope.

### Sensitive field exclusion

Configure globally in `AddInfrastructure`. Fields whose name (case-insensitive) contains any of the following are replaced with `"[REDACTED]"` in `OldData`/`NewData` snapshots:

- `Password`, `Token`, `Secret`, `Hash`, `Salt`

Never silence-drop sensitive fields — always emit the key with the `"[REDACTED]"` value so the field's presence is visible in the audit record.

### `identity` auth event writes

The `identity` repo does **not** use `AuditDbContext`. Auth events are written explicitly from controllers via an `IAuditWriter` service:

```csharp
// Identity.Infrastructure/Audit/IAuditWriter.cs
public interface IAuditWriter
{
    Task WriteAsync(string operation, string? entityId, string? userId, string ipAddress, CancellationToken ct);
}
```

`IAuditWriter` appends rows to `identity.AuditLogs` using the existing `IdentityAppDbContext` — `AuditLog` is registered as a `DbSet` on that context. No separate `AuditWriteDbContext` is required in `identity`. The `identity` migration that adds `identity.AuditLogs` runs alongside the Identity and OpenIddict table migrations. `OldData` and `NewData` are always null for auth events.

### Constraints

- The `AuditLogs` table is **append-only** from the application. No `UPDATE` or `DELETE` statements against it from any use case or service.
- Never log sensitive values (passwords, tokens) — the field exclusion list is the safety net, but entity design should not place secrets in tracked properties.
- The audit write must not block the primary operation: if the audit write fails, log the error (Serilog `Error`) but do **not** roll back the business transaction. Audit failure is non-fatal.
- `AuditLog` has no EF Core navigation properties and no foreign key constraints — it is a pure append log, decoupled from the entity graph.
- All audit timestamps are `DateTimeOffset` in UTC.
