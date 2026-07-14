Superseded. Canonical rules:

- /.agents/rules/global.mdc — monorepo spec (folders, libs, naming, tooling, Supabase); every component in a Storybook lib ships a `.stories.tsx`
- /.agents/rules/hooks-service-dao.mdc — hook/service/dao architecture
- /.agents/rules/atomic-design.mdc — component structure methodology
- /.agents/rules/component-split.mdc — UI co-location split for non-trivial components
- /.agents/rules/types.mdc — multi-file types live in `*.types.ts` (exported only)
- /.agents/rules/i18n.mdc — user-facing text via `t('ns.key')` inline; no `labels` object (key dictionaries excepted)
- /.agents/rules/state.mdc — ≥3 related local states that change together → `useReducer` (not Redux)
- /.agents/rules/tdd.mdc — Three Laws of TDD, Red→Green→Refactor

Do not add rules here.
