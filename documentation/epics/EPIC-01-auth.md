# EPIC-01 — Authentication & User Access
> Priority: 2 | Status: ✅ Stories + tasks defined (revised 2026-06-18)

---

## Revision Notes (2026-06-18, updated 2026-06-19)

This epic was restructured after an audit of the existing codebase revealed that a significant portion of the identity infrastructure was already implemented in prior work (EF Core + OpenIddict setup, `IdentityAppDbContext`, `OpenIddictClientSeeder`, `IAuditWriter`, `Program.cs`, `ExceptionMiddleware`). Tasks have been merged and scoped to reflect what actually remains to be built, not what existed at the time of the original spec.

**Key decisions confirmed in revision:**
- Access token lifetime: **1 hour** (corrects the 30-minute value currently in `DependencyInjection.cs`).
- Refresh token lifetime: **30 days** (replaces the 8-hour sliding window from the original spec — aligns with the existing implementation).
- `ApplicationUser.Role` property: **removed**. Roles are stored via the standard ASP.NET Core Identity `AspNetUserRoles` junction table and emitted as claims by `UserManager`. No redundant `Role` column on `AspNetUsers`.
- `ApplicationUserConfiguration`: still required, but only to configure `PreferredLanguage` (no `Role` column to configure).
- `OpenIddictClientSeeder`: already fully implemented and idempotent — not a remaining task.
- `IAuditWriter`: already fully implemented — not a remaining task.

**2026-06-19 addition — `client_id` claim and `ApplicationUser.ClientId`:**
- `ApplicationUser.ClientId` (nullable `Guid?`) and `ClientIdClaimHandler` are defined in **EPIC-00 TASK-00.1**, not this epic. They depend on `ApplicationUser` existing (TASK-01.A) and must be implemented immediately after it.
- TASK-01.B (`TokenController`) does **not** need to emit `client_id` manually — `ClientIdClaimHandler` handles it automatically via the OpenIddict pipeline, exactly as `LocaleClaimHandler` handles `locale`.
- TASK-01.6.1 (`ApiControllerBase`) must include `CurrentClientId` as a claim helper (see updated task below).

---

## Overview

Covers all authentication and session flows for SupportHub: account activation via invitation, login, logout, session persistence, and password recovery. Delivers the full auth experience for the **client-portal** frontend and the shared **identity** backend. Backoffice frontend auth (login, activation, logout, session, route guards) is deferred to EPIC-05.

---

## Architecture Note

**Architectural decisions resolved for this epic:**

- **Role model**: roles (`Admin`, `Client`) are stored in ASP.NET Core Identity's standard `AspNetUserRoles` junction table and assigned via `UserManager.AddToRoleAsync`. They are included in the OpenIddict access token as a `role` claim via claim destination configuration in the token controller. The `api` service reads the `role` claim from the JWT — no DB lookup at request time. Role assignment happens at invitation acceptance (US-01.1); the EPIC-05 admin flow determines the role at invite creation.
- **Tenant identity claim (`client_id`)**: `ApplicationUser.ClientId` (nullable `Guid?`) is added to `ApplicationUser` in **EPIC-00 TASK-00.1** and emitted as a `client_id` claim by `ClientIdClaimHandler` (also EPIC-00 TASK-00.1). Admin users have `ClientId: null` and receive no `client_id` claim. Client users always carry it. This claim is the sole mechanism by which `api` endpoints identify which tenant a request belongs to — no DB lookup at request time.
- **Session duration**: OpenIddict issues short-lived access tokens (1 hour) and a long-lived refresh token (30 days). The SPA silently refreshes the access token; if the refresh token is not present or has expired the user is redirected to login.
- **Account lockout**: ASP.NET Core Identity's built-in lockout (`LockoutEnabled = true`, `MaxFailedAccessAttempts = 5`, `DefaultLockoutTimeSpan = 15 minutes`) is used. Unlock is time-based — no admin action required. After lockout, OpenIddict will not issue tokens for locked accounts.
- **Session invalidation on password reset**: `IOpenIddictTokenManager.RevokeBySubjectAsync(userId)` is called after a successful password reset. This revokes all outstanding refresh tokens for the user, forcing re-authentication on all devices.
- **Invitation & reset tokens**: ASP.NET Core Identity's `UserManager.GeneratePasswordResetTokenAsync` / `GenerateEmailConfirmationTokenAsync` are used for invitation and reset link tokens respectively. Two named token providers configure different expiry times: `"Invitation"` provider (72 hours) and default provider (1 hour for password reset). These tokens are URL-encoded and embedded in the link sent via SES (EPIC-04 owns SES; this epic owns the token lifecycle and the endpoints that consume them). For EPIC-01, email sending is a stub/interface — actual SES wiring is in EPIC-04.
- **Password policy**: minimum 8 characters, at least one uppercase letter, one digit, one non-alphanumeric character — already enforced in `AddInfrastructure` via `PasswordOptions`.
- **Frontend auth state**: the SPA stores the access token in memory (React context) and the refresh token in an `HttpOnly` cookie set by the `identity` server's `TokenController`. `localStorage` is not used for tokens (OWASP). EPIC-01 delivers this auth context for `client-portal` only; the `backoffice` app reuses the same pattern in EPIC-05.
- **Backoffice frontend scope boundary**: the `identity` backend is fully shared and serves both SPAs. The OpenIddict client seed already registers both `client-portal` and `backoffice` client IDs. No backoffice frontend tasks are implemented here — those are defined in EPIC-05.

**Cross-cutting dependencies:**
- EPIC-01 `identity` tasks are prerequisites for every other epic's backend work (JWT validation depends on a running identity server).
- EPIC-05 backoffice frontend tasks depend on TASK-01.B (token endpoint), TASK-01.D (logout endpoint), and TASK-01.E (password reset endpoints) all being complete.
- US-01.1 (account activation) depends on EPIC-05 creating the invited user record — a stub endpoint is sufficient for EPIC-01.
- Email sending (invitation and reset links) is stubbed in EPIC-01 via an `IEmailService` interface; EPIC-04 provides the real SES implementation.
- **Audit log**: The following events must write audit records via `IAuditWriter` (already implemented): successful login (`LOGIN`), failed login (`LOGIN_FAILED`), account activation (`ACCOUNT_ACTIVATION`), password reset completed (`PASSWORD_RESET_COMPLETED`), password reset failed (`PASSWORD_RESET_FAILED`). Written from the `identity` controllers.
- **i18n**: `ApplicationUser.PreferredLanguage` (default `"es"`) is included in the OpenIddict access token as a `locale` claim (ISO 639-1) by `LocaleClaimHandler`. Both SPAs initialise i18n immediately after login from this claim. A dedicated `PATCH /internal/users/{id}/language` endpoint (TASK-01.F) + `PATCH /api/me/language` on `api` (TASK-01.7.2) allow the user to switch language at runtime.

