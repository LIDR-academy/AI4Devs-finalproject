# EPIC-09 — Infrastructure & DevOps

> **Scope:** Docker Compose, project scaffolds, DB, S3, SES setup
> **Priority:** 1
> **Status:** ✅ Stories + tasks defined
> **Task format note:** Tasks in this epic use the legacy `Implementation checklist` format — written before the openspec task format was adopted. Content is architecturally correct. From EPIC-01 onward, tasks use the openspec format (`Constraints` section, one concern per task, intent-and-constraint descriptions only).

---

## Architecture Note — EPIC-09

**Four-repository structure.** The project is split across four repos: `identity` (ASP.NET Core Identity + OpenIddict OIDC server), `api` (main backend for both client portal and backoffice), `client-portal` (React frontend for clients), `backoffice` (React frontend for admins). Each repo owns its own `Dockerfile`.

**`identity` project structure (2 projects, not 4).** The `identity` repo is a thin infrastructure service — it wraps ASP.NET Core Identity and OpenIddict and exposes OIDC endpoints. It has no real domain business logic, so forcing 4 Clean Architecture layers onto it would be over-engineering. Structure: `Identity.Infrastructure` (EF Core, `IdentityAppDbContext`, `ApplicationUser : IdentityUser`, OpenIddict wiring, `AddInfrastructure` extension) and `Identity.API` (`Program.cs`, health check, Swagger, Serilog). The full 4-layer structure applies only to `api`, where business logic lives.

**Execution order.** All four scaffolds in US-09.2 run fully in parallel — no cross-repo dependencies at this stage. US-09.3, US-09.5, and US-09.6 depend on the `api` scaffold and can run in parallel with each other. US-09.1 (Docker Compose) is last — it can only be written once all four repos and their Dockerfiles exist.

**Shared DI registration pattern.** Establish the `AddInfrastructure(IServiceCollection)` extension method pattern in both `identity` and `api` scaffolds (US-09.2). US-09.5 and US-09.6 follow this same pattern — `Program.cs` stays clean.

**Database ownership.** `api` owns the main PostgreSQL schema (`public`). `identity` shares the same PostgreSQL instance via a separate schema. One DB instance, two schemas (`public` for api, `identity` for identity server). **Jira is the system of record for ticket content** (title, description, status, priority, comments, attachments) — `api` stores only a minimal `Ticket` anchor record (`Id`, `JiraIssueKey`, `ClientId`, `CreatedAt`) to link portal identity to Jira data. There is no local copy of ticket content in the `api` database.

