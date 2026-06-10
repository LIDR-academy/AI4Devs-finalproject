# Auth Mechanism - Complete Implementation Plan

## Overview

This document details the complete authentication mechanism that was missing from the original design. The API uses **JWT Bearer authentication via httpOnly cookies** with **CSRF protection using the Double-Submit Cookie Pattern**.

---

## 1. Files to Update

| File | Changes Required |
|------|-----------------|
| `technical-documentation/architecture/05-security.md` | Add JWT config, cookie settings, CSRF, middleware order, silent refresh, blacklist, endpoint matrix |
| `technical-documentation/architecture/openapi.json` | Add cookieAuth scheme, CSRF scheme, missing endpoints, update security requirements |
| `tickets/W1-PSRP-003-base-api-infrastructure.md` | Add auth middleware, CSRF middleware, pipeline ordering tasks |
| `tickets/W1-PSRP-004-magic-link-auth-system.md` | Add refresh, logout, profile endpoints, CSRF token generation, cookie setting |
| `tickets/W1-PSRP-005-angular-scaffolding-and-auth-ui.md` | Add CSRF interceptor, silent refresh timer, cookie-based auth handling |
| `tickets/W2-PSRP-006-event-crud-and-onboarding-wizard.md` | Add EventOwner policy requirement references |
| `tickets/W3-PSRP-009-control-dashboard.md` | Add EventOwner policy requirement references |
| `tickets/W6-PSRP-017-accomplice-management.md` | Add accomplice JWT claims, CSRF requirements |

---

## 2. 05-security.md — New Sections to Add

### 2.1 JWT Bearer Authentication Configuration (Program.cs)

Add after "Gestión de Sesiones" section, before "Políticas de Autorización":

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["aura_session"];
                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var tokenHash = Convert.ToBase64String(
                    SHA256.HashData(Encoding.UTF8.GetBytes(context.SecurityToken.ToString())));
                var redis = context.HttpContext.RequestServices.GetRequiredService<IDatabase>();
                if (await redis.KeyExistsAsync($"auth:blacklist:{tokenHash}"))
                {
                    context.Fail("Token has been revoked");
                }
            }
        };
    });

builder.Services.AddAuthorization();
```

### 2.2 Cookie Settings

**Session cookie (httpOnly):**
```csharp
var cookieOptions = new CookieOptions
{
    HttpOnly = true,
    Secure = !env.IsDevelopment(),
    SameSite = SameSiteMode.Strict,
    Expires = jwtExpiry,
    Path = "/"
};
response.Cookies.Append("aura_session", jwtToken, cookieOptions);
```

**CSRF cookie (readable by JS):**
```csharp
var csrfToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
var csrfCookieOptions = new CookieOptions
{
    HttpOnly = false,
    Secure = !env.IsDevelopment(),
    SameSite = SameSiteMode.Strict,
    Expires = jwtExpiry,
    Path = "/"
};
response.Cookies.Append("aura_csrf", csrfToken, csrfCookieOptions);
```

### 2.3 CSRF Protection — Double-Submit Cookie Pattern

**Middleware:**
```csharp
public class CsrfValidationMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> SafeMethods = ["GET", "HEAD", "OPTIONS"];

    public async Task InvokeAsync(HttpContext context)
    {
        if (!SafeMethods.Contains(context.Request.Method))
        {
            var cookieToken = context.Request.Cookies["aura_csrf"];
            var headerToken = context.Request.Headers["X-CSRF-Token"].ToString();

            if (string.IsNullOrEmpty(cookieToken) ||
                string.IsNullOrEmpty(headerToken) ||
                !CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(cookieToken),
                    Encoding.UTF8.GetBytes(headerToken)))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(
                    new { error = "CSRF validation failed", code = "CSRF_INVALID" });
                return;
            }
        }
        await next(context);
    }
}
```

**Angular Interceptor:**
```typescript
// frontend/src/app/core/interceptors/csrf.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] ?? null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (!SAFE_METHODS.includes(req.method)) {
    const csrfToken = getCookie('aura_csrf');
    if (csrfToken) {
      req = req.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } });
    }
  }
  return next(req);
};
```

### 2.4 Middleware Pipeline Order

```csharp
var app = builder.Build();

