---
id: task-11
title: ApiKeyForm — Empty + Error + Retry + Remove + wiring
slice: 2
scenarios: [s5, s6, s7, s8, s9]
status: done
paths: [libs/components/src/organisms/api-key-form/api-key-form.tsx, libs/components/src/organisms/api-key-form/api-key-form.test.tsx, libs/study-buddy/src/components/api-key-settings/api-key-settings.tsx, libs/study-buddy/src/components/api-key-settings/api-key-settings.test.tsx]
---

## Goal
Complete the organism's remaining states and wire the error/remove paths:
- **Empty** (`hasKey === false`): secure key input + **Save** (disabled until a non-blank key is entered) + a "where to get a key" guidance link.
- **Error**: inline error message (mapped from the `ApiKeyErrorCode` prop → i18n key) with the input staying editable; retry = resubmit. On `invalid_key`/`network_error` the prior state is preserved (nothing persisted).
- **Remove**: a **Remove** control that opens a confirmation `Dialog` (reuse the `SignOut` pattern); confirming calls `onRemove`, dismissing keeps the key.
- **Wiring** (`ApiKeySettings`): map `useApiKey().error` (`ApiKeyErrorCode`) → the right `settings.apiKey.error.*` key; pass `onRemove` → `removeApiKey`; keep local input cleared on success.

## Done criteria
- [x] Scenario @s5: the no-key empty state renders the input + guidance, submit disabled until a non-blank key is entered.
- [x] Scenario @s6: an `invalid_key` error renders the "didn't validate" message; the input stays editable; no masked-saved state appears.
- [x] Scenario @s7: a `network_error` renders the retry message; resubmitting succeeds and shows the masked saved state.
- [x] Scenario @s8: Remove → confirm dialog → `onRemove` → returns to the empty state; dismiss keeps the key.
- [x] Scenario @s9: a failed remove renders the error and preserves the masked saved state.
- [x] Component + wiring tests drive each behavior TDD-first; no hardcoded strings/colors/dimensions; error announced to assistive tech (reinforced in task-14).
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Error copy comes from `t('settings.apiKey.error.*')` (keys completed across locales in task-13). Reuse `TextField`'s `error`/`supportingText`/`accessibilityInvalid` for inline messaging (as login did) and `Dialog` for the remove confirmation.