**AWS credentials scope.** S3 and SES live in `api` only. `identity` has no direct AWS dependency. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` apply to `api` container only.

**SES ownership.** All email sending (invitations, ticket notifications) lives in `api`. If `identity` needs to trigger an email during registration flow, it does so by delegating to `api` via internal HTTP — or the invitation flow is owned entirely by `api` from the start. Flag for PO agent when writing EPIC-01/EPIC-04 stories.

**OpenIddict (identity server).** The `identity` repo uses OpenIddict as its OIDC server (not a hand-rolled JWT issuer). Key implications: (1) NuGet packages are `OpenIddict.AspNetCore` + `OpenIddict.EntityFrameworkCore`; (2) OpenIddict adds its own EF Core schema — 4 tables (`OpenIddictApplications`, `OpenIddictAuthorizations`, `OpenIddictScopes`, `OpenIddictTokens`) — so `identity` needs its own migration; (3) signing credentials are managed by OpenIddict (`AddDevelopmentSigningCertificate()` in dev, real certificate in prod — no `JWT_SECRET` env var); (4) `api` validates tokens via OpenIddict's discovery endpoint (`/.well-known/openid-configuration`) using `IDENTITY_AUTHORITY` env var, not a shared secret; (5) EPIC-01 auth flows will be OIDC authorization_code + PKCE for SPAs — flag for PO agent.

---

## Summary

| # | Story | Title | Points | Depends on |
|---|---|---|---|---|
| 1 | US-09.2 | Project scaffolding (all 4 repos) | 8 | — |
| 2 | US-09.3 | PostgreSQL + EF Core migrations | 2 | US-09.2 |
| 2 | US-09.5 | AWS S3 configuration | 2 | US-09.2 |
| 2 | US-09.6 | AWS SES configuration | 2 | US-09.2 |
| 3 | US-09.1 | Docker Compose orchestration | 3 | US-09.2, US-09.3, US-09.5, US-09.6 |
| | **Total** | | **17 pts** | |

---

## User Stories & Technical Tasks

---

### US-09.2 — Project scaffolding (all repositories)
> *As a developer, I want all four project repositories scaffolded with the correct tech stack and layer structure so that the team can start building features on a consistent, predictable foundation.*

**Acceptance Criteria:**
- `identity` repo: .NET 10 ASP.NET Core Web API, **2-project structure** (`Identity.Infrastructure` + `Identity.API`), ASP.NET Core Identity + OpenIddict OIDC server + EF Core stub, all DI wired via `AddInfrastructure`, Serilog structured JSON logging, Swagger (dev only), `GET /health` → `200`, dev `Dockerfile` with `dotnet watch`
- `api` repo: .NET 10 ASP.NET Core Web API, 4-layer Clean Architecture, EF Core + Npgsql stub, JWT Bearer via `IDENTITY_AUTHORITY` (wired in `AddInfrastructure`), CORS from env var (wired in `AddInfrastructure`), `ApiControllerBase`, `ExceptionMiddleware` with `{ code, message, details[] }` envelope, Serilog structured JSON logging, Audit.NET wired for automatic EF Core audit trail (see EPIC-11), Swagger (dev only), `GET /health` → `200`, dev `Dockerfile` with `dotnet watch`
- `client-portal` repo: Vite + React 19 + TypeScript, shadcn/ui configured, React Router v7 with routes `/`, `/login`, `/tickets`, `/tickets/:id` (stubs), TanStack Query, Axios instance with `VITE_API_URL`, i18n library installed and wired (Spanish default, English supported — see EPIC-10), dev `Dockerfile` (port 5173)
- `backoffice` repo: Vite + React 19 + TypeScript, shadcn/ui configured, React Router v7 with routes `/`, `/login`, `/admin`, `/admin/users` (stubs), TanStack Query, Axios instance with `VITE_BACKOFFICE_API_URL`, i18n library installed and wired (Spanish default, English supported — see EPIC-10), dev `Dockerfile` (port 5174)
- Each repo contains its own `.env.example` documenting its required variables

**Story Points:** 8

---

#### TASK-09.2.1 — Scaffold `identity` repo
**Layer:** Cross-cutting
**Repo:** identity
**Depends on:** none

Full scaffold of the `identity` repo: 2-project solution (`Identity.Infrastructure` + `Identity.API`), OpenIddict OIDC server fully wired inside `AddInfrastructure`, Serilog, dev Dockerfile.

> **Why 2 projects:** `identity` is a thin infrastructure service with no domain business logic. Imposing 4 Clean Architecture layers would add noise without benefit. `ApplicationUser : IdentityUser` belongs in `Infrastructure` because `IdentityUser` is a framework type — placing it in a `Domain` project would violate the zero-framework-dependency rule.

**Implementation checklist:**
- [ ] Create `SupportHub.Identity.sln` with **two projects**: `Identity.Infrastructure` (class library) and `Identity.API` (ASP.NET Core Web API); add project reference: `Identity.API` → `Identity.Infrastructure`
- [ ] Install NuGet packages in `Identity.Infrastructure`: `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `OpenIddict.AspNetCore`, `OpenIddict.EntityFrameworkCore`
- [ ] Install NuGet packages in `Identity.API`: `Serilog.AspNetCore`, `Serilog.Formatting.Compact`, `Swashbuckle.AspNetCore`
- [ ] Create `ApplicationUser : IdentityUser` in `Identity.Infrastructure/Identity/` (not in a Domain project — `IdentityUser` is a framework type)
- [ ] Create `IdentityAppDbContext : IdentityDbContext<ApplicationUser>` in `Identity.Infrastructure/Persistence/`; call `builder.UseOpenIddict()` in `OnModelCreating`
- [ ] Create `Identity.Infrastructure/DependencyInjection.cs` with `AddInfrastructure(IServiceCollection services, IConfiguration config)` extension method containing:
  - `AddDbContext<IdentityAppDbContext>` reading `ConnectionStrings__Default`
  - `AddIdentity<ApplicationUser, IdentityRole>()` with EF Core stores
  - Full `AddOpenIddict()` block: `.AddCore(opts => opts.UseEntityFrameworkCore().UseDbContext<IdentityAppDbContext>())`, `.AddServer(opts => { opts.SetAuthorizationEndpointUris(...).SetTokenEndpointUris(...).SetUserinfoEndpointUris(...).SetLogoutEndpointUris(...); opts.AllowAuthorizationCodeFlow().RequireProofKeyForCodeExchange(); opts.AddDevelopmentEncryptionCertificate().AddDevelopmentSigningCertificate(); opts.UseAspNetCore().EnableAuthorizationEndpointPassthrough().EnableTokenEndpointPassthrough().EnableUserinfoEndpointPassthrough().EnableLogoutEndpointPassthrough(); })`, `.AddValidation(opts => { opts.UseLocalServer(); opts.UseAspNetCore(); })`
  - OpenIddict client seeding via `IHostedService` (registers SPA client redirect URIs and scopes at startup — not hardcoded in `Program.cs`)
