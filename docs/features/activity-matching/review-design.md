# review-design — activity-matching — FULL review, Round 2

**Reviewer:** reviewer_design  
**Scope:** full feature re-review after a11y B1/M1 fixes  
**Rubric:** `.agents/rules/review-standards.md` §2 + `.agents/rules/atomic-design.mdc`  
**Sibling:** `libs/activities/src/organisms/multiple-choice/` + `AnswerOption` molecule

## Verdict: APPROVED — zero findings

## Round 2 re-checks (B1 / M1)

| Fix | Result |
|---|---|
| B1 — correct label → `onTertiaryContainer` | Pass — `matching.tsx:281-282` uses `theme.colors.onTertiaryContainer` on `mixHex(tertiaryContainer, surface, 0.55)` (`:253-256`). Matches banner/summary token pairing (`:300`, `:304`) and MC banner (`multiple-choice.tsx:165`). |
| M1 — pending `selected` vs paired `checked` | Pass — `matching.tsx:163-167`: `selected: state === 'pending'`, `checked: state === 'paired'`. Visual tokens still distinct: pending=`primaryContainer`/`primary` (`:241-246`), paired=`secondaryContainer`/`outline` (`:247-252`). |

## Findings

_None._

## Checks

| Check | Result |
|---|---|
| Tokens only (no ad-hoc color/spacing/type) | Pass — `matching.tsx:214-317` uses only `theme.spacing` / `theme.colors` / `theme.typography` / `theme.shape` / `theme.layout.touchTarget` / `theme.utils.mixHex`. Icon `size={22}` matches `AnswerOption`. No hex/rgb/ad-hoc dims. |
| Existing components reused | Pass — `Card`, `Button`, `Icon` from `@helsoft/components`. Custom item `Pressable` justified: `AnswerOption` has no `pending`/`paired` states. |
| Atomic placement | Pass — organism `libs/activities/src/organisms/matching/`; wiring `MatchingActivity` in study-buddy (no presentational styles). |
| 4 UI states | Pass — Loading N/A. Content: unpaired / partially-paired / submitted-all-correct / submitted-mixed. Empty + Error → `labels.unavailable` (`:80-98`). |
| Stories cover required states | Pass — `Unpaired`, `PartiallyPaired`, `SubmittedAllCorrect`, `SubmittedMixed`, `Empty`, `Error`, `Interactive` (`matching.stories.tsx:77-134`). |
| Sibling parity (MultipleChoice) | Pass — banner/explanation token map matches MC; labels-injection via wrapper. Correct-tile label now uses `onTertiaryContainer` (stricter than AnswerOption's `onTertiary` on the same mix — intentional contrast fix, still a design token). |
| MatchingActivity | Pass — locale-agnostic organism; wrapper injects `t()` (`matching-activity.tsx:24-62`); no ad-hoc chrome. |
