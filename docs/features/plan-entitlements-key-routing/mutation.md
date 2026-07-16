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

- `entitlements.dao.ts`: 7 killed / 0 survived / 100%
- `entitlements.service.ts`: 11 killed / 0 survived / 100%
- `lesson-generation.errors.ts`: 40 killed / 0 survived / 100%
- `lesson-generation.key-source.ts`: 25 killed / 0 survived / 100%
- `lesson-generation.service.ts`: 20 killed / 0 survived / 100%

No surviving or uncovered mutants. No equivalent-mutant exclusions.
