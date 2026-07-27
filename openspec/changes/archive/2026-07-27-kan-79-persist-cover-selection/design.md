# Design: Persist cover selection (KAN-79)

## Approach

Verify end-to-end persistence through existing `BookFormModal` → `patchBook` → `BooksService.update` path. Add backend integration tests as the authoritative check (no frontend E2E harness).

## Test URLs

- Grid-style: `https://covers.openlibrary.org/b/id/12345-L.jpg`
- Manual override: `https://example.com/manual-cover.jpg`

## Edge cases

- Empty string from form → `null` in PATCH payload (clear cover).
- Invalid URL rejected by client validation before API call; backend `@IsUrl()` rejects malformed values.