- [ ] In `Identity.API/Program.cs`: call only `builder.Services.AddInfrastructure(builder.Configuration)`; configure Serilog before `builder.Build()`: `builder.Host.UseSerilog((ctx, services, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration).Enrich.FromLogContext().Enrich.WithProperty("Service", "SupportHub.Identity").WriteTo.Console(new CompactJsonFormatter()))`
- [ ] Wire middleware pipeline in `Program.cs` in order: `ExceptionMiddleware` → `app.UseSerilogRequestLogging()` → `app.UseHttpsRedirection()` → `app.UseAuthentication()` → `app.UseAuthorization()` → `app.MapControllers()`
- [ ] Add `ExceptionMiddleware` in `Identity.API/Middleware/` returning standard error envelope `{ code, message, details[] }` on unhandled exceptions
- [ ] Add Swagger/OpenAPI (dev only): `if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }`
- [ ] Add `GET /health` using ASP.NET Core health checks with Npgsql check; exclude from auth
- [ ] Write dev `Dockerfile` (`dotnet watch`, exposes port 5001)
- [ ] Install `Audit.NET` + `Audit.EntityFramework.Core` in `Identity.Infrastructure`; define `IAuditWriter` and a minimal `AuditWriteDbContext` targeting the shared `audit` schema; register `IAuditWriter` in `AddInfrastructure` (see backend-guidelines §15 and EPIC-11)
- [ ] Add `.env.example` with `ASPNETCORE_ENVIRONMENT`, `ConnectionStrings__Default`, `IDENTITY_BASE_URL`

**Definition of Done:**
- [ ] `dotnet build` succeeds with zero warnings
- [ ] `GET /health` returns `200`
- [ ] `GET /.well-known/openid-configuration` returns a valid OIDC discovery document
- [ ] Startup logs emit compact JSON to stdout (Serilog)
- [ ] `Dockerfile` builds and starts with `dotnet watch` on port 5001

---

#### TASK-09.2.2 — Scaffold `api` repo
**Layer:** Cross-cutting
**Repo:** api
**Depends on:** none

Full scaffold of the `api` repo: 4-layer Clean Architecture solution, all DI wired via `AddInfrastructure`, `ApiControllerBase`, `ExceptionMiddleware` with correct error envelope, Serilog, correct middleware pipeline order, dev Dockerfile.

