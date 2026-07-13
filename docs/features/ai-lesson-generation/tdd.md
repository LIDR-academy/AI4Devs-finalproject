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

## Mutation-hardening cycle (post-review, `@helsoft/supabase-services`)

Stryker pre-review: 77.72% (41 survivors/6 files). Strengthened assertions only — no production
change — per file: `assembly.test.ts` (`.name`/`.message` on the 3 thrown-`GenerationSchemaError`
tests; +1 test: explanation ternary's present-branch on multiple-choice) · `errors.test.ts`
(+1 test: `GenerationTimeoutError` default message/name; +1 `it.each` of 6: `apiCallStatusCode`
guard vs. `null`/`undefined`/string/number/`{}`/`{statusCode:'x'}`) · `placement.test.ts` (+1 test:
3 vision decisions, only one matching `imageId`, asserts the matching one — not the first — is
picked) · `prompt.test.ts` (3 tests switched to full-string `.toBe()`: page-join `\n\n` +
empty-images `''` combined, description-fallback `''`, manifest-line-join `\n`; the "no images"
test now checks `.not.toContain('Available images')`, the real header text) · `schema.test.ts`
(existing correctOptionId/correctPairs rejection tests now assert `error.issues[0].message`+
`.path`; +5 `.min()`-boundary tests via the exported `rawSlideSchema` directly — bypasses
deckSchema's cross-field `superRefine` so only that one field's bound can flip the outcome; +2
tests isolating each side of the matching length-mismatch `||`; +1 mixed valid/invalid
`correctPairs` test for `.every()`; +2 duplicate-id tests, one per side, confirming both `||`
operands are load-bearing) · `service.test.ts` (unauthenticated-rejection test now asserts the
`LessonGenerationService: ${code}` message prefix; +1 test: server body resolves to `undefined`,
alongside the existing `null` case).

Re-ran Stryker scoped to these 6 files: **97.77%, 4 survivors** (down from 41), all 3
remaining-file scores at 100% (`assembly.ts`, `placement.ts`, `prompt.ts`, `schema.ts`).
Genuine equivalent mutants (verified by exhausting every observably-different input, not just
asserted) — documented, not silenced:
- `errors.ts:26` final guard (`typeof statusCode === 'number'` → `true`): any `cause.statusCode`
  that strictly `===` 401/403/429 downstream must already be typeof `'number'`, so the guard's
  removal never changes the returned mapping for any input; property access is already proven
  safe by the untouched first two guards, so no crash-based distinction exists either.
- `errors.ts:38` both mutants (`if (false)` / empty block for the `instanceof
  GenerationSchemaError` branch): `GenerationSchemaError` instances carry no `statusCode`, so
  falling through to `apiCallStatusCode` + the final default returns the byte-identical
  `{errorCode:'generation_failed', status:502}` the explicit branch would have — same value,
  same shape, for every possible cause.
- `service.ts:48` optional chaining (`body?.errorCode` → `body.errorCode`): the whole expression
  sits inside `readFunctionErrorCode`'s own `try { … } catch { return 'generation_failed'; }` —
  a null/undefined `body` throws either way the `?.` is written, and that throw is swallowed by
  the enclosing catch to the same fallback value; the `?.` is a redundant, unobservable
  belt-and-suspenders guard given the surrounding try/catch.

`pnpm --filter @helsoft/supabase-services test` 143/143 green. `pnpm lint` / `check-types` clean.
