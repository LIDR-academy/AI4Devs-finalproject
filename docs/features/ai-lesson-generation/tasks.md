---
feature: ai-lesson-generation
phase: in_review # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 1     # incremented by reviews_lead; cap 2
---

# Tasks — ai-lesson-generation

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; within a slice, backend + logic before UI.

Within **Slice 1**: provider swap (task-1) → contract types + slide image-ref (task-2) → key-read migration (task-3) → `generate-lesson` Edge Function happy path + Groq/AI-SDK spike (task-4) → DAO (task-5) → service (task-6) → hook (task-7) → progress molecule (task-8) → panel organism (task-9) → wiring + screen + integration (task-10). Slice 2 layers composition variants + errors + vision/degradation; Slice 3 adds i18n + a11y + e2e.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) — Provider swap OpenAI → Groq (R6 code) | 1 | @s20 | done | libs/types/src/api-key.ts, supabase/functions/manage-api-key/provider.ts, libs/supabase-services/src/services/api-key.service.ts, libs/study-buddy/src/components/api-key-settings/, libs/study-buddy/src/components/api-key-gate/, libs/components/tests/e2e/organisms/api-key-form/, libs/localization/src/resources/ |
| [task-2](./task-2.md) — Generation contract types + slide image-ref | 1 | @s1,@s3,@s11 | done | libs/types/src/lesson-generation.ts, libs/types/src/lesson.ts |
| [task-3](./task-3.md) — `get_api_key` service-role Vault read RPC (migration) | 1 | @s7,@s8 | done | supabase/migrations/ |
| [task-4](./task-4.md) — `generate-lesson` Edge Function happy path (both) + Groq/AI-SDK spike | 1 | @s3,@s6,@s7,@s8,@s9,@s11,@s13 | done | supabase/functions/generate-lesson/, libs/supabase-services/src/services/lesson-generation.* |
| [task-5](./task-5.md) — `LessonGenerationDao` (functions.invoke) | 1 | @s6,@s7 | done | libs/supabase-services/src/dao/lesson-generation.dao.ts |
| [task-6](./task-6.md) — `LessonGenerationService` (orchestrate happy path) | 1 | @s3,@s6 | done | libs/supabase-services/src/services/lesson-generation.service.ts |
| [task-7](./task-7.md) — `useLessonGeneration` hook (state + progress stepper) | 1 | @s14 | done | libs/hooks/src/hooks/use-lesson-generation.ts |
| [task-8](./task-8.md) — `GenerationProgress` molecule (labeled multi-step) | 1 | @s14 | done | libs/components/src/molecules/generation-progress/ |
| [task-9](./task-9.md) — `LessonGenerationPanel` organism (picker + Generate + Loading + Content) | 1 | @s1,@s2,@s14,@s16,@s17 | done | libs/components/src/organisms/lesson-generation-panel/ |
| [task-10](./task-10.md) — `LessonGeneration` wiring + PdfUpload onExtracted + upload screen + integration | 1 | @s1,@s3,@s16,@s17 | done | libs/study-buddy/src/components/lesson-generation/, libs/study-buddy/src/components/pdf-upload/, apps/app-study-buddy/src/app/(app)/upload.tsx |
| [task-11](./task-11.md) — Composition variants prompt enforcement (instructional-only / activity-only) | 2 | @s4,@s5,@s6 | done | supabase/functions/generate-lesson/, libs/supabase-services/src/services/lesson-generation.* |
| [task-12](./task-12.md) — Server error contract + vision fallback + image degradation | 2 | @s10,@s12,@s15 | done | supabase/functions/generate-lesson/, libs/supabase-services/src/services/lesson-generation.* |
| [task-13](./task-13.md) — Client error normalization + hook retry + Panel Error state + error integration | 2 | @s12,@s15 | done | libs/supabase-services/src/services/lesson-generation.service.ts, libs/hooks/src/hooks/use-lesson-generation.ts, libs/components/src/organisms/lesson-generation-panel/, libs/study-buddy/src/components/lesson-generation/ |
| [task-14](./task-14.md) — i18n `generation.*` keys (en/es/pt/de) + coverage test | 3 | @s18 | done | libs/localization/src/resources/ |
| [task-15](./task-15.md) — a11y pass + Playwright e2e | 3 | @s19 | done | libs/components/src/organisms/lesson-generation-panel/, libs/components/src/molecules/generation-progress/, libs/components/tests/e2e/ |

**Slice 1 — Happy path (both) + Loading + Content + provider swap** · **Slice 2 — Composition variants + Error + vision/degradation** · **Slice 3 — i18n + a11y + e2e**

> **Gate notes:** task-4 begins with a **time-boxed spike** proving `@ai-sdk/groq` + `generateObject` run in the real Edge (Deno) runtime against a live Groq key (risks.md R1); the Groq **model IDs** (`llama-3.3-70b-versatile`, `meta-llama/llama-4-scout-17b-16e-instruct`) are a tunable constant to confirm against Groq's current model list at build (spec.md Open decision #2). **No persistence** this story — generation returns an in-memory deck with a minted `lessonId` (Open decision #5). Analytics + feature flags: **none** (per story). The Deno function sits **outside** the Jest/Stryker harness — logic lives in pure JS modules, mirrored by hand (risks.md R2).
