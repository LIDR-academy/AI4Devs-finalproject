<!-- Orchestration tasks owned by the team lead. Implementation detail lives in each teammate's own change. -->

## 1. Record and delegate

- [x] 1.1 Record the §6 contract, the v0 contract-change delta, and decisions D1–D8 in this root change (proposal + design + specs)
- [x] 1.2 Delegate three deliverables; each teammate runs its own `/opsx:propose` against §6 + the decisions
- [x] 1.3 Confirm `security` and `users` are not engaged and their scopes stay untouched

## 2. Teammate proposals accepted

- [x] 2.1 streamer proposal
- [x] 2.2 qc-portal proposal
- [x] 2.3 devops proposal

## 3. Cross-scope coordination settled

- [x] 3.1 WS frame contract confirmed identical (path `/streams/{id}/ws`); terminal error reasons `{"room ended","room not found","expected join"}` + error-then-close invariant recorded; qc-portal exact-matches
- [x] 3.2 History↔live reconciliation (D2) implemented consistently on both sides (buffer→history→flush, dedup by streamer's stream-entry id)
- [x] 3.3 Chat env var names + defaults locked (streamer reads / devops supplies)
- [x] 3.4 nginx WS-upgrade config agreed against streamer's WS path + 3600s timeout

## 4. Implementation race (each teammate applied its own change, with evidence)

- [x] 4.1 streamer done + verified: `-race` (WS/hub, leak tests on drop AND room-close, cap drop-oldest); contract change MODIFIED-preserving-v0; creatorKey constant-time + never listed/logged; coder/websocket justified; distroless build + container E2E; scope-clean, strict-valid
- [x] 4.2 qc-portal done + verified: `tsc` strict + `bun test` 103 + Biome clean; username flow + Home username; room layout both breakpoints + toggle; STREAMER label from server role; injected-backoff reconnect; exact-match terminal detection; style-law statement (AC12); scope-clean, strict-valid
- [x] 4.3 devops done + verified: env vars + nginx WS-upgrade; `docker compose up` + live two-client WS round-trip through single origin; idle-WS-not-dropped (65s); HTTP contract change through proxy; clean teardown; scope-clean, strict-valid

## 5. Acceptance criteria verified (PRD §8)

- [x] 5.1 Username required; room header + `GET /streams` (AC1)
- [x] 5.2 Creator = username + STREAMER label; others word+alphanumeric, no label (AC2)
- [x] 5.3 Creator reload → anonymous viewer (AC3) — creatorKey memory-only
- [x] 5.4 Two browsers see messages live (AC4) — devops live WS E2E
- [x] 5.5 History latest page + scroll-up until exhausted, order correct (AC5)
- [x] 5.6 Cap drop-oldest with lowered `CHAT_MAX_MESSAGES` (AC6) — streamer integration test
- [x] 5.7 Empty and >500-char blocked client + server (AC7)
- [x] 5.8 Ending a stream deletes its messages, no leak (AC8) — 404 after delete
- [x] 5.9 Layout 2/3+1/3 wide, 1/2+1/2 narrow, toggle, End stream (AC9)
- [x] 5.10 Knobs env-configurable; `docker compose up` E2E incl. live WS (AC10)
- [x] 5.11 Full suites pass; WS code race-tested (AC11)
- [x] 5.12 qc-portal report states style-law compliance (AC12)
- [x] 5.13 Home stream list items are clickable/keyboard-accessible and navigate to `/stream/{id}` (AC13)
- [x] 5.14 Creator-only end: `DELETE` with valid key → 204; missing/invalid key on existing stream → 403; not found → 404; End control shown only to the key-holder (AC14)
- [x] 5.15 On stream-ended, other participants see a calm notice then redirect to Home; a transient drop still reconnects (AC15)

## 6a. Folded behavior fixes (post-test-drive)

- [x] 6a.1 Coordination: creatorKey transport on DELETE (`Authorization: Bearer`, 403 not 401) confirmed streamer ↔ qc-portal
- [x] 6a.2 streamer done + verified: `DELETE` verifies creatorKey (constant-time, ownership check before any storage touch) → 204/403/404; `-race` tests (keyless/wrong-key delete nothing, correct→cascade); container E2E; prior behavior preserved; scope-clean, strict-valid
- [x] 6a.3 qc-portal done + verified: semantic clickable Home list (focus ring); End control gated to key-holder + `Authorization: Bearer` + 204/404→redirect, 403→calm stay; ended notice → redirect (transient drop no redirect); 113 tests, tsc/Biome clean, style spot-check clean, AC12 re-stated; scope-clean, strict-valid
- [x] 6a.4 devops: re-run full compose E2E confirming creator-only-end works through the proxy and nothing regressed (no scope change expected)

## 6. Close

- [x] 6.1 All three teammate changes report done with evidence; every §8 criterion (incl. AC13–15) verified
- [x] 6.2 Consolidate evidence and present the final summary to the human
- [ ] 6.3 Human gives the final word on shipped; archive this change and the teammate changes on approval