**What is already implemented (do not re-implement):**
- `IdentityAppDbContext` — correct schema, `UseOpenIddict()`, Fluent config loading via `ApplyConfigurationsFromAssembly`.
- `AddInfrastructure` — Identity registered with password policy + lockout settings, OpenIddict server with auth code + PKCE flow, all endpoint passthroughs, development certificates, `IAuditWriter`, `IClock`, health checks.
- `OpenIddictClientSeeder` — idempotent, seeds both SPA clients with correct scopes, PKCE requirement, redirect/logout URIs from config.
- `IAuditWriter` / `AuditWriter` / `AuditLog` — complete and registered.
- `Program.cs` — middleware order, health checks, auto-migration in Development.
- `ExceptionMiddleware`, `CorrelationIdMiddleware`.
- `InitialCreate` migration — `identity` schema, all Identity tables, OpenIddict tables, `AuditLogs` table with `jsonb` columns.

---

## User Stories

---

### US-01.1 — Activate account via invitation link
> *As an invited user, I want to set my password using the link I received by email so that I can activate my account and access SupportHub for the first time.*

**Acceptance Criteria:**
- [ ] The invitation email contains a unique, single-use link that expires after 72 hours.
- [ ] Clicking the link opens an "Activate your account" page pre-filled with the user's email (read-only).
- [ ] The page requires the user to enter and confirm a new password.
- [ ] The password field shows a visible strength indicator.
- [ ] Submitting a valid password activates the account and redirects the user to the login page with a confirmation message.
- [ ] Submitting with mismatched passwords shows an inline validation error before submission.
- [ ] Accessing an expired or already-used link shows a clear error message and a contact-support prompt.

**Story Points:** 3

#### TASK-01.A — Complete ApplicationUser, PreferredLanguage config, LocaleClaimHandler, and migration (identity)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** none (replaces original TASK-01.1.1 + TASK-01.1.2 + TASK-01.1.3)

**Context:** `ApplicationUser` already exists but is empty. `IdentityAppDbContext`, `AddInfrastructure`, and `OpenIddictClientSeeder` are already fully implemented. The `InitialCreate` migration exists and has the base schema. This task completes the remaining gaps in the entity layer before any controller work begins.

**What to build:**

1. **`ApplicationUser`** (`Identity.Infrastructure/Identity/ApplicationUser.cs`): add `PreferredLanguage` property — `string`, not nullable, default value `"es"`. Do **not** add a `Role` property — roles are managed via `AspNetUserRoles` (standard Identity approach).

2. **`ApplicationUserConfiguration`** (`Identity.Infrastructure/Persistence/Configurations/ApplicationUserConfiguration.cs`): implement `IEntityTypeConfiguration<ApplicationUser>`. Configure `PreferredLanguage` as `varchar(10)`, not null, default value `"es"` via Fluent API. No Data Annotations on the entity.

3. **`LocaleClaimHandler`** (`Identity.Infrastructure/OpenIddict/LocaleClaimHandler.cs`): implement `IOpenIddictServerHandler<ProcessSignInContext>`. Reads `ApplicationUser.PreferredLanguage` from the principal's subject claim via `UserManager`, defaults to `"es"` if null or empty, and emits a `locale` claim to the access token only (`Destinations.AccessToken`). Register via `.AddServer(opts => opts.AddEventHandler<ProcessSignInContext>(LocaleClaimHandler.Descriptor))` in `DependencyInjection.cs`.

4. **Token provider configuration**: In `AddInfrastructure`, add a named token provider `"Invitation"` via `AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>("Invitation")` with `TokenLifespan = TimeSpan.FromHours(72)`. The default `DataProtectionTokenProvider` handles password reset with `TokenLifespan = TimeSpan.FromHours(1)`. Configure both via `services.Configure<DataProtectionTokenProviderOptions>(...)`.

5. **Correct access token lifetime**: Change `SetAccessTokenLifetime(TimeSpan.FromMinutes(30))` to `SetAccessTokenLifetime(TimeSpan.FromHours(1))` in `DependencyInjection.cs`. Leave refresh token lifetime at 30 days.

6. **EF Core migration**: Generate a new migration (`AddPreferredLanguage`) to add the `PreferredLanguage` column to `AspNetUsers` in the `identity` schema.

**Constraints:**
- `ApplicationUser` uses `Guid` keys: `IdentityUser<Guid>` — already correct, do not change.
- `PreferredLanguage` is `string`, not nullable, default `"es"` — enforced at both application and DB level.
- No `JWT_SECRET` or raw signing keys — already using `AddDevelopmentSigningCertificate()` / `AddDevelopmentEncryptionCertificate()`.
- All DI registration goes in `AddInfrastructure`.
- Use Context7 to look up current OpenIddict `IOpenIddictServerHandler` API before implementing `LocaleClaimHandler`.

**Definition of Done:**
- [ ] `dotnet build` succeeds.
- [ ] `ApplicationUser` at `Identity.Infrastructure/Identity/ApplicationUser.cs` has `PreferredLanguage` property (no `Role` property).
- [ ] `ApplicationUserConfiguration` exists and configures `PreferredLanguage` as `varchar(10) NOT NULL DEFAULT 'es'`.
- [ ] `LocaleClaimHandler` exists at `Identity.Infrastructure/OpenIddict/LocaleClaimHandler.cs` and is registered in `AddInfrastructure`.
- [ ] `DependencyInjection.cs` has access token lifetime set to 1 hour.
- [ ] New migration `AddPreferredLanguage` exists in `Identity.Infrastructure/Migrations/` and adds the `PreferredLanguage` column.
- [ ] `dotnet ef database update` succeeds against the dev database.

---

#### TASK-01.C — Account activation endpoint (identity)
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-01.A

