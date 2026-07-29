## Original

**KAN-35:** US-11 · Campo audiencia (YA / New Adult / Adult) en libros  
Register book audience for tracker column and stats analysis. Values: young_adult, new_adult, adult (nullable).

## Enhanced

### Scope

| Layer | Deliverable |
|-------|-------------|
| DB | `books.audience VARCHAR NULL CHECK IN ('young_adult','new_adult','adult')` + migration |
| API | `audience` on POST `/v1/books`, PATCH `/v1/books/{bookId}`, GET list response |
| Frontend | Audience selector in Add Book flow; editable column in Book Tracker |
| Docs | `docs/data-model.md`, `docs/api-spec.yml` |

### Out of scope

- Reading Stats pie chart (KAN-41)
- Full manual edit form (KAN-26)

### DoD

- Migration runs; integration tests for create/patch/list with audience
- Accessible `<select>` with labels (ui Select or native with label)
- `npm run build` backend + frontend
