# EPIC-01 — Authentication & User Access
> Priority: 2 | Status: ✅ Stories + tasks defined

---

## Overview

Covers all authentication and session flows for SupportHub: account activation via invitation, login, logout, session persistence, and password recovery. Delivers the full auth experience for the **client-portal** frontend and the shared **identity** backend. Backoffice frontend auth (login, activation, logout, session, route guards) is deferred to EPIC-05, where the admin home screen and protected pages it lands on are defined.

---

## Architecture Note

**Architectural decisions resolved for this epic:**

- **Role model**: roles (`Admin`, `Client`) are stored as ASP.NET Core Identity claims on `ApplicationUser` and included in the OpenIddict access token as a `role` claim. The `api` service reads the `role` claim from the JWT — no DB lookup at request time. Role assignment happens at invitation acceptance (US-01.1); the EPIC-05 admin flow determines the role at invite creation.
- **Session duration**: OpenIddict issues short-lived access tokens (1 hour) and a sliding refresh token (8-hour window). The SPA silently refreshes the access token; if the user is inactive for 8 hours the refresh token expires and the user is redirected to login. This satisfies US-01.3 without a custom session abstraction.
- **Account lockout**: ASP.NET Core Identity's built-in lockout (`LockoutEnabled = true`, `MaxFailedAccessAttempts = 5`, `DefaultLockoutTimeSpan = 15 minutes`) is used. Unlock is time-based — no admin action required. After lockout, OpenIddict will not issue tokens for locked accounts (Identity validates the user state before the token endpoint succeeds).
- **Session invalidation on password reset**: `IOpenIddictTokenManager.RevokeBySubjectAsync(userId)` is called after a successful password reset. This revokes all outstanding refresh tokens for the user, forcing re-authentication on all devices.
- **Invitation & reset tokens**: ASP.NET Core Identity's `UserManager.GeneratePasswordResetTokenAsync` / `GenerateEmailConfirmationTokenAsync` are used for invitation and reset link tokens respectively. These tokens are URL-encoded and embedded in the link sent via SES (EPIC-04 owns SES; this epic owns the token lifecycle and the endpoints that consume them). For EPIC-01, email sending is a stub/interface — actual SES wiring is in EPIC-04.
- **Password policy**: minimum 8 characters, at least one uppercase letter, one digit, one non-alphanumeric character — enforced via `PasswordOptions` in Identity configuration.
- **Frontend auth state**: the SPA stores the access token in memory (React context) and the refresh token in an `HttpOnly` cookie set by the `identity` server. `localStorage` is not used for tokens (OWASP). EPIC-01 delivers this auth context for `client-portal` only; the `backoffice` app reuses the same pattern in EPIC-05.
- **Backoffice frontend scope boundary**: the `identity` backend (TASK-01.1.x, TASK-01.2.1, TASK-01.4.1, TASK-01.5.1/2) is fully shared and serves both SPAs. The OpenIddict client seed (TASK-01.1.2) registers both `client-portal` and `backoffice` client IDs so the identity server is ready. However, no backoffice frontend tasks are implemented here — those tasks are defined in EPIC-05, where the admin dashboard (the post-login landing page) is also built.

**Cross-cutting dependencies:**
- EPIC-01 `identity` tasks are prerequisites for every other epic's backend work (JWT validation depends on a running identity server).
- EPIC-05 backoffice frontend tasks depend on TASK-01.2.1 (token endpoint), TASK-01.4.1 (logout endpoint), and TASK-01.5.1/2 (password reset endpoints) all being complete.
- US-01.1 (account activation) depends on EPIC-05 creating the invited user record — a stub endpoint is sufficient for EPIC-01.
- Email sending (invitation and reset links) is stubbed in EPIC-01 via an `IEmailService` interface; EPIC-04 provides the real SES implementation.
- **Audit log (EPIC-11):** The following events in this epic must write audit records via `IAuditWriter` (defined in EPIC-11): successful login (`LOGIN`), failed login (`LOGIN_FAILED`), account activation (`ACCOUNT_ACTIVATION`), password reset (`PASSWORD_RESET`). These are written from the `identity` controllers — no use-case change required in `api`. The `IAuditWriter` infrastructure must be in place (EPIC-11) before the `identity` controller tasks in this epic are implemented.
- **i18n (EPIC-10):** The user's language preference (`PreferredLanguage`) must be included in the OpenIddict access token as a `locale` claim so both SPAs can initialise the i18n context immediately after login without an extra API call. The language field is admin-managed (EPIC-05 / EPIC-10 US-10.4). All frontend strings in this epic must use i18n translation keys — no hardcoded UI text. Email templates for invitation and password reset must exist in both Spanish and English (EPIC-10 US-10.5).

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

