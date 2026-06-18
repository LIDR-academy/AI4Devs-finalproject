# EPIC-05 — Admin: User & Client Management
> Priority: 8 | Status: ✅ Stories + tasks defined

---

## Overview

Covers the admin panel's user and client management features: creating and managing client user accounts, sending invitation emails, and associating users with their Jira projects. This epic also owns the **backoffice frontend authentication** — the login, activation, logout, session persistence, password reset, and route guard flows for the `backoffice` React app.

---

## Architecture Note

### Decisions resolved from the PO's Note for Architect

---

**1. `Client` entity ownership**

~~The `Client` entity does not exist yet — EPIC-05 creates it.~~ **Superseded by EPIC-00.** The `Client` entity, its EF Core configuration, and its migration are created in **EPIC-00 TASK-00.2**. By the time EPIC-05 is implemented, `Clients` already exists in the database. EPIC-05's task TASK-05.9.1 is **removed** — do not create a duplicate entity or migration. EPIC-05 starts from the existing entity and adds `IClientRepository`, use cases, and the admin controller on top of it.

---

**2. `ApplicationUser` ↔ `Client` association — `ClientUser` bridge entity in `api`**

The `identity` service cannot reference `api` data (cross-schema coupling violation). The link between an `ApplicationUser` (in `identity.AspNetUsers`) and a `Client` (in `public.Clients`) is held in two places:
- **`ApplicationUser.ClientId`** (nullable `Guid?`) in `identity` — added in **EPIC-00 TASK-00.1**. This is the source of the `client_id` JWT claim emitted by `ClientIdClaimHandler`.
- **`ClientUser`** entity in `api` — the admin's view of a portal user with full profile fields.

~~`ClientUser` entity is created by EPIC-05.~~ **Superseded by EPIC-00.** The `ClientUser` entity, its EF Core configuration, and its migration are created in **EPIC-00 TASK-00.2**. EPIC-05's task TASK-05.5.2 is **removed** — do not create a duplicate entity or migration. EPIC-05 adds `IClientUserRepository`, use cases, and the admin controller on top of the existing entity.

`ClientUser` fields (already in schema from EPIC-00): `Id` (Guid), `UserId` (Guid — bare, no FK to identity), `ClientId` (Guid, FK → `Clients`), `Email` (string, max 256), `FirstName` (string, max 100), `LastName` (string, max 100), `Status` (`ClientUserStatus` enum: `PendingActivation | Active | Inactive`), `InvitedAt` (DateTimeOffset), `ActivatedAt` (DateTimeOffset?), `IsDeleted` (bool).

The `ClientUser` serves as the admin's view of a portal user. On invite, a row is created in `api` (`ClientUser`) and a user in `identity` (via internal HTTP call). On activation, `identity` marks the user confirmed; the `api` status update is driven by a separate endpoint (TASK-05.5.3).

This pattern mirrors how `UserEmailPreference` (EPIC-04) links users across services without FK coupling.

---

**3. Invitation endpoint architecture — `api` orchestrates via `IIdentityUserService`**

The invitation flow spans two schemas (create user in `identity`, create `ClientUser` in `api`). The chosen architecture is **option (b)**: an endpoint in the `api` service orchestrates the cross-service work. Specifically:

- `POST /api/admin/users` (in `api`) is the single admin-facing endpoint.
- The `api` use case calls `IIdentityUserService.CreateUserAsync(email, role, preferredLanguage)` — an internal HTTP call to `identity`'s `POST /internal/users` endpoint (authenticated with `INTERNAL_API_KEY`, the same pattern introduced in EPIC-10 TASK-10.3.2).
- The `identity` internal endpoint creates the `ApplicationUser`, generates the invitation token, and dispatches the invitation email via `IEmailService` (real SES from EPIC-04).
- Only after a successful `identity` response does `api` create the `ClientUser` row and commit.
- If `identity` creation fails, `api` returns the error and writes nothing — atomic from the admin's perspective.

The `identity` internal endpoint (`POST /internal/users`) is new to this epic and is defined in TASK-05.5.1.

---

**4. Resend invitation — `UpdateSecurityStampAsync` as invalidation mechanism**

ASP.NET Core Identity's `DataProtectionTokenProvider` does not support explicit revocation of individual tokens. The standard mitigation is `UserManager.UpdateSecurityStampAsync(user)` — this rotates the security stamp, which invalidates all previously issued tokens for that user (invitation and password-reset) immediately. The new invitation token is generated after the stamp update. This limitation is documented in the task; admins should be advised that there is a brief window (token provider cache TTL) where an old link may still technically validate — practically negligible for a 72h link.

---

**5. Email service ownership — invitation email sent from `identity`**

The invitation email (TASK-04.1.1 + TASK-04.1.3) is already fully owned by the `identity` repo: `IEmailService` → `SesIdentityEmailService`. EPIC-05 simply ensures the `POST /internal/users` endpoint calls `IEmailService.SendInvitationEmailAsync` after creating the user. No new email template work is required; EPIC-04 delivered those. The `api` service never calls SES for invitation emails — all email dispatch for invitations goes through `identity`.

---

**6. `Client` soft-delete and referential integrity**

Soft-delete (`IsDeleted = true`) is used for `Client` records, consistent with the backend-guidelines §7 pattern. Hard deletion is never performed at the application layer. The DB-level guard ("cannot delete client with users") is enforced at the application layer first — `IClientRepository.HasActiveUsersAsync(clientId)` — and returns a `ConflictError` before the soft-delete operation if active users exist. `ClientUser` records also use soft-delete (`IsDeleted = true` when deactivated). `IsDeleted` global query filters are applied in EF Core configuration for both entities.

---

**7. Admin dashboard placeholder**

US-05.1 redirects to `/dashboard` after login. EPIC-06 (Metrics, stretch goal) delivers the real dashboard. A placeholder `Dashboard` page is created in this epic under TASK-05.1.6 — a minimal `<h1>Dashboard</h1>` shell with the navigation layout, sufficient to make the post-login redirect land successfully. Without it, the route 404s and the auth flow cannot be verified end-to-end.

---

**Cross-cutting decisions:**

- **Pagination for user list (US-05.4):** The user list is a local PostgreSQL query with filter support and a total-count display requirement ("20 users per page by default" per AC). This qualifies for the **offset/page-based exception** documented in api-conventions.md §5b. Justification: UX requires direct page navigation and total user count display; this is a local DB table (not an external API). Documented deviation from default cursor-based pagination.
- **`PreferredLanguage` on invite (US-05.5):** When creating a new user, the admin selects the user's preferred language (or it defaults to `"es"`). This is stored on `ApplicationUser.PreferredLanguage` in `identity` (EPIC-10) and seeded at invite time via `POST /internal/users`. The `api` invite form includes a language dropdown.
- **`Email` field editability (US-05.7):** Pending users' emails are locked at the identity level — the invitation token is bound to the original email. Changing the email of a Pending user is blocked with a clear error. Active users' email changes update both `ClientUser.Email` (api) and `ApplicationUser.Email` in identity (via `IIdentityUserService.UpdateEmailAsync` internal call).
- **`locale` claim in backoffice JWT:** The backoffice `AuthProvider` reads the `locale` claim from the decoded access token to initialize i18next, exactly as the client-portal does (EPIC-10). No additional identity configuration is required — the token already includes `locale` from TASK-01.1.2 / TASK-10.3.2.

---

## Pre-condition: Backoffice Frontend Auth

**Before any admin feature UI can be built, the backoffice frontend authentication foundation must be in place.** The identity backend is already delivered by EPIC-01 — the `identity` server is running, both SPA client IDs are registered, and all auth endpoints are live. What EPIC-05 must deliver first is the backoffice frontend wiring to that backend.

The following backoffice frontend tasks are prerequisites for every other story in this epic and must be scheduled at the start of the EPIC-05 sprint:

| Concern | Backend dependency (from EPIC-01) |
|---|---|
| Login page + PKCE flow | TASK-01.2.1 (token endpoint) |
| Account activation page | TASK-01.1.4 (activation endpoint) |
| Logout UI + navigation shell | TASK-01.4.1 (logout endpoint) |
| Silent token refresh + session expiry | TASK-01.2.1 (token endpoint) |
| Password reset pages | TASK-01.5.1 + TASK-01.5.2 (reset endpoints) |
| Route guards (`requireRole("Admin")`) | TASK-01.2.1 (role claim in JWT) |

The `PasswordStrength` component, `AuthProvider` pattern, PKCE flow implementation, and auth guard utility (`src/lib/auth-guards.ts`) should mirror the `client-portal` implementations from EPIC-01 exactly — only the `client_id`, `redirect_uri`, and post-login destination (admin dashboard) differ.

---

## User Stories

---

### US-05.1 — Admin can log in and access the backoffice
> *As an admin, I want to log in to the backoffice portal with my email and password so that I can manage users and clients.*

