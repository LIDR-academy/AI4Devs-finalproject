---
id: task-N
title: <short imperative title>
slice: 1                     # 1 | 2 | 3
scenarios: [s1]             # @s tags from gherkin-scenarios.md this task satisfies
status: todo                # todo | in_progress | in_review | done
paths: [libs/<lib>/src/…]   # files to create/modify
---

## Goal
_What this task delivers (one paragraph)._

## Done criteria
- [ ] Scenario(s) {scenarios} covered by concrete test(s)
- [ ] Implementation follows the layering / atomic-design rules
- [ ] Component unit test `<name>.test.tsx` (if UI) / logic unit test (if logic)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
_Design decisions, gotchas, links._