#### TASK-01.1.1 — ApplicationUser entity and Identity configuration (identity)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** none

**What to build:**
Define `ApplicationUser : IdentityUser` in `Identity.Infrastructure/Identity/` adding a `Role` property (string, not nullable). Configure ASP.NET Core Identity in `DependencyInjection.cs` with password policy (`PasswordOptions`), lockout settings, and `UserManager<ApplicationUser>` registration. The `IdentityAppDbContext` in `Identity.Infrastructure/Persistence/` must call `UseOpenIddict()` in `OnModelCreating` and extend `IdentityDbContext<ApplicationUser>`.

**Constraints:**
- `ApplicationUser` lives in `Identity.Infrastructure/Identity/` — not in a Domain project (framework type, per backend-guidelines §1).
- `IdentityAppDbContext` must use the `identity` PostgreSQL schema (set via `HasDefaultSchema("identity")` in `OnModelCreating`).
- Password policy minimum: 8 characters, require uppercase, require digit, require non-alphanumeric.
- Lockout: `MaxFailedAccessAttempts = 5`, `DefaultLockoutTimeSpan = 15 minutes`, `LockoutOnFailure = true`.
- No `JWT_SECRET` or raw signing keys — development uses `AddDevelopmentSigningCertificate()` / `AddDevelopmentEncryptionCertificate()`.
- All DI registration goes in `AddInfrastructure` — `Program.cs` calls only `AddInfrastructure`.

**Definition of Done:**
- [ ] `dotnet build` succeeds for the `identity` solution.
- [ ] `ApplicationUser` class exists at `Identity.Infrastructure/Identity/ApplicationUser.cs`.
- [ ] `IdentityAppDbContext` exists at `Identity.Infrastructure/Persistence/IdentityAppDbContext.cs` and calls `UseOpenIddict()`.
- [ ] `AddInfrastructure` in `DependencyInjection.cs` registers Identity and DbContext without errors.

---

#### TASK-01.1.2 — OpenIddict server configuration and SPA client seed (identity)
**Layer:** Infrastructure
**Repo:** identity
**Depends on:** TASK-01.1.1

**What to build:**
Configure the OpenIddict OIDC server in `AddInfrastructure`: authorization code flow with PKCE, development certificates, all required endpoint URIs (`connect/authorize`, `connect/token`, `connect/userinfo`, `connect/logout`), and scopes (`openid`, `profile`, `email`, `roles`, `supporthub-api`). Add a hosted service (`IHostedService`) that seeds the two SPA client registrations (`client-portal` and `backoffice`) at startup if they do not already exist, including redirect URIs, post-logout URIs, and `Requirements.Features.ProofKeyForCodeExchange`.

**Constraints:**
- Use `OpenIddict.AspNetCore` + `OpenIddict.EntityFrameworkCore` NuGet packages.
- Client registration seeding must be idempotent (check existence before creating).
- SPA clients must have `ClientType = ClientTypes.Public` (no client secret for PKCE public clients).
- Access token lifetime: 1 hour. Refresh token lifetime: sliding, 8 hours (`SetRefreshTokenLifetime`, `SetRefreshTokenReuseLeeway`).
- All redirect URIs and allowed origins come from environment variables — no hardcoded localhost URLs in production paths.
- `RequireProofKeyForCodeExchange()` must be set both globally and per client descriptor (belt-and-suspenders per Context7 docs).
- `Permissions.Scopes.Roles` must be included so the `role` claim is available in access tokens.

