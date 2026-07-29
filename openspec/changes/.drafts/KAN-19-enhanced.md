## Original

**KAN-19:** Sidebar fija unificada e idéntica en todas las páginas  
**Priority:** Highest · **Depends on:** KAN-18

Fixed left sidebar (Veranda blue), common to entire app, with links to Home, Book Tracker, Reading Stats, Lists, Goals, Library, Recap/Insights, Import/Export, Profile/Settings. Same component on every page; active state; keyboard + WCAG AA.

## Enhanced

### Problem

Each page implements its own top nav with different links and styles (Home has 4 links, Book Tracker missing Reading Stats, etc.).

### Solution

- **`AppLayout`** wraps authenticated routes; renders **`<Sidebar>`** + `<Outlet />`.
- **`navigation.ts`** single sitemap config consumed by Sidebar.
- Remove per-page `<nav>` blocks from Home, Book Tracker, Lists, Stats.
- Placeholder routes for not-yet-built modules (Goals, Library, Recap, Import/Export, Profile) so all links exist everywhere.

### Routes

| Label | Path | Status |
|-------|------|--------|
| Home | `/` | existing |
| Book Tracker | `/book-tracker` | existing |
| Reading Stats | `/stats` | existing |
| Lists | `/lists` | existing |
| Goals | `/goals` | placeholder |
| Library | `/library` | placeholder |
| Recap / Insights | `/recap` | placeholder |
| Import / Export | `/import-export` | placeholder |
| Profile / Settings | `/profile` | placeholder |

### Files

```
frontend/src/config/navigation.ts
frontend/src/components/layout/AppLayout.tsx
frontend/src/components/layout/AppLayout.css
frontend/src/components/layout/Sidebar.tsx
frontend/src/components/layout/Sidebar.css
frontend/src/pages/PlaceholderPage.tsx
frontend/src/App.tsx                    # nested layout routes
frontend/src/pages/*Page.tsx            # remove inline nav
```

### DoD

- [ ] Same Sidebar on all authenticated pages
- [ ] Veranda blue `#6BB1AD` sidebar background
- [ ] Active route highlighted
- [ ] All 9 sitemap links present
- [ ] `nav` landmark, keyboard focus, ARIA
- [ ] `npm run build` passes
