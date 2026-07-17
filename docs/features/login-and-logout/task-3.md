---
id: task-3
title: useAuth hook — React integration for sign-in/out
slice: 1
scenarios: [s2, s3, s4]
status: done
paths: [libs/hooks/src/hooks/use-auth.ts, libs/hooks/src/hooks/use-auth.test.ts, libs/hooks/src/hooks/index.ts]
---

## Goal
Create `useAuth()` wrapping `AuthService`, exposing a component-friendly API:
`{ signIn(email, password), signOut(), isSubmitting, error, reset() }`. Manage `isSubmitting` (true while a call is in flight → drives @s3 loading) and `error` (the normalized `AuthErrorCode`/message from the service). It does **not** navigate — the root `Stack.Protected` guards react to the session change automatically.

## Done criteria
- [ ] Scenarios @s2, @s4 covered by hook tests mocking `AuthService` (signIn/signOut call-through + resolved state).
- [ ] Scenario @s3 covered: `isSubmitting` is true during the in-flight call and false after resolve/reject.
- [ ] Hook wraps the **service**, never the DAO or `getSupabase()` directly.
- [ ] Plain React state (`useState`/`useCallback`) — no tanstack-query (see `spec.md` Open decisions); consistent with `use-session.ts`.
- [ ] Exported via `libs/hooks/src/hooks/index.ts`; `export function useAuth`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Layering per `.agents/rules/hooks-service-dao.mdc` (Hooks Layer). Model the style on the existing `libs/hooks/src/hooks/use-session.ts`.
- `error` shape should carry the `AuthErrorCode` (task-6) so the form can pick the right i18n message; in Slice 1 it may start as a generic flag and be tightened when task-6 lands the contract.
- Keep callbacks stable (`useCallback`) so the form doesn't re-render needlessly (perf reviewer).
