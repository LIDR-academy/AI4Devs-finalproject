---
feature: ai-lesson-generation
phase: pr_ready # pending|spec_drafted|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 1     # incremented by reviews_lead; cap 2
---

# Tasks — ai-lesson-generation

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementer` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; within a slice, backend + logic before UI.

Slice 1 build order = task table order (task-1 → task-10): provider swap → types → key-read migration → Edge Function → DAO → service → hook → progress molecule → panel organism → wiring. Slice 2 (task-11/12/13) layers composition variants + errors + vision/degradation; Slice 3 (task-14/15) adds i18n + a11y + e2e.

Paths are full per-task in each `task-N.md`'s frontmatter — not repeated here.

| Task | Slice | Scenarios | Status | Area |
|---|---|---|---|---|
| [task-1](./task-1.md) — Provider swap OpenAI → Groq (R6 code) | 1 | @s20 | done | api-key type/service/UI + fixtures (hooks/components/supabase-services/localization) |
| [task-2](./task-2.md) — Generation contract types + slide image-ref | 1 | @s1,@s3,@s11 | done | `@helsoft/types` |
| [task-3](./task-3.md) — `get_api_key` service-role Vault read RPC (migration) | 1 | @s7,@s8 | done | `supabase/migrations/` |
| [task-4](./task-4.md) — `generate-lesson` Edge Function happy path (both) + Groq/AI-SDK spike | 1 | @s3,@s6,@s7,@s8,@s9,@s11,@s13 | done | Edge Function + `lesson-generation.*` pure modules |
| [task-5](./task-5.md) — `LessonGenerationDao` (functions.invoke) | 1 | @s6,@s7 | done | `@helsoft/supabase-services` DAO |
| [task-6](./task-6.md) — `LessonGenerationService` (orchestrate happy path) | 1 | @s3,@s6 | done | `@helsoft/supabase-services` service |
| [task-7](./task-7.md) — `useLessonGeneration` hook (state + progress stepper) | 1 | @s14 | done | `@helsoft/hooks` |
| [task-8](./task-8.md) — `GenerationProgress` molecule (labeled multi-step) | 1 | @s14 | done | `@helsoft/components` molecule |
| [task-9](./task-9.md) — `LessonGenerationPanel` organism (picker + Generate + Loading + Content) | 1 | @s1,@s2,@s14,@s16,@s17 | done | `@helsoft/components` organism |
| [task-10](./task-10.md) — `LessonGeneration` wiring + PdfUpload onExtracted + upload screen + integration | 1 | @s1,@s3,@s16,@s17 | done | `@helsoft/study-buddy` + app upload screen |
| [task-11](./task-11.md) — Composition variants prompt enforcement (instructional-only / activity-only) | 2 | @s4,@s5,@s6 | done | Edge Function + `lesson-generation.*` |
| [task-12](./task-12.md) — Server error contract + vision fallback + image degradation | 2 | @s10,@s12,@s15 | done | Edge Function + `lesson-generation.*` |
| [task-13](./task-13.md) — Client error normalization + hook retry + Panel Error state + error integration | 2 | @s12,@s15 | done | service + hook + panel + study-buddy wiring |
| [task-14](./task-14.md) — i18n `generation.*` keys (en/es/pt/de) + coverage test | 3 | @s18 | done | `@helsoft/localization` |
| [task-15](./task-15.md) — a11y pass + Playwright e2e | 3 | @s19 | done | panel + generation-progress + e2e |

**Slice 1 — Happy path (both) + Loading + Content + provider swap** · **Slice 2 — Composition variants + Error + vision/degradation** · **Slice 3 — i18n + a11y + e2e**

> **Gate notes:** task-4 spike + model-ID confirmation → spec.md Open decision #2, risks.md R1. No persistence (in-memory deck + minted `lessonId`) → spec.md Open decision #5. Analytics/feature flags: none (spec.md). Deno function outside Jest/Stryker harness → risks.md R2.
