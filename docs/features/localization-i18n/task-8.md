---
id: task-8
title: LanguageSelector molecule (presentational, token-driven)
slice: 2
scenarios: [s5]
status: todo
paths:
  - libs/components/src/molecules/language-selector/language-selector.tsx
  - libs/components/src/molecules/language-selector/language-selector.test.tsx
  - libs/components/src/molecules/index.ts
---

## Goal
Add a presentational single-select `LanguageSelector` molecule to `@helsoft/components`. It renders a list of language options (each labeled by the caller in its own name) with the active one indicated, and calls back on selection. It is a pure controlled component — props only (`options`, `value`, `onChange`, disabled, accessibility labels) — with no dependency on the localization hook (wiring happens in task-9). It reuses theme tokens and existing atoms.

## Done criteria
- [ ] Scenario(s) @s5 covered by a `language-selector.test.tsx` (renders the four provided options, marks the active one, fires `onChange` with the selected value)
- [ ] `Props` type declared; controlled via `value` + `onChange`
- [ ] Uses theme tokens (typography/colors/spacing) — no ad-hoc colors/dimensions; reuses existing atoms (e.g. `icon`/`state-layer`/`card`) for the active indicator
- [ ] Active state indicated by a non-color-only affordance (e.g. a check `icon`) — sets up a11y hardening in task-12
- [ ] Correct atomic-design placement: molecule (single-select list functioning as a unit, sibling to `RadioGroup`)
- [ ] Kebab-case filenames; functional React
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green
- [ ] No hardcoded strings/colors/dimensions

## Notes
- Presentational by design (Open decision): the endonym labels + option list come from the caller (localization config), keeping the component reusable and Storybook-able across locales.
- Stories + full a11y (roles/labels, active announcement, contrast) land in task-12 (slice 3); this task establishes render + selection behavior + basic roles needed to select.
