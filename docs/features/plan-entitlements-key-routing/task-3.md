---
id: task-3
title: Apply entitlements to plan-sensitive UI
slice: 2
scenarios: [s2, s3, s4, s5, s6, s9, s12, s13, s17]
status: done
paths:
  - apps/app-study-buddy/src/app/(app)/_layout.tsx
  - apps/app-study-buddy/src/app/(app)/settings.tsx
  - apps/app-study-buddy/src/app/(app)/upload.tsx
  - libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx
  - libs/study-buddy/src/components/api-key-gate/api-key-gate.test.tsx
  - libs/study-buddy/src/components/api-key-gate/api-key-gate.stories.tsx
  - libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx
  - libs/study-buddy/src/components/api-key-settings/api-key-settings.test.tsx
  - libs/study-buddy/src/components/api-key-settings/api-key-settings.stories.tsx
  - libs/study-buddy/tests/e2e/components/api-key-gate/api-key-gate.e2e.js
  - libs/study-buddy/tests/e2e/components/api-key-settings/api-key-settings.e2e.js
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
---

## Goal
Make upload/create and key settings consume `useEntitlements()`. Render no plan-sensitive controls while loading, show a localized error with retry for entitlement failures, preserve free no-key guidance, bypass the key gate for paid users, and leave lesson playback unguarded.

## Done criteria
- [x] Loading, free-key content, free-no-key empty, paid content, and error/retry states render per contract
- [x] Paid users never see key settings, even when a user key remains saved
- [x] Free no-key users receive key guidance while create/upload controls remain unavailable
- [x] Retry delegates to the hook and restores current-plan UI on success
- [x] Existing lesson routes/player remain independent of `canCreate`
- [x] Every React component has a Props type; no Redux
- [x] Stories, React Native Testing Library tests, and selected Storybook E2E cases cover all applicable states
- [x] User-facing strings are localized; no hardcoded style tokens
- [x] Scenarios `@s2`–`@s6`, `@s9`, `@s12`, `@s13`, `@s17` are mapped in `tdd.md`

## Notes
Do not briefly render free or paid controls before entitlement resolution. Client gating is UX only; server authorization remains task 4.
