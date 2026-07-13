# tdd.md — ai-lesson-generation

Deno (`generate-lesson/index.ts`, `_shared/*`) + `get_api_key` migration sit outside Jest/Stryker
(risks.md R2/R5): verified by code review + manual smoke, not Jest — noted once.

## Slice 1 (tasks 1–10) — happy path "both" + Loading + Content — done, committed `8e7ffb6`

`@s` covered: @s1/@s2/@s3/@s6/@s7/@s8/@s9/@s11/@s13/@s14/@s16/@s17/@s20 — provider swap, contract
types, `get_api_key` migration, `generate-lesson` happy path (pure modules, mirrored to
`_shared/`), DAO, service, hook (stepper), `GenerationProgress`, `LessonGenerationPanel` (3
states), wiring (`onExtracted` + thin `upload.tsx`). Gate: lint/check-types clean; suites green
except the pre-existing `migration-coverage.test.ts` sign-in-form/sign-out failure (untouched
baseline, not this feature's).

## Slice 2 (tasks 11–13) — composition enforcement + error contract + vision fallback — done, committed `e97c71f`

`@s` covered: @s4/@s5/@s6/@s10/@s12/@s15 — `assertComposition` (assembly), `applyVisionPlacements`
(placement), `mapGenerationError`/`withTimeout` (Deno, code-reviewed), `normalizeGenerationError`
(service), `retry()` (hook), panel Error state (alert role + assertive live region, action
button), wiring dispatch (`GENERATION_ERROR_KEYS`/`_RECOVERY`, retry/settings/sign-in/none),
i18n `generation.error.*` (4 locales). Gate: lint/check-types clean; suites green (same
sign-in-form/sign-out baseline exception); e2e `lesson-generation-panel` 9/9.

## Slice 3 (tasks 14–15) — i18n coverage guard + a11y pass — this session

### `@s` → test map
- **@s18** i18n coverage: `migration-coverage.test.ts` two new `T_KEY_COMPONENT_DIRS` entries —
  `lesson-generation-panel` (task-9's `t()` literals: composition/step/generate/ready keys) and
  `lesson-generation` (task-13's `GENERATION_ERROR_KEYS`/`_ACTION_LABEL_KEYS` literals in
  `lesson-generation.helpers.ts`).
- **@s19** a11y: `radio-group.test.tsx` new case (group `accessibilityLabel` exposed) ·
  `lesson-generation-panel.test.tsx` new case (picker labelled by `generation.composition.heading`)
  · pre-existing coverage re-confirmed by audit (not duplicated): `generation-progress.test.tsx`
  polite live region, panel Error-state alert/assertive-live-region case, Generate
  accessible-name+disabled-state role queries · e2e: new
  `lesson-generation-panel.e2e.js` case (`role=radiogroup` + `aria-label`).

### Cycle log
- **task-14a**: RED — added the two `T_KEY_COMPONENT_DIRS` entries (additive, per orchestrator's
  explicit exception to Law 1 for this data-driven guard) → one genuinely failed:
  `generation.ready.slideCount` (i18next `_one`/`_other` plural key) wasn't recognized by
  `flattenKeys`. GREEN — `flattenKeys` now also registers the plural-stripped base key
  (`PLURAL_SUFFIX` regex); added a detector-sanity case for it. Only the pre-existing
  sign-in-form/sign-out cases still fail (untouched, unrelated baseline).
- **task-15a**: RED `radio-group.test.tsx` — group needs an `accessibilityLabel` prop (mirrors
  `LanguageSelector`'s own prop; none existed on `RadioGroup`) → GREEN added the prop, forwarded
  to the `radiogroup` View.
- **task-15b**: RED `lesson-generation-panel.test.tsx` — the picker's group has no accessible
  name → GREEN `lesson-generation-panel.tsx` passes
  `accessibilityLabel={t('generation.composition.heading')}` to `RadioGroup`. e2e: +1 case
  asserting `role=radiogroup`/`aria-label` on the `EmptyGenerateDisabled` story.
- Audited (task-15's checklist) rather than duplicated: `GenerationProgress`'s polite live
  region, the panel's Error-state alert role, and Generate's accessible-name/disabled-state —
  all already covered by existing tests from slices 1–2; no gap found beyond the group label.

### Gate status (Slice 3)
`pnpm turbo run lint check-types --output-logs=errors-only` clean repo-wide. `pnpm --filter <ws>
test` green: `@helsoft/components` 176/176 (incl. panel 14/14, radio-group 2/2), `@helsoft/
study-buddy` 117/117, `@helsoft/localization` green except the same pre-existing, untouched
sign-in-form/sign-out `migration-coverage.test.ts` failures. E2e (`playwright test
--reporter=list generation-progress lesson-generation-panel`) 14/14. Not committed — awaiting
`reviewer_slice`.
