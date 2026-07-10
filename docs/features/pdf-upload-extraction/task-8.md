---
id: task-8
title: PdfUpload wiring + upload screen shell + slice-1 integration
slice: 1
scenarios: [s1, s4, s5, s6]
status: todo
paths: [libs/study-buddy/src/components/pdf-upload/, apps/app-study-buddy/src/app/(app)/upload.tsx]
---

## Goal
Wire the happy path end-to-end: a `PdfUpload` feature component in `@helsoft/study-buddy` that owns the file picker + `usePdfExtraction` + localized strings and renders `PdfUploadPanel`; the app `upload.tsx` screen becomes a thin shell rendering `PdfUpload`. Add the slice's integration test across hook→service→DAO with a mocked Supabase client / `functions.invoke`.

## Done criteria
- [ ] `libs/study-buddy/src/components/pdf-upload/pdf-upload.tsx` (+ `pdf-upload.test.tsx`): uses `expo-document-picker` to choose a PDF, calls `usePdfExtraction`, maps `stage`/`result` → `PdfUploadPanel` props, and passes localized `t('upload.*')` strings.
- [ ] `apps/app-study-buddy/src/app/(app)/upload.tsx` renders `ScreenContainer` + `<PdfUpload />` only (thin shell; replaces the `upload.intro` placeholder body).
- [ ] Exported through `libs/study-buddy/src/index.ts` (mirror `SignInForm`/`SignOut`/`LanguageSettings`).
- [ ] Scenarios @s1/@s4 (happy path client→backend), @s5 (loading), @s6 (content) covered by the wiring test + a slice-1 integration test (hook→service→DAO, mocked Supabase + `functions.invoke`).
- [ ] `expo-document-picker` (+ `expo-file-system` for native reads) added as app dependencies; platform read isolated per risk R5.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded user-facing strings (all via `t()`); no ad-hoc UI.

## Notes
- Mirror the established `LanguageSelector`(presentational) → `LanguageSettings`(wiring) → screen and `LoginForm` → `SignInForm` → screen splits.
- `upload.*` i18n keys land fully in Slice 3 (task-13); use the existing `upload.intro` plus new keys as needed and ensure Slice 3 completes the bundles.
- Error/empty/retry wiring is Slice 2 (task-11, task-12); this task is happy path only.
