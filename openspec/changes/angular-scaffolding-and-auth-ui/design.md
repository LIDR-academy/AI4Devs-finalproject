## Context

With the backend authentication system in place (PSRP-001, PSRP-004), the frontend application needs a foundational shell, a design system integration, and a complete end-to-end authentication flow. This sets up Angular 22 as the chosen framework and enables users to log in, verify sessions, and manage their session lifecycle securely using HTTP-only cookies.

## Goals / Non-Goals

**Goals:**
- Set up the Angular 22 application shell and routing architecture.
- Implement standalone components, reactive forms, and Angular Signals for state management.
- Implement a cookie-based authentication flow (magic links, verification, silent refresh).
- Integrate Aura style guide via CSS custom properties.

**Non-Goals:**
- Full implementation of the main application dashboards (only basic routing).
- Direct JWT storage in localStorage (security risk, explicitly avoided).

## Decisions

- **Cookie-Based Authentication:** Use HTTP-only cookies for JWT storage instead of `localStorage`. 
  *Rationale:* Mitigates XSS risks and simplifies request interception since the browser automatically handles session cookies.
- **Angular 22 Standalone Components:** Build all new features using standalone components.
  *Rationale:* Removes `NgModule` boilerplate, aligning with modern Angular best practices.
- **Signals for State Management:** Use Angular Signals instead of RxJS BehaviorSubjects for local component state.
  *Rationale:* Signals provide a more reactive, less error-prone approach to UI updates in Angular 22.
- **CsrfInterceptor Implementation:** Create an HTTP interceptor to append the `X-CSRF-Token` header for state-changing requests.
  *Rationale:* Required by the backend API to prevent Cross-Site Request Forgery (CSRF) attacks in a cookie-based auth setup.

## Risks / Trade-offs

- **Risk:** Silent refresh timing could fail if the browser tabs are inactive or backgrounded.
  - *Mitigation:* Catch 401 errors globally in the HTTP interceptor and redirect the user to `/login` to recover gracefully.
- **Risk:** First-party cookie configuration limits cross-origin API calls.
  - *Mitigation:* Ensure frontend and backend are served on the same domain or configure CORS properly with `credentials: true`.
