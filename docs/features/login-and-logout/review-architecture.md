# Architecture review — Round 3 (FINAL) — login-and-logout

**Verdict: APPROVED**

Re-run scope: commit `4f47504` (`fix(login-and-logout): derive TextField accessibilityInvalid from
error`), the only change since Round 2 (which was APPROVED, 0 findings, at commit `7751666`). Round
2's fix (Major, closed by this commit) was a `reviewer_design` finding about `TextField`'s
`accessibilityInvalid` prop not deriving from `error` — a presentation-only, single-molecule concern
with no architectural dimension on its face, but re-verified in full per this round's brief, plus a
fresh full-feature layering re-scan.

## Verification performed

- `git show 4f47504 --stat` / full diff read file-by-file: `text-field.tsx`, `text-field.test.tsx`
  (new), `text-field.e2e.js`, `login-form.tsx` (2-line removal only).
- `git diff feb4204 HEAD -- '**/package.json' pnpm-lock.yaml` — empty (zero output): confirms no
  dependency of any kind (production, dev, or transitive-lockfile) changed since the Round-1-fix
  commit, spanning both the Round-2 fix and this Round-3 fix.
- Grepped `libs/components/src` and `apps/app-study-buddy/src` for any `@helsoft/services` import —
  only the pre-existing, sanctioned `apps/app-study-buddy/src/lib/supabase.ts:4` (`initSupabase`
  app-startup wiring, unchanged).
- Grepped `libs/hooks/src` for direct DAO references — none in production code (`use-auth.ts` only
  imports `AuthService`); the two `Dao`-string hits are in test files' comments/doc-strings, not
  imports.
- Re-read `libs/hooks/src/hooks/use-auth.ts`, `libs/study-buddy/src/components/sign-in-form/
  sign-in-form.tsx`, `libs/study-buddy/src/components/sign-out/sign-out.tsx`,
  `libs/services/src/services/auth.service.ts`, `libs/services/src/dao/auth.dao.ts` in full —
  confirms `Component → Hook → Service → DAO` intact, `SignInForm`'s direct `AuthService.isValidEmail`
  call stays within the ruleset's own documented "Direct Service Usage" exception
  (`.agents/rules/hooks-service-dao.mdc`, "Direct Service Usage" section: `Component → Service → DAO`
  is an explicitly sanctioned shortcut when no React-specific feature is needed).
- Confirmed `SignInWithPasswordResult`/`SignInWithPasswordParams` (the DAO-layer DTOs,
  `libs/services/src/dao/auth.dao.ts:5,10`) are consumed only by `auth.service.ts:4,49` and never
  imported anywhere in `libs/hooks` or `libs/components`/`libs/study-buddy` — `useAuth`'s `signIn`
  returns `Promise<void>` (`use-auth.ts`), and `LoginForm.errorMessage` is a plain `string`
  (`login-form.tsx:28`), not `AuthErrorCode` — no DTO or error-code type leaks past the layer that
  owns it into a lower-privilege layer's public surface.
- Checked barrels: `libs/components/src/molecules/index.ts` (`text-field` already exported, no new
  export needed — no new component added, only an existing prop's default changed),
  `libs/components/src/organisms/index.ts`, `libs/services/src/services/index.ts`,
  `libs/hooks/src/hooks/index.ts`, `libs/study-buddy/src/index.ts` — all already correctly wired
  from prior rounds; commit `4f47504` needed no barrel change (no new public export surface).
  `.stryker-tmp/` sandbox copies of `auth.dao.ts`/`auth.service.ts` found on disk are `git`-ignored
  (`.gitignore:49`, `**/.stryker-tmp/`) — not part of the tracked codebase, not a duplicate-DTO
  concern.
- Full feature-wide dependency re-scan since the feature's first commit (`0ddd2b3..HEAD`):
  `libs/hooks/package.json` gained `@helsoft/types` (workspace-internal, needed for `AuthErrorCode`/
  `AuthError`) and `@types/node` (dev-only, type-checking, matching `libs/localization`'s existing
  precedent — already reviewed and approved Round 2); `libs/study-buddy/package.json` gained
  `expo-router` as a peer/dev dependency (documented in `tdd.md`'s Slice-1 design-reconciliation note
  — plain route-push navigation, unrelated to session state, already reviewed and approved in prior
  rounds). Neither changed in this round's commit; re-confirmed only for completeness of the "full
  rubric, whole feature" instruction.
- Ran `pnpm turbo run check-types --force` (8/8 packages green), `pnpm turbo run lint --force`
  (clean), `pnpm turbo run test --force` (6/6 workspaces green: `@helsoft/services` 38/38,
  `@helsoft/hooks` 21/21, `@helsoft/components` 65/65, `@helsoft/study-buddy` 25/25,
  `@helsoft/localization` 55/55, `@helsoft/lib-with-storybook` 2/2) myself, against current `HEAD`
  (`4f47504`) — all green, matching `tdd.md`'s own reported gate.

## Findings

None. No blocker, major, or minor findings from this lens.

## Rationale (per checked item, this round's specific asks)

1. **`text-field.tsx`'s new derivation stays a pure, presentational-molecule concern** —
   `accessibilityInvalid = error` (`text-field.tsx:52`) is a destructured-parameter default over an
   already-owned prop, computed inline with no new imports, no side effects, no data access. The
   file's import list is unchanged by this commit (`react`, `react-native`, `react-native-unistyles`,
   the local `Icon` atom) — no new cross-package import, no reach into `@helsoft/hooks`/
   `@helsoft/services`/`@helsoft/study-buddy`. `TextField` remains a leaf molecule with zero
   awareness of auth, forms, or any business concern — exactly the same layering posture Round 1 and
   Round 2 already verified for this file.
