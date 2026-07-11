---
feature: activity-matching
reviewer: architecture
round: 2
verdict: APPROVED
---

# Architecture review — activity-matching (round 2)

## Verdict
**APPROVED** — zero findings. B1/M1 a11y fixes are UI-only (`matching.tsx` accessibilityState + contrast token); no layering regressions.

## Layer map

| Layer | Path | Role |
|---|---|---|
| Types | `libs/types/src/lesson.ts`, `activity-answer.ts` | `MatchingSlide` / `MatchingPair` / `MatchingAnswer` / `GradedPair` |
| Presentational | `libs/activities/src/organisms/matching/` | `Matching` organism — tap-to-pair UI only |
| Domain / wiring | `libs/study-buddy/src/grading/grade-matching.ts`, `components/matching-activity/` | pure grader + `MatchingActivity` |
| i18n chrome | `libs/localization` | `activity.matching.*` keys only |
| DAO / Service / Hook | — | correctly absent (no I/O) |
| App | — | no matching code in `apps/*` |

## Checks

- **Component → Hook → Service → DAO:** N/A for I/O; pure grading in study-buddy matches MC precedent. No DAO/service/hook added.
- **Cross-layer:** `Matching` imports only `@helsoft/components` (+ RN). No `@helsoft/types`, grader, services, hooks, DAOs. `MatchingActivity` → organism + `gradeMatching` + `useLocalization`; no DAO.
- **DTO / domain leak:** organism uses local view types; `correctPairs` never reach organism. Domain types stay in `@helsoft/types`.
- **Business logic:** `isMatchingSlideValid` / `gradeMatching` in `@helsoft/study-buddy`; activities stay presentational. `grade-matching.ts` has no React.
- **Barrels:** `libs/types`, `libs/activities` organisms, `libs/study-buddy` export matching symbols.
- **Deps:** `@helsoft/activities` still only `@helsoft/components`; no new packages. Feature lib pairs with `app-study-buddy`.
- **`pnpm check-types`** (`@helsoft/types`, `@helsoft/activities`, `@helsoft/study-buddy`, `@helsoft/localization`): pass.

## Findings
_None._
