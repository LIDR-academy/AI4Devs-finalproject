## Original

**KAN-71**: Formats model + read_format migration.

Create `formats` table, migrate `reading_records.read_format` to `format_id` FK, seed Físico/Ebook/Audio on registration, migrate historical data, drop `read_format` column.

## Enhanced

Mirror KAN-65 audiences pattern:

### Backend

- `backend/src/formats/` — entity, constants, `FormatsService.seedDefaultsForUser`, `resolveFormatIdByLegacySlug`
- Migration `1755000000000-CreateFormats.ts`
- `ReadingRecord.formatId` + relation; remove `readFormat` column
- `UsersService` seeds formats for new users
- `BooksService` — PATCH/list derive `read_format` API from `format_id`
- `GoodreadsImportProcessor` — resolve `format_id` on import
- `StatsService.formatDistribution` — join `formats`, map to legacy slugs for API

### API compatibility

- Request/response still use `read_format: fisico|ebook|audio|null` until KAN-73 UI selector.

### Tests

- Unit: seed once, resolve legacy slug
- Integration: books PATCH read_format still works

### Out of scope (later tickets)

- Settings CRUD (KAN-72), selector UI (KAN-73), delete confirmation (KAN-74), stats custom format names (KAN-75)