**Acceptance Criteria:**
- [ ] The login page is the default entry point for any unauthenticated user who visits the backoffice.
- [ ] The form accepts email and password; both fields are required.
- [ ] A "Show/hide password" toggle is available on the password field.
- [ ] On successful login, the admin is redirected to the admin dashboard.
- [ ] If the admin was redirected from a protected page, they are sent back to that page after login.
- [ ] On invalid credentials, the form shows a single non-specific error ("Incorrect email or password") without revealing which field is wrong.
- [ ] The login button is disabled and shows a loading indicator while the request is in progress.
- [ ] After 5 consecutive failed attempts, the user sees a message indicating the account is temporarily locked and is prompted to reset their password.
- [ ] A non-admin user who authenticates successfully is refused access and shown a clear "Access denied" message.
- [ ] The backoffice session persists across browser closes and tabs, and expires after 8 hours of inactivity (same behaviour as the client portal).
- [ ] After session expiry, the admin is redirected to the login page with a "Your session has expired" message.
- [ ] A "Log out" option is accessible from every authenticated page; clicking it closes the session and redirects to the login page.
- [ ] After logging out, pressing the browser back button does not restore access to protected pages.

**Story Points:** 5

#### TASK-05.1.1 — `AuthProvider`, PKCE flow, and Axios interceptor (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-01.2.1, TASK-10.2.1

**What to build:**
Mirror TASK-01.2.2 and TASK-01.3.1 from the `client-portal` in the `backoffice` repo. Create `src/lib/auth.ts` and an `AuthProvider` context component in `src/context/AuthContext.tsx` that implements the OpenIddict authorization code + PKCE flow. On app load, attempt a silent token refresh (`grant_type=refresh_token` via the `HttpOnly` cookie). If the refresh succeeds, store the access token in memory and the user is authenticated. If it fails, clear auth state. Configure an Axios instance in `src/lib/api-client.ts` with a `401` interceptor that attempts one silent refresh before redirecting to `/login?reason=session_expired`. The only differences from the `client-portal` implementation are `client_id` (backoffice client ID), `redirect_uri`, and post-login destination (`/dashboard`).

**Constraints:**
- No token storage in `localStorage` or `sessionStorage` — access token in React context (memory) only.
- PKCE code verifier and challenge generated in the browser using `crypto.subtle` or `pkce-challenge` package.
- Refresh token arrives as an `HttpOnly` cookie set by the `identity` server — the SPA never reads it directly.
- The `AuthProvider` must block rendering (show a loading spinner) until the initial refresh attempt resolves.
- The `401` Axios interceptor must not create a retry loop — a second `401` after refresh redirects to login.
- Decode the JWT access token to extract `sub`, `role`, `email`, and `locale` claims for use in the context.
- Read `locale` from the decoded JWT and call `i18n.changeLanguage(locale)` immediately after a successful authentication — wiring the auth and i18n contexts together.
- `client_id` and `redirect_uri` come from environment variables (`VITE_IDENTITY_CLIENT_ID`, `VITE_IDENTITY_REDIRECT_URI`).

**Definition of Done:**
- [ ] `src/context/AuthContext.tsx` and `src/lib/auth.ts` exist in `backoffice`.
- [ ] `src/lib/api-client.ts` exists with the Axios instance and `401` interceptor.
- [ ] Completing the PKCE flow (logging in via the identity server) sets the access token in context and redirects to `/dashboard`.
- [ ] Closing and reopening the browser with a valid refresh token cookie keeps the admin authenticated without re-entering credentials.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05.1.2 — Login page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.1

**What to build:**
Create the `/login` route in the `backoffice` React app. Mirror TASK-01.2.2 from `client-portal` exactly: a form with email + password fields (show/hide toggle), a submit button with loading state, an "Incorrect email or password" error for invalid credentials, and a lockout message with "Reset your password" link for locked accounts. On submit, initiate the PKCE redirect to `identity`. An additional check is required after token exchange: if the decoded JWT `role` claim is not `"Admin"`, clear the token, and show an "Access denied" message rather than redirecting to `/dashboard`.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button` — no raw HTML form elements.
- The role check happens client-side after the PKCE code exchange — read the `role` claim from the decoded access token. On non-Admin role, call `GET /connect/logout` to close the identity session before showing the denial message.
- The "Access denied" message is rendered inline on the login page — not a separate route.
- "Forgot your password?" link points to `/forgot-password`.
- `returnUrl` query parameter is preserved through the PKCE redirect and used for post-login navigation.
- All visible strings use `i18n` translation keys from the `auth` namespace — no hardcoded text.
- Route is `[AllowAnonymous]` — accessible without authentication.

**Definition of Done:**
- [ ] `/login` route renders the login form.
- [ ] Valid admin credentials complete the PKCE flow and land the admin on `/dashboard`.
- [ ] A non-admin user (e.g., a `Client` role JWT) sees "Access denied" and is not granted access.
- [ ] Invalid credentials display the non-specific error.
- [ ] Locked account displays the lockout message with reset-password link.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05.1.3 — Logout UI and navigation shell (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.1, TASK-01.4.1

**What to build:**
Create the `backoffice` navigation shell component (`src/components/layout/AdminShell.tsx`) that wraps all authenticated admin pages. The shell renders a sidebar or top navigation with a "Log out" button (shadcn/ui `Button` variant `ghost`). Clicking it initiates the OIDC end-session flow (`GET /connect/logout?id_token_hint=...&post_logout_redirect_uri=/login`) and clears the in-memory access token from `AuthProvider` before the redirect. All authenticated routes render inside `AdminShell`.

**Constraints:**
- Navigation shell uses shadcn/ui layout primitives — no raw HTML for navigation structure.
- In-memory auth state must be cleared synchronously before the browser redirect.
- The `post_logout_redirect_uri` must match the registered URI from TASK-01.1.2 (backoffice post-logout URI).
- The shell is only rendered for authenticated routes — the login, activation, and password reset pages render without it.

**Definition of Done:**
- [ ] `src/components/layout/AdminShell.tsx` exists with navigation and logout button.
- [ ] Clicking "Log out" clears the session and redirects to `/login`.
- [ ] Navigating back after logout redirects to `/login` (route guard detects missing token).
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05.1.4 — Route guards and role enforcement (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.1

**What to build:**
Create `src/lib/auth-guards.ts` in the `backoffice` with two loader utilities: `requireAuth` (throws `redirect("/login?returnUrl=...")` if no access token in context) and `requireAdmin` (throws `redirect("/login")` with an access-denied flag if the `role` claim is not `"Admin"`). Apply `requireAdmin` to all protected admin routes in the React Router v7 route definition. Mirror the pattern from TASK-01.6.2 in `client-portal`.

**Constraints:**
- Use React Router v7 `loader` pattern — not `useEffect` or component-level checks (loaders run before render, preventing flash of protected content).
- `requireAdmin` calls `requireAuth` first — no code duplication.
- The `returnUrl` parameter survives the login flow and is consumed by the login page to redirect back.
- Route guard logic is defined once in `src/lib/auth-guards.ts` — not repeated per route.

**Definition of Done:**
- [ ] `src/lib/auth-guards.ts` exists with `requireAuth` and `requireAdmin` utilities.
- [ ] Navigating to any protected route while unauthenticated redirects to `/login?returnUrl=<original-path>`.
- [ ] After login, the admin lands on the `returnUrl` page.
- [ ] No flash of protected content before redirect.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05.1.5 — Silent token refresh and session expiry (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.1

**What to build:**
This task wires the session expiry notification into the `backoffice` login page. When the app redirects to `/login?reason=session_expired` (triggered by the `AuthProvider` when the refresh token is expired or revoked — implemented in TASK-05.1.1), the login page reads the `reason` query parameter and displays a shadcn/ui `Sonner` toast: "Your session has expired, please log in again." Mirror the behaviour of TASK-01.3.1 from `client-portal`. No new auth logic is needed — the redirect and refresh are already handled by `AuthProvider` (TASK-05.1.1); this task only adds the toast display on the login page.

**Constraints:**
- The toast is triggered only when `reason=session_expired` is present in the query string — not on every login page visit.
- Use shadcn/ui `Sonner` (or equivalent shadcn toast component already used in the backoffice).
- The toast message uses an `auth` namespace i18n key — no hardcoded string.

**Definition of Done:**
- [ ] When the refresh token expires, the app redirects to `/login?reason=session_expired`.
- [ ] The login page shows the "Your session has expired" toast for `reason=session_expired`.
- [ ] The toast does not appear on a normal `/login` visit.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

#### TASK-05.1.6 — Admin dashboard placeholder page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.1.3, TASK-05.1.4

**What to build:**
Create a minimal `/dashboard` route inside `AdminShell` that serves as the post-login landing page. The page renders a heading "Dashboard" and placeholder text indicating that the metrics dashboard is coming in a future sprint. This is a skeleton only — no data fetching, no charts. The route must be guarded by `requireAdmin` and render inside `AdminShell`.

**Constraints:**
- Use shadcn/ui `Card` or `PageHeader` primitives — no raw HTML headings.
- Placeholder text uses `admin` namespace i18n keys.
- The route path is `/dashboard` and it is the `post_login_redirect_uri` used by `AuthProvider`.

**Definition of Done:**
- [ ] `GET /dashboard` (authenticated admin) renders the dashboard placeholder inside `AdminShell`.
- [ ] `GET /dashboard` (unauthenticated) redirects to `/login?returnUrl=/dashboard`.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.2 — Admin can activate their account via invitation link
> *As a newly invited admin, I want to set my password using the invitation link I received by email so that I can activate my account and access the backoffice for the first time.*

**Acceptance Criteria:**
- [ ] Clicking the invitation link opens an "Activate your account" page in the backoffice, pre-filled with the user's email (read-only).
- [ ] The page requires the user to enter and confirm a new password.
- [ ] The password field shows a visible strength indicator.
- [ ] Submitting a valid password activates the account and redirects to the backoffice login page with a confirmation message.
- [ ] Submitting with mismatched passwords shows an inline validation error before submission.
- [ ] Accessing an expired or already-used link shows a clear error message and a contact-support prompt.

**Story Points:** 2

#### TASK-05.2.1 — Account activation page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-01.1.4, TASK-05.1.1

**What to build:**
Create the `/activate` route in the `backoffice` React app. Mirror TASK-01.1.5 from `client-portal` exactly. The page reads `token` and `email` from URL query parameters, renders a read-only email field, a password field with a reusable `PasswordStrength` component (`src/components/auth/PasswordStrength.tsx`), and a confirm-password field. On submit, calls `POST /api/account/activate` on the `identity` server. On success, navigates to `/login?reason=activated` and shows a toast confirmation. On API error (expired/invalid token), shows an inline error with a "Contact support" prompt.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button` — no raw HTML form elements.
- `PasswordStrength` is a reusable component in `src/components/auth/PasswordStrength.tsx` — it will also be used on the password reset page (TASK-05.3.1).
- Client-side validation: passwords must match before the API call is made — return an inline error without calling the API.
- The `email` query parameter is displayed read-only and is not editable.
- Route is `[AllowAnonymous]` — no route guard applied.
- All strings use `auth` namespace i18n keys.

