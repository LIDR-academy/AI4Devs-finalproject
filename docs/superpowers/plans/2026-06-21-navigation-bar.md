# NavigationBar Implementation Plan (#79)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) tracking.

**Goal:** A global, auth-aware, responsive `NavigationBar` rendered on every page (StayHub wordmark + search shortcut + auth-gated My Trips/Log out vs Log in/Sign up + mobile hamburger + active-state).

**Architecture:** A single `'use client'` presentational component that reads `localStorage['auth_token']` on mount and on every route change (`usePathname`) to decide auth state; logout clears the token and navigates home. Rendered once in `layout.tsx`. Tailwind v4 inline utilities, `lucide-react` icons. No auth context, no auth-flow refactor (per the approved design).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, lucide-react; vitest + RTL.

**Scope:** Spec `docs/superpowers/specs/2026-06-21-navigation-bar-design.md`. Issue #79. Branch `issue-79-navigation-bar` (already created; design committed there). One PR.

**Convention:** `.tsx` files start with `import React from 'react'`.

---

### Task 1: NavigationBar component + tests

**Files:**
- Create: `frontend/src/components/shared/NavigationBar.tsx`
- Test: `frontend/src/components/shared/NavigationBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/NavigationBar.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const push = vi.fn();
let pathname = '/';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

import { NavigationBar } from './NavigationBar';

describe('NavigationBar', () => {
  beforeEach(() => {
    push.mockClear();
    pathname = '/';
    localStorage.clear();
  });

  it('shows Log in and Sign up when logged out', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.getByTestId('nav-register')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-trips')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-logout')).not.toBeInTheDocument();
  });

  it('shows My Trips and Log out when logged in', () => {
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-trips')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logout')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();
  });

  it('logs out: clears the token and navigates home', async () => {
    const user = userEvent.setup();
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    await user.click(screen.getByTestId('nav-logout'));
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(push).toHaveBeenCalledWith('/');
  });

  it('marks My Trips active on /trips', () => {
    pathname = '/trips';
    localStorage.setItem('auth_token', 'jwt');
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-trips')).toHaveAttribute('aria-current', 'page');
  });

  it('toggles the mobile menu', async () => {
    const user = userEvent.setup();
    render(<NavigationBar />);
    expect(screen.queryByTestId('nav-mobile-menu')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('nav-mobile-toggle'));
    expect(screen.getByTestId('nav-mobile-menu')).toBeInTheDocument();
  });
});
```

Note: jsdom ignores Tailwind responsive classes (so the `hidden md:flex` desktop cluster is in the DOM). These tests query the desktop cluster while the mobile menu is closed, so each `data-testid` matches exactly once — keep the menu-open test asserting only the panel container (`nav-mobile-menu`), not the inner links.

- [ ] **Step 2: Run, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/shared/NavigationBar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — create `frontend/src/components/shared/NavigationBar.tsx`:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

const AUTH_TOKEN_KEY = 'auth_token';

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Read auth on mount and on every route change; close the mobile menu on nav.
  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
    setMounted(true);
    setMenuOpen(false);
  }, [pathname]);

  const isAuthed = !!token;

  function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setMenuOpen(false);
    router.push('/');
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
    }`;

  // Auth-dependent links, reused by the desktop row and the mobile panel.
  const authLinks = (onNavigate?: () => void) =>
    isAuthed ? (
      <>
        <Link
          href="/trips"
          onClick={onNavigate}
          data-testid="nav-trips"
          aria-current={isActive('/trips') ? 'page' : undefined}
          className={linkClass('/trips')}
        >
          My Trips
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          data-testid="nav-logout"
          className="text-left text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Log out
        </button>
      </>
    ) : (
      <>
        <Link
          href="/login"
          onClick={onNavigate}
          data-testid="nav-login"
          aria-current={isActive('/login') ? 'page' : undefined}
          className={linkClass('/login')}
        >
          Log in
        </Link>
        <Link
          href="/register"
          onClick={onNavigate}
          data-testid="nav-register"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign up
        </Link>
      </>
    );

  return (
    <nav
      data-testid="navigation-bar"
      className="sticky top-0 z-40 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: brand + search */}
        <div className="flex items-center gap-4">
          <Link href="/" data-testid="nav-home" className="text-lg font-bold text-blue-600">
            StayHub
          </Link>
          <Link
            href="/"
            data-testid="nav-search"
            aria-label="Search"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
          </Link>
        </div>

        {/* Desktop auth cluster */}
        {mounted && (
          <div className="hidden items-center gap-5 md:flex">{authLinks()}</div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="text-gray-600 hover:text-gray-900 md:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mounted && menuOpen && (
        <div
          data-testid="nav-mobile-menu"
          className="flex flex-col items-start gap-3 border-t border-gray-200 px-4 py-3 md:hidden"
        >
          {authLinks(() => setMenuOpen(false))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/shared/NavigationBar.test.tsx`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(nav): NavigationBar component (auth-aware, responsive, active-state) (#79)"
```

---

### Task 2: Render NavigationBar in the root layout + verify + PR

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Wire it into the layout**

In `frontend/src/app/layout.tsx`, add the import and render `<NavigationBar />` inside the `QueryClientProvider`, before `{children}`:

```tsx
import { NavigationBar } from "@/components/shared/NavigationBar";
```
and change the provider body from:
```tsx
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
```
to:
```tsx
        <QueryClientProvider client={queryClient}>
          <NavigationBar />
          {children}
        </QueryClientProvider>
```

- [ ] **Step 2: Full suite + build**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test 2>&1 | tail -6 && npm run build 2>&1 | tail -12`
Expected: all vitest tests pass (existing + 5 new); `next build` compiles successfully (the new component is type/lint clean). Existing page tests render page components directly (not through the layout), so they are unaffected by the global nav.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(nav): render NavigationBar globally in root layout (#79)"
```

- [ ] **Step 4: Push + PR**

```bash
git push -u origin issue-79-navigation-bar
gh pr create --title "NavigationBar — global auth-aware top nav (#79)" --body "<summary: global NavigationBar in layout — StayHub wordmark + search shortcut + auth-gated My Trips/Log out vs Log in/Sign up + mobile hamburger + active-state. Auth via lightweight localStorage read (re-checked on route change); logout clears token + navigates home. No auth context/refactor. vitest for the component; next build clean. No new Playwright journey (global presentational component; existing journeys navigate via direct routes). Design: docs/superpowers/specs/2026-06-21-navigation-bar-design.md>"
```

- [ ] **Step 5: Report** test counts, build result, PR URL. Do NOT close the issue (the user closes it).

---

## Self-review
- **Spec coverage:** wordmark→/ (nav-home ✓), search shortcut→/ (nav-search ✓), auth-gated My Trips (✓), Log out (✓), Log in/Sign up when logged out (✓), mobile hamburger + panel (✓), active-state + aria-current (✓), lightweight localStorage auth read re-checked on pathname (✓), logout clears token + router.push('/') (✓), rendered globally in layout (Task 2 ✓), no auth context/refactor (✓). Tests cover logged-out, logged-in, logout, active-state, mobile toggle (✓). No new Playwright (per spec).
- **Placeholder scan:** complete code; no TBD/TODO.
- **Identifier consistency:** `AUTH_TOKEN_KEY='auth_token'`; testids `navigation-bar`/`nav-home`/`nav-search`/`nav-trips`/`nav-logout`/`nav-login`/`nav-register`/`nav-mobile-toggle`/`nav-mobile-menu`; `authLinks(onNavigate?)` reused desktop+mobile; `mounted` gates auth clusters. Layout import path `@/components/shared/NavigationBar` matches the created file.
