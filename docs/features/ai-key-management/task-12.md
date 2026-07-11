---
id: task-12
title: Guard rail — ApiKeyRequiredNotice + ApiKeyGate + upload wiring
slice: 2
scenarios: [s10, s14]
status: done
paths: [libs/components/src/organisms/api-key-required-notice/api-key-required-notice.tsx, libs/components/src/organisms/api-key-required-notice/api-key-required-notice.test.tsx, libs/components/src/organisms/api-key-required-notice/index.ts, libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx, libs/study-buddy/src/components/api-key-gate/api-key-gate.test.tsx, libs/study-buddy/src/index.ts, apps/app-study-buddy/src/app/(app)/upload.tsx]
---

## Goal
Deliver the "no key" guard rail at the lesson-generation entry point (without implementing generation, which is R2):
- `ApiKeyRequiredNotice` (presentational organism in `@helsoft/components`): an inline message explaining an API key is required + an action that navigates to the account screen. Purely prop-driven (`onNavigateToAccount`, `t`-fed copy). The action is rendered via the `Button` atom (which sets `accessibilityRole="button"`), so the notice's action exposes a button role by construction.
- `ApiKeyGate` (feature component in `@helsoft/study-buddy`): reads `useApiKey().status.hasKey`; when `false` it renders `ApiKeyRequiredNotice` (navigating to `/settings`); when `true` it renders its `children` (the future R2 generation UI). While status is loading it renders neither branch (no flash of the notice — the loading facet of @s10).
- Wrap the Upload screen content (`apps/app-study-buddy/src/app/(app)/upload.tsx`) in `<ApiKeyGate>` so a keyless user attempting to generate sees the notice + link instead of a crash/silent failure.

## Done criteria
- [x] Scenario @s10 (loading facet): while key status is still loading, the gate renders neither the notice nor its children (no premature "key required" flash).
- [x] Scenario @s10 (guard facet): once status resolves to no-key, the generation entry renders the "API key required" message + a link to the account screen; nothing crashes or fails silently.
- [x] `ApiKeyRequiredNotice` test asserts the message + the navigation action fire; `ApiKeyGate` test asserts the three @s10 branches: loading → neither, no-key → notice, has-key → children.
- [x] Scenario @s14 (guard/notice context): `api-key-required-notice.test.tsx` asserts the notice's action exposes a button role (the action is the `Button` atom, which sets `accessibilityRole="button"`). The remaining a11y assertions over the UI (form input label + save/removal error announcement) are consolidated in task-14's a11y pass.
- [x] No generation logic is added (AC10 scope): the gate only guards; R2 builds inside it later.
- [x] Functional React, `Props` types, kebab-case; reuses existing tokens/components; no hardcoded strings; exports updated (organisms barrel + study-buddy index); upload screen stays a thin shell.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- The notice links to the account screen (Settings, `/settings`) where `ApiKeySettings` lives. Storybook stories + Playwright e2e for the notice land in task-14; copy across locales in task-13.
- The notice action's button role (@s14, guard/notice context) is asserted here at creation and re-verified in task-14's full a11y pass; the account-screen half of @s14 (input label, Save/Replace/Remove roles, error announcement) is owned by task-14.