**What to build:**
Implement `POST /api/account/activate` in `Identity.API`. The endpoint accepts an invitation token and a new password, validates the token via `UserManager.ResetPasswordAsync` using the `"Invitation"` named token provider, marks the user email as confirmed (`EmailConfirmed = true`), and writes the audit record. The use case logic lives in a service class `AccountActivationService` in `Identity.Infrastructure/Endpoints/AccountActivation/`.

**Constraints:**
- Request DTO: `{ token: string, email: string, password: string, confirmPassword: string }`.
- Validate `password == confirmPassword` before calling `UserManager` — return `422` with the standard error envelope on mismatch.
- Use the `"Invitation"` named token provider (configured in TASK-01.A) when calling `UserManager.ResetPasswordAsync`.
- On success, return `200 OK` with `{ message: "Account activated successfully" }`. Call `IAuditWriter.WriteAsync` with operation `ACCOUNT_ACTIVATION`, the user's ID as `entityId`, the user's ID as `userId`, and the client IP address.
- On expired/invalid token, return `400` with `{ code: "INVALID_TOKEN", message: "...", details: [] }`.
- Controller inherits from `ApiControllerBase`. `[AllowAnonymous]` — this endpoint is public.
- Never log the token value.
- `IEmailService` interface and stub are **not** required by this task — activation token generation happens in EPIC-05 (invitation creation). This endpoint only *consumes* the token.

