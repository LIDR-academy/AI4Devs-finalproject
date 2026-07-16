---
feature: navigation-menus
story: user-stories/in-progress/navigation-menus.md
status: approved
---

# Spec — navigation-menus
_Terse overview. ACs → `gherkin-scenarios.md`; tasks → `task-N.md`; risks → `tmp/navigation-menus/risks.md`._

## Summary
Signed-in app chrome: desktop top bar (≥768 web) and mobile top + bottom bars (&lt;768 web + native), with Home / New lesson, a visual-only alerts placeholder, and an account menu (Settings + Sign out). Replaces ad-hoc body Links and header-only SignOut.

## User stories
- As a **signed-in learner**, I want a responsive primary nav with account actions, so that I can move between Home and New lesson, open Settings, and sign out without hunting body links.

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an AC (Given/When/Then).

## UI states (app chrome)
| State | Trigger | Notes |
|---|---|---|
| Content | Signed-in; session known | Full DesktopBar / MobileBar + account menu (@s1–@s15, @s19–@s20) |
| Loading | `useSession().isLoading` | Chrome may mount; identity/avatar wait for session — no invented user (@s14) |
| Empty | N/A | Guest/marketing nav out of scope; chrome only under `(app)` |
| Error | Sign-out failure | Existing SignOut `onSignOutError` path — no new error chrome; **no scenario** (behavior unchanged from existing untested `onSignOutError` no-op) |

## Analytics events
None — MVP.

## Feature flags
None.

## Out of scope / non-goals
- Guest / marketing nav
- Help & feedback row
- Real notifications (bell+badge = visual placeholder only)
- Avatar photo upload / picker
- Adding lesson/player deep routes as top-level tabs
- New i18n product keys beyond the account-trigger a11y key `nav.openAccountMenu` (reuse existing `nav.*` / `auth.*`)
- Changing product default indicator away from `pill` (API still exposes `underline` | `dot`)

## Open decisions (resolved, with rationale)
- **Signed-in only** (`(app)` shell only) — **why:** every nav action (primary tabs, account menu, avatar identity) presupposes a session; guest/marketing nav is a separate surface (see Non-goals). (lock #1)
- **Alerts = visual placeholder** — non-interactive, no feed/backend — **why:** human lock #2; avoid new copy keys (decorative / no product string).
- **Help & feedback cut** — **why:** human lock #3. _(ACCEPTED — human gate 2026-07-15: rationale left as lock provenance.)_
- **Indicator API `pill` \| `underline` \| `dot`; product default `pill`** — **why:** human lock #4 + design SoT.
- **Real session user + initials avatar** — **why:** avatar/menu identity must reflect the actual signed-in user (@s14); initials placeholder personalizes without adding a photo-upload feature (Non-goals). (lock #5)
- **Mobile avatar → same account menu as desktop** — **why:** one shared AccountMenu organism, two triggers → action parity + no divergent/duplicated menu to maintain (@s10). (lock #6)
- **Breakpoint 768** — web ≥768 desktop; web &lt;768 **and** native iOS/Android → mobile — **why:** matches the design SoT desktop cutoff; native has no wide-canvas layout so it always uses the mobile pattern (@s19). (lock #7)
- **i18n keys** — see `@s17`; reuse existing `nav.*` / `auth.*` plus one a11y key `nav.openAccountMenu` (`{{label}}`) — **why:** product labels already translated; AT strings are user-facing under i18n.mdc, so the trigger label needs a key. (lock #8)
- **Brand wordmark via `brand.name`** — same literal in all locales, not translated — **why:** product name; still goes through `t()` so i18n.mdc / migration coverage hold.
- **Presentational chrome in `@helsoft/components`**; wiring in `@helsoft/study-buddy` + app layouts — **why:** atomic design + Component→Hook layering; props for labels/handlers.
- **Account Sign out reuses existing SignOut confirm dialog via a new controlled mode** — add optional `open`/`onOpenChange` to `SignOut`/`SignOutView` (dialog-only when controlled; absent = today's behavior, backward-compatible). AccountMenu's error-styled row fires `onSignOut`; AppChrome opens the controlled dialog, reusing `auth.logOut*` + `useAuth().signOut()`. Mechanism + paths in **`task-5.md`**; AccountMenu (task-4) stays presentational. — **why:** the row must be an error-styled menu item (@s5), not SignOut's outlined Button, and re-implementing the dialog would duplicate confirm wiring — controlled mode swaps only the trigger. _(FYI at gate — technical call made without a live human.)_
- **Hide redundant Expo Stack header chrome** where custom bars own title/actions; keep deep-route titles coherent via same `t()` keys — **why:** avoid double headers + duplicate SignOut.
