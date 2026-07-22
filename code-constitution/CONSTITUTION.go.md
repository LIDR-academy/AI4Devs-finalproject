# Code Constitution — Go

> Extends [`CONSTITUTION.md`](./CONSTITUTION.md). Read that first — its rules always apply.
> This file adds Go-specific conventions. Applies to all Go services (e.g. Security, Streamer, Users).

## 1. Idiomatic Go, Nothing Else

- Follow [Effective Go](https://go.dev/doc/effective_go) and the [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments). When in doubt, do what the standard library does.
- **Boring Go is idiomatic Go**: plain structs, plain interfaces, plain functions. No reflection tricks, no generics unless they clearly remove duplication, no framework-style magic.
- Accept interfaces, return structs. Define interfaces **where they are consumed**, not where they are implemented, and keep them small (1–3 methods).

## 2. Project Layout

- Standard layout, kept flat:
  - `cmd/<app>/main.go` — entrypoint only: wire dependencies, start the server. No business logic.
  - `internal/<domain>/` — business packages (e.g. `internal/rooms`, `internal/chats`, `internal/auth`).
  - `pkg/` only for code intentionally shared across repos — otherwise don't create it.
- Package names: short, lowercase, singular, no underscores (`rooms`, not `roomsManager` or `room_utils`).
- **No `utils`, `helpers`, `common`, or `misc` packages.** Name packages after what they provide.

## 3. Formatting & Linting (Enforced)

- `gofmt` (or `goimports`) — non-negotiable; unformatted code is broken code.
- `go vet` must pass.
- `golangci-lint run` must pass with the repo's config. Never disable a linter rule to make code pass — fix the code or escalate (Common §7).

## 4. Errors

- Return errors; **never panic** in library/business code. Panics are only acceptable in `main` for unrecoverable startup failures.
- Wrap with context: `fmt.Errorf("creating room %s: %w", id, err)`. Lowercase messages, no trailing punctuation.
- Use `errors.Is` / `errors.As` for checks; define sentinel errors (`var ErrRoomNotFound = errors.New(...)`) or typed errors per package where callers need to branch.
- Handle every error. `_ = someCall()` requires a comment explaining why ignoring is safe.

## 5. Concurrency

- **Every goroutine has a defined owner and a defined way to stop.** No fire-and-forget goroutines.
- `context.Context` is the first parameter of every function that does I/O, blocks, or crosses an API boundary: `func (s *Service) CreateRoom(ctx context.Context, ...)`. Never store a context in a struct.
- Honor cancellation: long-running loops (WebSocket read/write pumps, subscribers) must select on `ctx.Done()`.
- Prefer channels for communication and ownership transfer; use `sync.Mutex` for simple shared state. Keep critical sections tiny.
- Run tests with `-race` in CI. A data race is a release blocker.

## 6. HTTP / API Code

- `net/http` first. A router (e.g. `chi`) is acceptable; full frameworks are not, unless already established in the repo.
- Handlers are thin: decode/validate input → call business logic → encode response. Business logic lives in `internal/<domain>`, never in handlers.
- Validate request payloads at the boundary; return meaningful status codes and a consistent JSON error shape.
- Always set timeouts on `http.Server` (read/write/idle) and on outbound clients. The default zero timeout is a bug.

## 7. Testing

- Standard `testing` package. Assertion libraries only if the repo already uses one.
- **Table-driven tests** are the default pattern for functions with multiple cases.
- Unit tests live next to the code (`foo_test.go`). Use `package foo_test` when testing the public API.
- Use interfaces + hand-written fakes for dependencies (DB, Valkey, SuperTokens). No heavyweight mocking frameworks.
- Integration tests are separated by build tags or a dedicated folder and don't run in the default `go test ./...`.
- `t.Parallel()` where safe. No `time.Sleep` for synchronization — use channels or `context` with timeout.

## 8. Documentation

- Every exported identifier has a doc comment starting with its name: `// CreateRoom creates a stream room and registers it in Valkey.`
- Every package has a package comment (`doc.go` if it needs more than a couple of lines).

## 9. Definition of Done (Go additions)

In addition to the Common checklist:

- [ ] `gofmt` clean, `go vet` clean, `golangci-lint` clean.
- [ ] `go test -race ./...` passes.
- [ ] No new goroutine without a stop mechanism; no context stored in structs.
- [ ] `go.mod` tidy (`go mod tidy` produces no diff).
