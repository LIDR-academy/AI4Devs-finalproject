---
id: task-4
title: Mount LocalizationProvider at app root with a first-paint gate
slice: 1
scenarios: [s1, s3, s4, s15]
status: done
paths:
  - apps/app-study-buddy/src/app/_layout.tsx
---

## Goal
Mount `<LocalizationProvider>` above the router in the app's root layout so every screen and shared component can translate, and gate first paint until i18n is ready (return `null`/hold splash), reusing the existing `useSession` loading pattern. This is the slice-1 end-to-end integration: the app boots, auto-detects the locale, and renders translated screens on every platform.

## Done criteria
- [ ] Scenario(s) @s1, @s3, @s4 covered end-to-end (an integration test renders the root with a mocked device locale and asserts the resolved language reaches a descendant)
- [ ] @s15: the same integration test runs under `jest-expo` (RN environment) proving platform-agnostic resolution; the shared config path is confirmed as the single source
- [ ] Provider wraps the `Stack`/`ThemeProvider` in `_layout.tsx`; first paint deferred until both session and i18n are ready
- [ ] No flash of untranslated/raw-key content before the locale resolves
- [ ] App remains a thin shell — no i18n business logic added to `apps/*`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Slice-1 gate: after this task the app demonstrably starts in the auto-detected language. Manual override/persistence arrives in slice 2.
- Web coverage of @s15 is completed via the Storybook Playwright e2e in task-12; this task covers the RN/native environment via jest-expo.
