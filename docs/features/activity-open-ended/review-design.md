# review-design — activity-open-ended — FULL review

**Reviewer:** reviewer_design  
**CI:** green @ 8a1a77354d4d54012c595fc767a67db736204a35  
**Scope:** `libs/activities/src/organisms/open-ended/` + `libs/study-buddy/src/components/open-ended-activity/`  
**Rubric:** tokens / atomic placement / 4 UI states / Storybook / sibling parity  
**Siblings:** FITB + Matching + MCQ

## Verdict: APPROVED

## Findings

_None._

## Checks (pass)

| Check | Result |
|---|---|
| Tokens only | Pass — `open-ended.tsx:97-119` uses only `theme.spacing` / `theme.colors` / `theme.typography`. No hex/rgb/ad-hoc dims. |
| Existing components | Pass — `Card` / `Button` / `TextField` (`open-ended.tsx:4,47-68`). Multiline via `TextField` molecule (`rows` default 3). |
| Atomic placement | Pass — organism `libs/activities/src/organisms/open-ended/`; thin wiring `OpenEndedActivity` in study-buddy (no presentational styles). |
| 4 UI states | Pass — Loading N/A (`spec.md:137`). Content: unanswered + submitted (`open-ended.stories.tsx:33-40`). Empty+Error → unavailable (`spec.md:139-140`; story `:43-47`). |
| Stories | Pass — `Unanswered` / `SubmittedWithModelAnswer` / `Unavailable` / `Interactive` (`open-ended.stories.tsx:33-50`). Matches spec story list (`spec.md:84,138`). |
| Sibling parity | Pass — prompt/heading/body token map matches Matching/MCQ/FITB explanation blocks; Submit stays visible+disabled when locked (FITB pattern); labels injected by wrapper. |