**Definition of Done:**
- [ ] `POST /api/account/activate` with a valid token and matching passwords returns `200 OK`.
- [ ] `POST /api/account/activate` with an expired/invalid token returns `400` with `code: "INVALID_TOKEN"`.
- [ ] `POST /api/account/activate` with mismatched passwords returns `422`.
- [ ] A successful activation produces an `ACCOUNT_ACTIVATION` row in `identity.audit_logs`.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.1.5 — Account activation page (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.C

**What to build:**
Create the `/activate` route in the `client-portal` React app. The page reads `token` and `email` from URL query parameters. It renders a form with a read-only email field, a password field with a strength indicator (use shadcn/ui `Input` + a custom `PasswordStrength` component), and a confirm-password field. On submit, calls `POST /api/account/activate` on the identity server. On success, navigates to `/login` with a success toast. On error (expired/invalid token), shows an inline error with a "Contact support" prompt.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button` — no raw HTML form elements.
- `PasswordStrength` is a reusable component (will be reused in TASK-01.5.3 and backoffice in EPIC-05).
- Client-side validation: passwords must match before the API call is made.
- The `email` query parameter is displayed read-only and is not editable by the user.
- Error states for expired/invalid token and mismatched passwords are visually distinct.
- Route is `[AllowAnonymous]` — accessible without authentication.
- All user-visible strings must use `t()` translation keys — no hardcoded text.

**Definition of Done:**
- [ ] `/activate?token=X&email=Y` route renders the activation form.
- [ ] Submitting valid matching passwords calls `POST /api/account/activate` and navigates to `/login` on success.
- [ ] Mismatched passwords shows inline error without making an API call.
- [ ] An API error (expired token) renders the error message and contact-support prompt.
- [ ] `npm run build` succeeds.

---

### US-01.2 — Log in with email and password
> *As a registered user, I want to log in with my email and password so that I can access SupportHub.*

**Acceptance Criteria:**
- [ ] The login page is the default entry point for unauthenticated users trying to access any protected route.
- [ ] The form accepts email and password; both fields are required.
- [ ] A "Show/hide password" toggle is available on the password field.
- [ ] On successful login, the user is redirected to their home screen (client: ticket list; admin: admin dashboard).
- [ ] If the user was redirected to login from a protected page, they are sent back to that page after successful login.
- [ ] On invalid credentials, the form shows a single non-specific error ("Incorrect email or password") without revealing which field is wrong.
- [ ] The login button is disabled and shows a loading indicator while the request is in progress.
- [ ] After 5 consecutive failed attempts, the user sees a message indicating the account is temporarily locked and is prompted to reset their password.

**Story Points:** 3

#### TASK-01.B — OpenIddict authorization and token endpoint controllers (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.A

**What to build:**
Implement the two OpenIddict passthrough controllers: `AuthorizationController` (handles `GET /connect/authorize`) and `TokenController` (handles `POST /connect/token`). These are always implemented together — they are two sides of the same PKCE code exchange flow.

`AuthorizationController`: validates the PKCE challenge request via `HttpContext.GetOpenIddictServerRequest()`, checks if the user is already authenticated via cookie, builds the `ClaimsPrincipal` with `sub`, `email`, and `role` claims (roles fetched via `UserManager.GetRolesAsync`), and calls `SignInAsync`. For unauthenticated requests, redirects to the login page (challenge).

`TokenController`: handles `POST /connect/token`. For `authorization_code` grant: exchanges the code + PKCE verifier for access + refresh tokens. Validates the user is not locked out. On successful authentication via `UserManager.CheckPasswordAsync`, increments or resets lockout counters accordingly. Builds the `OpenIddictPrincipal` with all claims destined for the access token. Sets the refresh token in an `HttpOnly` cookie via `Response.Cookies.Append` (OpenIddict does not do this automatically — the SPA silent refresh flow depends on this cookie). Calls `IAuditWriter.WriteAsync` with `LOGIN` on success or `LOGIN_FAILED` on failure.

**Note on claim handlers**: the `locale` claim is emitted automatically by `LocaleClaimHandler` (TASK-01.A) and the `client_id` claim is emitted automatically by `ClientIdClaimHandler` (EPIC-00 TASK-00.1). The token controller does not need to add either claim manually. It only needs to ensure the `OpenIddictPrincipal` is built from the `ApplicationUser` (which carries both `PreferredLanguage` and `ClientId`).

**Constraints:**
- Use Context7 to look up the current OpenIddict passthrough controller pattern before coding.
- `UserManager.CheckPasswordAsync` + `AccessFailedAsync` / `ResetAccessFailedCountAsync` must be called during the token exchange step — do not bypass Identity's lockout counters.
- On locked account, return the OpenIddict error `OpenIddictConstants.Errors.AccessDenied` with a descriptive description.
- `role` claims must be set with destination `AccessToken` so they appear in the JWT the `api` service reads.
- On successful token issuance, call `IAuditWriter.WriteAsync` with operation `LOGIN`, the user's ID as both `entityId` and `userId`, and the client IP from `HttpContext.Connection.RemoteIpAddress`.
- On failed authentication, call `IAuditWriter.WriteAsync` with operation `LOGIN_FAILED`, the attempted email as `entityId`, `userId: null`, and the client IP.
- Both controllers in `Identity.API/Controllers/`. `[AllowAnonymous]`.
- The `HttpOnly` cookie holding the refresh token must be `Secure`, `SameSite=Strict`, and use the path `/connect/token` to limit its scope.

**Definition of Done:**
- [ ] `GET /connect/authorize` with a valid PKCE request redirects to the login page (or issues a code for an already-authenticated session).
- [ ] `POST /connect/token` with a valid authorization code + verifier returns `access_token`, `refresh_token` (in body and `HttpOnly` cookie), `expires_in`.
- [ ] `POST /connect/token` for a locked account returns an error response.
- [ ] A successful login produces a `LOGIN` row in `identity.audit_logs`.
- [ ] A failed login produces a `LOGIN_FAILED` row with `UserId = null` and `EntityId = <attempted email>`.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.2.2+01.3.1 — Login page, PKCE flow, AuthProvider + silent token refresh (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.B
**Merged from:** TASK-01.2.2 (Login page + PKCE flow + AuthProvider) + TASK-01.3.1 (Silent token refresh + session expiry handling)

**What to build:**

**Login page + AuthProvider (TASK-01.2.2):** Create the `/login` route in the `client-portal` React app. The page renders a login form (email + password fields, show/hide password toggle, submit button with loading state). On submit, initiate the OpenIddict authorization code + PKCE flow: redirect the browser to `identity` `/connect/authorize` with `response_type=code`, `client_id`, `redirect_uri`, `scope`, `code_challenge` (S256), and `code_challenge_method`. After the identity server authenticates and redirects back with a `code`, the SPA calls `POST /connect/token` to exchange it for tokens. Store the access token in React context (memory only); the refresh token arrives via `HttpOnly` cookie set by the identity server's `TokenController`. Implement the `AuthProvider` context component that holds auth state, decodes the access token, and initialises the i18n locale. After receiving the access token, decode it (JWT decode, no verification needed client-side), read the `locale` claim, call `i18n.changeLanguage(locale)`, and set `document.documentElement.lang = locale`. Fall back to `"es"` if absent. Must happen before any protected page renders.

**Silent token refresh + session expiry (TASK-01.3.1):** Extend `AuthProvider` with silent token refresh: on app load, attempt `POST /connect/token` with `grant_type=refresh_token` (the `HttpOnly` cookie is sent automatically). If the refresh succeeds, store the new access token in memory and the user is considered authenticated. If the refresh fails (token expired or revoked), clear auth state and redirect to `/login?reason=session_expired`. Show a toast "Your session has expired, please log in again" when `reason=session_expired` is present on the login page. Configure an Axios interceptor that retries a failed `401` response with a silent refresh before propagating the error.

**Constraints:**
- PKCE code verifier and challenge must be generated in the browser (use `crypto.subtle` or the `pkce-challenge` npm package — no server-side generation).
- No token storage in `localStorage` or `sessionStorage` (OWASP).
- The `redirect_uri` after login must respect the `returnUrl` query parameter.
- On invalid credentials (identity server returns `error=access_denied`), display the i18n key for "Incorrect email or password" — do not disambiguate.
- On locked account, display the locked-account i18n message and a "Reset your password" link.
- The refresh token round-trip must happen before any protected route renders — implement as an async check in `AuthProvider` (blocking render until resolved, showing a loading spinner).
- If the refresh token cookie is absent or expired, redirect immediately — do not show a blank protected screen.
- The `401` Axios interceptor must not create a retry loop — a second `401` after refresh must redirect to login.
- No polling — refresh is triggered on app load and on `401` responses only.
- Use shadcn/ui `Form`, `Input`, `Button`, Sonner toast.
- All user-visible strings must use `t()` translation keys.

**Definition of Done:**
- [ ] `/login` route renders the form with show/hide password toggle.
- [ ] Submitting valid credentials completes the PKCE flow and lands the user on their home screen.
- [ ] Invalid credentials display the non-specific error without page reload.
- [ ] Locked account displays the lockout message with reset-password link.
- [ ] Closing and reopening the browser (with a valid refresh token cookie) keeps the user authenticated without re-entering credentials.
- [ ] After the refresh token window expires, the app redirects to `/login?reason=session_expired` and shows the expiry toast.
- [ ] A `401` from the `api` triggers one silent refresh attempt before redirecting to login.
- [ ] `AuthProvider` i18n wiring: locale claim decoded and applied before first protected render.
- [ ] `npm run build` succeeds.

---

### US-01.3 — Stay logged in across browser sessions
> *As a logged-in user, I want my session to persist when I close and reopen the browser so that I do not have to log in again on every visit.*

**Acceptance Criteria:**
- [ ] After a successful login, returning to the app in a new browser tab or after closing and reopening the browser keeps the user authenticated.
- [ ] The session expires automatically after 30 days of inactivity (refresh token window), after which the user is redirected to the login page.
- [ ] When a session expires mid-navigation, the user sees a clear "Your session has expired, please log in again" message before the login page is shown.
- [ ] Session persistence applies to both client and admin users.

**Story Points:** 2

> **Note:** US-01.3 has no dedicated frontend task — session persistence is fully covered by the silent token refresh implemented in TASK-01.2.2+01.3.1 (under US-01.2).

---

### US-01.4 — Log out
> *As a logged-in user, I want to log out so that my session is closed and no one else can access my account from the same browser.*

**Acceptance Criteria:**
- [ ] A "Log out" option is accessible from the main navigation on every authenticated page.
- [ ] Clicking "Log out" immediately redirects the user to the login page.
- [ ] After logging out, pressing the browser back button does not restore access to protected pages.
- [ ] A logged-out user attempting to access a protected URL is redirected to the login page.

**Story Points:** 1

#### TASK-01.D — Logout endpoint (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.B

**What to build:**
Implement `LogoutController` in `Identity.API/Controllers/` that handles `GET /connect/logout` as an OpenIddict passthrough: validate the `id_token_hint`, revoke all refresh tokens for the subject via `IOpenIddictTokenManager.RevokeBySubjectAsync`, sign out of the cookie session, and redirect to the registered `post_logout_redirect_uri`.

**Constraints:**
- `LogoutController` enables the `EnableEndSessionEndpointPassthrough()` already configured in `AddInfrastructure`.
- `post_logout_redirect_uri` must match a registered URI in the OpenIddict client descriptor — OpenIddict validates this automatically; do not bypass.
- `RevokeBySubjectAsync` must complete before the redirect response — not fire-and-forget.
- `[AllowAnonymous]`.
- Use Context7 to look up the current OpenIddict end-session passthrough pattern.

**Definition of Done:**
- [ ] `GET /connect/logout` with a valid `id_token_hint` revokes the refresh token and redirects to the registered post-logout URI.
- [ ] `GET /connect/logout` with an unregistered `post_logout_redirect_uri` is rejected by OpenIddict.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.4.2+01.6.2 — Logout UI, navigation shell + route guards & role-based access (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.D, TASK-01.2.2+01.3.1
**Merged from:** TASK-01.4.2 (Logout UI + navigation shell) + TASK-01.6.2 (Route guards + role-based navigation shell)

**What to build:**

**Logout UI + navigation shell (TASK-01.4.2):** Add a "Log out" button to the main navigation shell component of the `client-portal`. Clicking it initiates the OIDC end-session flow (`GET /connect/logout?id_token_hint=...&post_logout_redirect_uri=/login`) and clears the in-memory access token from `AuthProvider` before the redirect. The navigation shell is built here and extended with role-based rendering below.

**Route guards + role-based navigation shell (TASK-01.6.2):** Implement route protection using React Router v7 `loader` functions. Create a `requireAuth` loader utility in `src/lib/auth-guards.ts` that reads auth state from `AuthProvider` and throws `redirect("/login?returnUrl=...")` if unauthenticated. Apply it to all protected routes. Render the navigation shell so that admin-only elements are not mounted in the DOM for `Client` role users (not just hidden with CSS).

**Constraints:**
- Logout button uses shadcn/ui `Button` variant `ghost`, placed in the navigation shell component.
- In-memory auth state is cleared synchronously before the browser redirect.
- The `post_logout_redirect_uri` value must match the registered URI from the OpenIddict client seed.
- Use React Router v7 `loader` pattern — not `useEffect` or component-level checks (loaders run before render, preventing flash of protected content).
- The `returnUrl` parameter survives the login flow and redirects the user back after authentication.
- Admin-only UI elements must not be mounted in the DOM for `Client` role users — not just hidden with CSS.
- Route guard logic lives in `src/lib/auth-guards.ts` — not duplicated per route.

**Definition of Done:**
- [ ] Clicking "Log out" clears the session and lands on `/login`.
- [ ] Navigating back after logout redirects to `/login` (protected route loader detects missing token).
- [ ] Navigating to a protected route while unauthenticated redirects to `/login?returnUrl=<original-path>`.
- [ ] After login, the user is sent to the `returnUrl` page.
- [ ] No flash of protected content before redirect.
- [ ] Admin-only nav elements are absent from the DOM for `Client` role users.
- [ ] `npm run build` succeeds.

---

### US-01.5 — Recover account via password reset
> *As a user who has forgotten their password, I want to request and use a password reset link so that I can regain access to my account.*

**Acceptance Criteria:**
- [ ] A "Forgot your password?" link is visible on the login page and leads to a dedicated reset-request page.
- [ ] The reset-request page accepts the user's email address.
- [ ] After submitting, the user always sees the same confirmation message regardless of whether the email exists (to prevent account enumeration).
- [ ] If the email exists in the system, a reset link is sent within 2 minutes.
- [ ] The reset link expires after 1 hour and is single-use.
- [ ] Clicking the reset link opens a "Set new password" page requiring the user to enter and confirm a new password.
- [ ] The password field shows a visible strength indicator.
- [ ] Submitting with mismatched passwords shows an inline validation error before submission.
- [ ] Submitting a valid password updates the password, invalidates all existing sessions, and redirects to the login page with a success message.
- [ ] Using an expired or already-used link shows a clear error message with a prompt to request a new reset link.

**Story Points:** 5

#### TASK-01.E — Password reset endpoints (identity)
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-01.A

**Context:** Both password reset endpoints (`forgot-password` and `reset-password`) are merged into one task because they share the same service class, `IEmailService` dependency, `UserManager` interaction, and token provider configuration. Splitting them creates artificial sequencing with no real benefit.

**What to build:**

**`IEmailService`** (`Identity.Infrastructure/Email/IEmailService.cs`): define the interface with a single method `Task SendPasswordResetAsync(string toEmail, string resetLink, string locale, CancellationToken ct)`. Create a no-op stub implementation `NoOpEmailService` in the same folder. Register as `IEmailService → NoOpEmailService` (scoped) in `AddInfrastructure`. EPIC-04 replaces this with the real SES implementation.

**`PasswordResetService`** (`Identity.Infrastructure/Endpoints/PasswordReset/PasswordResetService.cs`): encapsulates both the request and confirm logic, injecting `UserManager<ApplicationUser>`, `IEmailService`, and `IOpenIddictTokenManager`.

**`POST /api/account/forgot-password`**: accepts `{ email: string }`, looks up the user via `UserManager.FindByEmailAsync`, if found generates a reset token via `UserManager.GeneratePasswordResetTokenAsync` (default 1-hour provider) and dispatches via `IEmailService`. Always returns `200 OK` with `{ message: "If that email is registered, a reset link has been sent." }`. Empty email field → `422`.

**`POST /api/account/reset-password`**: accepts `{ token: string, email: string, password: string, confirmPassword: string }`. Validates `password == confirmPassword` first (→ `422`). Calls `UserManager.ResetPasswordAsync`. On success: calls `IOpenIddictTokenManager.RevokeBySubjectAsync(userId)`, then `IAuditWriter.WriteAsync` with operation `PASSWORD_RESET_COMPLETED`. Returns `200 OK` with `{ message: "Password reset successfully. Please log in." }`. On invalid/expired token: calls `IAuditWriter.WriteAsync` with operation `PASSWORD_RESET_FAILED`, `userId: null`, and returns `400` with `code: "INVALID_TOKEN"`.

Both endpoints in the same `AccountController` as TASK-01.C, or a separate `AccountPasswordController` — your call, as long as it is consistent.

**Constraints:**
- `[AllowAnonymous]` on both endpoints.
- `RevokeBySubjectAsync` must complete after the password update — not before, not fire-and-forget.
- Never log the token value or email address.
- The reset link URL embedded by `IEmailService` must be built from an environment variable (`PORTAL_BASE_URL`) — no hardcoded URLs.
- All user-visible messages follow the standard error envelope `{ code, message, details }`.

**Definition of Done:**
- [ ] `POST /api/account/forgot-password` with any email (registered or not) returns `200 OK`.
- [ ] `POST /api/account/forgot-password` with an empty email returns `422`.
- [ ] `POST /api/account/reset-password` with a valid token and matching passwords returns `200 OK`.
- [ ] `POST /api/account/reset-password` with an expired token returns `400` with `code: "INVALID_TOKEN"`.
- [ ] `POST /api/account/reset-password` with mismatched passwords returns `422`.
- [ ] Active refresh tokens for the user are revoked after a successful reset (verifiable via `OpenIddictTokens` table row status).
- [ ] A successful reset produces a `PASSWORD_RESET_COMPLETED` row in `identity.audit_logs`.
- [ ] An invalid/expired token produces a `PASSWORD_RESET_FAILED` row with `UserId = null`.
- [ ] `IEmailService` interface exists at `Identity.Infrastructure/Email/IEmailService.cs`.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.5.3 — Password reset pages (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.E

**What to build:**
Create two routes in the `client-portal`: `/forgot-password` (email entry form, always shows the same success message after submit regardless of outcome) and `/reset-password` (reads `token` + `email` from query params, renders password + confirm-password fields with the reusable `PasswordStrength` component from TASK-01.1.5). Add a "Forgot your password?" link on the `/login` page pointing to `/forgot-password`. On successful reset, navigate to `/login?reason=password_reset` and show a success toast.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button`.
- Reuse the `PasswordStrength` component from TASK-01.1.5.
- `/forgot-password`: after response (success or error) always show the same confirmation message — never reveal whether the email exists.
- `/reset-password`: mismatched passwords caught client-side before the API call.
- Both routes are `[AllowAnonymous]`.
- All user-visible strings use `t()` translation keys.

**Definition of Done:**
- [ ] `/forgot-password` submits and always shows the confirmation message.
- [ ] `/reset-password?token=X&email=Y` with valid matching passwords navigates to `/login` with the success toast.
- [ ] `/reset-password` with mismatched passwords shows inline error without calling the API.
- [ ] An expired-token API error shows the error message and a "Request a new link" prompt.
- [ ] `npm run build` succeeds.

---

### US-01.6 — Protected routes enforce authentication and role boundaries
> *As a user, I want the application to direct me to the right area based on who I am so that I can only access pages I am allowed to see.*

**Acceptance Criteria:**
- [ ] Any attempt to navigate to a protected URL while unauthenticated redirects to the login page.
- [ ] After successful login, the user is sent to the page they originally tried to access.
- [ ] A client user who navigates directly to an admin URL is redirected to the client home screen.
- [ ] An admin user who navigates to a client URL can view the client area normally.
- [ ] No admin-only UI elements (navigation links, buttons, pages) are rendered for client users.
- [ ] No protected data or UI is briefly visible before any redirect occurs.

**Story Points:** 3

#### TASK-01.6.1 — JWT Bearer validation in api service (api)
**Layer:** Infrastructure
**Repo:** api
**Depends on:** TASK-01.A (identity server must be running with correct JWKS)

**What to build:**
Configure JWT Bearer authentication in `Api.Infrastructure/DependencyInjection.cs` (`AddInfrastructure`). The `api` service validates tokens by fetching the JWKS from the `identity` server's discovery endpoint (`IDENTITY_AUTHORITY`). Register a global authorization policy requiring authentication by default; individual endpoints use `[Authorize(Roles = "Admin")]` or `[Authorize(Roles = "Client")]` as needed. Add `ApiControllerBase` in `Api.API/Common/` with `CurrentUserId`, `CurrentUserRole`, `CurrentUserLocale`, and `CurrentClientId` claim helpers. Also create `ErrorCodes.cs` and `ErrorMessages.cs` static classes in `Api.Application/Common/Errors/`.

**Constraints:**
- `Authority = config["IDENTITY_AUTHORITY"]`, `Audience = "supporthub-api"`, `RequireHttpsMetadata = false` in Development.
- No shared secret — JWKS discovery only.
- Default authorization policy: all endpoints require authentication unless explicitly `[AllowAnonymous]`.
- `ApiControllerBase` provides the following protected properties:
  - `CurrentUserId` — `Guid`, from `sub` claim.
  - `CurrentUserRole` — `string`, from `role` claim.
  - `CurrentUserLocale` — `string`, from `locale` claim, fallback `"es"`.
  - `CurrentClientId` — `Guid`, from `client_id` claim. Throws `UnauthorizedAccessException` if the claim is absent. This property must only be read from `[Authorize(Roles = "Client")]` endpoints — Admin JWTs do not carry `client_id` (see EPIC-00 architecture note). Controllers on Admin-scoped routes must never call `CurrentClientId`.
- `IDENTITY_AUTHORITY` must be documented in `api/.env.example`.
- `ErrorCodes.cs`: `public static class ErrorCodes` with `public const string` fields — e.g., `AuthUnauthorized = "E0101"`, `UserNotFound = "E0201"`, `UnexpectedError = "E0999"` — follow the domain ranges in `api-conventions.md` §3a.
- `ErrorMessages.cs`: `public static class ErrorMessages` with a `static readonly IReadOnlyDictionary<string, string> All` mapping each code to a default English message string. The backend is culture-agnostic — no `IStringLocalizer`. Frontend translates using the error code as the i18n key.
- `ExceptionMiddleware` must use `ErrorCodes.UnexpectedError` — not a hardcoded string.

**Definition of Done:**
- [ ] Any protected endpoint returns `401` when called without a valid JWT.
- [ ] A protected endpoint with a valid JWT issued by the identity server returns the expected response.
- [ ] `GET /health` returns `200` without a JWT.
- [ ] `ApiControllerBase` exposes `CurrentUserId`, `CurrentUserRole`, `CurrentUserLocale`, and `CurrentClientId` as protected properties.
- [ ] `ErrorCodes.cs` exists at `Api.Application/Common/Errors/ErrorCodes.cs`.
- [ ] `ErrorMessages.cs` exists at `Api.Application/Common/Errors/ErrorMessages.cs`.
- [ ] `ExceptionMiddleware` references `ErrorCodes.UnexpectedError` — no hardcoded error code string.
- [ ] `dotnet build` succeeds for the `api` solution.

---

> **Note:** TASK-01.6.2 (route guards + role-based navigation shell) has been merged into **TASK-01.4.2+01.6.2** under US-01.4.

---

### US-01.7 — User can change their interface language
> *As a logged-in user, I want to switch the application language so that I can use SupportHub in my preferred language.*

**Acceptance Criteria:**
- [ ] A `LanguageSwitcher` control is visible in the main navigation bar on every authenticated page.
- [ ] The switcher shows the currently active language and allows switching between Spanish and English.
- [ ] Switching language immediately re-renders all visible text in the new language (optimistic update — no page reload required).
- [ ] The chosen language persists after closing and reopening the browser (stored server-side in `ApplicationUser.PreferredLanguage`).
- [ ] If the server call to save the preference fails, the UI reverts to the previous language and shows a non-blocking toast error.
- [ ] The locale claim in subsequent token refreshes reflects the updated language.

**Story Points:** 3

#### TASK-01.F — Language update endpoint + InternalApiKeyMiddleware (identity)
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-01.A

**Context:** Merges the original TASK-01.7.1 and adds the `InternalApiKeyMiddleware` that was missing from the original task list. The middleware must exist before the endpoint can be secured.

**What to build:**

**`InternalApiKeyMiddleware`** (`Identity.API/Middleware/InternalApiKeyMiddleware.cs`): validates the `X-Internal-Api-Key` header against `INTERNAL_API_KEY` environment variable on all requests to `/internal/**`. Returns `401` if absent or mismatched. Registered in `Program.cs` before routing, scoped to the `/internal` path prefix.

**`InternalUsersController`** (`Identity.API/Controllers/InternalUsersController.cs`): `PATCH /internal/users/{userId}/language`. Accepts `{ "locale": "es" }` (or `"en"`), validates it is one of `["es", "en"]` (→ `400` on invalid), looks up user via `UserManager<ApplicationUser>.FindByIdAsync` (→ `404` if not found), updates `ApplicationUser.PreferredLanguage` via `UserManager.UpdateAsync`. Returns `204 No Content` on success.

**Constraints:**
- Route: `PATCH /internal/users/{userId}/language`.
- Use `UserManager<ApplicationUser>` — do not write to `DbContext` directly.
- Not exposed via Swagger.
- `INTERNAL_API_KEY` comes from environment variable — no hardcoded fallback value.
- Returns `204 No Content` on success; `400` for invalid locale; `404` for unknown user.

**Definition of Done:**
- [ ] `PATCH /internal/users/{userId}/language` with `{ "locale": "en" }` and correct API key returns `204` and persists the change.
- [ ] `PATCH /internal/users/{userId}/language` with an unknown locale returns `400`.
- [ ] `PATCH /internal/users/{userId}/language` with an unknown userId returns `404`.
- [ ] `PATCH /internal/users/{userId}/language` without the `X-Internal-Api-Key` header returns `401`.
- [ ] A subsequent token issuance for that user includes `"locale": "en"` in the access token.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.7.2 — Language preference endpoint (api)
**Layer:** API + Infrastructure
**Repo:** api
**Depends on:** TASK-01.F, TASK-01.6.1

**What to build:**
Implement `PATCH /api/me/language` in a new `MeController` in `Api.API/Controllers/Me/`. The endpoint reads the authenticated user's `sub` claim, validates the requested locale, then calls `IIdentityInternalClient.UpdateUserLanguageAsync(userId, locale)` to persist the change to the `identity` service. Define `IIdentityInternalClient` in `Api.Application/Common/Interfaces/` and implement `IdentityInternalClient` in `Api.Infrastructure/Identity/` — it sends `PATCH /internal/users/{userId}/language` with `X-Internal-Api-Key` header to the `identity` base URL (`IDENTITY_AUTHORITY`).

**Constraints:**
- Route: `PATCH /api/me/language`. Requires `[Authorize]` — any authenticated role.
- Request body: `{ "locale": "es" }` — validate `["es", "en"]`; return `400` with `ErrorCodes` constant on invalid value.
- `IIdentityInternalClient` interface in `Api.Application/Common/Interfaces/IIdentityInternalClient.cs`: single method `Task UpdateUserLanguageAsync(Guid userId, string locale, CancellationToken ct)`.
- `IdentityInternalClient` in `Api.Infrastructure/Identity/IdentityInternalClient.cs`: typed `HttpClient` registered in `AddInfrastructure`, base URL from `IDENTITY_AUTHORITY`, sends `X-Internal-Api-Key` header from `INTERNAL_API_KEY` env var.
- On `identity` returning a non-success status, map to `502 Bad Gateway` with the standard error envelope using an `ErrorCodes` constant.
- Returns `204 No Content` on success.

**Definition of Done:**
- [ ] `PATCH /api/me/language` with `{ "locale": "en" }` and a valid JWT returns `204`.
- [ ] `PATCH /api/me/language` with an invalid locale returns `400` with the standard error envelope.
- [ ] `PATCH /api/me/language` without a valid JWT returns `401`.
- [ ] `IIdentityInternalClient` exists at `Api.Application/Common/Interfaces/IIdentityInternalClient.cs`.
- [ ] `IdentityInternalClient` exists at `Api.Infrastructure/Identity/IdentityInternalClient.cs`.
- [ ] `MeController` exists at `Api.API/Controllers/Me/MeController.cs`.
- [ ] `dotnet build` succeeds for the `api` solution.

---

#### TASK-01.7.3 — LanguageSwitcher component (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.7.2, TASK-01.4.2

**What to build:**
Create a `LanguageSwitcher` component in `src/components/LanguageSwitcher.tsx` and add it to the navigation shell (from TASK-01.4.2). The component reads the current language from `i18next`, renders a control to switch between `es` and `en`, and on change: (1) optimistically calls `i18n.changeLanguage(newLocale)` + sets `document.documentElement.lang`, (2) calls `PATCH /api/me/language` in the background. If the API call fails, revert the locale and show a non-blocking toast error.

**Constraints:**
- Use shadcn/ui `DropdownMenu` or `Select`.
- Optimistic update: language changes immediately without waiting for the API response.
- On API failure: revert `i18n.changeLanguage(previousLocale)` + `document.documentElement.lang = previousLocale`, show a shadcn/ui Sonner toast.
- The component reads current locale from `i18next.language` — not from `AuthProvider` state.
- All labels within the switcher must use i18n translation keys.
- The component is reusable — will be placed in the `backoffice` nav shell in EPIC-05.

**Definition of Done:**
- [ ] `LanguageSwitcher` renders in the navigation shell with the currently active language selected.
- [ ] Switching language re-renders all visible text immediately without a page reload.
- [ ] If `PATCH /api/me/language` returns an error, the UI reverts and shows a toast.
- [ ] `npm run build` succeeds.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-01.1 | Activate account via invitation link | 3 |
| US-01.2 | Log in with email and password | 3 |
| US-01.3 | Stay logged in across browser sessions | 2 |
| US-01.4 | Log out | 1 |
| US-01.5 | Recover account via password reset | 5 |
| US-01.6 | Protected routes enforce authentication and role boundaries | 3 |
| US-01.7 | User can change their interface language | 3 |
| **Total** | | **20** |

### Revised task breakdown

| Task | Title | Story | Repo | Depends on | Original tasks |
|---|---|---|---|---|---|
| **TASK-01.A** | Complete entity, config, LocaleClaimHandler, token providers, migration | US-01.1 | identity | — | 01.1.1 + 01.1.2 + 01.1.3 (partial) |
| **TASK-01.B** | OpenIddict authorization + token controllers (PKCE flow, audit, refresh cookie) | US-01.2 | identity | TASK-01.A | 01.2.1 |
| **TASK-01.C** | Account activation endpoint | US-01.1 | identity | TASK-01.A | 01.1.4 |
| **TASK-01.D** | Logout endpoint | US-01.4 | identity | TASK-01.B | 01.4.1 |
| **TASK-01.E** | Password reset endpoints (forgot + confirm) + IEmailService stub | US-01.5 | identity | TASK-01.A | 01.5.1 + 01.5.2 |
| **TASK-01.F** | Language update endpoint + InternalApiKeyMiddleware | US-01.7 | identity | TASK-01.A | 01.7.1 (+ missing middleware) |
| TASK-01.1.5 | Account activation page | US-01.1 | client-portal | TASK-01.C | 01.1.5 |
| **TASK-01.2.2+01.3.1** | Login page, PKCE flow, AuthProvider + silent token refresh | US-01.2 / US-01.3 | client-portal | TASK-01.B | 01.2.2 + 01.3.1 |
| **TASK-01.4.2+01.6.2** | Logout UI, navigation shell + route guards & role-based access | US-01.4 / US-01.6 | client-portal | TASK-01.D, TASK-01.2.2+01.3.1 | 01.4.2 + 01.6.2 |
| TASK-01.5.3 | Password reset pages | US-01.5 | client-portal | TASK-01.E | 01.5.3 |
| TASK-01.6.1 | JWT Bearer validation + ErrorCodes/Messages (api) | US-01.6 | api | TASK-01.A | 01.6.1 |
| TASK-01.7.2 | Language preference endpoint + IIdentityInternalClient (api) | US-01.7 | api | TASK-01.F, TASK-01.6.1 | 01.7.2 |
| TASK-01.7.3 | LanguageSwitcher component | US-01.7 | client-portal | TASK-01.7.2, TASK-01.4.2+01.6.2 | 01.7.3 |

**Identity repo: 10 original tasks → 6 tasks (TASK-01.A through TASK-01.F)**
**Frontend tasks: 15 original → 13 tasks (TASK-01.2.2+01.3.1 and TASK-01.4.2+01.6.2 merged)**

---

> **Note for Tech Lead:**
>
> - **Named token providers**: `"Invitation"` provider (72h) is added in TASK-01.A. EPIC-05 (invitation creation) must pass the provider name explicitly when calling `GenerateEmailConfirmationTokenAsync`. The default provider (1h) handles password reset and requires no changes from EPIC-05 callers.
> - **Refresh token HttpOnly cookie**: OpenIddict does not set the refresh token in a cookie automatically. The `TokenController` (TASK-01.B) must do this explicitly via `Response.Cookies.Append`. The same pattern is reused in EPIC-05 for the backoffice `TokenController`.
> - **Role on ApplicationUser**: the original spec had a `Role` string property on `ApplicationUser`. This has been removed in favour of the standard `AspNetUserRoles` junction table. This means `UserManager.GetRolesAsync(user)` is used to fetch roles — one extra DB call during token issuance, which is acceptable given the token issuance frequency.
> - **`IEmailService` stub location**: defined in `Identity.Infrastructure/Email/` so EPIC-04 can provide the SES implementation by replacing the registration in `AddInfrastructure` without touching the call sites.
> - **EPIC-05 handoff**: identity backend is fully shared. EPIC-05 frontend auth tasks depend on TASK-01.B (token), TASK-01.D (logout), and TASK-01.E (password reset) being complete. The `AuthProvider`, PKCE flow, silent refresh, activation page, password reset pages, and `requireRole("Admin")` route guard are all in scope for EPIC-05's first stories.
> - **Access token / refresh token lifetimes confirmed**: 1-hour access token, 30-day refresh token. The 30-day window means a user who visits the app at least once a month will never be forced to log in again. If a stricter security posture is needed in production, the refresh token lifetime can be reduced via configuration without a code change.
> - **`client_id` claim and `ClientIdClaimHandler`**: these are delivered by **EPIC-00 TASK-00.1**, not this epic. TASK-00.1 depends on TASK-01.A (ApplicationUser must exist) and should be executed immediately after it in the same sprint. The `TokenController` (TASK-01.B) does not emit `client_id` — the handler does it automatically. `ApiControllerBase` (TASK-01.6.1) exposes `CurrentClientId` which reads this claim. Never call `CurrentClientId` from Admin-scoped controller actions — Admin JWTs do not carry this claim.
> - **Sprint sequencing**: recommended order within the EPIC-01 sprint is TASK-01.A → TASK-00.1 → TASK-00.2 → TASK-00.3 → TASK-00.4 → TASK-01.B onwards. This ensures `ClientIdClaimHandler` is wired before the token endpoint is fully tested, and seed data is available for end-to-end auth testing.
