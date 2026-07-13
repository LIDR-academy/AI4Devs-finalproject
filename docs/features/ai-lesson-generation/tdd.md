# tdd.md — ai-lesson-generation

Deno (`generate-lesson/index.ts`, `_shared/*`) + `get_api_key` migration sit outside Jest/Stryker
(risks.md R2/R5): verified by code review + `deno check`/manual smoke, not Jest — noted once.

## Slice 1 (tasks 1–10) — happy path "both" + Loading + Content — done, reviewed, committed `8e7ffb6`

`@s` covered: @s1/@s2/@s3/@s6/@s7/@s8/@s9/@s11/@s13/@s14/@s16/@s17/@s20 — types, prompt/schema/
assembly ("both" only), placement (metadata), DAO, service (happy path), hook (stepper), panel
(Empty/Loading/Content), wiring, provider swap (openai→groq). One line per task:
task-1 provider swap · task-2 contract types · task-3 `get_api_key` migration (no Jest, Postgres
outside harness) · task-4 `generate-lesson` happy path (pure modules test-first, mirrored to
`_shared/`) · task-5 DAO · task-6 service · task-7 hook (fake timers) · task-8 `GenerationProgress`
· task-9 `LessonGenerationPanel` (3 states) · task-10 wiring (`onExtracted` + thin `upload.tsx`).
Post-gate fixes (reviewer_slice CHANGES_REQUESTED, all resolved): package.json revert, panel prop
type tightened, `index.ts` image-`alt` passthrough gap, `generation-progress.tsx` hardcoded sizing
→ tokens, panel Content state composition-summary line added.
Gate: `pnpm turbo run lint check-types` clean; workspace suites green except the pre-existing
`@helsoft/localization` `migration-coverage.test.ts` (sign-in-form/sign-out) failure.

## Slice 2 (tasks 11–13) — composition enforcement + server error contract + vision fallback + client error/retry — this session

### `@s` → test map
- **@s4** instructional-only → only instructional: `lesson-generation.prompt.test.ts` (forbids-
  activity instruction, pre-existing from task-4, now locked) · `lesson-generation.assembly.test.ts`
  rejects a mixed deck / accepts all-instructional.
- **@s5** activity-only → only activity: mirrors @s4 (prompt forbids-instructional text; assembly
  rejects mixed / accepts all-activity).
- **@s6** composition drives the prompt: `lesson-generation.prompt.test.ts` distinct instruction
  per composition; assembly's `assertComposition` never fires for `both`.
- **@s10** vision fallback: `lesson-generation.placement.test.ts` `applyVisionPlacements` (places
  a decided slide, drops on `null`/missing decision, skips an already-claimed slide, preserves
  existing placements) · `lesson-generation.assembly.test.ts` `visionDecisions` wiring attaches an
  otherwise-unplaced image.
- **@s12** image degradation, never an error: `placement.test.ts` drop/no-decision cases ·
  `assembly.test.ts` unanchorable-image deck still assembles, text-only · `service.test.ts` a deck
  with an image-less slide passes through unchanged · `index.ts` download/vision failure degrades
  rather than throwing (code review, Deno outside Jest).
- **@s15** typed error contract, atomic, readable message + recovery: `lesson-generation.errors.
  test.ts` (`GenerationSchemaError`→`generation_failed`, `GenerationTimeoutError`→`timeout`,
  401/403→`invalid_key`, 429→`rate_limited`, fallback, no-leak) · `lesson-generation.service.
  test.ts` `normalizeGenerationError` (6 server codes + malformed/null body fallback + 2 transport
  errors + unrecognized-type fallback) · `use-lesson-generation.test.ts` `retry()` (re-invokes
  same request; no-op before first attempt) · `lesson-generation-panel.test.tsx` Error state
  (alert role + assertive live region, action button + handler, no-action-button omission,
  picker/Generate stay enabled, no progress/content leak) · `lesson-generation.helpers.test.ts`
  `toPanelState('error')`, `GENERATION_ERROR_KEYS`, `GENERATION_ERROR_RECOVERY` (full Records) ·
  `lesson-generation.test.tsx` wiring dispatch (retry/settings/sign-in/none per code) ·
  `lesson-generation.integration.test.tsx` full-stack typed error + retry re-invoking identical
  `functions.invoke` body.

