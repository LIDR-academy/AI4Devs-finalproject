# Performance review — ai-lesson-generation (round 2, re-review)

**Verdict: APPROVED**

Scope: `git diff 79d86f5..bc4ac00`. CI handed off, not re-run.

## R1 findings — verification

**1. Major — reentrancy guard on generate/retry — FIXED, airtight.**
`use-lesson-generation.ts:56` `isGeneratingRef` (plain `useRef`, not state). Guard check + synchronous set to `true` (`:71-73`) both run before the first `await`, closing the actual race. Reset in `finally` (`:96-99`) covers both success/failure paths. `retry()` delegates to `generate()`, inherits guard. Test `use-lesson-generation.test.ts:149-179` issues both calls synchronously inside one `act()` while the mock promise is unresolved — genuinely overlapping calls; `toHaveBeenCalledTimes(1)` confirms. Companion test `:182-204` confirms unblock after settling. Per task brief, missing `disabled` on error-action button not flagged — hook-level guard was accepted as sufficient.

**2. Minor — duplicate `placeImagesByMetadata` computation — FIXED.**
`index.ts:223` is the single production call site; result threaded into `assembleGeneratedLesson` at `:257-261`. Assembly files (lib + `_shared` mirror) no longer call it directly (grep-confirmed; only remaining call sites are `index.ts:223` and test fixtures). Type contract consistent lib↔Edge Function. Assembly tests updated in lockstep, behavior preserved, one `O(slides × images)` pass removed per request.

**3. Minor — unmemoized array/callback literals — FIXED, deps all correct.**
`lesson-generation-panel.tsx:63-79` — `options`/`steps`/`statusLabels` wrapped in `useMemo(..., [t])`, complete/minimal deps. `lesson-generation.tsx` handlers (`handleGenerate`, `handleOpenInPlayer`, `handleErrorAction`, `handleCompositionChange`) each `useCallback`-wrapped with correct deps. Underlying `useLessonGeneration`'s `generate`/`retry` already stable (`[session, stopStepper]`/`[generate]`, unchanged from R1).

## New issues from fix diff itself
None. Type-extraction moves to `lesson-generation.types.ts` (mirrored in `_shared/`) are pure type-only, zero runtime impact. `GENERATION_PROGRESS_STEPS` is a module-level `as const` array, referentially stable, replaces two hardcoded copies. `statusLabels` prop sourced from memoized value, no fresh-literal-per-render. No new list rendering, N+1, or main-thread work.

## Scope note
Not re-verified: lint/check-types/test/Playwright — per lead's handed-off clean CI status (2 pre-existing out-of-scope failures, byte-identical, untouched by this diff).
