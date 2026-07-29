## Context

KAN-44 returns normalized CSV rows. KAN-45 applies US-13 mapping rules as a pure function layer so KAN-46 can validate and dedupe without re-parsing.

## Decisions

1. **Pure mapper** — `mapGoodreadsRows(rows)` in `goodreads-row.mapper.ts`; no TypeORM in mapper.
2. **Response shape** — Add `mapped_rows[]` with `{ row_number, book, reading_record, warnings? }`; keep raw `rows` for debugging.
3. **Date conversion** — Goodreads `YYYY/MM/DD` → ISO `YYYY-MM-DD`; compare dates as strings after normalization.
4. **Invalid drafts** — Rows without title are omitted from `mapped_rows` with `MISSING_TITLE` warning (validation summary in KAN-46).
5. **Read Count** — One draft per CSV row regardless of `read_count` value.

## Binding map

| Goodreads binding (case-insensitive contains) | `read_format` |
|-----------------------------------------------|---------------|
| kindle, ebook | `ebook` |
| audible, audiobook | `audio` |
| paperback, hardcover, mass market, bolsillo, tapa, library binding | `fisico` |
| unknown, empty | `null` |

## Files

- `goodreads-import.types.ts` — draft DTO types
- `goodreads-row.mapper.ts` + `.spec.ts`
- `import.service.ts` — wire mapper after parse
