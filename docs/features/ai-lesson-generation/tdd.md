# tdd.md — ai-lesson-generation, Slice 1 (happy path "both" + Loading + Content)

Slice 1 (tasks 1–10) reconstructed for `reviewer_slice`. Deno (`generate-lesson/index.ts`,
`_shared/*`) + `get_api_key` migration sit outside Jest/Stryker (risks.md R2/R5): verified by
`deno check` smoke + manual Supabase round-trip, not Jest — noted once, not per scenario below.

## `@s → test` map (file : test, terse)

- **@s1** both default, 3 choices: `lesson-generation.test.ts`(types) 3 values ·
  `lesson-generation-panel.test.tsx` picker 3 options, "both" selected · `.helpers.test.ts`
  `COMPOSITION_OPTION_VALUES` · `lesson-generation.test.tsx`(study-buddy) defaults both ·
  `.integration.test.tsx` happy path · e2e panel 3 choices.
- **@s2** select non-default: panel "onCompositionChange fires" · wiring "selection updates" ·
  e2e InteractivePicker.
- **@s3** both → ordered typed deck: `prompt.test.ts` enforces mix · `schema.test.ts` parses all
  types · `assembly.test.ts` ordered + per-kind mapping · `service.test.ts` delegates+returns ·
  `use-lesson-generation.test.ts` settles to content · wiring + integration tests.
- **@s6** composition sent+enforced: `dao.test.ts` invoke body `{documentId,composition}` ·
  `service.test.ts` delegation · `prompt.test.ts` enforces both · `index.ts` threads composition
  (Deno smoke).
- **@s7** server-side call, key never to client: `dao.test.ts` body has no key ·
  `get_api_key` migration service-role-only (manual smoke, task-3) · `index.ts` reads key via
  admin RPC only (Deno smoke).
- **@s8** key never logged: `index.ts` no `console.*` of body/key/error (grep-verified); catch
  redacted (Deno smoke) · migration never exposes secret outside `security definer`.
- **@s9** metadata-driven placement: `placement.test.ts` anchors by sourcePage ·
  `prompt.test.ts` embeds image manifest · `assembly.test.ts` attaches ref to anchored slide.
- **@s11** slide refs image-or-text-only: `lesson-generation.test.ts`(types) `SlideImageRef`
  optional/present · `placement.test.ts` carries `alt` · `assembly.test.ts` same attach test.
- **@s13** 5 activity types, answers+explanation: `schema.test.ts` parses all 5 + invariants ·
  `assembly.test.ts` multiple-choice + (gap-fill) matching/fill-in-the-blank/open-ended/
  flashcard mapping + explanation carried/omitted.
- **@s14** multi-step labeled progress: `lesson-generation.test.ts`(types) step order ·
  `use-lesson-generation.test.ts` stepper reading→generating→attaching, caps at last ·
  `generation-progress.test.tsx` labels+status+live-region · `.helpers.test.ts` `getStepStatus` ·
  panel test Loading state · panel `.helpers.test.ts` `stepToIndex` · wiring + e2e.
- **@s16** Generate gated on extraction: panel disabled/enabled · wiring disabled w/o
  documentId · `pdf-upload.test.tsx` `onExtracted` fires once, success-only · e2e stories.
- **@s17** ready state + open-in-player: panel Content state (+ new composition-summary test) ·
  wiring ready summary + router.push · integration reaches Content · e2e Content story.
- **@s20** provider is Groq: `AiProvider='groq'` (compile-time) · `api-key.service.test.ts`
  DEFAULT_PROVIDER groq · `api-key.dao.test.ts` groq fixtures · `api-key-settings.test.tsx`
  Groq guidance URL · `api-key-form.test.tsx`+e2e Groq copy · `api-key-gate.test.tsx`,
  `use-api-key.test.ts`, `api-key.integration.test.ts` groq fixtures · `provider.test.ts`(Deno)/
  `handle-save.test.ts`(Deno) groq params · en/es/pt/de guidance strings (compile-time parity).

## Cycle log (one line per task/artifact)

- task-1 provider swap (@s20): `openai`→`groq` atomically across 10 test files + copy. Green.
- task-2 contract types (@s1/@s3/@s11): types test first, types added till green.
- task-3 `get_api_key` migration (@s7/@s8): no Jest (Postgres outside harness) — mirrors
  `save_api_key`'s security-definer/service-role shape; manual smoke.
