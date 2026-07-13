# review-slice.md — ai-lesson-generation, Slice 2 (tasks 11–13)

**Verdict: APPROVED**

Scope reviewed: the entire uncommitted working-tree diff against `8e7ffb6` (slice 1) —
composition-variant enforcement (task-11: `lesson-generation.assembly.ts` `assertComposition` +
locking prompt tests), server error contract + vision fallback + image degradation (task-12: new
`lesson-generation.errors.ts` `mapGenerationError`/`GenerationTimeoutError`, `placement.ts`
`applyVisionPlacements`, `generate-lesson/index.ts` `withTimeout`/vision round-trip/degrade-on-
failure), and client error normalization + hook retry + Panel Error state + wiring (task-13:
`lesson-generation.service.ts` `normalizeGenerationError`/`GENERATION_ERROR_CODES`,
`use-lesson-generation.ts` `retry()`, `LessonGenerationPanel` Error state + stories/e2e,
`lesson-generation.tsx`/`.helpers.ts` dispatch + i18n). Gate (lint/check-types/unit/e2e) already
confirmed green by the orchestrator — not re-run here.

## Method
Read `task-11.md`/`task-12.md`/`task-13.md`, `tdd.md`'s slice-2 `@s → test` map + cycle log,
`gherkin-scenarios.md` (@s4–@s6, @s10, @s12, @s15), `spec.md`'s error contract + UI states table,
and `risks.md` R2/R4/R7/R8. Diffed every changed file against `8e7ffb6`; verified the `_shared/`
Deno mirrors (`lesson-generation.assembly.ts`, `lesson-generation.placement.ts`, new
`lesson-generation.errors.ts`) are logically identical to their `libs/supabase-services` sources
(comment/formatting-only deltas). Cross-checked the client error-normalization pattern against its
stated precedent, `PdfExtractionService.normalizeExtractionError`
(`libs/pdf-upload-extraction/src/services/pdf-extraction.service.ts`), and the Error-state panel
markup against its precedent, `PdfUploadPanel`
(`libs/components/src/organisms/pdf-upload-panel/pdf-upload-panel.tsx`) — both close, deliberate
mirrors, not divergent reinventions.

## Code lens — no findings
- **@s scenario → test map holds**: @s4/@s5 (`lesson-generation.assembly.test.ts` "composition
  enforcement (task-11)" — rejects a mixed deck per variant, accepts the pure variant) · @s6
  (`lesson-generation.prompt.test.ts` "composition variants (task-11)" — distinct instruction per
  composition + assembly's "both" never rejects) · @s10 (`lesson-generation.placement.test.ts`
  `applyVisionPlacements` places/drops/skips-claimed/preserves-existing + `assembly.test.ts`
  `visionDecisions` wiring) · @s12 (placement drop/no-decision cases, assembly degrade-to-text-
  only, `service.test.ts` image-less-slide pass-through, `index.ts` download/vision-failure
  degrade path reviewed per risks.md R2) · @s15 (`lesson-generation.errors.test.ts`
  `mapGenerationError` full mapping + no-leak assertion, `service.test.ts` 6 codes + 2 fallbacks +
  2 transport errors, `use-lesson-generation.test.ts` `retry()`, `lesson-generation-panel.test.tsx`
  5 Error-state cases, `lesson-generation.test.tsx` 4 recovery-dispatch cases,
  `lesson-generation.integration.test.tsx` full-stack error+retry).
- Red→Green→Refactor evidence is explicit and credible in `tdd.md`'s cycle log (task-11/12a/12b/
  13a–13d), matches the actual diff (new test blocks precede/accompany each production change; no
  production code found without a corresponding test demand).
- Belt-and-suspenders composition enforcement is correctly layered: prompt instructs (pre-existing
  from task-4, now locked by test), `assembleGeneratedLesson`'s `assertComposition`
  (`lesson-generation.assembly.ts:32-43`) rejects a violating parsed deck before any image
  placement runs, throwing `GenerationSchemaError` → `mapGenerationError` → `generation_failed`
  (`lesson-generation.errors.ts:38-40`). `both` is provably never constrained (pinned test).
