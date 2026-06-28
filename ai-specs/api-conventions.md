# API Conventions — SupportHub

> Conventions for the `api` repository (and any future scheduler/worker service that exposes HTTP).
> All controllers, middleware, and HTTP contracts must conform to these rules.
> The architect-agent must follow these when generating technical tasks.

---

## 1. Controller Rules

- Controllers live in `API/Controllers/{Feature}/`.
- Inherit from `ApiControllerBase` (defined in `API/Common/`) — never from `ControllerBase` directly.
- `ApiControllerBase` carries `[ApiController]`, `[Route("api/[controller]")]`, and the `ToActionResult` extension.
- One controller per feature/aggregate. Controllers are thin — no business logic.
- Controller methods inject use cases via constructor, call `ExecuteAsync`, and map `Result<T>` to `IActionResult`.
- Method names match HTTP verb intent: `Create`, `GetById`, `List`, `Update`, `Delete`.

```csharp
// API/Common/ApiControllerBase.cs
[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase { }

// API/Controllers/Tickets/TicketsController.cs
[Authorize]
public sealed class TicketsController(ICreateTicketUseCase createTicket) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTicketRequest request, CancellationToken ct)
    {
        var cmd = new CreateTicketCommand(request.Title, request.ClientId, request.Description);
        var result = await createTicket.ExecuteAsync(cmd, ct);
        return result.ToActionResult(this);
    }
}
```

---

## 2. Result-to-HTTP Mapping

All `Result<T>` → `IActionResult` mapping is handled by a single extension method in `API/Common/ResultExtensions.cs`. **Never write HTTP status codes inline in controllers.**

| Result state | HTTP status |
|---|---|
| `IsSuccess` (POST/PUT) | `201 Created` or `200 OK` depending on verb |
| `IsSuccess` (GET) | `200 OK` |
| `IsSuccess` (DELETE) | `204 No Content` |
| Contains `NotFoundError` | `404 Not Found` |
| Contains `ConflictError` | `409 Conflict` |
| Contains `ForbiddenError` | `403 Forbidden` |
| Contains validation errors | `422 Unprocessable Entity` |
| Contains any other error | `400 Bad Request` |

```csharp
// API/Common/ResultExtensions.cs
public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(
        this Result<T> result, ControllerBase controller, string? createdAtAction = null)
    {
        if (result.IsSuccess)
            return createdAtAction is not null
                ? controller.CreatedAtAction(createdAtAction, result.Value)
                : controller.Ok(result.Value);

        return result.Errors.FirstOrDefault() switch
        {
            NotFoundError  => controller.NotFound(result.ToErrorResponse()),
            ConflictError  => controller.Conflict(result.ToErrorResponse()),
            ForbiddenError => controller.StatusCode(403, result.ToErrorResponse()),
            _              => result.Errors.Any(e => e is ValidationError)
                                ? controller.UnprocessableEntity(result.ToErrorResponse())
                                : controller.BadRequest(result.ToErrorResponse())
        };
    }
}
```

---

## 3. Error Response Envelope

Every non-2xx response returns one of two JSON shapes depending on whether the error is a single business-rule failure or a set of validation failures. No plain strings, no ASP.NET Core `ProblemDetails` — use these envelopes consistently across all controllers.

### Single error (business-rule failures, auth, not-found, etc.)

```json
{
  "error": {
    "code": "E0301",
    "message": "Ticket not found."
  }
}
```

### Validation errors (multiple, field-level — HTTP 422)