### Cycle log
- **task-11** composition enforcement: RED 2 assembly tests (instructional-only/activity-only
  reject a mixed deck) → GREEN `assertComposition` in `assembly.ts` (prompt-side text already
  existed from task-4; new tests lock/confirm it). Mirrored to `_shared/`.
- **task-12a** vision placement: RED `applyVisionPlacements` (5 cases) → GREEN in `placement.ts`;
  wired into `assembly.ts` via optional `visionDecisions` (backward-compatible). Mirrored to
  `_shared/`.
- **task-12b** error mapping: RED new `lesson-generation.errors.test.ts` (`mapGenerationError`/
  `GenerationTimeoutError`, duck-types AI-SDK `statusCode` without importing `ai`) → GREEN. Deno
  `index.ts` rewired: `withTimeout` (25s) around the whole pipeline; vision fallback is one
  batched call for every still-unplaced image (bounds cost, R4/R8); a download or vision-call
  failure degrades every still-unplaced image to text-only rather than throwing (@s12);
  `mapGenerationError` replaces the old blanket `generation_failed` catch. Deno outside Jest (R2)
  — verified by code review; a `deno check` attempt reverted an unwanted `package.json` side
  effect (mirrors a known slice-1 issue) and was not repeated.
- **task-13a** service normalization: RED `lesson-generation.service.test.ts` (6 codes + 2
  fallbacks + 2 transport) → GREEN `normalizeGenerationError` (mirrors
  `PdfExtractionService.normalizeExtractionError`); exported `GENERATION_ERROR_CODES`.
- **task-13b** hook retry: RED `use-lesson-generation.test.ts` retry cases → GREEN
  `lastRequestRef` + `retry()`; refactored `isGenerationErrorShape` to derive its closed set from
  the service's own exported `GENERATION_ERROR_CODES` (drops an independent duplicate).
- **task-13c** panel Error state: RED `lesson-generation-panel.test.tsx` (5 cases) → GREEN
  `errorMessage`/`errorActionLabel`/`onErrorAction` props + render branch (reuses `errorContainer`
  theme tokens, mirrors `PdfUploadPanel`); stories `ErrorRetryable`/`ErrorNoAction`; e2e +2 cases
  (9/9 green via `playwright test --reporter=list`).
- **task-13d** wiring: RED `lesson-generation.helpers.test.ts` (`toPanelState('error')`,
  `GENERATION_ERROR_KEYS`, `GENERATION_ERROR_RECOVERY`) + `lesson-generation.test.tsx` (4
  recovery-dispatch cases) → GREEN helpers + `lesson-generation.tsx` dispatch
  (retry / `router.push('/settings')` / `router.push('/login')` / no-op for `document_not_ready`,
  whose actual recovery is the always-visible sibling `PdfUpload` panel). i18n:
  `generation.error.*` + `.error.action.*` keys added to en/es/pt/de (compiler-enforced parity).
  Fixed 2 pre-existing stale `selected: true` role-query typos (should've been `checked: true`) in
  `lesson-generation.test.tsx` — unrelated to any `@s`, blocked the gate; test-only fix.
- **Integration**: extended `lesson-generation.integration.test.tsx` with a real error+retry case
  (mocked `functions.invoke` rejects `FunctionsHttpError({errorCode:'timeout'})`, then resolves) —
  retry re-invokes with the identical `{ documentId, composition }` body.

### Gate status (Slice 2)
`pnpm turbo run lint check-types` clean repo-wide. `pnpm --filter <ws> test` green:
`@helsoft/supabase-services` 121/121, `@helsoft/hooks` 68/68, `@helsoft/components` 174/174
(incl. panel 13/13), `@helsoft/study-buddy` 117/117; `@helsoft/localization` green except the
pre-existing, unrelated `migration-coverage.test.ts` (sign-in-form/sign-out) failure, identical to
the slice-1 baseline, untouched. E2e `lesson-generation-panel` 9/9 (`playwright test
--reporter=list`). Not committed — awaiting `reviewer_slice`.
