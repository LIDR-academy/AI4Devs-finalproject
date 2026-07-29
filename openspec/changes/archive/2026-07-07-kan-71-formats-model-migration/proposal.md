## Why

Readers need configurable read formats (Físico, Ebook, Audio) like audiences (KAN-70). Before Settings CRUD and selectors (KAN-72–73), the platform needs `formats` persistence, `reading_records.format_id`, data migration from the fixed `read_format` CHECK, and default seed on registration.

## What Changes

- Add `formats` table and `reading_records.format_id` FK (`ON DELETE SET NULL`).
- Migrate existing `read_format` values to `format_id`; drop `read_format` column.
- Seed Audio, Ebook, Físico for new users.
- Keep API `read_format` field as legacy slug derived from linked format name.

**Non-breaking API:** `read_format` request/response shape unchanged until KAN-73 selector.

## Capabilities

### New Capabilities

- `user-formats`: User-owned format list persistence, default seed, and `reading_records.format_id` foreign key.

### Modified Capabilities

- _(none — no Settings CRUD or stats changes in this ticket; KAN-75 adapts stats)_

## Impact

- **Backend:** `formats` module, migration, `UsersService` hook, `BooksService` / import / stats compatibility.
- **Database:** new table, column migration, drop `read_format`.
- **API / frontend:** no UI changes; `read_format` still exposed via mapping.
