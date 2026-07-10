---
id: task-11
title: Audit + migrate any hardcoded copy in @helsoft/components; assert full coverage
slice: 3
scenarios: [s14]
status: done
paths:
  - libs/components/src/**
---

## Goal
Audit `libs/components/` for baked-in user-facing copy and migrate any found to translation keys, then assert that no hardcoded UI strings remain anywhere in `libs/components/` and `apps/app-study-buddy/`. Most shared components are prop-driven (labels passed in), so the expected surface is small — but the coverage guarantee (AC9) must be explicit and enforced.

## Done criteria
- [ ] Scenario(s) @s14 covered by a coverage check/test asserting no bare user-facing string literals remain in shipped component code (stories excluded)
- [ ] Any component with hardcoded visible copy migrated to keys (labels default to translated values via the hook, or remain caller-supplied per the component's design)
- [ ] Audit result recorded (which components had copy; which are purely prop-driven) so the reviewer can verify against AC9
- [ ] Presentational components stay presentational — no localization hook forced into pure atoms/molecules that only render caller-supplied text
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Complements task-10 (app side); together they satisfy AC9/@s14 across both `libs/components/` and `apps/app-study-buddy/`.
- The `LanguageSelector` (task-8) is presentational and receives labels from the caller — it is not a source of hardcoded copy.
