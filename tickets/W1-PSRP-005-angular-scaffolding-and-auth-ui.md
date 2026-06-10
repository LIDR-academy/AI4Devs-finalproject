## PSRP-005: feat(frontend): angular-scaffolding-and-auth-ui

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001, PSRP-004

## Feature Summary
Configurar el frontend Angular 22 con el sistema de diseño completo (componentes compartidos siguiendo la guía de estilo de Aura), interfaz de autenticación (página de login con formulario de magic link, página de verificación, modal de configuración de perfil), guard de autenticación para rutas protegidas, interceptor HTTP de autenticación para manejo de JWT en cookies, y el shell de la aplicación (navbar, layout). Esto establece la base del frontend y completa el flujo de autenticación de extremo a extremo.

## Requirements
- [ ] Create shared UI components following style guide: ButtonComponent (primary, secondary, ghost, danger variants), InputComponent (label, error state), CardComponent, BadgeComponent (pending, confirmed, cancelled), EmptyStateComponent, NavbarComponent
- [ ] Configure global styles with CSS custom properties from style guide: colors, typography (Playfair Display + Inter), spacing, border-radius, shadows
- [ ] Implement `AuthService` in `app/core/auth/` with methods: `requestMagicLink(email)`, `verifyToken(token)`, `setupProfile(profile)`, `refresh()`, `logout()`, `isAuthenticated()`, `getCurrentUser()`
- [ ] Implement `CsrfInterceptor` that reads `aura_csrf` cookie via `document.cookie` and adds `X-CSRF-Token` header to state-changing requests (POST, PUT, PATCH, DELETE)
- [ ] Register `csrfInterceptor` in `app.config.ts` HTTP interceptor chain
- [ ] Implement `AuthGuard` (canActivate) to protect routes requiring authentication
- [ ] Implement login page (`features/auth/pages/login.page.ts`) with email input and "Continue" button
- [ ] Implement verify page (`features/auth/pages/verify.page.ts`) that reads token from URL query params, calls verify endpoint, checks `isFirstLogin` to redirect to profile setup or dashboard
- [ ] Implement profile setup modal (name, terms acceptance, marketing opt-in, timezone auto-detect)
- [ ] Implement silent refresh timer: decode JWT expiry from `/api/auth/me` response, call `POST /api/auth/refresh` at 50% of remaining time, restart timer with new expiry
- [ ] Implement logout functionality: call `POST /api/auth/logout`, clear local auth state, redirect to `/login`
- [ ] On app init, call `GET /api/auth/me` to check if user is already authenticated (cookie present)
- [ ] Handle 401 responses: redirect to `/login`, clear local state
- [ ] Do NOT store JWT in localStorage/sessionStorage — auth is entirely cookie-based
- [ ] Configure app routes: `/login`, `/verify`, `/dashboard` (guarded), `/accomplice/:token` (separate guard)
- [ ] Implement magic link resend with 60-second cooldown timer
- [ ] Configure Angular environment files (environment.ts, environment.prod.ts) with API base URL
- [ ] Write component tests for auth flow (login form validation, verify page token handling, CSRF interceptor)

## Technical Notes
- **Backend:** Consumes `POST /api/auth/magic-link`, `GET /api/auth/verify`, `POST /api/auth/profile`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` from PSRP-004
- **Frontend:** 
  - Standalone components (no NgModules)
  - Angular Signals for reactive state
  - New control flow (@if, @for, @switch)
  - Typed reactive forms
  - inject() function for DI
  - **Cookie-based auth:** Browser automatically sends `aura_session` and `aura_csrf` cookies with every request. No manual token attachment needed.
  - **CSRF Interceptor:** Reads `aura_csrf` cookie via `document.cookie`, adds `X-CSRF-Token` header to POST/PUT/PATCH/DELETE requests
  - **Silent Refresh:** Timer based on JWT `exp` claim from `/api/auth/me` response. Calls refresh at 50% of lifetime (12h), restarts timer with new expiry
  - **No localStorage:** JWT is in httpOnly cookie (not accessible by JS). Auth state tracked via `/api/auth/me` calls
- **Database:** N/A
- **Integrations:** N/A
- **Key files:**
  - `frontend/src/app/core/auth/auth.service.ts`
  - `frontend/src/app/core/auth/auth.guard.ts`
  - `frontend/src/app/core/interceptors/csrf.interceptor.ts`
  - `frontend/src/app/features/auth/pages/login.page.ts`
  - `frontend/src/app/features/auth/pages/verify.page.ts`
  - `frontend/src/app/features/auth/components/magic-link-form.component.ts`
  - `frontend/src/app/shared/components/button.component.ts`
  - `frontend/src/app/shared/components/input.component.ts`
  - `frontend/src/app/shared/components/card.component.ts`
  - `frontend/src/app/shared/components/navbar.component.ts`
  - `frontend/src/app/shared/components/badge.component.ts`
  - `frontend/src/app/shared/components/empty-state.component.ts`
  - `frontend/src/app/app.routes.ts`
  - `frontend/src/app/app.config.ts`
  - `frontend/src/styles/_variables.scss`
  - `frontend/src/environments/environment.ts`

## Acceptance Criteria
- [ ] AC1: Given the user navigates to `/login`, when they enter a valid email and click "Continue", then they see "Check your email" confirmation and the API call is made
- [ ] AC2: Given the user clicks a magic link in their email, when the verify page loads with the token, then the token is verified, cookies are set by the browser, and the user is redirected to profile setup (first login) or dashboard (returning) based on `isFirstLogin`
- [ ] AC3: Given a first-login user, when they complete profile setup (name + terms), then they are redirected to the onboarding wizard (placeholder route for now)
- [ ] AC4: Given an unauthenticated user navigates to `/dashboard`, when the route guard checks, then the user is redirected to `/login`
- [ ] AC5: Given the user clicks "Resend" on the verify page, when less than 60 seconds have passed, then the button is disabled with a countdown timer
- [ ] AC6: Given shared components are rendered, then they match the Aura style guide (colors, typography, spacing, border-radius, shadows)
- [ ] AC7: Given the user is authenticated, when they make a POST request, then the `X-CSRF-Token` header is automatically added by the CsrfInterceptor
- [ ] AC8: Given the user's JWT is at 50% of its lifetime, when the refresh timer fires, then `POST /api/auth/refresh` is called and a new JWT is set in cookies with fresh 24h expiry
- [ ] AC9: Given the user clicks logout, when the action completes, then cookies are cleared, local state is reset, and the user is redirected to `/login`
- [ ] AC10: Given the user navigates to the app with a valid `aura_session` cookie, when the app initializes, then `GET /api/auth/me` confirms authentication and the user sees the dashboard

## Related Items
- **PRD section:** 05-registration-onboarding.md (registration flow, US-R-01 through US-R-05)
- **Architecture:** 02-components.md (Host Dashboard), 05-security.md (JWT cookie storage)
- **Data model:** N/A

## Blockers
Blocked by: PSRP-001, PSRP-004

## Branch Name
`feature/PSRP-005-angular-scaffolding-and-auth-ui`

(End of file - total 71 lines)