```json
{
  "errors": [
    { "code": "E0901", "field": "title",       "message": "Title is required." },
    { "code": "E0902", "field": "description", "message": "Description exceeds 2000 characters." }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `code` | `string` | Structured error code — format `E{domain}{seq}` (see §3a below). |
| `message` | `string` | English human-readable summary. Always English — frontends localise via code. |
| `field` | `string?` | Only present on validation errors. The camelCase request field name. |

The HTTP status code is **not** duplicated in the response body — it is on the HTTP response only.

---

### 3a. Error Code Catalogue

**Format:** `E` + 2-digit domain prefix + 2-digit sequence, zero-padded. Example: `E0101`.

| Domain prefix | Domain | Example codes |
|---|---|---|
| `E01xx` | Auth / identity (login, token, activation, password reset) | `E0101` UserNotFound, `E0102` InvalidCredentials, `E0103` AccountLocked, `E0104` InvalidToken, `E0105` TokenExpired |
| `E02xx` | User management (invite, edit, deactivate) | `E0201` EmailAlreadyExists, `E0202` UserAlreadyActive, `E0203` UserAlreadyInactive |
| `E03xx` | Tickets | `E0301` TicketNotFound, `E0302` TicketCreateFailed, `E0303` CommentCreateFailed |
| `E04xx` | Clients / tenants | `E0401` ClientNotFound, `E0402` ClientProjectNotFound |
| `E05xx` | File attachments (S3) | `E0501` UploadFailed, `E0502` FileNotFound |
| `E06xx` | Email (SES) | `E0601` EmailSendFailed |
| `E07xx` | Jira integration | `E0701` JiraCreateFailed, `E0702` JiraCommentFailed, `E0703` JiraConnectionFailed |
| `E09xx` | Generic / infrastructure | `E0901` ValidationFailed, `E0902` ServiceUnavailable, `E0903` ConcurrencyConflict |

**Rules for the catalogue:**
- All error codes are defined as `public const string` fields in `Api.Application/Common/Errors/ErrorCodes.cs`.
- English messages paired with each code live in `Api.Application/Common/Errors/ErrorMessages.cs` as a `static readonly Dictionary<string, string>`.
- FluentValidation validators must call `.WithErrorCode(ErrorCodes.ValidationFailed)` (or the specific code) so the code propagates into the validation error envelope — never pass a raw string.
- Both classes live in `Api.Application` — zero Infrastructure dependency.
- When adding a new error, add the code constant and the English message in the same commit. Never add one without the other.
- Do not reuse or renumber existing codes. When a code is retired, mark it `// RETIRED — do not reuse` rather than deleting it.

```csharp
// Api.Application/Common/Errors/ErrorCodes.cs
public static class ErrorCodes
{
    // Auth / identity
    public const string UserNotFound        = "E0101";
    public const string InvalidCredentials  = "E0102";
    public const string AccountLocked       = "E0103";
    public const string InvalidToken        = "E0104";
    public const string TokenExpired        = "E0105";

    // User management
    public const string EmailAlreadyExists  = "E0201";

    // Tickets
    public const string TicketNotFound      = "E0301";

    // Clients
    public const string ClientNotFound      = "E0401";

    // Generic
    public const string ValidationFailed    = "E0901";
    public const string ServiceUnavailable  = "E0902";
    public const string ConcurrencyConflict = "E0903";
}

// Api.Application/Common/Errors/ErrorMessages.cs
public static class ErrorMessages
{
    public static readonly IReadOnlyDictionary<string, string> Map =
        new Dictionary<string, string>
        {
            [ErrorCodes.UserNotFound]       = "User not found.",
            [ErrorCodes.InvalidCredentials] = "Invalid email or password.",
            [ErrorCodes.AccountLocked]      = "Account is locked. Try again in 15 minutes.",
            [ErrorCodes.InvalidToken]       = "The token is invalid.",
            [ErrorCodes.TokenExpired]       = "The token has expired.",
            [ErrorCodes.EmailAlreadyExists] = "A user with this email already exists.",
            [ErrorCodes.TicketNotFound]     = "Ticket not found.",
            [ErrorCodes.ClientNotFound]     = "Client not found.",
            [ErrorCodes.ValidationFailed]   = "One or more validation errors occurred.",
            [ErrorCodes.ServiceUnavailable] = "A downstream service is unavailable. Try again later.",
            [ErrorCodes.ConcurrencyConflict]= "The resource was modified by another request. Reload and try again.",
        };
}
```

---

### 3b. `ErrorResponse` shape and `ResultExtensions` mapping

```csharp
// API/Common/ErrorResponse.cs
public record ErrorDetail(string Code, string Message, string? Field = null);

public record ErrorResponse
{
    public ErrorDetail? Error { get; init; }
    public IReadOnlyList<ErrorDetail>? Errors { get; init; }

    public static ErrorResponse Single(string code, string message) =>
        new() { Error = new ErrorDetail(code, message) };

    public static ErrorResponse Validation(IEnumerable<(string Code, string Field, string Message)> errors) =>
        new() { Errors = errors.Select(e => new ErrorDetail(e.Code, e.Message, e.Field)).ToList() };
}
```

