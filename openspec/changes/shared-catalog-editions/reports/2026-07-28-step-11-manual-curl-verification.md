# Step 11 Report - Manual Endpoint Testing

- Date: 2026-07-28
- Change: shared-catalog-editions

## Scenarios

| Step | Result |
|------|--------|
| Dev-login user A / B | OK |
| POST book (manual + ISBN) | 201, `catalog_edition_id` set |
| Second user same ISBN | 201, new library row |
| PATCH title for user B | OK |
| GET list user A | Catalog title unchanged |
| GET list user B | Override title shown |

## Notes

Verified against local backend on port 3000 after migration and server restart.
