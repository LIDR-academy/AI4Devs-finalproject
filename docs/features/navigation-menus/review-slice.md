---
feature: navigation-menus
reviewer: reviewer_slice
slice: 3
round: 2
verdict: APPROVED
---

# Slice Review — navigation-menus (Slice 3)

**Verdict: APPROVED**

Scope: task-5 + task-6 (AppChrome, `useBreakpoint`, SignOut controlled mode, `(app)` layout/index, tdd.md). Diff vs `a887684` (uncommitted). Round 2: verify R1 fixes + fresh rules pass.

## Round-1 findings — verified fixed

1. **[atomic-design]/[global]** — `app-chrome.stories.tsx` present; Content + Loading states (session identity / loading without invented identity).
2. **[tdd]** — `tests/e2e/components/app-chrome/app-chrome.e2e.js` covers both Storybook stories.
3. **[component-split]** — `getMobileTitleKey` in `app-chrome.helpers.ts`; identity/nav/`signOutOpen` in `use-app-chrome.ts`; `onPress`/`onSettings`/`onSignOut` stay in `app-chrome.tsx`.
4. **[tdd]** — `@s16` → `app-shell.test.ts` (Home body Links + Settings/`headerRight` SignOut absent); `tdd.md` map updated.

## Fresh pass — no findings

- **[hooks-service-dao]** — AppChrome → hooks only; no DAO from UI; `useBreakpoint` barrel-exported from `@helsoft/hooks`.
- **[state]** — single `signOutOpen` `useState` (menu open owned by AccountMenu); no reducer required.
- **[types]** — Props in `app-chrome.types.ts` / SignOut types files; no runtime in types.
- **[i18n]** — inline `t('nav.*')` / `t('auth.logOut')`; key dictionary `getMobileTitleKey`; no new locale keys; no `labels` bag.
- **[tdd]** — `@s2/@s5/@s6/@s7/@s13/@s14/@s16/@s17/@s19` mapped to concrete tests; SignOut controlled-mode coverage; breakpoint matrix covered.
- **[global]** — functional React, Props type, kebab-case, barrels export AppChrome.
- Design: Content/Loading stories match applicable UI states; Error/Empty N/A for chrome.
- Shell: Stack `headerShown: false`; Home Links + Settings header SignOut removed; settings screen SignOut-free.
