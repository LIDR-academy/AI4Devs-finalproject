# Design review — login-and-logout (Round 3, FINAL)

**Verdict: APPROVED**

Scope: full independent design-system pass over the current state of the feature, focused on
commit `c9ec582` ("fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)"), which
closed Round 2 finding 3 (minor, `review-design-r2.md:85-98` / `review.md:74-85`, missing
`auth.signingIn` locale key) and Round 2's `reviewer_accessibility` major (iOS VoiceOver
announcement) plus the associated stale doc-comment minor (`review.md:61-72`).

## Files inspected
- `libs/localization/src/resources/{en,es,de,pt}.ts` (full files, current + `git show c9ec582 --`
  diff)
- `libs/components/src/organisms/login-form/login-form.tsx` (full file, current +
  `git show c9ec582 --` diff)
- `libs/components/src/organisms/login-form/login-form.stories.tsx`
- `libs/components/src/organisms/login-form/login-form.test.tsx` (diff only — new test added)
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`
- `libs/components/src/atoms/button/button.tsx`, `button.stories.tsx`,
  `libs/components/src/theme/{spacing,colors}.ts` (re-verification, not re-reviewed from scratch)
- `docs/features/login-and-logout/{review-design.md, review-design-r2.md, review.md,
  spec.md, gherkin-scenarios.md}`

## 1. New locale keys — fit the design system in style, capitalization, placement

All four new keys (`email`, `password`, `submit`, `signingIn`) land nested inside the pre-existing
`auth` namespace, added *before* the pre-existing `toSignUp`/`toLogIn` siblings
(`en.ts:47-52`, `es.ts:42-47`, `de.ts:42-47`, `pt.ts:42-47`) — grouped by usage order (form fields →
submit → in-progress → navigation links), matching the same non-alphabetical, usage-ordered
convention already used by `nav` (`en.ts:11-20`: `myLessons, newLesson, settings, lesson, study,
results, logIn, signUp` — not alphabetical either). No placement violation.

**Capitalization/case — sentence case throughout, matching every other namespace in these files:**
- `en.ts:47-50`: `Email` / `Password` / `Log in` / `Signing in…` — single-word or short-phrase
  labels, first letter capitalized only, exactly like `settings.language.heading: 'Language'`
  (`en.ts:57`) and `nav.myLessons: 'My lessons'` (`en.ts:12`). `submit: 'Log in'` is a verbatim match
  of the pre-existing `nav.logIn: 'Log in'` (`en.ts:18`) — same feature, same copy, no drift.
- `es.ts:44`: `submit: 'Iniciar sesión'` matches pre-existing `nav.logIn: 'Iniciar sesión'`
  (`es.ts:13`) exactly. `de.ts:44`: `submit: 'Anmelden'` matches `nav.logIn: 'Anmelden'` (`de.ts:13`).
  `pt.ts:44`: `submit: 'Entrar'` matches `nav.logIn: 'Entrar'` (`pt.ts:13`). All four locales keep the
  new `auth.submit` string identical to the already-approved `nav.logIn` string in the same
  language — internally consistent, not a fresh translation decision.
- German/Portuguese noun capitalization (`E-Mail`, `Passwort`, `E-mail`, `Senha`) follows each
  language's own native orthography rules, not an inconsistency — same pattern as pre-existing
  `de.ts` nouns (`Lektion`, `Einstellungen`, `Sprache`) and `pt.ts` nouns (`Lição`, `Idioma`).

**Ellipsis convention — no prior precedent exists to contradict, and the 4 locales agree with each
other:** `grep -rn "…"` across `libs/localization/src` and `libs/components/src` (excluding this
feature's own files) returns zero other "in-progress"/loading-label matches — `signingIn` is the
first such copy in the app, so there is no established sibling convention it could clash with. All
four locales use the identical single Unicode ellipsis character `…` (not the three-period `...`
sequence): `en.ts:50` `'Signing in…'`, `es.ts:45` `'Iniciando sesión…'`, `de.ts:45` `'Anmeldung
läuft…'`, `pt.ts:45` `'Entrando…'` — internally consistent across all 4 bundles. `signingIn` is
present-participle phrasing in all four (`Signing in / Iniciando sesión / Anmeldung läuft /
Entrando`), consistent register with each other.

**Cross-file consumption still correct:** `sign-in-form.tsx:25-29` wires
`t('auth.email')/t('auth.password')/t('auth.submit')/t('auth.toSignUp')/t('auth.signingIn')` — all
five keys now resolve to real copy in all four bundles (previously `signingIn` alone was missing,
Round-2 minor finding 3; now closed). `TranslationResource` (`en.ts:64`, derived via `typeof en`)
keeps `es`/`de`/`pt` compiler-enforced key-aligned with `en` — `pnpm --filter @helsoft/localization
check-types` (via `pnpm turbo run check-types`, see Checks run) is green, confirming no shape drift.

No blocker/major/minor finding on locale-key design-system fit.

## 2. Round 1 / Round 2 findings — re-verified intact, no regression

