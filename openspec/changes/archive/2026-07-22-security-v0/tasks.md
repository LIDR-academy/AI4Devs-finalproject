<!-- Orchestration tasks owned by the team lead. Implementation detail lives in each teammate's own change. -->

## 1. Record and delegate

- [x] 1.1 Record the auth contract, creatorKey retirement (breaking), reaper/sign-out cleanup, and decisions D1–D7 in this root change
- [x] 1.2 Delegate five deliverables; each teammate runs its own `/opsx:propose`
- [x] 1.3 Finalize the security↔users internal contract between those two; JWT claim set (`userId`,`username`) is law for streamer from day one

## 2. Teammate proposals accepted

- [x] 2.1 security: SuperTokens Passwordless + JWKS + claim stamping + users get-or-create
- [x] 2.2 users: Mongo persistence + internal get-or-create + username gen
- [x] 2.3 streamer: local JWKS/JWT verify; auth on POST/DELETE/WS; media-token by ownership; 409; escape-hatch removed; reaper kept
- [x] 2.4 qc-portal: supertokens-web-js, sign-in flow, gated actions, sign-out-ends-stream, username field removed
- [x] 2.5 devops: MongoDB (internal) + SuperTokens/Mongo/JWKS env wiring (untracked secrets)

## 3. Cross-scope coordination settled

- [x] 3.1 security↔users internal get-or-create contract confirmed (shape, network-trust)
- [x] 3.2 JWT claim set (`userId`,`username`) + JWKS URL confirmed security↔streamer
- [x] 3.3 Auth transport confirmed portal↔streamer (Bearer HTTP + token in WS join)
- [x] 3.4 Env wiring + startup ordering confirmed (streamer depends on security JWKS; users on Mongo; SuperTokens creds supplied)

## 4. Implementation race (each teammate applies its own change, with evidence)

- [x] 4.1 security done: `go test -race`/vet/lint; magic-link + JWKS + claims + get-or-create; API key never logged/returned (grep)
- [x] 4.2 users done: `go test -race`/vet/lint; get-or-create idempotent, unique username; Mongo behind interface + fake; internal-only
- [x] 4.3 streamer done: local JWT verify (stubbed JWKS test, tampered/expired rejected); auth on POST(401)/DELETE(401/403)/WS(auth_required); 409; media-token by ownership; escape-hatch removed; reaper kept; `-race`
- [x] 4.4 qc-portal done: `bun test`/`tsc`/Biome; sign-in flow + gating + sign-out-ends-stream + no username field; reload keeps identity; explicit style-law statement
- [ ] 4.5 devops done: MongoDB service + env wiring (standalone verified: config renders, secret-clean, routing/ordering correct); `docker compose up` healthy gated on E2E (creds + fresh images)

## 5. Acceptance criteria verified (PRD §8)

- [ ] 5.1 Full magic-link loop; first login creates Mongo user (`created` true once, false after); sign-out → anonymous (AC1)
- [ ] 5.2 Anonymous: list/watch/read; `401` on create, `auth_required` on chat; calm gates not hidden (AC2)
- [ ] 5.3 Signed-in create (no username field), lists under account username, `409` on second (AC3)
- [ ] 5.4 Owner publishes/chats-with-STREAMER/ends; **reload keeps all of it** (AC4)
- [ ] 5.5 Non-owner: chats as username (no label), subscribe-only token, `403` on delete (AC5)
- [ ] 5.6 streamer verifies JWTs locally (stubbed JWKS); tampered/expired rejected (AC6)
- [ ] 5.7 users unreachable from outside compose; identity only via claims; no secrets in responses/logs/committed files (grep) (AC7)
- [ ] 5.8 Regression sweep: all three shipped features still pass under auth (AC8)
- [ ] 5.9 Full suites pass with evidence across security/users/streamer/qc-portal (AC9)
- [ ] 5.10 qc-portal states style-law compliance (AC10)

## 6. Close

- [ ] 6.1 All five teammate changes report done with evidence; every §8 criterion verified
- [ ] 6.2 Consolidate evidence and present the final summary to the human
- [ ] 6.3 Human gives the final word on shipped; archive this change and the teammate changes on approval
