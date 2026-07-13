# Architecture review — ai-lesson-generation (round 2, re-review of fix diff `79d86f5..bc4ac00`)

**Verdict: APPROVE**

Scope: `git diff 79d86f5..bc4ac00` only (fix commit `bc4ac00`, "fix(ai-lesson-generation): address round-1 review findings"). CI (lint/check-types/tests/e2e) handed off green per lead, not re-run.

## Round-1 finding #1 (Major) — cross-file types exported from service implementation files

**Verified fixed.**

- New file `libs/supabase-services/src/services/lesson-generation.types.ts` holds all 9 types flagged: `PageAnchoredImage`, `AnchoredSlide`, `PlacementResult`, `VisionPlacementDecision` (ex-`lesson-generation.placement.ts`), `RawSlide`, `Deck` (ex-`lesson-generation.schema.ts`), `AssembleGeneratedLessonInput` (ex-`lesson-generation.assembly.ts`), `GenerationErrorMapping` (ex-`lesson-generation.errors.ts`), `PromptImageManifestEntry`, `BuildDeckPromptInput` (ex-`lesson-generation.prompt.ts`).
- Every one of the 5 flagged implementation files (`lesson-generation.placement.ts`, `.schema.ts`, `.assembly.ts`, `.prompt.ts`, `.errors.ts`) now only imports these types (`import type { ... } from './lesson-generation.types'`) — none re-declares or re-exports them locally. Confirmed via diff: each file's old `export type ...` block was deleted, not left behind.
- `libs/supabase-services/src/services/index.ts` barrel is unchanged and still only exports `lesson-generation.service` (not `.placement`/`.schema`/`.assembly`/`.prompt`/`.errors`/`.types`) — these cross-file types stay properly scoped to the pure-module cluster, never leaked to hook/component consumers. Confirmed no file outside `libs/supabase-services/src/services/lesson-generation.*` references any of the 9 type names (`grep -rl` over `libs/supabase-services/src` returns only the 6 lesson-generation.* files).
- Deno mirror `supabase/functions/generate-lesson/_shared/lesson-generation.types.ts` is a faithful structural mirror (same 9 types, same section-comment split) of the libs version. Every one of its 5 sibling `_shared/` files (`lesson-generation.assembly.ts`, `.errors.ts`, `.placement.ts`, `.prompt.ts`, `.schema.ts`) and `supabase/functions/generate-lesson/index.ts` was updated to import from `./lesson-generation.types.ts` instead of re-declaring locally — confirmed via diff, old `export type` blocks removed from all 5.
- Repo-wide grep for `^+export type` across the whole fix diff shows new type exports appear **only** in the two new `.types.ts` files and one barrel line (`libs/components/src/molecules/index.ts:2`, finding #2 below) — no new cross-file type export slipped into any implementation file as a side effect of the refactor.

## Round-1 finding #2 (Low/nit) — molecules barrel missing `generation-progress.types.ts` export

**Verified fixed.**

- `libs/components/src/molecules/index.ts:2` now has `export type * from './generation-progress/generation-progress.types';`, matching the organisms barrel's existing pattern (e.g. `lesson-generation-panel.types`).
- No naming collision: `GenerationProgressStepStatus`, `GenerationProgressStepItem`, `GenerationProgressProps` (the only three exports in that `.types.ts` file) are unique across the molecules barrel — no sibling molecule (`answer-option`, `language-selector`, `radio-group`, `slide-progress`) has a colliding `.types.ts` export.
- `generation-progress.tsx` itself declares no local types post-fix (imports `GenerationProgressStepStatus`/`GenerationProgressProps` from the co-located `.types.ts`), so the barrel addition doesn't create a duplicate-export conflict.

## Other lenses' fixes — layering check (not my findings, checked per instructions)

**`metadataPlacement` threading (performance-lens fix) — no layering issue.** `AssembleGeneratedLessonInput.metadataPlacement: PlacementResult` (`lesson-generation.types.ts:66`) stays a plain, pure-module type built from `SlideImageRef` (`@helsoft/types`) and image manifest data (`PageAnchoredImage`) — no DB row shape involved; `assembleGeneratedLesson` remains a pure function with no DAO/service import. The Edge Function (`supabase/functions/generate-lesson/index.ts:221-224`) now computes `placeImagesByMetadata` once and passes the result to both the vision-fallback decision and `assembleGeneratedLesson`, mirrored correctly on both the libs and Deno `_shared/` sides. No new cross-layer leak.

**Reentrancy-guard ref in `use-lesson-generation.ts` (performance-lens fix) — no layering issue.** `isGeneratingRef` (`libs/hooks/src/hooks/use-lesson-generation.ts:51-58,72-75,96-97`) is a plain `useRef(false)` gate around the existing `LessonGenerationService.generate` call — no new service/DAO call added, no new import beyond the pre-existing `@helsoft/supabase-services` service. Hook still wraps a service, not a DAO.

**`GENERATION_PROGRESS_STEPS` constant relocation (round-1 finding #4, not mine, consolidated fix) — consistent with layering.** Moved from a hook-local `export const GENERATION_STEP_ORDER` (`use-lesson-generation.ts`, deleted) and a component-local `STEP_ORDER` (`lesson-generation-panel.helpers.ts`, deleted) into `libs/types/src/lesson-generation.ts` (`export const GENERATION_PROGRESS_STEPS ... as const satisfies readonly GenerationProgressStep[]`). `@helsoft/types` is the correct shared ancestor for both `@helsoft/hooks` and `@helsoft/components` (components cannot depend on hooks) — both consumers (`use-lesson-generation.ts`, `lesson-generation-panel.helpers.ts`) now import the same canonical array instead of hardcoding independent copies. No boundary crossed.

**No new dependencies.** `git diff 79d86f5..bc4ac00` touches no `package.json` or `pnpm-lock.yaml`.

## Summary

Both round-1 findings are genuinely and completely fixed with no regressions and no new architecture/layering issues introduced by the fix itself. Full-rubric pass over the entire fix diff found nothing further to flag.
