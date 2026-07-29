## Original

Map each parsed Goodreads row to `books` + `reading_records` applying US-13 rules: Exclusive Shelf→status, Binding→read_format (Unknown→empty), My Rating 0→no rating, Date Read→finished_on, Date Added→started_on (read/reading only; empty if Date Added > Date Read), Original Publication Year→publication_year (fallback Year Published), pages, title/author (ignore Additional Authors), Read Count>1→single record. Cover edge cases with fixture tests.

## Enhanced

### Scope (KAN-45 only)

Pure **mapping layer** from `GoodreadsParsedRow` → `GoodreadsImportDraft` (`book` + `reading_record` shapes). **No DB persistence, dedup, or validation** (KAN-46). Extend `POST /v1/import/goodreads` response with `mapped_rows` alongside existing `rows`.

### Mapping rules

| Goodreads field | Target | Rule |
|-----------------|--------|------|
| Exclusive Shelf | `reading_record.status` | `read`→`leido`, `to-read`→`pendiente`, `currently-reading`→`leyendo` |
| Binding | `reading_record.read_format` | Paperback/Hardcover/Mass Market/Bolsillo/Tapa*/Library Binding→`fisico`; Kindle Edition/ebook→`ebook`; Audible/Audiobook→`audio`; Unknown/empty→`null` |
| My Rating | `reading_record.rating` | `0` or empty→`null`; `1`–`5`→number |
| Date Read | `reading_record.finished_on` | `YYYY/MM/DD`→`YYYY-MM-DD`; empty allowed for `read` |
| Date Added | `reading_record.started_on` | Only when status `leido`/`leyendo`; if `date_added > date_read`→`null`; `pendiente`→`null` |
| Original Publication Year | `book.publication_year` | Prefer original; fallback `Year Published`; invalid/empty→`null` |
| Number of Pages | `book.page_count` | Parse int; empty/invalid→`null` |
| Title | `book.title` | Trim; required for valid draft |
| Author | `book.authors` | Trim; ignore `additional_authors` |
| ISBN / ISBN13 | `book.isbn10` / `book.isbn13` | From parser-cleaned values |
| Book Id | `book.external_provider_id` | Goodreads id string |
| — | `book.data_source` | Always `goodreads` |
| Read Count > 1 | — | Still one draft per CSV row (no duplicate reading records) |

### API

Extend `GoodreadsParseResponse` with `mapped_rows: GoodreadsMappedRow[]` where each item has `row_number`, `book`, `reading_record`, optional `mapping_warnings`.

### Files

- `backend/src/import/goodreads/goodreads-row.mapper.ts` (+ spec)
- `backend/src/import/goodreads/goodreads-import.types.ts`
- `backend/src/import/import.service.ts` — attach mapped rows
- `backend/test/import.integration-spec.ts` — assert mapped sample
- `docs/api-spec.yml` — schemas

### Tests (min fixture)

- Hobbit: full mapping, `started_on` when added < read
- Dune: `date_added > date_read` → `started_on` null, `finished_on` set
- Empty title row → excluded from `mapped_rows` + warning
- No ISBN: maps with null ISBNs
- Currently reading: `leyendo`, no `finished_on`
- Finished no date: `leido`, `finished_on` null, `read_count` ignored
- Binding Unknown → `read_format` null

### Definition of done

- Mapper unit tests green
- Integration test returns `mapped_rows` for upload
- OpenSpec tasks complete; no persistence
