# Frontend Implementation Plan: US-F1 Responsive Hamburger Nav

## Overview

Fix mobile / narrow-viewport navigation overflow by replacing the always-visible horizontal `RoleNav` strip with a **hamburger + side drawer below `md` (768px)** while keeping the current horizontal tabs at **`≥ md`**. Same ADMIN / MECHANIC destinations and Spanish labels; no new API or npm dependencies.

**Architecture principles:** shared client shell (`AppChrome`) owns open state so header and drawer stay in sync without duplicating logic across five layouts; extract nav item constants once; Tailwind-only drawer (no Radix/Headless); a11y (`aria-label` ES, Escape, focus return); Playwright for viewport smoke.

**User story:** [`us/fixes/US-F1-nav-hamburguesa-responsive.md`](../../us/fixes/US-F1-nav-hamburguesa-responsive.md)

**Backend plan:** N/A — pure UI shell; depends only on existing auth (`useAuth`).

**Prerequisites:** Auth working (US-001). Implement on **`finalproject-RFM` only** (product mandate — do **not** create `feature/US-F1-frontend` unless the user explicitly asks).

**Out of scope:** Bottom tabs, table responsive (US-F2+), PWA, dark mode, new drawer libraries, redesign of brand/header beyond menu control + padding.

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router (`'use client'` layouts already) |
| Styling | Tailwind 3.4 + `cn` |
| Auth | `useAuth` (existing) |
| E2E | Playwright (`apps/web/e2e`) — **not** Cypress |

### Gap today

- Five layouts always render `<AppHeader />` then `<RoleNav />`.
- `RoleNav` is a single-row `flex gap-1` with no `md:` / overflow rules → horizontal scroll and clipped nav background on ~375px.
- `AppHeader` has no menu control.

### Chosen architecture (preferred)

Introduce **`AppChrome`**: one client component that owns `menuOpen`, renders header (with hamburger `< md`), desktop `RoleNav` (`hidden md:block`), and `MobileNavDrawer`. Each protected layout mounts:

```tsx
<ProtectedRoute …>
  <AppChrome maxWidth="max-w-6xl">{/* or max-w-5xl for mechanic */}</AppChrome>
</ProtectedRoute>
```

**Fallback MVP** (only if chrome refactor is blocked): put hamburger + drawer inside `RoleNav` under `md:hidden` and hide the horizontal strip with `hidden md:flex` — no layout file changes. Prefer `AppChrome` so logout and brand stay visible and state lives in one place.

### Drawer UX (locked defaults)

| Concern | Decision |
|---------|----------|
| Breakpoint | Tailwind `md` = 768px |
| Panel side | **Left** |
| Width | `min(20rem, 85vw)` (`w-[min(20rem,85vw)]`) |
| Overlay | `bg-slate-900/40`, `z-40`; panel `z-50` |
| Transition | ~200ms translate / opacity |
| Body scroll | `document.body.style.overflow = 'hidden'` while open |
| Resize | Close drawer when crossing to `≥ md` |

### Nav items (unchanged product copy)

| Role | Links |
|------|-------|
| ADMIN | Panel, Usuarios, Listos para entrega, Clientes, Vehículos, Nueva OT |
| MECHANIC | Panel, Clientes, Vehículos, Nueva OT |

Active: `pathname === href \|\| pathname.startsWith(href + '/')`.

### Files to add/modify

```
apps/web/src/shared/components/
  nav-items.ts              # NEW — ADMIN_NAV, MECHANIC_NAV, NavItem type
  MobileNavDrawer.tsx       # NEW — overlay + panel + Escape + focus
  AppChrome.tsx             # NEW — header + RoleNav + drawer + menu state
  AppHeader.tsx             # MOD — optional menu button props (md:hidden)
  RoleNav.tsx               # MOD — import items; desktop-only strip (hidden md:block / md:flex)

apps/web/src/app/admin/layout.tsx
apps/web/src/app/mechanic/layout.tsx
apps/web/src/app/clients/layout.tsx
apps/web/src/app/vehicles/layout.tsx
apps/web/src/app/work-orders/layout.tsx
                            # MOD — AppHeader+RoleNav → AppChrome; main px-4 md:px-6

apps/web/e2e/mobile-nav.spec.ts   # NEW — viewport 390×844 smoke
apps/web/README.md                # MOD — brief responsive nav note (optional short)
```

### Routing

No new routes. Drawer links reuse existing paths.

### State management

