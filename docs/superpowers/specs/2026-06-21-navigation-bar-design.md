# Design: NavigationBar (#79)

**Date:** 2026-06-21
**Status:** Approved (brainstorming) — pending implementation plan
**Issue:** #79 (T078 — Implement NavigationBar component)
**Scope:** Frontend only. Phase-7 polish: a consistent global top nav now that US1–US4 exist (notably `/trips` had no global way to reach it).

## Context
- `layout.tsx` is already a `'use client'` root layout wrapping `{children}` in `QueryClientProvider`. No nav exists today.
- Auth is just `localStorage['auth_token']` (set by `useLogin`/`useRegister` on success; read directly by `apiClient`'s interceptor). There is **no auth context and no logout helper**.
- Decision (approved): detect auth with a **lightweight localStorage read** in the nav, re-checked on route change — no new context, no refactor of the auth flows.

## Component
`frontend/src/components/shared/NavigationBar.tsx` — `'use client'`, props-less, single responsibility (global navigation). Tailwind v4 inline utilities (no config file), `lucide-react` icons, blue-600/gray palette matching existing components.

### Auth state
```tsx
const pathname = usePathname();
const router = useRouter();
const [token, setToken] = useState<string | null>(null);
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setToken(localStorage.getItem('auth_token'));
  setMounted(true);
}, [pathname]);
const isAuthed = !!token;
```
- Reads the token on mount and re-reads whenever `pathname` changes, so the nav flips after login / logout / navigation (login redirects via `router.push`, which changes `pathname`).
- The auth-dependent cluster renders **only when `mounted`** — server render and first client render both omit it, avoiding a hydration mismatch and a logged-out flash on authed pages.

### Logout
```tsx
function handleLogout() {
  localStorage.removeItem('auth_token');
  setToken(null);
  router.push('/');
}
```
Client-side only (the JWT is stateless; no logout API call).

### Links & layout
- **Left:** `StayHub` wordmark → `/` (`nav-home`); a Search shortcut (lucide `Search`) → `/` (`nav-search`).
- **Right (rendered only when `mounted`):**
  - authed → `My Trips` → `/trips` (`nav-trips`) + a `Log out` button (`nav-logout`, calls `handleLogout`).
  - not authed → `Log in` → `/login` (`nav-login`) + `Sign up` → `/register` (`nav-register`, primary-button style).
- **Active state:** derive from `usePathname()`; the link matching the current section gets active styling + `aria-current="page"` (e.g. My Trips active when `pathname` starts with `/trips`; Home active on `/`).
- **Mobile:** at `md:` and up, links show inline. Below `md:`, a hamburger (`Menu` icon, `nav-mobile-toggle`) toggles a stacked dropdown (`useState` open) containing the same links; selecting a link closes it.
- **Container:** sticky top bar — `sticky top-0 z-40 bg-white border-b border-gray-200`; `data-testid="navigation-bar"`.

### Integration
Render `<NavigationBar />` in `layout.tsx` inside `<body>` (within the existing `QueryClientProvider`), immediately before `{children}`. It appears on every route, including `/login` and `/register` (harmless — shows the logged-out cluster).

## Testing (vitest + RTL; mock `next/navigation`)
- Logged out (no token): `Log in` + `Sign up` visible; `My Trips`/`Log out` absent.
- Logged in (token in `localStorage`): `My Trips` + `Log out` visible; `Log in`/`Sign up` absent.
- Logout: clicking `Log out` removes `auth_token` and calls `router.push('/')`.
- Active state: with `usePathname` = `/trips`, the My Trips link is marked active (`aria-current="page"`).
- Mobile: clicking `nav-mobile-toggle` reveals the mobile menu panel.

**No new Playwright journey:** the nav is a global presentational component; existing E2E journeys navigate via direct routes/buttons and are unaffected. (The added `data-testid`s are available for future E2E use.)

## Out of scope
- No auth context / no refactor of `authService`, login, or register.
- No logout API call (stateless JWT, client-side clear only).
- No per-route hiding of the nav (it shows everywhere).
- No notifications/avatar/user-menu — just the links the AC lists.

## Self-review
- Placeholder scan: none. Consistent: auth detection, logout, links, and tests all align. Scoped to one component + a one-line layout edit. Ambiguities resolved: auth via localStorage-read (approved); Search shortcut → `/`; nav shows on all routes; logout → `/`.