**Definition of Done:**
- [ ] `/activate?token=X&email=Y` renders the activation form with the email pre-filled as read-only.
- [ ] Submitting valid matching passwords calls `POST /api/account/activate` on the identity server and navigates to `/login` on success.
- [ ] Mismatched passwords shows inline error without making an API call.
- [ ] An API error (expired token) renders the error message and contact-support prompt.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.3 — Admin can reset their password from the backoffice login page
> *As an admin who has forgotten their password, I want to request and use a password reset link so that I can regain access to the backoffice.*

**Acceptance Criteria:**
- [ ] A "Forgot your password?" link is visible on the backoffice login page.
- [ ] The reset-request page accepts the user's email and always shows the same confirmation message regardless of whether the email exists.
- [ ] If the email is registered, a reset link is sent within 2 minutes.
- [ ] The reset link expires after 1 hour and is single-use.
- [ ] Clicking the link opens a "Set new password" page requiring the user to enter and confirm a new password, with a visible strength indicator.
- [ ] Submitting with mismatched passwords shows an inline validation error before submission.
- [ ] Submitting a valid password updates the password, invalidates all existing sessions, and redirects to the backoffice login page with a success message.
- [ ] Using an expired or already-used link shows a clear error message with a prompt to request a new reset link.

**Story Points:** 2

#### TASK-05.3.1 — Password reset pages (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-01.5.2, TASK-05.1.2

