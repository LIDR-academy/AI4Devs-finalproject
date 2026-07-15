# Desktop & mobile navigation menus

**As a** signed-in learner
**I want** a responsive primary nav (desktop top bar + mobile bottom bar) with account actions
**so that** I can move between Home and New lesson, open Settings, and sign out without hunting for links on the screen body

## Context
- Source of truth: Claude Design project [`Navigation menus.html`](https://claude.ai/design/p/7750db8a-5313-4f72-aad7-fdc964b32bd5?file=Navigation+menus.html) (project `7750db8a-5313-4f72-aad7-fdc964b32bd5`). Signed-in `(app)` only — no guest/marketing nav.
- Today navigation is ad-hoc: Expo `Stack` titles in `apps/app-study-buddy/src/app/(app)/_layout.tsx` plus plain `Link`s on Home (`index.tsx`). Settings hosts language + API key; `SignOut` lives in the Settings header only. No shared app chrome for desktop/mobile.
- Universal Expo app (web + iOS + Android). **Breakpoint:** web width ≥ **768** → desktop top bar; web &lt; 768 and native (iOS/Android) → mobile pattern (top app bar + bottom tab bar).
- Primary destinations (shared `NAV`): **Home** → `/`, **New lesson** → `/upload`. Deep lesson/player routes stay out of the top-level nav (per design comment).
- **Account menu** (desktop avatar dropdown; mobile avatar opens the same menu): identity (real session user) + **Settings** + **Sign out**. **Help & feedback cut for MVP.** Notifications bell + badge = **visual placeholder only** (non-functional).
- Active indicator: implement the design’s full indicator API (`pill` | `underline` | `dot`); app default shown in design = **`pill`**.
- Tokens: Material-3-style `@helsoft/components` theme (`md-*`, elevation, motion). Atomic design + layering per `.agents/rules/`.
- Copy: **existing** `@helsoft/localization` keys only for product strings — map design labels to closest keys (see Notes). No new copy keys unless spec proves a gap that cannot reuse `nav.*` / `auth.*`.

## Acceptance criteria
- **Desktop (≥768 web)** — Given a signed-in learner on a wide web viewport, When they use the app shell, Then they see a top bar: brand lockup (logo + “AI Study Buddy”) → Home + New lesson → right cluster (placeholder alerts control + avatar). Active route uses the design’s indicator (default `pill`). Home and New lesson navigate to `/` and `/upload`.
- **Desktop account menu** — Given the avatar is tapped/clicked, When the menu opens, Then it shows session identity (display name or email-derived label + email + placeholder avatar initials), **Settings**, and **Sign out** (error-styled). **No Help & feedback row.** Settings navigates to `/settings`. Sign out uses the existing auth sign-out flow and lands the user on login. Menu closes on dismiss (outside tap / Escape / after action) with accessible menu semantics.
- **Mobile (&lt;768 web + native)** — Given a signed-in learner on a narrow or native viewport, When they use the app shell, Then they see a top app bar (compact logo, screen title, avatar) and a bottom bar with Home + New lesson (pill indicator by default). Avatar opens the **same** account menu as desktop (Settings + Sign out). Bottom bar respects safe-area inset.
- **Active route** — Given the learner is on Home or New lesson, When the chrome renders, Then the matching nav item is marked active visually **and** exposed to assistive tech (`aria-current` / equivalent). Lesson/player/settings deep routes do not invent a fake top-level active item beyond what the design implies (Settings is account-menu only, not a tab).
- **Session identity** — Given a real Supabase session, When the account menu / avatars render, Then they use the session user (email + initials from name/email). Avatar graphic is a **placeholder** (initials circle), not a photo picker/upload.
- **Notifications placeholder** — Given the desktop right cluster, When the alerts control is shown, Then it is visual-only (icon + badge styling OK) and does **not** open a feed, mark-as-read, or hit a backend.
- **Replace ad-hoc links** — Given Home previously linked to Upload/Settings via body `Link`s and Settings header alone owned SignOut, When this ships, Then primary nav + account menu own those entry points; redundant body links / header-only SignOut are removed or no longer the primary path (no duplicate confusing CTAs).
- **i18n** — All user-visible chrome strings come from existing locale bundles (en/es/pt/de). No hardcoded English from the design file in product UI.
- **A11y** — Nav items are links/buttons (not bare non-interactive divs); account trigger has an accessible name; menu supports keyboard (open/close, focus); touch targets ≥44pt/48dp; WCAG 2.2 AA contrast for active/inactive and Sign-out error styling; bottom bar safe-area padding preserved.
- **Cross-platform** — Behavior matches the breakpoint rule on web; iOS/Android always use the mobile pattern.

## Notes
- **Design import:** Claude Design MCP (`https://api.anthropic.com/v1/design/mcp`); implement the `DesktopBar` / `MobileBar` / account-menu composition from `Navigation menus.html` (not a loose reinterpretation). Indicator variants live in the design component API — expose them; product default = `pill`.
- **i18n mapping (existing keys):**
  - Home tab / home chrome → `nav.myLessons` (“My lessons”) — design literal was “Home”; product already uses this for `/`.
  - New lesson → `nav.newLesson`
  - Settings → `nav.settings` / `settings.title` as appropriate
  - Sign out → `auth.logOut` (+ existing confirm keys if the current SignOut dialog is reused)
  - Alerts control a11y label if needed → prefer reusing an existing key or keep non-interactive placeholder without new product copy; do not invent Help copy (cut).
  - Brand wordmark “AI Study Buddy” may stay as product name if already treated as brand (confirm in spec); do not add Help/notification feature strings.
- **Components:** New chrome likely in `@helsoft/components` (atoms/molecules already have `Icon`, `IconButton`, `Badge`) + feature wiring in `@helsoft/study-buddy` / app layouts. Presentational menu items take labels/handlers as props (no DAO from UI). Session via `useSession` / existing auth hooks — `Component → Hook → Service → DAO` preserved.
- **Out of scope:** Help & feedback; real notifications; avatar photo upload; guest nav; changing deep-link lesson routes into tabs; underline/dot as the *default* (API yes, default pill).
- Design URL: https://claude.ai/design/p/7750db8a-5313-4f72-aad7-fdc964b32bd5?file=Navigation+menus.html
- Ready for `/ticket-orchestrator navigation-menus`.
