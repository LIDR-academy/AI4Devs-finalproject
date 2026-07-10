# Review — Performance (runtime & delivery cost) — Round 3 (FINAL)

**Feature:** login-and-logout
**Round:** 3 (re-run over commit `c9ec582` — "fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)")
**Round-1 verdict (this lens):** APPROVED, zero findings
**Round-2 verdict (this lens):** APPROVED, zero findings
**Round-3 verdict:** **APPROVED**

## Scope reviewed
Full diff of `c9ec582` (`git show c9ec582 --stat`):
- `libs/components/src/organisms/login-form/login-form.tsx` (+14/-3)
- `libs/components/src/organisms/login-form/login-form.test.tsx` (+22, test-only)
- `libs/localization/src/resources/{de,en,es,pt}.ts` (+4 each, static string literals only)
- `docs/features/login-and-logout/tdd.md` (docs only)

`button.tsx` (HIT_SLOP table, `minHeight`/`useVariants` sizing reviewed in Round 2) is **untouched** by this commit — those Round-2 findings stand unregressed. No lists, no new network call sites, no new images/assets introduced.

## Targeted check: the new `useEffect` in `login-form.tsx:42-46`

```tsx
useEffect(() => {
  if (isSubmitting) {
    AccessibilityInfo.announceForAccessibility(labels.signingIn);
  }
}, [isSubmitting, labels.signingIn]);
```

**1. Does it re-fire every render if the parent recreates `labels` as a fresh object literal?**
Checked the production call site — `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:24-30` — `labels={{ email: t('auth.email'), ..., signingIn: t('auth.signingIn') }}` is indeed a **fresh object literal on every `SignInForm` render** (unmemoized, consistent with the Round-1/Round-2 finding that `labels` was never memoized here and correctly judged not worth it given render frequency).

However, the effect's dependency array is `[isSubmitting, labels.signingIn]` — it depends on the **destructured primitive string** `labels.signingIn`, not on the `labels` object reference. React's dependency comparison (`Object.is`) is applied per-element: two JS string primitives with equal characters are `Object.is`-equal regardless of which object they were read off of or how many times the containing object was reallocated. Since `t('auth.signingIn')` returns the same string value for a given locale on every call, `labels.signingIn` is stable in value across `SignInForm` re-renders even though `labels` itself is a new object each time. **The parent's un-memoized `labels` object therefore cannot cause this effect to re-fire.**

I verified this empirically rather than by inspection alone: wrote an isolated RTL test (`@testing-library/react-native`) with a parent that constructs a fresh `{ signingIn: '...' }` object literal on every render (mirroring `sign-in-form.tsx`'s exact pattern) and a child effect with the identical dependency shape (`[isSubmitting, labels.signingIn]`). Rendered once, then re-rendered 3 more times with `isSubmitting` held at `true` and a brand-new object each time. Effect fire count stayed at **1** across all 4 renders — confirms no re-announcement storm. (Test was run from the scratchpad and removed after verification; not committed.)

**2. Does it fire on every render while `isSubmitting` stays `true`, or only on the transition?**
Same reasoning/test as above applies directly to `isSubmitting` itself: it's a boolean primitive, so repeated renders with `isSubmitting === true` do not re-trigger the effect — only an actual `false → true` (or mount-with-`true`) transition does. Confirmed against the committed test `login-form.test.tsx:84-100` ("announces 'Signing in…' via AccessibilityInfo when isSubmitting becomes true"), which asserts zero calls pre-transition and exactly the one expected call post-transition.

**3. Does the effect cause any additional re-renders of `LoginForm`?**
No. The effect body (`login-form.tsx:42-46`) only calls the imperative native module function `AccessibilityInfo.announceForAccessibility` — it never calls a state setter (`setEmail`/`setPassword` are the only setters in the component, `login-form.tsx:37-38`, and neither is touched by this effect). An effect with no `setState` call cannot itself schedule a re-render.

**Conclusion on the new effect:** correctly implemented — extracting the primitive `labels.signingIn` for the dependency array (rather than depending on `labels` or spreading the whole object) sidesteps the exact re-announcement pitfall the object's per-render identity would otherwise create. No VoiceOver-interruption risk, no wasted renders.

## Re-verification of prior rounds' findings (regression check)

- **Round 1** (network round-trips, main-thread work, re-renders, bundle weight for `expo-router`) — none of the touched files in `c9ec582` (`login-form.tsx`, locale resources, test file, docs) affect `AuthDao`/`AuthService`/`useAuth`/`SignInForm`/`SignOut`/`package.json`. Round 1's findings are untouched and stand.
- **Round 2** (`button.tsx` HIT_SLOP module-scope table, `minHeight`/`useVariants` narrowing, live-region `<Text>` conditional mount, `auth.integration.test.ts` shared-client refactor) — `button.tsx` is not in this commit's diff at all; the live-region `<Text>` (`login-form.tsx:76-78`) is unchanged (still gated by the same `isSubmitting ? … : null` ternary, still using the static `styles.visuallyHidden`). Round 2's findings stand unregressed.
- **Locale bundle additions** (`libs/localization/src/resources/{de,en,es,pt}.ts`) — four new static string keys per locale (`email`, `password`, `submit`, `signingIn`). Negligible, fixed-size addition to an already-loaded resource bundle; no lazy-loading concern applicable at this scale.

## Verification run (gate)
- `pnpm --filter @helsoft/components test` → 4 suites / 29 tests green (0.696s), incl. the new `login-form.test.tsx` AccessibilityInfo test.
- `pnpm --filter @helsoft/study-buddy test` → 3 suites / 14 tests green (0.791s).
- `pnpm turbo run check-types --filter=@helsoft/components --filter=@helsoft/hooks --filter=@helsoft/study-buddy --filter=@helsoft/localization --filter=app-study-buddy` → all green (full turbo cache).
- `pnpm lint` → green (only `app-study-buddy` defines a `lint` script in this monorepo; cache hit, green).

## Findings
None. Zero blocker/major/minor findings for this round.

## Conclusion
The Round-2 fix commit (`c9ec582`) adds one `useEffect` to `login-form.tsx` for iOS VoiceOver announcements. Its dependency array correctly extracts the primitive `labels.signingIn` rather than depending on the `labels` object (which is freshly constructed on every `SignInForm` render, `sign-in-form.tsx:24-30`) — verified both by inspection and by an isolated reproduction test that re-rendered with a fresh object 3 times under sustained `isSubmitting=true` and observed exactly one effect fire. The effect only fires on the `isSubmitting` transition, calls no state setter (so triggers zero additional re-renders of `LoginForm`), and the rest of the commit (locale string additions, doc-comment update, test additions) carries no runtime/performance cost. All prior rounds' findings (network round-trips, `button.tsx` HIT_SLOP/`minHeight`, bundle weight) are unregressed — `button.tsx` isn't even touched by this diff. Full test/check-types/lint gate green. **APPROVED — zero findings, this is the final round.**
