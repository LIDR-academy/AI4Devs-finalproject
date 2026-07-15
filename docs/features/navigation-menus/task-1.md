---
id: task-1
title: NavItem molecule + active-indicator API (pill|underline|dot)
slice: 1
scenarios: [s3, s4, s12]
status: todo
paths:
  [
    libs/components/src/molecules/nav-item/,
    libs/components/src/molecules/index.ts,
  ]
---

## Goal
Ship a presentational `NavItem` molecule that marks the active destination with the design’s indicator API (`pill` | `underline` | `dot`), defaulting to `pill`. Expose active state to assistive tech (`aria-current` / RN equivalent). Labels, `href`/press handlers, and active flag come from props — no router/session inside the molecule.

## Done criteria
- [ ] Scenarios @s3, @s4, @s12 covered by co-located unit tests (+ stories showing all three indicator variants)
- [ ] Prop `indicatorVariant?: 'pill' | 'underline' | 'dot'` with default `'pill'`
- [ ] Active/inactive styles use theme tokens only (contrast AA)
- [ ] Control is a real pressable/link — not a bare non-interactive `View`/`div`
- [ ] Touch target ≥44pt/48dp
- [ ] `pnpm lint` + `pnpm check-types` + targeted `pnpm test` green
- [ ] No hardcoded product strings/colors/dimensions

## Notes
- Design SoT: `Navigation menus.html` indicator API — implement all three; product default pill.
- Split per `component-split.mdc` if state/helpers warrant it; keep pure indicator geometry in `*.helpers.ts` when useful.
- Stories required (`atomic-design.mdc`).
