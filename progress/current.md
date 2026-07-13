# Current session

**Active feature:** ai-lesson-generation
**Folder:** docs/features/ai-lesson-generation/
**Phase:** approved
**Status:** Spec + Gherkin contract (@s1–@s20) approved at the human gate. spec_reviewer ran 2 rounds; round 1's 4 findings fixed and reverified; round 2 (cap) surfaced 2 low-risk completeness gaps (task-1.md paths list, @s15 unauthenticated row) — human approved as-is, to be patched during build (task-1 / slice 2). 15 tasks across 3 slices. Starting Phase 2 (implementator, TDD, slice 1).
**Notes:** Cross-cutting provider swap (OpenAI→Groq) touches shipped R6 code. No `lessons` persistence this story (R5, Phase 2) — in-memory deck with minted `lessonId`.
