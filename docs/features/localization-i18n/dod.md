# Definition of Done — localization-i18n

**Verdict: PASS → `pr_ready`.** Validated by `dod_validator` (2026-07-09); re-checked against code, not
trusted from prior reports. (Merging the PR is a manual human step → `done`.)

## Gate re-run
| Check | Result |
|---|---|
| `pnpm check-types` | green — 8/8 packages |
| `pnpm lint` | green — 8/8 (`app-study-buddy: expo lint`, all libs) |
| `pnpm test` | green — 95 tests (localization 52, services 13, components 17, study-buddy 7, hooks 4, storybook 2) |
| `pnpm --filter @helsoft/components test:e2e` | green — 19/19 chromium (incl. 5 `language-selector` cases) |

## Functionality
- [x] AC1–AC15 met — each maps to ≥1 green test via `tdd.md` @s→test map. Key sites: provider `_layout.tsx:18`; config `i18n.ts:15-28`; detect `resolve-initial-locale.ts:12-19`; precedence `localization-provider.tsx:39-40`; fallback `i18n.ts:21`; interpolation `resources/en.ts:33`; plural `resources/en.ts:26-27`; a11y `language-selector.tsx:38-52`.
- [x] 4 UI states — Loading = first-paint gate `localization-provider.tsx:68-70`; Content = selector; Error = graceful degradation by design (no blocking state); Empty = N/A (fixed 4-locale set). Reasoned in `spec.md` §UI states.
- [x] Robust error handling — service `getStoredLocale` never throws (`locale-preference.service.ts:14-21`); save failure caught+logged, switch still applies (`localization-provider.tsx:55-61`); `returnNull:false` (`i18n.ts:24`).

## Code quality
- [x] lint / check-types / test green — see gate table.
- [x] No TODOs without issue; Conventional Commits — only leftover is human-approved `TODO(FO1)` (`localization-provider.tsx:56`); no `console.log`/`debugger` in changed source (grep NONE).

## Architecture
- [x] `Component→Hook→Service→DAO` respected; no cross-layer imports — provider calls the service, never the DAO; service has no React; component never touches storage.
- [x] DTOs not leaked; barrels updated (`types`, `services`, `components`, `study-buddy`, `localization` index.ts).
- [x] No unapproved deps — i18next 24.2.3, react-i18next 15.7.4, expo-localization ~57, async-storage; no known-critical advisories (`review.md`). Dep graph acyclic (`localization→services→types`).

## Design system
- [x] Tokens/existing components reused; correct atomic placement — selector token-driven (`language-selector.tsx:60-83`); `LanguageSelector`=molecule, `LanguageSettings`=study-buddy feature, screens thin shells.
- [x] Storybook story per component (applicable states) — `language-selector.stories.tsx` (4 locales + Interactive + Disabled).
- [x] Every component has a Jest unit test — `language-selector.test.tsx`, `language-settings.test.tsx`.

## Security (OWASP)
- [x] No secrets/keys in code or logs; inputs validated at service via `isSupportedLocale` (`locale-preference.service.ts:17,24`).
- [x] No Supabase/network surface added (local AsyncStorage); only log is PII-free `console.warn` (`localization-provider.tsx:60`); `escapeValue:false` is the react-i18next default, not an injection vector.

## Accessibility (WCAG 2.2 AA)
- [x] Labels/roles/contrast/touch-target/non-color state — options `radio` role + label + `accessibilityState`; active = check Icon + heavier label + border (not color-only); `minHeight: touchTarget`. **Accepted risk FO2** (container group role/label likely inert on native AT) — see Accepted minors + `review.md`.

## Testing rigor
- [x] Every @s covered — @s1–@s15 map to ≥1 test; incl. integration + `migration-coverage.test.ts` (@s14).
- [x] Mutation threshold met — `mutation.md` PASS: services/components/study-buddy 100%, localization 100% non-equivalent (6 documented equivalents). No real survivors.

## Observability & i18n
- [x] Analytics/feature flag — **N/A by spec** (none defined for MVP).
- [x] No hardcoded strings — every screen sources copy from `t(...)`; nav titles migrated; endonyms intentionally static; `migration-coverage.test.ts` enforces going forward.

## Accepted minors (documented, human-accepted)
- **FO2** (accessibility, WCAG Level A): container `radiogroup` group role/label likely not exposed to native VoiceOver/TalkBack (`language-selector.tsx:38`). No verified-safe fix with repo tooling; pre-existing/systemic (also `radio-group.tsx:29`); task stays completable. Human gate 2026-07-10: ACCEPTED (`spec.md` Open decisions + FO2; `review.md`).
- **FO1** (failed-save handling): selection applies in-memory + logs on persistence-save failure; `TODO(FO1)` at `localization-provider.tsx:56`. Human gate 2026-07-09: APPROVED as-is.
- **X3** (design/a11y): resting selector border contrast ~1.66:1 — decorative, state conveyed by other cues. Settled since round 1.