**Definition of Done:**
- [ ] `dotnet build` succeeds.
- [ ] OpenIddict server is registered in `AddInfrastructure` with authorization code + PKCE flow.
- [ ] Hosted service class exists at `Identity.Infrastructure/Identity/OpenIddictClientSeedService.cs`.
- [ ] Running the app in Development seeds both SPA client registrations without error (verify via `OpenIddictApplications` table row count ≥ 2).

---

#### TASK-01.1.3 — EF Core migration: Identity + OpenIddict schema (identity)
**Layer:** DB
**Repo:** identity
**Depends on:** TASK-01.1.2

**What to build:**
Generate the initial EF Core migration that creates the ASP.NET Core Identity tables and the 4 OpenIddict tables (`OpenIddictApplications`, `OpenIddictAuthorizations`, `OpenIddictScopes`, `OpenIddictTokens`) all within the `identity` schema. Apply auto-migration on startup in `Development` only (guard with `if (app.Environment.IsDevelopment())`).

**Constraints:**
- Migration runs from the `Identity.Infrastructure` project targeting `IdentityAppDbContext`.
- All tables must be in the `identity` PostgreSQL schema.
- Auto-migration guard is `Development`-only — never auto-applied in production containers (per backend-guidelines §7).
- Migration class must not contain any raw SQL — use EF Core Fluent API exclusively.

**Definition of Done:**
- [ ] Migration file exists under `Identity.Infrastructure/Persistence/Migrations/`.
- [ ] `dotnet ef database update` applies successfully against a local PostgreSQL instance.
- [ ] `dotnet build` succeeds after migration generation.

---

#### TASK-01.1.4 — Account activation endpoint (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.1.1

**What to build:**
Implement `POST /api/account/activate` in `Identity.API` that accepts an invitation token and a new password, validates the token via `UserManager.ResetPasswordAsync` (invitation tokens are generated as password reset tokens with a 72-hour expiry), marks the user as confirmed, and assigns the `role` claim. The use case logic lives in a service class in `Identity.Infrastructure` (no Application layer in the identity repo, per backend-guidelines §1).

**Constraints:**
- Request DTO: `{ token: string, email: string, password: string, confirmPassword: string }`.
- Validate `password == confirmPassword` before calling `UserManager` — return `422` with the standard error envelope on mismatch.
- Invitation token expiry is controlled by `DataProtectionTokenProviderOptions.TokenLifespan = TimeSpan.FromHours(72)` — configure this in `AddInfrastructure`.
- On success, return `200 OK` with `{ message: "Account activated successfully" }`. Call `IAuditWriter.WriteAsync` with operation `ACCOUNT_ACTIVATION`, the user's ID, and the client IP address.
- On expired/invalid token, return `400` with `{ code: "INVALID_TOKEN", message: "...", details: [] }`.
- Controller inherits from `ApiControllerBase`. `[AllowAnonymous]` — this endpoint is public.
- Never log the token value.

