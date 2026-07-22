## Why

To establish the foundation of the Angular 22 frontend and complete the end-to-end authentication flow. This change provides the application shell, shared UI components following the Aura style guide, and a complete cookie-based authentication flow (magic link login, verification, and profile setup) leveraging the previously built backend APIs.

## What Changes

- Scaffold shared UI components (`ButtonComponent`, `InputComponent`, `CardComponent`, `BadgeComponent`, `EmptyStateComponent`, `NavbarComponent`).
- Configure global styles with CSS custom properties (colors, typography, spacing, shadows).
- Implement `AuthService` to handle login, token verification, profile setup, refresh, and logout.
- Implement a `CsrfInterceptor` to attach the `X-CSRF-Token` header to state-changing requests by reading the `aura_csrf` cookie.
- Implement an `AuthGuard` to protect authenticated routes.
- Create the login, verify, and profile setup pages/modals using Angular 22 features (standalone components, Signals, new control flow, typed forms).
- Implement a silent refresh timer based on the JWT `exp` claim to automatically refresh the session.
- Establish basic routing for `/login`, `/verify`, and `/dashboard`.

## Capabilities

### New Capabilities
- `frontend-auth-ui`: Authentication UI, including login, verification, profile setup, `AuthService`, `AuthGuard`, `CsrfInterceptor`, and silent refresh.
- `frontend-shell-components`: Shared UI components (buttons, inputs, cards, navbar) and global styles following the Aura style guide.

### Modified Capabilities

## Impact

- Establishes the base frontend architecture.
- Consumes existing backend endpoints (`/api/auth/*`).
- Enables users to log in securely using magic links via the frontend interface.
