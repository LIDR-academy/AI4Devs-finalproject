## 1. LiveKit dev config

- [x] 1.1 Author `dev/devops/livekit.yaml` (dev mode): `port: 7880`, `rtc.tcp_port: 7881`, `rtc.udp_port: 7882` (single UDP mux), `rtc.use_external_ip: false`, `rtc.node_ip: 127.0.0.1` (advertise host-reachable ICE candidate). Keys are provided by `--dev` (devkey/secret), so no `keys` block is needed.
- [x] 1.2 Add the `webhook` section to `livekit.yaml`: `api_key: devkey`, `urls: [ http://streamer:8080/livekit/webhook ]` (path confirmed with streamer), signed with the dev API key.

## 2. Compose: LiveKit service

- [x] 2.1 Add the `livekit` service to `docker-compose.yml`: official `livekit/livekit-server:v1.13.4` (pinned), single node, `command: --config /etc/livekit/livekit.yaml --dev --bind 0.0.0.0` with the read-only config mount, no Redis/TLS/TURN.
- [x] 2.2 Publish LiveKit ports: `7880:7880/tcp` (WS), `7881:7881/tcp` (TCP fallback), `7882:7882/udp` (UDP mux). Now LiveKit + the proxy are the only services publishing host ports.
- [x] 2.3 Wire dependency ordering: `streamer depends_on livekit: service_started` (LiveKit exposes no compose healthcheck; token minting is offline + DELETE tolerates LiveKit down, so service_started is correct); LiveKit depends on nothing in-stack.

## 3. Compose: streamer env vars

- [x] 3.1 Add to the `streamer` service env: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (dev pair, DEV-ONLY), `LIVEKIT_URL=http://livekit:7880` (internal HTTP/Twirp server API — confirmed with streamer), `LIVEKIT_PUBLIC_URL=ws://localhost:7880` (browser), all via `${VAR:-default}`.
- [x] 3.2 Ensure the dev key/secret match: `--dev` uses `devkey`/`secret`, the same pair supplied to streamer via env, so streamer's tokens validate against the server.

## 4. Env docs

- [x] 4.1 Document the four `LIVEKIT_*` vars + the published ports in `.env.example`, dev key/secret marked DEV-ONLY.
- [x] 4.2 Update `dev/devops/README.md`: the second-origin exception (media not behind nginx; browser uses LIVEKIT_PUBLIC_URL), the published LiveKit ports, the single-UDP-mux strategy, the node_ip=127.0.0.1 localhost recipe, and the host-networking-is-Linux-only caveat.

## 5. Local validation (no external app images required)

- [x] 5.1 Run `docker compose config` and confirm it renders with no errors and the four LIVEKIT_* vars resolve on the `streamer` service. — resolves LIVEKIT_API_KEY=devkey, LIVEKIT_API_SECRET=secret, LIVEKIT_URL=http://livekit:7880, LIVEKIT_PUBLIC_URL=ws://localhost:7880; livekit service ports 7880/7881/7882.
- [x] 5.2 Bring up `livekit` alone and confirm the server starts and the WS signaling port (7880) answers; config parsed. — LiveKit v1.13.4 started in development mode (devkey/secret), single-node, portHttp 7880, rtc.portTCP 7881, rtc.portUDP 7882, nodeIP 127.0.0.1, bind 0.0.0.0; `GET http://localhost:7880/` → 200, `/rtc/validate` alive.

## 6. End-to-end verification (GATED — requires streamer token/webhook image + qc-portal livekit-client image)

- [x] 6.1 Coordinate readiness: confirm streamer's env-var names + webhook path, and that streamer + qc-portal images build; report build failures upstream, do not modify their scope. — streamer + qc-portal seams locked; both images build (quickchat-streamer, quickchat-portal).
- [x] 6.2 Once images build, `docker compose up`; confirm Valkey + streamer + LiveKit + portal + proxy all come up; streamer reaches LiveKit and LiveKit can POST webhooks to streamer. — all five up (valkey/streamer/portal healthy, livekit publishing 7880/7881/7882, proxy on 8080); LiveKit sent room_started/participant_joined/track_published webhooks to http://streamer:8080/livekit/webhook (delivered, no retries).
- [x] 6.3 Prove acceptance #1 end to end: media-token endpoint through the proxy returns publish token (creator key) / subscribe-only token (no key) / 404 (nonexistent), url=ws://localhost:7880; and a real media round-trip — a demo CAMERA track published by one client is subscribed by another through the dev-mode LiveKit on localhost (host clients over the published ports, node_ip 127.0.0.1). Verified with `livekit-cli`; observed "track subscribed {kind: video, trackID, participant: publisher}".
- [x] 6.4 Confirm the app plane is unchanged (single origin through the proxy still works) and that ending a stream disconnects LiveKit participants (D6). — GET / and /streams still 200 through the proxy; DELETE /streams/{id} (creator key) → 204 then the LiveKit room is gone (streamer DeleteRoom via LIVEKIT_URL http://livekit:7880) and the connected publisher was disconnected.
