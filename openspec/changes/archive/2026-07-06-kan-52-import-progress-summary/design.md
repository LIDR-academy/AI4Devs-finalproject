## Context

KAN-51 returns `202` + `job_id`; the client polls `GET /v1/import/jobs/:id` until `completed`. KAN-47 added minimal text progress; US-15 requires richer UX and job recovery.

## Goals / Non-Goals

- Goals: visual progress, structured summary, resume in-flight job, accessibility
- Non-goals: new endpoints, preview table, export

## Decisions

1. **Summary stats** — Use `result.meta` counts; compute `missing_finished_on_count` on the client from `result.mapped_rows` for imported rows with `status === 'leido'` and no `finished_on`.
2. **Job persistence** — `localStorage` key `rap.goodreads_import_job_id`; set on `202`, cleared on complete/fail.
3. **Components** — `ImportProgress` and `ImportSummary` under `frontend/src/components/import/`, using KAN-18 `Card` patterns.
4. **API client** — Export `startGoodreadsImport` + `pollImportJobUntilComplete` for upload vs resume flows.

## Risks / Trade-offs

- Large job payloads in `result` are already returned by the job API; no extra fetch needed.