// 1. Exception Handling (catches everything)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 2. Security Headers
app.UseMiddleware<SecurityHeadersMiddleware>();

// 3. Rate Limiting
app.UseMiddleware<RateLimitingMiddleware>();

// 4. CORS
app.UseCors("DefaultPolicy");

// 5. CSRF Validation (only for POST/PUT/PATCH/DELETE)
app.UseMiddleware<CsrfValidationMiddleware>();

// 6. Authentication (JWT from cookie)
app.UseAuthentication();

// 7. Authorization (policy-based)
app.UseAuthorization();

// 8. Routing
app.MapControllers();

app.Run();
```

### 2.5 Silent Refresh Flow

**Endpoint:** `POST /api/auth/refresh`

- Requires valid JWT in cookie
- Generates new JWT with fresh 24h expiry
- Generates new CSRF token
- Sets both in cookies
- Frontend calls at 50% of JWT lifetime (12 hours)

### 2.6 Token Blacklist

**Storage:** Dragonfly
**Key format:** `auth:blacklist:{jwt_hash}`
**TTL:** Remaining time until JWT natural expiry

**On logout:**
1. Hash current JWT
2. Store in Dragonfly with TTL = remaining seconds
3. Delete cookies

**On every request (in OnTokenValidated):**
1. Hash the validated JWT
2. Check if hash exists in Dragonfly
3. If exists → `context.Fail("Token has been revoked")`

### 2.7 JWT Key Configuration

```json
{
  "Jwt": {
    "Key": "<256-bit base64 string, min 32 chars>",
    "Issuer": "aura.planning",
    "Audience": "aura.planning",
    "ExpiryMinutes": 1440
  }
}
```

**K8s Secret override:**
```yaml
env:
  - name: Jwt__Key
    valueFrom:
      secretKeyRef:
        name: aura-secrets
        key: jwt-key
