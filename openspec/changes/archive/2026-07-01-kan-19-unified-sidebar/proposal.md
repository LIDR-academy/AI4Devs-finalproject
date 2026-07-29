## Why

Navigation is duplicated and inconsistent across pages (different links, styles, missing Reading Stats on Book Tracker). KAN-19 delivers PRD §4 / README §1.3: one fixed left sidebar for the entire authenticated app.

## What Changes

- **`AppLayout`** with fixed Veranda blue sidebar + main content `<Outlet />`.
- **`Sidebar`** component using KAN-18 `SidebarItem` and a single `navigation.ts` sitemap.
- **Nested routes** in `App.tsx` — all authenticated pages share the layout.
- **Remove** per-page top nav from Home, Book Tracker, Lists, Reading Stats.
- **Placeholder pages** for Goals, Library, Recap/Insights, Import/Export, Profile (links present; full features in later tickets).

**Non-goals:** Restyling page content (Phase 3), implementing Goals/Library/etc. features.

## Capabilities

### New Capabilities

- `unified-sidebar-nav`: fixed left sidebar, sitemap links, active state, layout shell, a11y.

### Modified Capabilities

*(none at spec level — page content requirements unchanged)*

## Impact

- **Frontend:** `components/layout/`, `config/navigation.ts`, `App.tsx`, page header cleanup.
- **Depends on:** KAN-18 (`SidebarItem`, design tokens).
- **Product refs:** KAN-19, PRD §4, README §1.3.