- Error contract is a closed, exhaustive mapping in three independent layers that all agree:
  server (`lesson-generation.errors.ts` `mapGenerationError`), client service
  (`lesson-generation.service.ts` `GENERATION_ERROR_CODES`/`normalizeGenerationError`), and wiring
  (`lesson-generation.helpers.ts` `GENERATION_ERROR_KEYS`/`GENERATION_ERROR_RECOVERY`) — each a
  full `Record<GenerationErrorCode, …>` so a future added code fails to compile until every layer
  handles it. `@s8` redaction verified structurally: `mapGenerationError` returns only
  `{ errorCode, status }` (test: "never includes any property from the raw cause"), and
  `readFunctionErrorCode`/`normalizeGenerationError` never surface `cause` itself to the UI.
- Vision fallback correctly bounds cost (risks.md R4/R8): one batched `generateObject` call for
  every still-unplaced image per request (`generate-lesson/index.ts:101-128`), never per-image;
  invoked only when `unplaced.length > 0`. A download or vision-call failure degrades every
  still-unplaced image to text-only (`index.ts:222-248`) rather than throwing — matches @s12.
- Atomicity (@s15) holds structurally: `assembleGeneratedLesson` validates the full schema +
  composition before returning (`lesson-generation.assembly.ts:112-118`); `index.ts`'s
  `withTimeout(generateLesson(), GENERATION_TIMEOUT_MS)` only responds after that resolves, and any
  failure short-circuits to a typed error with no deck ever partially returned.
- No debug leftovers (no `console.*`/`TODO`/`FIXME`/`debugger` introduced), functional React with
  `Props` types preserved, kebab-case filenames throughout (`lesson-generation.errors.ts` +
  mirror), barrel exports (`export *`) already cover the new `GENERATION_ERROR_CODES` export with
  no barrel edits needed.
- The two stale `selected: true` → `checked: true` role-query fixes in
  `lesson-generation.test.tsx` are test-only, called out in `tdd.md` as pre-existing typos that
  blocked the gate — legitimate, in-scope test fix, not production scope creep.
- `_shared/` Deno mirrors for `lesson-generation.assembly.ts`, `lesson-generation.placement.ts`,
  and the new `lesson-generation.errors.ts` diffed logically identical to their
  `libs/supabase-services` sources (risks.md R2 honored).

## Design lens — no findings
- `LessonGenerationPanel`'s new Error state (`lesson-generation-panel.tsx:90-97`) reuses existing
  tokens only (`theme.colors.errorContainer`/`onErrorContainer`, `theme.shape.card`,
  `theme.spacing.s3`) and existing atoms (`Button`, `Card`, `View`, `Text`) — no ad-hoc
  colors/spacing. Markup is essentially identical to `PdfUploadPanel`'s established Error state
  (`pdf-upload-panel.tsx:91-98`), so the two sibling panels stay visually/behaviorally consistent.
- Composition picker and Generate stay enabled in the Error state (`disabled = state ===
  'loading'`), matching spec.md's "panel returns to a usable state" — verified by a dedicated test
  ("keeps the picker and Generate enabled in the Error state").
- Atomic-design placement unchanged and correct: the Error banner is inline organism markup (no
  new atom/molecule required), matching the `PdfUploadPanel` precedent rather than introducing a
  divergent pattern.
- New UI states are covered by stories (`ErrorRetryable`, `ErrorNoAction` in
  `lesson-generation-panel.stories.tsx`) and by e2e (`lesson-generation-panel.e2e.js`, 2 new cases,
  9/9 total per `tdd.md`), consistent with the sibling `PdfUploadPanel`'s Error-state story/e2e
  pattern.
- i18n: all four locale files (en/es/pt/de) added the full `generation.error.*` + `.error.action.*`
  key set with matching shape — no hardcoded strings; keys named verbatim per spec.md's error
  contract table.
- `document_not_ready`'s "no action button here" choice (recovery delegated to the always-visible
  sibling `PdfUpload` panel's own choose-file control) is an explicit, documented design decision
  in `task-13.md`'s "Recovery per code" section and is test-covered, not a silently dropped
  affordance.

## Notes (non-blocking, informational only)
- `task-12.md`'s `paths` frontmatter lists `lesson-generation.schema.ts` as in scope, but the
  actual diff needed no schema changes (composition enforcement lives in `assembly.ts`, not the
  slide schema). No functional gap — all task-12 Done-criteria checkboxes are satisfied by the
  files actually touched.
