---
id: task-10
title: Migrate all app screens + nav titles to keys (incl. interpolation + pluralization)
slice: 3
scenarios: [s9, s10, s11, s14]
status: done
paths:
  - apps/app-study-buddy/src/app/_layout.tsx
  - apps/app-study-buddy/src/app/(app)/_layout.tsx
  - apps/app-study-buddy/src/app/(app)/index.tsx
  - apps/app-study-buddy/src/app/(app)/upload.tsx
  - apps/app-study-buddy/src/app/(app)/settings.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/index.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/player.tsx
  - apps/app-study-buddy/src/app/(app)/lesson/[id]/results.tsx
  - apps/app-study-buddy/src/app/(auth)/_layout.tsx
  - apps/app-study-buddy/src/app/(auth)/login.tsx
  - apps/app-study-buddy/src/app/(auth)/sign-up.tsx
  - libs/localization/src/resources/en.ts
  - libs/localization/src/resources/es.ts
  - libs/localization/src/resources/pt.ts
  - libs/localization/src/resources/de.ts
---

## Goal
Replace every hardcoded user-facing string in `apps/app-study-buddy/` with translation keys, including Expo Router `Stack.Screen` titles in the `_layout` files. Add the matching keys to all four bundles (`en` authoritative; `es`/`pt`/`de` provided). Introduce at least one **interpolated** key (e.g. the "lesson <id>" title, which already interpolates an id) and one **pluralized** key (e.g. a saved-lessons/slide count), proving AC11/AC12.

## Done criteria
- [ ] Scenario(s) @s10 (interpolation), @s11 (pluralization), @s14 (no app-side hardcoded copy) covered by concrete tests
- [ ] @s9: a screen rendering a key absent from a non-`en` bundle shows the English fallback (verified via test)
- [ ] All visible strings in every listed screen + both `_layout` nav-title sets sourced from keys via `useLocalization`
- [ ] Keys added to `en`/`es`/`pt`/`de`, bundles key-aligned; one interpolated key + one pluralized key present in all four
- [ ] Nav titles set from `t(...)` inside the provider tree (layouts render under the root provider)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- R5: run an audit (grep literal JSX text + `title:` strings) to be sure none are missed; reviewer_code checks against AC9.
- R9: use i18next's standard per-locale plural key convention; test pluralization for at least one non-English locale.
