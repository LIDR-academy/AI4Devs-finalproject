---
id: task-4
title: LoginForm organism — Content + Loading states
slice: 1
scenarios: [s2, s3]
status: done
paths: [libs/components/src/organisms/login-form/login-form.tsx, libs/components/src/organisms/login-form/login-form.test.tsx, libs/components/src/organisms/login-form/login-form.stories.tsx, libs/components/src/organisms/index.ts]
---

## Goal
Create the presentational `LoginForm` **organism** in `@helsoft/components`, composed from existing primitives (`TextField` molecule ×2, `Button` atom, a "Sign up" link/`Button variant="text"`). Pure/controlled — no hooks, services, navigation, or i18n lookups inside it. Props (all copy passed in as strings so the component stays presentational and locale-agnostic):

```
type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
  isSubmitting?: boolean;      // drives the Loading state (@s3)
  errorMessage?: string;       // auth-level banner (task-7 uses it)
  emailError?: string;         // inline field message (task-7)
  passwordError?: string;      // inline field message (task-7)
  onNavigateToSignUp?: () => void;
  labels: { email; password; submit; signUpPrompt; ... };  // all copy injected
};
```

This task delivers only the **Content** (interactive form) and **Loading** (submitting) states; Error/Empty come in task-7.

## Done criteria
- [ ] Scenario @s2 covered: form renders both fields + submit; submitting calls `onSubmit` with the entered `{ email, password }`.
- [ ] Scenario @s3 covered: when `isSubmitting`, the submit control is disabled and shows a loading affordance; fields are disabled.
- [ ] `<login-form.stories.tsx>` with stories for **Content** and **Loading** (Empty/Error stories added in task-7).
- [ ] `login-form.test.tsx` (RN Testing Library) asserts render, `onSubmit` payload, and the loading behavior.
- [ ] Correct atomic-design placement (organism) per `.agents/rules/atomic-design.mdc`; exported via `libs/components/src/organisms/index.ts`.
- [ ] Uses **theme tokens** only (via unistyles) — no ad-hoc colors/spacing/typography; reuses `Button`/`TextField`.
- [ ] Functional React, `Props` type present, kebab-case filenames.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.

## Notes
- Model file/story/test structure on `libs/components/src/organisms/dialog/` and the `TextField`/`Button` sources.
- Password field: pass `secureTextEntry` through `TextField`'s `TextInputProps` passthrough.
- Keep copy **out** of the component — the wiring layer (task-5) supplies localized strings via `labels`. This keeps the organism reusable and testable, and satisfies @s12 at the wiring/i18n layer.
- Don't add validation logic here; the form reports input up and renders whatever error strings it's given (task-7 wires them).
