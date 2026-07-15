# Risks — navigation-menus

| # | Risk (L/I) | Mitigation |
|---|---|---|
| R1 | Double headers (Expo Stack + custom bars) confuse layout / a11y (technical, M/M) | Slice 3 hides/adjusts Stack headers where AppChrome owns chrome; assert single primary title region per pattern. |
| R2 | Breakpoint drift between web resize and native (technical, M/M) | Single `768` constant + helper: web uses width; native always mobile; unit-test the selector. |
| R3 | Account menu a11y (focus trap / Escape / outside dismiss) uneven across RN web vs native (technical, M/H) | Shared AccountMenu with platform-safe dismiss; e2e on web Storybook; document native manual check. |
| R4 | SignOut confirm composed twice or lost when removing Settings `headerRight` (product, M/M) | Account menu wires existing study-buddy `SignOut`; integration test covers confirm → session clear → login. |
| R5 | Design MCP / HTML drift vs tokens (timeline, L/M) | Treat Claude Design as composition SoT; map visuals to `@helsoft/components` MD3 tokens — no one-off hex. |
| R6 | Pressure to add new i18n keys for design literals (Home, Help, Alerts) (product, L/L) | Locked map to existing `nav.*`/`auth.*`; alerts decorative (no copy); Help cut; brand literal OK. |
| R7 | Active-state wrong on deep routes (Settings/lesson looks like a tab) (product, M/L) | Primary NAV only `/` + `/upload`; Settings account-only; @s13 test. |
| R8 | Over-scoping notifications / Help / avatar upload (timeline, M/L) | Explicit non-goals; alerts non-interactive placeholder only. |

## Dependencies
| Dependency | Status | Notes |
|---|---|---|
| `useSession` / `useAuth` (`@helsoft/hooks`) | available | Session identity + sign-out |
| `SignOut` (`@helsoft/study-buddy` / `logging-in-out`) | available | Reuse confirm dialog + keys |
| `Icon` / `IconButton` / `Badge` / theme (`@helsoft/components`) | available | Chrome building blocks |
| `@helsoft/localization` `nav.*` / `auth.*` | available | No new keys expected |
| Expo Router `(app)/_layout` Stack | available | Wire chrome; adjust headers |
| Claude Design `Navigation menus.html` | available | DesktopBar / MobileBar / account menu SoT |
| Safe-area insets (Expo / RN) | available | Mobile bottom bar |
