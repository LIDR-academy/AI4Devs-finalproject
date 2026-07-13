# Spec review — ai-lesson-generation

**Round 2 (cap reached). Verdict: CHANGES_REQUESTED — 2 open findings.** Round 1 (4 findings: incomplete provider-swap scope, unspecified `documentId` hand-off, a UI-states miscitation, missing error-code Gherkin coverage) was fixed by `spec_partner` and reverified clean. These 2 findings surfaced during that reverification and were not looped a 3rd time per the 2-round cap — surfaced to the human at the gate instead.

## Finding 1 (blocker) — `task-1.md` `paths` frontmatter still incomplete vs. its own prose scope
File: `task-1.md` frontmatter `paths:`

Task-1's own "Scope of edits" prose names 8 files that break when `AiProvider` flips to `'groq'`, none of which are listed in its `paths:` frontmatter:
`libs/hooks/src/hooks/use-api-key.test.ts`, `libs/hooks/src/hooks/api-key.integration.test.ts`, `libs/components/src/organisms/api-key-form/api-key-form.test.tsx`, `libs/components/src/organisms/api-key-form/api-key-form.stories.tsx`, `libs/supabase-services/src/services/api-key.service.test.ts`, `libs/supabase-services/src/dao/api-key.dao.test.ts`, `supabase/functions/manage-api-key/provider.test.ts`, `supabase/functions/manage-api-key/handle-save.test.ts`. Confirmed by grep + reading two of them that they contain literal `'openai'`/`'OpenAI'` fixtures that will fail once the swap lands.

**Mitigating factor:** the prose already names these files correctly — only the machine-readable `paths:` list is incomplete. Low risk of the implementator missing them, but frontmatter is what tooling/DoD checks against.

## Finding 2 (major) — `unauthenticated` missing from `@s15` Examples and from spec.md's Error-row prose
Files: `gherkin-scenarios.md` (`@s15`), `spec.md` (UI-states Error row + Error contract table)

`unauthenticated` is a first-class `GenerationErrorCode` everywhere else in the bundle (task-2's union, task-6's service, task-13's recovery table, task-14's i18n key) but: (a) `@s15`'s Scenario Outline Examples table has no row for it (unlike `missing_key`/`document_not_ready`, added in round 1 for the same reason), and (b) spec.md's UI-states "Error" row prose enumerates recovery categories as "Retry / go to Settings for key errors / re-upload for source errors" without mentioning "Sign in."

**Mitigating factor:** the code is fully specified in the error-contract table and wired through task-2/6/13/14 — this is a Gherkin-coverage and prose-consistency gap, not a missing decision.

## Items reverified clean
- `DEFAULT_PROVIDER` in `api-key.service.ts:6` confirmed as the actually-persisted provider (UI calls `saveApiKey(rawKey)` with no explicit provider) — task-1 correctly targets it.
- `onExtracted?: (documentId: string) => void` mechanism on `PdfUpload` confirmed concrete and buildable against the real `usePdfExtraction()` result type; task-10's paths match.
- `@s12` correctly moved to the Content row; no longer miscited under Error.
- Full traceability re-check: all `@s1`–`@s20` map to ≥1 task, no orphans beyond the two findings above. Task paths otherwise valid per `hooks-service-dao.mdc`/`atomic-design.mdc`/`component-split.mdc`.
