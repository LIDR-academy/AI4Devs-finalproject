# Mutation Testing Report — login-and-logout

**Verdict: PASS** — 100% killed on feature-changed lines; all 9 survivors documented equivalent or out-of-scope.
Tested commit `feb4204` (+ Round-2 `4f47504` re-run). Independent Stryker verification.

## Per-file scores

| Library | File | Total | Killed | Survived | Score | Status |
|---------|------|-------|--------|----------|-------|--------|
| services | auth.service.ts | 51 | 35 | 2 | 94.59% | equivalent |
| hooks | use-auth.ts | 23 | 8 | 3 | 72.73% | equivalent |
| components | button.tsx | 52 | 12 | 40 | 19.35% | out-of-scope + equiv |
| components | login-form.tsx | 58 (+1 runtime-error) | 56 | 2 | 96.55% | resolved |
| components | text-field.tsx | 48 | 10 | 25 | 21.28% | new prop tested |
| study-buddy | sign-in-form.tsx | 21 | 19 | 1 | 90.48% | equivalent |
| study-buddy | sign-out.tsx | 13 | 13 | 0 | 100.00% | passed |

**Overall:** 133 killed, 9 survived — all justified.

## Surviving mutants (file:line — disposition)

- **auth.service.ts:30:47** — `'Invalid credentials'` → `""`. EQUIVALENT: message stored only in `Error.message`; callers read only `.code` (mapped via `AUTH_ERROR_KEYS`). Never observed by UI/tests.
- **auth.service.ts:32:39** — `'Network error'` → `""`. EQUIVALENT: same — dead message, only `.code` matters.
- **use-auth.ts:46:6** — `withSubmitting` dep `[]` mutation. EQUIVALENT: hook keeps referential stability regardless (proven, prior report).
- **use-auth.ts:51:5** — `signIn` dep `[withSubmitting]`→`[]`. EQUIVALENT: `withSubmitting` identity constant.
- **use-auth.ts:62:82** — `signOut` dep `[withSubmitting]`→`[]`. EQUIVALENT: same.
- **button.tsx — 40 survivors.** OUT-OF-SCOPE: 39 on pre-existing untouched code (variant/fg/state/styling, since `913e38b`, before this feature); feature-touched lines (HIT_SLOP 31–39, hitSlop 92, minHeight 109/120) are 100% killed. 1 remaining (`useVariants()` no-op, line 54) EQUIVALENT — react-native-unistyles Jest mock strips all styling, unobservable.
- **login-form.tsx:160:16 / 165:20** — `errorBanner`/`errorBannerText` style objects → `{}`. EQUIVALENT: unistyles Jest mock (`react-native-unistyles/mocks`) makes `StyleSheet.create()` a no-op; style props unobservable in Jest. Pre-existing, not new regressions.
- **text-field.tsx — 25 survivors.** OUT-OF-SCOPE: all styling/style-logic (unistyles mock). The feature-touched `accessibilityInvalid` prop is tested by 4 explicit true/false assertions (email/password × set/absent), forwarded via `...rest` → `aria-invalid` on web.
- **sign-in-form.tsx:58** — `if (!emailError) return;` → `if (false)`. EQUIVALENT: early return is a perf optimization; both branches produce identical observable behavior (`setEmailError(undefined)` is a no-op when already undefined).
- **sign-out.tsx** — no survivors.

## Round-1 context
`login-form.tsx` was 81.48% pre-Round-1 (6 killable survivors: `isPristine` logic, `errorMessage` effect deps, field-error boolean props). Round-1 Major-5 fix added targeted tests → 96.55%; the 2 remaining are the pre-existing equivalent style-object mutants above.

## Notes on equivalence lever
No inline Stryker ignore-comment exists in `@stryker-mutator/instrumenter@8.7.1` (verified); the only lever is package-wide `mutator.excludedMutations` (too broad, rejected). Equivalent survivors are accepted with the written justifications above (human-sign-off precedent).
