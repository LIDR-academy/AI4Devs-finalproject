# Design review — ai-lesson-generation (round 2, re-review)

**Verdict: APPROVE**

Scope: `git diff 79d86f5..bc4ac00`.

## R1 finding #1 (Medium-High) — hardcoded status labels — FIXED
`generation-progress.tsx` — `STATUS_LABEL` map removed; `accessibilityLabel` built from new `statusLabels` prop. Molecule stays presentational/i18n-free (no `t()` import). `generation-progress.types.ts:17` adds required `statusLabels: Record<GenerationProgressStepStatus, string>`. `lesson-generation-panel.tsx:28-33,74-82,101-105` builds it via `t()` from new `generation.step.status.{done,current,upcoming}` keys — correct organism-owns-i18n placement. All 4 locale bundles have genuinely distinct translations. Stories (`generation-progress.stories.tsx:14,19-22`) updated with `statusLabels` in `meta.args`. Tests use non-English fixture + negative assertion against hardcoded English.

## Rest of fix diff (full-rubric pass)
- `lesson-generation-panel.helpers.ts` — `stepToIndex` now imports shared `GENERATION_PROGRESS_STEPS`, no UI change.
- `useMemo`/`useCallback` additions in panel + study-buddy component — pure perf refactor, no token/style regression.
- Hook/service/edge-function/type-layer changes — no components touched, out of design-lens scope.
- `molecules/index.ts` barrel export addition — correct.

No new atomic-design placement issues, ad-hoc styling, missing UI state, or Storybook-coverage gap.