2. **No new dependency in commit `4f47504`** — confirmed via `git show 4f47504 --stat` (file list
   above has no `package.json`/`pnpm-lock.yaml` entry) and `git diff feb4204 HEAD -- '**/package.json'
   pnpm-lock.yaml` (empty output). The new `text-field.test.tsx` uses only
   `@testing-library/react-native`, already a devDependency of `@helsoft/components` from every prior
   file in that lib.
3. **`login-form.tsx`'s simplification doesn't change any layering/composition relationship** — the
   diff is a pure two-line deletion (`accessibilityInvalid={!!emailError}` /
   `accessibilityInvalid={!!passwordError}`, previously at `login-form.tsx:111,124`). `LoginForm`
   still composes `TextField`/`Button`/`ProgressIndicator` from within the same `@helsoft/components`
   package, still passes `error={!!emailError}` (unchanged), and now gets the identical
   `accessibilityInvalid` value for free from `TextField`'s own new default rather than computing and
   forwarding it a second time. `LoginForm` remains a presentational organism — no hook, service, or
   DAO import added or removed; the prop-surface reduction is strictly internal deduplication, not a
   composition change (same components, same parent→child relationship, same data passed down for
   the one attribute that still matters, `error`).

## Full-feature layering re-scan (whole feature, this round)

- **`Component → Hook → Service → DAO` direction** — verified end-to-end again:
  `sign-in-form.tsx`/`sign-out.tsx` (study-buddy components) → `useAuth` (`@helsoft/hooks`) →
  `AuthService` (`@helsoft/services`) → `AuthDao` (`@helsoft/services`) → `getSupabase()`. No
  component imports a DAO; no service imports React; hooks wrap `AuthService`, never `AuthDao`,
  directly.
- **No cross-layer imports** — grep-verified: zero `@helsoft/services` imports in
  `libs/components`/`apps/app-study-buddy` except the sanctioned app-startup `initSupabase()` call;
  zero direct DAO imports anywhere in `libs/hooks` or `libs/study-buddy` production code.
- **DTOs stay in the DAO/service layer** — `SignInWithPasswordResult`/`Params` never leave
  `auth.service.ts`; `useAuth`'s public surface is `{ signIn, signOut, isSubmitting, error }` with
  `error: AuthErrorCode | null` (a plain closed-union type from `@helsoft/types`, not a raw
  Supabase/DAO shape) — the correct, already-normalized boundary type for a hook to expose.
  `LoginForm` (components layer) only ever sees a plain `string` (`errorMessage`), one layer further
  sanitized by `SignInForm`'s `AUTH_ERROR_KEYS` map — no DTO or provider-specific error code reaches
  the presentational layer.
- **Business logic in `libs/*`, not `apps/*`** — `apps/app-study-buddy/src/app/(auth)/login.tsx`,
  `(app)/index.tsx`, `(app)/settings.tsx` remain thin wiring (compose `SignInForm`/`SignOut`, no
  validation/normalization logic of their own); all auth business logic (`isValidEmail`,
  `isNonEmptyPassword`, `normalizeAuthError`) lives in `libs/services`.
- **Barrels** — all five relevant barrels (`services/index.ts`, `hooks/index.ts`,
  `components/molecules/index.ts`, `components/organisms/index.ts`, `study-buddy/index.ts`) export
  everything this feature's components/hooks/services need; nothing new needed one this round (no
  new public component/hook/service was added by `4f47504`).
- **No unapproved new dependency** — full `0ddd2b3..HEAD` package.json diff re-reviewed line by
  line; every addition (`@helsoft/types`, `@types/node`, `expo-router`) was already justified and
  approved in Round 1/Round 2 architecture reviews, and none changed in this round's commit.
- **Feature lib pairs with its app** — `libs/study-buddy` (feature lib) continues to pair with
  `apps/app-study-buddy`, unchanged this round.

## Files inspected (all within bounds)
- `libs/components/src/molecules/text-field/text-field.tsx`, `.test.tsx` (new),
  `libs/components/tests/e2e/molecules/text-field/text-field.e2e.js`
- `libs/components/src/organisms/login-form/login-form.tsx`
- `libs/hooks/src/hooks/use-auth.ts`, `libs/hooks/package.json`
- `libs/services/src/services/auth.service.ts`, `libs/services/src/dao/auth.dao.ts`,
  `libs/services/src/services/index.ts`
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`,
  `libs/study-buddy/src/components/sign-out/sign-out.tsx`, `libs/study-buddy/package.json`,
  `libs/study-buddy/src/index.ts`
- `apps/app-study-buddy/src/app/(auth)/login.tsx`, `(app)/index.tsx`, `(app)/settings.tsx`,
  `apps/app-study-buddy/src/lib/supabase.ts`
- `.gitignore` (confirmed `.stryker-tmp/` exclusion)
- `pnpm-lock.yaml`, all workspace `package.json` files (dependency diff `0ddd2b3..HEAD`)

## Verification run (this round)
`pnpm turbo run check-types --force` (8/8), `pnpm turbo run lint --force` (clean), `pnpm turbo run
test --force` (6/6 workspaces, matching `tdd.md`'s reported counts exactly).

## Disposition
Round 3 is the final round under the 3-round cap. This lens is `APPROVED` with zero findings, for
the third consecutive round — no escalation needed from architecture.
