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

## Slice 3 (tasks 14–15) — i18n coverage guard + a11y pass — done, committed `406d39c`

`@s` covered: @s18 i18n coverage (`migration-coverage.test.ts` `T_KEY_COMPONENT_DIRS` +
plural-key detector), @s19 a11y (`RadioGroup` group `accessibilityLabel`, panel picker labelled
by `generation.composition.heading`, e2e `role=radiogroup`+`aria-label`). Gate: lint/check-types
clean; suites green (same baseline exception); e2e 14/14.

## Mutation-hardening cycle (post-review, `@helsoft/supabase-services`)

Stryker pre-review 77.72% (41 survivors/6 files) → strengthened assertions only, no production
change, across `assembly/errors/placement/prompt/schema/service.test.ts` (message/name/path
assertions, boundary + `it.each` cases, full-string `.toBe()`). Re-scored 97.77%, 4 survivors, all
genuine equivalent mutants (documented in commit `79d86f5`, not re-copied here for budget).
143/143 green, lint/check-types clean.

## Re-work round 1 (post full-review, `docs/features/ai-lesson-generation/review.md`)

1 blocker + 2 major + 4 minor, all fixed via TDD (Red→Green→Refactor each), re-review pending.

- **#1 blocker** — RED `generation-progress.test.tsx` (statusLabels prop, non-English fixture
  proves no hardcoding) → GREEN: `GenerationProgress` takes `statusLabels` prop (no more
  hardcoded `STATUS_LABEL`); `LessonGenerationPanel` builds it from new
  `generation.step.status.{done,current,upcoming}` keys (en authoritative, es/de/pt added);
  updated `lesson-generation-panel.test.tsx` + `lesson-generation.test.tsx` (study-buddy) label
  assertions; story updated. `lesson-generation-panel` dir already in `T_KEY_COMPONENT_DIRS`, no
  new guard entry needed.
- **#2 major** — pure refactor, no new test (behavior unchanged): moved `PageAnchoredImage` /
  `AnchoredSlide` / `PlacementResult` / `VisionPlacementDecision` / `RawSlide` / `Deck` /
  `AssembleGeneratedLessonInput` / `GenerationErrorMapping` / `PromptImageManifestEntry` /
  `BuildDeckPromptInput` out of their implementation files into new
  `lesson-generation.types.ts`; hand-mirrored the same split into
  `supabase/functions/generate-lesson/_shared/`. 143/143 still green.
- **#3 major** — RED `use-lesson-generation.test.ts` (two synchronous `generate()` calls before
  either settles; asserted `service.generate` called once) → GREEN: `isGeneratingRef` guard in
  `generate()` (set before the first `await`, cleared in `finally`) — a second concurrent call is
  a no-op, so a stale first response can never clobber a later one. Chose the hook-level guard
  over disabling the panel's error-action button: that button unmounts the instant `stage`
  flips (Error state is conditional on `state === 'error'`), so a `disabled` prop there couldn't
  catch the same-tick double-press the finding describes — the ref guard is the actual fix.
- **#4 minor** — RED `lesson-generation.test.ts` (types lib, new `GENERATION_PROGRESS_STEPS`
  export) → GREEN: hoisted into `@helsoft/types`; hook + panel helpers import it instead of each
  declaring `['reading','generating','attaching']` independently.
- **#5 minor** — added `export type *` for `generation-progress.types` to
  `libs/components/src/molecules/index.ts` (barrel-consistency with the organisms barrel). No
  dedicated test: a type-only re-export is erased at runtime (nothing for Jest to assert either
  way), enforced instead by `check-types` — mirrors why plain barrel `export type` additions
  elsewhere in this codebase aren't themselves test-driven.
- **#6 major** — RED `lesson-generation.assembly.test.ts` (one call site switched to a
  `metadataPlacement` field the old signature didn't accept) → GREEN: `assembleGeneratedLesson`
  now takes the caller's already-computed `PlacementResult` instead of recomputing
  `placeImagesByMetadata` internally; `generate-lesson/index.ts` computes it once and threads it
  through (mirrored in `_shared/`). Updated all other `assembly.test.ts` call sites
  (`emptyPlacement`/`placementFor` helpers). 17/17 green.
- **#7 minor** — perf-only refactor, no new test (behavior unchanged): `useMemo` for
  `options`/`steps`/`statusLabels` in `lesson-generation-panel.tsx`; `useCallback` for
  `handleGenerate`/`handleOpenInPlayer`/`handleErrorAction`/`onCompositionChange` in
  `lesson-generation.tsx` (study-buddy).

### Gate (re-work round 1)

`pnpm turbo run lint check-types` clean repo-wide. `pnpm --filter <ws> test`: `@helsoft/types`
25/25, `@helsoft/hooks` 70/70, `@helsoft/components` 177/177, `@helsoft/study-buddy` 117/117,
`@helsoft/supabase-services` 143/143, `@helsoft/localization` green except the same two
pre-existing sign-in-form/sign-out failures (confirmed unrelated, byte-identical at base
`b05c083`). E2e `pnpm --filter @helsoft/components exec playwright test --reporter=list` 59/60 —
the one failure is the other documented pre-existing baseline (`api-key-form` Error-story text
mismatch); every `generation-progress`/`lesson-generation-panel` e2e case passes.