`ResultExtensions.ToActionResult` maps `Result<T>` errors to HTTP + envelope:

| Error type | HTTP | Envelope shape |
|---|---|---|
| `NotFoundError` | 404 | `Single(E0x01, message)` |
| `ConflictError` | 409 | `Single(E0x02, message)` |
| `ForbiddenError` | 403 | `Single(E09xx, message)` |
| Validation errors | 422 | `Validation([(code, field, message), ...])` |
| `ServiceUnavailableError` | 503 | `Single(E0902, message)` |
| `ConcurrencyConflictError` | 409 | `Single(E0903, message)` |
| Any other error | 400 | `Single(code, message)` |

**Frontend contract:** the frontend receives `error.code` or `errors[n].code`, looks up the localised string in its `errors` i18n namespace, and falls back to the English `message` field if the code is not in its catalogue. The backend is fully culture-agnostic — no `IStringLocalizer`, no `.resx`, no `RequestLocalizationOptions`.

---

## 4. URL & Routing Conventions

- All routes are lowercase, kebab-case: `/api/tickets`, `/api/ticket-comments`.
- Resource noun in plural: `/tickets`, not `/ticket`.
- Nested resources for sub-collections: `/api/tickets/{ticketId}/comments`.
- No verbs in URLs: use HTTP methods, not `/api/tickets/create`.
- API versioning: **not implemented in v1**. If needed in future, use URL segment (`/api/v2/`).

| Operation | Method | Route |
|---|---|---|
| List | GET | `/api/tickets` |
| Get by ID | GET | `/api/tickets/{id}` |
| Create | POST | `/api/tickets` |
| Full update | PUT | `/api/tickets/{id}` |
| Partial update | PATCH | `/api/tickets/{id}` |
| Delete | DELETE | `/api/tickets/{id}` |
| Sub-collection list | GET | `/api/tickets/{id}/comments` |
| Sub-collection create | POST | `/api/tickets/{id}/comments` |

---

## 5. Pagination

All list endpoints that can return more than 20 items must support pagination.

Two strategies are available. Choose based on the data source and UX requirements:

| | Strategy | When to use |
|---|---|---|
| **Default** | Cursor-based | Data source is a local PostgreSQL table. Stable under concurrent inserts, efficient on indexed columns. |
| **Exception** | Offset/page-based | Data source is an external API that natively uses offset pagination (e.g. Jira `startAt`/`maxResults`), **or** the UX requires total-count display and direct page navigation (page N of M). Document the deviation in the epic's Architecture Note. |

---

### 5a. Cursor-based (default)

**Query parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `cursor` | `string?` | `null` | Opaque base64-encoded cursor from previous response. |
| `limit` | `int` | `20` | Max `100`. |

**Response envelope:**

```json
{
  "items": [...],
  "nextCursor": "eyJpZCI6IjEyMyJ9",
  "hasMore": true
}
```

```csharp
// Application/Common/PagedResult.cs
public record PagedResult<T>(IReadOnlyList<T> Items, string? NextCursor, bool HasMore);
```

---

### 5b. Offset/page-based (exception — requires documented justification)

**Query parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | `int` | `1` | 1-based page number. |
| `pageSize` | `int` | `20` | Allowed values defined per endpoint (e.g. `10`, `20`, `50`). |

**Response envelope:**

```json
{
  "items": [...],
  "totalCount": 84,
  "page": 2,
  "pageSize": 20,
  "totalPages": 5
}
```

```csharp
// Application/Common/PagedOffsetResult.cs
public record PagedOffsetResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);
```

**Current uses of this strategy:**
- `GET /api/tickets` (EPIC-02) — backed by Jira `startAt`/`maxResults`; UX requires page-count display and page-size selection.

---

## 6. Authentication & Authorization

- All endpoints are `[Authorize]` by default. Opt-out with `[AllowAnonymous]` for public endpoints (health, OIDC metadata).
- Role-based access via `[Authorize(Roles = "Admin")]` or `[Authorize(Policy = "ClientOnly")]`.
- User identity extracted from JWT claims — never from request body or query string.
- Claim names: `sub` (user ID), `email`, `role`, `client_id` (tenant identifier).
- Ownership checks: every resource load must filter by the authenticated user's `client_id` claim in multi-tenant flows.

```csharp
// Utility: extract user ID from claim in controllers
protected Guid CurrentUserId =>
    Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException());
```

