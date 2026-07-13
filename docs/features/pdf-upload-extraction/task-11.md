---
id: task-11
title: PdfUploadPanel — Empty + Error + Retry states
slice: 2
scenarios: [s7, s8, s9, s10, s11, s12, s13]
status: done
paths: [libs/components/src/organisms/pdf-upload-panel/]
---

## Goal
Complete the presentational organism's 4-state model: the **Empty/pristine** state and the **Error** state (with a retry / choose-another affordance) for every `PdfExtractionErrorCode`. Still pure presentation driven by props.

## Done criteria
- [ ] **Empty/pristine**: "choose a PDF" affordance, constraints hint (max size + max pages), upload control disabled, no error. *(→ @s7)*
- [ ] **Error**: renders the message passed for the current error code + a retry/"choose another file" affordance; panel returns to a usable state. Covers the code family @s8/@s9/@s10/@s11/@s12/@s13.
- [ ] Error copy + constraints text arrive via props (localized by the wiring layer) — no hardcoded user-facing strings.
- [ ] `pdf-upload-panel.test.tsx` extended: Empty renders (control disabled, constraints shown, no error) and Error renders per code + retry callback wiring.
- [ ] `pdf-upload-panel.stories.tsx` extended with Empty + Error stories (all 4 states now covered).
- [ ] Reuses existing tokens/atoms; correct atomic-design placement.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Builds on task-7's `state` discriminator — no reshape.
- The retry affordance calls back to the wiring layer (task-12), which re-invokes the hook.
