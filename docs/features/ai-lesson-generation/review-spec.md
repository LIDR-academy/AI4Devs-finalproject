# Spec review — ai-lesson-generation

**Round 2 (cap reached). Verdict: CHANGES_REQUESTED — 2 open findings.** Round 1 (4 findings: incomplete provider-swap scope, unspecified `documentId` hand-off, a UI-states miscitation, missing error-code Gherkin coverage) was fixed and reverified clean. These 2 findings surfaced during that reverification and were not looped a 3rd time per the 2-round cap — surfaced to the human at the gate instead.

## Finding 1 (blocker) — `task-1.md` `paths` frontmatter incomplete vs. its own prose scope
Task-1's "Scope of edits" prose names 8 files affected by `AiProvider` → `'groq'`, none listed in `paths:` frontmatter: `libs/hooks/src/hooks/use-api-key.test.ts`, `api-key.integration.test.ts`, `libs/components/src/organisms/api-key-form/api-key-form.test.tsx`, `api-key-form.stories.tsx`, `libs/supabase-services/src/services/api-key.service.test.ts`, `libs/supabase-services/src/dao/api-key.dao.test.ts`, `supabase/functions/manage-api-key/provider.test.ts`, `handle-save.test.ts`. Confirmed via grep + reading: literal `'openai'`/`'OpenAI'` fixtures fail once swap lands. Mitigating: prose already names them correctly — only frontmatter incomplete.

## Finding 2 (major) — `unauthenticated` missing from `@s15` Examples and spec.md's Error-row prose
`unauthenticated` is first-class everywhere else (task-2 union, task-6 service, task-13 recovery, task-14 i18n) but: (a) `@s15` Examples table has no row for it, (b) spec.md's Error row prose lists recovery categories without "Sign in." Mitigating: code fully specified in the error-contract table — a Gherkin-coverage/prose-consistency gap, not a missing decision.

## Items reverified clean
`DEFAULT_PROVIDER` in `api-key.service.ts:6` confirmed as actually-persisted provider; task-1 correctly targets it. `onExtracted?: (documentId: string) => void` on `PdfUpload` confirmed concrete/buildable; task-10 paths match. `@s12` correctly moved to Content row. Full traceability: all `@s1`-`@s20` map to ≥1 task, no orphans beyond the 2 findings above.
