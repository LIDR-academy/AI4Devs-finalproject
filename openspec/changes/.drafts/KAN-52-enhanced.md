# KAN-52 — US-15 Import progress and final summary (enhanced)

## Summary

Readers see import progress (processed/total + phase) and a structured final summary: imported, duplicate skips, discarded (no title), missing finish date, enrichment failures. Resume polling if they leave and return while a job runs.

## Acceptance mapping

| Criterion | Implementation |
|-----------|----------------|
| Progress during import | `ImportProgress` + poll `GET /import/jobs/:id` |
| Final summary counts | `ImportSummary` from `result.meta` + `missing_finished_on_count` |
| Resume after navigation | `localStorage` job id + mount effect |
| WCAG 2.1 AA | `role="status"`, `aria-live="polite"`, progressbar ARIA |

## Technical notes

- Depends on KAN-51 job API; no backend changes required
- Use KAN-18 UI components (`Card`, `Button`)
- Frontend-only scope
