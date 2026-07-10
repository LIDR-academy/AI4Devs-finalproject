---
feature: pdf-upload-extraction
phase: approved   # pending|spec_ready|approved|in_progress|in_review|mutation|pr_ready|done
review_round: 0     # incremented by reviews_lead; cap 3
---

# Tasks — pdf-upload-extraction

Index of atomic tasks (one `task-N.md` each), grouped by vertical slice. `orchestrator_lead` owns the `phase` above; `implementator` flips each task's `status`. Build order is strictly Slice 1 → 2 → 3; do not start a slice until the previous slice's gate passes.

Within **Slice 1**, build backend + logic before UI: schema (task-1) → contract types (task-2) → Edge Function happy path incl. the `mupdf`-wasm spike (task-3) → DAO (task-4) → service (task-5) → hook (task-6) → presentational panel (task-7) → wiring + screen + integration (task-8). Slices 2 and 3 layer error/empty and observability/a11y/i18n on top.

| Task | Slice | Scenarios | Status | Paths |
|---|---|---|---|---|
| [task-1](./task-1.md) — DB migration: schema + storage buckets + RLS | 1 | @s2,@s3,@s14 | todo | supabase/migrations/ |
| [task-2](./task-2.md) — Extraction contract types (`@helsoft/types`) | 1 | @s1,@s2,@s3 | todo | libs/types/src/pdf-extraction.ts |
| [task-3](./task-3.md) — `extract-pdf` Edge Function (happy path + `mupdf`-wasm spike) | 1 | @s1,@s2,@s3,@s4 | todo | supabase/functions/extract-pdf/ |
| [task-4](./task-4.md) — `PdfUploadDao` (storage upload + function invoke) | 1 | @s1,@s4 | todo | libs/services/src/dao/pdf-upload.dao.ts |
| [task-5](./task-5.md) — `PdfExtractionService` (validate + orchestrate) | 1 | @s1,@s4 | todo | libs/services/src/services/pdf-extraction.service.ts |
| [task-6](./task-6.md) — `usePdfExtraction` hook | 1 | @s1,@s5 | todo | libs/hooks/src/hooks/use-pdf-extraction.ts |
| [task-7](./task-7.md) — `PdfUploadPanel` organism (Loading + Content) | 1 | @s5,@s6 | todo | libs/components/src/organisms/pdf-upload-panel/ |
| [task-8](./task-8.md) — `PdfUpload` wiring + upload screen + integration | 1 | @s1,@s4,@s5,@s6 | todo | libs/study-buddy/src/components/pdf-upload/, apps/app-study-buddy/src/app/(app)/upload.tsx |
| [task-9](./task-9.md) — Server error contract + scanned/page/corrupt detection | 2 | @s8,@s11,@s12,@s14 | todo | supabase/functions/extract-pdf/, libs/services/src/services/pdf-extraction.service.ts |
| [task-10](./task-10.md) — Client pre-validation (type + size) | 2 | @s9,@s10 | todo | libs/services/src/services/pdf-extraction.service.ts |
| [task-11](./task-11.md) — `PdfUploadPanel` Empty + Error + Retry states | 2 | @s7,@s8,@s9,@s10,@s11,@s12,@s13 | todo | libs/components/src/organisms/pdf-upload-panel/ |
| [task-12](./task-12.md) — Hook error/retry + wiring + error integration | 2 | @s13,@s14 | todo | libs/hooks/src/hooks/use-pdf-extraction.ts, libs/study-buddy/src/components/pdf-upload/ |
| [task-13](./task-13.md) — i18n `upload.*` keys (en/es/pt/de) | 3 | @s15 | todo | libs/localization/src/resources/ |
| [task-14](./task-14.md) — a11y pass + Playwright e2e | 3 | @s16 | todo | libs/components/src/organisms/pdf-upload-panel/, libs/components/tests/e2e/ |
| [task-15](./task-15.md) — Extraction analytics events | 3 | @s17 | todo | libs/services/src/services/pdf-extraction.service.ts, libs/study-buddy/src/components/pdf-upload/ |

**Slice 1 — Happy path + Loading** · **Slice 2 — Empty + Error + Retry** · **Slice 3 — Analytics + a11y + i18n**

> **Gate notes (locked at the combined gate, 2026-07-10):** task-3 begins with a **time-boxed spike that validates and implements `mupdf`-wasm** in the real Edge runtime (decision #2 — library locked, adapter keeps it swappable, AGPL accepted). task-15 (analytics) is **committed Slice-3 scope** — the three PII-free events are confirmed (maps to @s17). The **10 MB / 20 page** limits and the schema/storage/downscale defaults (decisions #1, #3, #4) are locked in `spec.md`.
