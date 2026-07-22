# security

QuickChat's authentication and token authority. It fronts **SuperTokens managed
cloud** (Passwordless — email magic link), exposes the standard `/auth/*`
endpoints and a **JWKS** endpoint, and stamps the account identity (`userId` +
`username`) into every access token. It is the **only** service that talks to
SuperTokens.

## What it does

- **Magic-link sign-in / sign-out** via the SuperTokens Go SDK, header transfer
  mode (`Authorization: Bearer <access token>`, not cookies).
- **First-login identity:** on a new session it calls the `users` service
  `POST /internal/users/get-or-create { email } → { id, email, username, created }`
  and stamps `userId` (the users-service id — the ownership identity) and
  `username` into the access-token claims. It is **fail-closed**: if `users` is
  unreachable, returns a non-200, or returns an incomplete record, session
  creation fails and no identity-less token is issued.
- **JWKS** at `<SECURITY_API_BASE_PATH>/jwt/jwks.json` (default
  `/auth/jwt/jwks.json`) so `streamer` verifies tokens statelessly — no
  per-request call back to security.

### Access-token claims (published contract)

| Claim      | Type   | Meaning                                            |
|------------|--------|----------------------------------------------------|
| `userId`   | string | users-service (Mongo) id — **ownership**; not `sub` |
| `username` | string | account username                                   |

Consumers must read `userId` for ownership, **not** the SuperTokens `sub` claim.

## Configuration

All configuration comes from the environment. Missing required variables are a
fatal startup error. Secrets are never baked into the image or logged. Copy
`.env.example` to an untracked `.env` and fill it in.

| Variable                     | Required | Default     | Notes                                              |
|------------------------------|----------|-------------|----------------------------------------------------|
| `SUPERTOKENS_CONNECTION_URI` | yes      | —           | SuperTokens managed-cloud core URI                 |
| `SUPERTOKENS_API_KEY`        | yes      | —           | **secret** — never logged/returned/committed       |
| `SECURITY_API_DOMAIN`        | yes      | —           | domain `/auth` is served under                     |
| `SECURITY_WEBSITE_DOMAIN`    | yes      | —           | portal origin (magic-link building / CORS)         |
| `USERS_GET_OR_CREATE_URL`    | yes      | —           | full URL of the users internal endpoint            |
| `SECURITY_API_BASE_PATH`     | no       | `/auth`     | changing it moves the JWKS path                    |
| `SECURITY_APP_NAME`          | no       | `QuickChat` | SuperTokens app name                               |
| `PORT`                       | no       | `8080`      | HTTP listen port                                   |

## Run

```sh
# with a filled-in .env exported into the environment
go run ./cmd/security
```

Health check: `GET /healthz` → `200 {"status":"ok"}`.

### Docker

```sh
docker build -t quickchat-security .
docker run --rm --env-file .env -p 8080:8080 quickchat-security
```

The image is multi-stage (static binary on a distroless nonroot base); config is
supplied at runtime via `--env-file` / compose, never built in. `devops` consumes
this Dockerfile.

## Test

```sh
go test -race ./...
go vet ./...
golangci-lint run ./...
```

Unit tests use hand-written fakes and `httptest`; they never call the managed
SuperTokens service. The SuperTokens SDK wiring (recipe init, the
`CreateNewSession` claim-stamping override, `GetUserByID`) is exercised
end-to-end against real credentials during the feature's live sign-in loop.

## Layout

```
cmd/security/      entrypoint: load config, init auth, run server
internal/config/   env config + validation (fail-fast; redacts the API key)
internal/users/    client for the users get-or-create endpoint (fail-closed)
internal/auth/     SuperTokens recipes, header transfer, claim-stamping override
internal/server/   HTTP server (timeouts, graceful shutdown, /healthz)
```
