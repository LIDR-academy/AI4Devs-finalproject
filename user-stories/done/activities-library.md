# @helsoft/activities library (scaffold + multiple-choice migration)

**As a** developer building activity-slide components
**I want** a dedicated `@helsoft/activities` library (Storybook + Jest + Playwright + Stryker, scaffolded like `@helsoft/components`) with the existing `MultipleChoice` organism moved into it
**so that** every activity-slide component — current and future (multiple choice, fill-in-the-blank, flashcard, matching, open-ended, ...) — lives in one dedicated place instead of mixed into the general design-system library

## Context
- Today `MultipleChoice` (organism, already shipped) lives in `libs/components/src/organisms/multiple-choice/` alongside unrelated design-system components (buttons, dialogs, cards, ...). The four in-flight activity stories (`activity-open-ended.md`, `activity-flashcard-recall.md`, `activity-matching.md`, `activity-fill-in-the-blank.md`) are updated in this same round to target `@helsoft/activities` instead of `@helsoft/components` for their organism.
- New workspace package `libs/activities` (`@helsoft/activities`), scaffolded like `libs/components` (which already has Storybook, Jest, Playwright e2e, and Stryker wired) — not the bare `libs/lib-with-storybook` template, since activities need the same full tooling `@helsoft/components` has, not just Storybook.
- `@helsoft/activities` depends on `@helsoft/components` (`workspace:*`) for shared atoms/molecules/theme (e.g. `Card`, `AnswerOption`, tokens) — same dependency pattern `@helsoft/components` already uses for `@helsoft/hooks`/`@helsoft/localization`/`@helsoft/types`. No duplication of the design system.
- Migration is mechanical: move `libs/components/src/organisms/multiple-choice/` (component, `.test.tsx`, `.stories.tsx`) and `libs/components/tests/e2e/organisms/multiple-choice/` (`.e2e.js`) into `libs/activities`, update `@helsoft/components`' barrels (`src/index.ts`, `src/organisms/index.ts` or equivalent) to drop the export, and update the one existing consumer — `libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx` (plus its `.test.tsx`, which currently does `jest.requireActual('@helsoft/components').MultipleChoice`) — to import `MultipleChoice`/`MultipleChoiceLabels` from `@helsoft/activities`. `libs/study-buddy/package.json` gains a `@helsoft/activities` dependency.
- Grading logic (`grade-multiple-choice.ts`) and the `MultipleChoiceActivity` feature-wiring wrapper stay in `@helsoft/study-buddy` — only the presentational organism moves. The `Component → Hook → Service → DAO` layering (`.agents/rules/hooks-service-dao.mdc`) is unchanged; this only changes which library the presentational layer sits in.
- Include StrykerJS in the new package's initial setup (mirror `@helsoft/components`' `package.json`: dev deps + `mutation` script), since the orchestrator's review pipeline runs mutation testing on every feature and activities will carry testable presentational logic from day one.
- `pnpm-workspace.yaml` already globs `libs/*`, so no change needed there; update `AGENTS.md`'s lib list (and `.agents/rules/global.mdc` if it enumerates libs) to document `@helsoft/activities` as the home for activity-slide organisms going forward.
- No analytics/feature flag — internal restructuring only.

## Acceptance criteria
- Given the monorepo, when `libs/activities` is added, then it's a valid pnpm workspace member (`@helsoft/activities`, referenced as `workspace:*`) with its own `package.json`, `tsconfig.json` (extending `tsconfig.base.json`), Storybook config (`dev` script on a port that doesn't collide with `@helsoft/components`' 6007 or `lib-with-storybook`'s 6006), Jest config, and Playwright config — mirroring `@helsoft/components`' setup.
- Given `pnpm --filter @helsoft/activities dev`, then Storybook starts and renders the migrated `multiple-choice.stories.tsx`.
- Given `pnpm --filter @helsoft/activities test`, then Jest runs and the migrated `multiple-choice.test.tsx` passes.
- Given `pnpm --filter @helsoft/activities test:e2e`, then Playwright runs the migrated `multiple-choice.e2e.js` against the Storybook build.
- Given `pnpm turbo run mutation --filter=@helsoft/activities`, then Stryker runs against the lib's changed source and reports a score.
- Given the migration is complete, then `libs/components/src/organisms/multiple-choice/` and `libs/components/tests/e2e/organisms/multiple-choice/` no longer exist, and `@helsoft/components`' barrels no longer export `MultipleChoice`/`MultipleChoiceProps`/`MultipleChoiceLabels`/`MultipleChoiceOptionView`.
- Given `libs/study-buddy`'s `MultipleChoiceActivity`, when it imports the presentational component, then it imports from `@helsoft/activities`, not `@helsoft/components`; the existing `multiple-choice-activity` tests, stories, and e2e still pass with unchanged behavior (only the import path and `package.json` dependency change).
- Given a future activity type is added after this story ships, then its organism is created under `libs/activities`, not `libs/components`.

## Notes
- Exact internal folder shape inside `libs/activities/src` (e.g. `organisms/multiple-choice/` mirroring `@helsoft/components`, vs. a flatter structure) and the Storybook port number are open decisions for `spec_partner`.
- Should be built before or alongside `activity-open-ended.md`, `activity-flashcard-recall.md`, `activity-matching.md`, `activity-fill-in-the-blank.md`, since those now target `@helsoft/activities` for their organism.
- No analytics event for this story.
