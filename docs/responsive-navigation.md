# Responsive navigation (US-F1)

English technical note for the authenticated web shell after the mobile hamburger fix.

## Summary

On viewports **below Tailwind `md` (768px)**, MecaTrack shows a header hamburger that opens a **left drawer** with the same role links as the desktop strip. At **`md` and above**, the existing horizontal `RoleNav` tabs remain and the hamburger/drawer stay hidden.

This removes horizontal page scroll caused by a single-row nav on phones / narrow windows.

## Implementation

| Piece | Path | Role |
|-------|------|------|
| Shared link lists | `apps/web/src/shared/components/nav-items.ts` | `ADMIN_NAV` / `MECHANIC_NAV` |
| Shell | `apps/web/src/shared/components/AppChrome.tsx` | Owns `menuOpen`; wires header + nav + drawer + main |
| Header | `apps/web/src/shared/components/AppHeader.tsx` | Brand, logout, optional hamburger (`md:hidden`) |
| Desktop nav | `apps/web/src/shared/components/RoleNav.tsx` | Horizontal tabs (`hidden md:block`) |
| Mobile drawer | `apps/web/src/shared/components/MobileNavDrawer.tsx` | Overlay, Escape, body scroll lock, focus return |

Protected layouts under `admin`, `mechanic`, `clients`, `vehicles`, and `work-orders` mount `<AppChrome>`.

**No new npm UI libraries.** No API or Prisma changes.

## Tests

- Playwright: `apps/web/e2e/mobile-nav.spec.ts` (project `chromium-mobile-nav`)
- Operator detail (English): [`apps/web/README.md`](../apps/web/README.md#responsive-navigation-us-f1)

## References

- Story: [`us/fixes/US-F1-nav-hamburguesa-responsive.md`](../us/fixes/US-F1-nav-hamburguesa-responsive.md)
- Frontend plan: [`docs/plans/US-F1_frontend.md`](plans/US-F1_frontend.md)
