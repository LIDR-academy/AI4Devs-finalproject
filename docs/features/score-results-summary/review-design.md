# review-design — score-results-summary (slice 2, round 2)

**Verdict: APPROVED**

Scope: round-2 scoped design-system gate, fix diff on top of `5525f74` (`git diff HEAD -- libs/`).

## Verified

- **Major 1 (iOS announcement parity)** — `libs/components/src/organisms/results-summary/results-summary.tsx:69-73` adds `useEffect(() => { if (saveFailed && variant === 'score') AccessibilityInfo.announceForAccessibility(labels.saveFailed); }, [saveFailed, variant, labels.saveFailed])`. Diffed against `login-form.tsx:84-88`'s `errorMessage` effect (`useEffect(() => { if (errorMessage) announce(errorMessage) }, [errorMessage])`): same imperative-call shape, same "fires on the truthy transition" semantics. Traced `useLessonAttempt.retry()` (`libs/hooks/src/hooks/use-lesson-attempt.ts:56-59,31-44`) → `runSave` → `setStatus('saving')` before re-attempting, so `saveFailed` genuinely cycles `true → false → true` on a repeat failure, re-firing the effect exactly like `LoginForm` re-announces a repeat auth error. Real parity, not just "a call exists." The added `variant === 'score'` guard correctly mirrors the visual render guard at `:89` — verified with the two new tests (`results-summary.test.tsx:169-213`) covering both fire and non-fire (completion variant) cases.
- **Major 2 (missing stories)** — `lesson-results.stories.tsx:65-75,104-117` adds `Completion` (new `instructionalOnlyLesson` fixture, `answers: []`, `withLessonAttemptMock({ status: 'idle' })`) and `SaveFailed` (default scorable-lesson args, `withLessonAttemptMock({ status: 'error' })`). Traced the render paths: `toScorableSlides` filters `kind !== 'activity'`, so `instructionalOnlyLesson`'s single `instructional` slide yields `isScorable: false` → completion variant, no score text, matching pre-existing Jest coverage at `lesson-results.test.tsx:178-183`. `SaveFailed` reuses the scorable fixture with `status: 'error'` → `variant: 'score'` + `saveFailed: true`, matching pre-existing coverage at `lesson-results.test.tsx:192` (score + notice + retry render together). Both stories reuse the existing `withLessonAttemptMock` decorator — no new pattern introduced, consistent with `Score`/`Loading` above them and with `results-summary.stories.tsx`'s 4-state convention.
- **Style key rename** (`score`/`percent` → `headline`/`body`, `results-summary.tsx:80-86,123-129`) — pure rename, same tokens (`theme.typography.headlineSmall`/`titleMedium`, `theme.colors.onSurface`/`onSurfaceVariant`), and now matches sibling organism naming (`dialog.tsx:50-51` also uses `styles.headline`/`styles.body`). No violation.
- **`variant === 'score'` guard on the notice** (`results-summary.tsx:89`) and **graceful `onRetrySave` degradation** (`:94-98`) — no ad-hoc tokens or atomic-design placement changes; both are conditional-render additions using only existing `Button`/`View` usage.
- `results-summary.stories.tsx` unchanged from round 1 — still covers all 4 states (Score/Loading/Completion/SaveFailed), not regressed.
- `docs/features/score-results-summary/spec.md`'s UI-states table and `gherkin-scenarios.md` `@s7`/`@s8`/`@s9`/`@s10` still hold against the current behavior (re-read, no drift).

## Verified green
`pnpm --filter @helsoft/components test` — 8 suites / 88 tests pass. `pnpm --filter @helsoft/components check-types` — clean. `pnpm --filter @helsoft/study-buddy test` — 8 suites / 49 tests pass. `pnpm --filter @helsoft/study-buddy check-types` — clean.

## Findings
None.
