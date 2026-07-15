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
