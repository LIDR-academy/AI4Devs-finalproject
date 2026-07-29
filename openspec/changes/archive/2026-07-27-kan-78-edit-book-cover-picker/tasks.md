# Tasks: KAN-78 edit book cover picker

## 1. API layer

- [x] 1.1 Add `BookCoverSearchResponse` types in `frontend/src/api/types.ts`
- [x] 1.2 Add `searchBookCovers(bookId, q?)` in `frontend/src/api/client.ts`

## 2. Components

- [x] 2.1 Extend `CoverPicker` with optional `emptyMessage` and `showContinueWithoutCover`
- [x] 2.2 Create `BookCoverSearchPanel` with search field, loading, flatten + grid
- [x] 2.3 Integrate into `BookFormModal` (edit mode only)

## 3. Verification

- [x] 3.1 `npm run build` in frontend passes
- [x] 3.2 Manual: edit book → Buscar portada → select cover → Guardar
