## 1. Project Initialization & Shell Configuration

- [x] 1.1 Generate Angular 22 workspace and base application skeleton.
- [x] 1.2 Configure global CSS variables (`styles.scss` / `_variables.scss`) based on the Aura style guide (colors, Playfair Display, Inter, spacing, shadows).
- [x] 1.3 Implement the application shell component (layout with basic `NavbarComponent`).
- [x] 1.4 Setup basic Angular routing (`/login`, `/verify`, `/dashboard`).

## 2. Shared UI Components

- [x] 2.1 Implement `ButtonComponent` with variants (primary, secondary, ghost, danger) using standalone components.
- [x] 2.2 Implement `InputComponent` with label and error state handling.
- [x] 2.3 Implement `CardComponent` for layout containment.
- [x] 2.4 Implement `BadgeComponent` for status indicators.
- [x] 2.5 Implement `EmptyStateComponent` for empty data views.

## 3. Core Authentication Services

- [x] 3.1 Implement `AuthService` with methods for magic-link request, token verification, profile setup, refresh, and logout.
- [x] 3.2 Implement `CsrfInterceptor` to read `aura_csrf` cookie and attach `X-CSRF-Token` header to mutating requests.
- [x] 3.3 Register `csrfInterceptor` in the Angular application configuration.
- [x] 3.4 Implement `AuthGuard` to protect authenticated routes like `/dashboard`.
- [x] 3.5 Implement silent refresh timer logic in `AuthService` based on `/api/auth/me` JWT expiry.
- [x] 3.6 Implement app initialization logic to call `/api/auth/me` and restore session on reload.

## 4. Authentication UI Pages

- [x] 4.1 Implement Login Page (`login.page.ts`) with email input, magic link request, and success confirmation view.
- [x] 4.2 Implement Verify Page (`verify.page.ts`) to read the token from URL, call verify endpoint, and handle redirect.
- [x] 4.3 Add a 60-second cooldown timer for the "Resend magic link" button on the verify page.
- [x] 4.4 Implement Profile Setup Modal for first-time users (name input, terms acceptance).
- [x] 4.5 Ensure global 401 handling correctly clears state and redirects to `/login`.