**Implementation checklist:**
- [ ] Create `SupportHub.Api.sln` with four projects: `Api.Domain` (no deps), `Api.Application` (refs Domain), `Api.Infrastructure` (refs Application), `Api.API` (web API); add project references enforcing the dependency rule
- [ ] Install NuGet packages in `Api.Infrastructure`: `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `FluentValidation`, `FluentValidation.DependencyInjectionExtensions`; in `Api.API`: `Swashbuckle.AspNetCore`, `Serilog.AspNetCore`, `Serilog.Formatting.Compact`
- [ ] Create `AppDbContext : DbContext` stub in `Api.Infrastructure/Persistence/`
- [ ] Create `Api.Infrastructure/DependencyInjection.cs` with `AddInfrastructure(IServiceCollection services, IConfiguration config, IWebHostEnvironment env)` extension method containing:
  - `AddDbContext<AppDbContext>` reading `ConnectionStrings__Default`
  - JWT Bearer: `services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opts => { opts.Authority = config["IDENTITY_AUTHORITY"]; opts.Audience = "supporthub-api"; opts.RequireHttpsMetadata = !env.IsDevelopment(); })`
  - CORS: `services.AddCors(opts => opts.AddDefaultPolicy(policy => policy.WithOrigins(config["CORS_ALLOWED_ORIGINS"]!.Split(',')).WithHeaders("Authorization","Content-Type","X-Correlation-ID").WithMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")))`
  - `services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>()`
- [ ] Create `Api.API/Common/ApiControllerBase.cs`: `[ApiController] [Route("api/[controller]")] public abstract class ApiControllerBase : ControllerBase { }`
- [ ] Create `Api.API/Common/ErrorResponse.cs`: `public record ErrorResponse(string Code, string Message, IReadOnlyList<string> Details);`
- [ ] Create `Api.API/Common/ResultExtensions.cs` with `ToActionResult<T>(this Result<T> result, ControllerBase controller)` mapping `NotFoundError` → 404, `ConflictError` → 409, `ForbiddenError` → 403, validation errors → 422, others → 400
- [ ] Create `Api.API/Middleware/ExceptionMiddleware.cs` catching unhandled exceptions and returning `500` with envelope `{ "code": "INTERNAL_ERROR", "message": "An unexpected error occurred.", "details": [] }`; log the full exception via `ILogger`
- [ ] Install `Audit.NET` + `Audit.EntityFramework.Core` in `Api.Infrastructure`; wire `AppDbContext` to inherit `AuditDbContext`; configure Audit.NET in `AddInfrastructure` with the `audit` PostgreSQL schema as target and sensitive-field redaction (see backend-guidelines §15 and EPIC-11)
- [ ] Configure Serilog in `Program.cs` before `builder.Build()`: `builder.Host.UseSerilog((ctx, services, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration).Enrich.FromLogContext().Enrich.WithProperty("Service", "SupportHub.Api").WriteTo.Console(new CompactJsonFormatter()))`
- [ ] In `Program.cs` call only: `builder.Services.AddInfrastructure(builder.Configuration, builder.Environment)`
- [ ] Wire middleware pipeline in `Program.cs` in the required order: `app.UseMiddleware<ExceptionMiddleware>()` → `app.UseSerilogRequestLogging()` → `app.UseHttpsRedirection()` → `app.UseCors()` → `app.UseAuthentication()` → `app.UseAuthorization()` → `app.MapControllers()`
- [ ] Add Swagger with JWT Bearer auth scheme (dev only): `if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(opts => opts.OAuthUsePkce()); }`
- [ ] Add `GET /health` using ASP.NET Core health checks with Npgsql check; exclude from auth
- [ ] Write dev `Dockerfile` (`dotnet watch`, exposes port 5000)
- [ ] Add `.env.example` with `ASPNETCORE_ENVIRONMENT`, `ConnectionStrings__Default`, `IDENTITY_AUTHORITY`, `CORS_ALLOWED_ORIGINS`

**Definition of Done:**
- [ ] `dotnet build` succeeds with zero warnings
- [ ] `GET /health` returns `200`
- [ ] Preflight from `localhost:5173` and `localhost:5174` returns correct CORS headers
- [ ] JWT Bearer middleware resolves JWKS from `IDENTITY_AUTHORITY/.well-known/openid-configuration` when identity is running
- [ ] Unhandled exception returns `{ "code": "INTERNAL_ERROR", "message": "...", "details": [] }` with status `500`
- [ ] Startup logs emit compact JSON to stdout (Serilog)
- [ ] `Program.cs` contains no direct references to Infrastructure types other than `AddInfrastructure`

---

#### TASK-09.2.3 — Scaffold `client-portal` repo
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** none

Full scaffold of the `client-portal` repo: Vite + React + shadcn/ui + routing + data fetching + dev Dockerfile.

**Implementation checklist:**
- [ ] Initialize with `npm create vite@latest -- --template react-ts`; delete boilerplate (App.css, logo, counter)
- [ ] Establish folder structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/lib/`, `src/types/`
- [ ] Enable TypeScript strict mode in `tsconfig.json`
- [ ] Install and configure `shadcn/ui` (New York style, Slate base, CSS variables); verify with a `<Button>` render
- [ ] Configure React Router v7 with stub pages: `/` → `<HomePage />`, `/login` → `<LoginPage />`, `/tickets` → `<TicketsPage />`, `/tickets/:id` → `<TicketDetailPage />`, `*` → `<NotFoundPage />`
- [ ] Configure TanStack Query: `QueryClient` with `staleTime: 60_000`, `retry: 1`; wrap app root; add DevTools in dev
- [ ] Configure Axios instance in `src/lib/axios.ts`: `baseURL` from `VITE_API_URL`; stub request interceptor (JWT attachment, wired in EPIC-01); stub `401` response interceptor
- [ ] Install and wire the i18n library (to be decided by architect — see EPIC-10); create `src/locales/es/` and `src/locales/en/` translation file stubs; configure Spanish as the default/fallback language; no hardcoded UI strings in any component from this point forward
- [ ] Write dev `Dockerfile` (`node:20-alpine`, `--host 0.0.0.0`, exposes port 5173)
- [ ] Add `.env.example` with `VITE_API_URL=http://localhost:5000`

**Definition of Done:**
- [ ] `npm run dev` starts, all stub routes render without errors
- [ ] `Dockerfile` builds, dev server accessible at port 5173 from host
- [ ] `apiClient.get('/health')` returns `200` when `api` container is running
- [ ] i18n library resolves translation keys for both `es` and `en` without errors

---

#### TASK-09.2.4 — Scaffold `backoffice` repo
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** none

Full scaffold of the `backoffice` repo — same stack as `client-portal`, different routes and port.

**Implementation checklist:**
- [ ] Same setup steps as TASK-09.2.3 (Vite, TypeScript strict, shadcn/ui, TanStack Query, Axios)
- [ ] Configure React Router v7 with stub pages: `/` → `<HomePage />`, `/login` → `<LoginPage />`, `/admin` → `<AdminDashboardPage />`, `/admin/users` → `<UsersPage />`, `*` → `<NotFoundPage />`
- [ ] Axios `baseURL` from `VITE_BACKOFFICE_API_URL`
- [ ] Install and wire the same i18n library used in TASK-09.2.3; create `src/locales/es/` and `src/locales/en/` translation file stubs; configure Spanish as the default/fallback language (see EPIC-10)
- [ ] Write dev `Dockerfile` on port **5174** (avoid collision with `client-portal`)
- [ ] Add `.env.example` with `VITE_BACKOFFICE_API_URL=http://localhost:5000`

**Definition of Done:**
- [ ] `npm run dev` starts on port 5174 without errors
- [ ] `Dockerfile` builds and is reachable on port 5174 from host
- [ ] i18n library resolves translation keys for both `es` and `en` without errors

---

### US-09.3 — PostgreSQL setup with baseline EF Core migration
> *As a developer, I want PostgreSQL running in Docker with EF Core migrations so that the database schema is version-controlled and reproducible.*

**Acceptance Criteria:**
- PostgreSQL 17 container defined in Docker Compose with persistent volume
- Database name, user, and password configured via environment variables
- `api` `AppDbContext` and `identity` `IdentityAppDbContext` both connect successfully on startup
- Baseline migrations exist in both `api` and `identity` repos (`identity` migration includes OpenIddict schema tables)
- The `api` baseline migration creates `public.AuditLogs` (owned by `api`). The `identity` baseline migration creates `identity.AuditLogs` (owned by `identity`). Both tables have identical column structures — no shared schema, no cross-service migration dependency (see EPIC-11).
- Migrations run automatically on startup in development for both backends
- Database is reachable from both backend containers by service name

**Story Points:** 2

---

#### TASK-09.3.1 — PostgreSQL + EF Core setup for `api` repo
**Layer:** Infrastructure + DB
**Repo:** api
**Depends on:** TASK-09.2.2

DbContext configuration, baseline migration, and auto-run on startup for the `api` backend.

**Implementation checklist:**
- [ ] Ensure `AppDbContext` reads `ConnectionStrings__Default` (format: `Host=postgres;Database=supporthub;Username=...;Password=...`)
- [ ] Register `AddDbContext<AppDbContext>` inside `AddInfrastructure`
- [ ] Update `api` `.env.example` with `ConnectionStrings__Default` placeholder
- [ ] Run `dotnet ef migrations add InitialBaseline --project Api.Infrastructure --startup-project Api.API`; ensure migration creates the `public.AuditLogs` table (see backend-guidelines §15 — `api` owns this table, no separate audit schema); commit files
- [ ] In `Program.cs`, resolve `AppDbContext` after `app.Build()` and call `context.Database.MigrateAsync()` — **development only** (guard with `if (app.Environment.IsDevelopment())`); wrap in try/catch, log full exception and re-throw on failure so the container exits with a non-zero code
- [ ] Add note in `.env.example` and `README`: in production, migrations must be applied manually via `dotnet ef database update` before deploying — auto-migration is disabled in non-Development environments

**Definition of Done:**
- [ ] `AppDbContext` connects to Postgres on startup without error
- [ ] Migration files exist in `Api.Infrastructure/Migrations/`
- [ ] `docker-compose up` applies migrations automatically on first run in Development
- [ ] Container exits with a clear log if DB is unreachable

---

#### TASK-09.3.2 — PostgreSQL + EF Core setup for `identity` repo
**Layer:** Infrastructure + DB
**Repo:** identity
**Depends on:** TASK-09.2.1

DbContext configuration, baseline migration (includes OpenIddict schema), and auto-run on startup for the `identity` backend.

**Implementation checklist:**
- [ ] Ensure `IdentityAppDbContext` reads `ConnectionStrings__Default`
- [ ] Register `AddDbContext<IdentityAppDbContext>` inside `AddInfrastructure`
- [ ] Update `identity` `.env.example` with `ConnectionStrings__Default` placeholder
- [ ] Run `dotnet ef migrations add InitialBaseline --project Identity.Infrastructure --startup-project Identity.API`; verify migration includes ASP.NET Core Identity tables (`AspNetUsers`, `AspNetRoles`, etc.), OpenIddict tables (`OpenIddictApplications`, `OpenIddictAuthorizations`, `OpenIddictScopes`, `OpenIddictTokens`), and `identity.AuditLogs` (see backend-guidelines §15 — `identity` owns its own audit table); commit files
- [ ] In `Program.cs`, resolve `IdentityAppDbContext` after `app.Build()` and call `context.Database.MigrateAsync()` — **development only** (guard with `if (app.Environment.IsDevelopment())`); wrap in try/catch, log full exception and re-throw on failure so the container exits with a non-zero code
- [ ] Add note in `.env.example` and `README`: in production, migrations must be applied manually via `dotnet ef database update` before deploying — auto-migration is disabled in non-Development environments

**Definition of Done:**
- [ ] `IdentityAppDbContext` connects to Postgres on startup without error
- [ ] Migration files exist in `Identity.Infrastructure/Migrations/` and include all OpenIddict tables
- [ ] `docker-compose up` applies migrations automatically on first run in Development
- [ ] Container exits with a clear log if DB is unreachable

---

### US-09.5 — AWS S3 file storage configuration
> *As a developer, I want AWS S3 configured in the `api` backend so that the application can store and retrieve file attachments.*

**Acceptance Criteria:**
- `AWSSDK.S3` NuGet package installed in `api` repo (`Infrastructure` project)
- `IS3Service` interface defined in `Application` with `UploadAsync` and `GetPresignedUrlAsync` methods
- `S3Service` implementation reads credentials and bucket name from environment variables
- Files uploaded with a GUID-based key to avoid naming collisions
- Presigned URLs generated with configurable expiry (default 1 hour)
- Service registered in DI
- Manual test confirms a file can be uploaded and retrieved via presigned URL

**Story Points:** 2

---

#### TASK-09.5.1 — S3 file storage service (`api` repo)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** TASK-09.2.2

Interface, implementation, DI registration, and env var documentation for S3 file storage — delivered as one coherent unit.

**Implementation checklist:**
- [ ] Create `Api.Application/Interfaces/IS3Service.cs` with two methods: `Task<string> UploadAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)` (returns object key, not URL) and `Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry, CancellationToken ct = default)` — no AWS SDK references in Application
- [ ] Install `AWSSDK.S3` in `Infrastructure`
- [ ] Implement `S3Service : IS3Service`: key strategy `$"{Guid.NewGuid()}/{fileName}"`; read `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` from `IConfiguration`; presigned URL expiry from `S3_PRESIGNED_URL_EXPIRY_MINUTES` (default 60); all calls fully async
- [ ] Register `services.AddScoped<IS3Service, S3Service>()` inside `AddInfrastructure`
- [ ] Add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`, `S3_PRESIGNED_URL_EXPIRY_MINUTES` to `api` `.env.example` with placeholder values and comments

**Definition of Done:**
- [ ] `IS3Service` resolves from DI with zero AWS SDK references in `Application`
- [ ] File uploaded via `UploadAsync` is retrievable via URL returned by `GetPresignedUrlAsync`
- [ ] No credentials appear anywhere in source code

---

### US-09.6 — AWS SES email service configuration
> *As a developer, I want AWS SES configured in the `api` backend so that the application can send transactional emails.*

**Acceptance Criteria:**
- `AWSSDK.SimpleEmailServiceV2` NuGet package installed in `api` repo
- `IEmailService` interface defined with `SendAsync(to, subject, htmlBody)` method
- `SesEmailService` implementation reads credentials and sender address from environment variables
- Service registered in DI
- A test sends a real email successfully in development environment

**Story Points:** 2

---

#### TASK-09.6.1 — SES email service (`api` repo)
**Layer:** Application + Infrastructure
**Repo:** api
**Depends on:** TASK-09.2.2

Interface, implementation, DI registration, and env var documentation for SES transactional email — delivered as one coherent unit.

**Implementation checklist:**
- [ ] Create `Api.Application/Interfaces/IEmailService.cs`: `Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)` — accepts raw HTML so templates just pass rendered strings; no AWS SDK references in Application
- [ ] Install `AWSSDK.SimpleEmailServiceV2` in `Infrastructure`
- [ ] Implement `SesEmailService : IEmailService`: read `SES_FROM_ADDRESS` and AWS credential vars from `IConfiguration`; send via `SimpleEmailServiceV2Client.SendEmailAsync`; log a warning (not exception) on failure in dev — SES sandbox limits apply; all calls fully async
- [ ] Register `services.AddScoped<IEmailService, SesEmailService>()` inside `AddInfrastructure`
- [ ] Add `SES_FROM_ADDRESS` to `api` `.env.example`; add README note that the sender address must be verified in AWS SES console before emails can be sent

**Definition of Done:**
- [ ] `IEmailService` resolves from DI with zero AWS SDK references in `Application`
- [ ] `SendAsync` delivers a real email to a verified address in the development environment
- [ ] No credentials appear in source code

---

### US-09.1 — Docker Compose orchestration
> *As a developer, I want a Docker Compose setup that orchestrates all four repositories so that I can run the full stack locally with a single command.*

**Acceptance Criteria:**
- `docker-compose up` starts PostgreSQL, `identity`, `api`, `client-portal`, and `backoffice` containers
- All services communicate via a shared Docker network (`supporthub-net`)
- Each backend uses its own repo's `Dockerfile` (hot-reload via `dotnet watch`)
- Each frontend uses its own repo's `Dockerfile` (Vite HMR)
- No port conflicts: `identity` → 5001, `api` → 5000, `client-portal` → 5173, `backoffice` → 5174
- Root `.env.example` consolidates all variables from all repos
- `README.md` documents how to start the full environment from scratch

**Story Points:** 3

---

#### TASK-09.1.1 — Docker Compose orchestration + root README
**Layer:** Infra
**Repo:** root
**Depends on:** TASK-09.2.1, TASK-09.2.2, TASK-09.2.3, TASK-09.2.4

`docker-compose.yml`, root `.env.example`, and developer README — the full local environment setup in one PR.

**Implementation checklist:**
- [ ] Write `docker-compose.yml` with six services on shared network `supporthub-net`: `postgres` (image: postgres:17, named volume `postgres_data`, `POSTGRES_DB/USER/PASSWORD` from `.env`, `pg_isready` healthcheck), `identity` (build: `./identity`, port 5001:5001, depends_on postgres healthy), `api` (build: `./api`, port 5000:5000, depends_on postgres healthy + identity), `client-portal` (build: `./client-portal`, port 5173:5173), `backoffice` (build: `./backoffice`, port 5174:5174); all env vars loaded from root `.env`
- [ ] Write root `.env.example` consolidating all vars from the four repos' individual `.env.example` files; group by service section; each entry has a placeholder value and a one-line comment; no real credentials
- [ ] Write `README.md` covering: prerequisites (Docker Desktop, .NET 10 SDK, Node 20), first-run steps (`cp .env.example .env` → fill vars → `docker-compose up --build`), service URLs (Swagger for both backends, frontend URLs), how to run migrations manually, how to stop and reset the environment

**Definition of Done:**
- [ ] `docker-compose up --build` starts all 6 services without errors
- [ ] All services reachable on their assigned ports from the host
- [ ] Postgres data persists across `down` / `up` cycles
- [ ] Copying root `.env.example` to `.env` and filling real values is sufficient to start the full stack
- [ ] A developer with no prior context can start the stack from the README alone
