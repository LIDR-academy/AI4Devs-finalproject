# review-code — login-and-logout — Round 3 (FINAL)

Scope: independent full-repo verification of the current state (not just the diff) of
commit `c9ec582` ("fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)"),
which was meant to close the 3 findings carried in `review.md` (Round 2): Major 1 (iOS
VoiceOver Loading announcement), Minor 2 (stale doc comment), Minor 3 (missing
`auth.email`/`auth.password`/`auth.submit`/`auth.signingIn` locale keys). Also re-verified
the whole feature (layering, `@s1-@s13` traceability, TDD discipline, no debug leftovers,
no scope creep) for regressions, since this is the last round (3-round cap).

**Verdict: APPROVED — zero findings.**

## Verification performed
- `pnpm --filter @helsoft/components test` → 4 suites / 29 tests green.
- `pnpm --filter @helsoft/localization test` → 8 suites / 52 tests green.
- `pnpm turbo run test --filter=@helsoft/services --filter=@helsoft/hooks --filter=@helsoft/components --filter=@helsoft/study-buddy --filter=@helsoft/localization --force` → 5/5 packages, 139/139 tests green, zero console noise.
- `pnpm turbo run check-types --force` → 8/8 packages green.
- `pnpm lint --force` → green (`app-study-buddy` is the only workspace with a `lint` script; pre-existing repo state).
- Independently re-verified TDD claim for the Major-1 fix: temporarily replaced
  `login-form.tsx` with the pre-`c9ec582` version (`git show 7751666:...`) and re-ran the new
  test in isolation — it fails exactly as `tdd.md` describes (`toHaveBeenCalledWith` gets 0
  calls), then restored the current file (`git diff` confirmed byte-identical afterward) and
  reran green. This is real RED→GREEN, not a rubber-stamped test.

## Finding 1 (was Major) — iOS VoiceOver Loading announcement — RESOLVED
`libs/components/src/organisms/login-form/login-form.tsx:1-2,42-46` adds
`useEffect(() => { if (isSubmitting) AccessibilityInfo.announceForAccessibility(labels.signingIn); }, [isSubmitting, labels.signingIn])`,
exactly the fix `review.md` prescribed (imperative `AccessibilityInfo.announceForAccessibility`,
keyed on the `isSubmitting` transition). The pre-existing `accessibilityLiveRegion="polite"`
`<Text>` (`:76-78`) is untouched and still drives Android/Web.
- Driving test added first: `login-form.test.tsx:84-100` — spies on
  `AccessibilityInfo.announceForAccessibility`, asserts not called on initial Content render,
  `rerender`s into `isSubmitting`, asserts `toHaveBeenCalledWith(labels.signingIn)`. Confirmed
  genuinely RED against the old production code (see Verification above) — not a test that
  passes trivially.
- Correctness of the new effect: no cleanup needed (one-shot imperative call, not a
  subscription — no leak); dependency array is minimal and correct (`labels.signingIn`, a
  primitive, not the whole `labels` object, so no spurious re-fires from unrelated label
  changes); fires on mount too if `isSubmitting` starts `true`, which is the correct behavior
  for WCAG 4.1.3 (a resumed submission on remount must also be announced). No app-level
  `StrictMode` is configured (`apps/app-study-buddy` has no `reactStrictMode`/`<StrictMode>`
  usage — confirmed via `grep -rn "StrictMode"`, zero hits), so no double-invoke-in-dev concern
  in practice.
- `tdd.md` (lines documenting Major 1 under "Round-2 review fixes") records the RED failure,
  the GREEN diff, and a genuine diagnostic detour (jest-expo's persistent auto-mock on
  `AccessibilityInfo.announceForAccessibility` bleeding call history across tests in the same
  file, fixed with `announceSpy.mockClear()`) — consistent with real TDD practice, not
  retro-fitted narrative.

## Finding 2 (was Minor) — stale doc comment — RESOLVED
`libs/components/src/organisms/login-form/login-form.tsx:28` now reads "the a11y announcement
lives on the live-region Text node and the AccessibilityInfo call below" — no longer claims the
label "lands with the Slice 3 a11y pass" (which was already false as of Round 1). Verified the
reworded comment does not trip `libs/localization/src/coverage/migration-coverage.test.ts`'s
`LITERAL_TEXT_CHILD` regex (`/<Text(\s[^>]*)?>\s*[^<{\s]/`) — confirmed by direct regex test
against the current comment string: no match, since the comment avoids a bare `<Text>` token.
Content-only fix, no test required per the review's own scope note; `check-types`/`test` stay
green.

