## 1. Chat env vars

- [x] 1.1 Add to the `streamer` service `environment:` in `docker-compose.yml`: `CHAT_MAX_MESSAGES: ${CHAT_MAX_MESSAGES:-1000000}`, `CHAT_PAGE_SIZE: ${CHAT_PAGE_SIZE:-200}`, `CHAT_MAX_LENGTH: ${CHAT_MAX_LENGTH:-500}` (verbatim names streamer reads — confirm with streamer).
- [x] 1.2 Document the three new non-secret knobs in `.env.example` with their defaults.

## 2. nginx WebSocket upgrade

- [x] 2.1 Add the canonical upgrade map at http scope in `nginx.conf`: `map $http_upgrade $connection_upgrade { default upgrade; '' close; }`.
- [x] 2.2 Add a dedicated location for the WS path (streamer-owned, expected `/streams/{id}/ws`), e.g. `location ~ ^/streams/[^/]+/ws$`, proxying to the existing `streamer` upstream with `proxy_http_version 1.1`, `Upgrade`/`Connection` headers, and the existing `Host`/`X-Forwarded-*` headers.
- [x] 2.3 Set an idle-tolerant `proxy_read_timeout` (and `proxy_send_timeout`) on the WS location only (3600s); confirm streamer's idle-timeout/keepalive expectation.
- [x] 2.4 Confirm the dedicated WS location takes precedence over `location /streams/` and that the HTTP `/streams`, `/streams/{id}` (DELETE), and `/streams/{id}/messages` (history) paths are unchanged (still no upgrade). — regex location matched before prefix by nginx; `nginx -t` clean.

## 3. Documentation

- [x] 3.1 Update `dev/devops/README.md`: note the room WebSocket traverses the single origin (`/streams/{id}/ws`) and add the three chat env vars to the env-var table.

## 4. Local validation (no external images required)

- [x] 4.1 Run `docker compose config` and confirm it renders with no errors and the three chat vars resolve on the `streamer` service. — CHAT_MAX_MESSAGES/PAGE_SIZE/MAX_LENGTH resolve to 1000000/200/500.
- [x] 4.2 Bring up valkey to confirm the runtime still comes up healthy after the compose/nginx changes; verify nginx config parses. — valkey healthy post-change; `nginx -t` → "syntax is ok / test is successful" (on a network where upstreams resolve).

## 5. End-to-end verification (GATED — requires streamer WS server + qc-portal chat client images)

- [x] 5.1 Coordinate readiness: confirm streamer's WS endpoint path and that streamer + qc-portal images build; if either fails, report evidence upstream and do not modify their scope. — streamer confirmed /streams/{id}/ws + env names; both images build (quickchat-streamer, quickchat-portal).
- [x] 5.2 Once images build, `docker compose up`; confirm all services healthy and the three chat env vars are in effect in the streamer container. — valkey/streamer/portal all healthy, proxy up; streamer accepted CHAT_* env (fail-fast on bad ints did not trip).
- [x] 5.3 Prove acceptance #10 end to end: open two WebSocket clients to the same room through the single origin (proxy) and confirm a message sent by one is received live by the other; capture command output as evidence. — two clients via ws://localhost:8080/streams/{id}/ws: creator (creatorKey→role streamer) message received live by viewer (word+alphanumeric→role viewer). PASS.
- [x] 5.4 Confirm HTTP endpoints still work through the proxy post-change (GET /streams, GET /streams/{id}/messages, DELETE /streams/{id}) and that an idle WS is not dropped within the configured timeout. — POST 201 (creatorKey not leaked in GET /streams), history 200, DELETE 204 → history 404, portal home 200; idle WS survived 65s (>nginx 60s default) and still round-tripped.
