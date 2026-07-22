# users

The QuickChat **users** service: the single source of truth for user identity.
It persists users to MongoDB and exposes one internal HTTP endpoint that turns a
verified email into a stable identity (`id` + `username`). It is reachable only
inside the compose network and is **never published to the host or portal**.
Identity reaches other services via `security`'s JWT claims, not by calling this
service directly.

## Internal API

```
POST /internal/users/get-or-create
  body: { "email": string }
  → 200 { "id": string, "email": string, "username": string, "created": bool }
  → 400 { "error": string }   // invalid/missing email or malformed body
  → 500 { "error": string }   // persistence failure
```

- **Idempotent by email.** The first request for a never-seen email creates one
  record and returns `created: true`; every later request for that email returns
  the same `id` and `username` with `created: false`. Concurrent first-time
  requests still yield exactly one user (enforced by a unique index on email).
- **`id`** is the users-service (MongoDB) identifier — the value `security`
  stamps as the `userId` claim and the platform uses for ownership.
- **`username`** is a random word+alphanumeric string (e.g. `maple7k2q`),
  globally unique, and **fixed for v0** (there is no update endpoint).
- A `200` always carries a non-empty `id` and `username`; any other outcome is a
  non-`200` — `security` relies on this to never mint an identity-less token.
- The service **never logs personal data** (email or otherwise).

Only `security` calls this endpoint; trust is the compose network (no shared
secret in v0).

## Configuration

All configuration comes from the environment. The service **fails fast** at
startup if a required variable is missing.

| Variable          | Example                                                        | Purpose                          |
| ----------------- | ------------------------------------------------------------- | -------------------------------- |
| `MONGO_URI`       | `mongodb://quickchat:<pass>@mongo:27017/?authSource=admin`    | Full MongoDB connection string   |
| `MONGO_DB`        | `quickchat`                                                    | Database name                    |
| `USERS_HTTP_ADDR` | `:8080`                                                        | Internal HTTP listen address     |

Values are supplied by `devops` via compose. In the dev environment MongoDB runs
internal-only and **ephemeral** (no volume): user records are wiped on
`docker compose down`.

## Run

```sh
export MONGO_URI='mongodb://quickchat:<pass>@mongo:27017/?authSource=admin'
export MONGO_DB=quickchat
export USERS_HTTP_ADDR=:8080
go run ./cmd/users
```

Or via Docker (multi-stage build → static binary on a minimal image):

```sh
docker build -t quickchat-users .
docker run --rm -e MONGO_URI=... -e MONGO_DB=quickchat -e USERS_HTTP_ADDR=:8080 quickchat-users
```

## Test

Unit tests run with no database (MongoDB is behind an interface with a
hand-written fake):

```sh
go test -race ./...
```

Integration tests exercise real MongoDB behavior (unique indexes, duplicate-key
mapping, idempotency under concurrency). They are excluded from the default run
by the `integration` build tag and require a reachable MongoDB:

```sh
MONGO_TEST_URI='mongodb://...' go test -tags=integration ./internal/mongostore/
```

## Layout

```
cmd/users/          entrypoint: wire config → Mongo → service → HTTP server
internal/user/      domain: User, Service (idempotent get-or-create), username gen, Repository interface
internal/mongostore/ MongoDB implementation of the Repository + unique indexes
internal/api/       thin HTTP handler: decode/validate → service → encode
internal/config/    env-driven configuration, fail-fast
```
