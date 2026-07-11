---
id: task-3
title: Matching organism — Content states, tap-to-pair UX, Submit gate, results
slice: 1
scenarios: [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11]
status: done
paths: [libs/activities/src/organisms/matching/matching.tsx, libs/activities/src/organisms/matching/matching.test.tsx, libs/activities/src/organisms/index.ts]
---

## Goal
Build the presentational `Matching` organism in `@helsoft/activities` (atomic-design organism, reusing `@helsoft/components` `Card`/`Icon`/theme tokens via `react-native-unistyles`). Renders two columns of tappable item tiles + a Submit control. Owns the ephemeral tap-to-pair interaction: pending selection, form pair (either order), deselect, retarget, release-paired (Decision 4). Submit disabled until every item is paired (Decision 6); on press → `onSubmit(pairs)`. When the `result` prop is set → locked, non-interactive, per-pair correct/incorrect (text + icon), result banner (all-correct vs mixed) + `result.summary` + optional explanation. Props per spec Component contract (`MatchingProps`, `MatchingLabels`, view types). Export via the organisms barrel.

## Done criteria
- [ ] Scenarios `@s1`–`@s11` covered by `matching.test.tsx` (RN Testing Library): render/unpaired, pending, form-pair (both orders), deselect, retarget, release, submit-disabled-until-all-paired, submit-grades-and-locks, all-correct, mixed, explanation
- [ ] Controlled/presentational: owns no domain state; locks entirely from `result`; no drag affordance
- [ ] Correctness conveyed by text + icon (not color alone); result banner announced (live region)
- [ ] Atomic-design + layering respected (organism in `@helsoft/activities`, depends only on `@helsoft/components`)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm --filter @helsoft/activities test` green
- [ ] No hardcoded strings/colors/dimensions (all via `labels` + theme tokens)

## Notes
Empty/Error unavailable branches are added in task-5 (slice 2). i18n wiring, deeper a11y, stories, and e2e are slice 3 (tasks 6–9). Mirror the `MultipleChoice` organism's structure and story-driven testability.
