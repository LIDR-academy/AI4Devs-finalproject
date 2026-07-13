# Current session

**Active feature:** ai-lesson-generation
**Folder:** docs/features/ai-lesson-generation/
**Phase:** in_progress
**Status:** Slice 1 (tasks 1-10: provider swap, contract types, get_api_key RPC, generate-lesson Edge Function happy path, DAO/service/hook, GenerationProgress molecule, LessonGenerationPanel organism, wiring) built + reviewer_slice APPROVED (round 2; round 1 found 5 findings incl. a pre-existing RadioGroup aria-checked a11y bug, all fixed) + committed. Starting slice 2 (tasks 11-13).
**Notes:** Cross-cutting provider swap (OpenAI→Groq) touches shipped R6 code. No `lessons` persistence this story (R5, Phase 2) — in-memory deck with minted `lessonId`. Pre-existing, unrelated `@helsoft/localization` `migration-coverage.test.ts` (sign-in-form/sign-out) failure confirmed out of scope (fails identically on HEAD before this feature).