- Local React `useState` for `menuOpen` inside `AppChrome` only.
- No React Query, no URL query for menu, no global store.
- Close on: link click, Escape, overlay click, close button, toggle, resize to `≥ md`.

---

## Implementation Steps

### Step 0: Feature Branch — **SKIP (stay on `finalproject-RFM`)**

- **Action:** Do **not** create `feature/US-F1-frontend`. Work stays on **`finalproject-RFM`**.
- **Implementation steps:**
  1. Confirm branch: `git branch --show-current` → `finalproject-RFM`.
  2. Pull if needed: `git pull origin finalproject-RFM` (only if remote is ahead and user wants sync).
  3. Proceed with code changes on this branch.
- **Notes:** Overrides the generic ai-specs Step 0 naming. User mandate: no more branch switches for this delivery line. If `/develop-frontend` later suggests a feature branch, **ignore** that checkout unless the user reverses this rule.

### Step 1: Extract shared nav items

- **File:** `apps/web/src/shared/components/nav-items.ts`
- **Action:** Move `ADMIN_NAV` / `MECHANIC_NAV` out of `RoleNav.tsx`.
- **Signature:**

```ts
export type NavItem = { href: string; label: string };

export const ADMIN_NAV: NavItem[];
export const MECHANIC_NAV: NavItem[];

export function getNavItemsForRole(role: 'ADMIN' | 'MECHANIC'): NavItem[];
export function getNavAriaLabel(role: 'ADMIN' | 'MECHANIC'): string;
```

- **Implementation steps:**
  1. Copy arrays exactly (Spanish labels unchanged).
  2. Export helpers used by `RoleNav` and `MobileNavDrawer`.
  3. Update `RoleNav` imports; delete inline constants.
- **Dependencies:** none beyond types.
- **Notes:** Single source of truth prevents desktop/mobile drift.

### Step 2: Implement `MobileNavDrawer`

- **File:** `apps/web/src/shared/components/MobileNavDrawer.tsx`
- **Action:** Controlled drawer for authenticated mobile nav.
- **Signature:**

```tsx
type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  ariaLabel: string; // 'Administración' | 'Mecánico'
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
};

export function MobileNavDrawer(props: MobileNavDrawerProps): JSX.Element | null;
```

- **Implementation steps:**
  1. Render nothing interactive when `!open` (or keep in DOM with `invisible` / `pointer-events-none` — prefer mount overlay only when open for simplicity).
  2. Overlay button/div: click → `onClose`; `aria-hidden` on decorative overlay if using a separate close control.
  3. Panel `id="mobile-nav-drawer"`: column of `Link`s; active styles with left border or `bg-blue-50 text-blue-700` (full-width continuous background — no clipped strip).
  4. Close control: button with `aria-label="Cerrar menú"`.
  5. `useEffect` on `open`: listen `keydown` Escape → `onClose`; lock `body` overflow; on cleanup restore overflow and focus `returnFocusRef`.
  6. Each `Link` `onClick` → `onClose` after navigation starts.
  7. Use `cn` + Tailwind only; no new packages.
- **Dependencies:** `next/link`, `usePathname`, `cn`, `nav-items` types.
- **Notes:** Panel from **left**. Do not trap focus with a heavy library; Escape + return focus is the a11y bar for this US.

### Step 3: Extend `AppHeader` for menu control

- **File:** `apps/web/src/shared/components/AppHeader.tsx`
- **Action:** Optional controlled hamburger for `< md`.
- **Signature:**

```tsx
type AppHeaderProps = {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  maxWidthClassName?: string; // e.g. 'max-w-6xl' | 'max-w-5xl'
};

export function AppHeader(props?: AppHeaderProps): JSX.Element;
```

- **Implementation steps:**
  1. Keep brand + `user.fullName` + `LogoutButton`.
  2. When `onMenuToggle` provided **and** `user` present: render menu button `md:hidden` with:
     - `aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}`
     - `aria-expanded={menuOpen}`
     - `aria-controls="mobile-nav-drawer"`
     - simple SVG hamburger / X (inline), not emoji-only without aria.
  3. Padding: `px-4 md:px-6`; honor `maxWidthClassName` (default `max-w-5xl` to match today, or pass from chrome).
  4. Layout: `[brand | spacer] [menu button] [Logout]` — logout must remain visible on mobile.
- **Dependencies:** `useAuth`, `LogoutButton`, `cn`.
- **Notes:** Without `onMenuToggle`, header behaves as today (safe for any stray usage).

