# Mutation testing

- Pass: pre-review round 2
- Base: `a7bbc35`
- Scope: changed `@helsoft/supabase-services` source only
- Result: PASS

## Summary

- `@helsoft/services`: no changed source
- `@helsoft/supabase-services`: 184 generated / 103 scored / 103 killed / 0 survived / 0 no coverage / 81 errors / 100%
- Other supported libraries: no changed source

The helper's sandbox dry run could not resolve the integration test's repository-relative
edge-function import. The identical helper-computed mutation scope was rerun with Stryker
`inPlace`.

## Per-file results

- `profile.dao.ts` (was `entitlements.dao.ts`): 7 killed / 0 survived / 100%
- `profile.service.ts` (was `entitlements.service.ts`): 11 killed / 0 survived / 100%
- `lesson-generation.errors.ts`: 40 killed / 0 survived / 100%
- `lesson-generation.key-source.ts`: 25 killed / 0 survived / 100%
- `lesson-generation.service.ts`: 20 killed / 0 survived / 100%

No surviving or uncovered mutants. No equivalent-mutant exclusions.

## Post-review pass

- Base: `ab015ac`
- Scope: changed `@helsoft/study-buddy` source only
- Result: SURVIVORS

### Summary

- `@helsoft/study-buddy`: 83 scored / 56 killed / 22 survived / 5 no coverage / 2 errors / 67.47%
- `api-key-gate.tsx`: 45 scored / 30 killed / 12 survived / 3 no coverage / 1 error / 66.67%
- `api-key-settings.tsx`: 38 scored / 26 killed / 10 survived / 2 no coverage / 1 error / 68.42%
- Other supported libraries: no changed source

Stryker generated 85 mutants across the two changed files. No equivalent-mutant exclusions.

### Surviving mutants

`src/components/api-key-gate/api-key-gate.tsx`

- Line 24 — replace `if (areEntitlementsLoading)` with `if (true)`.
- Line 27 — replace effect dependencies `[areEntitlementsLoading, t]` with `[]`.
- Line 54 — remove optional chaining from `entitlements?.canCreate`.
- Line 63 — replace the render-prop type condition with `false`.
- Line 63 — replace the render-prop type comparison string `'function'` with `''`.
- Line 67 — replace the complete style object with `{}`.
- Line 68 — replace `gatedContent` styles with `{}`.
- Line 72 — replace `error` styles with `{}`.
- Line 75 — replace `message` styles with `{}`.
- Line 79 — replace `visuallyHidden` styles with `{}`.
- Line 80 — replace `position: 'absolute'` with `position: ''`.
- Line 83 — replace `overflow: 'hidden'` with `overflow: ''`.

`src/components/api-key-settings/api-key-settings.tsx`

- Line 47 — replace `if (areEntitlementsLoading)` with `if (true)`.
- Line 50 — replace effect dependencies `[areEntitlementsLoading, t]` with `[]`.
- Line 71 — remove optional chaining from `entitlements?.showKeySettings`.
- Line 78 — replace the empty saved-status fallback with `"Stryker was here!"`.
- Line 104 — replace the complete style object with `{}`.
- Line 105 — replace `error` styles with `{}`.
- Line 108 — replace `errorMessage` styles with `{}`.
- Line 112 — replace `visuallyHidden` styles with `{}`.
- Line 113 — replace `position: 'absolute'` with `position: ''`.
- Line 116 — replace `overflow: 'hidden'` with `overflow: ''`.

### Post-review round 2

- Base: `ab015ac`
- Scope: changed `@helsoft/study-buddy` source only
- Result: PASS
- `@helsoft/study-buddy`: 83 scored / 83 killed / 0 survived / 0 no coverage / 2 errors / 100%
- `api-key-gate.tsx`: 45 killed / 0 survived / 0 no coverage / 100%
- `api-key-settings.tsx`: 38 killed / 0 survived / 0 no coverage / 100%

Behavioral tests cover loading-effect guards/dependencies, unresolved profile, and create gating via
`useProfile().profile?.canCreate` (render-prop / can-create context removed later). Direct stylesheet
contracts cover concrete token values and hidden styles. Saved-status tests cover the empty label and
missing provider/date fallbacks. No exclusions.

_Note: later renames (`Profile*` / `useProfile`) and empty-state copy (`upload.cannotCreate`) post-date
this mutation pass; scores above refer to the files as mutated at that commit._
