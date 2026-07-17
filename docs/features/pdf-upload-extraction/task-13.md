---
id: task-13
title: i18n — upload.* keys across en/es/pt/de
slice: 3
scenarios: [s15]
status: done
paths: [libs/localization/src/resources/]
---

## Goal
Add every user-facing string the upload flow needs to all four locale bundles, so no string is hardcoded and the key-alignment coverage test passes.

## Done criteria
- [ ] `upload.*` keys added to `en`, `es`, `pt`, `de`: labels/affordances (choose file, upload/continue), constraints hint (max size + pages, with interpolation), progress copy, success-summary copy (filename/page count/image count, with pluralization for images), and `upload.error.*` for every `PdfExtractionErrorCode` (`unsupportedType`, `fileTooLarge`, `tooManyPages`, `scannedNotSupported`, `corrupt`, `extractionFailed`, `network`, `unauthenticated`).
- [ ] Keys stay aligned across all bundles (typed against `TranslationResource` from `en`).
- [ ] Scenario @s15 covered by the localization coverage test (en/es/pt/de alignment) + the panel/wiring reading strings via `t()`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Follow the existing `en.ts` structure (mirror `auth.*`); reuse the existing `upload.intro` key and extend the `upload` namespace.
- Use interpolation for the limits hint (`{{maxMb}}`, `{{maxPages}}`) and pluralization for image counts (i18next `_one`/`_other`), mirroring `lessons.count_*`.