### Step 4: Make `RoleNav` desktop-only

- **File:** `apps/web/src/shared/components/RoleNav.tsx`
- **Action:** Horizontal strip only at `≥ md`; import shared items.
- **Implementation steps:**
  1. Import `getNavItemsForRole` / arrays from `nav-items.ts`.
  2. Outer wrapper: keep `border-b bg-white`; add `hidden md:block` so the whole strip is gone on mobile (eliminates scroll-x cause).
  3. Inner nav: `flex gap-1 px-4 md:px-6` + existing active styles.
  4. Accept optional `maxWidthClassName` prop if needed by `AppChrome` (ADMIN `max-w-6xl`, MECHANIC `max-w-5xl`) — today hardcoded; move that decision into chrome or keep role-based logic inside `RoleNav`.
- **Notes:** Unauthenticated → still `return null`.

### Step 5: Create `AppChrome` and wire five layouts

- **Files:**
  - `apps/web/src/shared/components/AppChrome.tsx` (NEW)
  - `apps/web/src/app/admin/layout.tsx`
  - `apps/web/src/app/mechanic/layout.tsx`
  - `apps/web/src/app/clients/layout.tsx`
  - `apps/web/src/app/vehicles/layout.tsx`
  - `apps/web/src/app/work-orders/layout.tsx`
- **Action:** Single shell for header + nav + drawer + main children.
- **Signature:**

```tsx
type AppChromeProps = {
  children: React.ReactNode;
  maxWidthClassName?: string; // default max-w-6xl for admin-ish; mechanic layout passes max-w-5xl
};

export function AppChrome({ children, maxWidthClassName = 'max-w-6xl' }: AppChromeProps): JSX.Element;
```

- **Implementation steps:**
  1. `const [menuOpen, setMenuOpen] = useState(false)`.
  2. `menuButtonRef` for focus return.
  3. `useEffect` on `window.resize` / `matchMedia('(min-width: 768px)')`: if matches and `menuOpen`, set false.
  4. Resolve items from `user.role` via `nav-items`; if no user, do not show hamburger (header still OK).
  5. Render structure:

```tsx
<div className="min-h-screen bg-slate-50">
  <AppHeader
    menuOpen={menuOpen}
    onMenuToggle={() => setMenuOpen((o) => !o)}
    menuButtonRef={menuButtonRef}
    maxWidthClassName={maxWidthClassName}
  />
  <RoleNav /> {/* or pass maxWidth */}
  <MobileNavDrawer
    open={menuOpen}
    onClose={() => setMenuOpen(false)}
    items={items}
    ariaLabel={…}
    returnFocusRef={menuButtonRef}
  />
  <main className={cn('mx-auto py-8 px-4 md:px-6', maxWidthClassName)}>
    {children}
  </main>
</div>
```

  6. Replace each layout’s inner shell with `<AppChrome maxWidthClassName="…">{children}</AppChrome>` inside existing `ProtectedRoute`.
  7. Preserve `allowedRoles` per layout unchanged.
- **Dependencies:** header, RoleNav, drawer, auth, `cn`.
- **Notes:** Mechanic layout today uses `max-w-5xl` on main in some places — match existing per-layout widths when replacing.

### Step 6: Playwright mobile nav smoke

- **File:** `apps/web/e2e/mobile-nav.spec.ts`
- **Action:** Authenticated admin smoke at mobile viewport (reuse admin `storageState` project pattern).
- **Implementation steps:**
  1. Register project in `playwright.config.ts` **or** set viewport inside the describe:

```ts
test.use({ viewport: { width: 390, height: 844 } });
```

  2. Cases (admin storage):
     - Goto `/admin/dashboard`.
     - Expect `getByRole('button', { name: 'Abrir menú' })` visible.
     - Expect horizontal nav landmark links not forcing page `scrollWidth > clientWidth` attributable to nav (assert `document.documentElement.scrollWidth <= window.innerWidth + 1` after load, or assert desktop nav container not visible).
     - Open menu → expect link `Clientes` → click → URL `/clients` → drawer closed (Abrir menú again / Cerrar gone).
     - Optional: open → Escape → closed; overlay click closes.
  3. Desktop smoke (optional second describe with viewport 1280×720): Abrir menú **not** visible; link Panel still in horizontal nav.
  4. Do **not** add Cypress.
