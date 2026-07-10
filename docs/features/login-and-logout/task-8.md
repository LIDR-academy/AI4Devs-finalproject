---
id: task-8
title: i18n — auth.* keys across en/es/pt/de
slice: 3
scenarios: [s12]
status: todo
paths: [libs/localization/src/resources/en.ts, libs/localization/src/resources/es.ts, libs/localization/src/resources/pt.ts, libs/localization/src/resources/de.ts]
---

## Goal
Add every user-facing login/logout string to the `auth.*` namespace in the **authoritative `en.ts`** bundle and key-align all other bundles (es/pt/de). Wire `SignInForm`/`SignOut` (task-5) to these keys. Needed keys (final names at implementation time):
- `auth.form.emailLabel`, `auth.form.emailPlaceholder`, `auth.form.passwordLabel`, `auth.form.passwordPlaceholder`
- `auth.form.submit` (e.g. "Log in"), `auth.form.loggingIn`
- `auth.action.logOut`
- `auth.error.invalidCredentials` → "Invalid email or password"
- `auth.error.network` → "Network error"
- `auth.error.email` (malformed email), `auth.error.password` (strength message)
- reuse existing `auth.toSignUp` for the sign-up link

## Done criteria
- [ ] Scenario @s12 covered: the localization coverage/key-alignment test (`libs/localization`) stays green — every new `en` key exists in es/pt/de (no fallback gaps).
- [ ] All four bundles updated; `TranslationResource` type still compiles (derived from `en`).
- [ ] `SignInForm`/`SignOut` render copy exclusively via `t(...)` — no hardcoded user strings anywhere in the feature.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Follow the existing bundle structure in `libs/localization/src/resources/en.ts` (nested `auth`/`nav` objects). The error strings must exactly match the contract in `spec.md` and the literals in `gherkin-scenarios.md` (@s5/@s6).
- Translations for es/pt/de: provide accurate translations of the same messages (not English placeholders) so the coverage test and reviewers pass.
