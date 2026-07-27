## 1. Backend

- [x] 1.1 Replace reading-record PATCH input from `read_format` to `format_id`
- [x] 1.2 Validate `format_id` ownership and support clearing with null
- [x] 1.3 Include `format_id` in reading/list response DTOs

## 2. Frontend

- [x] 2.1 Refactor `ReadFormatSelect` to load options from `/v1/formats`
- [x] 2.2 Update tracker row and completion modal to use `format_id`
- [x] 2.3 Update create/edit book modal + form helpers to persist `format_id`

## 3. Tests and docs

- [x] 3.1 Update integration tests for set/clear/foreign `format_id`
- [x] 3.2 Update stats seed helper to set formats via ids
- [x] 3.3 Update API spec for `PatchReadingRecordRequest` and resource fields
