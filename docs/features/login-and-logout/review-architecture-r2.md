# Architecture review — Round 2 — login-and-logout

**Verdict: APPROVED**

Re-run scope: commit `7751666` (`fix(login-and-logout): resolve Round 1 review findings`). Round 1 was already APPROVED for this lens with zero findings; this round re-verifies layering across every file the fix touched, since a fix elsewhere can break architecture even when the architecture lens itself had nothing open.

## Verification performed

- `git show 7751666 --stat` / full diff reviewed file-by-file (button.tsx/test, login-form.tsx/test/stories, sign-in-form.tsx/test, sign-out.test, auth-test-factories.ts, auth.integration.test.ts, libs/hooks/package.json, libs/hooks/tsconfig.json, pnpm-lock.yaml).
- `pnpm --filter @helsoft/hooks check-types`, `pnpm --filter @helsoft/study-buddy check-types`, `pnpm --filter @helsoft/components check-types` — all pass with no errors.
- Grepped every import added/changed in the commit for DAO/Service leakage into Component/Hook layers — none found.
- Checked `libs/study-buddy/src/index.ts` barrel and `libs/study-buddy/jest.config.js` `testMatch` to confirm `test-utils/auth-test-factories.ts` handling is intentional, not an oversight.
- Diffed `pnpm-lock.yaml` to separate the one real dependency addition from transitive resolution noise.

## Findings

None. No blocker, major, or minor findings from this lens.

## Rationale (per checked item)

1. **`Component → Hook → Service → DAO` direction** — untouched by this commit. No DAO or Service class is imported by any Component/Hook file in the diff (`libs/study-buddy/src/test-utils/auth-test-factories.ts:1-2`, `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx:1-30`, `libs/study-buddy/src/components/sign-out/sign-out.test.tsx`, `libs/components/src/atoms/button/button.tsx`, `libs/components/src/organisms/login-form/login-form.tsx` all stay within their layer). `sign-in-form.tsx:29` (`libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`) adds a single new label key (`signingIn: t('auth.signingIn')`) passed through to the `LoginForm` presentational component — same pattern as the existing labels, no new dependency, no layer crossed.

2. **`auth-test-factories.ts` (`libs/study-buddy/src/test-utils/auth-test-factories.ts:1-23`)** — imports `useAuth` from `@helsoft/hooks` and `useLocalization` from `@helsoft/localization`, both used only as `ReturnType<typeof useX>` for typing the mock factory shape, mirroring the exact pattern that was previously copy-pasted inline in `sign-in-form.test.tsx` and `sign-out.test.tsx` (Round-1 Minor 6, now deduped). Both packages are pre-existing direct dependencies of `@helsoft/study-buddy` (`libs/study-buddy/package.json` `dependencies`) — not a new dependency. No DTO from the DAO/service layer is exposed here; it only shapes the hooks' own public return types for test doubles. Correctly lives beside the components that consume it (`../../test-utils/...` from `sign-in-form/` and `sign-out/`), not promoted into `libs/services`.

3. **Barrel (`libs/study-buddy/src/index.ts`)** — correctly *not* updated to export `test-utils/auth-test-factories.ts`. It is test-only tooling, not part of the feature lib's public surface; `libs/study-buddy/jest.config.js:7` `testMatch` (`**/*.test.tsx`, `**/*.test.ts`) also confirms the file itself is never picked up as a test (no bare `.test.` suffix), so it is inert plumbing shared only via relative import by its two sibling test files. No barrel omission.

4. **`libs/hooks/package.json` / `libs/hooks/tsconfig.json`** — adds `@types/node@~26.1.0` as a devDependency and `"node"` to `compilerOptions.types` (`libs/hooks/tsconfig.json:4`). This is a type-checking-only devDependency (not a runtime/production dependency), pinned to the exact same version already used by `libs/localization/package.json` and mirrored by `libs/localization/tsconfig.json` (`"types": ["jest", "node"]`) — an established, pre-existing pattern in this monorepo, not a new architectural precedent. `pnpm --filter @helsoft/hooks check-types` passes cleanly after the change, and the rest of the `pnpm-lock.yaml` diff is transitive re-resolution (expo-router/jest-expo/@testing-library/react-native patch bumps), not additional new top-level dependencies.

5. **`auth.integration.test.ts` (`libs/hooks/src/hooks/auth.integration.test.ts`)** — still exercises `useAuth`/`useSession` against a mocked `SupabaseClient` boundary only (`initSupabase`/`jest.spyOn(sharedClient.auth, ...)`), consistent with the documented integration-test pattern in `hooks-service-dao.mdc` ("Hook Tests: Mock services and test React integration" / "DAO Tests: Mock the Supabase client"). The refactor to a single shared client + `console.warn` spy (lines 20-44, 113-121) is test-hygiene only, no new layer is touched, no service/DAO logic moved into the test.

6. **No business logic crept into `apps/*` or into test-utils.** `auth-test-factories.ts` contains only mock-return factories (plain object literals + `jest.fn()`), no validation/business rules. `apps/app-study-buddy` is untouched by this commit entirely (not in the `--stat` file list).

## Files inspected (all within bounds)
- `libs/components/src/atoms/button/button.tsx`, `libs/components/src/atoms/button/button.test.tsx`
- `libs/components/src/organisms/login-form/login-form.tsx`, `.test.tsx`, `.stories.tsx`
- `libs/study-buddy/src/components/sign-in-form/sign-in-form.tsx`, `.test.tsx`
- `libs/study-buddy/src/components/sign-out/sign-out.test.tsx`
- `libs/study-buddy/src/test-utils/auth-test-factories.ts`
- `libs/hooks/src/hooks/auth.integration.test.ts`, `libs/hooks/package.json`, `libs/hooks/tsconfig.json`
- `libs/study-buddy/src/index.ts`, `libs/study-buddy/jest.config.js`
