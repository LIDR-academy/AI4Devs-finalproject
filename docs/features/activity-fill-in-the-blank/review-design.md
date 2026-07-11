# review-design — activity-fill-in-the-blank — SLICE 2

**Reviewer:** reviewer_design  
**Scope:** Slice 2 only — task-5 Empty + Error (unavailable) + empty-submit incorrect UI path  
**Deferred (not flagged):** Storybook (task-8), a11y (task-7)  
**Rubric:** `.agents/rules/review-standards.md` §2 + `.agents/rules/atomic-design.mdc`  
**Siblings:** `matching/matching.tsx`, `multiple-choice/multiple-choice.tsx`

## Verdict: APPROVED

## Findings

_None._

## Checks

| Check | Result |
|---|---|
| Unavailable state | Pass — early-return `Card` + `labels.unavailable` via `styles.prompt` (`fill-in-the-blank.tsx:69-74`); tokens `theme.typography.titleLarge` / `theme.colors.onSurface` / `theme.spacing.s4`. Non-interactive (no input/Submit). Matches Matching (`matching.tsx:93-98`) + MCQ (`multiple-choice.tsx:94-99`). |
| Wrapper wiring | Pass — `unavailable={!valid}` (`fill-in-the-blank-activity.tsx:64`); labels via `t('activity.fillInTheBlank.unavailable')` (`:37`). |
| Empty-submit incorrect path | Pass — same result-driven incorrect banner/reveal as Content incorrect (`fill-in-the-blank.tsx:100-116`): `bannerIncorrect` → `theme.colors.errorContainer`, `bannerText(false)` → `onErrorContainer`, Icon `cancel` + `theme.colors.error`, reveal via `acceptedAnswerShown`. No ad-hoc empty-submit styles. |
| Tokens / no ad-hoc | Pass — unavailable + banner reuse existing StyleSheet tokens only (`:128-181`). |
| Atomic placement | Pass — organism under `libs/activities/src/organisms/fill-in-the-blank/`; wiring in study-buddy unchanged. |