**Definition of Done:**
- [ ] `POST /api/account/activate` with a valid token and matching passwords returns `200 OK`.
- [ ] `POST /api/account/activate` with an expired token returns `400` with `code: "INVALID_TOKEN"`.
- [ ] `POST /api/account/activate` with mismatched passwords returns `422`.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.1.5 — Account activation page (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.1.4

**What to build:**
Create the `/activate` route in the `client-portal` React app. The page reads `token` and `email` from URL query parameters. It renders a form with a read-only email field, a password field with a strength indicator (use shadcn/ui `Input` + a custom `PasswordStrength` component), and a confirm-password field. On submit, calls `POST /api/account/activate` on the identity server. On success, navigates to `/login` with a success toast. On error (expired/invalid token), shows an inline error with a "Contact support" prompt.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button` — no raw HTML form elements.
- `PasswordStrength` is a reusable component (will be reused in TASK-01.5.3a and TASK-01.5.3b).
- Client-side validation: passwords must match before the API call is made.
- The `email` query parameter is displayed read-only and is not editable by the user.
- Error states for expired/invalid token and mismatched passwords are visually distinct.
- Route is `[AllowAnonymous]` — accessible without authentication.

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

#### TASK-01.2.1 — OpenIddict authorization and token endpoint controllers (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.1.2

**What to build:**
Implement the two OpenIddict passthrough controllers required for the authorization code flow: `AuthorizationController` (handles `GET /connect/authorize` — validates the PKCE challenge, authenticates the user via cookie, issues the authorization code) and `TokenController` (handles `POST /connect/token` — exchanges the code + PKCE verifier for access + refresh tokens, includes `email`, `role`, and `sub` claims in the token). Both controllers use `IOpenIddictServerFeature` (via `HttpContext.GetOpenIddictServerRequest()`) and `SignInAsync` with an `OpenIddictPrincipal`.

**Constraints:**
- These controllers enable the OpenIddict passthrough endpoints — they must call `EnableAuthorizationEndpointPassthrough()` / `EnableTokenEndpointPassthrough()` (already set in TASK-01.1.2; controllers must be compatible).
- `role` claim must be included in the access token principal so the `api` service can read it from the JWT.
- `UserManager.CheckPasswordAsync` + lockout increment (`AccessFailedAsync`) must be called during the authorization step — do not bypass Identity's lockout counters.
- On locked account, return the OpenIddict error `OpenIddictConstants.Errors.AccessDenied` with a descriptive description.
- On successful authentication, call `IAuditWriter.WriteAsync` with operation `LOGIN`, the user's ID, and the client IP address (from `HttpContext.Connection.RemoteIpAddress`).
- On failed authentication (wrong password, user not found, locked), call `IAuditWriter.WriteAsync` with operation `LOGIN_FAILED`, the attempted email as `entityId`, `userId: null`, and the client IP address.
- Controllers are in `Identity.API/Controllers/`.
- `[AllowAnonymous]` — OIDC endpoints are public.

**Definition of Done:**
- [ ] `GET /connect/authorize` with a valid PKCE request redirects to the login page (or returns a code for an already-authenticated session).
- [ ] `POST /connect/token` with a valid authorization code + verifier returns a JSON response containing `access_token`, `refresh_token`, `expires_in`.
- [ ] `POST /connect/token` for a locked account returns an error response.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.2.2 — Login page and OIDC authorization code + PKCE flow (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.2.1

**What to build:**
Create the `/login` route in the `client-portal` React app. The page renders a login form (email + password fields, show/hide password toggle, submit button with loading state). On submit, initiate the OpenIddict authorization code + PKCE flow: redirect the browser to `identity` `/connect/authorize` with `response_type=code`, `client_id`, `redirect_uri`, `scope`, `code_challenge` (S256), and `code_challenge_method`. After the identity server authenticates and redirects back with a `code`, the SPA calls `POST /connect/token` to exchange it for tokens. Store the access token in React context (memory only); the refresh token arrives via `HttpOnly` cookie set by the identity server. Implement the `AuthProvider` context component that holds auth state.

**Constraints:**
- PKCE code verifier and challenge must be generated in the browser (use `crypto.subtle` or the `pkce-challenge` npm package — no server-side generation).
- No token storage in `localStorage` or `sessionStorage` (OWASP).
- The `redirect_uri` after login must respect the `returnUrl` query parameter (so the user lands on the originally-requested page).
- On invalid credentials (identity server returns `error=access_denied`), display "Incorrect email or password" — do not disambiguate.
- On locked account (identity server returns `error=access_denied` with lockout description), display the locked-account message and a "Reset your password" link.
- Use shadcn/ui `Form`, `Input`, `Button` components.
- Login page route is `[AllowAnonymous]`.

**Definition of Done:**
- [ ] `/login` route renders the form.
- [ ] Submitting valid credentials completes the PKCE flow and lands the user on their home screen.
- [ ] Invalid credentials display the non-specific error without page reload.
- [ ] Locked account displays the lockout message with reset-password link.
- [ ] `npm run build` succeeds.

---

### US-01.3 — Stay logged in across browser sessions
> *As a logged-in user, I want my session to persist when I close and reopen the browser so that I do not have to log in again on every visit.*

**Acceptance Criteria:**
- [ ] After a successful login, returning to the app in a new browser tab or after closing and reopening the browser keeps the user authenticated.
- [ ] The session expires automatically after 8 hours of inactivity, after which the user is redirected to the login page.
- [ ] When a session expires mid-navigation, the user sees a clear "Your session has expired, please log in again" message before the login page is shown.
- [ ] Session persistence applies to both client and admin users.

**Story Points:** 2

#### TASK-01.3.1 — Silent token refresh and session expiry handling (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.2.2

**What to build:**
Extend the `AuthProvider` from TASK-01.2.2 with silent token refresh: on app load, attempt `POST /connect/token` with `grant_type=refresh_token` (the `HttpOnly` cookie is sent automatically). If the refresh succeeds, store the new access token in memory and the user is considered authenticated. If the refresh fails (token expired or revoked), clear auth state and redirect to `/login?reason=session_expired`. Show a toast "Your session has expired, please log in again" when `reason=session_expired` is present on the login page. Configure an Axios interceptor that retries a failed `401` response with a silent refresh before propagating the error.

**Constraints:**
- The refresh token round-trip must happen before any protected route renders — implement as an async check in `AuthProvider` (blocking render until resolved, showing a loading spinner).
- If the refresh token cookie is absent or expired, redirect immediately — do not show a blank protected screen.
- The `401` Axios interceptor must not create a retry loop — a second `401` after refresh must redirect to login.
- No polling — refresh is triggered on app load and on `401` responses only.
- Toast component uses shadcn/ui `Sonner` (or equivalent shadcn toast).

**Definition of Done:**
- [ ] Closing and reopening the browser (with a valid refresh token cookie) keeps the user authenticated without re-entering credentials.
- [ ] After the refresh token window expires, the app redirects to `/login?reason=session_expired` and shows the expiry toast.
- [ ] A `401` from the `api` triggers one silent refresh attempt before redirecting to login.
- [ ] `npm run build` succeeds.

---

### US-01.4 — Log out
> *As a logged-in user, I want to log out so that my session is closed and no one else can access my account from the same browser.*

**Acceptance Criteria:**
- [ ] A "Log out" option is accessible from the main navigation on every authenticated page.
- [ ] Clicking "Log out" immediately redirects the user to the login page.
- [ ] After logging out, pressing the browser back button does not restore access to protected pages.
- [ ] A logged-out user attempting to access a protected URL is redirected to the login page.

**Story Points:** 1

#### TASK-01.4.1 — Logout endpoint (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.2.1

**What to build:**
Implement the `LogoutController` in `Identity.API` that handles `GET /connect/logout` as an OpenIddict passthrough: validate the `id_token_hint`, revoke all refresh tokens for the subject via `IOpenIddictTokenManager.RevokeBySubjectAsync`, sign out of the cookie session, and redirect to the registered `post_logout_redirect_uri`.

**Constraints:**
- `LogoutController` enables the `EnableLogoutEndpointPassthrough()` already configured in TASK-01.1.2.
- `post_logout_redirect_uri` must match a registered URI in the OpenIddict client descriptor — reject unregistered URIs.
- Refresh token revocation (`RevokeBySubjectAsync`) must complete before the redirect response — not fire-and-forget.
- `[AllowAnonymous]` — logout endpoint is public.

**Definition of Done:**
- [ ] `GET /connect/logout` with a valid `id_token_hint` revokes the refresh token and redirects to the registered post-logout URI.
- [ ] `GET /connect/logout` with an unregistered `post_logout_redirect_uri` is rejected.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.4.2 — Logout UI and navigation shell (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.4.1, TASK-01.2.2

**What to build:**
Add a "Log out" button to the main navigation shell component of the `client-portal`. Clicking it initiates the OIDC end-session flow (`GET /connect/logout?id_token_hint=...&post_logout_redirect_uri=/login`) and clears the in-memory access token from `AuthProvider` before the redirect. Protected route loaders detect the cleared auth state and redirect to `/login`.

**Constraints:**
- Logout button uses shadcn/ui `Button` variant `ghost`, placed in the navigation shell component.
- In-memory auth state is cleared synchronously before the browser redirect.
- The `post_logout_redirect_uri` value must match the registered URI from TASK-01.1.2.

**Definition of Done:**
- [ ] Clicking "Log out" clears the session and lands on `/login`.
- [ ] Navigating back after logout redirects to `/login` (protected route loader detects missing token).
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

#### TASK-01.5.1 — Password reset request endpoint (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.1.1

**What to build:**
Implement `POST /api/account/forgot-password` in `Identity.API`. The endpoint accepts `{ email: string }`, looks up the user by email via `UserManager.FindByEmailAsync`, and if found generates a reset token via `UserManager.GeneratePasswordResetTokenAsync` and dispatches it via `IEmailService` (stub interface — real SES implementation is EPIC-04). Always returns `200 OK` regardless of whether the user exists (anti-enumeration).

**Constraints:**
- `[AllowAnonymous]`.
- Token expiry for password reset is 1 hour — configure `DataProtectionTokenProviderOptions.TokenLifespan = TimeSpan.FromHours(1)` in `AddInfrastructure` (separate from the 72h invitation expiry — use a named token provider if needed).
- Response is always `200 OK` with `{ message: "If that email is registered, a reset link has been sent." }` — never `404` or `400` based on email existence.
- `IEmailService` is defined in `Identity.Infrastructure` for this epic; EPIC-04 replaces the stub with the real SES implementation.
- Never log the token or the email address.
- Empty email field → `422` with standard error envelope.

**Definition of Done:**
- [ ] `POST /api/account/forgot-password` with any email (registered or not) returns `200 OK` with the confirmation message.
- [ ] `POST /api/account/forgot-password` with empty email returns `422`.
- [ ] `dotnet build` succeeds.

---

#### TASK-01.5.2 — Password reset confirmation endpoint (identity)
**Layer:** API
**Repo:** identity
**Depends on:** TASK-01.5.1

**What to build:**
Implement `POST /api/account/reset-password` in `Identity.API`. Accepts `{ token: string, email: string, password: string, confirmPassword: string }`, validates the token via `UserManager.ResetPasswordAsync`, and on success calls `IOpenIddictTokenManager.RevokeBySubjectAsync(userId)` to invalidate all active sessions. Returns `200 OK` on success, `400` with `INVALID_TOKEN` code on expired/invalid token, `422` on mismatched passwords.

**Constraints:**
- `[AllowAnonymous]`.
- Session revocation (`RevokeBySubjectAsync`) must be called after the password update succeeds — not before.
- Mismatched password check happens before calling `UserManager` — return `422` immediately.
- On success, return `{ message: "Password reset successfully. Please log in." }`. Call `IAuditWriter.WriteAsync` with operation `PASSWORD_RESET`, the user's ID, and the client IP address.
- On invalid/expired token, return the standard error envelope with `code: "INVALID_TOKEN"`.
- Never log the token value.

**Definition of Done:**
- [ ] `POST /api/account/reset-password` with a valid token, matching passwords → `200 OK`.
- [ ] `POST /api/account/reset-password` with an expired token → `400` with `code: "INVALID_TOKEN"`.
- [ ] `POST /api/account/reset-password` with mismatched passwords → `422`.
- [ ] Active refresh tokens for the user are revoked after a successful reset (verify via `OpenIddictTokens` table row status).
- [ ] `dotnet build` succeeds.

---

#### TASK-01.5.3 — Password reset pages (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.5.2

**What to build:**
Create two routes in the `client-portal`: `/forgot-password` (email entry form, always shows the same success message after submit regardless of outcome) and `/reset-password` (reads `token` + `email` from query params, renders password + confirm-password fields with the reusable `PasswordStrength` component from TASK-01.1.5). Add a "Forgot your password?" link on the `/login` page pointing to `/forgot-password`. On successful reset, navigate to `/login?reason=password_reset` and show a success toast.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button`.
- Reuse the `PasswordStrength` component from TASK-01.1.5.
- `/forgot-password`: after response (success or error) always show the same confirmation message — never reveal whether the email exists.
- `/reset-password`: mismatched passwords caught client-side before the API call.
- Both routes are `[AllowAnonymous]`.

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
**Depends on:** TASK-01.1.2

**What to build:**
Configure JWT Bearer authentication in `Api.Infrastructure/DependencyInjection.cs` (`AddInfrastructure`). The `api` service validates tokens by fetching the JWKS from the `identity` server's discovery endpoint (`IDENTITY_AUTHORITY`). Register a global authorization policy requiring authentication by default; individual endpoints use `[Authorize(Roles = "Admin")]` or `[Authorize(Roles = "Client")]` as needed. Add `ApiControllerBase` in `Api.API/Common/` with `CurrentUserId` and `CurrentUserRole` claim helpers.

**Constraints:**
- `Authority = config["IDENTITY_AUTHORITY"]`, `Audience = "supporthub-api"`, `RequireHttpsMetadata = false` in Development.
- No shared secret — JWKS discovery only (per backend-guidelines §9).
- Default authorization policy: all endpoints require authentication unless explicitly `[AllowAnonymous]`.
- `ApiControllerBase` provides `CurrentUserId` (from `sub` claim) and `CurrentUserRole` (from `role` claim) as protected properties.
- `IDENTITY_AUTHORITY` must be documented in `api/.env.example`.

**Definition of Done:**
- [ ] Any protected endpoint returns `401` when called without a valid JWT.
- [ ] A protected endpoint with a valid JWT issued by the identity server returns the expected response.
- [ ] `GET /health` returns `200` without a JWT.
- [ ] `dotnet build` succeeds for the `api` solution.

---

#### TASK-01.6.2 — Route guards and role-based navigation shell (client-portal)
**Layer:** Frontend
**Repo:** client-portal
**Depends on:** TASK-01.2.2

**What to build:**
Implement route protection using React Router v7 `loader` functions in the `client-portal`. Create a `requireAuth` loader utility in `src/lib/auth-guards.ts` that reads auth state from `AuthProvider` and throws `redirect("/login?returnUrl=...")` if unauthenticated. Apply it to all protected routes. Render the navigation shell so that no admin-only elements exist in the DOM for `Client` role users.

**Constraints:**
- Use React Router v7 `loader` pattern — not `useEffect` or component-level checks (loaders run before render, preventing flash of content).
- The `returnUrl` parameter survives the login flow and redirects the user back after authentication (wired in TASK-01.2.2).
- Admin-only UI elements must not be mounted in the DOM for `Client` role users — not just hidden with CSS.
- Route guard logic lives in `src/lib/auth-guards.ts` — not duplicated per route.

**Definition of Done:**
- [ ] Navigating to a protected route while unauthenticated redirects to `/login?returnUrl=<original-path>`.
- [ ] After login, the user is sent to the `returnUrl` page.
- [ ] No flash of protected content before redirect.
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
| **Total** | | **17** |

### Task breakdown

| Task | Title | Story | Repo | Depends on |
|---|---|---|---|---|
| TASK-01.1.1 | ApplicationUser entity and Identity configuration | US-01.1 | identity | — |
| TASK-01.1.2 | OpenIddict server configuration and SPA client seed | US-01.1 | identity | TASK-01.1.1 |
| TASK-01.1.3 | EF Core migration: Identity + OpenIddict schema | US-01.1 | identity | TASK-01.1.2 |
| TASK-01.1.4 | Account activation endpoint | US-01.1 | identity | TASK-01.1.1 |
| TASK-01.1.5 | Account activation page | US-01.1 | client-portal | TASK-01.1.4 |
| TASK-01.2.1 | OpenIddict authorization and token endpoint controllers | US-01.2 | identity | TASK-01.1.2 |
| TASK-01.2.2 | Login page and OIDC PKCE flow | US-01.2 | client-portal | TASK-01.2.1 |
| TASK-01.3.1 | Silent token refresh and session expiry handling | US-01.3 | client-portal | TASK-01.2.2 |
| TASK-01.4.1 | Logout endpoint | US-01.4 | identity | TASK-01.2.1 |
| TASK-01.4.2 | Logout UI and navigation shell | US-01.4 | client-portal | TASK-01.4.1, TASK-01.2.2 |
| TASK-01.5.1 | Password reset request endpoint | US-01.5 | identity | TASK-01.1.1 |
| TASK-01.5.2 | Password reset confirmation endpoint | US-01.5 | identity | TASK-01.5.1 |
| TASK-01.5.3 | Password reset pages | US-01.5 | client-portal | TASK-01.5.2 |
| TASK-01.6.1 | JWT Bearer validation in api service | US-01.6 | api | TASK-01.1.2 |
| TASK-01.6.2 | Route guards and role-based navigation shell | US-01.6 | client-portal | TASK-01.2.2 |

> **Backoffice frontend tasks deferred to EPIC-05:** login page, activation page, logout UI, session handling, password reset pages, and route guards for the `backoffice` repo are all defined in EPIC-05. They depend on TASK-01.2.1, TASK-01.4.1, and TASK-01.5.1/2 from this epic being complete first.

> **i18n prerequisite (EPIC-10):** All frontend tasks in this epic (`client-portal`) must use i18n translation keys for every user-visible string — no hardcoded text. This requires EPIC-10 US-10.1 (i18n setup for `client-portal`) to be complete before or in the same sprint as the first `client-portal` task here. The `locale` claim in the OpenIddict token (see Architecture Note above) must be added by the architect when writing tasks for US-01.2 / TASK-01.2.1 — the token controller must include the user's `PreferredLanguage` as a claim in the access token principal.

---

> **Note for Tech Lead:**
>
> - **Named token providers**: ASP.NET Core Identity uses `DataProtectionTokenProvider` for both email confirmation (invitation) and password reset. To set different expiry times (72h vs 1h), configure two named providers via `AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>("Invitation")` and the default provider for reset. The `GenerateEmailConfirmationTokenAsync` call in EPIC-05 (invitation creation) must specify the named provider.
> - **Refresh token `HttpOnly` cookie**: OpenIddict does not automatically set the refresh token in a cookie — the identity server's `TokenController` must explicitly set it via `Response.Cookies.Append` after issuing tokens. This is a non-trivial customisation; the SPA silent refresh flow (TASK-01.3.1) depends on this working correctly. The same pattern will be applied in the backoffice in EPIC-05.
> - **`IEmailService` stub**: TASK-01.5.1 introduces `IEmailService` in `Identity.Infrastructure`. EPIC-04 will replace the stub with SES. Ensure the interface is defined in a location EPIC-04 can target without architectural violations.
> - **Password policy**: minimum 8 characters, require uppercase, digit, non-alphanumeric — enforced via Identity `PasswordOptions` in TASK-01.1.1 and reflected in the `PasswordStrength` component in TASK-01.1.5.
> - **EPIC-05 handoff**: the `backoffice` OpenIddict client registration is seeded in TASK-01.1.2 (identity server side is ready). EPIC-05 frontend auth tasks must reference TASK-01.2.1, TASK-01.4.1, and TASK-01.5.1/2 as their backend prerequisites. The `AuthProvider`, PKCE flow, silent refresh, logout UI, activation page, password reset pages, and `requireRole("Admin")` route guard are all in scope for EPIC-05's first stories before any admin feature UI is built.
