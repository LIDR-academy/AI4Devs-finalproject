## Context

The Aura.Api project currently has a minimal `Program.cs` with OpenAPI (Scalar), HTTPS redirection, and a root GET endpoint. The `Aura.Infrastructure` layer is already set up with EF Core (PostgreSQL), all repository implementations, and a `DependencyInjection.cs` extension method registering DbContext and repositories.

The project targets .NET 9 (will upgrade to .NET 10 later). Dragonfly (Redis-compatible) is the chosen distributed cache/queue. The security architecture (documented in `05-security.md`) specifies JWT in httpOnly cookies with double-submit CSRF, Dragonfly-backed token blacklist, and a strict middleware ordering.

No middleware, authentication, authorization, health checks, or logging exist yet. This design establishes the HTTP pipeline that all subsequent feature endpoints will inherit.

## Goals / Non-Goals

**Goals:**
- Establish the complete middleware pipeline in the exact order specified by the security architecture
- Configure JWT Bearer authentication reading from `aura_session` httpOnly cookie
- Implement CSRF protection via double-submit cookie pattern
- Register authorization policies (EventOwner, AccompliceScoped, etc.)
- Add Kubernetes health probes with real dependency checks
- Integrate FluentValidation as automatic pipeline behavior
- Configure Serilog structured JSON logging with correlation IDs
- Register Dragonfly (StackExchange.Redis) and MinIO (AWSSDK.S3) clients in DI

**Non-Goals:**
- Implementing any business endpoints (auth, events, RSVP, etc.) — those come in subsequent tickets
- Implementing the actual email/WhatsApp/Stripe service integrations — only DI registration of their abstractions
- Setting up the background worker projects — they have their own ticket
- Configuring Kubernetes manifests — separate infrastructure ticket
- Implementing PII encryption converters — already done in Infrastructure layer

## Decisions

### Decision 1: Controllers over Minimal APIs

**Choice:** Use controller-based endpoints rather than Minimal APIs.

**Rationale:** Controllers provide better organization for a project with many endpoints, built-in model validation filter integration, and clearer OpenAPI documentation generation. The team is more familiar with controllers. Minimal APIs can be used selectively for simple endpoints (health checks).

**Alternatives considered:**
- Minimal APIs: simpler for small projects, but harder to organize as endpoint count grows; FluentValidation integration is less idiomatic

### Decision 2: ASP.NET Core HealthChecks library

**Choice:** Use `AspNetCore.Diagnostics.HealthChecks` NuGet packages (`NpgSql`, `Redis`) rather than writing custom health check implementations.

**Rationale:** Battle-tested, community-maintained packages that handle connection pooling, timeouts, and degradation checks. Writing custom health checks adds maintenance burden for no benefit.

**Alternatives considered:**
- Custom `IHealthCheck` implementations: more control but reinventing the wheel; would need to handle connection timeouts, retry logic, and result formatting manually

### Decision 3: StackExchange.Redis for Dragonfly

**Choice:** Use `StackExchange.Redis` as the Dragonfly client since Dragonfly is Redis API-compatible.

**Rationale:** Dragonfly exposes the Redis protocol, so the standard `StackExchange.Redis` client works without modification. This is the most mature .NET Redis client with connection multiplexing and async support.

**Alternatives considered:**
- Custom Dragonfly client: none exists for .NET; unnecessary since Redis protocol is fully supported

### Decision 4: Serilog with ASP.NET Core integration

**Choice:** Use `Serilog.AspNetCore` with JSON console sink and request logging middleware for correlation IDs.

**Rationale:** Serilog is the de facto standard for structured logging in .NET. The ASP.NET Core integration provides automatic request logging with correlation IDs, enrichment, and sink routing. Loki-compatible JSON output.

**Alternatives considered:**
- Built-in `ILogger`: simpler but lacks structured logging, enrichment, and sink flexibility
- NLog: viable but less community adoption in the .NET cloud-native space

### Decision 5: Middleware as separate classes

**Choice:** Each middleware (ExceptionHandling, SecurityHeaders, RateLimiting, CsrfValidation) is a separate class in `Aura.Api/Middleware/`.

**Rationale:** Separation of concerns, testability (each middleware can be unit tested in isolation with a mock `RequestDelegate`), and clarity of the pipeline order in `Program.cs`.

**Alternatives considered:**
- Inline middleware (lambda in Program.cs): harder to test, clutters the composition root

### Decision 6: FluentValidation as pipeline behavior vs action filter

**Choice:** Use an action filter (`ValidationFilter`) registered globally rather than MediatR pipeline behavior, since the project uses controllers (not CQRS/MediatR at this stage).

**Rationale:** Action filters integrate naturally with ASP.NET Core controllers and model binding. MediatR pipeline behaviors would require introducing MediatR as a dependency before CQRS is adopted.

**Alternatives considered:**
- MediatR IPipelineBehavior: better for CQRS architecture but premature at this stage
- Manual validation in each action: error-prone, repetitive

### Decision 7: AWSSDK.S3 for MinIO

**Choice:** Use `AWSSDK.S3` NuGet package configured with MinIO endpoint.

**Rationale:** MinIO is S3-compatible. The AWS SDK is the most mature S3 client for .NET and works with any S3-compatible endpoint by configuring `ServiceURL`.

## Risks / Trade-offs

**[Risk] Dragonfly unavailability blocks all requests** → Rate limiting middleware MUST fail open (allow requests) if Dragonfly is unreachable, rather than failing closed (deny all). Log a warning when this occurs. Health checks will separately flag Dragonfly as unhealthy.

**[Risk] CSRF cookie not set on first request** → The CSRF cookie is set during the authentication flow (login/magic-link verify). Unauthenticated endpoints (RSVP, webhook handlers) are exempt from CSRF by design. The middleware skips paths that don't require CSRF.

**[Risk] Middleware ordering bugs** → The exact order is documented in security architecture and enforced by the single `Program.cs` composition root. Integration tests will verify the pipeline order by asserting that exception handling wraps all other middleware.

**[Trade-off] No MediatR/CQRS yet** → Controllers with action filters are simpler for the current scope. When CQRS is adopted, FluentValidation will migrate from action filter to MediatR pipeline behavior. This is a deliberate deferral, not an oversight.

**[Trade-off] Health checks use direct connections** → Readiness checks open direct connections to PostgreSQL, Dragonfly, and MinIO rather than using connection pools. This is intentional to verify actual connectivity, but adds a small overhead per health check call. Acceptable since health checks are called infrequently (every 10-30s by K8s).
