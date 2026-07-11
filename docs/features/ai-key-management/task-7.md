---
id: task-7
title: ApiKeyForm organism — Content (masked) + Loading
slice: 1
scenarios: [s1, s2, s4]
status: done
paths: [libs/components/src/organisms/api-key-form/api-key-form.tsx, libs/components/src/organisms/api-key-form/api-key-form.test.tsx, libs/components/src/organisms/api-key-form/index.ts, libs/components/src/organisms/index.ts]
---

## Goal
Create the presentational `ApiKeyForm` organism in `@helsoft/components` (test-first). Purely driven by props — no hooks/services. This task delivers the **Content** and **Loading** states:
- **Content** (`hasKey === true`): a masked "Key saved" indicator (provider + last-updated; **no key characters**) + a **Replace** control (re-reveals the secure input) + a **Remove** control (Remove behavior wired in task-11).
- **Loading**: `isLoadingStatus` → placeholder/spinner in place of the control; `isSubmitting` → secure input + buttons disabled, submit shows a progress label.
- The secure input (via `TextField` `secureTextEntry` passthrough) + **Save** control for entering/replacing a key; Save disabled while submitting.
- Props: `status`, `isLoadingStatus`, `isSubmitting`, `onSave(rawKey)`, `onRemove`, plus a `labels`/`t`-fed copy object (no hardcoded strings). (`error`, empty-state guidance, and Remove-confirm arrive in task-11.)

## Done criteria
- [x] Scenario @s1 (UI half): given a saved status, renders the masked "Key saved" state and never renders the raw key.
- [x] Scenario @s2: renders the loading state (submit disabled + progress label) while `isSubmitting`.
- [x] Scenario @s4: the Replace affordance reveals the input so a new key can be submitted via `onSave`.
- [x] Component test `api-key-form.test.tsx` drives each rendered state and the `onSave` wiring **before** the component exists (TDD).
- [x] Functional React, `Props` type declared, kebab-case files; reuses existing tokens/components (`TextField`, `Button`, `Card`); no hardcoded strings/colors/dimensions.
- [x] Exported via the organisms barrel; `pnpm lint` + `pnpm check-types` + `pnpm test` green.

Note: does not use `Card` (a bare `View` with token-driven spacing was sufficient for this task's states — no visual container distinct from the Settings screen's own shell was demanded by any test); Remove renders (calling `onRemove` directly, no confirm dialog yet) since the Props/Goal explicitly listed it — the confirm-dialog behavior itself is task-11. No `.stories.tsx`/Playwright e2e yet — explicitly deferred to task-14 (Slice 3) per this task's own Notes; existing `@helsoft/components` e2e suite re-run and confirmed unaffected (see tdd.md).

## Notes
- Atomic-design: organism composed from existing atoms/molecules (`TextField`, `Button`, `Card`), mirroring `LoginForm`.
- Empty state, Error state, retry, and the Remove confirmation dialog are added in task-11 (Slice 2). Storybook stories + Playwright e2e land in task-14 (Slice 3).
