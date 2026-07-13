# Code Review — ai-lesson-generation (round 2)

**Verdict: APPROVED**

Scope: `git diff 79d86f5..bc4ac00` (fix commit `bc4ac00`), re-reviewing the two round-1 findings
plus a full-rubric pass over the rest of the fix diff.

## Round-1 findings — verification

**Blocker (`generation-progress.tsx` hardcoded English status words) — genuinely fixed.**
- `GenerationProgress` now takes `statusLabels: Record<GenerationProgressStepStatus, string>`
  (`libs/components/src/molecules/generation-progress/generation-progress.types.ts:12-17`); the
  old internal `STATUS_LABEL` map is gone from
  `libs/components/src/molecules/generation-progress/generation-progress.tsx`.
- `LessonGenerationPanel` builds it via `t()` from real new keys
  (`libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.tsx:28-33,74-82`).
- All four locale bundles got real, distinct translations, not copy-pasted English: `en.ts` done/
  current/upcoming, `es.ts` listo/en curso/próximo, `de.ts` erledigt/läuft/ausstehend, `pt.ts`
  concluído/em andamento/próximo — confirmed by diff, not just key presence.
- Test proof is solid, not cosmetic:
  `generation-progress.test.tsx` uses a fixture (`listo`/`en curso`/`próximo`) that is
  deliberately *not* the old English words, and adds a dedicated regression test
  (`generation-progress.test.tsx:39-46`, "never hardcodes the English status words itself") that
  asserts `queryByLabelText('…, done'|'…, current'|'…, upcoming')` returns null — this would catch
  a regression to the old hardcoded map even if a future refactor reintroduced it silently.
  `lesson-generation-panel.test.tsx:156-159` and the study-buddy
  `lesson-generation.test.tsx:90-95` assert the label resolves through
  `generation.step.status.current` (the mocked `t` returns the key itself), proving the value
  flows through `t()` and not a literal.

**Minor (duplicated step-order array) — genuinely fixed, single source of truth confirmed.**
- `GENERATION_PROGRESS_STEPS` hoisted to `libs/types/src/lesson-generation.ts:37-47` (`as const
  satisfies readonly GenerationProgressStep[]`), with its own test
  (`libs/types/src/lesson-generation.test.ts:55-60`).
- Both former independent copies are gone: `libs/hooks/src/hooks/use-lesson-generation.ts` no
  longer exports `GENERATION_STEP_ORDER` (grepped repo-wide — zero remaining references) and
  imports `GENERATION_PROGRESS_STEPS` instead;
  `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.helpers.ts:11-24`
  dropped its local `STEP_ORDER` and imports the same constant. No leftover duplicate array
  anywhere in the diff.

## Full-rubric pass over the rest of the fix diff

No new violations found. Specifically checked, all clean:
- No `console.log`/debug leftovers, no new TODOs, in any file touched by `bc4ac00`.
- The reentrancy-guard addition (`use-lesson-generation.ts:51-58,71-74,100-103`, `isGeneratingRef`)
  is TDD'd with two real tests (`use-lesson-generation.test.ts:149-209`): one proving a second
  synchronous `generate()` call is a no-op while the first is in flight, one proving a later call
  is unblocked once the first settles. Minimal, single-purpose, no magic numbers.
- The `lesson-generation.types.ts` file split (architecture's finding) is hand-mirrored
  consistently between `libs/supabase-services/src/services/` and
  `supabase/functions/generate-lesson/_shared/` — same type set, same section-comment structure,
  no drift between the two copies.
- `assembleGeneratedLesson`'s new `metadataPlacement` input (perf finding) is threaded through
  correctly at its one production call site (`supabase/functions/generate-lesson/index.ts:221-224,
  257-260`) and all test call sites were mechanically updated via a `placementFor` test helper
  (`lesson-generation.assembly.test.ts:5-17`) rather than leaving stale `images:` args — no test
  regressions, no dead parameter left behind (old `images` field fully removed from
  `AssembleGeneratedLessonInput`).
- `useMemo`/`useCallback` additions (`lesson-generation-panel.tsx`, `lesson-generation.tsx`) are
  behavior-preserving perf-only refactors with no test changes required for them specifically;
  existing tests for those components still pass, consistent with the CI status handed to me.
- Filenames stay kebab-case, `Props`/`*Input`/`*Result` types remain present, no class components
  introduced.

CI status handed to me for `bc4ac00`: lint/check-types clean repo-wide; all touched-workspace
suites green (`@helsoft/types` 25/25, `@helsoft/hooks` 70/70, `@helsoft/components` 177/177,
`@helsoft/study-buddy` 117/117, `@helsoft/supabase-services` 143/143); the two remaining red
items (`@helsoft/localization` migration-coverage sign-in-form/sign-out, `api-key-form.e2e.js`)
are pre-existing and confirmed byte-identical since before this feature — out of scope, not
blocking.
