# Design review — ai-lesson-generation (round 2, re-review)

**Verdict: APPROVE**

Scope: `git diff 79d86f5..bc4ac00` (fix for round-1 finding #1 + unrelated perf/architecture fixes from other lenses).

## Round-1 finding #1 (Medium-High) — verified fixed

- `libs/components/src/molecules/generation-progress/generation-progress.tsx` — hardcoded `STATUS_LABEL` map removed entirely; `accessibilityLabel` now built from a new `statusLabels` prop (line ~38: `` `${step.label}, ${statusLabels[status]}` ``). Molecule remains presentational/i18n-free — no `t()`/`useLocalization` import added, consistent with the `PdfUploadPanel` split verified in round 1.
- `libs/components/src/molecules/generation-progress/generation-progress.types.ts:17` — `statusLabels: Record<GenerationProgressStepStatus, string>` added as a required prop, documented as wiring-layer-injected.
- `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.tsx:28-33,74-82,101-105` — builds `statusLabels` via `t()` from new `generation.step.status.{done,current,upcoming}` keys, mirroring the existing `steps`/`options` `t()`-composition pattern exactly. Correct organism-owns-i18n placement.
- `libs/localization/src/resources/{en,es,de,pt}.ts` — new `generation.step.status.*` keys checked in all four bundles, genuinely distinct translations, not English copy-pasted:
  - en: done/current/upcoming
  - es: listo/en curso/próximo
  - de: erledigt/läuft/ausstehend
  - pt: concluído/em andamento/próximo
- `libs/components/src/molecules/generation-progress/generation-progress.stories.tsx:14,19-22` — `statusLabels` added to `meta.args` (English demo copy, commented as exempt demo-copy same as the pre-existing `steps` fixture), so it's inherited by all four stories (`Reading`/`Generating`/`Attaching`/`Done`) — required prop is satisfied everywhere, no missing-prop warnings.
- `libs/components/src/molecules/generation-progress/generation-progress.test.tsx` — uses a non-English fixture (`listo`/`en curso`/`próximo`) plus a new negative assertion (`never hardcodes the English status words itself`) that specifically proves the label is prop-sourced, not a component-internal literal. Good regression guard for this exact finding class.
- `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.test.tsx` and `libs/study-buddy/src/components/lesson-generation/lesson-generation.test.tsx` updated to assert the new `t()`-key-based label (`generation.step.generating, generation.step.status.current`), consistent with this codebase's convention of asserting raw i18n keys in tests.

All checks (a)-(c) from the task pass. No new hardcoded strings/colors/dimensions introduced by the fix.

## Rest of the fix diff (full-rubric pass)

- `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.helpers.ts` — `stepToIndex` now imports the ordered `GENERATION_PROGRESS_STEPS` from `@helsoft/types` instead of a locally hardcoded copy (round-1 finding #4, architecture-lens territory but no design regression — no UI change).
- `libs/components/src/organisms/lesson-generation-panel/lesson-generation-panel.tsx` — `useMemo` wrapping of `options`/`steps`/`statusLabels` (round-1 finding #7, perf-lens) is a pure memoization refactor; output shape/content unchanged, no token/style regression.
- `libs/study-buddy/src/components/lesson-generation/lesson-generation.tsx` — `useCallback` wrapping of handlers (same perf finding), no UI/behavior change.
- `libs/hooks/src/hooks/use-lesson-generation.ts`, `libs/types/src/lesson-generation.ts`, `libs/supabase-services/src/services/lesson-generation.*`, `supabase/functions/generate-lesson/_shared/*` — hook/service/edge-function/type-layer changes (round-1 findings #2/#3), no components touched, out of design-lens scope, no design issues found.
- `libs/components/src/molecules/index.ts` — added `export type * from './generation-progress/generation-progress.types'` barrel export; correct, no issue.

No new atomic-design placement issues, no ad-hoc styling, no missing UI state, no Storybook-coverage gap introduced by this diff.
