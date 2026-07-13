---
id: task-10
title: LessonGeneration wiring + PdfUpload onExtracted + upload screen + integration
slice: 1
scenarios: [s1, s3, s16, s17]
status: done
paths:
  - libs/study-buddy/src/components/lesson-generation/
  - libs/study-buddy/src/components/pdf-upload/
  - libs/study-buddy/src/index.ts
  - apps/app-study-buddy/src/app/(app)/upload.tsx
---

## Goal
The feature-wiring component that puts the composition picker on the same screen as the upload widget (decision #3) and drives generation. Owns composition state (default `both`), calls `useLessonGeneration`, receives the extracted `documentId` as a prop, threads it into `generate`, maps chrome copy via `t('generation.*')`, and hands the returned deck to the player entry point. Keeps `upload.tsx` a thin shell. Also adds the `documentId` hand-off out of R1's `PdfUpload` (decision #9).

## documentId hand-off (decision #9 — concrete mechanism, see spec.md for full rationale)
- `PdfUpload` gains an additive, optional `onExtracted?: (documentId: string) => void` prop, fired once when `usePdfExtraction()` first resolves a `documentId` (guarded via `useEffect` keyed on `result?.documentId`, no re-fire on re-render). Adds `pdf-upload.types.ts` Props type (`component-split.mdc`). Test asserts it fires exactly once, not on idle/loading/error. Existing R1 callers omit the prop — backward-compatible.
- `upload.tsx` lifts a single `documentId` (`useState<string | undefined>`), threads it to `<PdfUpload onExtracted={setDocumentId} />` and `<LessonGeneration documentId={documentId} />`, both inside `<ApiKeyGate>`. Only state the screen holds — no business logic.
- `LessonGeneration` takes `documentId?: string`; gates Generate via `canGenerate = !!documentId` (@s16) before extraction.

## Coordination
On success, navigate to the player with the in-memory deck (placeholder nav until R4, mirrors R1's Content-CTA). `upload.tsx` composes `<ApiKeyGate>` → `PdfUpload` + `LessonGeneration` siblings; routing + handoff only.

## Done criteria
- [x] Scenarios @s1 (default both) / @s3 (end-to-end both → typed deck) / @s16 (gating on `documentId`) / @s17 (deck → player hand-off) covered by `lesson-generation.test.tsx` + a slice integration test (`lesson-generation.integration.test.tsx`) mocking `functions.invoke`
- [x] `PdfUpload.onExtracted` fires once with the extracted `documentId` (asserted in `pdf-upload.test.tsx`); no regression to the existing zero-prop R1 behavior
- [x] Composition narrowed from `RadioGroup`'s raw string via `isLessonComposition`; **deviation**: `generation.*` i18n mapping ended up owned by `LessonGenerationPanel` (mirrors the `LanguageSettings` precedent), not `LessonGeneration` — no leftover chrome copy for the wiring layer to map
- [x] `upload.tsx` stays a thin shell (routing + the single `documentId` handoff `useState` + composition only)
- [x] `LessonGeneration` exported through the `@helsoft/study-buddy` barrel
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [x] No hardcoded strings/colors/dimensions

## Notes
- Mirrors the `PdfUpload` / `ApiKeySettings` wiring precedent (hook + `useLocalization` → presentational organism).
- The deck is in-memory (no persistence, Open decision #5); the player hand-off passes it via nav params/state until R5.
- **Discarded alternative (decision #9):** lifting `usePdfExtraction()` itself into `upload.tsx` — rejected to keep hook/business logic in the libs and leave R1's shipped `PdfUpload` extraction lifecycle intact.