---

## 7. Global Error Middleware

Unhandled exceptions are caught by `ExceptionMiddleware` registered first in the pipeline. Returns the standard error envelope with `500` status.

```csharp
// API/Middleware/ExceptionMiddleware.cs
public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}",
                ctx.Request.Method, ctx.Request.Path);

            ctx.Response.StatusCode = 500;
            ctx.Response.ContentType = "application/json";
            var body = ErrorResponse.Single("E0999", "An unexpected error occurred.");
            await ctx.Response.WriteAsJsonAsync(body);
        }
    }
}
```

Middleware registration order in `Program.cs`:

```
ExceptionMiddleware          ← first
UseSerilogRequestLogging
UseHttpsRedirection
UseCors
UseAuthentication
UseAuthorization
MapControllers               ← last
```

---

## 8. CORS

- Allowed origins configured via `CORS_ALLOWED_ORIGINS` environment variable (comma-separated).
- Development default: `http://localhost:5173,http://localhost:5174`.
- Production: exact origin list only — no wildcards.
- Allowed headers: `Authorization`, `Content-Type`, `X-Correlation-ID`.
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.

```csharp
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(config["CORS_ALLOWED_ORIGINS"]!.Split(','))
              .WithHeaders("Authorization", "Content-Type", "X-Correlation-ID")
              .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")));
```

---

## 9. Request / Response DTO Naming

| Class type | Suffix | Location |
|---|---|---|
| Inbound request body | `Request` | `API/Controllers/{Feature}/` |
| Application command | `Command` | `Application/UseCases/{Feature}/` |
| Application query | `Query` | `Application/UseCases/{Feature}/` |
| Outbound response DTO | `Dto` | `Application/UseCases/{Feature}/` |

**Mapping:** `Request` → `Command` happens in the controller method body (1-2 lines). `Entity` → `Dto` mapping happens in `Application` layer via a `ToDto()` extension method.

No AutoMapper. Explicit mapping only.

---

## 10. Health Check

Every service exposes `GET /health` returning `200 OK` with a JSON body.

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(config.GetConnectionString("Default")!);

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

Health check must be excluded from authentication (`[AllowAnonymous]` implicit on `MapHealthChecks`).

---

## 11. Swagger / OpenAPI

- Swagger UI enabled in `Development` only.
- JWT Bearer scheme registered in Swagger so developers can authenticate in the UI.
- Swagger disabled unconditionally in `Production` (`if (!app.Environment.IsDevelopment()) return`).

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opts => opts.OAuthUsePkce());
}
```

---

## 12. Environment Variables

All configuration comes from environment variables. No secrets in `appsettings.json`.

| Variable | Service | Description |
|---|---|---|
| `ConnectionStrings__Default` | `api`, `identity` | PostgreSQL connection string |
| `IDENTITY_AUTHORITY` | `api` | Base URL of `identity` server (JWKS discovery) |
| `CORS_ALLOWED_ORIGINS` | `api` | Comma-separated allowed origins |
| `AWS_ACCESS_KEY_ID` | `api` | AWS credential |
| `AWS_SECRET_ACCESS_KEY` | `api` | AWS credential |
| `AWS_REGION` | `api` | AWS region |
| `S3_BUCKET_NAME` | `api` | S3 bucket for attachments |
| `SES_FROM_ADDRESS` | `api` | Verified SES sender address |
| `JIRA_BASE_URL` | `api` | Jira Cloud base URL |
| `JIRA_API_TOKEN` | `api` | Jira API token (user PAT) |
| `JIRA_USER_EMAIL` | `api` | Jira user email for basic auth |
| `JIRA_ISSUE_TYPE` | `api` | Jira issue type for created issues (default: `Story`) |
| `API_BASE_URL` | `api` | Public base URL of the api service — used to construct the Jira webhook callback URL displayed in the admin panel (EPIC-08) |
| `INTERNAL_API_KEY` | `api`, `identity` | Shared secret for internal service-to-service calls (e.g. `api` → `identity` `POST /internal/users`). Never exposed to clients. |
| `ASPNETCORE_ENVIRONMENT` | all | `Development` or `Production` |
| `IDENTITY_BASE_URL` | `identity` | Public base URL of identity server |

Each repo's `.env.example` documents its required variables. `.env` is in `.gitignore`.
