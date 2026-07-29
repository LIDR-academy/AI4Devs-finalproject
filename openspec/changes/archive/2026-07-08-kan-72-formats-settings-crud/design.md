## Context

Follow the KAN-66 audiences Settings pattern on top of KAN-71 `formats` persistence.

## Decisions

- No PATCH/rename endpoint (per Jira).
- Delete is immediate in this ticket; KAN-74 adds confirmation and affected-record preview.
- Response shape mirrors audiences: `{ id, name, is_default, created_at, updated_at }`.

## API

| Method | Path | Success |
|--------|------|---------|
| GET | `/v1/formats` | 200 array |
| POST | `/v1/formats` | 201 object |
| DELETE | `/v1/formats/{id}` | 204 |