- **Notes:** Align with existing admin auth setup (`e2e/.auth/admin.json`). If config needs a dedicated project, keep it minimal.

### Step 7: Update Technical Documentation

- **Action:** Mandatory short English docs update.
- **Implementation steps:**
  1. Add a short “Responsive navigation” note to `apps/web/README.md` (hamburger `< md`, horizontal `≥ md`, no new deps).
  2. Optionally one line in root `readme.md` frontend UX section if such a section already exists — do not invent large new docs.
  3. Do **not** change `docs/api-spec.yml` (no API).
  4. No change to `docs/frontend-standards.mdc` unless you introduce a reusable pattern worth standardizing; a README note is enough for this fix.
- **References:** `docs/documentation-standards.mdc` (English technical artifacts; Spanish UI strings in code as product copy).

---

## Implementation Order

1. Step 0 — Stay on `finalproject-RFM` (no feature branch).
2. Step 1 — Extract `nav-items.ts`.
3. Step 2 — `MobileNavDrawer`.
4. Step 3 — `AppHeader` menu props.
5. Step 4 — `RoleNav` desktop-only + shared items.
6. Step 5 — `AppChrome` + five layouts + mobile padding.
7. Step 6 — Playwright `mobile-nav.spec.ts`.
8. Step 7 — Documentation.

---

## Testing Checklist

- [ ] Manual 375×667 / 390×844: no horizontal scroll from nav; hamburger opens full-height panel with continuous background.
- [ ] Manual: open → Clientes navigates and closes drawer.
- [ ] Manual: Escape, overlay, close button, toggle all close; focus returns to hamburger.
- [ ] Manual 1280px: horizontal tabs as today; no hamburger.
- [ ] Manual resize open drawer from 390 → 1280: drawer closes.
- [ ] Manual ADMIN vs MECHANIC: correct link sets.
- [ ] Manual unauthenticated `/login`: no hamburger / no RoleNav.
- [ ] Logout still visible and usable on mobile with menu open/closed.
- [ ] Playwright `mobile-nav` green (`npm run test:e2e` from `apps/web`, scoped if needed).
- [ ] No new packages in `apps/web/package.json`.

---

## Error Handling Patterns

- No API calls in this US — no service error mapping.
- If `user` is null, chrome must not crash: no menu button, no drawer items, `RoleNav` null.
- Drawer should not leave `body` overflow locked if component unmounts mid-open (cleanup in `useEffect`).

---

## UI/UX Considerations

- **Responsive:** `md` breakpoint is the only switch; no intermediate “tablet tabs + hamburger”.
- **A11y:** Spanish `aria-label`s; `aria-expanded`; `aria-controls="mobile-nav-drawer"`; Escape; focus return. Full focus trap is nice-to-have, not required.
- **Visual:** Active item clear contrast; panel background continuous; avoid purple/glow redesign — stay on existing slate/blue language.
- **Motion:** Short 200ms slide/fade; avoid noisy animations.
- **Loading:** N/A (instant client state).
- **Copy:** UI Spanish; component/file names English.

---

## Dependencies

| Dependency | Required? |
|------------|-----------|
| New npm packages | **No** |
| Backend / OpenAPI | **No** |
| Playwright (existing) | Yes for Step 6 |
| Radix / Headless UI | **Do not add** |

---

## Notes

- Branch: **`finalproject-RFM` only**.
- Language: technical artifacts English; visible strings Spanish per product.
- TypeScript throughout; match existing shared component style.
- Do not “fix” dense tables’ own horizontal scroll in this ticket.
- Evidence of bug: mobile screenshot 2026-08-13 (nav background cut off + page scroll-x).

---

## Next Steps After Implementation

1. Run `/develop-frontend` against this plan **without** checking out a new feature branch.
2. Manual smoke on real phone or DevTools device mode.
3. Commit on `finalproject-RFM` when user requests (not automatically).
4. Optionally file **US-F2** for responsive tables (delivery / users) if still painful on mobile.

---

## Implementation Verification

- [ ] Code quality: shared items, no duplicated ADMIN/MECHANIC arrays, Tailwind-only drawer
- [ ] Functionality: AC from enhanced US-F1 met
- [ ] Testing: Playwright smoke + manual matrix above
- [ ] Integration: all five layouts use `AppChrome`; no orphan `AppHeader`+`RoleNav` pairs left in those layouts
- [ ] Documentation: `apps/web/README.md` (and optional root readme note) updated in English
- [ ] Branch: still `finalproject-RFM`
