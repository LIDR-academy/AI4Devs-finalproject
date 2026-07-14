---
id: task-9
title: i18n pdfList.* keys (en/es/pt/de) + coverage test
slice: 2
scenarios: [s20]
status: todo
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts]
---

## Goal
Add the `pdfList.*` string namespace to all four locale bundles: section heading, empty-state copy,
loading/error copy + retry action, the three status labels (`pdfList.status.ready`,
`pdfList.status.failed`, `pdfList.status.generated`), the three action labels
(`pdfList.action.generate`, `pdfList.action.retry`, `pdfList.action.openLesson`), created-date /
page-count label templates, action + delete accessible names, and the delete-confirm Dialog copy
(headline/body/confirm/cancel). No hardcoded UI strings anywhere in Slice 2/3.

## Done criteria
- [ ] Scenario(s) {s20} covered by the existing localization coverage test (keys aligned across en/es/pt/de)
- [ ] `TranslationResource` typing stays satisfied (build-time key alignment)
- [ ] Page-count/date rendered via `t` templates (wiring formats the value — task-11)
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
Mirror the `home.*` (saved-lessons) + `upload.*` key shapes; reuse the `home.delete.*` Dialog copy
shape for `pdfList.delete.*`.