```

### 2.8 Complete Endpoint Auth Matrix

| Endpoint Group | Path | Method | Auth | Policy | CSRF | Notes |
|---------------|------|--------|------|--------|------|-------|
| Auth | `/api/auth/magic-link` | POST | No | — | No | Anti-enumeration |
| Auth | `/api/auth/verify` | GET | No | — | No | Token in query |
| Auth | `/api/auth/profile` | POST | Yes | JWT (any) | Yes | First login |
| Auth | `/api/auth/refresh` | POST | Yes | JWT (any) | Yes | Silent refresh |
| Auth | `/api/auth/logout` | POST | Yes | JWT (any) | Yes | Blacklists JWT |
| Auth | `/api/auth/me` | GET | Yes | JWT (any) | No | Current user |
| Events | `POST /api/events` | POST | Yes | JWT (host) | Yes | Create event |
| Events | `GET /api/events` | GET | Yes | JWT (host) | No | List events |
| Events | `GET /api/events/{slug}` | GET | Yes | EventOwner | No | Event details |
| Events | `PUT /api/events/{slug}` | PUT | Yes | EventOwner | Yes | Update event |
| Events | `DELETE /api/events/{slug}` | DELETE | Yes | EventOwner | Yes | Soft delete |
| Events | `POST /api/events/{slug}/publish` | POST | Yes | EventOwner | Yes | Stripe |
| Events | `GET /api/events/{slug}/dashboard` | GET | Yes | EventOwner | No | Stats |
| Events | `GET /api/events/{slug}/guests/export` | GET | Yes | EventOwner | No | CSV |
| Events | `POST /api/events/{slug}/guests/import` | POST | Yes | EventOwner | Yes | CSV import |
| Events | `GET /api/events/{slug}/guests` | GET | Yes | EventOwner | No | Guest list |
| Templates | `GET /api/templates` | GET | No | — | No | Public |
| Accomplices | `POST /api/accomplices/{slug}/grant` | POST | Yes | EventOwner | Yes | Grant access |
| Accomplices | `POST /api/accomplices/{slug}/revoke` | POST | Yes | EventOwner | Yes | Revoke |
| Accomplices | `POST /api/accomplices/{slug}/resend` | POST | Yes | EventOwner | Yes | Resend link |
| Accomplices | `GET /api/accomplices/{slug}` | GET | Yes | EventOwner | No | List |
| Accomplices | `GET /api/accomplices/verify` | GET | No | — | No | Token in query |
| Accomplices | `POST /api/accomplices/profile` | POST | Yes | JWT (accomplice) | Yes | First login |
| Live Messages | `POST /api/live/{slug}/send` | POST | Yes | AccompliceScoped | Yes | Swipe-to-send |
| Live Messages | `GET /api/live/{slug}/history` | GET | Yes | AccompliceScoped | No | History |
| RSVP | `GET /api/rsvp/{token}` | GET | No | — | No | Token in path |
| RSVP | `POST /api/rsvp/{token}` | POST | No | — | No | Token in path |
| Payments | `POST /api/payments/{slug}/create` | POST | Yes | EventOwner | Yes | Stripe |
| Payments | `POST /api/payments/webhook` | POST | No | — | No | Stripe sig |
| Webhooks | `POST /api/webhooks/whatsapp` | POST | No | — | No | Meta sig |
| Health | `GET /health/live` | GET | No | — | No | K8s probe |
| Health | `GET /health/ready` | GET | No | — | No | K8s probe |

---

## 3. openapi.json — Changes Required

### 3.1 Security Schemes (replace existing)

```json
"securitySchemes": {
  "cookieAuth": {
    "type": "apiKey",
    "in": "cookie",
    "name": "aura_session",
    "description": "Session JWT stored in httpOnly cookie. Set automatically on login."
  },
  "csrfAuth": {
    "type": "apiKey",
    "in": "header",
    "name": "X-CSRF-Token",
    "description": "CSRF token. Read from aura_csrf cookie and sent as header on state-changing requests."
  }
}
```

### 3.2 Auth Endpoints — Update Responses

**`POST /api/auth/magic-link`** — Response unchanged (200 with message)

**`GET /api/auth/verify`** — Update response:
- Remove `token` from response body
- Add `Set-Cookie` headers to 200 response:
  - `Set-Cookie: aura_session={jwt}; HttpOnly; Secure; SameSite=Strict; Path=/`
  - `Set-Cookie: aura_csrf={token}; Secure; SameSite=Strict; Path=/`
- Response body: `{ "user": { "id", "email", "name", "isFirstLogin" } }`

**Add new auth endpoints:**
- `POST /api/auth/profile` — First-login profile setup
- `POST /api/auth/refresh` — Silent JWT refresh
- `POST /api/auth/logout` — Logout (blacklist JWT, clear cookies)
- `GET /api/auth/me` — Get current authenticated user info

### 3.3 Add Missing Endpoints

- `GET /api/templates` — List available templates (public)
- `GET /api/events` — List user's events (cookieAuth)
- `PUT /api/events/{slug}` — Update event (cookieAuth + csrfAuth)
- `DELETE /api/events/{slug}` — Soft delete event (cookieAuth + csrfAuth)
- `GET /api/events/{slug}/dashboard` — Dashboard stats (cookieAuth)
- `GET /api/events/{slug}/guests/export` — CSV export (cookieAuth)
- `GET /api/events/{slug}/guests` — Guest list (cookieAuth)
- `POST /api/accomplices/{slug}/revoke` — Revoke access (cookieAuth + csrfAuth)
- `POST /api/accomplices/{slug}/resend` — Resend magic link (cookieAuth + csrfAuth)
- `POST /api/accomplices/profile` — Accomplice first-login profile (cookieAuth + csrfAuth)
- `GET /api/live/{slug}/history` — Message history (cookieAuth)
- `POST /api/payments/{slug}/create` — Create Stripe payment (cookieAuth + csrfAuth)
- `POST /api/webhooks/whatsapp` — WhatsApp webhook (no auth, signature verification)

### 3.4 Update Security Requirements on Existing Endpoints

Replace all `"bearerAuth"` references with:
```json
"security": [
  { "cookieAuth": [] }
]
```

For state-changing endpoints (POST, PUT, PATCH, DELETE), add CSRF requirement in description:
```json
"description": "Requires: aura_session cookie + X-CSRF-Token header"
```

### 3.5 Update API Description

Update the `info.description` field to include:
```
## Authentication

