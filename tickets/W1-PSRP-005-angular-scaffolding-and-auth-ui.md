## PSRP-005: feat(frontend): angular-scaffolding-and-auth-ui

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001, PSRP-004

## Feature Summary
Set up the Angular 22 frontend with the complete design system (shared components following the Aura style guide), authentication UI (login page with magic link form, verification page, profile setup modal), auth guard for protected routes, auth HTTP interceptor for JWT cookie handling, and the application shell (navbar, layout). This establishes the frontend foundation and completes the auth flow end-to-end.

## Requirements
- [ ] Create shared UI components following style guide: ButtonComponent (primary, secondary, ghost, danger variants), InputComponent (label, error state), CardComponent, BadgeComponent (pending, confirmed, cancelled), EmptyStateComponent, NavbarComponent
- [ ] Configure global styles with CSS custom properties from style guide: colors, typography (Playfair Display + Inter), spacing, border-radius, shadows
- [ ] Implement `AuthService` in `app/core/auth/` with methods: `requestMagicLink(email)`, `verifyToken(token)`, `setupProfile(profile)`, `isAuthenticated()`, `logout()`
- [ ] Implement `AuthInterceptor` to attach auth cookies and handle 401 responses (redirect to login)
- [ ] Implement `AuthGuard` (canActivate) to protect routes requiring authentication
- [ ] Implement login page (`features/auth/pages/login.page.ts`) with email input and "Continue" button
- [ ] Implement verify page (`features/auth/pages/verify.page.ts`) that reads token from URL query params, calls verify endpoint, redirects to profile setup or dashboard
- [ ] Implement profile setup modal (name, terms acceptance, marketing opt-in, timezone auto-detect)
- [ ] Configure app routes: `/login`, `/verify`, `/dashboard` (guarded), `/accomplice/:token` (separate guard)
- [ ] Implement magic link resend with 60-second cooldown timer
- [ ] Configure Angular environment files (environment.ts, environment.prod.ts) with API base URL
- [ ] Write component tests for auth flow (login form validation, verify page token handling)

## Technical Notes
- **Backend:** Consumes `POST /api/auth/magic-link`, `GET /api/auth/verify`, `POST /api/auth/profile` from PSRP-004
- **Frontend:** 
  - Standalone components (no NgModules)
  - Angular Signals for reactive state
  - New control flow (@if, @for, @switch)
  - Typed reactive forms
  - inject() function for DI
- **Database:** N/A
- **Integrations:** N/A
- **Key files:**
  - `frontend/src/app/core/auth/auth.service.ts`
  - `frontend/src/app/core/auth/auth.guard.ts`
  - `frontend/src/app/core/interceptors/auth.interceptor.ts`
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
- [ ] AC2: Given the user clicks a magic link in their email, when the verify page loads with the token, then the token is verified and the user is redirected to profile setup (first login) or dashboard (returning)
- [ ] AC3: Given a first-login user, when they complete profile setup (name + terms), then they are redirected to the onboarding wizard (placeholder route for now)
- [ ] AC4: Given an unauthenticated user navigates to `/dashboard`, when the route guard checks, then the user is redirected to `/login`
- [ ] AC5: Given the user clicks "Resend" on the verify page, when less than 60 seconds have passed, then the button is disabled with a countdown timer
- [ ] AC6: Given shared components are rendered, then they match the Aura style guide (colors, typography, spacing, border-radius, shadows)

## Related Items
- **PRD section:** 05-registration-onboarding.md (registration flow, US-R-01 through US-R-05)
- **Architecture:** 02-components.md (Host Dashboard), 05-security.md (JWT cookie storage)
- **Data model:** N/A

## Blockers
Blocked by: PSRP-001, PSRP-004

## Branch Name
`feature/PSRP-005-angular-scaffolding-and-auth-ui`
