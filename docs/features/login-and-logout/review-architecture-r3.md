# Architecture review — Round 3 (FINAL) — login-and-logout

**Verdict: APPROVED**

Scope: full independent re-check of the current state of the feature against
`.agents/rules/hooks-service-dao.mdc` and `.agents/rules/global.mdc`, focused on commit
`c9ec582` (`fix(login-and-logout): resolve Round 2 findings (iOS a11y, locale)`) — the only
commit since Round 2's `review-architecture-r2.md` (also APPROVED, zero findings). Round 1 and
Round 2 were both zero-finding for this lens; this round re-verifies the whole feature, not just
the diff.

## 1. `AccessibilityInfo` call — layer check

`libs/components/src/organisms/login-form/login-form.tsx:1-2,42-46`:

```ts
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
...
useEffect(() => {
  if (isSubmitting) {
    AccessibilityInfo.announceForAccessibility(labels.signingIn);
  }
}, [isSubmitting, labels.signingIn]);
```

- **No DAO/Service logic leaked in.** The effect body is a single imperative call to a core
  React Native accessibility API, gated only on the existing `isSubmitting` prop and the
  already-injected `labels.signingIn` string. No validation, no data access, no `getSupabase()`,
  no `fetch`, no import from `@helsoft/services`. `grep -n "getSupabase\|Dao\b"` on the touched
  file returns nothing.
- **No inappropriate cross-package dependency.** `AccessibilityInfo` ships with `react-native`
  core (same module as the pre-existing `Text`/`View` imports on line 2), and `react-native` is
  already a `peerDependency`/`devDependency` of `@helsoft/components`
  (`libs/components/package.json:24,38`). No new package was added — confirmed no
  `package.json`/`pnpm-lock.yaml` diff in commit `c9ec582` (`git show c9ec582 --stat` lists only
  `login-form.tsx`, `login-form.test.tsx`, `docs/features/login-and-logout/tdd.md`, and the four
  locale resource files).
- **Correct layer for a UI-only side effect.** `LoginForm` remains a presentational organism:
  the effect reacts only to its own props (`isSubmitting`, `labels.signingIn`), performs no
  business decision, and stays consistent with the component's existing inline a11y concerns on
  the same lines (`accessibilityState`, `accessibilityLiveRegion="polite"` on
  `login-form.tsx:56,66,76`). `hooks-service-dao.mdc`'s Component→Hook→Service→DAO chain governs
  business/data-access logic, not local React state/effects inside a presentational component —
  this call doesn't belong in `useAuth` (`libs/hooks/src/hooks/use-auth.ts`) or `AuthService`
  (`libs/services/src/services/auth.service.ts`), neither of which has any business reason to
  know about VoiceOver announcements. No violation.
- **Non-blocking observation (not a finding):** this is the first use of `AccessibilityInfo` in
  the codebase (`grep -rln "AccessibilityInfo" libs apps --include="*.tsx" --include="*.ts"`
  matches only this file, outside of a vendored `.ds-sync` copy). If a second form later needs
  the same "announce on loading" pattern, extracting it into a small reusable hook in
  `@helsoft/hooks` (e.g. `useAnnounceOnTrue`) would improve reusability per the protocol's
  atomic/reusable heuristic. With a single call site and no business logic involved, this does
  not rise to an architecture violation today, so it is not being recorded as a severity-rated
  finding.

## 2. Locale key additions — stay within `@helsoft/localization`'s existing structure

`libs/localization/src/resources/{en,es,de,pt}.ts` — `email`, `password`, `submit`, `signingIn`
added as new properties inside the pre-existing `auth: { ... }` object in each bundle (e.g.
`en.ts:47-50`). No new files, no new exports, no new barrel entries required:
- `en.ts` remains the authoritative bundle; `TranslationResource` (exported from
  `libs/localization/src/resources/index.ts` and re-exported via `libs/localization/src/index.ts`)
  is still derived from it, so `es`/`de`/`pt` are compiler-enforced to carry the same four keys —
  confirmed by green `check-types` across all four locale files.
- No translation logic moved outside `@helsoft/localization`: `sign-in-form.tsx:25-29`
  (`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`) only calls the existing
  `t('auth.email')` / `t('auth.password')` / `t('auth.submit')` / `t('auth.signingIn')` via
  `useLocalization()` (a hook, correctly wrapping the localization provider/service, not
  reimplementing lookup logic itself).
- Barrels: `libs/localization/src/index.ts` and `libs/localization/src/resources/index.ts` are
  untouched and require no changes — the diff only adds object properties to files they already
  export in full (`export { resources }`), not new modules.

## 3. Re-verification of prior rounds' findings (still correct, untouched)

- **Component→Hook→Service→DAO direction** — unchanged this round. `AuthDao`
  (`libs/services/src/dao/auth.dao.ts`), `AuthService` (`libs/services/src/services/auth.service.ts`),
  `useAuth` (`libs/hooks/src/hooks/use-auth.ts`), `SignInForm`/`SignOut`
  (`libs/study-buddy/src/components/...`), and the app screens are all untouched by `c9ec582`
  (not in its `--stat` file list) — no regression possible.
- **No cross-layer imports** — `login-form.tsx` still imports nothing from `@helsoft/hooks` or
  `@helsoft/services`; `grep -n "@helsoft/hooks\|@helsoft/services" libs/components/src/organisms/login-form/login-form.tsx`
  returns nothing.
- **DTO leakage** — no DAO/Service return type is touched by this commit; `useAuth.signIn` still
  discards `AuthService.signIn`'s resolved value before it reaches `SignInForm`/`LoginForm`
  (previously verified Round 1, unaffected here).
- **Barrels** — no new public export was introduced by this commit that needs barreling (see §2);
  all barrels from Rounds 1–2 (`services/index.ts`, `hooks/index.ts`, `components/organisms/index.ts`,
  `study-buddy/src/index.ts`) remain correct and untouched.
- **Feature lib pairs with its app** — `@helsoft/study-buddy` ↔ `app-study-buddy` pairing and the
  `expo-router` peer-dependency justification from Round 1 (`libs/study-buddy/package.json:21,32`)
  are untouched by this commit.

## 4. Dependencies

`git show c9ec582 --stat` shows zero `package.json`/`pnpm-lock.yaml` changes. `AccessibilityInfo`
requires no new dependency (§1). No new dependency was introduced this round.

## 5. Verification commands run

- `pnpm --filter @helsoft/components --filter @helsoft/localization --filter @helsoft/study-buddy --filter @helsoft/hooks check-types` — all 4 workspaces green.
- `pnpm lint` (root, turbo) — green (`app-study-buddy` is the only workspace with a `lint` script; this is pre-existing and unrelated to this commit, already the case in Rounds 1–2).
- `pnpm --filter @helsoft/components test -- login-form` — 10/10 green, including the new AccessibilityInfo test.
- `pnpm --filter @helsoft/localization test` — 52/52 green (all four locale bundles, coverage/migration test included).
- `grep -rn "getSupabase\|Dao\b" libs/components/src/organisms/login-form/login-form.tsx libs/components/src/organisms/login-form/login-form.test.tsx libs/localization/src/resources/{en,es,de,pt}.ts` — no matches.

## Findings

None. Zero blocker/major/minor architecture findings this round.

## Verdict

**APPROVED** — layering, barrels, DTO boundaries, and dependencies remain fully compliant with
`hooks-service-dao.mdc` and `global.mdc` after the Round 2 fix commit. Feature is architecturally
clean across all three rounds.