Aura Planning uses passwordless authentication via magic links with JWT tokens stored in httpOnly cookies.

### Flow
1. **Request Magic Link**: `POST /api/auth/magic-link` → sends email with login link
2. **Verify Token**: `GET /api/auth/verify?token={token}` → sets session JWT in `aura_session` cookie + CSRF token in `aura_csrf` cookie
3. **Authenticated Requests**: All protected endpoints require the `aura_session` cookie
4. **CSRF Protection**: State-changing requests (POST, PUT, PATCH, DELETE) require `X-CSRF-Token` header matching the `aura_csrf` cookie value
5. **Session Refresh**: `POST /api/auth/refresh` renews JWT at 50% of lifetime
6. **Logout**: `POST /api/auth/logout` blacklists current JWT and clears cookies

### Cookie Details
- `aura_session`: httpOnly, Secure, SameSite=Strict, 24h expiry
- `aura_csrf`: readable by JavaScript, Secure, SameSite=Strict, 24h expiry

### Rate Limits
- Magic link: 3 per email/hour
- RSVP: 5 per token/hour
- Live messages: 20 per accomplice/hour
- Global: 100 per IP/minute
```

---

## 4. Ticket Updates

### 4.1 PSRP-003 (Base API Infrastructure) — Add Requirements

**Add to Requirements checklist:**
- [ ] Configure JWT Bearer authentication with cookie extraction (`OnMessageReceived` reads `aura_session` cookie)
- [ ] Configure `OnTokenValidated` event to check JWT against Dragonfly blacklist
- [ ] Implement `CsrfValidationMiddleware` that validates `X-CSRF-Token` header against `aura_csrf` cookie for state-changing methods (POST, PUT, PATCH, DELETE)
- [ ] Register auth middleware in correct pipeline order: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → CSRF → Authentication → Authorization → Routing
- [ ] Configure JWT validation parameters: Issuer, Audience, SigningKey, ClockSkew=Zero
- [ ] Register authorization policies: EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit, ActiveAccomplice

**Add to Technical Notes:**
- JWT key loaded from `Configuration["Jwt:Key"]` (K8s Secret via env var `Jwt__Key`)
- Cookie settings: `aura_session` (httpOnly, Secure=!IsDevelopment, SameSite=Strict), `aura_csrf` (not httpOnly, same other settings)
- CSRF middleware uses `CryptographicOperations.FixedTimeEquals` for timing-safe comparison

**Add to Acceptance Criteria:**
- [ ] AC7: Given an authenticated request with valid JWT in `aura_session` cookie, when the request reaches a protected endpoint, then the user is authenticated via JWT
- [ ] AC8: Given a POST request with valid JWT cookie but missing `X-CSRF-Token` header, when the request reaches the CSRF middleware, then 403 Forbidden is returned
- [ ] AC9: Given a POST request with valid JWT cookie but mismatched `X-CSRF-Token` header, when the request reaches the CSRF middleware, then 403 Forbidden is returned
- [ ] AC10: Given a logged-out user's JWT, when they make a request, then the token is rejected (blacklist check in `OnTokenValidated`)

### 4.2 PSRP-004 (Magic Link Auth System) — Add Requirements

**Add to Requirements checklist:**
- [ ] Implement `POST /api/auth/profile` endpoint — accepts name, timezone, locale, terms acceptance; creates UserConsent records; returns 200
- [ ] Implement `POST /api/auth/refresh` endpoint — validates current JWT, generates new JWT with fresh 24h expiry, generates new CSRF token, sets both cookies; returns `{ refreshed: true }`
- [ ] Implement `POST /api/auth/logout` endpoint — hashes current JWT, stores in Dragonfly blacklist with TTL = remaining expiry, deletes `aura_session` and `aura_csrf` cookies; returns `{ loggedOut: true }`
- [ ] Implement `GET /api/auth/me` endpoint — returns current user info from JWT claims; returns 401 if not authenticated
- [ ] Set `aura_session` cookie on successful verify: httpOnly, Secure (prod), SameSite=Strict, Path=/, expires=JWT expiry
- [ ] Set `aura_csrf` cookie on successful verify: not httpOnly, Secure (prod), SameSite=Strict, Path=/, expires=JWT expiry
- [ ] Generate CSRF token using `RandomNumberGenerator.GetBytes(32)` encoded as base64

**Update existing requirements:**
- Change "Configurar cookie httpOnly" to "Set JWT in `aura_session` cookie (httpOnly, Secure, SameSite=Strict) AND set `aura_csrf` cookie (readable by JS)"
- Update VerifyResponse DTO: remove `jwt`/`token` field from response body (JWT is in cookie, not body)

**Add to Technical Notes:**
- `POST /api/auth/verify` response: `{ "user": { "id", "email", "name", "isFirstLogin" } }` — JWT is in Set-Cookie header, NOT in body
- `POST /api/auth/profile` — requires JWT auth, validates UserConsent not already accepted
- `POST /api/auth/refresh` — requires valid JWT, generates new one with same claims but fresh expiry
- `POST /api/auth/logout` — requires valid JWT, blacklists it in Dragonfly, clears cookies
- Blacklist key: `auth:blacklist:{sha256_hash_of_jwt}`, TTL = `jwt.ValidTo - DateTime.UtcNow`

**Add to Acceptance Criteria:**
- [ ] AC7: Given a verified user, when `GET /api/auth/verify` succeeds, then `aura_session` cookie is set with JWT and `aura_csrf` cookie is set with random token
- [ ] AC8: Given an authenticated user, when they call `POST /api/auth/refresh`, then a new JWT is issued with fresh 24h expiry and new CSRF token, both set in cookies
- [ ] AC9: Given an authenticated user, when they call `POST /api/auth/logout`, then their JWT is blacklisted in Dragonfly, cookies are cleared, and subsequent requests with the old JWT return 401
- [ ] AC10: Given an authenticated user with incomplete profile, when they call `POST /api/auth/profile` with valid data, then UserConsent records are created and profile is saved

### 4.3 PSRP-005 (Angular Scaffolding and Auth UI) — Add Requirements

**Add to Requirements checklist:**
- [ ] Implement `CsrfInterceptor` that reads `aura_csrf` cookie and adds `X-CSRF-Token` header to state-changing requests (POST, PUT, PATCH, DELETE)
- [ ] Register `csrfInterceptor` in `app.config.ts` HTTP interceptor chain
- [ ] Implement silent refresh timer: decode JWT expiry, call `POST /api/auth/refresh` at 50% of remaining time, restart timer with new expiry
- [ ] Implement logout functionality: call `POST /api/auth/logout`, clear local auth state, redirect to `/login`
- [ ] Do NOT store JWT in localStorage/sessionStorage — auth is cookie-based
- [ ] Implement `GET /api/auth/me` call on app init to check if user is already authenticated (cookie present)
- [ ] Handle 401 responses: redirect to `/login`, clear local state

**Update existing requirements:**
- Change `AuthInterceptor` description: "No longer attaches JWT to headers (cookie-based). Only handles 401 responses and adds CSRF token via CsrfInterceptor"
- Update verify page: "Reads redirect result (no JWT in response body), checks `isFirstLogin` to redirect to profile setup or dashboard"

**Add to Technical Notes:**
- Cookie handling: Browser automatically sends `aura_session` and `aura_csrf` cookies with every request to same origin
- CSRF: Angular interceptor reads `aura_csrf` cookie via `document.cookie` and adds `X-CSRF-Token` header
- Refresh timer: `setTimeout` based on JWT `exp` claim decoded from the token (need `/api/auth/me` endpoint to get JWT for decoding, or decode from a non-httpOnly copy)
- Alternative for refresh: Use `/api/auth/me` endpoint which returns user info including `jwtExpiry` timestamp

**Add to Acceptance Criteria:**
- [ ] AC7: Given the user is authenticated, when they make a POST request, then the `X-CSRF-Token` header is automatically added by the CsrfInterceptor
- [ ] AC8: Given the user's JWT is at 50% of its lifetime, when the refresh timer fires, then `POST /api/auth/refresh` is called and a new JWT is set in cookies
- [ ] AC9: Given the user clicks logout, when the action completes, then cookies are cleared, local state is reset, and the user is redirected to `/login`
- [ ] AC10: Given the user navigates to the app with a valid `aura_session` cookie, when the app initializes, then `GET /api/auth/me` confirms authentication and the user sees the dashboard

### 4.4 PSRP-006 (Event CRUD) — Minor Updates

**Add to Requirements:**
- [ ] All event endpoints require `EventOwner` authorization policy
- [ ] State-changing event endpoints (POST, PUT, DELETE) require CSRF token validation (handled by middleware, no controller code needed)

### 4.5 PSRP-009 (Control Dashboard) — Minor Updates

**Add to Requirements:**
- [ ] Dashboard stats endpoint requires `EventOwner` authorization policy
- [ ] CSV export endpoint requires `EventOwner` authorization policy

### 4.6 PSRP-017 (Accomplice Management) — Add Requirements

**Add to Technical Notes:**
- Accomplice JWT claims: `{ sub: accompliceId, email, role: "accomplice", eventId, permissions: ["send_messages", "view_rsvps"], iat, exp }`
- Accomplice login flow: `GET /api/accomplices/verify?token={token}` → sets `aura_session` cookie with accomplice JWT + `aura_csrf` cookie
- Accomplice panel uses same cookie-based auth as host dashboard
- Live message send endpoint requires both JWT auth (AccompliceScoped policy) AND CSRF token

---

## 5. Implementation Order

1. **PSRP-003** — Auth middleware infrastructure (JWT config, CSRF middleware, pipeline order)
2. **PSRP-004** — Auth endpoints (verify sets cookies, profile, refresh, logout, blacklist)
3. **PSRP-005** — Frontend auth (CSRF interceptor, refresh timer, cookie handling)
4. **PSRP-006+** — All subsequent tickets inherit the auth mechanism

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| XSS token theft | JWT in httpOnly cookie (not accessible by JavaScript) |
| CSRF attacks | Double-submit cookie pattern (aura_csrf cookie + X-CSRF-Token header) |
| Token replay after logout | Dragonfly blacklist with TTL matching JWT expiry |
| Timing attacks on CSRF | `CryptographicOperations.FixedTimeEquals` for comparison |
| Token expiration | 24h JWT expiry + silent refresh at 50% |
| Session fixation | New JWT + new CSRF token on every login/refresh |
| Cross-site cookie leakage | SameSite=Strict on both cookies |
| Insecure transmission | Secure=true in production (HTTPS required) |
