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