- **`Button` atom (`hitSlop`/`minHeight`, Round 1 finding 3/4)** — `git diff 7751666 c9ec582 --
  libs/components/src/atoms/button/button.tsx button.stories.tsx libs/components/src/theme/
  spacing.ts colors.ts` is empty. Zero changes since the Round-2-reviewed state; the token-derived
  `HIT_SLOP`/`minHeight` contract and `button.stories.tsx` accuracy confirmed in
  `review-design-r2.md:21-58` stand untouched.
- **Atomic-design placement** — `login-form.tsx` is still the same organism composed of `TextField`
  ×2, `Button` ×2, `ProgressIndicator` ×1; `c9ec582`'s only structural addition is a `useEffect` +
  `AccessibilityInfo` import (`login-form.tsx:1-2,40-46`) — no new component, no new composition, no
  placement change.
- **Tokens / no ad-hoc styling** — the new `useEffect` introduces no styles at all; the pre-existing
  `styles.form`/`styles.submitRow`/`styles.visuallyHidden` (`login-form.tsx:91-107`, still
  `theme.spacing.s4`/`s3`-token-derived plus the deliberately-arbitrary 1px sr-only technique
  approved in `review-design-r2.md:68-72`) are byte-for-byte unchanged in this commit's diff.
- **Storybook coverage** — `login-form.stories.tsx` is untouched by `c9ec582` (confirmed via `git
  diff 7751666 c9ec582 -- login-form.stories.tsx`, empty) and still renders correctly: its local
  `labels` object (`login-form.stories.tsx:5-11`) already hardcoded `signingIn: 'Signing in…'` since
  Round 2, so the newly-added *locale* key doesn't change anything the story consumes — the story
  never reads from `@helsoft/localization`, by design (`LoginForm` is locale-agnostic per
  `review-design.md:43`). `Content`/`Loading` stories (`:27,29-33`) still match the approved
  Slice-1 contract; no Empty/Error story is owed yet (Slice 2/3, per `tasks.md`/`task-7.md`, as
  already confirmed in Round 1). Nothing needs updating.
- **No visible Loading-state regression from the iOS a11y fix** — `git diff 7751666 c9ec582 --
  login-form.tsx` shows the `<Button disabled={isSubmitting}>`, `<ProgressIndicator>`, and the
  visually-hidden `<Text accessibilityLiveRegion="polite">` block (`login-form.tsx:69-81`) are
  byte-for-byte unchanged — the only additions are the `useEffect`/`AccessibilityInfo` import at the
  top and the doc-comment edit at line 28. `AccessibilityInfo.announceForAccessibility` has no
  visual output (it's an assistive-tech-only imperative call), so there is nothing for this lens to
  flag visually. Confirmed by test: `login-form.test.tsx` (10/10 green, including the new
  `'announces "Signing in…" via AccessibilityInfo...'` case) shows no rendering-assertion changes to
  the existing Loading-state tests.
- **Stale doc comment (Round 2 finding 2, minor)** — `login-form.tsx:28` now reads: *"testID for the
  Loading-state affordance (@s3) — the a11y announcement lives on the live-region Text node and the
  AccessibilityInfo call below."* This drops the inaccurate "a11y label lands with the Slice 3 a11y
  pass" clause and correctly points at both current mechanisms. Resolved as directed.

No regression found in anything previously resolved/approved.

## Checks run
- `git diff 7751666 c9ec582 -- libs/components/src/atoms/button/button.tsx button.stories.tsx
  libs/components/src/theme/spacing.ts libs/components/src/theme/colors.ts` — empty (no change).
- `git show c9ec582 --` full diff review (locale files, `login-form.tsx`, `login-form.test.tsx`,
  `tdd.md`).
- `grep -rn "…"` across `libs/localization/src` and `libs/components/src` — only this feature's own
  4 locale keys + story/test copy use it; no conflicting prior convention.
- `pnpm turbo run check-types --filter=@helsoft/components --filter=@helsoft/localization
  --filter=@helsoft/study-buddy --filter=@helsoft/hooks` — 6/6 green (cache hit).
- `pnpm lint` (root — the only workspace defining a `lint` script is `app-study-buddy`; none of the
  four `@helsoft/*` libs touched by `c9ec582` define a per-package `lint` script) — green.
- `pnpm --filter @helsoft/components test -- login-form` — 10/10 green.
- `pnpm --filter @helsoft/localization test` — 8 suites / 52 tests green (locale-bundle
  key-alignment/migration-coverage tests included, confirming the 4-locale addition didn't break
  bundle-shape enforcement).

## Findings
None (blocker/major/minor) for this lens, this round.

**Verdict: APPROVED** — the four new `auth.*` locale keys are placed correctly inside the existing
namespace, follow the same sentence-case/native-orthography conventions already used throughout
each locale file, reuse the exact pre-existing `nav.logIn` string per language for `auth.submit`,
and use one consistent ellipsis convention across all four bundles with no prior convention
contradicted. Everything previously approved (Button atom's token-derived `hitSlop`/`minHeight`,
atomic-design placement, Storybook `Content`/`Loading` coverage, `visuallyHidden` technique) is
verified byte-for-byte unchanged by commit `c9ec582`. The iOS `AccessibilityInfo` addition and the
doc-comment fix introduce no visual change and no design-system violation. `check-types`, `lint`,
and the relevant Jest suites are all green.
