---
id: task-10
title: LessonGeneration wiring + PdfUpload onExtracted + upload screen + integration
slice: 1
scenarios: [s1, s3, s16, s17]
status: todo
paths:
  - libs/study-buddy/src/components/lesson-generation/
  - libs/study-buddy/src/components/pdf-upload/
  - libs/study-buddy/src/index.ts
  - apps/app-study-buddy/src/app/(app)/upload.tsx
---

## Goal
The feature-wiring component that puts the composition picker on the same screen as the upload widget (decision #3) and drives generation. Owns composition state (default `both`), calls `useLessonGeneration`, receives the extracted `documentId` as a prop, threads it into `generate`, maps chrome copy via `t('generation.*')`, and hands the returned deck to the player entry point. Keeps `upload.tsx` a thin shell. Also adds the `documentId` hand-off out of R1's `PdfUpload` (decision #9).

## documentId hand-off (decision #9 — concrete mechanism, not "implementation detail")
- **`libs/study-buddy/src/components/pdf-upload/`** — `PdfUpload` gains an **additive, optional** `onExtracted?: (documentId: string) => void` prop, fired **once** when its own `usePdfExtraction()` result first transitions to a value carrying a `documentId` (guard against re-firing on re-render; a `useEffect` keyed on `result?.documentId` is the shape). Add a `pdf-upload.types.ts` Props type (per `component-split.mdc`, since the component now takes a prop) and extend `pdf-upload.test.tsx` to assert `onExtracted` fires exactly once with the extracted id and does **not** fire on the idle/loading/error stages. Existing R1 callers omit the prop → identical behavior (backward-compatible).
- **`apps/app-study-buddy/src/app/(app)/upload.tsx`** — lift a single `documentId` value (`useState<string | undefined>`) and thread it to both siblings: `<PdfUpload onExtracted={setDocumentId} />` and `<LessonGeneration documentId={documentId} />`, both still inside `<ApiKeyGate>`. This one handoff value is the **only** state the screen holds; no business logic (composition, orchestration, error handling all stay in the libs) — the screen stays a thin shell.
- **`LessonGeneration`** takes a `documentId?: string` prop; before extraction it renders the picker but gates Generate (`canGenerate = !!documentId`, @s16).

## Coordination
- On success, navigate to the player with the in-memory deck (placeholder nav until R4; mirrors R1's Content-CTA placeholder).
- `upload.tsx` composes `<ApiKeyGate>` → `PdfUpload` + `LessonGeneration` siblings; routing + the `documentId` handoff only, no business logic.

## Done criteria
- [ ] Scenarios @s1 (default both) / @s3 (end-to-end both → typed deck) / @s16 (gating on `documentId`) / @s17 (deck → player hand-off) covered by `lesson-generation.test.tsx` + a slice integration test (`lesson-generation.integration.test.tsx`) mocking `functions.invoke`
- [ ] `PdfUpload.onExtracted` fires once with the extracted `documentId` (asserted in `pdf-upload.test.tsx`); no regression to the existing zero-prop R1 behavior
- [ ] Wiring maps `generation.*` i18n keys + narrows `RadioGroup` value to `LessonComposition`; presentational panel stays i18n-free
- [ ] `upload.tsx` stays a thin shell (routing + the single `documentId` handoff `useState` + composition only)
- [ ] `LessonGeneration` exported through the `@helsoft/study-buddy` barrel
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Mirrors the `PdfUpload` / `ApiKeySettings` wiring precedent (hook + `useLocalization` → presentational organism).
- The deck is in-memory (no persistence, Open decision #5); the player hand-off passes it via nav params/state until R5.
- **Discarded alternative (decision #9):** lifting `usePdfExtraction()` itself into `upload.tsx` — rejected to keep hook/business logic in the libs and leave R1's shipped `PdfUpload` extraction lifecycle intact.
