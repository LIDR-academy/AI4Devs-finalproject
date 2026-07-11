# review-design.md — ai-key-management (FULL review, Round 3 of 3 — final)

## Verdict: APPROVED

Fresh whole-feature design-system pass across the entire surface (not just the two Round 2
findings). Zero open findings.

## Verification performed
- Re-read `spec.md`'s UI-states table and Open decisions (anti-flash Loading for `ApiKeyGate`).
- Read every changed/relevant file directly (not `tdd.md`'s narration): `api-key-form.tsx` (+test
  +stories), `api-key-required-notice.tsx` (+test+stories), both `.e2e.js` files,
  `api-key-settings.tsx`, `api-key-gate.tsx` (+test), `use-api-key.ts`, all 4 locale bundles,
  `settings.tsx`, `upload.tsx`, `_layout.tsx`.
- `git log -- api-key-gate.tsx api-key-gate.test.tsx`: last touching commit is `c0f60f8` (Slice 2)
  then `33cb017` (the Round 2 fix, adding only the `toJSON()` toBeNull() assertion) — confirmed
  reverted, no further drift. `if (isLoading) return null;` is the entire Loading branch — matches
  spec.md's deliberate anti-flash decision. No `apiKeyRequired.loading`/`upload.apiKeyRequired.loading`
  key exists in any of the 4 locale bundles (grepped all four — zero matches).
- `pnpm --filter @helsoft/components test` — 7 suites / 98 tests green.
- `pnpm --filter @helsoft/study-buddy test` — 5 suites / 37 tests green.
- `pnpm check-types` — 8/8 workspaces green.
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 35/35 green, incl.
  all 4 `api-key-form` states + `api-key-required-notice`'s single state.

## Findings
None.

## Confirmed (fresh judgment, not re-litigated from prior rounds)
- **Tokens/components**: `api-key-form.tsx` and `api-key-required-notice.tsx` use only
  `theme.spacing.{s3,s4}`, `theme.colors.{errorContainer,onErrorContainer,onSurfaceVariant}`,
  `theme.typography.bodyMedium`, `theme.shape.card` — identical token set to sibling
  `login-form.tsx` (`errorBanner`/`errorBannerText`/`visuallyHidden` styles are byte-identical
  patterns). No ad-hoc colors/spacing/typography anywhere in the diff.
- **Atomic-design placement**: `ApiKeyForm`/`ApiKeyRequiredNotice` organisms in
  `libs/components/src/organisms/`, composed from existing atoms/molecules (`Button`,
  `ProgressIndicator`, `TextField`, `Dialog`) — no new atoms/molecules invented. Feature-wiring
  (`ApiKeySettings`, `ApiKeyGate`) correctly lives in `libs/study-buddy/src/components/`, mirroring
  the `LoginForm`/`SignInForm` and `LanguageSelector`/`LanguageSettings` split. App screens
  (`settings.tsx`, `upload.tsx`) are thin shells; `_layout.tsx`'s `ApiKeyProvider` wrap adds no UI.
  Barrels correct: `organisms/index.ts` exports both components → `src/index.ts`; no dead
  `api-key-form/index.ts` (Round 1 finding 10, confirmed still absent).
- **4 UI states**: `api-key-form.stories.tsx` covers Empty/Content/Loading/Error exactly per
  spec.md's table; `api-key-form.test.tsx` and the e2e suite (`api-key-form.e2e.js`) independently
  cover all four. `ApiKeyRequiredNotice` is correctly a single-state presentational organism (not
  subject to the 4-state model — spec.md only tables states for `ApiKeyForm`); its one `Default`
  story/e2e is complete and consistent with that scope.
- **Spec match / sibling consistency**: masked Content state shows provider + last-updated only,
  no key characters (spec.md's explicit decision); Loading-on-submit shows disabled controls +
  progress label with no spinner, Loading-on-fetch shows a `ProgressIndicator` in place of the
  control — both match spec.md's UI-states table exactly. `ApiKeyGate`'s Loading branch renders
  neither branch (bare `null`), matching the "no premature flash" decision and Round 1's own
  explicit "not a finding" verdict on this exact behavior.
- **i18n copy**: all four locale bundles (`en`/`es`/`pt`/`de`) stay key-aligned (compiler-enforced
  via `TranslationResource`); no stray `loading` key under `upload.apiKeyRequired` in any bundle;
  copy tone/format consistent across languages and with sibling `auth.*`/`settings.language.*` keys.

## Not findings / carried forward (informational only, not re-litigated)
- The Round 2 major (`ApiKeyGate` provenance/misattribution) and minor (unmemoized context value,
  `use-api-key.ts:121-124`) are both confirmed resolved by this fresh read — the design-lens half
  of the major is fully closed (revert path taken, `tdd.md` corrected); the minor was a
  performance-lens item, not design, and is unrelated to this file.
