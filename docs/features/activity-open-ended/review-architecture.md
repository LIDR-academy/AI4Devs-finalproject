---
feature: activity-open-ended
reviewer: architecture
round: 1
verdict: APPROVED
base: feature-entrega2-HernanLaura
head: 8a1a77354d4d54012c595fc767a67db736204a35
ci: green (lint, check-types, test; playwright open-ended e2e 8/8)
---

# Architecture review — activity-open-ended (FULL R1)

## Verdict
**APPROVED** — zero findings.

## Layer map

| Layer | Path | Role |
|---|---|---|
| Types | `libs/types/src/lesson.ts`, `activity-answer.ts` | `OpenEndedSlide` / `OpenEndedAnswer` unions |
| Presentational | `libs/activities/src/organisms/open-ended/` | `OpenEnded` organism (component-split) |
| Domain / wiring | `libs/study-buddy/src/grading/is-open-ended-slide-valid.ts`, `components/open-ended-activity/` | pure validity + thin `OpenEndedActivity` |
| i18n | `libs/localization/src/resources/{en,es,pt,de}.ts` | `activity.openEnded.*` keys |
| DAO / Service / `@helsoft/hooks` | — | correctly absent (no I/O; matches spec) |
| App | — | no `apps/*` changes |

## Checks

- **Component → Hook → Service → DAO:** N/A for I/O. No DAO/service/`@helsoft/hooks` added. Co-located `use-open-ended` is UI state only (component-split), not a data hook.
- **Cross-layer:** organism imports only RN / unistyles / `@helsoft/components` + local files — no `@helsoft/types`, study-buddy, services, DAOs. Wiring → organism + `isOpenEndedSlideValid` + `useLocalization`; no DAO.
- **DTO leak:** none (no DAO surface). Domain types stay in `@helsoft/types`; organism uses local `OpenEndedProps` / labels.
- **Business logic in `libs/*`:** validity + answer emission in study-buddy; apps untouched. Barrels updated (`activities` organisms, `study-buddy` index). Types re-exported via existing `libs/types/src/index.ts`.
- **Deps:** no `package.json` / lockfile changes. Dep direction: activities → components; study-buddy → activities. Feature lib pairs with `app-study-buddy`.

## Findings
_None._
