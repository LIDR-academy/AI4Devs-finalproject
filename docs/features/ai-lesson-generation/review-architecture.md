# Architecture review — ai-lesson-generation (round 2, re-review of fix diff `79d86f5..bc4ac00`)

**Verdict: APPROVE**

Scope: `git diff 79d86f5..bc4ac00` only. CI handed off green, not re-run.

## R1 finding #1 (Major) — cross-file types exported from service impl files — FIXED
New `libs/supabase-services/src/services/lesson-generation.types.ts` holds all 9 flagged types (`PageAnchoredImage`, `AnchoredSlide`, `PlacementResult`, `VisionPlacementDecision`, `RawSlide`, `Deck`, `AssembleGeneratedLessonInput`, `GenerationErrorMapping`, `PromptImageManifestEntry`, `BuildDeckPromptInput`). All 5 impl files now `import type` only, no re-declare/re-export. Barrel `services/index.ts` unchanged (doesn't leak these). Deno mirror `supabase/functions/generate-lesson/_shared/lesson-generation.types.ts` matches structurally; all 5 sibling `_shared/` files + `index.ts` updated to import from it. Repo-wide grep for new `export type` confirms no other file regressed.

## R1 finding #2 (Low/nit) — molecules barrel missing `generation-progress.types.ts` export — FIXED
`libs/components/src/molecules/index.ts:2` now exports it, matching organisms-barrel pattern. No naming collision with sibling molecules.

## Other lenses' fixes — layering check (spot-checked, not my findings)
- `metadataPlacement` threading (perf fix): stays a pure-module type, no DB/DAO leak, `assembleGeneratedLesson` still pure.
- `isGeneratingRef` reentrancy guard (perf fix, `use-lesson-generation.ts:51-58,72-75,96-97`): plain `useRef`, no new service/DAO import.
- `GENERATION_PROGRESS_STEPS` relocation (R1 finding #4, consolidated fix): moved from hook-local/component-local duplicates into `libs/types/src/lesson-generation.ts` — correct shared ancestor for both consumers.
- No new dependencies (`package.json`/`pnpm-lock.yaml` untouched).

## Summary
Both R1 findings genuinely fixed, no new layering issues introduced by the fix.
