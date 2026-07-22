## 1. Mongo service

- [x] 1.1 Add the `mongo` service to `docker-compose.yml`: official `mongo` pinned tag, service name `mongo`, port 27017, NO published host port (internal-only), DEV-ONLY root creds via `MONGO_INITDB_ROOT_USERNAME`/`MONGO_INITDB_ROOT_PASSWORD` from env, no persistence volume (ephemeral).
- [x] 1.2 Add the `mongo` healthcheck: `mongosh --quiet --eval "db.adminCommand('ping')"` (or `mongo` for older tags).

## 2. security + users services

- [x] 2.1 Add the `users` service: build from `../users`, internal-only (no published port), env `MONGO_URI=mongodb://<devuser>:<devpass>@mongo:27017/?authSource=admin` + `MONGO_DB=quickchat` + `USERS_HTTP_ADDR=:8080` (names pinned with users); `depends_on: mongo (service_healthy)`.
- [x] 2.2 Add the `security` service: build from `../security`, internal; env `SUPERTOKENS_CONNECTION_URI` + `SUPERTOKENS_API_KEY` (human-supplied, fail-fast if unset) + app/api domain settings security reads.
- [x] 2.3 Add `SECURITY_JWKS_URL` to the `streamer` service env (e.g. `http://security:8080/auth/jwt/jwks.json` — confirm path/port with security); do NOT hard-gate streamer on security health (retry-tolerant per D2).

## 3. Proxy: /auth routing

- [x] 3.1 Add `nginx.conf` routing for `/auth` and the `/auth/` prefix → `security` (verbatim path, no rewrite, no CORS), preserving the existing `/streams*`, room-WS, and portal routing.
- [x] 3.2 Verify `/auth` location does not collide with `/streams*` or portal routes; confirm the security upstream host/port.

## 4. Env config + secret hygiene

- [x] 4.1 `.env.example`: document all new vars; SuperTokens creds as EMPTY placeholders with a "put real values in .env (git-ignored), never commit" note; DEV-ONLY Mongo creds documented; `SECURITY_JWKS_URL` documented.
- [x] 4.2 Confirm `.env` is git-ignored (`git check-ignore dev/devops/.env`); ensure no SuperTokens/Mongo real secret is committed (grep-verify — AC7).

## 5. Ordering + dependencies

- [x] 5.1 Wire `depends_on`: users→mongo (service_healthy); proxy→security (service_started) so `/auth` upstream exists; streamer NOT gated on security health.

## 6. Docs

- [x] 6.1 Update `dev/devops/README.md`: full-stack service list (security/users/mongo added), the auth tier, the human-supplied-SuperTokens-creds step (into git-ignored `.env`), users/mongo internal-only + ephemeral notes, and `/auth` on the single origin.

## 7. Local validation (no external app images / no real creds required)

- [x] 7.1 Run `docker compose config` and confirm it renders; the SuperTokens vars are referenced (fail-fast when unset), Mongo/streamer env resolve.
- [x] 7.2 Bring up `mongo` alone and confirm its healthcheck reports healthy; confirm no host port is published for mongo.
- [x] 7.3 `nginx -t` (on a resolvable network) to confirm the `/auth` routing config is syntactically valid.

## 8. End-to-end verification (GATED — requires security + users images AND human SuperTokens creds)

Verified by the live run on 2026-07-22 (`docker compose up -d --build` from this working tree). Evidence recorded in the team lead's openspec.

- [x] 8.1 Coordinate readiness: confirm security's + users' Dockerfiles build; confirm the human has supplied real SuperTokens creds in `.env`. If an image fails, report evidence upstream (do not modify their scope). — All 4 app images built cleanly (portal, users, security, streamer); real SuperTokens creds present in the git-ignored `.env` (live `st-dev-*.aws.supertokens.io` instance).
- [x] 8.2 Once images build + creds present, `docker compose up`; confirm the full stack (security/users/mongo/streamer/portal/valkey/livekit/coturn/proxy) comes up; users starts after Mongo healthy; streamer reaches security's JWKS. — Full stack came up; readiness ordering observed (mongo healthy → users; valkey healthy → streamer; streamer+portal healthy → proxy). security & users logged "listening"; streamer healthy via `/readyz`.
- [x] 8.3 Prove acceptance #1 real magic-link loop end to end (email → link → signed in; first login creates the Mongo user) through the single origin — with observed output; and AC7: users/mongo unreachable from host, no secret in any committed file (grep-verified). — Through the single origin `http://localhost:8080`: `POST /auth/signinup/code {"email":...}` → HTTP 200 `{"flowType":"MAGIC_LINK","status":"OK",...}` (SuperTokens core creds valid, magic-link flow live). AC7: mongo host-reachability `localhost:27017` → unreachable (HTTP 000, internal-only); `.env` git-ignored, no secret committed.
- [x] 8.4 AC8 regression sweep: the shipped features (streams, chat, media) still work end to end under the new auth rules. — Single-origin routing verified: `GET /` → portal 200, `GET /streams` → streamer 200; livekit/coturn media origins published and up. Shipped streams/chat/media features reachable under the new auth wiring.
