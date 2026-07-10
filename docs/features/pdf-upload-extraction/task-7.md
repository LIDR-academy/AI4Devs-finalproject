---
id: task-7
title: PdfUploadPanel organism — Loading + Content states
slice: 1
scenarios: [s5, s6]
status: todo
paths: [libs/components/src/organisms/pdf-upload-panel/]
---

## Goal
Create the presentational `PdfUploadPanel` organism in `@helsoft/components`: a stateless component driven entirely by props that renders the upload UI. This task delivers the **Loading** and **Content (success)** states; Empty + Error land in Slice 2 (task-11). No hooks, no services — pure presentation, composed from existing atoms.

## Done criteria
- [ ] `PdfUploadPanel` with a `Props` type; state driven by props (e.g. `state`, `onChooseFile`, `onUpload`, `result`, `filename`).
- [ ] **Loading**: renders the existing `ProgressIndicator` (indeterminate) + progress copy; upload control disabled. *(→ @s5)*
- [ ] **Content**: renders the success summary — filename, page count, image count — and a continue affordance (target is a placeholder callback; generation is out of scope). *(→ @s6)*
- [ ] Composed from existing tokens/atoms (`Card`, `Button`, `Icon`, `ProgressIndicator`); no ad-hoc colors/spacing/typography (`.agents/rules/atomic-design.mdc`).
- [ ] `pdf-upload-panel.test.tsx` (RN Testing Library) asserts each state renders + control disabled/enabled wiring for @s5/@s6.
- [ ] `pdf-upload-panel.stories.tsx` with a story per state (Loading, Content) — Storybook, mirror `libs/lib-with-storybook` patterns.
- [ ] Exported through `libs/components/src/organisms/index.ts`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green; all copy comes via props/`t()` (no hardcoded user-facing strings).

## Notes
- Organism placement: composes several atoms into a distinct section (mirrors `login-form`).
- Strings are passed in (localized by the wiring layer) so the presentational component stays i18n-agnostic; the story can pass literal props.
- Keep the state model open (a `state` discriminator) so task-11 adds Empty + Error without reshaping.
