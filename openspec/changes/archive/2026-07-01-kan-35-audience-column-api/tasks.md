# Tasks — KAN-35 Book audience

## 1. Backend

- [x] 1.1 Migration + `Book` entity `audience` enum column
- [x] 1.2 DTOs: `CreateBookDto`, `PatchBookDto`; response includes `audience`
- [x] 1.3 `BooksService.create` + `update`; `PATCH /v1/books/:bookId`
- [x] 1.4 Integration tests for audience create/patch/list

## 2. Frontend

- [x] 2.1 Types + `patchBook` client
- [x] 2.2 `AudienceSelect` component (accessible)
- [x] 2.3 Add Book modal: audience on save step
- [x] 2.4 Book Tracker: Audience column with inline patch

## 3. Docs and verification

- [x] 3.1 Update `docs/data-model.md` and `docs/api-spec.yml`
- [x] 3.2 `MANUAL-TEST-KAN-35.md`; `npm run build` backend + frontend