**What to build:**
Create two routes in the `backoffice` app — `/forgot-password` and `/reset-password` — mirroring TASK-01.5.3 from `client-portal` exactly. `/forgot-password` renders an email entry form; after any response (success or error), always shows the same confirmation message (anti-enumeration). `/reset-password` reads `token` + `email` from query params and renders password + confirm-password fields using the reusable `PasswordStrength` component from TASK-05.2.1. On successful reset, navigates to `/login?reason=password_reset` and shows a success toast. The "Forgot your password?" link already added to the `/login` page (TASK-05.1.2) points to `/forgot-password`.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Button`.
- Reuse `PasswordStrength` from `src/components/auth/PasswordStrength.tsx` (created in TASK-05.2.1).
- `/forgot-password`: always display the same confirmation after submission — never reveal whether the email exists.
- `/reset-password`: mismatched passwords must be caught client-side before the API call is made.
- Both routes are `[AllowAnonymous]` — no route guard applied.
- On API error (expired token), show the error message with a "Request a new link" prompt pointing to `/forgot-password`.
- All strings use `auth` namespace i18n keys.

**Definition of Done:**
- [ ] `/forgot-password` submits to `POST /api/account/forgot-password` (identity server) and always shows the confirmation message.
- [ ] `/reset-password?token=X&email=Y` with valid matching passwords navigates to `/login?reason=password_reset` with a success toast.
- [ ] Mismatched passwords shows inline error without calling the API.
- [ ] An expired-token API error shows the error message and a "Request a new link" prompt.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.4 — Admin can view the list of client users
> *As an admin, I want to see a list of all client users in the system so that I can monitor who has access to the portal.*

**Acceptance Criteria:**
- [ ] The user list page is accessible from the main admin navigation.
- [ ] The list shows each user's full name, email address, associated client, status (Active / Inactive / Pending activation), and registration date.
- [ ] The list supports pagination (20 users per page by default).
- [ ] The list can be filtered by status and by client.
- [ ] The list can be searched by name or email (partial match, case-insensitive).
- [ ] Each row has a "View / Edit" action that navigates to the user detail screen.
- [ ] The page is accessible only to authenticated admin users.

**Story Points:** 3

#### TASK-05.4.1 — `ListClientUsersUseCase` — paginated, filtered user list (`api`)
**Layer:** Application
**Repo:** api
**Depends on:** EPIC-00 TASK-00.2 (ClientUser table already exists), TASK-05.5.2 (IClientUserRepository must be implemented)

**What to build:**
Create `ListClientUsersUseCase` in `Api.Application/UseCases/ClientUsers/` that accepts `ListClientUsersQuery(int page, int pageSize, string? search, Guid? clientId, ClientUserStatus? status)`. The use case calls `IClientUserRepository.ListPagedAsync` and returns `Result<PagedOffsetResult<ClientUserDto>>`. `ClientUserDto` includes: `Id`, `FirstName`, `LastName`, `Email`, `ClientId`, `ClientName`, `Status`, `InvitedAt`.

**Constraints:**
- Pagination strategy: **offset/page-based** (`PagedOffsetResult<T>`) — justified because the UX requires total-count display and direct page navigation (per Architecture Note and api-conventions.md §5b deviation).
- `pageSize` allowed values: `10`, `20`, `50`; default `20`. Validation returns `422` for out-of-range values.
- `search` is a case-insensitive partial match against `FirstName + " " + LastName` or `Email`.
- The use case must not expose `IsDeleted = true` records (global query filter in EF Core handles this).
- `ClientUserDto` is a `record` in `Application/UseCases/ClientUsers/`.
- Use case is `internal`, injected via `IListClientUsersUseCase` interface.

**Definition of Done:**
- [ ] `ListClientUsersUseCase` and `IListClientUsersUseCase` exist in `Api.Application/UseCases/ClientUsers/`.
- [ ] `ClientUserDto` record exists with all required fields.
- [ ] `dotnet build` succeeds for `Api.Application`.

---

#### TASK-05.4.2 — `ClientUsersController` — list endpoint (`api`)
**Layer:** API
**Repo:** api
**Depends on:** TASK-05.4.1

**What to build:**
Create `Api.API/Controllers/Admin/ClientUsersController.cs` with a single `GET /api/admin/users` endpoint that accepts query parameters `page`, `pageSize`, `search`, `clientId`, `status` and calls `IListClientUsersUseCase`. Returns `200 OK` with `PagedOffsetResult<ClientUserDto>`.

**Constraints:**
- Controller inherits from `ApiControllerBase`.
- Endpoint requires `[Authorize(Roles = "Admin")]` — non-admin JWT returns `403`.
- Route: `[Route("api/admin/users")]` (not using the default `[controller]` template to avoid pluralisation issues).
- Query parameters are bound via `[FromQuery]` — not from request body.
- `Result<T>` is mapped to HTTP via `result.ToActionResult(this)`.

**Definition of Done:**
- [ ] `GET /api/admin/users` with a valid Admin JWT returns `200 OK` with a `PagedOffsetResult` envelope.
- [ ] `GET /api/admin/users` with a `Client` role JWT returns `403`.
- [ ] `GET /api/admin/users` without a JWT returns `401`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.4.3 — User list page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.4.2, TASK-05.1.4

**What to build:**
Create the `/users` route inside `AdminShell` that renders the client user list. Use TanStack Query `useQuery` to fetch from `GET /api/admin/users` with the current `page`, `pageSize`, `search`, `clientId`, and `status` query parameters. Render a shadcn/ui `Table` with columns: Full Name, Email, Client, Status (shadcn/ui `Badge` with colour coding), Invited At, and an "Edit" link per row. Include a search input (debounced, 300ms), a "Filter by client" `Select`, a "Filter by status" `Select`, and shadcn/ui `Pagination` controls below the table.

**Constraints:**
- Use shadcn/ui `Table`, `Badge`, `Select`, `Input`, `Pagination` — no raw HTML table elements.
- Filters and search are reflected in URL query parameters (React Router v7 `useSearchParams`) — page refreshes preserve the filter state.
- The search input is debounced (300ms) before triggering the query — do not fire on every keystroke.
- Status badge colours: `Active` → green, `Inactive` → grey, `PendingActivation` → amber.
- "Edit" per row navigates to `/users/{id}`.
- Route is guarded by `requireAdmin`.
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] `/users` renders the table with data from the API.
- [ ] Typing in the search box updates the results (debounced).
- [ ] Filtering by client and status narrows the list correctly.
- [ ] Pagination controls navigate between pages.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.5 — Admin can invite a new client user
> *As an admin, I want to invite a new user to the portal by entering their details and sending them an invitation email so that they can activate their account and start using SupportHub.*

**Acceptance Criteria:**
- [ ] An "Invite user" button on the user list opens an invitation form.
- [ ] The form requires: first name, last name, email address, and associated client (selected from a dropdown of existing clients).
- [ ] The email field validates format before submission.
- [ ] Submitting with a duplicate email shows an inline error: "An account with this email already exists."
- [ ] On successful submission, the user record is created with status "Pending activation" and an invitation email is sent to the provided address.
- [ ] The invitation link in the email expires after 72 hours.
- [ ] A success confirmation is shown and the new user appears in the list.
- [ ] If the invitation email fails to send, the admin sees an error message; the user record is not created (atomic operation).

**Story Points:** 5

#### TASK-05.5.1 — `POST /internal/users` endpoint in `identity` (invitation user creation)
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-01.1.1, TASK-04.1.3

**What to build:**
Add a `POST /internal/users` endpoint to `InternalUsersController` in `Identity.API/Controllers/Internal/` (the same controller introduced in TASK-10.3.2 for the language update). The action accepts `{ email: string, role: string, preferredLanguage: string, firstName: string, backofficeBaseUrl: string }`, authenticated via `INTERNAL_API_KEY` bearer token check (same pattern as TASK-10.3.2). The implementation: creates a new `ApplicationUser` via `UserManager.CreateAsync`, sets `PreferredLanguage`, generates an invitation token via `UserManager.GenerateUserTokenAsync` using the named `"Invitation"` token provider, builds the activation link (`{backofficeBaseUrl}/activate?token={token}&email={email}`), and calls `IEmailService.SendInvitationEmailAsync`. Returns `200 OK` with `{ userId: string }` on success, `409` if the email already exists, or `500` if the email fails to send (the caller treats this as a rollback signal).

**Constraints:**
- Uses the `"Invitation"` named token provider (72-hour expiry) configured in TASK-01.1.4 (`DataProtectionTokenProviderOptions`), distinct from the default password-reset token provider (1-hour expiry).
- `ApplicationUser.EmailConfirmed` must be `false` at creation — activation via TASK-01.1.4 sets it to `true`.
- The endpoint is NOT protected by JWT Bearer — it uses a raw `INTERNAL_API_KEY` bearer check (identical to the pattern in TASK-10.3.2).
- Never log the generated token or the activation link.
- If `UserManager.CreateAsync` succeeds but `IEmailService` throws, the endpoint must call `UserManager.DeleteAsync` before returning `500` — ensuring the identity side is clean for the `api` to not create a `ClientUser` row.
- `[AllowAnonymous]` (OpenIddict does not guard this route — custom API key check handles auth).

**Definition of Done:**
- [ ] `POST /internal/users` with a valid `INTERNAL_API_KEY` and a new email creates a user and sends an invitation email, returning `200 OK` with `{ userId }`.
- [ ] `POST /internal/users` with a duplicate email returns `409`.
- [ ] `POST /internal/users` with an invalid `INTERNAL_API_KEY` returns `401`.
- [ ] If `IEmailService` throws, the user row is deleted and the endpoint returns `500`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.5.2 — `IClientUserRepository` and domain methods (`api`)
> ⚠️ **Superseded in part by EPIC-00.** The `ClientUser` entity, `ClientUserStatus` enum, `ClientUserConfiguration`, `DbSet<ClientUser>`, and the `AddClientAndClientUser` migration are all created by **EPIC-00 TASK-00.2**. This task no longer creates the entity or migration — it adds the repository interface, implements the repository, and adds the domain behaviour methods that the admin use cases require.

**Layer:** Domain + Infrastructure
**Repo:** api
**Depends on:** EPIC-00 TASK-00.2 (ClientUser entity already in schema)

**What to build:**

1. **Domain methods on `ClientUser`** — add the following behaviour methods to the existing entity (no public setters):
   - `Activate(Guid userId)` — sets `UserId`, `Status = Active`, `ActivatedAt = UtcNow`, calls `Touch()`.
   - `Deactivate()` — sets `Status = Inactive`, `IsDeleted = true`, calls `Touch()`.
   - `Reactivate()` — sets `Status = Active`, `IsDeleted = false`, calls `Touch()`.
   - `UpdateProfile(string firstName, string lastName, string email)` — updates the three fields, calls `Touch()`.

2. **`IClientUserRepository`** (`Api.Domain/Interfaces/IClientUserRepository.cs`) — define the interface with: `GetByIdAsync`, `GetByUserIdAsync`, `GetByEmailAsync`, `ListPagedAsync`, `CountByClientIdAsync`, `AddAsync`, `UpdateAsync`.

3. **`ClientUserRepository`** (`Api.Infrastructure/Persistence/Repositories/ClientUserRepository.cs`) — implement `IClientUserRepository` using `AppDbContext`. Register `IClientUserRepository → ClientUserRepository` as `Scoped` in `AddInfrastructure`.

**Constraints:**
- `IClientUserRepository` lives in `Api.Domain/Interfaces/` — no EF Core references.
- No new migrations — the schema already exists from EPIC-00.
- No changes to `ClientUserConfiguration` — the Fluent API config already exists from EPIC-00.

**Definition of Done:**
- [ ] `ClientUser` entity has `Activate`, `Deactivate`, `Reactivate`, `UpdateProfile` domain methods.
- [ ] `IClientUserRepository` exists at `Api.Domain/Interfaces/IClientUserRepository.cs` with all listed methods.
- [ ] `ClientUserRepository` exists and implements `IClientUserRepository`.
- [ ] `dotnet build` succeeds for `Api.Domain` and `Api.Infrastructure`.

---

#### TASK-05.5.3 — `ActivateClientUserUseCase` — mark user active after invitation acceptance (`api`)
> ⚠️ **Renamed and rescoped from original.** The original TASK-05.5.3 created the EF Core configuration and migration — those are now owned by EPIC-00. This task now owns the use case that marks a `ClientUser` as `Active` after the user completes account activation via the identity server.

**Layer:** Application
**Repo:** api
**Depends on:** TASK-05.5.2

**What to build:**
Create `ActivateClientUserUseCase` in `Api.Application/UseCases/ClientUsers/`. It accepts `ActivateClientUserCommand(Guid userId)` — the `sub` claim from the just-activated user's identity (passed by the activation endpoint or called from an internal trigger). The use case: looks up `ClientUser` by `UserId` via `IClientUserRepository.GetByUserIdAsync` — returns `NotFoundError` if absent; calls `clientUser.Activate(userId)`; commits; returns `Result` (void).

Also expose `POST /internal/client-users/{userId}/activate` in a new `InternalClientUsersController` in `Api.API/Controllers/Internal/` secured by `InternalApiKeyMiddleware` (introduced in EPIC-01 TASK-01.F for the `identity` repo — `api` needs the same middleware). This endpoint is called by `identity` after a successful account activation to synchronise `ClientUser.Status`.

**Constraints:**
- `InternalApiKeyMiddleware` for the `api` repo follows the same pattern as EPIC-01 TASK-01.F: validates `X-Internal-Api-Key` header against `INTERNAL_API_KEY` env var on all `/internal/**` routes.
- Route: `POST /internal/client-users/{userId}/activate`.
- Returns `204 No Content` on success; `404` if `ClientUser` not found for the given `userId`.
- `[AllowAnonymous]` on the controller — authentication is the `X-Internal-Api-Key` header check.
- Not exposed via Swagger.

**Definition of Done:**
- [ ] `ActivateClientUserUseCase` and `IActivateClientUserUseCase` exist in `Api.Application/UseCases/ClientUsers/`.
- [ ] `InternalClientUsersController` exists at `Api.API/Controllers/Internal/InternalClientUsersController.cs`.
- [ ] `POST /internal/client-users/{userId}/activate` with correct API key returns `204`.
- [ ] `POST /internal/client-users/{userId}/activate` without API key returns `401`.
- [ ] `POST /internal/client-users/{userId}/activate` with unknown `userId` returns `404`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.5.4 — `InviteClientUserUseCase` (`api`)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-05.5.2, TASK-10.3.1 (IIdentityInternalClient interface)

**What to build:**
Create `InviteClientUserUseCase` in `Api.Application/UseCases/ClientUsers/` accepting `InviteClientUserCommand(string firstName, string lastName, string email, Guid clientId, string preferredLanguage)`. The use case: validates the command (FluentValidation — email format, required fields, `preferredLanguage` in `["es","en"]`); checks for duplicate email via `IClientUserRepository.GetByEmailAsync` (returns `ConflictError` if found); calls `IIdentityUserService.CreateUserAsync` (internal HTTP to `POST /internal/users` in identity); if that succeeds, creates a `ClientUser` row via `IClientUserRepository.AddAsync` and commits via `IUnitOfWork`; if the identity call fails, returns the error and nothing is persisted in `api`. Returns `Result<ClientUserDto>` on success.

**Constraints:**
- No MediatR — direct constructor injection per backend-guidelines §2.
- `IIdentityUserService` is defined in `Api.Application/Common/Interfaces/` (already introduced by TASK-10.3.1 as `IIdentityInternalClient` — reuse or extend it). The method needed: `CreateUserAsync(email, role, preferredLanguage, firstName, backofficeBaseUrl)`.
- The `backofficeBaseUrl` value comes from `IConfiguration["BACKOFFICE_BASE_URL"]` — a new env var added to `api/.env.example`.
- `role` is always `"Client"` for users created via this use case — admin users are never created through this flow.
- The duplicate-email check in `api` (`GetByEmailAsync`) is a best-effort guard. The `identity` side also returns `409` if the email already exists — both must be handled and mapped to `ConflictError`.
- `InviteClientUserCommand` validator: email format, non-empty first/last name (max 100), non-empty clientId.

**Definition of Done:**
- [ ] `InviteClientUserUseCase` and `IInviteClientUserUseCase` exist in `Api.Application/UseCases/ClientUsers/`.
- [ ] `InviteClientUserValidator` exists in the same folder.
- [ ] Duplicate email (existing `ClientUser`) returns `ConflictError`.
- [ ] `dotnet build` succeeds for `Api.Application`.

---

#### TASK-05.5.5 — `InviteClientUser` endpoint on `ClientUsersController` (`api`)
**Layer:** API
**Repo:** api
**Depends on:** TASK-05.5.4, TASK-05.5.3, TASK-05.4.2

**What to build:**
Add a `POST /api/admin/users` action to the existing `ClientUsersController`. The action accepts `InviteClientUserRequest { FirstName, LastName, Email, ClientId, PreferredLanguage }` from the request body, maps to `InviteClientUserCommand`, calls `IInviteClientUserUseCase.ExecuteAsync`, and returns `201 Created` with the `ClientUserDto` on success. `BACKOFFICE_BASE_URL` must be added to `api/.env.example`.

**Constraints:**
- `[Authorize(Roles = "Admin")]` — non-admin returns `403`.
- `201 Created` response on success (POST creates a resource per api-conventions.md §2).
- `409 Conflict` for duplicate email (via `ConflictError` from use case).
- `422 Unprocessable Entity` for validation failures.
- `BACKOFFICE_BASE_URL` added to `api/.env.example`.

**Definition of Done:**
- [ ] `POST /api/admin/users` with valid payload and Admin JWT returns `201 Created` with `ClientUserDto`.
- [ ] `POST /api/admin/users` with duplicate email returns `409`.
- [ ] `POST /api/admin/users` with missing required fields returns `422`.
- [ ] `POST /api/admin/users` with a non-admin JWT returns `403`.
- [ ] `BACKOFFICE_BASE_URL` appears in `api/.env.example`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.5.6 — Invite user form (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.5.5, TASK-05.4.3

**What to build:**
Add an "Invite user" button to the `/users` list page that opens a shadcn/ui `Dialog` containing the invitation form. The form renders: First Name (`Input`), Last Name (`Input`), Email (`Input`, type email), Client (`Select`, populated by a `GET /api/admin/clients` query), and Language (`Select`, options: Spanish / English). On submit, calls `POST /api/admin/users` via TanStack Query `useMutation`. On success, closes the dialog, shows a success toast, and invalidates the user list query. On duplicate email, shows the inline error "An account with this email already exists." On any other API error, shows a generic error toast.

**Constraints:**
- Use shadcn/ui `Dialog`, `Form`, `Input`, `Select`, `Button` — no raw HTML elements.
- Client dropdown is populated by `GET /api/admin/clients` (defined in TASK-05.9.5) — use `useQuery` with a separate query key.
- Form validation is client-side (required fields, email format) before the API call is made.
- The `Dialog` closes only on success or explicit cancel — not on outside click while a submission is in-flight.
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] "Invite user" button opens the dialog with the form.
- [ ] Submitting a valid form calls `POST /api/admin/users` and on success closes the dialog and shows the toast.
- [ ] Duplicate email shows inline error on the form.
- [ ] The user list refreshes after a successful invite.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.6 — Admin can resend an invitation to a pending user
> *As an admin, I want to resend the invitation email to a user who has not yet activated their account so that they can complete registration if the original link expired.*

**Acceptance Criteria:**
- [ ] A "Resend invitation" action is visible for users with status "Pending activation".
- [ ] Clicking the action invalidates the previous invitation token and sends a new invitation email with a fresh 72-hour link.
- [ ] A success confirmation is shown after the email is sent.
- [ ] The action is not available for users with status "Active" or "Inactive".

**Story Points:** 2

#### TASK-05.6.1 — `POST /internal/users/{id}/resend-invitation` endpoint in `identity`
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-05.5.1

**What to build:**
Add a `POST /internal/users/{id}/resend-invitation` action to `InternalUsersController` in `Identity.API/Controllers/Internal/`. The action: looks up the `ApplicationUser` by ID via `UserManager.FindByIdAsync`; calls `UserManager.UpdateSecurityStampAsync` to invalidate all outstanding tokens; generates a new invitation token via `UserManager.GenerateUserTokenAsync` with the `"Invitation"` named provider; builds the activation link (`{backofficeBaseUrl}/activate?token={token}&email={email}`); calls `IEmailService.SendInvitationEmailAsync`. Returns `204 No Content` on success, `404` if the user is not found, `409` if the user's email is already confirmed (`EmailConfirmed = true`), or `500` if the email fails to send.

**Constraints:**
- Uses the `"Invitation"` named token provider (72-hour expiry) — same as TASK-05.5.1.
- `UpdateSecurityStampAsync` must be called before generating the new token (it invalidates all previously issued tokens bound to the old stamp).
- The endpoint rejects requests for users with `EmailConfirmed = true` — resend is only valid for unactivated users.
- `[AllowAnonymous]` — INTERNAL_API_KEY bearer check handles authentication.
- Never log the generated token or activation link.
- `backofficeBaseUrl` passed in the request body `{ backofficeBaseUrl: string }`.

**Definition of Done:**
- [ ] `POST /internal/users/{id}/resend-invitation` with a valid `INTERNAL_API_KEY` and a pending user returns `204 No Content` and sends a new invitation email.
- [ ] The endpoint returns `409` for a user with `EmailConfirmed = true`.
- [ ] The endpoint returns `404` for an unknown user ID.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.6.2 — `ResendInvitationUseCase` and endpoint (`api`)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-05.6.1, TASK-05.5.3

**What to build:**
Create `ResendInvitationUseCase` in `Api.Application/UseCases/ClientUsers/` accepting `ResendInvitationCommand(Guid clientUserId)`. The use case: fetches the `ClientUser` via `IClientUserRepository.GetByIdAsync` (returns `NotFoundError` if absent); validates that `Status == PendingActivation` (returns `ConflictError` with message "Invitation can only be resent for pending users" otherwise); calls `IIdentityUserService.ResendInvitationAsync(userId, backofficeBaseUrl)` (a new method on the existing `IIdentityUserService` interface — adds `POST /internal/users/{id}/resend-invitation`); returns `Result` (void) on success. Add a `POST /api/admin/users/{id}/resend-invitation` action to the existing `ClientUsersController`.

**Constraints:**
- No MediatR.
- `[Authorize(Roles = "Admin")]` on the endpoint.
- `204 No Content` on success.
- `404 Not Found` if `ClientUser` not found.
- `409 Conflict` if user is not `PendingActivation`.
- `BACKOFFICE_BASE_URL` passed from `IConfiguration` — same env var as TASK-05.5.4.

**Definition of Done:**
- [ ] `POST /api/admin/users/{id}/resend-invitation` (Admin JWT, pending user) returns `204 No Content`.
- [ ] Same endpoint for an `Active` user returns `409`.
- [ ] Same endpoint for an unknown ID returns `404`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.6.3 — "Resend invitation" action on user detail page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.6.2, TASK-05.7.3 (user detail page)

**What to build:**
On the user detail page (`/users/{id}`, created in TASK-05.7.3), add a "Resend invitation" button visible only when the user's `status` is `"PendingActivation"`. Clicking the button calls `POST /api/admin/users/{id}/resend-invitation` via TanStack Query `useMutation` and shows a success toast on completion. On error, shows an error toast. The button is disabled while the mutation is in-flight.

**Constraints:**
- The button renders only for `PendingActivation` status — not mounted in the DOM for `Active` or `Inactive` users.
- Use shadcn/ui `Button` — no raw HTML button.
- No confirmation dialog required (the action is low-risk and reversible by design).
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] "Resend invitation" button is visible on the user detail page for `PendingActivation` users.
- [ ] Clicking it calls `POST /api/admin/users/{id}/resend-invitation` and shows a success toast.
- [ ] The button is absent for `Active` and `Inactive` users.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.7 — Admin can edit a client user's profile
> *As an admin, I want to edit a client user's name, email, or associated client so that I can keep user records accurate.*

**Acceptance Criteria:**
- [ ] The user detail screen shows an edit form pre-populated with the user's current data (first name, last name, email, associated client).
- [ ] All fields are editable except for the email of a user with status "Pending activation" (email cannot be changed once an invitation has been sent).
- [ ] Changing the email of an active user does not require re-activation — the change takes effect immediately.
- [ ] Saving with a duplicate email shows an inline error: "An account with this email already exists."
- [ ] A success toast is shown on save; a validation error is shown inline if the save fails.
- [ ] The edit action requires the Admin role — non-admin requests receive `403`.

**Story Points:** 3

#### TASK-05.7.1 — `PATCH /internal/users/{id}/email` endpoint in `identity`
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-10.3.2

**What to build:**
Add a `PATCH /internal/users/{id}/email` action to `InternalUsersController`. The action accepts `{ email: string }` in the body, validates the new email format, updates `ApplicationUser.Email` and `ApplicationUser.NormalizedEmail` via `UserManager.SetEmailAsync`, and returns `204 No Content`. Returns `404` if the user is not found, `409` if the new email is already taken by another user, `422` if the email format is invalid.

**Constraints:**
- `INTERNAL_API_KEY` bearer check — same pattern as all other `/internal` endpoints.
- Use `UserManager.SetEmailAsync` — do not update `Email` directly on the entity (bypasses Identity's normalisation).
- This endpoint does NOT send an email confirmation — the email change takes effect immediately per US-05.7 AC.
- `[AllowAnonymous]` — INTERNAL_API_KEY check handles authentication.

**Definition of Done:**
- [ ] `PATCH /internal/users/{id}/email` with a valid key and a new unique email returns `204 No Content`.
- [ ] Returns `409` if the email is already taken.
- [ ] Returns `404` for an unknown user ID.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.7.2 — `UpdateClientUserUseCase` and endpoint (`api`)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-05.5.3, TASK-05.7.1

**What to build:**
Create `UpdateClientUserUseCase` in `Api.Application/UseCases/ClientUsers/` accepting `UpdateClientUserCommand(Guid clientUserId, string firstName, string lastName, string email, Guid clientId)`. The use case: fetches the `ClientUser`; validates that if `Status == PendingActivation` the email is unchanged (return `ConflictError` with message "Email cannot be changed for a pending user"); checks for duplicate email via `GetByEmailAsync` if the email changed; if email changed and status is `Active`, calls `IIdentityUserService.UpdateEmailAsync(userId, newEmail)` (TASK-05.7.1); calls `clientUser.UpdateProfile(firstName, lastName, email)` and commits; returns `Result<ClientUserDto>`. Add `PUT /api/admin/users/{id}` to `ClientUsersController`.

**Constraints:**
- `[Authorize(Roles = "Admin")]`.
- `PUT` semantics — full profile replacement (per api-conventions.md §4).
- Pending user email lock: block at use-case level before calling identity — return `422` with a descriptive message.
- Duplicate email check in `api` first; identity email update only after `api` duplicate check passes.
- `200 OK` with updated `ClientUserDto` on success.

**Definition of Done:**
- [ ] `PUT /api/admin/users/{id}` (Admin JWT) with valid data returns `200 OK` with updated `ClientUserDto`.
- [ ] Attempting to change the email of a `PendingActivation` user returns `422`.
- [ ] Duplicate email returns `409`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.7.3 — User detail / edit page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.7.2, TASK-05.4.3

**What to build:**
Create the `/users/:id` route inside `AdminShell`. The page fetches the user via `GET /api/admin/users/:id` (a new read-only endpoint on `ClientUsersController` — add a `GET /api/admin/users/{id}` action returning a single `ClientUserDto`, depends on `TASK-05.5.3`). Render an edit form pre-populated with First Name, Last Name, Email (disabled for `PendingActivation`), Client (`Select`). On submit, calls `PUT /api/admin/users/{id}` via `useMutation`. On success, shows a success toast. On duplicate email, shows inline error "An account with this email already exists." On `PendingActivation` email change attempt, shows "Email cannot be changed for a pending user" inline.

**Constraints:**
- Use shadcn/ui `Form`, `Input`, `Select`, `Button`.
- Email field is `disabled` (not just visually — functionally disabled via the `disabled` prop) for `PendingActivation` users.
- Client dropdown populated from `GET /api/admin/clients` (TASK-05.9.5).
- The page also hosts the "Resend invitation" button (TASK-05.6.3) and the deactivate/reactivate button (TASK-05.8.3).
- Route guarded by `requireAdmin`.
- `GET /api/admin/users/{id}` endpoint must be added to `ClientUsersController` as part of this task (single `ClientUserDto` response, `[Authorize(Roles = "Admin")]`).
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] `/users/:id` renders the edit form pre-filled with the user's current data.
- [ ] Email field is disabled for `PendingActivation` users and enabled for `Active` users.
- [ ] Saving valid changes calls `PUT /api/admin/users/{id}` and shows a success toast.
- [ ] `GET /api/admin/users/{id}` returns `200 OK` with the user's `ClientUserDto`.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.8 — Admin can deactivate or reactivate a client user
> *As an admin, I want to deactivate a client user's account so that they lose access to the portal, and reactivate it later if needed.*

**Acceptance Criteria:**
- [ ] The user detail screen shows a "Deactivate" button for Active users and a "Reactivate" button for Inactive users.
- [ ] Clicking "Deactivate" asks for confirmation before proceeding ("Are you sure? This user will immediately lose access.").
- [ ] A deactivated user who attempts to log in sees a clear "Your account has been deactivated. Contact your administrator." message.
- [ ] Reactivating a deactivated user restores their access immediately without requiring them to set a new password.
- [ ] The user's status in the list updates immediately after the action.
- [ ] An admin cannot deactivate their own account.
- [ ] The action requires the Admin role — non-admin requests receive `403`.

**Story Points:** 3

#### TASK-05.8.1 — Deactivate/reactivate endpoints in `identity` (lockout)
**Layer:** API + Infrastructure
**Repo:** identity
**Depends on:** TASK-05.5.1

**What to build:**
Add two actions to `InternalUsersController`:
1. `POST /internal/users/{id}/deactivate` — calls `UserManager.SetLockoutEnabledAsync(user, true)` and `UserManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue)` to lock the account indefinitely. Returns `204 No Content`.
2. `POST /internal/users/{id}/reactivate` — calls `UserManager.SetLockoutEndDateAsync(user, null)` and `UserManager.ResetAccessFailedCountAsync(user)` to unlock the account. Returns `204 No Content`.

Both actions use the `INTERNAL_API_KEY` bearer check. Both return `404` for unknown user IDs.

**Constraints:**
- `UserManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue)` — using `DateTimeOffset.MaxValue` (not a short expiry) ensures the account stays locked until explicitly unlocked.
- The deactivated user's next OpenIddict token request will fail because Identity checks lockout before issuing tokens (this is enforced by `AuthorizationController` in TASK-01.2.1 which calls `UserManager.CheckPasswordAsync` — Identity raises lockout if `LockoutEnd > UtcNow`).
- No email sent on deactivation or reactivation — silent operation.
- `[AllowAnonymous]` — INTERNAL_API_KEY check handles authentication.

**Definition of Done:**
- [ ] `POST /internal/users/{id}/deactivate` locks the account and returns `204 No Content`.
- [ ] `POST /internal/users/{id}/reactivate` unlocks the account and returns `204 No Content`.
- [ ] Both return `404` for unknown IDs.
- [ ] After deactivation, a login attempt for that user via `POST /connect/token` is rejected (Identity lockout enforced).
- [ ] `dotnet build` succeeds.

---

#### TASK-05.8.2 — `DeactivateClientUserUseCase` and `ReactivateClientUserUseCase` with endpoints (`api`)
**Layer:** Application + API
**Repo:** api
**Depends on:** TASK-05.8.1, TASK-05.5.3

**What to build:**
Create two use cases in `Api.Application/UseCases/ClientUsers/`:
1. `DeactivateClientUserUseCase(DeactivateClientUserCommand(Guid clientUserId, Guid requestingAdminUserId))` — fetches `ClientUser`; blocks self-deactivation (`clientUser.UserId == requestingAdminUserId` → `ForbiddenError`); validates `Status == Active` (`ConflictError` otherwise); calls `IIdentityUserService.DeactivateUserAsync(userId)`; calls `clientUser.Deactivate()`; commits.
2. `ReactivateClientUserUseCase(ReactivateClientUserCommand(Guid clientUserId))` — validates `Status == Inactive`; calls `IIdentityUserService.ReactivateUserAsync(userId)`; calls `clientUser.Reactivate()`; commits.

Add `PATCH /api/admin/users/{id}/deactivate` and `PATCH /api/admin/users/{id}/reactivate` actions to `ClientUsersController`. Both return `200 OK` with updated `ClientUserDto`.

**Constraints:**
- `[Authorize(Roles = "Admin")]` on both endpoints.
- `requestingAdminUserId` extracted from JWT `sub` claim in the controller, passed into the command.
- Self-deactivation check returns `403` (via `ForbiddenError` → `ResultExtensions`).
- `ConflictError` for wrong-status operations (e.g., deactivating an already Inactive user) returns `409`.
- Both identity calls (`IIdentityUserService.DeactivateUserAsync`, `IIdentityUserService.ReactivateUserAsync`) are new methods on the existing interface, calling the internal identity endpoints from TASK-05.8.1.

**Definition of Done:**
- [ ] `PATCH /api/admin/users/{id}/deactivate` (Admin JWT, Active user) returns `200 OK` with `status: "Inactive"`.
- [ ] Same endpoint for the admin's own account returns `403`.
- [ ] `PATCH /api/admin/users/{id}/reactivate` (Admin JWT, Inactive user) returns `200 OK` with `status: "Active"`.
- [ ] Deactivating an already Inactive user returns `409`.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.8.3 — Deactivate / reactivate UI on user detail page (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.8.2, TASK-05.7.3

**What to build:**
On the user detail page (`/users/:id`), add conditional deactivate/reactivate buttons below the edit form. For `Active` users: show a "Deactivate" button (shadcn/ui `Button` variant `destructive`). Clicking it opens a shadcn/ui `AlertDialog` asking "Are you sure? This user will immediately lose access." with Confirm / Cancel actions. On confirmation, calls `PATCH /api/admin/users/{id}/deactivate` via `useMutation`, shows a success toast, and updates the displayed status. For `Inactive` users: show a "Reactivate" button (variant `outline`) that calls `PATCH /api/admin/users/{id}/reactivate` without a confirmation dialog.

**Constraints:**
- Use shadcn/ui `AlertDialog` for the deactivation confirmation — no native `window.confirm`.
- "Deactivate" button is absent if the logged-in admin is viewing their own account (`currentUser.sub === user.userId`).
- Both buttons are disabled while their respective mutation is in-flight.
- Status badge on the page updates immediately after a successful mutation (invalidate the user detail query).
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] "Deactivate" button is visible for Active users and opens the `AlertDialog` on click.
- [ ] Confirming deactivation calls `PATCH .../deactivate` and the page shows `status: Inactive`.
- [ ] "Deactivate" button is absent when the admin is viewing their own profile.
- [ ] "Reactivate" button is visible for Inactive users and calls `PATCH .../reactivate` on click.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

### US-05.9 — Admin can manage client organisations
> *As an admin, I want to create and manage client organisations so that I can group users by company and control which Jira project their tickets go to.*

**Acceptance Criteria:**
- [ ] A "Clients" section in the admin navigation lists all client organisations with their name and the number of associated users.
- [ ] An "Add client" form requires: client name (unique). All other fields (description, Jira project key) are optional at creation and can be filled in later.
- [ ] Duplicate client names are rejected with an inline error.
- [ ] Each client row has an "Edit" action that allows changing the client name and description.
- [ ] A client cannot be deleted if it has associated users — the system shows an explanatory error.
- [ ] A success toast is shown on create or edit; validation errors are shown inline.
- [ ] The page is accessible only to authenticated admin users.

**Story Points:** 3

#### TASK-05.9.1 — `Client` domain methods, `IClientRepository`, and `ClientRepository` (`api`)
> ⚠️ **Superseded in part by EPIC-00.** The `Client` entity, `ClientConfiguration`, `DbSet<Client>`, and the `AddClientAndClientUser` migration are all created by **EPIC-00 TASK-00.2**. This task no longer creates the entity or migration — it adds the domain behaviour methods, defines the repository interface, and implements the repository.

**Layer:** Domain + Infrastructure
**Repo:** api
**Depends on:** EPIC-00 TASK-00.2 (Client entity already in schema)

**What to build:**

1. **Domain methods on `Client`** — add behaviour methods to the existing entity:
   - `Client.Create(string name, string? description)` static factory — if not already added by EPIC-00.
   - `Update(string name, string? description)` — updates fields, calls `Touch()`.
   - `SoftDelete()` — sets `IsDeleted = true`.

2. **`IClientRepository`** (`Api.Domain/Interfaces/IClientRepository.cs`) — define the interface with: `GetByIdAsync`, `GetByNameAsync`, `ListAsync(bool includeUserCount)`, `AddAsync`, `UpdateAsync`, `HasActiveUsersAsync(Guid clientId)`.

3. **`ClientRepository`** (`Api.Infrastructure/Persistence/Repositories/ClientRepository.cs`) — implement `IClientRepository` using `AppDbContext`. Register `IClientRepository → ClientRepository` as `Scoped` in `AddInfrastructure`.

**Constraints:**
- No public setters on `Client` — domain methods only.
- `IClientRepository` lives in `Api.Domain/Interfaces/` — no EF Core references.
- `HasActiveUsersAsync` counts `ClientUser` records where `ClientId = id` and `IsDeleted = false`.
- No new migrations — schema already exists from EPIC-00.

**Definition of Done:**
- [ ] `Client` entity has `Create`, `Update`, `SoftDelete` methods.
- [ ] `IClientRepository` exists at `Api.Domain/Interfaces/IClientRepository.cs`.
- [ ] `ClientRepository` exists and implements `IClientRepository`.
- [ ] `dotnet build` succeeds for `Api.Domain` and `Api.Infrastructure`.

---

#### TASK-05.9.2 — ~~`Client` EF Core configuration and migration~~ *(removed — superseded by EPIC-00)*
> ⚠️ **This task is removed.** The `Clients` table, `ClientConfiguration`, and migration are delivered by **EPIC-00 TASK-00.2**. There is nothing to do here. Proceed directly to TASK-05.9.3.

---

#### TASK-05.9.3 — `CreateClientUseCase` and `UpdateClientUseCase` (`api`)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-05.9.1

**What to build:**
Create two use cases in `Api.Application/UseCases/Clients/`:
1. `CreateClientUseCase(CreateClientCommand(string name, string? description))` — validates command; checks for duplicate name via `IClientRepository.GetByNameAsync` (returns `ConflictError` if found); creates `Client.Create(name, description)`; commits; returns `Result<ClientDto>`.
2. `UpdateClientUseCase(UpdateClientCommand(Guid clientId, string name, string? description))` — fetches client (returns `NotFoundError` if absent); checks duplicate name (excluding current client); calls `client.Update(name, description)`; commits; returns `Result<ClientDto>`.

`ClientDto` is a `record(Guid Id, string Name, string? Description, int UserCount)`.

**Constraints:**
- No MediatR — direct injection per backend-guidelines §2.
- `CreateClientValidator`: `name` not empty, max 200. `UpdateClientValidator`: same plus `clientId` not empty.
- `UserCount` in `ClientDto` is populated by `IClientRepository.ListAsync(includeUserCount: true)` — a count of non-deleted `ClientUser` records per client. For single-client reads, it is populated via a separate `IClientUserRepository.CountByClientIdAsync(clientId)` call inside the use case.

**Definition of Done:**
- [ ] `CreateClientUseCase`, `UpdateClientUseCase` and their interfaces exist in `Api.Application/UseCases/Clients/`.
- [ ] `ClientDto` record exists.
- [ ] Duplicate name returns `ConflictError` for both use cases.
- [ ] `dotnet build` succeeds for `Api.Application`.

---

#### TASK-05.9.4 — `SoftDeleteClientUseCase` (`api`)
**Layer:** Application
**Repo:** api
**Depends on:** TASK-05.9.1, TASK-05.5.2

**What to build:**
Create `SoftDeleteClientUseCase(SoftDeleteClientCommand(Guid clientId))` in `Api.Application/UseCases/Clients/`. The use case: fetches the client (returns `NotFoundError` if absent); calls `IClientRepository.HasActiveUsersAsync(clientId)` — returns `ConflictError("Cannot delete a client with active users.")` if `true`; calls `client.SoftDelete()`; commits; returns `Result` (void).

**Constraints:**
- Soft-delete only — no physical row deletion.
- `HasActiveUsersAsync` check at the application layer; the FK `ON DELETE RESTRICT` at the DB level provides a secondary safety net.
- After soft-delete, the client no longer appears in list queries (global query filter).

**Definition of Done:**
- [ ] `SoftDeleteClientUseCase` and `ISoftDeleteClientUseCase` exist in `Api.Application/UseCases/Clients/`.
- [ ] A client with active users returns `ConflictError`.
- [ ] A client with no users is soft-deleted successfully.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.9.5 — `ClientsController` (`api`)
**Layer:** API
**Repo:** api
**Depends on:** TASK-05.9.3, TASK-05.9.4, TASK-05.9.2

**What to build:**
Create `Api.API/Controllers/Admin/ClientsController.cs` with:
1. `GET /api/admin/clients` — calls `IListClientsUseCase` (a simple use case that calls `IClientRepository.ListAsync(includeUserCount: true)`); returns `200 OK` with `IReadOnlyList<ClientDto>`. No pagination required (client count expected to be low).
2. `POST /api/admin/clients` — body `CreateClientRequest { Name, Description? }`; calls `ICreateClientUseCase`; returns `201 Created` with `ClientDto`.
3. `PUT /api/admin/clients/{id}` — body `UpdateClientRequest { Name, Description? }`; calls `IUpdateClientUseCase`; returns `200 OK` with `ClientDto`.
4. `DELETE /api/admin/clients/{id}` — calls `ISoftDeleteClientUseCase`; returns `204 No Content`.

**Constraints:**
- All endpoints require `[Authorize(Roles = "Admin")]`.
- Route: `[Route("api/admin/clients")]`.
- Controller inherits from `ApiControllerBase`.
- `409 Conflict` for duplicate name (on POST and PUT) and for delete-with-users (on DELETE).
- `404 Not Found` for unknown client ID (on PUT and DELETE).

**Definition of Done:**
- [ ] `GET /api/admin/clients` (Admin JWT) returns `200 OK` with client list including `userCount`.
- [ ] `POST /api/admin/clients` with duplicate name returns `409`.
- [ ] `DELETE /api/admin/clients/{id}` for a client with users returns `409`.
- [ ] `DELETE /api/admin/clients/{id}` for a client with no users returns `204`.
- [ ] All endpoints return `403` for non-Admin JWT.
- [ ] `dotnet build` succeeds.

---

#### TASK-05.9.6 — Client management pages (`backoffice`)
**Layer:** Frontend
**Repo:** backoffice
**Depends on:** TASK-05.9.5, TASK-05.1.4

**What to build:**
Create the `/clients` route inside `AdminShell`. The page renders a shadcn/ui `Table` listing clients (Name, Description, User Count) with an "Edit" button per row (opens an inline `Dialog` or navigates to a detail route). Add an "Add client" button that opens a `Dialog` with a form (Name required, Description optional). On submit, calls `POST /api/admin/clients` via `useMutation`. Edit opens a pre-filled dialog and calls `PUT /api/admin/clients/{id}`. Each row has a "Delete" button that calls `DELETE /api/admin/clients/{id}` — on `409` (has users), show an inline error toast "This client has associated users and cannot be deleted." rather than a generic error.

**Constraints:**
- Use shadcn/ui `Table`, `Dialog`, `Form`, `Input`, `Textarea`, `Button`.
- No separate route for client edit — both create and edit use the same `Dialog` component (controlled by a `selectedClient` state: `null` for create, a `ClientDto` for edit).
- Duplicate name error shows inline on the form (`409` from API → "A client with this name already exists.").
- The client list re-fetches (TanStack Query `invalidateQueries`) after any successful create, update, or delete.
- Route guarded by `requireAdmin`.
- All strings use `admin` namespace i18n keys.

**Definition of Done:**
- [ ] `/clients` renders the client list with Name, Description, User Count columns.
- [ ] "Add client" dialog submits and the new client appears in the list.
- [ ] Editing a client pre-fills the dialog with current data and updates on save.
- [ ] Deleting a client with users shows the specific `409` error toast.
- [ ] `npm run build` succeeds with no TypeScript errors.

---

## Summary

| Story | Title | Points |
|---|---|---|
| US-05.1 | Admin can log in and access the backoffice | 5 |
| US-05.2 | Admin can activate their account via invitation link | 2 |
| US-05.3 | Admin can reset their password from the backoffice login page | 2 |
| US-05.4 | Admin can view the list of client users | 3 |
| US-05.5 | Admin can invite a new client user | 5 |
| US-05.6 | Admin can resend an invitation to a pending user | 2 |
| US-05.7 | Admin can edit a client user's profile | 3 |
| US-05.8 | Admin can deactivate or reactivate a client user | 3 |
| US-05.9 | Admin can manage client organisations | 3 |
| **Total** | | **28** |

---

## Task Breakdown

> **Recommended sprint order:** EPIC-00 must be complete before EPIC-05 begins. The `Client`, `ClientUser`, and `ClientProject` tables already exist — EPIC-05 starts directly with repository interfaces and use cases. Backoffice auth tasks (TASK-05.1.1 through 05.1.6) can run in parallel on the frontend track.

| Task | Title | Story | Layer | Repo | Depends on |
|---|---|---|---|---|---|
| TASK-05.9.1 | `Client` domain methods, `IClientRepository`, `ClientRepository` | US-05.9 | Domain + Infrastructure | api | EPIC-00 TASK-00.2 |
| ~~TASK-05.9.2~~ | ~~`Client` EF Core configuration and migration~~ — **removed, superseded by EPIC-00** | — | — | — | — |
| TASK-05.9.3 | `CreateClientUseCase` and `UpdateClientUseCase` | US-05.9 | Application | api | TASK-05.9.1 |
| TASK-05.9.4 | `SoftDeleteClientUseCase` | US-05.9 | Application | api | TASK-05.9.1, TASK-05.5.2 |
| TASK-05.9.5 | `ClientsController` | US-05.9 | API | api | TASK-05.9.3, TASK-05.9.4 |
| TASK-05.9.6 | Client management pages | US-05.9 | Frontend | backoffice | TASK-05.9.5, TASK-05.1.4 |
| TASK-05.5.1 | `POST /internal/users` in `identity` | US-05.5 | API + Infrastructure | identity | TASK-01.1.1, TASK-04.1.3 |
| TASK-05.5.2 | `ClientUser` domain methods, `IClientUserRepository`, `ClientUserRepository` | US-05.5 | Domain + Infrastructure | api | EPIC-00 TASK-00.2 |
| TASK-05.5.3 | `ActivateClientUserUseCase` + internal activate endpoint | US-05.5 | Application + API | api | TASK-05.5.2 |
| TASK-05.5.4 | `InviteClientUserUseCase` | US-05.5 | Application | api | TASK-05.5.2, TASK-10.3.1 |
| TASK-05.5.5 | `InviteClientUser` endpoint on `ClientUsersController` | US-05.5 | API | api | TASK-05.5.4, TASK-05.4.2 |
| TASK-05.5.6 | Invite user form | US-05.5 | Frontend | backoffice | TASK-05.5.5, TASK-05.4.3 |
| TASK-05.1.1 | `AuthProvider`, PKCE flow, Axios interceptor | US-05.1 | Frontend | backoffice | TASK-01.2.1, TASK-10.2.1 |
| TASK-05.1.2 | Login page | US-05.1 | Frontend | backoffice | TASK-05.1.1 |
| TASK-05.1.3 | Logout UI and navigation shell | US-05.1 | Frontend | backoffice | TASK-05.1.1, TASK-01.4.1 |
| TASK-05.1.4 | Route guards and role enforcement | US-05.1 | Frontend | backoffice | TASK-05.1.1 |
| TASK-05.1.5 | Session expiry toast on login page | US-05.1 | Frontend | backoffice | TASK-05.1.1 |
| TASK-05.1.6 | Admin dashboard placeholder page | US-05.1 | Frontend | backoffice | TASK-05.1.3, TASK-05.1.4 |
| TASK-05.2.1 | Account activation page | US-05.2 | Frontend | backoffice | TASK-01.1.4, TASK-05.1.1 |
| TASK-05.3.1 | Password reset pages | US-05.3 | Frontend | backoffice | TASK-01.5.2, TASK-05.1.2 |
| TASK-05.4.1 | `ListClientUsersUseCase` | US-05.4 | Application | api | TASK-05.5.3 |
| TASK-05.4.2 | `ClientUsersController` list endpoint | US-05.4 | API | api | TASK-05.4.1 |
| TASK-05.4.3 | User list page | US-05.4 | Frontend | backoffice | TASK-05.4.2, TASK-05.1.4 |
| TASK-05.6.1 | `POST /internal/users/{id}/resend-invitation` in `identity` | US-05.6 | API + Infrastructure | identity | TASK-05.5.1 |
| TASK-05.6.2 | `ResendInvitationUseCase` and endpoint | US-05.6 | Application + API | api | TASK-05.6.1, TASK-05.5.3 |
| TASK-05.6.3 | "Resend invitation" action on user detail page | US-05.6 | Frontend | backoffice | TASK-05.6.2, TASK-05.7.3 |
| TASK-05.7.1 | `PATCH /internal/users/{id}/email` in `identity` | US-05.7 | API + Infrastructure | identity | TASK-10.3.2 |
| TASK-05.7.2 | `UpdateClientUserUseCase` and endpoint | US-05.7 | Application + API | api | TASK-05.5.3, TASK-05.7.1 |
| TASK-05.7.3 | User detail / edit page | US-05.7 | Frontend | backoffice | TASK-05.7.2, TASK-05.4.3 |
| TASK-05.8.1 | Deactivate/reactivate endpoints in `identity` | US-05.8 | API + Infrastructure | identity | TASK-05.5.1 |
| TASK-05.8.2 | `DeactivateClientUserUseCase` and `ReactivateClientUserUseCase` | US-05.8 | Application + API | api | TASK-05.8.1, TASK-05.5.3 |
| TASK-05.8.3 | Deactivate / reactivate UI on user detail page | US-05.8 | Frontend | backoffice | TASK-05.8.2, TASK-05.7.3 |
