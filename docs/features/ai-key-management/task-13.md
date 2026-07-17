---
id: task-13
title: i18n keys settings.apiKey.* (en/es/pt/de) + coverage guard
slice: 3
scenarios: [s15]
status: done
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts, libs/localization/src/coverage/migration-coverage.test.ts]
---

## Goal
Add the full `settings.apiKey.*` copy to all four locale bundles and extend the coverage guard:
- Keys (under `settings.apiKey`): `heading`, `description`, `getKeyLink` (label) + `getKeyUrl`, `input.label`, `input.placeholder`, `save`, `replace`, `remove`, `savedState` (masked "Key saved" copy incl. provider/updated interpolation), `removeConfirm.headline`/`.body`/`.action`/`.cancel`, `required.message`, `required.action` (the guard-rail notice), and `error.invalidKey` / `error.network` / `error.empty`.
- Add all keys to `en` (authoritative), then `es`, `pt`, `de` (the `TranslationResource` type enforces en-parity at compile time).
- Extend `migration-coverage.test.ts`: add the new component directories (`api-key-form`, `api-key-required-notice`, `api-key-settings`, `api-key-gate`) to the `t()`-key-existence guard so every dotted key literal they reference resolves in `en`.

## Done criteria
- [x] Scenario @s15: all labels, placeholders, button text, guidance, saved-state, and error/notice messages render from the active locale bundle in every state; no hardcoded user-facing string.
- [x] All `settings.apiKey.*` keys present and aligned across en/es/pt/de (compile-time enforced + coverage test green).
- [x] `migration-coverage.test.ts` extended to cover the new component dirs (see Deviations below for the 2-of-4-dirs scope decision); the app screens (`settings.tsx`, `upload.tsx`) and shared components stay literal-free.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Mirrors the login task-8 i18n approach. `getKeyUrl` points to the provider's API-keys page (default OpenAI) so "where to get a key" is actionable. Order this before/with task-8's screen wiring closing so referenced keys always exist (i18next has no missing-key handler — risks R8).

## Deviations from this task's Goal prose (see `tdd.md` for the full cycle log)
- **Key names**: Slices 1-2 already established (and got reviewed/approved twice) a flatter key
  shape than this task's Goal sketch — `inputLabel`/`save`/`replace`/`remove`/`savedStatus`/
  `guidance`/`removeConfirmHeadline`/`.Body`/`.Action`/`.CancelAction`/`error.invalidKey`/
  `.network` under `settings.apiKey`, plus `upload.apiKeyRequired.message`/`.action` for the
  guard notice (this task's `required.message`/`.action`). Renaming these now, with no failing
  test demanding it, would be a Law-1 violation (rewriting already-tested, already-reviewed
  production code) — kept as-is; only the one genuinely missing key (`error.empty`, spec.md Open
  decision 3) was added this task.
- **`heading`/`description`/`getKeyLink`/`getKeyUrl`/`input.placeholder`** were not added. None
  of `spec.md`'s Acceptance Criteria, the UI-states table, or `gherkin-scenarios.md`'s @s5/@s7/
  @s14/@s15 demand a section heading/description, a separately-localized link *destination*, or
  a placeholder distinct from the input's label — `ApiKeyForm`'s existing `guidance` label +
  `LoginForm`-precedent fixed `GUIDANCE_URL` constant already satisfies AC7 ("guidance on where
  to get one") and was reviewed/approved in Slice 2 Round 2 (see `tdd.md`'s "Deviations" note
  under Slice 2). Adding new UI/keys with no scenario or failing test behind them would be
  building ahead — explicitly out of scope per the TDD rules.
- **`migration-coverage.test.ts` extension covers 2 of the 4 named dirs** (`api-key-settings`,
  `api-key-gate` — the `t()`-calling feature-wiring components), not all 4. `api-key-form`/
  `api-key-required-notice` are purely presentational (receive all copy via `labels` props,
  zero `t()` calls of their own by architecture) — adding them to this literal-existence check
  would trip its own "guards the guard" sanity assertion (`referencedKeys.length > 0`) for no
  reason. They're already covered by the lib-wide hardcoded-copy sweep (`SHARED_COMPONENTS`
  includes `libs/components/src`). See the doc comment above `API_KEY_SETTINGS_DIR`/
  `API_KEY_GATE_DIR` in `migration-coverage.test.ts`.
