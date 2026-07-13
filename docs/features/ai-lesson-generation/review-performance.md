# Performance review — ai-lesson-generation (round 2, re-review)

**Verdict: APPROVED**

Scope: fix diff only, `git diff 79d86f5..bc4ac00` (commit `bc4ac00`, "fix(ai-lesson-generation): address round-1 review findings"). CI/lint/type-check/test status handed off by the lead, not re-run here.

## Round-1 findings — verification

### 1. Major — reentrancy guard on `generate`/`retry` (was: `libs/hooks/src/hooks/use-lesson-generation.ts:64-98`)
**Fixed, airtight.**
- `libs/hooks/src/hooks/use-lesson-generation.ts:56` — `isGeneratingRef` is a plain `useRef(false)`, not state.
- `libs/hooks/src/hooks/use-lesson-generation.ts:71-73` — the guard check (`if (isGeneratingRef.current) return;`) and the synchronous `isGeneratingRef.current = true` both execute before the function's first `await` (the `await LessonGenerationService.generate(...)` at line ~93). A ref write is synchronous, so a second `generate()` invoked in the same synchronous tick (before the first call yields) is guaranteed to observe `true` and no-op — this closes the actual race, not just a same-microtask approximation.
- `libs/hooks/src/hooks/use-lesson-generation.ts:96-99` — reset (`isGeneratingRef.current = false`) lives in `finally`, so it fires on both the success path (`setResult`/`setStage('content')`) and the failure path (`setError`/`setStage('error')`); no code path can leave it stuck `true`.
- `retry()` (line ~102) delegates to `generate(lastRequest)`, so it inherits the same guard — no separate bypass.
- Test verification, `libs/hooks/src/hooks/use-lesson-generation.test.ts:149-179` ("ignores a second concurrent generate() call…"): both `generate()` calls are issued synchronously inside the same `act(() => { ... })` callback while `service.generate`'s mock promise is still unresolved — this genuinely exercises two overlapping in-flight calls (the second is invoked before the first has had a chance to resolve), not two sequential ones. `expect(service.generate).toHaveBeenCalledTimes(1)` confirms the underlying network call fired exactly once; after resolving, `stage === 'content'` and `result === lesson` confirm the surviving state is the first (and only) call's result, un-clobbered. A companion test (`:182-204`, "allows a new generate() call once the previous one has settled") confirms the ref correctly un-blocks after settling, so a legitimate subsequent generation isn't wedged shut.
- Per the task brief, the missing `disabled` prop on the panel's error-action button is not flagged — the hook-level guard alone is sufficient and was an accepted alternative.

### 2. Minor — duplicate `placeImagesByMetadata` computation
**Fixed correctly.**
- `supabase/functions/generate-lesson/index.ts:223` is now the single production call site; its result (`metadataPlacement`) is threaded straight into `assembleGeneratedLesson({ ..., metadataPlacement, visionDecisions })` at line ~257-261, no longer recomputed.
- `libs/supabase-services/src/services/lesson-generation.assembly.ts` and its `supabase/functions/generate-lesson/_shared/lesson-generation.assembly.ts` mirror no longer import/call `placeImagesByMetadata` at all — confirmed via grep, the only remaining call sites are the one production call in `index.ts:223` and the pure-unit tests (`lesson-generation.placement.test.ts`, plus a test-only fixture helper in `lesson-generation.assembly.test.ts:8-19` that computes it locally to build `PlacementResult` fixtures for the assembly tests).
- The type contract (`AssembleGeneratedLessonInput.metadataPlacement: PlacementResult`, in the new `lesson-generation.types.ts` / `_shared/lesson-generation.types.ts` mirror) is consistent between the app-side lib and the Edge Function mirror.
- `lesson-generation.assembly.test.ts` was updated in lockstep (every call site now passes `metadataPlacement` instead of `images`); all existing assembly-behavior assertions (lessonId minting, slide typing, image-ref attachment, schema-error throwing, etc.) are preserved unchanged — the refactor removed one redundant `O(slides × images)` pass per generation request without changing output.

### 3. Minor — unmemoized array/callback literals
**Fixed correctly, dependency arrays are all correct.**
- `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.tsx:63-79` — `options`, `steps`, and the new `statusLabels` are each wrapped in `useMemo(..., [t])`. All three derive solely from `t` (plus module-level constants `COMPOSITION_OPTION_VALUES`/`STEP_LABEL_KEYS`/`STATUS_LABEL_KEYS`), so `[t]` is complete and minimal — no stale-closure risk.
- `libs/study-buddy/src/components/lesson-generation/lesson-generation.tsx`:
  - `handleGenerate` (`:34-37`): reads `documentId`, `composition`, `generate` → deps `[documentId, composition, generate]`. Correct, no staleness.
  - `handleOpenInPlayer` (`:39-42`): reads `result`, `router` → deps `[result, router]`. Correct.
  - `handleErrorAction` (`:46-50`): reads `recovery`, `retry`, `router` → deps `[recovery, retry, router]`. Correct.
  - `handleCompositionChange` (`:52-54`): reads only `setComposition` (React-guaranteed stable) and the module-level pure `isLessonComposition` → deps `[]` is correct, not under-specified.
- `useLessonGeneration`'s own `generate`/`retry` (the callbacks these depend on) are themselves `useCallback`-wrapped with stable deps (`[session, stopStepper]` / `[generate]` respectively, unchanged from round 1), so the new panel-level memoization actually pays off — it isn't undermined by an unstable callback further down the chain.

## New issues from the fix diff itself
None found. Full pass over `git diff 79d86f5..bc4ac00`:
- All `lesson-generation.*` type-extraction moves (`placement.ts`, `prompt.ts`, `errors.ts`, `schema.ts` → new `lesson-generation.types.ts`, mirrored by hand into `supabase/functions/generate-lesson/_shared/`) are pure type-only refactors — zero runtime/render impact, and the `_shared` mirror stays in lockstep with the lib version (checked field-by-field).
- `GENERATION_PROGRESS_STEPS` (new, `libs/types/src/lesson-generation.ts:37-44`) is a module-level `as const` array — referentially stable across renders/imports, replaces two independently-hardcoded copies (`use-lesson-generation.ts`'s old `GENERATION_STEP_ORDER`, `lesson-generation-panel.helpers.ts`'s old `STEP_ORDER`) with one shared reference; no new allocation in a hot path.
- `GenerationProgress`'s new `statusLabels` prop (`libs/components/src/molecules/generation-progress/generation-progress.tsx`) is a 3-key record supplied by the memoized `statusLabels` from finding #3 above — no fresh-literal-per-render regression.
- No new list rendering, no new N+1/round-trip pattern, no new synchronous main-thread work introduced anywhere in this diff.

## Scope note
Not re-verified: `pnpm lint`/`check-types`/`test`/Playwright — per the lead's handed-off CI status (clean, with the two pre-existing out-of-scope failures noted as byte-identical, neither touched by this diff).
