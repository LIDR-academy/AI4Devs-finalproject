# TDD — navigation-menus

## @s → test
| Scenario | Test | File |
| --- | --- | --- |
| @s3, @s12 | default active pill + selected state | `nav-item.test.tsx` |
| @s4 | indicator variants | `nav-item.test.tsx` |
| @s3, @s4 | NavItem Storybook variants | `tests/e2e/molecules/nav-item/nav-item.e2e.js` |
| @s1, @s15, @s20 | desktop chrome + visual alerts | `desktop-bar.test.tsx` |
| @s2 | injected primary handlers | `desktop-bar.test.tsx`, `mobile-bar.test.tsx` |
| @s18 | theme-sized NavItem touch target | `nav-item.test.tsx` |
| @s9, @s11 | mobile chrome + safe-area inset | `mobile-bar.test.tsx` |
| @s14 | session label, initials, fallback, unavailable user | `session-identity.helpers.test.ts` |
| @s14, @s18 | initials avatar render, accessible trigger, touch target | `initials-avatar.test.tsx` |
| @s5, @s6, @s7, @s8, @s10, @s18 | identity, actions, error style, full-bleed outside dismiss, trigger semantics, touch targets | `account-menu.test.tsx`, `use-account-menu.test.tsx`, `tests/e2e/organisms/account-menu/account-menu.e2e.js` |
| @s19 | web and native breakpoint selection | `use-breakpoint.test.ts` |
| @s5, @s7 | controlled dialog-only SignOut and auth confirmation | `sign-out.test.tsx` |
| @s2, @s5, @s6, @s7, @s13, @s14, @s17, @s19 | AppChrome navigation, identity, SignOut, deep-route active state, mobile bars | `app-chrome.test.tsx`, `use-app-chrome.test.ts` |
| @s14 | AppChrome Content and Loading Storybook states | `tests/e2e/components/app-chrome/app-chrome.e2e.js` |
| @s16 | App shell excludes redundant Home links and Settings/header SignOut | `app-shell.test.ts` |

## Slice 1
- @s3/@s12 RED missing NavItem → GREEN pill + selected link.
- @s4 RED variants lacked distinct geometry → GREEN pill, underline, dot indicators.
- @s1/@s15/@s20 RED missing DesktopBar → GREEN desktop slots and visual-only alerts.
- @s9/@s11 RED missing MobileBar → GREEN mobile slots and safe-area inset.
- Refactor: extracted public component types and barrel exports; targeted units/type-check green.
- E2E RED Storybook IDs used kebab-case title segments → GREEN exact generated IDs; four navigation e2e checks green.
- @s18 RED NavItem target lacked token-sized width → GREEN 48dp min width and height.
- @s2/@s11 RED mobile handler and additive inset assertions → GREEN injected presses and token + inset padding.
- E2E NavItem Storybook variants green.

## Slice 2
- @s14 RED missing session identity helper → GREEN metadata/email labels, initials, and null absent user.
- @s14/@s18 RED missing InitialsAvatar → GREEN token-styled placeholder and optional accessible trigger.
- @s5 RED missing AccountMenu → GREEN identity header, Settings, error Sign out, no Help.
- @s6/@s7/@s8 RED actions/backdrop/Escape did not close → GREEN callback rows and accessible dismiss paths.
- @s10/@s18 RED trigger lacked expanded state → GREEN shared render trigger semantics and touch targets.
- Refactor: extracted public props, token styles, barrels; targeted units, Storybook E2E, lint, and type-check green.
- @s5/@s7/@s18 RED missing error, Sign-out, and touch-target assertions → GREEN error style plus callback/close and token assertions.
- @s5/@s7 RED Storybook lacked Sign-out close coverage → GREEN e2e action-close assertion.
- @s8 RED AccountMenu state/effect stayed in organism → GREEN `use-account-menu` owns state and Escape effect; handlers remain in component.
- @s8 RED outside press lacked a full-bleed hit target → GREEN Modal scrim plus unit and browser outside-press coverage.

## Slice 3
- @s19 RED missing breakpoint hook → GREEN web 768 cutoff and native mobile selection.
- @s5/@s7 RED controlled SignOut rendered its trigger → GREEN dialog-only controlled mode; wrapper forwards props.
- @s2/@s5/@s6/@s7/@s13/@s14/@s17/@s19 RED missing AppChrome → GREEN session/i18n/router wiring, controlled sign-out, and responsive bars.
- @s13/@s16 GREEN mount AppChrome in protected layout; hide Stack chrome and remove redundant Home/Settings entry points.
- Refactor: restored hook backward-compatible default args; lint, touched type-checks, and workspace suites green.
- @s17 RED missing mobile-title helper module → GREEN `getMobileTitleKey` pure lookup.
- @s2/@s5/@s6/@s7/@s13/@s14/@s17/@s19 RED missing AppChrome state hook → GREEN `use-app-chrome` owns identity, nav derivation, and controlled SignOut state; handlers remain in the component.
- @s14 RED missing AppChrome Storybook coverage → GREEN Content and Loading stories plus matching browser checks.
- @s16 regression test added: route-source assertions prevent Home Upload/Settings links and Settings/header SignOut paths returning.

## Mutation re-work
- @s3/@s4/@s12/@s14/@s18 RED strengthened indicator/default, avatar branch/style, token-style, modal, and Escape listener assertions; components mutation re-run 100%.
- @s2/@s13/@s14/@s19 RED strengthened desktop/mobile routes, root active state, and identity fallback/initials assertions; AppChrome and route mutants killed.
- @s14 RED added repeated-space and four-word identity initials assertion; helper mutant still survives scoped mutation despite exact `AB` output.