- task-4 `generate-lesson` happy path (@s3/@s6/@s7/@s8/@s9/@s11/@s13): pure modules test-first
  in `@helsoft/supabase-services`, hand-mirrored to `_shared/`; `index.ts` via `deno check` smoke
  (no live Groq key here — manual step before deploy, risks.md R1).
- task-5 `LessonGenerationDao` (@s6/@s7): dao test first, then DAO.
- task-6 `LessonGenerationService` (@s3/@s6): service test first, then guards.
- task-7 `useLessonGeneration` (@s14): hook test first (fake timers).
- task-8 `GenerationProgress` (@s14): helpers+component test first, then molecule+story.
- task-9 `LessonGenerationPanel` (@s1/@s2/@s14/@s16/@s17): tests first (3 states), then organism.
- task-10 wiring (@s1/@s3/@s16/@s17): `pdf-upload.test.tsx` extended first for `onExtracted`,
  then `LessonGeneration` + thin `upload.tsx` shell.
- Gap-fill (@s13): `assembly.test.ts` only covered multiple-choice. RED: added
  matching/fill-in-the-blank/open-ended/flashcard mapping + explanation-omitted test. GREEN:
  passed immediately (`buildSlide` unchanged). Suite 84/84 green.
- RadioGroup `aria-checked` (post-gate e2e): react-native-web doesn't forward
  `accessibilityState` to `aria-*`. RED: `radio-group.test.tsx` asserts
  `accessibilityState.checked`. GREEN: `accessibilityState={{ selected, disabled }}`; updated
  panel test's stale matcher. Suite 168/168, e2e 11/11 green.

## Gate status (Slice 1)

`pnpm turbo run lint`/`check-types` clean; `pnpm turbo run test` green except the pre-existing,
unrelated `@helsoft/localization` `migration-coverage.test.ts` failure (identical on `b05c083`).
E2e specs exist for every Slice-1 state. Not committed — follows `reviewer_slice` approval.

## Fix cycle — `reviewer_slice` CHANGES_REQUESTED (this session)

1. **package.json** — removed accidental duplicate `workspaces`/`catalog` keys (reverted to
   `HEAD` shape). Pure revert, no test; `pnpm install` → "Already up to date", lockfile stable.
2. **`lesson-generation-panel.tsx`** — `COMPOSITION_LABEL_KEYS: Record<string, string>` →
   `Record<LessonComposition, string>` (`@helsoft/types`). Type-only, no new test; `check-types`
   clean.
3. **`generate-lesson/index.ts`** — `placementImages` never carried `image.description` into
   `PageAnchoredImage.alt`, though `placement.test.ts` already exercises `alt` passthrough at the
   pure-module layer. Gap is purely in `index.ts`'s inline DB-row→`PageAnchoredImage` mapping
   (glue code, outside Jest per R2 — no pure module owns this mapping). Fixed directly:
   `...(image.description ? { alt: image.description } : {})`, mirroring the identical pattern
   already used for `promptImages` a few lines above. No Jest test (R2); verified against
   `placement.ts`'s `toSlideImageRef` contract.
4. **`generation-progress.tsx`** — hardcoded `size={16}`/`width:24,height:24` →
   `theme.spacing.s4`/`theme.spacing.s6`. Pure refactor on green, no new test; re-ran suite
   (8/8 green).
5. **`lesson-generation-panel.tsx`** Content state — spec.md wants "slide count + composition"
   but only slide count rendered. RED: new panel test case asserting
   `generation.ready.composition` renders the chosen composition label. GREEN: added
   `generation.ready.composition` key (en/es/pt/de, compile-time parity) + rendered
   `t('generation.ready.composition', { composition: t(COMPOSITION_LABEL_KEYS[...]) })` in
   Content state, alongside existing slideCount text. Suite 11/11 green (panel).

Re-verified after all 5 fixes: `pnpm turbo run lint check-types` clean repo-wide;
`@helsoft/components` 169/169, `@helsoft/supabase-services` 86/86 green; `@helsoft/localization`
green except the pre-existing unrelated `migration-coverage.test.ts` (sign-in-form/sign-out)
failure; e2e (`generation-progress`+`lesson-generation-panel`) 11/11 green. Not committed —
awaiting re-review.
