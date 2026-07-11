# review-design — activity-matching (Slice 3)

**Verdict:** APPROVED  
**Scope:** tasks 6–9 — i18n, a11y, stories, e2e (`@s16`, `@s17`, story/e2e coverage)  
**Rubric:** `.agents/rules/review-standards.md` §2 + `.agents/rules/atomic-design.mdc`

## Findings

_None._

## Checks (Slice 3)

| Check | Result |
|---|---|
| Tokens only (no ad-hoc color/spacing/type) | Pass — `matching.tsx:209-312` uses `theme.spacing` / `theme.colors` / `theme.typography` / `theme.shape` / `theme.layout.touchTarget` / `theme.utils.mixHex`; item states mirror `AnswerOption` token map (pending≈selected, correct/incorrect identical) |
| Existing components reused | Pass — `Card`, `Button`, `Icon` from `@helsoft/components`; custom item `Pressable` justified (pending/paired states + no letter marker — `AnswerOption` cannot express them) |
| Atomic placement | Pass — organism at `libs/activities/src/organisms/matching/` |
| i18n labels (task-6) | Pass — `activity.matching.*` key-aligned in en/es/pt/de; `MatchingActivity` injects `labels` + interpolated `summary` via `t()` (`matching-activity.tsx:24-48`); organism has no hardcoded chrome |
| a11y tokens/targets (task-7) | Pass — `minHeight: theme.layout.touchTarget` (`matching.tsx:232`); correctness via text+`Icon` + label suffixes, not color alone; live-region + platform-guard mirrors MultipleChoice |
| Content states in stories | Pass — Unpaired, PartiallyPaired, SubmittedAllCorrect, SubmittedMixed (`matching.stories.tsx:77-100`) |
| Empty / Error stories | Pass — Empty (`leftItems: []`), Error (unequal lengths) (`matching.stories.tsx:103-114`) |
| Loading | N/A — documented Open decision in `spec.md` |
| Interactive + e2e | Pass — Interactive story present; Playwright `matching.e2e.js` **12/12** green (`--reporter=list`) |
| Sibling parity (MultipleChoice) | Pass — `Organisms/Matching` title, meta/args/Interactive pattern, banner/explanation token styles match `multiple-choice.tsx:142-178` |

## Prior slices

| Slice | Status |
|---|---|
| Slice 1 Content | previously APPROVED |
| Slice 2 Empty/Error | previously APPROVED |
