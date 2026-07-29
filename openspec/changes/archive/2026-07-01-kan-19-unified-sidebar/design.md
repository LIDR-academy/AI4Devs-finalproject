## Context

Authenticated pages each render their own horizontal nav. PRD requires a fixed left sidebar with nine destinations on every screen.

## Goals / Non-Goals

**Goals:** One `Sidebar` in `AppLayout`; all sitemap links on every page; active route styling; WCAG keyboard nav.

**Non-goals:** Feature implementation for placeholder routes; mobile collapse (desktop-first MVP).

## Decisions

1. **React Router nested layout** — `AppLayout` route with child routes and `<Outlet />`.
2. **Central `APP_NAV_ITEMS`** in `config/navigation.ts` — single source for labels and paths.
3. **Placeholder pages** — minimal "Coming soon" for unimplemented modules so links are real routes.
4. **Sidebar styling** — `.app-sidebar` scopes overrides for `SidebarItem` on primary (Veranda blue) background; active item uses white surface + primary text.

## Risks / Trade-offs

- **[Risk] Placeholder routes confuse users** → Mitigation: clear "Coming soon" copy; real modules replace placeholders in later KAN tickets.

## Migration Plan

1. Add layout + sidebar.
2. Nest existing routes under layout.
3. Delete page-level nav markup/CSS where unused.

## Open Questions

- None.
