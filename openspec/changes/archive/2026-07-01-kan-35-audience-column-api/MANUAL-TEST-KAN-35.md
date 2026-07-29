# Manual test — KAN-35 (book audience)

## Prerequisites

- Backend and frontend running locally (`npm start` in each).
- Migration applied: `cd backend && npm run migration:run`.
- Logged-in user with at least one book in Book Tracker.

## Add Book — audience on create

1. Open **Book Tracker** → **Add book**.
2. Search or enter a title and proceed to the cover step.
3. Confirm **Audience** dropdown appears (options: Young Adult, New Adult, Adult, or empty).
4. Select **Young Adult** and complete add.
5. New row shows **Young Adult** in the Audience column.

## Book Tracker — inline edit

1. Change audience on an existing row via the column dropdown (e.g. **Adult**).
2. Refresh the page — value persists.
3. Clear audience (empty option) — column shows empty; refresh confirms null.

## API (optional)

```bash
# List books — audience on each item
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/v1/books

# Patch audience
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"audience":"new_adult"}' http://localhost:3000/v1/books/{bookId}
```

## Regression

- Reading status, dates, rating, and format columns still work.
- Add book without selecting audience — book creates with null audience.
