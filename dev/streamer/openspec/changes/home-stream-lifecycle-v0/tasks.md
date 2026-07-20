## 1. Project scaffolding

- [x] 1.1 Initialize the Go module (`go mod init`) and pin the Go version; add a `README.md` stub (what it is, how to run, how to test).
- [x] 1.2 Add `.gitignore` for build artifacts and local `.env`; confirm `gofmt`, `go vet`, and `golangci-lint run` execute clean on the empty module.

## 2. Configuration (env, fail-fast)

- [x] 2.1 Implement config loading from env: `VALKEY_ADDR` (required), `VALKEY_PASSWORD` (default ""), `VALKEY_DB` (default 0, int), `STREAMER_ADDR` (default ":8080"); return an error (never panic in library code) when `VALKEY_ADDR` is missing/blank or `VALKEY_DB` is unparsable.
- [x] 2.2 Table-driven unit tests: required-missing, defaults-applied, bad `VALKEY_DB`, all-set. Assert no secret values are logged.

## 3. Domain: Stream, validation, id

- [x] 3.1 Define the `Stream` struct and the `Store` interface (consumed here): `List`, `Add`, `Remove` with `context.Context` as the first parameter.
- [x] 3.2 Implement id generation: 16 bytes `crypto/rand`, `base64.RawURLEncoding`; surface a rand failure as an error.
- [x] 3.3 Implement validation: trim `title`, reject empty and > 200 code points (`utf8.RuneCountInString`); `description` default "", reject > 100 code points.
- [x] 3.4 Implement `Service` create/list/delete against `Store`, mapping storage "not found" on delete to a sentinel error callers can branch on (`errors.Is`).
- [x] 3.5 Unit tests with a hand-written fake `Store`: valid create (title-only and title+description), empty/whitespace title, over-long title, over-long description, boundary at exactly 100/101 code points with multi-byte chars, delete-existing, delete-missing.

## 4. Valkey-backed Store

- [x] 4.1 Add the chosen Valkey/Redis client dependency; record the justification in the done report and run `go mod tidy`.
- [x] 4.2 Implement `internal/valkey` `Store`: `streams` SET of ids + `stream:{id}` HASH `{title, description}`; POST writes both in one MULTI/EXEC; DELETE removes both in one transaction and reports whether the id was present; `List` reads the set then fetches hashes, omitting a missing hash as not-live. Bounded operation timeouts; no `KEYS`/`SCAN`.
- [x] 4.3 Implement a `Ping`-style reachability check for readiness.
- [x] 4.4 Integration tests (build-tagged, not in default `go test ./...`) against a real Valkey covering add/list/remove and delete-missing; keep the default suite hermetic via the fake `Store`.

## 5. HTTP API

- [x] 5.1 Implement thin handlers on stdlib `net/http.ServeMux` (Go 1.22 method+path patterns): `GET /streams`, `POST /streams`, `DELETE /streams/{id}`, plus `GET /healthz` and `GET /readyz`.
- [x] 5.2 Enforce boundary rules in `POST`: `http.MaxBytesReader` 8 KB cap, JSON decode (lenient unknown fields), validation → `400` on failure.
- [x] 5.3 Implement the shared error writer `{"error": string}` used for `400`/`404`/`405`/`500`; `500` messages generic, real error logged with context (no body, no credentials).
- [x] 5.4 Wire `/readyz` to the Valkey reachability check (200/503) and `/healthz` to a static 200.
- [x] 5.5 Handler tests with `httptest` against the fake `Store`: all §6 status codes and bodies, empty-array list, `405` on wrong method, malformed/oversized body, error-body shape, `/healthz` 200, `/readyz` 200 and 503.

## 6. Wiring, server hardening, lifecycle

- [x] 6.1 Implement `cmd/streamer/main.go`: load config, construct the Valkey client, wire store → service → handler, start `http.Server` with ReadHeader/Read/Write/Idle timeouts set.
- [x] 6.2 Implement graceful shutdown: `signal.NotifyContext` (SIGINT/SIGTERM) → `server.Shutdown` with a bounded deadline → close the Valkey client; no leaked goroutines.
- [x] 6.3 Test graceful-shutdown behavior deterministically (no `time.Sleep`): trigger cancellation and assert clean stop.

## 7. Docker + docs

- [x] 7.1 Write the multi-stage Dockerfile (Go build → static binary on a minimal image), listening on `:8080`, config via env only.
- [x] 7.2 Publish the exact env var names to devops and confirm the code-point counting method with qc-portal; record both coordinations for the team lead.
- [x] 7.3 Update `README.md`: env vars, endpoints (including `/healthz`, `/readyz`), how to run and test; document the `{"error": string}` shape and the Valkey key model.

## 8. Definition of Done gate

- [x] 8.1 `gofmt` clean, `go vet` clean, `golangci-lint run` clean, `go mod tidy` produces no diff.
- [x] 8.2 `go test -race ./...` passes (happy + error paths covered); integration tests pass against a real Valkey via their build tag.
- [x] 8.3 Assemble the done report: change summary, tests written, and full-suite results (never a bare "done").
