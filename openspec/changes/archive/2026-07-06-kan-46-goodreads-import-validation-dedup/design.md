## Context

KAN-45 returns `mapped_rows`. KAN-46 must make import idempotent and safe for large CSVs (~1k rows).

## Decisions

1. **Single-pass processor** — load user's existing dedup keys once, iterate mapped rows in file order.
2. **Dedup key** — `isbn13` if set; else `title|authors` normalized (lowercase, collapsed whitespace).
3. **Skip policy** — never update existing books; record `DUPLICATE_EXISTING` or `DUPLICATE_IN_BATCH`.
4. **Persistence** — `ImportService` uses TypeORM `Book` + `ReadingRecord` repositories; no catalog calls for `goodreads` source.
5. **Reading defaults** — when status `leido` and `page_count` set, set `current_page` and `progress_percent` to 100%.

## Files

- `goodreads-dedup.util.ts`
- `goodreads-import.processor.ts`
- Extend `goodreads-import.types.ts` for summary types