## Finding 3 (was Minor) — missing locale keys — RESOLVED
`libs/localization/src/resources/{en,es,de,pt}.ts` each gain `auth.email`, `auth.password`,
`auth.submit`, `auth.signingIn` (e.g. `en.ts:47-50`, `es.ts`, `de.ts`, `pt.ts` — diffed all
four, each adds the identical 4 keys, correctly translated, not English placeholders:
`es` "Correo electrónico"/"Contraseña"/"Iniciar sesión"/"Iniciando sesión…", `de` "E-Mail"/
"Passwort"/"Anmelden"/"Anmeldung läuft…", `pt` "E-mail"/"Senha"/"Entrar"/"Entrando…"). Matches
the exact calls already present in `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:25-29`
(`t('auth.email')`, `t('auth.password')`, `t('auth.submit')`, `t('auth.signingIn')`) — these
calls existed since the very first commit (`2456693`) but the keys were missing until now
(confirmed via `git show 2456693:.../sign-in-form.tsx`), so this closes a genuine, real
pre-existing gap, not a cosmetic one. Correctly scoped: does **not** add the unrelated
`auth.logOut`/`auth.logOutConfirmHeadline`/`auth.logOutConfirmAction`/`auth.logOutCancelAction`/
`auth.logOutConfirmBody` keys `sign-out.tsx` also calls (confirmed still absent from all four
bundles) — those remain correctly deferred to `task-8` (status `todo`, Slice 3, per
`docs/features/login-and-logout/tasks.md:20`), not scope creep. `es`/`de`/`pt` are typed as
`TranslationResource` (derived from `en`), so `check-types` would fail if any bundle were
missing a key — confirmed green across all 8 packages, which is the correct mechanical guard
here (there's no dedicated key-coverage unit test, and none was required by the review, since
`t()` is loosely typed `(key: string) => string` in `use-localization.ts` and the
`sign-in-form.test.tsx` mock (`auth-test-factories.ts:17-22`) stubs `t` as `(key) => key`, so
this gap was never going to be mechanically caught by unit tests — correctly identified in
`tdd.md` as content-only, no new test demanded).

## Regression check — rest of the feature
- `@s1, @s2, @s3, @s4, @s7, @s9, @s10, @s11` (Slice-1 scope, per `tasks.md` — tasks 1-5 `done`)
  each still map to ≥1 passing concrete test; `@s3` gained one more (the new
  `AccessibilityInfo` test) without losing any prior coverage. `@s5, @s6, @s8, @s12, @s13`
  remain correctly out of scope (Slice 2/3, tasks 6-9 `todo` in `tasks.md`) — untouched by
  `c9ec582`.
- Layering unaffected: `login-form.tsx` (organism) still only calls `AccessibilityInfo`/RN
  primitives, no service/DAO reach-through; `sign-in-form.tsx`/`sign-out.tsx` still the only
  consumers wiring `useAuth()`/`useLocalization()` into `LoginForm`/`Button`/`Dialog`.
- No `console.log`/`debugger`/orphan `TODO`/`FIXME` anywhere in the touched files or the wider
  feature (`libs/components/src/organisms/login-form/`, `libs/hooks/src/hooks/`,
  `libs/services/src/{dao,services}/auth.*`, `libs/study-buddy/src/components/{sign-in-form,sign-out}/`
  — grepped, zero hits).
- Filenames stay kebab-case; `LoginFormProps` unchanged in shape; functional React throughout;
  no magic numbers introduced (the new effect has none).
- Commit `c9ec582` is single-purpose and correctly scoped (7 files: the 3 findings' exact
  targets + the `tdd.md` log) — no unrelated files touched, no drive-by refactors.
- Everything "already solid" from `review-code.md` (Round 1) and `review-code-r2.md`
  (Round 2) — `TextField.disabled`/`accessibilityState`, `hitSlop`/`minHeight` touch targets,
  test-data factory dedup, integration-test `console.warn` fix — re-confirmed unchanged and
  still passing; `c9ec582` did not touch any of that code.

No blocker, major, or minor findings remain open for `reviewer_code`.
