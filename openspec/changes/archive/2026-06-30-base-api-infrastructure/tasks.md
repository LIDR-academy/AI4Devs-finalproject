## 1. NuGet Packages and Project Setup

- [x] 1.1 Add NuGet packages to Aura.Api.csproj: `AspNetCore.HealthChecks.NpgSql`, `AspNetCore.HealthChecks.Redis`, `FluentValidation.AspNetCore`, `Serilog.AspNetCore`, `Serilog.Sinks.Console`, `StackExchange.Redis`, `AWSSDK.S3`, `Microsoft.AspNetCore.Authentication.JwtBearer`
- [x] 1.2 Create `backend/src/Aura.Api/Middleware/` directory for middleware classes
- [x] 1.3 Create `backend/src/Aura.Api/Health/` directory for health check setup
- [x] 1.4 Create `backend/src/Aura.Api/Filters/` directory for action filters

## 2. Domain Exceptions

- [x] 2.1 Create `backend/src/Aura.Core/Exceptions/NotFoundException.cs` — thrown when an entity is not found
- [x] 2.2 Create `backend/src/Aura.Core/Exceptions/ForbiddenAccessException.cs` — thrown when user lacks permission
- [x] 2.3 Create `backend/src/Aura.Core/Exceptions/ConflictException.cs` — thrown on resource conflicts (duplicate slug, etc.)
- [x] 2.4 Create `backend/src/Aura.Core/Exceptions/RateLimitExceededException.cs` — thrown when rate limit is exceeded, includes `RetryAfterSeconds` property
- [x] 2.5 Create `backend/src/Aura.Core/Exceptions/ValidationException.cs` — thrown for domain-level validation failures (distinct from FluentValidation's `ValidationException`)

## 3. Exception Handling Middleware

- [x] 3.1 Create `backend/src/Aura.Api/Middleware/ExceptionHandlingMiddleware.cs` — catches all unhandled exceptions and maps to HTTP status codes per spec (ValidationException→400, UnauthorizedAccessException→401, ForbiddenAccessException→403, NotFoundException→404, ConflictException→409, RateLimitExceededException→429, others→500)
- [x] 3.2 Ensure 500 responses exclude stack traces in production environment
- [x] 3.3 Ensure 429 responses include `Retry-After` header from exception

## 4. Security Headers Middleware

- [x] 4.1 Create `backend/src/Aura.Api/Middleware/SecurityHeadersMiddleware.cs` — adds X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy, Strict-Transport-Security headers to every response

## 5. Rate Limiting Middleware

- [x] 5.1 Create `backend/src/Aura.Api/Middleware/RateLimitingMiddleware.cs` — Dragonfly-backed distributed rate limiter using INCR + EXPIRE pattern
- [x] 5.2 Implement global rate limit: 100 requests per minute per IP (key: `ratelimit:ip:{ip}`)
- [x] 5.3 Implement fail-open behavior: allow requests and log warning when Dragonfly is unreachable
- [x] 5.4 Return 429 with `Retry-After` header when limit exceeded

## 6. CORS Configuration

- [x] 6.1 Configure CORS policy `DefaultPolicy` in Program.cs with environment-based origins (localhost for dev, aura.planning for production), credentials allowed, all headers and methods allowed

## 7. JWT Authentication and Authorization

- [x] 7.1 Configure JWT Bearer authentication in Program.cs with `OnMessageReceived` reading JWT from `aura_session` cookie
- [x] 7.2 Set `TokenValidationParameters`: validate issuer, audience, signing key from `Configuration["Jwt:Key"]`, `ClockSkew = TimeSpan.Zero`
- [x] 7.3 Implement `OnTokenValidated` event to check JWT hash against Dragonfly blacklist key `auth:blacklist:{hash}`
- [x] 7.4 Register authorization policies in Program.cs: EventOwner (role=host), AccompliceScoped (role=accomplice + eventId), PublishedEvent (pass-through), DraftGuestLimit (pass-through), ActiveAccomplice (role=accomplice)

## 8. CSRF Validation Middleware

- [x] 8.1 Create `backend/src/Aura.Api/Middleware/CsrfValidationMiddleware.cs` — validates `X-CSRF-Token` header against `aura_csrf` cookie for POST/PUT/PATCH/DELETE methods
- [x] 8.2 Use `CryptographicOperations.FixedTimeEquals` for timing-safe comparison
- [x] 8.3 Return 403 Forbidden with `{ "error": "CSRF validation failed", "code": "CSRF_INVALID" }` on failure
- [x] 8.4 Exempt GET, HEAD, OPTIONS from CSRF validation

## 9. Health Checks

- [x] 9.1 Create `backend/src/Aura.Api/Health/HealthChecksSetup.cs` with extension method to register health checks
- [x] 9.2 Register PostgreSQL health check using `AspNetCore.HealthChecks.NpgSql`
- [x] 9.3 Register Dragonfly health check using `AspNetCore.HealthChecks.Redis`
- [x] 9.4 Create custom MinIO health check using `AWSSDK.S3` (ListBuckets or head bucket)
- [x] 9.5 Map `/health/live` endpoint (liveness — no dependency checks)
- [x] 9.6 Map `/health/ready` endpoint (readiness — all dependency checks, returns 503 if any unhealthy)

## 10. FluentValidation and Validation Filter

- [x] 10.1 Create `backend/src/Aura.Api/Filters/ValidationFilter.cs` — action filter that checks for FluentValidation `IValidator<T>` and validates the action argument
- [x] 10.2 Return 400 with `{ "error": "Validation failed", "errors": [...] }` on validation failure
- [x] 10.3 Register `ValidationFilter` globally in MVC options

## 11. Serilog Logging

- [x] 11.1 Configure Serilog in Program.cs with JSON console sink (`CompactJsonFormatter`)
- [x] 11.2 Add `Serilog.AspNetCore` request logging middleware
- [x] 11.3 Configure correlation ID enrichment via `Enrich.FromLogContext()`
- [x] 11.4 Set minimum level: Information for production, Debug for development

## 12. DI Registration (Dragonfly and MinIO)

- [x] 12.1 Register `IConnectionMultiplexer` (StackExchange.Redis) as singleton in DI using `Configuration["Dragonfly:ConnectionString"]`
- [x] 12.2 Register `IDatabase` (from IConnectionMultiplexer.GetDatabase()) as scoped in DI
- [x] 12.3 Register `IAmazonS3` (AWSSDK.S3) configured with MinIO endpoint from `Configuration["Minio:Endpoint"]` and credentials

## 13. Program.cs Composition Root

- [x] 13.1 Rewrite `backend/src/Aura.Api/Program.cs` to register all services: controllers with ValidationFilter, JWT auth, authorization policies, CORS, health checks, Serilog, FluentValidation, Dragonfly, MinIO
- [x] 13.2 Register middleware pipeline in exact order: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → CSRF → Authentication → Authorization → Routing (MapControllers)
- [x] 13.3 Remove `app.UseHttpsRedirection()` (handled by Ingress TLS termination in K8s)
- [x] 13.4 Configure OpenAPI/Swagger with `cookieAuth` and `csrfAuth` security schemes

## 14. Integration Tests

- [x] 14.1 Create test for ExceptionHandlingMiddleware: domain exceptions map to correct HTTP status codes
- [x] 14.2 Create test for SecurityHeadersMiddleware: all security headers present in response
- [x] 14.3 Create test for RateLimitingMiddleware: 429 returned after exceeding limit (with Dragonfly Testcontainer or mock)
- [x] 14.4 Create test for CsrfValidationMiddleware: 403 on missing/mismatched CSRF token, GET bypasses
- [x] 14.5 Create test for health check endpoints: `/health/live` returns 200, `/health/ready` returns status per dependency
- [x] 14.6 Create test for ValidationFilter: invalid DTO returns 400 with error details

## 15. Verify and Build

- [x] 15.1 Run `dotnet build` — solution compiles without errors
- [x] 15.2 Run `dotnet test` — all tests pass
- [x] 15.3 Verify API starts with `dotnet run` and responds to `GET /` with 200 OK
- [x] 15.4 Verify `/health/live` returns 200 and `/health/ready` returns dependency status
