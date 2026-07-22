<!-- Orchestration tasks owned by the team lead. Implementation detail lives in each teammate's own change. -->

## 1. Record and delegate

- [x] 1.1 Record the new endpoint, the MODIFIED DELETE, and decisions D1–D9 in this root change (proposal + design + specs)
- [x] 1.2 Delegate three deliverables; each teammate runs its own `/opsx:propose` against §6 + the decisions
- [x] 1.3 Confirm `security` and `users` are not engaged and their scopes stay untouched

## 2. Teammate proposals accepted

- [x] 2.1 streamer proposal: media-token endpoint (Bearer key → grant), LiveKit token signing (secret in env), DELETE deletes LiveKit room + escape hatch, LiveKit webhook + grace reaper
- [x] 2.2 qc-portal proposal: pre-join/go-live, mute/camera-off, viewer subscribe + muted autoplay + tap-to-unmute, offline state, media independent from chat (livekit-client)
- [x] 2.3 devops proposal: LiveKit dev-mode compose service + published ports (WS/TCP/UDP), streamer's four env vars, README caveats

## 3. Cross-scope coordination settled

- [x] 3.1 media-token contract confirmed portal ↔ streamer (Bearer transport, opaque token/url, role semantics)
- [x] 3.2 LiveKit env var names + the two URLs locked (streamer reads `LIVEKIT_URL`/`LIVEKIT_PUBLIC_URL`/`LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`; devops supplies)
- [x] 3.3 LiveKit webhook wiring agreed (devops points LiveKit webhooks at streamer; streamer's endpoint + grace) 
- [x] 3.4 UDP media port strategy + `LIVEKIT_PUBLIC_URL` browser reachability agreed (devops), and the second-origin exception documented

## 4. Implementation race (each teammate applies its own change, with evidence)

- [x] 4.1 streamer done + verified: gofmt/vet/golangci-lint clean, `go test -race ./...` pass, tidy; direct token-grant tests (CanPublish true/false room-scoped); fail-closed escape hatch; signature-verified webhook (401 spoofed); reaper grace (blip no-reap, deterministic timers, Shutdown stops all); DELETE deletes LiveKit room (LiveKit-down→204+logged); AC10 secret-hygiene grep-verified (independent); server-sdk-go/v2 justified; distroless build + container E2E. Scope-clean, strict-valid
- [x] 4.2 qc-portal done + verified: `tsc` strict + `bun test` 132 (behind fake MediaEngine, no real WebRTC) + Biome clean; livekit-client isolated to media-engine (verified — type-only/dynamic elsewhere, tests never load WebRTC); pre-join/go-live, mute/camera-off, viewer muted+unmute, offline↔video, media/chat independence (proven live); `Authorization: Bearer` only when key held; style spot-check clean; AC12 statement; scope-clean, strict-valid
- [x] 4.3 devops done with evidence: LiveKit dev-mode service + ports; `docker compose up` end-to-end media works on localhost (fake-media E2E); env vars supplied; secret not committed

## 5. Acceptance criteria verified (PRD §8)

- [x] 5.1 `docker compose up` brings up Valkey + streamer + LiveKit; whole flow works E2E on localhost (AC1)
- [x] 5.2 AC2 verified by human live test on supported browsers (Chrome/Brave/Safari): creator go-live → viewer sees/hears over the dev TURN. Firefox is a documented limitation.
- [x] 5.3 Viewer without key gets subscribe-only; publish attempt rejected by LiveKit — verified in test (AC3)
- [x] 5.4 Invalid key → silent viewer token; `404` for nonexistent room; no LiveKit room for a nonexistent stream (AC4)
- [x] 5.5 AC5 verified live on supported browsers: tap-to-unmute + creator mute/camera-off observed from the viewer side
- [x] 5.6 Creator reload → returns as viewer; room continues, no one can publish — asserted at the token level (AC6)
- [x] 5.7 End stream disconnects all participants, deletes the LiveKit room, preserves v0/chat delete semantics (AC7)
- [x] 5.8 Chat and media independent: killing one leaves the other working (AC8)
- [x] 5.9 Viewer offline→video verified in a REAL browser (1280x720 render); leave→offline unit-tested (AC9)
- [x] 5.10 LiveKit secret absent from portal code, responses, and logs (grep-verified in streamer evidence) (AC10)
- [x] 5.11 Full suites pass; token-grant logic has direct unit tests (AC11)
- [x] 5.12 qc-portal report states style-law compliance (AC12)
- [x] 5.13 Zombie resolution verified: publisher leaves past grace → streamer reaps room → viewers redirect Home (decision D4/D5)

## 5a. Dev TURN (human-approved scope expansion — D10)

- [x] 5a.1 devops: coturn dev-TURN added; root cause chain fixed (mDNS filtering → ICE-Lite; force_tcp dead-end reverted; the real fix = remove LiveKit node_ip=127.0.0.1 so coturn can reach LiveKit's Docker IP). Dev-only, documented (D10)
- [x] 5a.2 qc-portal: viewer render E2E re-run over TURN — real-browser 1280x720 render, zero regression
- [x] 5a.3 Human live-tested: media works on Chrome/Brave/Safari via dev TURN; Firefox is the lone failure — accepted as a documented v0 limitation (D10a)
- [x] 5a.4 AC1/5.2/5.5/5.9 verified for supported browsers
- [x] 5a.5 devops: env README documents the supported-browser matrix (Chrome/Brave/Safari) + Firefox media known-limitation (chat/streams unaffected)

## 6. Close

- [x] 6.1 All three teammate changes report done with evidence; every §8 criterion (+ D4/D5 reaper) verified
- [x] 6.2 Consolidate evidence and present the final summary to the human
- [ ] 6.3 Human gives the final word on shipped; archive this change and the teammate changes on approval
