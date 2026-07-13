---
id: task-7
title: PdfUploadPanel organism — Loading + Content states
slice: 1
scenarios: [s5, s6]
status: done
paths: [libs/components/src/organisms/pdf-upload-panel/]
---

## Goal
Create the presentational `PdfUploadPanel` organism in `@helsoft/components`: a stateless component driven entirely by props that renders the upload UI. This task delivers the **Loading** and **Content (success)** states; Empty + Error land in Slice 2 (task-11). No hooks, no services — pure presentation, composed from existing atoms.

## Done criteria
- [x] `PdfUploadPanel` with a `Props` type; state driven by a `state` discriminator (`'idle' | 'loading' | 'content'` — `'idle'` is the minimal pre-pick render task-8's wiring needs; task-11 adds `'error'`), plus `onChooseFile`, `onContinue`, `filename`/`pageCount`/`imageCount`, `labels`.
- [x] **Loading**: renders the existing `ProgressIndicator` (indeterminate) + progress copy; the choose-file (upload) control disabled. *(→ @s5)*
- [x] **Content**: renders the success summary — filename, page count, image count — and a continue affordance (target is a placeholder callback; generation is out of scope). *(→ @s6)*
- [x] Composed from existing tokens/atoms (`Card`, `Button`, `ProgressIndicator`; `Icon` not needed directly here — `Button` already composes it internally); no ad-hoc colors/spacing/typography (`.agents/rules/atomic-design.mdc`).
- [x] `pdf-upload-panel.test.tsx` (RN Testing Library) asserts each state renders + control disabled/enabled wiring for @s5/@s6.
- [x] `pdf-upload-panel.stories.tsx` with a story per state (Loading, Content) — Storybook, mirror `libs/lib-with-storybook` patterns.
- [x] Exported through `libs/components/src/organisms/index.ts`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; all copy comes via props/`t()` (no hardcoded user-facing strings).

## Notes
- Organism placement: composes several atoms into a distinct section (mirrors `login-form`).
- Strings are passed in (localized by the wiring layer) so the presentational component stays i18n-agnostic; the story can pass literal props.
- Keep the state model open (a `state` discriminator) so task-11 adds Empty + Error without reshaping.
- **Real addition beyond the literal `'loading' | 'content'` spec:** the wiring layer (task-8) structurally needs a valid `state` value to pass before any file is picked (`usePdfExtraction`'s `'idle'` stage) — `'idle'` renders just the enabled choose-file control and nothing else (not the fuller AC7 Empty state with the constraints hint, which stays task-11's job with its own failing tests). Added via its own RED→GREEN cycle in `tdd.md`.
