# Review — activity-flashcard-recall

Round 2 (final). CI green (round 1 @ f85f956; round 2 re-run on the post-fix working tree — lint, check-types, unit tests across `@helsoft/types`/`@helsoft/activities`/`@helsoft/study-buddy`/`@helsoft/localization`, Playwright e2e 11/11). Pre-review mutation 100% (`mutation.md`).

## Lenses run
- `reviewer_code` — ran round 1 + round 2 (had an open finding)
- `reviewer_architecture` — ran round 1 only (no findings); territory re-verified directly against the round-2 fix diff (only `use-flashcard.ts`/`use-flashcard.test.ts` + doc files changed — no layering/dependency/I/O impact)
- `reviewer_design` — ran round 1 only (no findings); fix diff touches no styling/tokens/JSX, territory unaffected
- `reviewer_accessibility` — ran round 1 + round 2 (had the open MAJOR finding)
- `reviewer_performance` — ran round 1 only (no findings); fix diff adds one primitive (`slide.back`) to an effect dependency array, no re-render/perf impact, territory unaffected
- `reviewer_security` — skipped both rounds: no service/DAO/auth/network/storage touches in the feature diff (confirmed via `git diff 5ccf8e5..HEAD -- libs/supabase-services libs/hooks` = empty + full-diff grep for `supabase|fetch(|axios|storage.` = no hits)

## Round 1 findings (both resolved in round 2)
- MAJOR — `use-flashcard.ts` reveal-announce effect announced only the static "Answer" heading, never the actual answer content, failing @s10.
- MINOR — `task-1.md`–`task-4.md` Done-criteria checkboxes left unchecked despite `status: done`.

## Round 2 verification
- **MAJOR resolved**: `libs/activities/src/organisms/flashcard/use-flashcard.ts:26-29` now announces `` `${labels.answerHeading}: ${slide.back}` `` (e.g. "Answer: Chlorophyll"), deps `[isRevealed, labels.answerHeading, slide.back]` (primitive, no effect-loop risk). `use-flashcard.test.ts:97-108` genuinely strengthens the assertion (`expect.stringContaining(slide.back)` + heading), confirmed Red→Green per `tdd.md`. Independently verified by both `reviewer_code` and `reviewer_accessibility` round 2 — no new findings, no regressions to roles/labels/accessibilityState/touch-targets/focus-order.
- **MINOR resolved**: all Done-criteria in `task-1.md`–`task-4.md` are now `- [x]`; spot-checked against real code (types, helpers, wiring, stories) — accurate.

## Open findings
None.
